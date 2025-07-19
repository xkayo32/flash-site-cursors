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
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  year?: number;
  institution?: string;
}

interface ExamSession {
  id: string;
  examId: string;
  title: string;
  questions: Question[];
  duration: number; // em minutos
  startedAt: string;
  answers: Record<string, string>; // questionId -> alternativeId
  flaggedQuestions: Set<string>;
  timeRemaining: number; // em segundos
  isPaused: boolean;
  isFullscreen: boolean;
}

// Dados mockados do simulado
const mockExamSession: ExamSession = {
  id: 'session-1',
  examId: '1',
  title: 'Polícia Federal 2024 - Simulado Completo',
  duration: 180,
  startedAt: new Date().toISOString(),
  answers: {},
  flaggedQuestions: new Set(),
  timeRemaining: 180 * 60, // 3 horas em segundos
  isPaused: false,
  isFullscreen: false,
  questions: [
    {
      id: 'q1',
      number: 1,
      subject: 'Direito Constitucional',
      statement: 'Segundo a Constituição Federal de 1988, no que se refere aos direitos e garantias fundamentais, é correto afirmar que:',
      alternatives: [
        {
          id: 'a',
          letter: 'A',
          text: 'Os direitos fundamentais têm aplicação imediata, independentemente de regulamentação infraconstitucional.'
        },
        {
          id: 'b',
          letter: 'B',
          text: 'A casa é asilo inviolável do indivíduo, não podendo ninguém nela penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre.'
        },
        {
          id: 'c',
          letter: 'C',
          text: 'É livre a manifestação do pensamento, sendo vedado o anonimato em qualquer circunstância.'
        },
        {
          id: 'd',
          letter: 'D',
          text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.'
        },
        {
          id: 'e',
          letter: 'E',
          text: 'A liberdade de consciência e de crença é inviolável, mas o exercício dos cultos religiosos depende de autorização do Poder Público.'
        }
      ],
      difficulty: 'Médio',
      year: 2023,
      institution: 'CESPE'
    },
    {
      id: 'q2',
      number: 2,
      subject: 'Direito Penal',
      statement: 'João, funcionário público, solicitou e recebeu vantagem indevida de R$ 5.000,00 para acelerar um processo administrativo. Com base no Código Penal, analise as afirmativas:',
      alternatives: [
        {
          id: 'a',
          letter: 'A',
          text: 'João praticou crime de corrupção passiva, com pena de reclusão de 2 a 12 anos e multa.'
        },
        {
          id: 'b',
          letter: 'B',
          text: 'O crime consumou-se no momento em que João solicitou a vantagem, independentemente do recebimento.'
        },
        {
          id: 'c',
          letter: 'C',
          text: 'Configura-se concussão, pois houve exigência de vantagem indevida.'
        },
        {
          id: 'd',
          letter: 'D',
          text: 'Não há crime, pois o valor é inferior ao limite estabelecido pela jurisprudência.'
        },
        {
          id: 'e',
          letter: 'E',
          text: 'João deve responder por prevaricação, pois retardou ato de ofício.'
        }
      ],
      difficulty: 'Difícil',
      year: 2022,
      institution: 'CESPE'
    },
    {
      id: 'q3',
      number: 3,
      subject: 'Informática',
      statement: 'Em relação aos conceitos de segurança da informação, é correto afirmar que:',
      alternatives: [
        {
          id: 'a',
          letter: 'A',
          text: 'A criptografia simétrica utiliza chaves diferentes para cifrar e decifrar os dados.'
        },
        {
          id: 'b',
          letter: 'B',
          text: 'O protocolo HTTPS garante apenas a integridade dos dados transmitidos.'
        },
        {
          id: 'c',
          letter: 'C',
          text: 'Um firewall é capaz de detectar e bloquear todos os tipos de malware.'
        },
        {
          id: 'd',
          letter: 'D',
          text: 'A autenticação de dois fatores (2FA) aumenta significativamente a segurança do sistema.'
        },
        {
          id: 'e',
          letter: 'E',
          text: 'Backup incremental copia todos os arquivos do sistema a cada execução.'
        }
      ],
      difficulty: 'Fácil',
      year: 2023,
      institution: 'CESPE'
    }
  ]
};

export default function ExamTakingPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [examSession, setExamSession] = useState<ExamSession>(mockExamSession);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentQuestion = examSession.questions[currentQuestionIndex];
  const totalQuestions = examSession.questions.length;
  const answeredQuestions = Object.keys(examSession.answers).length;
  const flaggedCount = examSession.flaggedQuestions.size;

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
  }, [examSession.isPaused, examSession.timeRemaining]);

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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, totalQuestions, currentQuestion]);

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

  const handleAnswerSelect = (alternativeId: string) => {
    setExamSession(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: alternativeId
      }
    }));
  };

  const handleToggleFlag = () => {
    setExamSession(prev => {
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(currentQuestion.id)) {
        newFlagged.delete(currentQuestion.id);
      } else {
        newFlagged.add(currentQuestion.id);
      }
      return { ...prev, flaggedQuestions: newFlagged };
    });
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

  const handleSubmitExam = (autoSubmit = false) => {
    if (!autoSubmit && answeredQuestions < totalQuestions) {
      setShowWarningDialog(true);
      return;
    }
    
    // Navigate to results page
    navigate(`/simulations/${examId}/results`, {
      state: {
        answers: examSession.answers,
        timeSpent: examSession.duration * 60 - examSession.timeRemaining
      }
    });
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
      case 'current': return 'bg-primary-600 text-white';
      case 'answered': return 'bg-green-500 text-white';
      case 'answered-flagged': return 'bg-amber-500 text-white';
      case 'flagged': return 'bg-red-500 text-white';
      default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-primary-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Título e informações */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-primary-900">{examSession.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Questão {currentQuestion.number} de {totalQuestions}</span>
                  <span>{currentQuestion.subject}</span>
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Controles centrais */}
            <div className="flex items-center gap-4">
              {/* Cronômetro */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold",
                examSession.timeRemaining < 1800 ? "bg-red-100 text-red-700" : 
                examSession.timeRemaining < 3600 ? "bg-amber-100 text-amber-700" : 
                "bg-green-100 text-green-700"
              )}>
                <Clock className="w-5 h-5" />
                {formatTime(examSession.timeRemaining)}
              </div>

              {/* Status de progresso */}
              <div className="text-sm text-gray-600">
                <span className="font-medium text-green-600">{answeredQuestions}</span>
                <span className="mx-1">/</span>
                <span>{totalQuestions}</span>
                {flaggedCount > 0 && (
                  <span className="ml-2 text-amber-600">
                    <Flag className="w-4 h-4 inline mr-1" />
                    {flaggedCount}
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
                className="gap-1"
              >
                {examSession.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {examSession.isPaused ? 'Continuar' : 'Pausar'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="gap-1"
              >
                <Menu className="w-4 h-4" />
                Questões
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFullscreen}
                className="gap-1"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-green-600 hover:bg-green-700 gap-1"
              >
                <Send className="w-4 h-4" />
                Finalizar
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
              className="bg-white border-r border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Navegação</h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Respondida</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Marcada</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span>Não respondida</span>
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
                        "w-10 h-10 rounded-lg text-sm font-medium transition-all",
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
              <Card className="p-8 text-center">
                <Pause className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Prova Pausada</h2>
                <p className="text-gray-600 mb-4">
                  Clique em "Continuar" para retomar a prova
                </p>
                <Button onClick={handlePauseToggle} className="gap-2">
                  <Play className="w-4 h-4" />
                  Continuar Prova
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
                <Card className="mb-6">
                  <CardContent className="p-6">
                    {/* Header da questão */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          Questão {currentQuestion.number}
                        </Badge>
                        <Badge variant="outline">
                          {currentQuestion.subject}
                        </Badge>
                        {currentQuestion.year && (
                          <Badge variant="outline" className="text-xs">
                            {currentQuestion.institution} - {currentQuestion.year}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleFlag}
                        className={cn(
                          "gap-1",
                          examSession.flaggedQuestions.has(currentQuestion.id) 
                            ? "text-red-600 bg-red-50" 
                            : "text-gray-500"
                        )}
                      >
                        <Flag className="w-4 h-4" />
                        {examSession.flaggedQuestions.has(currentQuestion.id) ? 'Desmarcada' : 'Marcar'}
                      </Button>
                    </div>

                    {/* Enunciado */}
                    <div className="mb-6">
                      <p className="text-gray-900 leading-relaxed text-lg">
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
                                ? "border-primary-500 bg-primary-50" 
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            )}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1",
                                isSelected 
                                  ? "border-primary-500 bg-primary-500" 
                                  : "border-gray-300"
                              )}>
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-primary-900 mr-2">
                                  {alternative.letter})
                                </span>
                                <span className="text-gray-800">
                                  {alternative.text}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Dica de atalhos */}
                    <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Atalhos:</strong> Alt + 1-5 para selecionar alternativa • 
                        Setas ← → para navegar • Ctrl + F para marcar questão
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Navegação */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Questão {currentQuestion.number} de {totalQuestions}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="gap-2"
                >
                  Próxima
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
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Finalizar Prova?
                </h3>
                <p className="text-gray-600 mb-6">
                  Você respondeu {answeredQuestions} de {totalQuestions} questões. 
                  Tem certeza que deseja finalizar a prova?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1"
                  >
                    Continuar Prova
                  </Button>
                  <Button
                    onClick={() => handleSubmitExam()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Finalizar
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
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Questões não respondidas
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda tem {totalQuestions - answeredQuestions} questões não respondidas. 
                  Deseja continuar mesmo assim?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarningDialog(false)}
                    className="flex-1"
                  >
                    Revisar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowWarningDialog(false);
                      handleSubmitExam(true);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Finalizar Mesmo Assim
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}