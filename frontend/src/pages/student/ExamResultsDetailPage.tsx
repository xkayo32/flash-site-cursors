import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  Award,
  TrendingUp,
  RotateCcw,
  Eye,
  Loader2,
  AlertCircle,
  Shield,
  Zap,
  Trophy,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockExamService } from '@/services/mockExamService';

interface Question {
  id: string;
  title: string;
  type: string;
  subject: string;
  difficulty: string;
  options?: string[];
  explanation?: string;
}

interface ExamResults {
  attempt: {
    id: string;
    exam_id: string;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    blank_answers: number;
    time_spent: number;
    submitted_at: string;
    review?: Array<{
      question_id: string;
      is_correct: boolean;
      user_answer: any;
      correct_answer: any;
      explanation?: string;
    }>;
  };
  exam: {
    id: string;
    title: string;
    duration: number;
    total_questions: number;
    passing_score: number;
  };
  questions: Question[];
  passed: boolean;
}

export default function ExamResultsDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<ExamResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (attemptId) {
      loadResults();
    }
  }, [attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockExamService.getExamResults(attemptId!);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        throw new Error('Falha ao carregar resultados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar resultados:', err);
      setError(err.message || 'Erro ao carregar resultados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    }
    return `${minutes}min ${secs}s`;
  };

  const getGradeColor = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return 'text-green-600 dark:text-green-400';
    } else if (score >= passingScore * 0.7) {
      return 'text-amber-600 dark:text-amber-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  const getResultMessage = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return { message: 'MISSÃO CUMPRIDA', icon: Trophy, color: 'text-green-600' };
    } else if (score >= passingScore * 0.7) {
      return { message: 'PARCIALMENTE BEM-SUCEDIDA', icon: Shield, color: 'text-amber-600' };
    } else {
      return { message: 'MISSÃO FALHADA', icon: Target, color: 'text-red-600' };
    }
  };

  const renderQuestionReview = () => {
    if (!results?.attempt.review || !selectedQuestionId) return null;
    
    const review = results.attempt.review.find(r => r.question_id === selectedQuestionId);
    const question = results.questions.find(q => q.id === selectedQuestionId);
    
    if (!review || !question) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase">
                ANÁLISE DETALHADA
              </h3>
              <div className="flex items-center gap-2">
                {review.is_correct ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    ACERTO
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <XCircle className="w-4 h-4 mr-1" />
                    ERRO
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Questão:
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.title}
                </p>
              </div>
              
              {question.options && (
                <>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      Sua resposta:
                    </p>
                    <p className={`${review.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} font-medium`}>
                      {typeof review.user_answer === 'number' 
                        ? `${String.fromCharCode(65 + review.user_answer)}) ${question.options[review.user_answer]}`
                        : 'Não respondida'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      Resposta correta:
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      {typeof review.correct_answer === 'number'
                        ? `${String.fromCharCode(65 + review.correct_answer)}) ${question.options[review.correct_answer]}`
                        : review.correct_answer
                      }
                    </p>
                  </div>
                </>
              )}
              
              {review.explanation && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    Explicação:
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              ANALISANDO RESULTADOS...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-red-200 dark:border-red-800 p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
              {error || 'Resultados não encontrados'}
            </p>
            <Button
              onClick={() => navigate('/simulations')}
              variant="outline"
              className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              VOLTAR ÀS SIMULAÇÕES
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { message, icon: ResultIcon, color } = getResultMessage(results.attempt.score, results.exam.passing_score);

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full">
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          onClick={() => navigate('/simulations')}
          variant="outline"
          size="sm"
          className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          VOLTAR
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            RELATÓRIO DE OPERAÇÃO
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            ANÁLISE COMPLETA DOS RESULTADOS
          </p>
        </div>
      </motion.div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Results */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-[#14242f] text-white shadow-xl relative overflow-hidden">
              {/* Corner tactical accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-500/30"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/30"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500/30"></div>
              
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-8">
                  <ResultIcon className={`w-16 h-16 mx-auto mb-4 ${color}`} />
                  <h2 className={`text-3xl font-bold font-police-title uppercase tracking-wider mb-2 ${color}`}>
                    {message}
                  </h2>
                  <h3 className="text-xl text-gray-300 font-police-body uppercase tracking-wider">
                    {results.exam.title}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className={`text-4xl font-bold font-police-numbers mb-2 ${getGradeColor(results.attempt.score, results.exam.passing_score)}`}>
                      {results.attempt.score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400 font-police-body uppercase tracking-wider">
                      PONTUAÇÃO FINAL
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold font-police-numbers text-accent-500 mb-2">
                      {results.attempt.correct_answers}
                    </div>
                    <div className="text-sm text-gray-400 font-police-body uppercase tracking-wider">
                      ALVOS ELIMINADOS
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold font-police-numbers text-green-400">
                      {results.attempt.correct_answers}
                    </div>
                    <div className="text-xs text-green-300 font-police-body uppercase">
                      ACERTOS
                    </div>
                  </div>
                  
                  <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                    <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <div className="text-lg font-bold font-police-numbers text-red-400">
                      {results.attempt.wrong_answers}
                    </div>
                    <div className="text-xs text-red-300 font-police-body uppercase">
                      ERROS
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-500/20 rounded-lg border border-gray-500/30">
                    <MinusCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <div className="text-lg font-bold font-police-numbers text-gray-400">
                      {results.attempt.blank_answers}
                    </div>
                    <div className="text-xs text-gray-300 font-police-body uppercase">
                      EM BRANCO
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase">
                  DADOS DA OPERAÇÃO
                </h3>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-police-body uppercase">TEMPO:</span>
                  </div>
                  <span className="font-police-numbers font-bold">
                    {formatTime(results.attempt.time_spent)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-police-body uppercase">QUESTÕES:</span>
                  </div>
                  <span className="font-police-numbers font-bold">
                    {results.questions.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-police-body uppercase">NOTA MIN:</span>
                  </div>
                  <span className="font-police-numbers font-bold">
                    {results.exam.passing_score}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardContent className="p-6 space-y-3">
                <Link to={`/simulations/${results.exam.id}/details`}>
                  <Button 
                    variant="outline" 
                    className="w-full font-police-body uppercase tracking-wider gap-2 hover:border-accent-500 hover:text-accent-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                    NOVA TENTATIVA
                  </Button>
                </Link>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/simulations')}
                  className="w-full font-police-body uppercase tracking-wider gap-2 hover:border-accent-500 hover:text-accent-500"
                >
                  <BookOpen className="w-4 h-4" />
                  OUTRAS SIMULAÇÕES
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Question Review */}
      {results.attempt.review && results.attempt.review.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase">
                REVISÃO DE QUESTÕES
              </h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2 mb-6">
                {results.attempt.review.map((review, index) => (
                  <button
                    key={review.question_id}
                    onClick={() => setSelectedQuestionId(
                      selectedQuestionId === review.question_id ? null : review.question_id
                    )}
                    className={`
                      w-10 h-10 rounded-lg border-2 font-police-numbers font-bold text-sm
                      transition-all duration-200 hover:scale-110
                      ${review.is_correct 
                        ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : review.user_answer !== null && review.user_answer !== undefined
                        ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 border-gray-500 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }
                      ${selectedQuestionId === review.question_id ? 'ring-2 ring-accent-500' : ''}
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm font-police-body">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">ACERTOS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">ERROS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">EM BRANCO</span>
                </div>
              </div>
              
              {renderQuestionReview()}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}