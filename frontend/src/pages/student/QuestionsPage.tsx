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
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header da questão */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{question.subject}</Badge>
              <Badge 
                className={cn(
                  question.difficulty === 'Fácil' && "bg-green-100 text-green-700",
                  question.difficulty === 'Médio' && "bg-yellow-100 text-yellow-700",
                  question.difficulty === 'Difícil' && "bg-red-100 text-red-700"
                )}
              >
                {question.difficulty}
              </Badge>
              <span className="text-sm text-primary-600">
                {question.exam} • {question.year}
              </span>
            </div>
            
            {question.topic && (
              <p className="text-sm text-primary-600 mb-2">
                {question.topic} {question.subtopic && `> ${question.subtopic}`}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {question.isAnswered && (
              question.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )
            )}
            <button
              onClick={() => toggleFavorite(question.id)}
              className="p-1 hover:bg-gray-100 rounded"
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
        <p className="text-primary-900 mb-4 font-medium">
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
                !question.isAnswered && "hover:border-primary-300 hover:bg-primary-50",
                question.isAnswered && index === question.correctAnswer && "border-green-500 bg-green-50",
                question.isAnswered && index === question.userAnswer && index !== question.correctAnswer && "border-red-500 bg-red-50",
                !question.isAnswered && "border-gray-200"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-primary-700">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className={cn(
                  question.isAnswered && index === question.correctAnswer && "text-green-700 font-medium",
                  question.isAnswered && index === question.userAnswer && index !== question.correctAnswer && "text-red-700"
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
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Explicação:</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Estatísticas e ações */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-primary-600">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              {Math.round((question.stats.correctAttempts / question.stats.totalAttempts) * 100)}% acertos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {question.stats.avgTime}s média
            </span>
            {question.timeSpent && (
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Você: {question.timeSpent}s
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {question.isAnswered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="gap-1"
              >
                {showExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showExplanation ? 'Ocultar' : 'Ver'} explicação
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1">
              <MessageSquare className="w-4 h-4" />
              Comentários
            </Button>
          </div>
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Banco de Questões</h1>
            <p className="text-primary-600">
              Pratique com questões de provas anteriores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <FileQuestion className="w-5 h-5 mr-2" />
              {generalStats.totalQuestions.toLocaleString()} questões
            </Badge>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Respondidas</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {generalStats.answeredQuestions.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Taxa de acerto</p>
                  <p className="text-2xl font-bold text-primary-900">{generalStats.averageAccuracy}%</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Tempo total</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {Math.floor(generalStats.totalTime / 60)}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Matéria forte</p>
                  <p className="text-sm font-bold text-green-600">
                    {generalStats.strongSubjects[0]}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Precisa revisar</p>
                  <p className="text-sm font-bold text-red-600">
                    {generalStats.weakSubjects[0]}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de ações */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input
                type="text"
                placeholder="Buscar questões por palavra-chave, assunto ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Caderno
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
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Matéria
                      </label>
                      <select 
                        className="w-full p-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Banca
                      </label>
                      <select 
                        className="w-full p-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Ano
                      </label>
                      <select className="w-full p-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Dificuldade
                      </label>
                      <select 
                        className="w-full p-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Status
                      </label>
                      <select 
                        className="w-full p-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          answered: e.target.value as any
                        }))}
                      >
                        <option value="all">Todas</option>
                        <option value="answered">Respondidas</option>
                        <option value="unanswered">Não respondidas</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {filteredQuestions.length} questões encontradas
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
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lista de questões */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <FileQuestion className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">
              Nenhuma questão encontrada
            </h3>
            <p className="text-primary-600 mb-6">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setShowFilters(false);
            }}>
              Limpar busca
            </Button>
          </Card>
        )}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Brain className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2">
          Continue praticando!
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Quanto mais questões você resolve, melhor fica sua preparação. Crie cadernos personalizados para focar nas suas necessidades.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Modo Intensivo
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-primary-700"
          >
            <Award className="w-5 h-5 mr-2" />
            Ver Ranking
          </Button>
        </div>
      </motion.div>
    </div>
  );
}