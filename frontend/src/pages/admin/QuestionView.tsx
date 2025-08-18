import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Clock,
  Target,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  Hash,
  Tag,
  Calendar,
  User,
  BarChart,
  BookOpen,
  Brain,
  Trash2,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { questionService, type Question } from '@/services/questionService';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export default function QuestionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      
      const result = await questionService.getQuestion(parseInt(id!));
      if (result.success && result.data) {
        setQuestion(result.data);
      } else {
        toast.error('Erro ao carregar questão');
        navigate('/admin/questions');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Erro ao carregar dados da questão');
      navigate('/admin/questions');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      'easy': { 
        label: 'FÁCIL', 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-600',
        icon: Shield
      },
      'medium': { 
        label: 'MÉDIO', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-300 dark:border-yellow-600',
        icon: Target
      },
      'hard': { 
        label: 'DIFÍCIL', 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-600',
        icon: Award
      }
    };
    
    const cfg = config[difficulty as keyof typeof config] || config['medium'];
    const Icon = cfg.icon;
    
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1 flex items-center gap-1',
        cfg.color
      )}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      'multiple_choice': { 
        label: 'MÚLTIPLA ESCOLHA', 
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        icon: CheckCircle
      },
      'true_false': { 
        label: 'VERDADEIRO/FALSO', 
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        icon: AlertCircle
      },
      'essay': { 
        label: 'DISSERTATIVA', 
        color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
        icon: FileText
      },
      'fill_blank': { 
        label: 'PREENCHER LACUNAS', 
        color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
        icon: Hash
      }
    };
    
    const cfg = config[type as keyof typeof config] || config['multiple_choice'];
    const Icon = cfg.icon;
    
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1 flex items-center gap-1',
        cfg.color
      )}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  const handleDelete = async () => {
    if (!question) return;
    
    const confirmDelete = () => {
      toast.custom((t) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white font-police-subtitle uppercase">
                CONFIRMAR EXCLUSÃO
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                Deseja excluir esta questão?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-police-body"
            >
              CANCELAR
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete();
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-police-body"
            >
              EXCLUIR
            </button>
          </div>
        </div>
      ), { duration: Infinity });
    };

    const executeDelete = async () => {
      try {
        const result = await questionService.deleteQuestion(question.id);
        if (result.success) {
          toast.success('QUESTÃO ELIMINADA COM SUCESSO!');
          navigate('/admin/questions');
        } else {
          toast.error(result.message || 'ERRO AO ELIMINAR QUESTÃO');
        }
      } catch (error) {
        toast.error('ERRO AO ELIMINAR QUESTÃO');
      }
    };

    confirmDelete();
  };

  const handleDuplicate = async () => {
    if (!question) return;
    
    try {
      // Criar cópia da questão
      const duplicateData = {
        ...question,
        text: `${question.text} (CÓPIA)`,
        id: undefined // Remove ID para criar nova
      };
      
      const result = await questionService.createQuestion(duplicateData);
      if (result.success && result.data) {
        toast.success('QUESTÃO DUPLICADA COM SUCESSO!');
        navigate(`/admin/questions/edit/${result.data.id}`);
      } else {
        toast.error(result.message || 'ERRO AO DUPLICAR QUESTÃO');
      }
    } catch (error) {
      toast.error('ERRO AO DUPLICAR QUESTÃO');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
            CARREGANDO QUESTÃO TÁTICA...
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
            QUESTÃO NÃO ENCONTRADA
          </h3>
          <Button 
            onClick={() => navigate('/admin/questions')} 
            className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
          >
            VOLTAR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/questions')}
            className="font-police-body"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLTAR
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
              QUESTÃO #{question.id}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {getTypeBadge(question.type)}
              {getDifficultyBadge(question.difficulty)}
              <Badge className="font-police-body uppercase">
                {question.category}
              </Badge>
              {question.subcategory && (
                <Badge variant="outline" className="font-police-body uppercase">
                  {question.subcategory}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDuplicate}
            className="gap-2 font-police-body font-semibold uppercase tracking-wider"
          >
            <Copy className="w-4 h-4" />
            DUPLICAR
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="gap-2 font-police-body font-semibold uppercase tracking-wider text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 className="w-4 h-4" />
            EXCLUIR
          </Button>
          <Button 
            onClick={() => navigate(`/admin/questions/edit/${question.id}`)} 
            className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
          >
            <Edit className="w-4 h-4" />
            EDITAR QUESTÃO
          </Button>
        </div>
      </motion.div>

      {/* Question Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900">
            <CardTitle className="text-white font-police-title uppercase tracking-ultra-wide text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent-500" />
              ENUNCIADO DA QUESTÃO
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 font-police-body text-lg leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Options for multiple choice */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400 mb-3">
                  ALTERNATIVAS
                </h3>
                {question.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D...
                  const isCorrect = question.correctAnswer === letter;
                  const isSelected = selectedAnswer === letter;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedAnswer(letter)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        isSelected && showAnswer && isCorrect && "bg-green-50 dark:bg-green-900/20 border-green-500",
                        isSelected && showAnswer && !isCorrect && "bg-red-50 dark:bg-red-900/20 border-red-500",
                        isSelected && !showAnswer && "bg-accent-50 dark:bg-accent-900/20 border-accent-500",
                        !isSelected && "border-gray-200 dark:border-gray-700 hover:border-accent-500/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2",
                        isSelected && showAnswer && isCorrect && "bg-green-500 text-white border-green-500",
                        isSelected && showAnswer && !isCorrect && "bg-red-500 text-white border-red-500",
                        isSelected && !showAnswer && "bg-accent-500 text-white border-accent-500",
                        !isSelected && "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      )}>
                        {letter}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300 font-police-body">
                          {option}
                        </p>
                        {showAnswer && isCorrect && (
                          <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-police-body uppercase">Resposta Correta</span>
                          </div>
                        )}
                        {showAnswer && isSelected && !isCorrect && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-police-body uppercase">Resposta Incorreta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {question.type === 'true_false' && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedAnswer('true')}
                  className={cn(
                    "p-4 rounded-lg border-2 font-police-body uppercase font-semibold transition-all",
                    selectedAnswer === 'true' && showAnswer && question.correctAnswer === 'true' && "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700",
                    selectedAnswer === 'true' && showAnswer && question.correctAnswer !== 'true' && "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700",
                    selectedAnswer === 'true' && !showAnswer && "bg-accent-50 dark:bg-accent-900/20 border-accent-500 text-accent-700",
                    selectedAnswer !== 'true' && "border-gray-200 dark:border-gray-700 hover:border-accent-500/50"
                  )}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  VERDADEIRO
                </button>
                <button
                  onClick={() => setSelectedAnswer('false')}
                  className={cn(
                    "p-4 rounded-lg border-2 font-police-body uppercase font-semibold transition-all",
                    selectedAnswer === 'false' && showAnswer && question.correctAnswer === 'false' && "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700",
                    selectedAnswer === 'false' && showAnswer && question.correctAnswer !== 'false' && "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700",
                    selectedAnswer === 'false' && !showAnswer && "bg-accent-50 dark:bg-accent-900/20 border-accent-500 text-accent-700",
                    selectedAnswer !== 'false' && "border-gray-200 dark:border-gray-700 hover:border-accent-500/50"
                  )}
                >
                  <XCircle className="w-6 h-6 mx-auto mb-2" />
                  FALSO
                </button>
              </div>
            )}

            {/* Show Answer Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowAnswer(!showAnswer)}
                className="gap-2 font-police-body font-semibold uppercase tracking-wider"
                variant={showAnswer ? "outline" : "default"}
              >
                {showAnswer ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    OCULTAR RESPOSTA
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    MOSTRAR RESPOSTA
                  </>
                )}
              </Button>
            </div>

            {/* Explanation */}
            {showAnswer && question.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-police-subtitle uppercase tracking-wider text-blue-900 dark:text-blue-100 mb-2">
                      EXPLICAÇÃO
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 font-police-body">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  TAGS
                </p>
                <div className="flex flex-wrap gap-1">
                  {question.tags && question.tags.length > 0 ? (
                    question.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 font-police-body">Sem tags</span>
                  )}
                </div>
              </div>
              <Tag className="w-6 h-6 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  PONTOS
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {question.points || 10}
                </p>
              </div>
              <Target className="w-6 h-6 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  CRIADO EM
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-police-numbers">
                  {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  AUTOR
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-police-body uppercase truncate">
                  {question.author || 'SISTEMA'}
                </p>
              </div>
              <User className="w-6 h-6 text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics */}
      {question.statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-police-title uppercase tracking-ultra-wide text-lg flex items-center gap-2">
                <BarChart className="w-5 h-5 text-accent-500" />
                ESTATÍSTICAS DE DESEMPENHO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    TOTAL DE RESPOSTAS
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {question.statistics.totalAnswers || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    TAXA DE ACERTO
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-police-numbers">
                    {question.statistics.correctRate || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    TEMPO MÉDIO
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {question.statistics.averageTime || '--'}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}