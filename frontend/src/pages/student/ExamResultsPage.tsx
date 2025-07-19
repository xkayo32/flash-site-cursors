import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Award,
  Download,
  Share2,
  RotateCcw,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronRight,
  BookOpen,
  Brain,
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface QuestionResult {
  id: string;
  number: number;
  subject: string;
  statement: string;
  alternatives: {
    id: string;
    letter: string;
    text: string;
  }[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect: boolean;
  explanation: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

interface SubjectPerformance {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
  color: string;
}

interface ExamResult {
  id: string;
  examTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // em segundos
  completedAt: string;
  ranking: number;
  totalParticipants: number;
  questions: QuestionResult[];
  subjectPerformance: SubjectPerformance[];
  percentile: number;
  averageScore: number;
  recommendedStudyTopics: string[];
}

// Mock data dos resultados
const mockExamResult: ExamResult = {
  id: 'result-1',
  examTitle: 'Polícia Federal 2024 - Simulado Completo',
  score: 78,
  correctAnswers: 94,
  totalQuestions: 120,
  timeSpent: 9900, // 2h45min
  completedAt: new Date().toISOString(),
  ranking: 1247,
  totalParticipants: 8743,
  percentile: 85.7,
  averageScore: 68.5,
  recommendedStudyTopics: [
    'Direito Constitucional - Direitos Fundamentais',
    'Direito Penal - Crimes contra a Administração',
    'Informática - Segurança da Informação'
  ],
  subjectPerformance: [
    { subject: 'Direito Constitucional', total: 30, correct: 24, percentage: 80, color: 'bg-green-500' },
    { subject: 'Direito Penal', total: 25, correct: 18, percentage: 72, color: 'bg-yellow-500' },
    { subject: 'Direito Administrativo', total: 20, correct: 16, percentage: 80, color: 'bg-green-500' },
    { subject: 'Informática', total: 25, correct: 20, percentage: 80, color: 'bg-green-500' },
    { subject: 'Português', total: 20, correct: 16, percentage: 80, color: 'bg-green-500' }
  ],
  questions: [
    {
      id: 'q1',
      number: 1,
      subject: 'Direito Constitucional',
      statement: 'Segundo a Constituição Federal de 1988, no que se refere aos direitos e garantias fundamentais...',
      alternatives: [
        { id: 'a', letter: 'A', text: 'Os direitos fundamentais têm aplicação imediata...' },
        { id: 'b', letter: 'B', text: 'A casa é asilo inviolável do indivíduo...' },
        { id: 'c', letter: 'C', text: 'É livre a manifestação do pensamento...' },
        { id: 'd', letter: 'D', text: 'Todos são iguais perante a lei...' },
        { id: 'e', letter: 'E', text: 'A liberdade de consciência e de crença...' }
      ],
      correctAnswer: 'd',
      userAnswer: 'd',
      isCorrect: true,
      explanation: 'A alternativa D está correta pois reproduz fielmente o caput do artigo 5º da Constituição Federal.',
      difficulty: 'Médio'
    },
    {
      id: 'q2',
      number: 2,
      subject: 'Direito Penal',
      statement: 'João, funcionário público, solicitou e recebeu vantagem indevida...',
      alternatives: [
        { id: 'a', letter: 'A', text: 'João praticou crime de corrupção passiva...' },
        { id: 'b', letter: 'B', text: 'O crime consumou-se no momento...' },
        { id: 'c', letter: 'C', text: 'Configura-se concussão...' },
        { id: 'd', letter: 'D', text: 'Não há crime...' },
        { id: 'e', letter: 'E', text: 'João deve responder por prevaricação...' }
      ],
      correctAnswer: 'a',
      userAnswer: 'c',
      isCorrect: false,
      explanation: 'A resposta correta é A. Trata-se de corrupção passiva, prevista no art. 317 do CP, pois o funcionário solicitou e recebeu vantagem indevida.',
      difficulty: 'Difícil'
    }
  ]
};

export default function ExamResultsPage() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [examResult] = useState<ExamResult>(mockExamResult);
  const [showReview, setShowReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const filteredQuestions = examResult.questions.filter(q => {
    if (reviewFilter === 'wrong') return !q.isCorrect;
    if (reviewFilter === 'correct') return q.isCorrect;
    return true;
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleRetakeExam = () => {
    navigate(`/simulations/${examId}/take`);
  };

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu resultado no simulado',
          text: `Acabei de fazer o simulado "${examResult.examTitle}" e obtive ${examResult.score}% de aproveitamento!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copy to clipboard
      navigator.clipboard.writeText(
        `Acabei de fazer o simulado "${examResult.examTitle}" e obtive ${examResult.score}% de aproveitamento! ${window.location.href}`
      );
    }
  };

  if (showReview) {
    const currentQuestion = filteredQuestions[currentReviewIndex];
    if (!currentQuestion) {
      setShowReview(false);
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header da revisão */}
        <div className="bg-white shadow-lg border-b sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReview(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar aos resultados
                </Button>
                <div>
                  <h1 className="text-lg font-bold text-primary-900">Revisão de Questões</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Questão {currentReviewIndex + 1} de {filteredQuestions.length}</span>
                    <Badge variant="outline">
                      {currentQuestion.subject}
                    </Badge>
                    <Badge 
                      className={cn(
                        currentQuestion.isCorrect 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {currentQuestion.isCorrect ? 'Acertou' : 'Errou'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={reviewFilter}
                  onChange={(e) => {
                    setReviewFilter(e.target.value as any);
                    setCurrentReviewIndex(0);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todas as questões</option>
                  <option value="wrong">Apenas erradas</option>
                  <option value="correct">Apenas corretas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questão em revisão */}
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {/* Header da questão */}
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">
                  Questão {currentQuestion.number}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.subject}
                </Badge>
                <Badge 
                  className={cn(
                    currentQuestion.difficulty === 'Fácil' && "bg-green-100 text-green-700",
                    currentQuestion.difficulty === 'Médio' && "bg-yellow-100 text-yellow-700",
                    currentQuestion.difficulty === 'Difícil' && "bg-red-100 text-red-700"
                  )}
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>

              {/* Enunciado */}
              <div className="mb-6">
                <p className="text-gray-900 leading-relaxed text-lg">
                  {currentQuestion.statement}
                </p>
              </div>

              {/* Alternativas */}
              <div className="space-y-3 mb-6">
                {currentQuestion.alternatives.map((alternative) => {
                  const isCorrect = alternative.id === currentQuestion.correctAnswer;
                  const isUserAnswer = alternative.id === currentQuestion.userAnswer;
                  
                  let bgColor = 'bg-white border-gray-200';
                  let textColor = 'text-gray-800';
                  
                  if (isCorrect) {
                    bgColor = 'bg-green-50 border-green-500';
                    textColor = 'text-green-900';
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = 'bg-red-50 border-red-500';
                    textColor = 'text-red-900';
                  }

                  return (
                    <div
                      key={alternative.id}
                      className={cn(
                        "p-4 rounded-lg border-2",
                        bgColor
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1">
                          {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <span className={cn("font-medium mr-2", textColor)}>
                            {alternative.letter})
                          </span>
                          <span className={textColor}>
                            {alternative.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explicação */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Explicação:</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Navegação da revisão */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentReviewIndex(prev => Math.max(0, prev - 1))}
              disabled={currentReviewIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="text-sm text-gray-600">
              {currentReviewIndex + 1} de {filteredQuestions.length} questões
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentReviewIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
              disabled={currentReviewIndex === filteredQuestions.length - 1}
              className="gap-2"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link 
                  to="/simulations" 
                  className="text-primary-600 hover:text-primary-700 font-medium mb-2 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar aos simulados
                </Link>
                <h1 className="text-3xl font-bold text-primary-900">{examResult.examTitle}</h1>
                <p className="text-gray-600 mt-1">
                  Simulado concluído em {new Date(examResult.completedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleShareResults} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
                <Button onClick={handleRetakeExam} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Refazer simulado
                </Button>
              </div>
            </div>

            {/* Cards de resultado principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Pontuação geral */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className={cn("w-12 h-12 mx-auto mb-3", getScoreColor(examResult.score))} />
                  <div className={cn("text-3xl font-bold mb-1", getScoreColor(examResult.score))}>
                    {examResult.score}%
                  </div>
                  <p className="text-sm text-gray-600">Aproveitamento</p>
                  <Badge className={cn("mt-2", getScoreBgColor(examResult.score), getScoreColor(examResult.score))}>
                    {examResult.score >= 80 ? 'Excelente' : examResult.score >= 60 ? 'Bom' : 'Regular'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Acertos */}
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {examResult.correctAnswers}
                  </div>
                  <p className="text-sm text-gray-600">
                    de {examResult.totalQuestions} questões
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {examResult.totalQuestions - examResult.correctAnswers} erros
                  </p>
                </CardContent>
              </Card>

              {/* Tempo */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatTime(examResult.timeSpent)}
                  </div>
                  <p className="text-sm text-gray-600">Tempo gasto</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Média: {Math.round(examResult.timeSpent / examResult.totalQuestions)}s/questão
                  </p>
                </CardContent>
              </Card>

              {/* Ranking */}
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    #{examResult.ranking}
                  </div>
                  <p className="text-sm text-gray-600">
                    de {examResult.totalParticipants.toLocaleString()} participantes
                  </p>
                  <Badge variant="outline" className="mt-1">
                    Top {examResult.percentile}%
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna esquerda - Performance por matéria */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance por matéria */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold text-primary-900">Performance por Matéria</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResult.subjectPerformance.map((subject, index) => (
                      <motion.div
                        key={subject.subject}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${subject.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={cn("h-full rounded-full", subject.color)}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                              {subject.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {subject.correct} de {subject.total} questões
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações de revisão */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold text-primary-900">Revisão de Questões</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewFilter('all');
                        setCurrentReviewIndex(0);
                        setShowReview(true);
                      }}
                      className="gap-2 h-auto p-4 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">Todas as questões</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        Revisar todas as {examResult.totalQuestions} questões do simulado
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewFilter('wrong');
                        setCurrentReviewIndex(0);
                        setShowReview(true);
                      }}
                      className="gap-2 h-auto p-4 flex-col items-start border-red-200 hover:border-red-300"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">Questões erradas</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        Focar nas {examResult.totalQuestions - examResult.correctAnswers} questões incorretas
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewFilter('correct');
                        setCurrentReviewIndex(0);
                        setShowReview(true);
                      }}
                      className="gap-2 h-auto p-4 flex-col items-start border-green-200 hover:border-green-300"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">Questões corretas</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        Revisar as {examResult.correctAnswers} questões acertadas
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita - Estatísticas e recomendações */}
            <div className="space-y-6">
              {/* Comparação com a média */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-primary-900">Comparação</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Sua pontuação</span>
                        <span className="font-bold text-primary-900">{examResult.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-full rounded-full"
                          style={{ width: `${examResult.score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Média geral</span>
                        <span className="font-bold text-gray-700">{examResult.averageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-400 h-full rounded-full"
                          style={{ width: `${examResult.averageScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        Você está {examResult.score > examResult.averageScore ? 'acima' : 'abaixo'} da média em{' '}
                        <span className={cn(
                          "font-bold",
                          examResult.score > examResult.averageScore ? "text-green-600" : "text-red-600"
                        )}>
                          {Math.abs(examResult.score - examResult.averageScore).toFixed(1)} pontos
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações de estudo */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-primary-900">Recomendações de Estudo</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {examResult.recommendedStudyTopics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <Brain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">{topic}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link to="/courses">
                      <Button variant="outline" className="w-full gap-2">
                        <BookOpen className="w-4 h-4" />
                        Ver cursos recomendados
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Próximas ações */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-primary-900">Próximas Ações</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 justify-start"
                      onClick={() => {
                        setReviewFilter('wrong');
                        setShowReview(true);
                      }}
                    >
                      <Target className="w-4 h-4" />
                      Revisar questões erradas
                    </Button>
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <Download className="w-4 h-4" />
                      Baixar relatório em PDF
                    </Button>
                    <Button 
                      onClick={handleRetakeExam}
                      className="w-full gap-2 justify-start"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refazer este simulado
                    </Button>
                    <Link to="/simulations">
                      <Button variant="outline" className="w-full gap-2 justify-start">
                        <Trophy className="w-4 h-4" />
                        Fazer outro simulado
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}