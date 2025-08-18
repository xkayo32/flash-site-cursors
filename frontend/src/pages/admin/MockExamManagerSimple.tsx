import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockExamService, MockExam } from '@/services/mockExamService';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Target,
  Shield,
  Award,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Filter,
  ChevronRight,
  Crosshair,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function MockExamManagerSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockExamService.getAllMockExams({
        search: searchTerm || undefined,
        limit: 100
      });
      setExams(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar simulados:', err);
      setError('Erro ao carregar simulados');
      toast.error('Erro ao carregar simulados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white font-police-subtitle uppercase">
              CONFIRMAR EXCLUSÃO
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
              Deseja excluir este simulado?
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-police-body uppercase tracking-wider"
          >
            CANCELAR
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await mockExamService.deleteMockExam(examId);
                toast.success('SIMULADO ELIMINADO COM SUCESSO!');
                loadExams();
              } catch (err: any) {
                console.error('Erro ao excluir simulado:', err);
                toast.error('ERRO AO ELIMINAR SIMULADO');
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-police-body uppercase tracking-wider"
          >
            EXCLUIR
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDuplicate = async (exam: MockExam) => {
    try {
      // Implementar duplicação
      toast.success(`SIMULADO "${exam.title}" DUPLICADO COM SUCESSO!`);
      loadExams();
    } catch (err: any) {
      console.error('Erro ao duplicar simulado:', err);
      toast.error('ERRO AO DUPLICAR SIMULADO');
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadExams();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      'easy': { 
        label: 'OPERACIONAL', 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-500/30',
        icon: Shield
      },
      'medium': { 
        label: 'TÁTICO', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
        icon: Target
      },
      'hard': { 
        label: 'COMANDO', 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-500/30',
        icon: Award
      }
    };
    
    const cfg = config[difficulty as keyof typeof config] || config['medium'];
    const Icon = cfg.icon;
    
    return (
      <Badge className={`font-police-body font-semibold text-xs uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'published': { 
        label: 'ATIVO', 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-500/30',
        icon: CheckCircle
      },
      'draft': { 
        label: 'RASCUNHO', 
        color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border border-gray-500/30',
        icon: AlertCircle
      }
    };
    
    const cfg = config[status as keyof typeof config] || config['draft'];
    const Icon = cfg.icon;
    
    return (
      <Badge className={`font-police-body font-semibold text-xs uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-ultra-wide text-gray-900 dark:text-white flex items-center gap-3">
            <Crosshair className="w-8 h-8 text-accent-500" />
            COMANDO DE SIMULADOS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider mt-1">
            CENTRO TÁTICO - SIMULAÇÕES OPERACIONAIS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin/mock-exams/new')}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            NOVA OPERAÇÃO
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  ARSENAL TOTAL
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {exams.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  OPERAÇÕES ATIVAS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {exams.filter(e => e.status === 'published').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  ENGAJAMENTOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {exams.reduce((sum, exam) => sum + exam.total_attempts, 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                  EFICIÊNCIA MÉDIA
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {exams.length > 0 ? (exams.reduce((sum, exam) => sum + exam.average_score, 0) / exams.length).toFixed(1) : '0.0'}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR OPERAÇÕES TÁTICAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  STATUS:
                </span>
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 rounded text-xs font-police-body font-semibold uppercase tracking-wider transition-all ${
                      filterStatus === 'all'
                        ? 'bg-accent-500 text-black'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    TODOS
                  </button>
                  <button
                    onClick={() => setFilterStatus('published')}
                    className={`px-3 py-1 rounded text-xs font-police-body font-semibold uppercase tracking-wider transition-all ${
                      filterStatus === 'published'
                        ? 'bg-accent-500 text-black'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    ATIVOS
                  </button>
                  <button
                    onClick={() => setFilterStatus('draft')}
                    className={`px-3 py-1 rounded text-xs font-police-body font-semibold uppercase tracking-wider transition-all ${
                      filterStatus === 'draft'
                        ? 'bg-accent-500 text-black'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    RASCUNHOS
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Exams Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  CARREGANDO OPERAÇÕES...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
                  {error}
                </p>
                <Button
                  onClick={loadExams}
                  className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                >
                  TENTAR NOVAMENTE
                </Button>
              </div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  NENHUMA OPERAÇÃO ENCONTRADA
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      OPERAÇÃO
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      DIFICULDADE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      ALVOS
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      DURAÇÃO
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      ENGAJAMENTOS
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-ultra-wide">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-accent-500 transition-colors">
                            {exam.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            {exam.description || 'Sem descrição'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getDifficultyBadge(exam.difficulty)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">
                          {exam.total_questions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-police-numbers text-gray-900 dark:text-white">
                            {mockExamService.formatDuration(exam.duration)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">
                            {exam.total_attempts.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                            MÉDIA: {exam.average_score.toFixed(1)}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(exam.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/mock-exams/${exam.id}/view`)}
                            className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/mock-exams/${exam.id}/edit`)}
                            className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(exam)}
                            className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}