import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Clock,
  Users,
  BarChart,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MockExam {
  id: number;
  title: string;
  organization: string;
  examType: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  isActive: boolean;
  attempts: number;
  avgScore: number;
  createdAt: string;
  tags: string[];
}

// Dados de exemplo
const mockExams: MockExam[] = [
  {
    id: 1,
    title: 'Simulado Polícia Federal - Agente',
    organization: 'Polícia Federal',
    examType: 'Concurso Público',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    passingScore: 60,
    difficulty: 'advanced',
    isActive: true,
    attempts: 1250,
    avgScore: 58.5,
    createdAt: '2024-01-15',
    tags: ['PF', 'Agente', 'CESPE']
  },
  {
    id: 2,
    title: 'Simulado PRF - Policial Rodoviário',
    organization: 'Polícia Rodoviária Federal',
    examType: 'Concurso Público',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    passingScore: 50,
    difficulty: 'advanced',
    isActive: true,
    attempts: 980,
    avgScore: 52.3,
    createdAt: '2024-01-10',
    tags: ['PRF', 'CESPE']
  },
  {
    id: 3,
    title: 'Simulado Polícia Civil SP - Escrivão',
    organization: 'Polícia Civil SP',
    examType: 'Concurso Público',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    passingScore: 50,
    difficulty: 'intermediate',
    isActive: true,
    attempts: 650,
    avgScore: 61.2,
    createdAt: '2024-01-05',
    tags: ['PC-SP', 'Escrivão', 'VUNESP']
  }
];

export default function MockExamManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'all' || exam.difficulty === selectedDifficulty;
    const matchesOrganization = selectedOrganization === 'all' || exam.organization === selectedOrganization;
    
    return matchesSearch && matchesDifficulty && matchesOrganization;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 min-h-full relative">
      {/* Tactical Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
          <div className="w-1 h-8 bg-accent-500/60" />
          <BarChart className="w-8 h-8 text-accent-500" />
          <div className="w-1 h-8 bg-accent-500/60" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-police-title mb-2 uppercase tracking-ultra-wide">
          OPERAÇÕES TÁTICAS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
          SISTEMA DE SIMULADOS OPERACIONAIS
        </p>
        <div className="mt-3 w-40 h-1 bg-gradient-to-r from-accent-500 via-accent-600 to-transparent" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Simulados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockExams.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulados Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {mockExams.filter(e => e.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Tentativas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {mockExams.reduce((sum, exam) => sum + exam.attempts, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Média de Aprovação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {((mockExams.reduce((sum, exam) => sum + (exam.avgScore >= exam.passingScore ? 1 : 0), 0) / mockExams.length) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar simulados..."
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
        <Button
          onClick={() => navigate('/admin/mock-exams/new')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Simulado
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 space-y-4">
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dificuldade
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="basic">Básico</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organização
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="Polícia Federal">Polícia Federal</option>
                <option value="Polícia Rodoviária Federal">Polícia Rodoviária Federal</option>
                <option value="Polícia Civil SP">Polícia Civil SP</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Mock Exams List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Simulado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Questões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dificuldade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tentativas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
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
                      <div className="flex gap-1 mt-1">
                        {exam.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{exam.organization}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {exam.timeLimitMinutes} min
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {getDifficultyLabel(exam.difficulty)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.attempts.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Média: {exam.avgScore.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {exam.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/mock-exams/${exam.id}/preview`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/mock-exams/${exam.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Duplicate logic */}}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhum simulado encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}