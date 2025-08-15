import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  Star,
  Heart,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Play,
  BarChart3,
  Target,
  Brain,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface MockExam {
  id: string;
  title: string;
  organization: string;
  category: string;
  subcategory: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  isActive: boolean;
  attempts: number;
  avgScore: number;
  passingScore: number;
  subjects: ExamSubject[];
  tags: string[];
  type: 'Oficial' | 'Personalizado' | 'Gerado';
  description: string;
  userProgress?: UserProgress;
  estimatedTime: string;
  maxAttempts?: number;
  isCompleted?: boolean;
  lastAttemptDate?: string;
  bestScore?: number;
  timesTaken?: number;
}

interface ExamSubject {
  id: string;
  name: string;
  questionsCount: number;
  weight: number;
  color: string;
}

interface UserProgress {
  bestScore: number;
  attempts: number;
  lastAttemptDate: string;
  timeSpent: number;
  isCompleted: boolean;
}

interface UserStats {
  totalAttempts: number;
  averageScore: number;
  timeSpent: number;
  simulacoesConcluidos: number;
  melhorNota: number;
  simulacoesFavoritos: number;
}

const mockExams: MockExam[] = [
  {
    id: '1',
    title: 'Simulado Polícia Federal - Agente 2024',
    organization: 'Polícia Federal',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Federal',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Muito Difícil',
    isActive: true,
    attempts: 1250,
    avgScore: 58.5,
    passingScore: 60,
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 30, weight: 25, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 25, weight: 20, color: 'bg-green-500' },
      { id: '3', name: 'Direito Penal', questionsCount: 35, weight: 30, color: 'bg-red-500' },
      { id: '4', name: 'Português', questionsCount: 20, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Raciocínio Lógico', questionsCount: 10, weight: 10, color: 'bg-purple-500' }
    ],
    tags: ['agente', 'pf', '2024', 'cespe'],
    type: 'Oficial',
    description: 'Simulado baseado no concurso da Polícia Federal para Agente de 2024, com questões elaboradas por especialistas.',
    estimatedTime: '4h',
    maxAttempts: 3,
    userProgress: {
      bestScore: 72.5,
      attempts: 2,
      lastAttemptDate: '2024-07-28',
      timeSpent: 480,
      isCompleted: true
    }
  },
  {
    id: '2',
    title: 'Simulado PRF - Policial Rodoviário Federal',
    organization: 'Polícia Rodoviária Federal',
    category: 'Concursos Policiais',
    subcategory: 'PRF',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Difícil',
    isActive: true,
    attempts: 980,
    avgScore: 52.3,
    passingScore: 60,
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 25, weight: 20, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 25, weight: 20, color: 'bg-green-500' },
      { id: '3', name: 'Legislação de Trânsito', questionsCount: 40, weight: 35, color: 'bg-orange-500' },
      { id: '4', name: 'Português', questionsCount: 20, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Matemática', questionsCount: 10, weight: 10, color: 'bg-purple-500' }
    ],
    tags: ['prf', 'policial-rodoviário', 'trânsito'],
    type: 'Oficial',
    description: 'Simulado completo para PRF com foco em legislação de trânsito e conhecimentos específicos.',
    estimatedTime: '4h',
    userProgress: {
      bestScore: 65.2,
      attempts: 1,
      lastAttemptDate: '2024-07-15',
      timeSpent: 230,
      isCompleted: true
    }
  },
  {
    id: '3',
    title: 'Simulado Polícia Civil SP - Escrivão',
    organization: 'Polícia Civil SP',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Civil',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    difficulty: 'Médio',
    isActive: true,
    attempts: 650,
    avgScore: 61.2,
    passingScore: 55,
    subjects: [
      { id: '1', name: 'Direito Penal', questionsCount: 30, weight: 30, color: 'bg-red-500' },
      { id: '2', name: 'Direito Processual Penal', questionsCount: 25, weight: 25, color: 'bg-red-600' },
      { id: '3', name: 'Direito Constitucional', questionsCount: 20, weight: 20, color: 'bg-blue-500' },
      { id: '4', name: 'Português', questionsCount: 15, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Noções de Informática', questionsCount: 10, weight: 10, color: 'bg-gray-500' }
    ],
    tags: ['pc-sp', 'escrivão', 'vunesp'],
    type: 'Personalizado',
    description: 'Simulado personalizado para Escrivão da PC-SP com questões atualizadas.',
    estimatedTime: '3h',
    userProgress: undefined
  },
  {
    id: '4',
    title: 'Simulado PM-SP - Soldado 2ª Classe',
    organization: 'Polícia Militar SP',
    category: 'Concursos Militares',
    subcategory: 'PM-SP',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    difficulty: 'Médio',
    isActive: true,
    attempts: 420,
    avgScore: 59.8,
    passingScore: 50,
    subjects: [
      { id: '1', name: 'Português', questionsCount: 30, weight: 30, color: 'bg-yellow-500' },
      { id: '2', name: 'Matemática', questionsCount: 30, weight: 30, color: 'bg-purple-500' },
      { id: '3', name: 'História do Brasil', questionsCount: 20, weight: 20, color: 'bg-brown-500' },
      { id: '4', name: 'Geografia do Brasil', questionsCount: 20, weight: 20, color: 'bg-green-600' }
    ],
    tags: ['pm-sp', 'soldado', 'militar'],
    type: 'Gerado',
    description: 'Simulado gerado automaticamente baseado em provas anteriores da PM-SP.',
    estimatedTime: '3h'
  }
];

const userStats: UserStats = {
  totalAttempts: 15,
  averageScore: 67.3,
  timeSpent: 2850, // em minutos
  simulacoesConcluidos: 8,
  melhorNota: 85.2,
  simulacoesFavoritos: 3
};

export default function MockExamsImproved() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const filteredExams = mockExams.filter(exam => {
    const statusMatch = selectedStatus === '' || 
      (selectedStatus === 'completed' && exam.userProgress?.isCompleted) ||
      (selectedStatus === 'not-completed' && !exam.userProgress?.isCompleted) ||
      (selectedStatus === 'not-started' && !exam.userProgress);

    return (
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || exam.category === selectedCategory) &&
      (selectedDifficulty === '' || exam.difficulty === selectedDifficulty) &&
      statusMatch &&
      (selectedType === '' || exam.type === selectedType) &&
      exam.isActive
    );
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Difícil': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Muito Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Oficial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Personalizado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Gerado': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getProgressColor = (score: number, passingScore: number) => {
    if (score >= passingScore + 20) return 'text-green-600';
    if (score >= passingScore) return 'text-blue-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const startExam = (examId: string) => {
    navigate(`/simulations/mock/${examId}/take`);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Simulados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pratique com simulados realistas e melhore seu desempenho
        </p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Tentativas</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Média</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Tempo</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(userStats.timeSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Concluídos</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.simulacoesConcluidos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Melhor Nota</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.melhorNota.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Favoritos</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{userStats.simulacoesFavoritos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar simulados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as Categorias</option>
              <option value="Concursos Policiais">Concursos Policiais</option>
              <option value="Concursos Militares">Concursos Militares</option>
              <option value="Concursos Federais">Concursos Federais</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as Dificuldades</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
              <option value="Muito Difícil">Muito Difícil</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os Status</option>
              <option value="not-started">Não Iniciados</option>
              <option value="not-completed">Em Andamento</option>
              <option value="completed">Concluídos</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os Tipos</option>
              <option value="Oficial">Oficial</option>
              <option value="Personalizado">Personalizado</option>
              <option value="Gerado">Gerado</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 h-10 px-3 rounded-md font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 h-10 px-3 rounded-md font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {exam.organization}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                        {exam.difficulty}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(exam.type)}`}>
                        {exam.type}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {exam.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Questões:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.totalQuestions}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Tempo:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.estimatedTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Nota de Corte:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.passingScore}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Média Geral:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.avgScore.toFixed(1)}%</div>
                  </div>
                </div>

                {exam.userProgress && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Seu Progresso</span>
                      <span className={`text-sm font-bold ${getProgressColor(exam.userProgress.bestScore, exam.passingScore)}`}>
                        {exam.userProgress.bestScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.userProgress.attempts} tentativa(s) • Última: {new Date(exam.userProgress.lastAttemptDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {expandedExam === exam.id ? 'Ocultar detalhes' : 'Ver matérias'}
                  </button>
                  <button
                    onClick={() => startExam(exam.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md transition-colors font-medium"
                  >
                    {exam.userProgress ? 'Continuar' : 'Iniciar'}
                  </button>
                </div>
              </div>

              {expandedExam === exam.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Distribuição de Matérias
                  </h4>
                  <div className="space-y-2">
                    {exam.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${subject.color}`}></div>
                          <span className="text-gray-900 dark:text-white">{subject.name}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {subject.questionsCount} ({subject.weight}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum simulado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tente ajustar seus filtros para encontrar simulados.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Simulado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Questões/Tempo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Seu Progresso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Média Geral
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exam.organization}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                            {exam.difficulty}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(exam.type)}`}>
                            {exam.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.totalQuestions} questões
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.estimatedTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {exam.userProgress ? (
                        <div>
                          <div className={`text-sm font-bold ${getProgressColor(exam.userProgress.bestScore, exam.passingScore)}`}>
                            {exam.userProgress.bestScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {exam.userProgress.attempts} tentativa(s)
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Não iniciado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.avgScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {exam.attempts.toLocaleString()} tentativas
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                          className="bg-gray-500 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded transition-colors"
                        >
                          {expandedExam === exam.id ? 'Ocultar' : 'Detalhes'}
                        </button>
                        <button
                          onClick={() => startExam(exam.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
                        >
                          {exam.userProgress ? 'Continuar' : 'Iniciar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum simulado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tente ajustar seus filtros para encontrar simulados.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}