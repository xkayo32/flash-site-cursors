import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  FileQuestion,
  Play,
  Users,
  Star,
  Filter,
  Search,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Target,
  Brain,
  Zap,
  BookOpen,
  Settings,
  Timer,
  PauseCircle,
  SkipForward,
  Flag,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';

// Tipos
interface MockExam {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  questions: number;
  duration: number; // em minutos
  attempts: number;
  averageScore: number;
  participants: number;
  tags: string[];
  image: string;
  lastAttempt?: {
    score: number;
    completedAt: string;
    timeSpent: number;
  };
  isNew?: boolean;
  isPremium?: boolean;
}

interface ExamAttempt {
  id: string;
  examId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  ranking: number;
}

// Dados mockados dos simulados
const mockExams: MockExam[] = [
  {
    id: '1',
    title: 'Polícia Federal 2024 - Simulado Completo',
    description: 'Simulado completo baseado no último edital da PF com questões de todas as disciplinas',
    category: 'Polícia Federal',
    difficulty: 'Difícil',
    questions: 120,
    duration: 180,
    attempts: 15420,
    averageScore: 72.5,
    participants: 8743,
    tags: ['Direito Constitucional', 'Direito Penal', 'Informática', 'Português'],
    image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=250&fit=crop',
    lastAttempt: {
      score: 78,
      completedAt: '2024-01-15',
      timeSpent: 165
    },
    isNew: true
  },
  {
    id: '2',
    title: 'Receita Federal - Auditor Fiscal',
    description: 'Simulado focado nas disciplinas específicas do cargo de Auditor Fiscal',
    category: 'Receita Federal',
    difficulty: 'Difícil',
    questions: 100,
    duration: 240,
    attempts: 12850,
    averageScore: 68.2,
    participants: 6421,
    tags: ['Direito Tributário', 'Contabilidade', 'AFO', 'Economia'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    isPremium: true
  },
  {
    id: '3',
    title: 'TRT - Analista Judiciário (Rápido)',
    description: 'Simulado express para treinar agilidade e gestão de tempo',
    category: 'Tribunais',
    difficulty: 'Médio',
    questions: 50,
    duration: 90,
    attempts: 9764,
    averageScore: 75.8,
    participants: 5234,
    tags: ['Direito do Trabalho', 'Direito Processual', 'Português'],
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop'
  },
  {
    id: '4',
    title: 'Banco do Brasil - Escriturário',
    description: 'Simulado completo com foco em conhecimentos bancários e atualidades',
    category: 'Bancários',
    difficulty: 'Médio',
    questions: 80,
    duration: 120,
    attempts: 18650,
    averageScore: 79.3,
    participants: 12456,
    tags: ['Conhecimentos Bancários', 'Matemática Financeira', 'Atualidades'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop',
    lastAttempt: {
      score: 85,
      completedAt: '2024-01-12',
      timeSpent: 95
    }
  },
  {
    id: '5',
    title: 'INSS - Técnico do Seguro Social',
    description: 'Simulado baseado em provas anteriores com questões atualizadas',
    category: 'Previdência',
    difficulty: 'Fácil',
    questions: 60,
    duration: 150,
    attempts: 22340,
    averageScore: 81.7,
    participants: 15678,
    tags: ['Direito Previdenciário', 'Ética', 'Informática'],
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=250&fit=crop'
  },
  {
    id: '6',
    title: 'TCU - Auditor Federal (Premium)',
    description: 'Simulado exclusivo com questões inéditas e nível de dificuldade elevado',
    category: 'Controle',
    difficulty: 'Difícil',
    questions: 110,
    duration: 300,
    attempts: 5420,
    averageScore: 63.4,
    participants: 2876,
    tags: ['Controle Externo', 'AFO', 'Auditoria', 'Direito Administrativo'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    isPremium: true,
    isNew: true
  }
];

// Histórico de tentativas do usuário
const mockAttempts: ExamAttempt[] = [
  {
    id: '1',
    examId: '1',
    score: 78,
    correctAnswers: 94,
    totalQuestions: 120,
    timeSpent: 165,
    completedAt: '2024-01-15',
    ranking: 1247
  },
  {
    id: '2',
    examId: '4',
    score: 85,
    correctAnswers: 68,
    totalQuestions: 80,
    timeSpent: 95,
    completedAt: '2024-01-12',
    ranking: 856
  },
  {
    id: '3',
    examId: '1',
    score: 72,
    correctAnswers: 86,
    totalQuestions: 120,
    timeSpent: 175,
    completedAt: '2024-01-08',
    ranking: 2341
  }
];

// Estatísticas gerais
const examStats = {
  totalAttempts: 45,
  averageScore: 76.3,
  bestScore: 89,
  totalTimeSpent: 3420, // em minutos
  bestRanking: 245,
  completionRate: 92
};

export default function SimuladosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'history' | 'statistics'>('available');

  // Filtrar simulados
  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exam.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', ...new Set(mockExams.map(exam => exam.category))];
  const difficulties = ['all', 'Fácil', 'Médio', 'Difícil'];

  const ExamCard = ({ exam }: { exam: MockExam }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Header da imagem */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={exam.image}
            alt={exam.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {exam.isNew && (
              <Badge className="bg-green-500 text-white border-0">
                NOVO
              </Badge>
            )}
            {exam.isPremium && (
              <Badge className="bg-amber-500 text-white border-0">
                PREMIUM
              </Badge>
            )}
          </div>

          {/* Dificuldade */}
          <div className="absolute top-4 right-4">
            <Badge 
              className={cn(
                "border-0",
                exam.difficulty === 'Fácil' && "bg-green-500 text-white",
                exam.difficulty === 'Médio' && "bg-yellow-500 text-white",
                exam.difficulty === 'Difícil' && "bg-red-500 text-white"
              )}
            >
              {exam.difficulty}
            </Badge>
          </div>

          {/* Info na parte inferior */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  <span>{exam.questions} questões</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{exam.duration}min</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{exam.averageScore.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Categoria */}
          <Badge variant="secondary" className="mb-3">
            {exam.category}
          </Badge>

          {/* Título e descrição */}
          <h3 className="font-bold text-lg text-primary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {exam.title}
          </h3>
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {exam.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {exam.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {exam.tags.length > 3 && (
              <span className="text-xs text-primary-500">
                +{exam.tags.length - 3} mais
              </span>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1 text-primary-600">
              <Users className="w-4 h-4" />
              <span>{exam.participants.toLocaleString()} participantes</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <TrendingUp className="w-4 h-4" />
              <span>{exam.attempts.toLocaleString()} tentativas</span>
            </div>
          </div>

          {/* Última tentativa ou ação */}
          {exam.lastAttempt ? (
            <div className="bg-primary-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    Última tentativa: {exam.lastAttempt.score}%
                  </p>
                  <p className="text-xs text-primary-600">
                    {new Date(exam.lastAttempt.completedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          ) : (
            <div className="bg-accent-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-accent-700 text-center">
                Ainda não realizado
              </p>
            </div>
          )}

          {/* Botão de ação */}
          <Link to={`/simulations/${exam.id}/take`}>
            <Button className="w-full gap-2">
              <Play className="w-4 h-4" />
              {exam.lastAttempt ? 'Tentar novamente' : 'Iniciar simulado'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AttemptHistoryItem = ({ attempt }: { attempt: ExamAttempt }) => {
    const exam = mockExams.find(e => e.id === attempt.examId);
    if (!exam) return null;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-primary-900 mb-1">{exam.title}</h4>
              <div className="flex items-center gap-4 text-sm text-primary-600">
                <span>Pontuação: {attempt.score}%</span>
                <span>Acertos: {attempt.correctAnswers}/{attempt.totalQuestions}</span>
                <span>Tempo: {Math.floor(attempt.timeSpent / 60)}h {attempt.timeSpent % 60}min</span>
                <span>Ranking: #{attempt.ranking}</span>
              </div>
              <p className="text-xs text-primary-500 mt-1">
                Realizado em {new Date(attempt.completedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={cn(
                  attempt.score >= 80 ? "bg-green-100 text-green-700" :
                  attempt.score >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}
              >
                {attempt.score >= 80 ? 'Excelente' : attempt.score >= 60 ? 'Bom' : 'Regular'}
              </Badge>
              <Button size="sm" variant="outline">
                Ver detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatisticsCard = ({ icon: Icon, title, value, subtitle, color = "primary" }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-600">{title}</p>
            <p className="text-2xl font-bold text-primary-900">{value}</p>
            {subtitle && <p className="text-xs text-primary-500">{subtitle}</p>}
          </div>
          <Icon className={cn("w-8 h-8", `text-${color}-500`)} />
        </div>
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
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Simulados</h1>
            <p className="text-primary-600">
              Teste seus conhecimentos em condições reais de prova
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-5 h-5 mr-2" />
              {mockExams.length} simulados disponíveis
            </Badge>
          </div>
        </div>

        {/* Tabs de navegação */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'available', label: 'Disponíveis', icon: Trophy },
            { key: 'history', label: 'Histórico', icon: Calendar },
            { key: 'statistics', label: 'Estatísticas', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  activeTab === tab.key 
                    ? "bg-primary-600 text-white shadow-lg" 
                    : "bg-white text-primary-600 hover:bg-primary-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Conteúdo baseado na tab ativa */}
      {activeTab === 'available' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Filtros e busca */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Buscar simulados por título, categoria ou palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Todas as dificuldades</option>
                  {difficulties.slice(1).map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de simulados */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Nenhum simulado encontrado
              </h3>
              <p className="text-primary-600 mb-4">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearchTerm('');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Histórico de Tentativas</h2>
            <p className="text-primary-600">
              Acompanhe seu progresso e revise suas tentativas anteriores
            </p>
          </div>

          {mockAttempts.length > 0 ? (
            <div>
              {mockAttempts.map((attempt) => (
                <AttemptHistoryItem key={attempt.id} attempt={attempt} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Nenhuma tentativa ainda
              </h3>
              <p className="text-primary-600 mb-6">
                Comece realizando seu primeiro simulado!
              </p>
              <Button onClick={() => setActiveTab('available')}>
                Ver simulados disponíveis
              </Button>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === 'statistics' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Estatísticas Gerais</h2>
            <p className="text-primary-600">
              Acompanhe seu desempenho e evolução nos simulados
            </p>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatisticsCard
              icon={Trophy}
              title="Total de tentativas"
              value={examStats.totalAttempts}
              color="primary"
            />
            <StatisticsCard
              icon={Target}
              title="Pontuação média"
              value={`${examStats.averageScore}%`}
              color="accent"
            />
            <StatisticsCard
              icon={Award}
              title="Melhor pontuação"
              value={`${examStats.bestScore}%`}
              color="green"
            />
            <StatisticsCard
              icon={Clock}
              title="Tempo total estudado"
              value={`${Math.floor(examStats.totalTimeSpent / 60)}h`}
              subtitle={`${examStats.totalTimeSpent % 60}min adicionais`}
              color="blue"
            />
            <StatisticsCard
              icon={TrendingUp}
              title="Melhor ranking"
              value={`#${examStats.bestRanking}`}
              color="purple"
            />
            <StatisticsCard
              icon={CheckCircle}
              title="Taxa de conclusão"
              value={`${examStats.completionRate}%`}
              color="green"
            />
          </div>

          {/* Gráfico de evolução (placeholder) */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-primary-900">Evolução do Desempenho</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-primary-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-primary-400 mx-auto mb-2" />
                  <p className="text-primary-600">Gráfico de evolução em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Zap className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2">
          Pronto para o desafio?
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Teste seus conhecimentos com nossos simulados e aumente suas chances de aprovação!
        </p>
        <Button variant="secondary" size="lg" onClick={() => setActiveTab('available')}>
          Começar agora
        </Button>
      </motion.div>
    </div>
  );
}