import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle,
  Send,
  Target,
  Shield,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { examService, type ExamSession, type Question } from '@/services/examService';
import toast from 'react-hot-toast';

export default function ExamTakingPageNew() {
  const { examType, examId } = useParams<{ examType: string; examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State hooks - all defined before any conditional returns
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load or create session
  const loadSession = useCallback(async () => {
    if (!examId || !examType) {
      setError('Parâmetros de exame inválidos');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let examSession: ExamSession;
      
      // Check if we have a session ID from navigation state
      const stateSessionId = location.state?.sessionId;
      
      if (stateSessionId) {
        // Load existing session
        examSession = await examService.getExamSession(stateSessionId);
      } else {
        // Try to resume or start new session
        examSession = await examService.resumeOrStartSession(
          examId, 
          examType as 'mock' | 'previous'
        );
      }
      
      setSession(examSession);
      
      // Calculate remaining time
      const startTime = new Date(examSession.startedAt).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalSeconds = examSession.duration * 60;
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      setTimeRemaining(remaining);
      
      // Start time tracking
      examService.startTimeTracking(examSession.id);
      
      toast.success('OPERAÇÃO TÁTICA INICIADA!', {
        style: {
          background: '#14242f',
          color: '#facc15',
          border: '2px solid #facc15'
        }
      });
    } catch (err: any) {
      console.error('Erro ao carregar sessão:', err);
      setError(err.message || 'Erro ao carregar exame. Tente novamente.');
      toast.error('Erro ao iniciar operação', {
        style: {
          background: '#330000',
          color: '#ff6666',
          border: '2px solid #ff6666'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [examId, examType, location.state]);

  // Save answer with debouncing
  const saveAnswer = useCallback(async (questionId: string, alternativeId: string) => {
    if (!session) return;
    
    // Update local state immediately for better UX
    const updatedSession = {
      ...session,
      answers: {
        ...session.answers,
        [questionId]: alternativeId
      }
    };
    setSession(updatedSession);
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(async () => {
      try {
        await examService.saveAnswer(session.id, questionId, alternativeId);
        console.log('Resposta salva automaticamente');
      } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        // Don't show error to user for auto-save failures
      }
    }, 1000); // Save after 1 second of inactivity
    
    setAutoSaveTimeout(timeout);
  }, [session, autoSaveTimeout]);

  // Toggle flag
  const toggleFlag = useCallback(async (questionId: string) => {
    if (!session) return;
    
    const isFlagged = session.flaggedQuestions.includes(questionId);
    
    // Update local state
    const updatedSession = {
      ...session,
      flaggedQuestions: isFlagged
        ? session.flaggedQuestions.filter(id => id !== questionId)
        : [...session.flaggedQuestions, questionId]
    };
    setSession(updatedSession);
    
    // Save to backend
    try {
      await examService.toggleFlag(session.id, questionId, !isFlagged);
    } catch (error) {
      console.error('Erro ao marcar questão:', error);
    }
  }, [session]);

  // Submit exam
  const handleSubmitExam = useCallback(async (autoSubmit = false) => {
    if (!session || submitting) return;

    try {
      setSubmitting(true);
      
      const now = new Date().getTime();
      const startTime = new Date(session.startedAt).getTime();
      const timeSpent = Math.floor((now - startTime) / 1000);
      
      const result = await examService.submitExam(session.id, timeSpent);
      
      // Stop time tracking
      examService.stopTimeTracking();
      
      // Navigate to results
      navigate(`/simulations/${examId}/results/${result.sessionId}`);
      
      toast.success('OPERAÇÃO CONCLUÍDA!', {
        style: {
          background: '#14242f',
          color: '#facc15',
          border: '2px solid #facc15'
        }
      });
    } catch (err: any) {
      console.error('Erro ao submeter exame:', err);
      setError(err.message || 'Erro ao submeter exame. Tente novamente.');
      toast.error('Erro ao finalizar operação', {
        style: {
          background: '#330000',
          color: '#ff6666',
          border: '2px solid #ff6666'
        }
      });
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  }, [session, submitting, examId, navigate]);

  // Load session on mount
  useEffect(() => {
    loadSession();
    
    // Cleanup on unmount
    return () => {
      examService.stopTimeTracking();
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [loadSession]);

  // Timer effect
  useEffect(() => {
    if (!loading && session && timeRemaining > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, session, timeRemaining, isPaused, handleSubmitExam]);

  // Update time spent periodically
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(async () => {
      if (!isPaused) {
        const now = new Date().getTime();
        const startTime = new Date(session.startedAt).getTime();
        const timeSpent = Math.floor((now - startTime) / 1000);
        
        try {
          await examService.updateTimeSpent(session.id, timeSpent);
        } catch (error) {
          console.error('Erro ao atualizar tempo:', error);
        }
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [session, isPaused]);

  // Helper functions
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const totalTime = session ? session.duration * 60 : 3600;
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = session?.answers[question.id];
    const isFlagged = session?.flaggedQuestions.includes(question.id) || false;
    
    return (
      <div key={question.id} className="space-y-6">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="font-police-numbers">
                QUESTÃO {index + 1}/{session?.totalQuestions || 0}
              </Badge>
              <Badge variant="outline" className="font-police-body text-xs">
                {question.subject}
              </Badge>
              <Badge 
                variant="outline" 
                className={`font-police-body text-xs ${
                  question.difficulty === 'RECRUTA' ? 'text-green-600 border-green-600' :
                  question.difficulty === 'CABO' ? 'text-amber-600 border-amber-600' :
                  'text-red-600 border-red-600'
                }`}
              >
                {question.difficulty}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 leading-relaxed">
              {question.statement}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFlag(question.id)}
            className={`ml-4 ${isFlagged ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
          >
            <Flag className="w-5 h-5" fill={isFlagged ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.alternatives.map((alternative) => (
            <motion.div
              key={alternative.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => saveAnswer(question.id, alternative.id)}
              className={cn(
                "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                userAnswer === alternative.id
                  ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-700"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  userAnswer === alternative.id
                    ? "border-accent-500 bg-accent-500"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {userAnswer === alternative.id && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                  {alternative.letter}) {alternative.text}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Conditional renders - after all hooks
  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              CARREGANDO OPERAÇÃO TÁTICA...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-red-200 dark:border-red-800 p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
              {error || 'Operação não encontrada'}
            </p>
            <Button
              onClick={() => navigate('/previous-exams')}
              variant="outline"
              className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              VOLTAR ÀS OPERAÇÕES
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const answeredCount = Object.keys(session.answers).length;
  const progress = (answeredCount / session.totalQuestions) * 100;
  
  // Check if current question is answered
  const isCurrentQuestionAnswered = currentQuestion ? (
    session.answers[currentQuestion.id] !== undefined && 
    session.answers[currentQuestion.id] !== null && 
    session.answers[currentQuestion.id] !== ''
  ) : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja sair? Seu progresso será salvo.')) {
                  navigate('/previous-exams');
                }
              }}
              className="text-white hover:text-accent-500 hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-police-body uppercase tracking-wider">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-accent-500" />
              <h1 className="text-lg font-bold font-police-title uppercase tracking-wider">
                {session.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${getTimeColor()}`} />
              <span className={`font-police-numbers font-bold text-lg ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-500" />
              <span className="font-police-numbers font-bold text-accent-500">
                {answeredCount}/{session.totalQuestions}
              </span>
            </div>
            
            {/* Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="text-white hover:text-accent-500"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-accent-500 to-yellow-400 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <Card className="bg-white dark:bg-gray-900 p-8 text-center">
              <Pause className="w-16 h-16 text-accent-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 font-police-title uppercase">OPERAÇÃO PAUSADA</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">O cronômetro está parado</p>
              <Button
                onClick={() => setIsPaused(false)}
                className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
              >
                <Play className="w-4 h-4 mr-2" />
                CONTINUAR
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-8">
              {currentQuestion && renderQuestion(currentQuestion, currentQuestionIndex)}
              
              {/* Answer Required Alert */}
              {!isCurrentQuestionAnswered && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-police-body uppercase tracking-wider">
                        RESPOSTA OBRIGATÓRIA: Selecione uma opção para continuar
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="font-police-body uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  ANTERIOR
                </Button>
                
                <div className="flex gap-3">
                  {isLastQuestion ? (
                    <Button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-police-body uppercase tracking-wider gap-2"
                    >
                      <Send className="w-4 h-4" />
                      FINALIZAR OPERAÇÃO
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (isCurrentQuestionAnswered) {
                          setCurrentQuestionIndex(Math.min(session.questions.length - 1, currentQuestionIndex + 1));
                        }
                      }}
                      disabled={!isCurrentQuestionAnswered}
                      className={`font-police-body uppercase tracking-wider transition-all duration-200 ${
                        isCurrentQuestionAnswered
                          ? 'bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white cursor-pointer'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                      title={!isCurrentQuestionAnswered ? 'Responda a questão antes de continuar' : ''}
                    >
                      PRÓXIMA
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="bg-white dark:bg-gray-900 p-6 max-w-md w-full">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2 font-police-title uppercase">
                    CONFIRMAR FINALIZAÇÃO
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Você respondeu {answeredCount} de {session.totalQuestions} questões.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tem certeza que deseja finalizar a operação?
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmSubmit(false)}
                      disabled={submitting}
                      className="font-police-body uppercase tracking-wider"
                    >
                      CANCELAR
                    </Button>
                    <Button
                      onClick={() => handleSubmitExam()}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-police-body uppercase tracking-wider gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {submitting ? 'FINALIZANDO...' : 'CONFIRMAR'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}