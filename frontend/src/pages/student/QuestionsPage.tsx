import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileQuestion,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Building,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Target,
  Brain,
  Plus,
  Star,
  BookMarked,
  Eye,
  EyeOff,
  MessageSquare,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  year: number;
  exam: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  tags: string[];
  stats: {
    totalAttempts: number;
    correctAttempts: number;
    avgTime: number; // em segundos
  };
  userAnswer?: number;
  isAnswered?: boolean;
  isCorrect?: boolean;
  isFavorite?: boolean;
  timeSpent?: number;
}

interface QuestionFilter {
  subjects: string[];
  topics: string[];
  exams: string[];
  years: number[];
  difficulties: string[];
  answered?: 'all' | 'answered' | 'unanswered';
  performance?: 'all' | 'correct' | 'incorrect';
}

interface StudySession {
  id: string;
  name: string;
  questionsIds: string[];
  createdAt: string;
  progress: number;
}

// Dados mockados
const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'Segundo a Constituição Federal de 1988, são direitos sociais, EXCETO:',
    options: [
      'Educação, saúde e alimentação',
      'Trabalho, moradia e lazer',
      'Propriedade privada dos meios de produção',
      'Segurança, previdência social e proteção à maternidade'
    ],
    correctAnswer: 2,
    explanation: 'A propriedade privada dos meios de produção não é um direito social previsto no art. 6º da CF/88. Os direitos sociais são: educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e à infância, e assistência aos desamparados.',
    subject: 'Direito Constitucional',
    topic: 'Direitos e Garantias Fundamentais',
    subtopic: 'Direitos Sociais',
    year: 2023,
    exam: 'FGV',
    difficulty: 'Médio',
    tags: ['CF/88', 'Art. 6º', 'Direitos Sociais'],
    stats: {
      totalAttempts: 3456,
      correctAttempts: 2145,
      avgTime: 45
    },
    isAnswered: true,
    userAnswer: 2,
    isCorrect: true,
    timeSpent: 38
  },
  {
    id: '2',
    question: 'O crime de corrupção passiva, previsto no art. 317 do Código Penal, caracteriza-se quando o funcionário público:',
    options: [
      'Oferece vantagem indevida a outro funcionário',
      'Solicita ou recebe vantagem indevida em razão da função',
      'Apropria-se de dinheiro público',
      'Facilita a fuga de pessoa presa'
    ],
    correctAnswer: 1,
    explanation: 'A corrupção passiva (art. 317, CP) ocorre quando o funcionário público solicita ou recebe, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida, ou aceita promessa de tal vantagem.',
    subject: 'Direito Penal',
    topic: 'Crimes contra a Administração Pública',
    subtopic: 'Corrupção Passiva',
    year: 2023,
    exam: 'CESPE',
    difficulty: 'Difícil',
    tags: ['Código Penal', 'Art. 317', 'Corrupção'],
    stats: {
      totalAttempts: 2890,
      correctAttempts: 1567,
      avgTime: 62
    },
    isAnswered: true,
    userAnswer: 0,
    isCorrect: false,
    timeSpent: 55
  },
  {
    id: '3',
    question: 'Em relação aos princípios da Administração Pública, assinale a alternativa correta:',
    options: [
      'O princípio da eficiência foi incluído pela EC 19/1998',
      'O princípio da moralidade não tem previsão constitucional',
      'O princípio da publicidade é absoluto, sem exceções',
      'O princípio da impessoalidade permite privilégios pessoais'
    ],
    correctAnswer: 0,
    explanation: 'O princípio da eficiência foi incluído no art. 37 da CF/88 pela Emenda Constitucional nº 19/1998. Os demais princípios (legalidade, impessoalidade, moralidade e publicidade) já constavam no texto original.',
    subject: 'Direito Administrativo',
    topic: 'Princípios da Administração Pública',
    year: 2024,
    exam: 'FCC',
    difficulty: 'Fácil',
    tags: ['Princípios', 'LIMPE', 'EC 19/98'],
    stats: {
      totalAttempts: 4123,
      correctAttempts: 3456,
      avgTime: 35
    },
    isFavorite: true
  },
  {
    id: '4',
    question: 'Qual comando Linux é usado para listar arquivos e diretórios com detalhes?',
    options: [
      'ls -la',
      'dir /all',
      'list --verbose',
      'show files'
    ],
    correctAnswer: 0,
    explanation: 'O comando "ls -la" lista todos os arquivos e diretórios (incluindo ocultos) com detalhes como permissões, proprietário, tamanho e data de modificação.',
    subject: 'Informática',
    topic: 'Sistemas Operacionais',
    subtopic: 'Linux',
    year: 2023,
    exam: 'IBFC',
    difficulty: 'Fácil',
    tags: ['Linux', 'Comandos', 'Terminal'],
    stats: {
      totalAttempts: 1876,
      correctAttempts: 1654,
      avgTime: 28
    }
  },
  {
    id: '5',
    question: 'A concordância verbal está INCORRETA em:',
    options: [
      'Fazem dois anos que não o vejo',
      'A maioria dos alunos compareceu à aula',
      'Vossa Excelência está enganado',
      'Mais de um candidato foi aprovado'
    ],
    correctAnswer: 0,
    explanation: 'O verbo "fazer", quando indica tempo decorrido, é impessoal e deve permanecer na 3ª pessoa do singular. O correto é "Faz dois anos que não o vejo".',
    subject: 'Português',
    topic: 'Gramática',
    subtopic: 'Concordância Verbal',
    year: 2024,
    exam: 'CESPE',
    difficulty: 'Médio',
    tags: ['Concordância', 'Verbos Impessoais'],
    stats: {
      totalAttempts: 3234,
      correctAttempts: 1987,
      avgTime: 42
    }
  }
];

const subjects = ['Todos', 'Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Informática', 'Português'];
const exams = ['Todos', 'CESPE', 'FCC', 'FGV', 'IBFC', 'VUNESP'];
const years = ['Todos', 2024, 2023, 2022, 2021, 2020];
const difficulties = ['Todas', 'Fácil', 'Médio', 'Difícil'];

// Estatísticas gerais
const generalStats = {
  totalQuestions: 15678,
  answeredQuestions: 3456,
  correctAnswers: 2567,
  totalTime: 4320, // minutos
  averageAccuracy: 74.3,
  strongSubjects: ['Direito Administrativo', 'Informática'],
  weakSubjects: ['Direito Penal', 'Raciocínio Lógico']
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'study'>('list');
  const [selectedFilters, setSelectedFilters] = useState<QuestionFilter>({
    subjects: [],
    topics: [],
    exams: [],
    years: [],
    difficulties: [],
    answered: 'all',
    performance: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentNotebook, setCurrentNotebook] = useState<StudySession | null>(null);
  const [showCreateNotebook, setShowCreateNotebook] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [notebookName, setNotebookName] = useState('');
  const [notebookDescription, setNotebookDescription] = useState('');

  // Função para responder questão
  const handleAnswer = (questionId: string, answerIndex: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const isCorrect = answerIndex === q.correctAnswer;
        return {
          ...q,
          userAnswer: answerIndex,
          isAnswered: true,
          isCorrect,
          timeSpent: Math.floor(Math.random() * 120) + 30 // Simulando tempo
        };
      }
      return q;
    }));
    setShowExplanation(true);
  };

  // Função para favoritar
  const toggleFavorite = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, isFavorite: !q.isFavorite } : q
    ));
  };

  // Função para selecionar/deselecionar questão
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Função para criar caderno
  const handleCreateNotebook = () => {
    if (selectedQuestions.length === 0 || !notebookName.trim()) {
      return;
    }

    const newNotebook: StudySession = {
      id: Date.now().toString(),
      name: notebookName,
      questionsIds: selectedQuestions,
      createdAt: new Date().toISOString(),
      progress: 0
    };

    toast.success(`CADERNO TÁTICO "${notebookName}" CRIADO!`, {
      description: `${selectedQuestions.length} questões selecionadas para treinamento`,
      icon: '🎯'
    });
    
    // Reset
    setNotebookName('');
    setNotebookDescription('');
    setSelectedQuestions([]);
    setShowCreateNotebook(false);
  };

  // Filtrar questões
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedFilters.subjects.length === 0 || selectedFilters.subjects.includes(q.subject);
    const matchesExam = selectedFilters.exams.length === 0 || selectedFilters.exams.includes(q.exam);
    const matchesDifficulty = selectedFilters.difficulties.length === 0 || selectedFilters.difficulties.includes(q.difficulty);
    
    let matchesAnswered = true;
    if (selectedFilters.answered === 'answered') matchesAnswered = q.isAnswered === true;
    if (selectedFilters.answered === 'unanswered') matchesAnswered = !q.isAnswered;
    
    let matchesPerformance = true;
    if (selectedFilters.performance === 'correct') matchesPerformance = q.isCorrect === true;
    if (selectedFilters.performance === 'incorrect') matchesPerformance = q.isCorrect === false;
    
    return matchesSearch && matchesSubject && matchesExam && matchesDifficulty && matchesAnswered && matchesPerformance;
  });

  // Componente de questão
  const QuestionCard = ({ question }: { question: Question }) => (
    <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-accent-500/50 transition-all relative overflow-hidden">
      {/* Tactical stripe */}
      <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
      <CardContent className="p-6">
        {/* Header da questão */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Checkbox para seleção */}
            <input
              type="checkbox"
              checked={selectedQuestions.includes(question.id)}
              onChange={() => toggleQuestionSelection(question.id)}
              className="mt-1 w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="font-police-body border-accent-500 text-accent-500">
                  {question.subject}
                </Badge>
                <Badge 
                  className={cn(
                    "font-police-subtitle tracking-wider border-2 border-current",
                    question.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                    question.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                    question.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  )}
                >
                  {question.difficulty}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                  {question.exam} • {question.year}
                </span>
              </div>
              
              {question.topic && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-police-body">
                  {question.topic} {question.subtopic && `> ${question.subtopic}`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {question.isAnswered && (
              question.isCorrect ? (
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              )
            )}
            <button
              onClick={() => toggleFavorite(question.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Star 
                className={cn(
                  "w-5 h-5",
                  question.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                )}
              />
            </button>
          </div>
        </div>

        {/* Enunciado */}
        <p className="text-gray-900 dark:text-white mb-4 font-medium font-police-body">
          {question.question}
        </p>

        {/* Opções */}
        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(question.id, index)}
              disabled={question.isAnswered}
              className={cn(
                "w-full text-left p-3 rounded-lg border-2 transition-all",
                !question.isAnswered && "hover:border-accent-500/50 hover:bg-accent-500/5 dark:hover:bg-accent-500/10",
                question.isAnswered && index === question.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                question.isAnswered && index === question.userAnswer && index !== question.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20",
                !question.isAnswered && "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700 dark:text-gray-300 font-police-subtitle">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className={cn(
                  "font-police-body",
                  question.isAnswered && index === question.correctAnswer && "text-green-700 dark:text-green-400 font-medium",
                  question.isAnswered && index === question.userAnswer && index !== question.correctAnswer && "text-red-700 dark:text-red-400",
                  !question.isAnswered && "text-gray-800 dark:text-gray-200"
                )}>
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Explicação */}
        {question.isAnswered && showExplanation && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1 font-police-subtitle uppercase tracking-wider">BRIEFING TÁTICO:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-police-body">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estatísticas e ações */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1 font-police-body">
              <BarChart3 className="w-4 h-4 text-accent-500" />
              <span className="font-police-numbers">{Math.round((question.stats.correctAttempts / question.stats.totalAttempts) * 100)}%</span> PRECISÃO
            </span>
            <span className="flex items-center gap-1 font-police-body">
              <Clock className="w-4 h-4 text-accent-500" />
              <span className="font-police-numbers">{question.stats.avgTime}s</span> TEMPO MÉDIO
            </span>
            {question.timeSpent && (
              <span className="flex items-center gap-1 font-police-body">
                <Target className="w-4 h-4 text-accent-500" />
                SEU TEMPO: <span className="font-police-numbers">{question.timeSpent}s</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {question.isAnswered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="gap-1 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
              >
                {showExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showExplanation ? 'OCULTAR' : 'VER'} BRIEFING
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500">
              <MessageSquare className="w-4 h-4" />
              RELATÓRIOS
            </Button>
          </div>
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-police-body">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full relative">
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
        className="relative"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
              ARSENAL DE QUESTÕES TÁTICAS
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
              TREINAMENTO OPERACIONAL COM QUESTÕES DE COMBATE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-police-numbers border-2 border-accent-500 text-accent-500">
              <FileQuestion className="w-5 h-5 mr-2" />
              {generalStats.totalQuestions.toLocaleString()} ALVOS DISPONÍVEIS
            </Badge>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    ALVOS ELIMINADOS
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {generalStats.answeredQuestions.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    TAXA DE PRECISÃO
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {generalStats.averageAccuracy}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    TEMPO OPERACIONAL
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {Math.floor(generalStats.totalTime / 60)}h
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    SETOR FORTE
                  </p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400 font-police-body uppercase">
                    {generalStats.strongSubjects[0]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    REFORÇO NECESSÁRIO
                  </p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400 font-police-body uppercase">
                    {generalStats.weakSubjects[0]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de ações */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="BUSCAR QUESTÕES POR PALAVRA-CHAVE, ASSUNTO OU TAG..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              <Filter className="w-4 h-4" />
              FILTROS TÁTICOS
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            <Button 
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
              onClick={() => setShowCreateNotebook(true)}
              disabled={selectedQuestions.length === 0}
            >
              <Plus className="w-4 h-4" />
              CRIAR ARSENAL {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}
            </Button>
          </div>
        </div>

        {/* Filtros expandidos */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                        DISCIPLINA TÁTICA
                      </label>
                      <select 
                        className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          subjects: e.target.value === 'Todos' ? [] : [e.target.value]
                        }))}
                      >
                        {subjects.map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                        COMANDO DE PROVA
                      </label>
                      <select 
                        className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          exams: e.target.value === 'Todos' ? [] : [e.target.value]
                        }))}
                      >
                        {exams.map(exam => (
                          <option key={exam} value={exam}>{exam}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                        ANO OPERACIONAL
                      </label>
                      <select className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors">
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                        NÍVEL TÁTICO
                      </label>
                      <select 
                        className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          difficulties: e.target.value === 'Todas' ? [] : [e.target.value]
                        }))}
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                        STATUS OPERACIONAL
                      </label>
                      <select 
                        className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          answered: e.target.value as any
                        }))}
                      >
                        <option value="all">TODAS AS OPERAÇÕES</option>
                        <option value="answered">EXECUTADAS</option>
                        <option value="unanswered">PENDENTES</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="font-police-numbers border-2 border-accent-500 text-accent-500">
                        {filteredQuestions.length} ALVOS LOCALIZADOS
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFilters({
                        subjects: [],
                        topics: [],
                        exams: [],
                        years: [],
                        difficulties: [],
                        answered: 'all',
                        performance: 'all'
                      })}
                      className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                    >
                      LIMPAR FILTROS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Indicador de seleção */}
      {selectedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-accent-500/10 border-2 border-accent-500/50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent-500" />
            <span className="text-gray-700 dark:text-gray-300 font-medium font-police-body uppercase tracking-wider">
              {selectedQuestions.length} ALVO(S) SELECIONADO(S)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedQuestions([])}
              className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              LIMPAR SELEÇÃO
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateNotebook(true)}
              className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
            >
              CRIAR ARSENAL
            </Button>
          </div>
        </motion.div>
      )}

      {/* Lista de questões */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        ) : (
          <Card className="p-12 text-center border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
            <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
              NENHUMA QUESTÃO LOCALIZADA
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body uppercase tracking-wider">
              AJUSTE OS FILTROS TÁTICOS OU REFINE A BUSCA
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setShowFilters(false);
              }}
              className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              LIMPAR BUSCA
            </Button>
          </Card>
        )}
      </div>

      {/* Modal de Criar Arsenal */}
      <AnimatePresence>
        {showCreateNotebook && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCreateNotebook(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-auto border-2 border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
                  CRIAR NOVO ARSENAL TÁTICO
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 font-police-body uppercase tracking-wider">
                  ORGANIZE SEUS ALVOS EM UM ARSENAL PERSONALIZADO
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Nome do caderno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    NOME DO ARSENAL
                  </label>
                  <input
                    type="text"
                    placeholder="EX: ARSENAL CONSTITUCIONAL - CF/88"
                    value={notebookName}
                    onChange={(e) => setNotebookName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors"
                  />
                </div>
                
                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    BRIEFING (OPCIONAL)
                  </label>
                  <textarea
                    placeholder="DESCREVA O OBJETIVO DESTA OPERAÇÃO..."
                    value={notebookDescription}
                    onChange={(e) => setNotebookDescription(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors min-h-[80px]"
                  />
                </div>
                
                {/* Resumo das questões selecionadas */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 font-police-subtitle uppercase tracking-wider">
                    ALVOS SELECIONADOS ({selectedQuestions.length})
                  </h3>
                  
                  {/* Estatísticas das questões selecionadas */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-500 font-police-numbers">
                        {selectedQuestions.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TOTAL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-police-numbers">
                        {(() => {
                          const subjects = new Set(
                            questions
                              .filter(q => selectedQuestions.includes(q.id))
                              .map(q => q.subject)
                          );
                          return subjects.size;
                        })()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">DISCIPLINAS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-police-numbers">
                        {Math.round(
                          questions
                            .filter(q => selectedQuestions.includes(q.id))
                            .reduce((acc, q) => acc + q.stats.avgTime, 0) / 60
                        )}min
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TEMPO ESTIMADO</div>
                    </div>
                  </div>
                  
                  {/* Lista de questões selecionadas */}
                  <div className="relative">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-900">
                    {selectedQuestions.length > 0 ? (
                      <div className="space-y-2">
                        {questions
                          .filter(q => selectedQuestions.includes(q.id))
                          .map((q, idx) => (
                            <div key={q.id} className="flex items-start gap-2 text-sm pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                              <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[20px] font-police-numbers">{idx + 1}.</span>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs font-police-body border-accent-500 text-accent-500">
                                    {q.subject}
                                  </Badge>
                                  <Badge 
                                    className={cn(
                                      "text-xs font-police-subtitle tracking-wider border-2 border-current",
                                      q.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                                      q.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                                      q.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                    )}
                                  >
                                    {q.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 font-police-body">
                                  {q.question}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-police-body uppercase tracking-wider">
                        NENHUM ALVO SELECIONADO
                      </p>
                    )}
                    </div>
                    {selectedQuestions.length > 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800 to-transparent pointer-events-none rounded-b-lg" />
                    )}
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                    onClick={handleCreateNotebook}
                    disabled={!notebookName.trim()}
                  >
                    <BookMarked className="w-4 h-4 mr-2" />
                    CRIAR ARSENAL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateNotebook(false);
                      setNotebookName('');
                      setNotebookDescription('');
                    }}
                    className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                  >
                    CANCELAR
                  </Button>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white text-center relative overflow-hidden"
      >
        {/* Tactical stripes */}
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-500" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-accent-500" />
        
        <Brain className="w-12 h-12 mx-auto mb-4 text-accent-500" />
        <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-ultra-wide">
          MANTENHA O TREINAMENTO!
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body uppercase tracking-wider">
          INTENSIFIQUE SEU TREINAMENTO TÁTICO. CRIE CADERNOS PERSONALIZADOS PARA OPERAÇÕES ESPECÍFICAS.
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
          >
            <Zap className="w-5 h-5 mr-2" />
            MODO INTENSIVO
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-black font-police-body uppercase tracking-wider"
          >
            <Award className="w-5 h-5 mr-2" />
            VER RANKING
          </Button>
        </div>
      </motion.div>
    </div>
  );
}