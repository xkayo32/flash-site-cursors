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
  examTitle: 'OPERAÇÃO PF 2024 - SIMULAÇÃO TÁTICA COMPLETA',
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
          title: 'RELATÓRIO DE OPERAÇÃO TÁTICA',
          text: `Acabei de fazer o simulado "${examResult.examTitle}" e obtive ${examResult.score}% de aproveitamento!`,
          url: window.location.href
        });
      } catch (error) {
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
        
        {/* Header da revisão */}
        <div className="bg-white dark:bg-gray-900 shadow-lg border-b-2 border-gray-200 dark:border-accent-500/50 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReview(false)}
                  className="gap-2 font-police-body uppercase tracking-wider hover:text-accent-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                  RETORNAR AO RELATÓRIO
                </Button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">ANÁLISE TÁTICA DE QUESTÕES</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-police-body">ALVO {currentReviewIndex + 1} DE {filteredQuestions.length}</span>
                    <Badge variant="outline" className="font-police-body border-accent-500 text-accent-500">
                      {currentQuestion.subject}
                    </Badge>
                    <Badge 
                      className={cn(
                        "font-police-subtitle tracking-wider border-2 border-current",
                        currentQuestion.isCorrect 
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      )}
                    >
                      {currentQuestion.isCorrect ? 'ELIMINADO' : 'PERDIDO'}
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                >
                  <option value="all">TODOS OS ALVOS</option>
                  <option value="wrong">APENAS PERDIDOS</option>
                  <option value="correct">APENAS ELIMINADOS</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questão em revisão */}
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-6">
              {/* Header da questão */}
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="font-police-subtitle tracking-wider border-2 border-current">
                  ALVO {currentQuestion.number}
                </Badge>
                <Badge variant="outline" className="font-police-body border-accent-500 text-accent-500">
                  {currentQuestion.subject}
                </Badge>
                <Badge 
                  className={cn(
                    "font-police-subtitle tracking-wider border-2 border-current",
                    currentQuestion.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                    currentQuestion.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                    currentQuestion.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  )}
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>

              {/* Enunciado */}
              <div className="mb-6">
                <p className="text-gray-900 dark:text-white leading-relaxed text-lg font-police-body">
                  {currentQuestion.statement}
                </p>
              </div>

              {/* Alternativas */}
              <div className="space-y-3 mb-6">
                {currentQuestion.alternatives.map((alternative) => {
                  const isCorrect = alternative.id === currentQuestion.correctAnswer;
                  const isUserAnswer = alternative.id === currentQuestion.userAnswer;
                  
                  let bgColor = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
                  let textColor = 'text-gray-800 dark:text-gray-200';
                  
                  if (isCorrect) {
                    bgColor = 'bg-green-50 dark:bg-green-900/20 border-green-500';
                    textColor = 'text-green-900 dark:text-green-100';
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = 'bg-red-50 dark:bg-red-900/20 border-red-500';
                    textColor = 'text-red-900 dark:text-red-100';
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
                          <span className={cn("font-medium mr-2 font-police-subtitle", textColor)}>
                            {alternative.letter})
                          </span>
                          <span className={cn("font-police-body", textColor)}>
                            {alternative.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explicação */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 font-police-subtitle uppercase tracking-wider">ANÁLISE TÁTICA:</h4>
                <p className="text-blue-800 dark:text-blue-200 font-police-body">{currentQuestion.explanation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Navegação da revisão */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentReviewIndex(prev => Math.max(0, prev - 1))}
              disabled={currentReviewIndex === 0}
              className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              <ArrowLeft className="w-4 h-4" />
              ANTERIOR
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
              {currentReviewIndex + 1} DE {filteredQuestions.length} ALVOS
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentReviewIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
              disabled={currentReviewIndex === filteredQuestions.length - 1}
              className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              PRÓXIMO
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b-2 border-accent-500/50 relative">
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link 
                  to="/simulations" 
                  className="text-gray-600 dark:text-gray-400 hover:text-accent-500 font-medium mb-2 inline-flex items-center gap-1 font-police-body uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  RETORNAR ÀS SIMULAÇÕES
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">{examResult.examTitle}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 font-police-body uppercase tracking-wider">
                  OPERAÇÃO CONCLUÍDA EM {new Date(examResult.completedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleShareResults} 
                  className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                >
                  <Share2 className="w-4 h-4" />
                  TRANSMITIR RELATÓRIO
                </Button>
                <Button 
                  onClick={handleRetakeExam} 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                >
                  <RotateCcw className="w-4 h-4" />
                  REPETIR OPERAÇÃO
                </Button>
              </div>
            </div>

            {/* Cards de resultado principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Pontuação geral */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-6 text-center">
                  <Trophy className={cn("w-12 h-12 mx-auto mb-3", getScoreColor(examResult.score))} />
                  <div className={cn("text-3xl font-bold mb-1 font-police-numbers", getScoreColor(examResult.score))}>
                    {examResult.score}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">APROVEITAMENTO</p>
                  <Badge className={cn("mt-2 font-police-subtitle tracking-wider border-2 border-current", getScoreBgColor(examResult.score), getScoreColor(examResult.score))}>
                    {examResult.score >= 80 ? 'EXCELENTE' : examResult.score >= 60 ? 'BOM' : 'REGULAR'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Acertos */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-600 mb-1 font-police-numbers">
                    {examResult.correctAnswers}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                    DE {examResult.totalQuestions} ALVOS
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-body">
                    {examResult.totalQuestions - examResult.correctAnswers} PERDIDOS
                  </p>
                </CardContent>
              </Card>

              {/* Tempo */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-600 mb-1 font-police-numbers">
                    {formatTime(examResult.timeSpent)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TEMPO DE OPERAÇÃO</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-body">
                    MÉDIA: {Math.round(examResult.timeSpent / examResult.totalQuestions)}s/ALVO
                  </p>
                </CardContent>
              </Card>

              {/* Ranking */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-600 mb-1 font-police-numbers">
                    #{examResult.ranking}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                    DE {examResult.totalParticipants.toLocaleString()} OPERADORES
                  </p>
                  <Badge variant="outline" className="mt-1 font-police-subtitle tracking-wider border-2 border-current">
                    TOP {examResult.percentile}%
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
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">DESEMPENHO POR ÁREA OPERACIONAL</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResult.subjectPerformance.map((subject, index) => (
                      <motion.div
                        key={subject.subject}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white font-police-body">{subject.subject}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${subject.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={cn("h-full rounded-full", subject.color)}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[60px] font-police-numbers">
                              {subject.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-body">
                            {subject.correct} DE {subject.total} ALVOS ELIMINADOS
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações de revisão */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">ANÁLISE TÁTICA DE QUESTÕES</h3>
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
                      className="gap-2 h-auto p-4 flex-col items-start font-police-body hover:border-accent-500"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium font-police-subtitle uppercase tracking-wider">TODOS OS ALVOS</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left font-police-body">
                        REVISAR TODOS OS {examResult.totalQuestions} ALVOS DA OPERAÇÃO
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
                        <span className="font-medium text-red-700 font-police-body uppercase tracking-wider">ALVOS PERDIDOS</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left font-police-body">
                        ANALISAR OS {examResult.totalQuestions - examResult.correctAnswers} ALVOS PERDIDOS
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
                        <span className="font-medium text-green-700 font-police-body uppercase tracking-wider">ALVOS ELIMINADOS</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left font-police-body">
                        REVISAR OS {examResult.correctAnswers} ALVOS ELIMINADOS
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita - Estatísticas e recomendações */}
            <div className="space-y-6">
              {/* Comparação com a média */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">INTELIGÊNCIA COMPARATIVA</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">SUA PONTUAÇÃO</span>
                        <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{examResult.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-accent-500 h-full rounded-full"
                          style={{ width: `${examResult.score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">MÉDIA GERAL</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300 font-police-numbers">{examResult.averageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gray-400 dark:bg-gray-500 h-full rounded-full"
                          style={{ width: `${examResult.averageScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        VOCÊ ESTÁ {examResult.score > examResult.averageScore ? 'ACIMA' : 'ABAIXO'} DA MÉDIA EM{' '}
                        <span className={cn(
                          "font-bold font-police-numbers",
                          examResult.score > examResult.averageScore ? "text-green-600" : "text-red-600"
                        )}>
                          {Math.abs(examResult.score - examResult.averageScore).toFixed(1)} PONTOS
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações de estudo */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">RECOMENDAÇÕES TÁTICAS</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {examResult.recommendedStudyTopics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                        <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 font-police-body">{topic}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link to="/courses">
                      <Button variant="outline" className="w-full gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500">
                        <BookOpen className="w-4 h-4" />
                        VER MISSÕES RECOMENDADAS
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Próximas ações */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">PRÓXIMAS OPERAÇÕES</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 justify-start font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                      onClick={() => {
                        setReviewFilter('wrong');
                        setShowReview(true);
                      }}
                    >
                      <Target className="w-4 h-4" />
                      REVISAR ALVOS PERDIDOS
                    </Button>
                    <Button variant="outline" className="w-full gap-2 justify-start font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500">
                      <Download className="w-4 h-4" />
                      EXPORTAR RELATÓRIO TÁTICO
                    </Button>
                    <Button 
                      onClick={handleRetakeExam}
                      className="w-full gap-2 justify-start bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                    >
                      <RotateCcw className="w-4 h-4" />
                      REPETIR OPERAÇÃO TÁTICA
                    </Button>
                    <Link to="/simulations">
                      <Button variant="outline" className="w-full gap-2 justify-start font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500">
                        <Trophy className="w-4 h-4" />
                        NOVA OPERAÇÃO TÁTICA
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