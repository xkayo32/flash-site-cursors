import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Clock,
  Award,
  Building,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  AlertCircle,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  Hash,
  Timer,
  GraduationCap,
  Play,
  Heart,
  Share2,
  Bookmark,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface PreviousExam {
  id: string;
  title: string;
  examBoard: string;
  year: number;
  position: string;
  level: string;
  totalQuestions: number;
  duration: string;
  passingScore: number;
  candidates: number;
  approvalRate: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  subjects: Subject[];
  tags: string[];
  downloadCount: number;
  averageScore?: number;
  solvedBy?: number;
  isFavorite?: boolean;
  pdfUrl?: string;
  gabarito?: string;
  userProgress?: UserProgress;
}

interface Subject {
  name: string;
  questions: number;
  percentage: number;
}

interface UserProgress {
  attempted: boolean;
  score?: number;
  completedAt?: string;
  timeSpent?: number;
  ranking?: number;
}

interface Filters {
  year: string;
  examBoard: string;
  difficulty: string;
  level: string;
  solved: string;
}

// Dados mockados
const mockExams: PreviousExam[] = [
  {
    id: '1',
    title: 'Polícia Federal - Agente',
    examBoard: 'CEBRASPE',
    year: 2023,
    position: 'Agente de Polícia Federal',
    level: 'Superior',
    totalQuestions: 120,
    duration: '4h30min',
    passingScore: 60,
    candidates: 45320,
    approvalRate: 2.8,
    difficulty: 'Muito Difícil',
    subjects: [
      { name: 'Direito Constitucional', questions: 15, percentage: 12.5 },
      { name: 'Direito Penal', questions: 20, percentage: 16.7 },
      { name: 'Direito Administrativo', questions: 15, percentage: 12.5 },
      { name: 'Informática', questions: 10, percentage: 8.3 },
      { name: 'Português', questions: 20, percentage: 16.7 },
      { name: 'Raciocínio Lógico', questions: 15, percentage: 12.5 },
      { name: 'Atualidades', questions: 10, percentage: 8.3 },
      { name: 'Legislação Especial', questions: 15, percentage: 12.5 }
    ],
    tags: ['PF', 'Federal', 'Polícia', 'Agente'],
    downloadCount: 15234,
    averageScore: 68.5,
    solvedBy: 3456,
    isFavorite: true,
    userProgress: {
      attempted: true,
      score: 78.5,
      completedAt: '2024-01-15',
      timeSpent: 240,
      ranking: 127
    }
  },
  {
    id: '2',
    title: 'Polícia Rodoviária Federal - Policial',
    examBoard: 'CEBRASPE',
    year: 2021,
    position: 'Policial Rodoviário Federal',
    level: 'Superior',
    totalQuestions: 120,
    duration: '4h00min',
    passingScore: 50,
    candidates: 32150,
    approvalRate: 4.2,
    difficulty: 'Difícil',
    subjects: [
      { name: 'Direito Constitucional', questions: 12, percentage: 10 },
      { name: 'Direito Administrativo', questions: 15, percentage: 12.5 },
      { name: 'Direito Penal', questions: 18, percentage: 15 },
      { name: 'Código de Trânsito', questions: 25, percentage: 20.8 },
      { name: 'Português', questions: 20, percentage: 16.7 },
      { name: 'Matemática', questions: 15, percentage: 12.5 },
      { name: 'Física', questions: 10, percentage: 8.3 },
      { name: 'Atualidades', questions: 5, percentage: 4.2 }
    ],
    tags: ['PRF', 'Federal', 'Rodoviária', 'Policial'],
    downloadCount: 12856,
    averageScore: 62.3,
    solvedBy: 2847,
    isFavorite: false,
    userProgress: {
      attempted: true,
      score: 52.0,
      completedAt: '2024-01-10',
      timeSpent: 210,
      ranking: 1456
    }
  },
  {
    id: '3',
    title: 'Polícia Civil SP - Escrivão',
    examBoard: 'VUNESP',
    year: 2023,
    position: 'Escrivão de Polícia',
    level: 'Superior',
    totalQuestions: 100,
    duration: '3h30min',
    passingScore: 50,
    candidates: 28740,
    approvalRate: 6.8,
    difficulty: 'Médio',
    subjects: [
      { name: 'Direito Constitucional', questions: 15, percentage: 15 },
      { name: 'Direito Penal', questions: 20, percentage: 20 },
      { name: 'Direito Processual Penal', questions: 15, percentage: 15 },
      { name: 'Direito Administrativo', questions: 10, percentage: 10 },
      { name: 'Português', questions: 20, percentage: 20 },
      { name: 'Informática', questions: 10, percentage: 10 },
      { name: 'Atualidades', questions: 10, percentage: 10 }
    ],
    tags: ['PC-SP', 'Estadual', 'Polícia Civil', 'Escrivão'],
    downloadCount: 9632,
    averageScore: 71.2,
    solvedBy: 1852,
    isFavorite: false
  },
  {
    id: '4',
    title: 'Polícia Militar SP - Soldado PM',
    examBoard: 'VUNESP',
    year: 2022,
    position: 'Soldado PM 2ª Classe',
    level: 'Médio',
    totalQuestions: 80,
    duration: '3h00min',
    passingScore: 50,
    candidates: 89520,
    approvalRate: 12.5,
    difficulty: 'Médio',
    subjects: [
      { name: 'Português', questions: 20, percentage: 25 },
      { name: 'Matemática', questions: 15, percentage: 18.75 },
      { name: 'História do Brasil', questions: 10, percentage: 12.5 },
      { name: 'Geografia do Brasil', questions: 10, percentage: 12.5 },
      { name: 'Atualidades', questions: 15, percentage: 18.75 },
      { name: 'Noções de Direito', questions: 10, percentage: 12.5 }
    ],
    tags: ['PM-SP', 'Estadual', 'Militar', 'Soldado'],
    downloadCount: 18945,
    averageScore: 65.8,
    solvedBy: 4521,
    isFavorite: true
  }
];

export default function PreviousExamsImproved() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<PreviousExam | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    year: 'all',
    examBoard: 'all',
    difficulty: 'all',
    level: 'all',
    solved: 'all'
  });

  // Dados para filtros
  const years = Array.from(new Set(mockExams.map(exam => exam.year))).sort((a, b) => b - a);
  const examBoards = Array.from(new Set(mockExams.map(exam => exam.examBoard)));
  const difficulties = ['Fácil', 'Médio', 'Difícil', 'Muito Difícil'];
  const levels = Array.from(new Set(mockExams.map(exam => exam.level)));

  // Filtrar exames
  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filters.year === 'all' || exam.year.toString() === filters.year;
    const matchesBoard = filters.examBoard === 'all' || exam.examBoard === filters.examBoard;
    const matchesDifficulty = filters.difficulty === 'all' || exam.difficulty === filters.difficulty;
    const matchesLevel = filters.level === 'all' || exam.level === filters.level;
    const matchesSolved = filters.solved === 'all' || 
      (filters.solved === 'solved' && exam.userProgress?.attempted) ||
      (filters.solved === 'unsolved' && !exam.userProgress?.attempted);
    
    return matchesSearch && matchesYear && matchesBoard && matchesDifficulty && matchesLevel && matchesSolved;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Difícil': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Muito Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const toggleFavorite = (examId: string) => {
    // Implementar lógica de favoritar
    console.log('Favoritando prova:', examId);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: 'all',
      examBoard: 'all',
      difficulty: 'all',
      level: 'all',
      solved: 'all'
    });
    setSearchTerm('');
  };

  // Estatísticas do usuário
  const userStats = {
    totalAttempted: mockExams.filter(exam => exam.userProgress?.attempted).length,
    avgScore: mockExams
      .filter(exam => exam.userProgress?.score)
      .reduce((sum, exam, _, arr) => sum + (exam.userProgress?.score || 0) / arr.length, 0),
    totalTimeSpent: mockExams
      .filter(exam => exam.userProgress?.timeSpent)
      .reduce((sum, exam) => sum + (exam.userProgress?.timeSpent || 0), 0),
    bestRanking: Math.min(...mockExams
      .filter(exam => exam.userProgress?.ranking)
      .map(exam => exam.userProgress?.ranking || Infinity))
  };

  if (selectedExam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setSelectedExam(null)}
            className="mb-6 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar às Provas
          </Button>

          {/* Exam Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedExam.title}
                  </h1>
                  <button
                    onClick={() => toggleFavorite(selectedExam.id)}
                    className={cn(
                      "p-1 rounded-full transition-colors",
                      selectedExam.isFavorite
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-400 hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", selectedExam.isFavorite && "fill-current")} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{selectedExam.examBoard}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedExam.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{selectedExam.level}</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedExam.position}</p>
              </div>
              <Badge className={getDifficultyColor(selectedExam.difficulty)}>
                {selectedExam.difficulty}
              </Badge>
            </div>

            {/* Exam Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExam.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Questões</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExam.duration}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duração</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExam.passingScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nota de Corte</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExam.approvalRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Aprovação</div>
              </div>
            </div>

            {/* User Progress */}
            {selectedExam.userProgress?.attempted && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Seu Desempenho
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Pontuação:</span>
                    <span className="ml-1 font-bold text-blue-900 dark:text-blue-100">
                      {selectedExam.userProgress.score?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Tempo:</span>
                    <span className="ml-1 font-bold text-blue-900 dark:text-blue-100">
                      {Math.floor((selectedExam.userProgress.timeSpent || 0) / 60)}h {(selectedExam.userProgress.timeSpent || 0) % 60}min
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Ranking:</span>
                    <span className="ml-1 font-bold text-blue-900 dark:text-blue-100">
                      #{selectedExam.userProgress.ranking}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Data:</span>
                    <span className="ml-1 font-bold text-blue-900 dark:text-blue-100">
                      {selectedExam.userProgress.completedAt && new Date(selectedExam.userProgress.completedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subjects Distribution */}
          <Card className="mb-6">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedSubjects(!expandedSubjects)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Distribuição de Matérias
                </h2>
                {expandedSubjects ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </CardHeader>
            
            {expandedSubjects && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {selectedExam.subjects.map((subject, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {subject.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {subject.questions} questões
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {subject.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${subject.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Análise da Prova
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Prova com foco em {selectedExam.subjects[0].name} ({selectedExam.subjects[0].percentage}%)</p>
                    <p>• Total de {selectedExam.subjects.length} disciplinas avaliadas</p>
                    <p>• Tempo médio por questão: {Math.floor((parseInt(selectedExam.duration) * 60) / selectedExam.totalQuestions)} segundos</p>
                    <p>• Nível de dificuldade: {selectedExam.difficulty}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Resolver Online
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    Ver Gabarito
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Study Tips */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">Dicas de Estudo</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>• Analise o padrão das questões da banca {selectedExam.examBoard}</p>
                <p>• Foque nas disciplinas com maior peso na prova</p>
                <p>• Pratique gestão de tempo durante a resolução</p>
                <p>• Revise questões similares de provas anteriores</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Provas Anteriores
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pratique com questões de concursos reais dos principais órgãos
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Provas Resolvidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{userStats.totalAttempted}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {userStats.avgScore ? userStats.avgScore.toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tempo de Estudo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.floor(userStats.totalTimeSpent / 60)}h
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Melhor Ranking</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  #{userStats.bestRanking === Infinity ? '---' : userStats.bestRanking}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar provas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ano
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Banca
                </label>
                <select
                  value={filters.examBoard}
                  onChange={(e) => handleFilterChange('examBoard', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  {examBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dificuldade
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nível
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.solved}
                  onChange={(e) => handleFilterChange('solved', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value="solved">Resolvidas</option>
                  <option value="unsolved">Não Resolvidas</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Exams Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredExams.map((exam) => (
            <Card 
              key={exam.id} 
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                viewMode === 'list' && "p-4"
              )}
              onClick={() => setSelectedExam(exam)}
            >
              <CardContent className={cn("p-6", viewMode === 'list' && "p-0")}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Building className="w-4 h-4" />
                          <span>{exam.examBoard}</span>
                          <span>•</span>
                          <span>{exam.year}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{exam.position}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getDifficultyColor(exam.difficulty)}>
                          {exam.difficulty}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(exam.id);
                          }}
                          className={cn(
                            "transition-colors",
                            exam.isFavorite
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-red-500"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", exam.isFavorite && "fill-current")} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Questões</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Duração</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exam.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Candidatos</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exam.candidates.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Taxa</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exam.approvalRate}%</span>
                      </div>
                    </div>

                    {exam.userProgress?.attempted && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 dark:text-blue-300">Sua pontuação:</span>
                          <span className="font-bold text-blue-900 dark:text-blue-100">
                            {exam.userProgress.score?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {exam.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{exam.examBoard} • {exam.year}</span>
                            <span>{exam.totalQuestions} questões</span>
                            <span>{exam.duration}</span>
                            <Badge className={getDifficultyColor(exam.difficulty)} size="sm">
                              {exam.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{exam.position}</p>
                          {exam.userProgress?.attempted && (
                            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                              Resolvida: {exam.userProgress.score?.toFixed(1)}% • Ranking #{exam.userProgress.ranking}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(exam.id);
                            }}
                            className={cn(
                              "transition-colors",
                              exam.isFavorite
                                ? "text-red-500 hover:text-red-600"
                                : "text-gray-400 hover:text-red-500"
                            )}
                          >
                            <Heart className={cn("w-4 h-4", exam.isFavorite && "fill-current")} />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma prova encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Dicas para Estudar com Provas Anteriores
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Analise o padrão das questões da banca examinadora</li>
                <li>Identifique os assuntos mais cobrados em cada matéria</li>
                <li>Pratique a resolução dentro do tempo estipulado</li>
                <li>Estude as explicações das questões que errou</li>
                <li>Compare seu desempenho com a média dos outros candidatos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}