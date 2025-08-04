import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Calendar,
  Building,
  FileText,
  Users,
  BarChart,
  Award,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

interface PreviousExam {
  id: number;
  title: string;
  organization: string;
  examBoard: string;
  year: number;
  examDate: string;
  position: string;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  hasAnswerSheet: boolean;
  hasPDF: boolean;
  views: number;
  attempts: number;
  avgScore: number;
  isActive: boolean;
}

// Dados de exemplo
const previousExams: PreviousExam[] = [
  {
    id: 1,
    title: 'Polícia Federal - Agente 2021',
    organization: 'Polícia Federal',
    examBoard: 'CESPE',
    year: 2021,
    examDate: '2021-05-23',
    position: 'Agente de Polícia Federal',
    totalQuestions: 120,
    difficulty: 'hard',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 15420,
    attempts: 3250,
    avgScore: 58.5,
    isActive: true
  },
  {
    id: 2,
    title: 'PRF - Policial Rodoviário 2021',
    organization: 'Polícia Rodoviária Federal',
    examBoard: 'CESPE',
    year: 2021,
    examDate: '2021-08-15',
    position: 'Policial Rodoviário Federal',
    totalQuestions: 120,
    difficulty: 'hard',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 12350,
    attempts: 2840,
    avgScore: 52.3,
    isActive: true
  },
  {
    id: 3,
    title: 'Polícia Civil SP - Escrivão 2023',
    organization: 'Polícia Civil SP',
    examBoard: 'VUNESP',
    year: 2023,
    examDate: '2023-03-12',
    position: 'Escrivão de Polícia',
    totalQuestions: 100,
    difficulty: 'medium',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 8930,
    attempts: 1950,
    avgScore: 61.2,
    isActive: true
  },
  {
    id: 4,
    title: 'Polícia Militar SP - Soldado 2022',
    organization: 'Polícia Militar SP',
    examBoard: 'VUNESP',
    year: 2022,
    examDate: '2022-11-20',
    position: 'Soldado PM 2ª Classe',
    totalQuestions: 80,
    difficulty: 'medium',
    hasAnswerSheet: true,
    hasPDF: false,
    views: 6750,
    attempts: 1420,
    avgScore: 65.8,
    isActive: true
  }
];

export default function PreviousExamsManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedExamBoard, setSelectedExamBoard] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const years = Array.from(new Set(previousExams.map(exam => exam.year))).sort((a, b) => b - a);
  const organizations = Array.from(new Set(previousExams.map(exam => exam.organization)));
  const examBoards = Array.from(new Set(previousExams.map(exam => exam.examBoard)));

  const filteredExams = previousExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || exam.year.toString() === selectedYear;
    const matchesOrganization = selectedOrganization === 'all' || exam.organization === selectedOrganization;
    const matchesExamBoard = selectedExamBoard === 'all' || exam.examBoard === selectedExamBoard;
    
    return matchesSearch && matchesYear && matchesOrganization && matchesExamBoard;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-police-title mb-2">
          Gerenciar Provas Anteriores
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administre o banco de provas de concursos anteriores
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Provas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{previousExams.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questões Cadastradas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {previousExams.reduce((sum, exam) => sum + exam.totalQuestions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {previousExams.reduce((sum, exam) => sum + exam.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tentativas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {previousExams.reduce((sum, exam) => sum + exam.attempts, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar provas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
            variant="outline"
            onClick={() => navigate('/admin/previous-exams/import')}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button
            onClick={() => navigate('/admin/previous-exams/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Prova
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
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
                Instituição
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                {organizations.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Banca
              </label>
              <select
                value={selectedExamBoard}
                onChange={(e) => setSelectedExamBoard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                {examBoards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exams List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prova
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Banca
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Questões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dificuldade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recursos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estatísticas
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
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <Building className="w-3 h-3" />
                        {exam.organization}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {exam.position}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{exam.examBoard}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{exam.year}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(exam.examDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {getDifficultyLabel(exam.difficulty)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1">
                        <FileText className={`w-4 h-4 ${exam.hasPDF ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">PDF</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className={`w-4 h-4 ${exam.hasAnswerSheet ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Gabarito</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="w-3 h-3" />
                        {exam.views.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Users className="w-3 h-3" />
                        {exam.attempts.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Média: {exam.avgScore.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/previous-exams/${exam.id}/preview`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/previous-exams/${exam.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {exam.hasPDF && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Download PDF */}}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
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
            <p className="text-gray-500 dark:text-gray-400">Nenhuma prova encontrada</p>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Dica: Mantenha o banco atualizado
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Adicione regularmente provas recentes dos principais concursos para manter os alunos engajados com conteúdo relevante e atualizado.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}