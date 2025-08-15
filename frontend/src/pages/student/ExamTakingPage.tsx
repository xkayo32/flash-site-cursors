import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Circle,
  RotateCcw,
  Send,
  Pause,
  Play,
  X,
  Menu,
  Eye,
  EyeOff,
  Maximize,
  Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { examService, ExamSession as ApiExamSession } from '@/services/examService';

// Tipos
interface Question {
  id: string;
  number: number;
  subject: string;
  statement: string;
  alternatives: {
    id: string;
    letter: string;
    text: string;
  }[];
  explanation?: string;
  difficulty: 'RECRUTA' | 'CABO' | 'SARGENTO';
  year?: number;
  institution?: string;
}

interface ExamSession extends Omit<ApiExamSession, 'flaggedQuestions'> {
  flaggedQuestions: Set<string>; // Convert array to Set for local state
  timeRemaining: number; // em segundos
  isPaused: boolean;
  isFullscreen: boolean;
}

// Helper function to convert API flagged array to Set
const convertFlaggedToSet = (flagged: string[]): Set<string> => new Set(flagged);

export default function ExamTakingPage() {
  const { examId, examType } = useParams();
  const navigate = useNavigate();
  
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(Date.now());

  // Initialize exam session
  useEffect(() => {
    const initializeExam = async () => {
      console.log('🚀 [EXAM DEBUG] Iniciando exame. examId:', examId, 'examType:', examType);
      
      if (!examId || !examType) {
        console.error('❌ [EXAM DEBUG] ID ou tipo não encontrado');
        setError('ID do exame ou tipo não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 [EXAM DEBUG] Chamando examService.resumeOrStartSession...');
        const session = await examService.resumeOrStartSession(examId, examType as 'mock' | 'previous');
        console.log('✅ [EXAM DEBUG] Sessão criada/recuperada:', session);
        
        // Convert API session to local session format
        const localSession: ExamSession = {
          ...session,
          flaggedQuestions: new Set(session.flaggedQuestions),
          timeRemaining: session.duration * 60 - session.timeSpent, // Calculate remaining time
          isPaused: false,
          isFullscreen: false
        };

        setExamSession(localSession);
        console.log('✅ [EXAM DEBUG] Estado local atualizado com sessão');
        
        // Start time tracking
        examService.startTimeTracking(session.id);
        console.log('✅ [EXAM DEBUG] Tracking de tempo iniciado');
        
      } catch (err: any) {
        console.error('❌ [EXAM DEBUG] Erro ao inicializar exame:', err);
        setError(err.message || 'Erro ao carregar o exame');
      } finally {
        console.log('🏁 [EXAM DEBUG] setLoading(false) - finalizando carregamento');
        setLoading(false);
      }
    };

    initializeExam();

    // Cleanup time tracking on unmount
    return () => {
      examService.stopTimeTracking();
    };
  }, [examId, examType]);

  // Submit exam function - must be defined before conditional returns
  const handleSubmitExam = useCallback(async (autoSubmit = false) => {
    if (!examSession) return;
    
    const answeredQuestions = Object.keys(examSession.answers).length;
    const totalQuestions = examSession.questions.length;
    
    if (!autoSubmit && answeredQuestions < totalQuestions) {
      setShowWarningDialog(true);
      return;
    }

    try {
      const timeSpent = examSession.duration * 60 - examSession.timeRemaining;
      
      // Stop time tracking
      examService.stopTimeTracking();
      
      // Submit exam to API
      const result = await examService.submitExam(examSession.id, timeSpent);
      
      // Navigate to results page with sessionId
      navigate(`/simulations/${examId}/results/${result.sessionId}`);
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      setError(error.message || 'Erro ao submeter o exame');
    }
  }, [examSession, navigate, examId, setShowWarningDialog, setError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
            CARREGANDO OPERAÇÃO TÁTICA...
          </p>
        </div>
      </div>
    );
  }

  if (error || !examSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-ultra-wide">
            ERRO NA OPERAÇÃO
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body">
            {error || 'Não foi possível carregar o exame'}
          </p>
          <Button
            onClick={() => navigate('/simulations')}
            className="bg-accent-500 hover:bg-accent-600 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider"
          >
            RETORNAR ÀS OPERAÇÕES
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = examSession.questions[currentQuestionIndex];
  const totalQuestions = examSession.questions.length;
  const answeredQuestions = Object.keys(examSession.answers).length;
  const flaggedCount = examSession.flaggedQuestions.size;
  
  // Check if current question is answered
  const currentQuestionId = currentQuestion?.id;
  const isCurrentQuestionAnswered = currentQuestionId ? (
    examSession.answers[currentQuestionId] !== undefined && 
    examSession.answers[currentQuestionId] !== null && 
    examSession.answers[currentQuestionId] !== ''
  ) : false;

  // handleSubmitExam já foi definido antes dos returns condicionais

  // Debug render state
  useEffect(() => {
    console.log('📊 [EXAM DEBUG] Estado de renderização:', {
      loading,
      error,
      hasSession: !!examSession,
      questionsCount: examSession?.questions?.length || 0,
      currentIndex: currentQuestionIndex
    });
  }, [loading, error, examSession, currentQuestionIndex]);

  // Timer effect
  useEffect(() => {
    if (examSession.isPaused || examSession.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setExamSession(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          // Auto-submit when time expires
          handleSubmitExam(true);
          return prev;
        }
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examSession.isPaused, examSession.timeRemaining, handleSubmitExam]);

  // Track time spent on each question
  useEffect(() => {
    if (!examSession) return;
    
    // Save time for previous question when changing
    const previousQuestionId = examSession.questions[currentQuestionIndex - 1]?.id;
    if (previousQuestionId && currentQuestionStartTime) {
      const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [previousQuestionId]: (prev[previousQuestionId] || 0) + timeSpent
      }));
    }
    
    // Reset timer for current question
    setCurrentQuestionStartTime(Date.now());
  }, [currentQuestionIndex, examSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const alternativeIndex = parseInt(e.key) - 1;
        if (currentQuestion.alternatives[alternativeIndex]) {
          handleAnswerSelect(currentQuestion.alternatives[alternativeIndex].id);
        }
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        handleToggleFlag();
      } else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        setShowCalculator(!showCalculator);
      } else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        setShowReviewMode(!showReviewMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, totalQuestions, currentQuestion, showCalculator, showReviewMode]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Warning before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (alternativeId: string) => {
    if (!examSession) return;

    // Update local state immediately for better UX
    setExamSession(prev => prev ? ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: alternativeId
      }
    }) : prev);

    // Save to API with debouncing
    try {
      examService.debouncedSaveAnswer(examSession.id, currentQuestion.id, alternativeId);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleToggleFlag = async () => {
    if (!examSession) return;

    const wasFlagged = examSession.flaggedQuestions.has(currentQuestion.id);
    const newFlagged = new Set(examSession.flaggedQuestions);
    
    if (wasFlagged) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }

    // Update local state immediately
    setExamSession(prev => prev ? ({ ...prev, flaggedQuestions: newFlagged }) : prev);

    // Save to API
    try {
      await examService.toggleFlag(examSession.id, currentQuestion.id, !wasFlagged);
    } catch (error) {
      console.error('Error toggling flag:', error);
      // Revert local state on error
      setExamSession(prev => prev ? ({ ...prev, flaggedQuestions: examSession.flaggedQuestions }) : prev);
    }
  };

  const handlePauseToggle = () => {
    setExamSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const getQuestionStatus = (questionId: string, index: number) => {
    const isAnswered = examSession.answers[questionId];
    const isFlagged = examSession.flaggedQuestions.has(questionId);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isAnswered && isFlagged) return 'answered-flagged';
    if (isAnswered) return 'answered';
    if (isFlagged) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-accent-500 text-black dark:text-black border-accent-500';
      case 'answered': return 'bg-green-500 text-white border-green-500';
      case 'answered-flagged': return 'bg-amber-500 text-black border-amber-500';
      case 'flagged': return 'bg-red-500 text-white border-red-500';
      default: return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(250, 204, 21, 0.05) 35px,
            rgba(250, 204, 21, 0.05) 70px
          )`
        }}
      />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b-2 border-accent-500/50 sticky top-0 z-40 relative">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Título e informações */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-accent-500"
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">{examSession.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-police-body uppercase tracking-wider">ALVO {currentQuestion.number} DE {totalQuestions}</span>
                  <span className="font-police-body uppercase tracking-wider">{currentQuestion.subject}</span>
                  <Badge variant="outline" className="text-xs font-police-body border-accent-500 text-accent-500">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Controles centrais */}
            <div className="flex items-center gap-4">
              {/* Cronômetro */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-police-numbers text-lg font-bold border-2 transition-colors",
                examSession.timeRemaining < 1800 ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500" : 
                examSession.timeRemaining < 3600 ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-500" : 
                "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500"
              )}>
                <Clock className="w-5 h-5" />
                {formatTime(examSession.timeRemaining)}
              </div>

              {/* Status de progresso */}
              <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                <span className="font-medium text-accent-500 font-police-numbers">{answeredQuestions}</span>
                <span className="mx-1">/</span>
                <span className="font-police-numbers">{totalQuestions}</span>
                {flaggedCount > 0 && (
                  <span className="ml-2 text-amber-500 dark:text-amber-400">
                    <Flag className="w-4 h-4 inline mr-1" />
                    <span className="font-police-numbers">{flaggedCount}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Controles direitos */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePauseToggle}
                className="gap-1 font-police-body uppercase tracking-wider hover:text-accent-500"
              >
                {examSession.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {examSession.isPaused ? 'RETOMAR' : 'PAUSAR'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReviewMode(!showReviewMode)}
                className={cn(
                  "gap-1 font-police-body uppercase tracking-wider hover:text-accent-500",
                  showReviewMode && "text-accent-500 bg-accent-500/10"
                )}
                title="Ctrl+R"
              >
                {showReviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                REVISÃO
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className={cn(
                  "gap-1 font-police-body uppercase tracking-wider hover:text-accent-500",
                  showCalculator && "text-accent-500 bg-accent-500/10"
                )}
                title="Ctrl+C"
              >
                📱
                CALC
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="gap-1 font-police-body uppercase tracking-wider hover:text-accent-500"
              >
                <Menu className="w-4 h-4" />
                QUESTÕES
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFullscreen}
                className="gap-1 hover:text-accent-500"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider gap-1"
              >
                <Send className="w-4 h-4" />
                CONCLUIR MISSÃO
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar de questões */}
        <AnimatePresence>
          {showQuestionList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-r border-accent-500/50 overflow-hidden relative"
            >
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <div className="p-4 border-b border-accent-500/30">
                <h3 className="font-semibold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">NAVEGAÇÃO TÁTICA</h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="font-police-body text-gray-600 dark:text-gray-400">ELIMINADO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="font-police-body text-gray-600 dark:text-gray-400">MARCADO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <span className="font-police-body text-gray-600 dark:text-gray-400">PENDENTE</span>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2">
                  {examSession.questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setShowQuestionList(false);
                      }}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-all font-police-numbers border-2",
                        getStatusColor(getQuestionStatus(question.id, index))
                      )}
                    >
                      {question.number}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Área principal */}
        <div className="flex-1">
          {examSession.isPaused ? (
            <div className="flex items-center justify-center h-96">
              <Card className="p-8 text-center bg-white dark:bg-gray-900 border-2 border-amber-500/50 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
                
                <Pause className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">OPERAÇÃO PAUSADA</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body tracking-wider">
                  CLIQUE EM "RETOMAR" PARA CONTINUAR A OPERAÇÃO TÁTICA
                </p>
                <Button 
                  onClick={handlePauseToggle} 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider"
                >
                  <Play className="w-4 h-4" />
                  RETOMAR OPERAÇÃO
                </Button>
              </Card>
            </div>
          ) : (
            <div className="p-6 max-w-4xl mx-auto">
              {/* Questão atual */}
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                  {/* Tactical stripe */}
                  <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                  
                  <CardContent className="p-6">
                    {/* Header da questão */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-police-subtitle tracking-wider border-2 border-current">
                          ALVO {currentQuestion.number}
                        </Badge>
                        <Badge variant="outline" className="font-police-body border-accent-500 text-accent-500">
                          {currentQuestion.subject}
                        </Badge>
                        {currentQuestion.year && (
                          <Badge variant="outline" className="text-xs font-police-body border-gray-400 text-gray-600 dark:text-gray-400">
                            {currentQuestion.institution} - {currentQuestion.year}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleFlag}
                        className={cn(
                          "gap-1 font-police-body uppercase tracking-wider",
                          examSession.flaggedQuestions.has(currentQuestion.id) 
                            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" 
                            : "text-gray-500 dark:text-gray-400 hover:text-accent-500"
                        )}
                      >
                        <Flag className="w-4 h-4" />
                        {examSession.flaggedQuestions.has(currentQuestion.id) ? 'DESMARCAR' : 'SINALIZAR'}
                      </Button>
                    </div>

                    {/* Enunciado */}
                    <div className="mb-6">
                      <p className="text-gray-900 dark:text-white leading-relaxed text-lg font-police-body">
                        {currentQuestion.statement}
                      </p>
                    </div>

                    {/* Alternativas */}
                    <div className="space-y-3">
                      {currentQuestion.alternatives.map((alternative) => {
                        const isSelected = examSession.answers[currentQuestion.id] === alternative.id;
                        return (
                          <motion.button
                            key={alternative.id}
                            onClick={() => handleAnswerSelect(alternative.id)}
                            className={cn(
                              "w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md",
                              isSelected 
                                ? "border-accent-500 bg-accent-500/10 dark:bg-accent-500/20" 
                                : "border-gray-200 dark:border-gray-700 hover:border-accent-500/50 bg-white dark:bg-gray-800"
                            )}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1",
                                isSelected 
                                  ? "border-accent-500 bg-accent-500" 
                                  : "border-gray-300 dark:border-gray-600"
                              )}>
                                {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white mr-2 font-police-subtitle">
                                  {alternative.letter})
                                </span>
                                <span className="text-gray-800 dark:text-gray-200 font-police-body">
                                  {alternative.text}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Dica de atalhos */}
                    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-accent-500/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        <strong className="text-accent-500 font-police-subtitle uppercase tracking-wider">ATALHOS TÁTICOS:</strong> Alt + 1-5 para selecionar alternativa • 
                        Setas ← → para navegar • Ctrl + F para marcar questão
                      </p>
                    </div>

                    {/* Answer Required Alert */}
                    {!isCurrentQuestionAnswered && (
                      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-police-body uppercase tracking-wider">
                              ⚠️ RESPOSTA OBRIGATÓRIA: Selecione uma opção para continuar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Navegação */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                  ANTERIOR
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                  <span className="font-police-numbers">ALVO {currentQuestion.number} DE {totalQuestions}</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-accent-500 h-full rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (isCurrentQuestionAnswered) {
                      setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1));
                    }
                  }}
                  disabled={!isCurrentQuestionAnswered || currentQuestionIndex === totalQuestions - 1}
                  className={`font-police-body uppercase tracking-wider transition-all duration-200 gap-2 ${
                    isCurrentQuestionAnswered && currentQuestionIndex < totalQuestions - 1
                      ? 'bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white cursor-pointer border-accent-500'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600'
                  }`}
                  title={!isCurrentQuestionAnswered ? 'Responda a questão antes de continuar' : ''}
                >
                  PRÓXIMO
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmação de saída */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-amber-500/50 relative overflow-hidden"
            >
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
              
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
                  CONCLUIR OPERAÇÃO TÁTICA?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body tracking-wider">
                  VOCÊ ELIMINOU <span className="font-police-numbers font-bold text-accent-500">{answeredQuestions}</span> DE <span className="font-police-numbers font-bold">{totalQuestions}</span> ALVOS. 
                  TEM CERTEZA QUE DESEJA CONCLUIR A OPERAÇÃO?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                  >
                    RETOMAR OPERAÇÃO
                  </Button>
                  <Button
                    onClick={() => handleSubmitExam()}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider"
                  >
                    CONCLUIR MISSÃO
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de aviso questões não respondidas */}
      <AnimatePresence>
        {showWarningDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowWarningDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-red-500/50 relative overflow-hidden"
            >
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
              
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
                  ALVOS NÃO ELIMINADOS
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body tracking-wider">
                  VOCÊ AINDA TEM <span className="font-police-numbers font-bold text-red-500">{totalQuestions - answeredQuestions}</span> ALVOS NÃO ELIMINADOS. 
                  DESEJA CONCLUIR A OPERAÇÃO MESMO ASSIM?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarningDialog(false)}
                    className="flex-1 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                  >
                    REVISAR ALVOS
                  </Button>
                  <Button
                    onClick={() => {
                      setShowWarningDialog(false);
                      handleSubmitExam(true);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-police-body font-semibold uppercase tracking-wider"
                  >
                    CONCLUIR MESMO ASSIM
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculadora */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 right-4 z-50"
          >
            <Card className="w-64 bg-white dark:bg-gray-900 border-2 border-accent-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-police-title text-sm uppercase tracking-wider">CALCULADORA TÁTICA</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalculator(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    readOnly
                    className="w-full p-2 text-right bg-gray-100 dark:bg-gray-800 rounded border font-mono text-lg"
                    id="calc-display"
                    defaultValue="0"
                  />
                  
                  <div className="grid grid-cols-4 gap-1">
                    {['C', '±', '%', '÷',
                      '7', '8', '9', '×',
                      '4', '5', '6', '-',
                      '1', '2', '3', '+',
                      '0', '.', '='].map((btn, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-10 font-mono",
                          btn === '0' && "col-span-2",
                          ['÷', '×', '-', '+', '='].includes(btn) && "bg-accent-500 text-black hover:bg-accent-600"
                        )}
                        onClick={() => {
                          const display = document.getElementById('calc-display') as HTMLInputElement;
                          if (btn === 'C') {
                            display.value = '0';
                          } else if (btn === '=') {
                            try {
                              const result = eval(display.value.replace('×', '*').replace('÷', '/'));
                              display.value = result.toString();
                            } catch {
                              display.value = 'Erro';
                            }
                          } else {
                            if (display.value === '0' && !['+', '-', '×', '÷', '.'].includes(btn)) {
                              display.value = btn;
                            } else {
                              display.value += btn;
                            }
                          }
                        }}
                      >
                        {btn}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modo Revisão - Painel de Respostas */}
      <AnimatePresence>
        {showReviewMode && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-20 bottom-4 w-80 z-40"
          >
            <Card className="h-full bg-white dark:bg-gray-900 border-2 border-accent-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-police-title text-sm uppercase tracking-wider">REVISÃO TÁTICA</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewMode(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-lg font-bold text-green-600 font-police-numbers">
                      {Object.keys(examSession.answers).length}
                    </div>
                    <div className="text-xs text-green-600 font-police-body">RESPONDIDAS</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="text-lg font-bold text-red-600 font-police-numbers">
                      {examSession.flaggedQuestions.size}
                    </div>
                    <div className="text-xs text-red-600 font-police-body">MARCADAS</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold text-gray-600 font-police-numbers">
                      {examSession.questions.length - Object.keys(examSession.answers).length}
                    </div>
                    <div className="text-xs text-gray-600 font-police-body">PENDENTES</div>
                  </div>
                </div>

                {/* Lista de Questões com Tempos */}
                <div className="flex-1 overflow-y-auto">
                  <h4 className="text-xs font-police-subtitle uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-400">
                    TEMPOS POR QUESTÃO
                  </h4>
                  <div className="space-y-1">
                    {examSession.questions.map((question, index) => {
                      const time = questionTimes[question.id] || 0;
                      const isAnswered = examSession.answers[question.id];
                      const isFlagged = examSession.flaggedQuestions.has(question.id);
                      const isCurrent = index === currentQuestionIndex;
                      
                      return (
                        <div
                          key={question.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                            isCurrent && "bg-accent-500/20 border border-accent-500",
                            !isCurrent && "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-police-numbers">
                              {question.number}
                            </span>
                            <div className="flex gap-1">
                              {isAnswered && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                              {isFlagged && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                            </div>
                          </div>
                          <div className="text-xs font-police-numbers text-gray-600 dark:text-gray-400">
                            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dicas de Atalhos */}
                <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <div className="font-police-subtitle uppercase tracking-wider mb-1">ATALHOS:</div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400 font-police-body">
                    <div>Alt+1-5: Marcar alternativa</div>
                    <div>Ctrl+F: Marcar questão</div>
                    <div>Ctrl+C: Calculadora</div>
                    <div>Ctrl+R: Modo revisão</div>
                    <div>← →: Navegar questões</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}