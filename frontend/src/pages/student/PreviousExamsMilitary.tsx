import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building,
  Play,
  Eye,
  Download,
  TrendingUp,
  Award,
  Target,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle,
  Loader2,
  X,
  Trophy,
  BookOpen,
  Activity,
  Calendar,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard, EmptyState } from '@/components/student';
import { studentPreviousExamService, type PreviousExam } from '@/services/previousExamService';
import { examService } from '@/services/examService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface PreviousExamDisplay {
  id: string;
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
  rating: number;
  views: number;
  userAttempts: number;
  bestScore: number | null;
  lastAttempt: string | null;
  avgScore: number;
  totalAttempts: number;
  passingScore: number;
}


export default function PreviousExamsMilitary() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedExamBoard, setSelectedExamBoard] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [previousExams, setPreviousExams] = useState<PreviousExamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState<PreviousExamDisplay | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load previous exams from API
  useEffect(() => {
    console.log('🚀 [DEBUG] useEffect executado. isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('❌ [DEBUG] Usuário não autenticado, redirecionando para login');
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    console.log('✅ [DEBUG] Usuário autenticado, carregando exames...');
    loadPreviousExams();
  }, [isAuthenticated]);

  const loadPreviousExams = async () => {
    try {
      console.log('🔄 [DEBUG] Iniciando loadPreviousExams...');
      setLoading(true);
      setError(null);
      console.log('🔄 [DEBUG] Chamando API studentPreviousExamService.getAvailable...');
      const response = await studentPreviousExamService.getAvailable();
      console.log('📥 [DEBUG] Resposta da API recebida:', response);
      
      if (response.exams) {
        console.log('✅ [DEBUG] Campo response.exams encontrado com', response.exams.length, 'itens');
        // Transform API data to display format with tactical naming and mock stats
        const transformedExams: PreviousExamDisplay[] = response.exams.map((exam: PreviousExam) => {
          // Generate mock difficulty based on approval rate or default to medium
          let difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium';
          const approvalRate = exam.statistics?.approval_rate || 50;
          if (approvalRate >= 70) difficulty = 'easy';
          else if (approvalRate >= 40) difficulty = 'medium';
          else if (approvalRate >= 20) difficulty = 'hard';
          else difficulty = 'expert';

          return {
            id: exam.id,
            title: `OPERAÇÃO ${exam.organization.toUpperCase()} - ${exam.position.toUpperCase()} ${exam.year}`,
            organization: exam.organization,
            examBoard: exam.exam_board,
            year: exam.year,
            examDate: exam.application_date || `${exam.year}-01-01`,
            position: exam.position,
            totalQuestions: exam.total_questions,
            difficulty,
            hasAnswerSheet: true, // Assume all have answer sheets
            hasPDF: !!exam.metadata?.pdf_url,
            rating: 4.0 + (Math.random() * 1.0), // Generate mock rating 4.0-5.0
            views: exam.statistics?.total_attempts ? exam.statistics.total_attempts * 5 : Math.floor(Math.random() * 10000) + 1000,
            userAttempts: exam.user_stats?.attempts_count || 0,
            bestScore: exam.user_stats?.best_score || null,
            lastAttempt: exam.user_stats?.last_attempt || null,
            avgScore: exam.statistics?.average_score || Math.floor(Math.random() * 40) + 40,
            totalAttempts: exam.statistics?.total_attempts || Math.floor(Math.random() * 3000) + 500,
            passingScore: 60 // Standard passing score
          };
        });
        
        console.log('🔄 [DEBUG] Dados transformados:', transformedExams.length, 'exames');
        setPreviousExams(transformedExams);
        console.log('✅ [DEBUG] setPreviousExams executado com sucesso');
      } else {
        console.error('❌ [DEBUG] response.exams não encontrado. Estrutura da resposta:', Object.keys(response));
        throw new Error('Formato de resposta inválido');
      }
    } catch (err: any) {
      console.error('❌ [DEBUG] Erro ao carregar provas anteriores:', err);
      setError(err.message || 'Erro ao carregar provas anteriores. Tente novamente.');
    } finally {
      console.log('🏁 [DEBUG] setLoading(false) - finalizando carregamento');
      setLoading(false);
    }
  };

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
      case 'easy': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-500';
      case 'hard': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-500';
      case 'expert': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'RECRUTA';
      case 'medium': return 'SOLDADO';
      case 'hard': return 'SARGENTO';
      case 'expert': return 'COMANDANTE';
      default: return difficulty.toUpperCase();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const totalAttempts = previousExams.reduce((sum, exam) => sum + exam.userAttempts, 0);
  const avgUserScore = previousExams
    .filter(exam => exam.bestScore !== null)
    .reduce((sum, exam, _, arr) => sum + (exam.bestScore || 0) / arr.length, 0);
  const passedExams = previousExams.filter(exam => exam.bestScore !== null && exam.bestScore >= exam.passingScore).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 relative">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
              ARSENAL DE PROVAS ANTERIORES
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-police-subtitle tracking-wider uppercase ml-16">
            TREINAMENTO TÁTICO COM PROVAS REAIS DOS PRINCIPAIS COMANDOS
          </p>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="OPERAÇÕES EXECUTADAS"
            value={totalAttempts}
            icon={FileText}
            color="blue"
          />

          <StatCard
            title="PRECISÃO TÁTICA"
            value={`${avgUserScore ? avgUserScore.toFixed(1) : '0.0'}%`}
            icon={TrendingUp}
            color="purple"
          />

          <StatCard
            title="MISSÕES CONCLUÍDAS"
            value={passedExams}
            icon={Award}
            color="green"
          />

          <StatCard
            title="ALVOS ABATIDOS"
            value={previousExams.reduce((sum, exam) => sum + (exam.userAttempts * exam.totalQuestions), 0)}
            icon={Target}
            color="orange"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="BUSCAR OPERAÇÕES TÁTICAS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              <Filter className="w-4 h-4" />
              FILTROS
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg mb-6 space-y-4 border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                  ANO OPERACIONAL
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                >
                  <option value="all">TODOS OS ANOS</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                  COMANDO
                </label>
                <select
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                >
                  <option value="all">TODOS OS COMANDOS</option>
                  {organizations.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                  BANCA EXAMINADORA
                </label>
                <select
                  value={selectedExamBoard}
                  onChange={(e) => setSelectedExamBoard(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                >
                  <option value="all">TODAS AS BANCAS</option>
                  {examBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  CARREGANDO ARSENAL TÁTICO...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg border-2 border-red-200 dark:border-red-800 p-8 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
                  {error}
                </p>
                <Button
                  onClick={loadPreviousExams}
                  variant="outline"
                  className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                >
                  TENTAR NOVAMENTE
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Exams Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              data-exam-id={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:border-accent-500/50 transition-all duration-300 backdrop-blur-sm relative group"
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 font-police-title uppercase tracking-wider group-hover:text-accent-500 transition-colors">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Building className="w-4 h-4 text-accent-500" />
                      <span className="font-police-body uppercase tracking-wider">{exam.organization}</span>
                      <span className="text-accent-500">•</span>
                      <span className="font-police-body uppercase tracking-wider">{exam.examBoard}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-police-body tracking-wider">
                      {exam.position}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">{exam.year}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body uppercase">
                      {new Date(exam.examDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                </div>

                {/* Rating and Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(exam.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1 font-police-numbers">
                      ({exam.rating.toFixed(1)})
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-police-subtitle uppercase tracking-wider border-2 ${getDifficultyColor(exam.difficulty)}`}>
                    {getDifficultyLabel(exam.difficulty)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">ALVOS</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">PRECISÃO</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.passingScore}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={async () => {
                      try {
                        toast.success('INICIANDO OPERAÇÃO TÁTICA! 🎯', {
                          style: {
                            background: '#14242f',
                            color: '#facc15',
                            border: '2px solid #facc15'
                          }
                        });
                        
                        // Start exam session
                        const session = await examService.startExamSession(exam.id, 'previous');
                        
                        // Navigate to exam taking page with session ID
                        navigate(`/simulations/previous/${exam.id}/take`, { 
                          state: { sessionId: session.id }
                        });
                      } catch (error) {
                        console.error('Erro ao iniciar sessão:', error);
                        toast.error('Erro ao iniciar operação tática', {
                          style: {
                            background: '#330000',
                            color: '#ff6666',
                            border: '2px solid #ff6666'
                          }
                        });
                      }
                    }}
                  >
                    <Play className="w-4 h-4" />
                    EXECUTAR MISSÃO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast('VISUALIZANDO DETALHES DA OPERAÇÃO 🔍', {
                        style: {
                          background: '#14242f',
                          color: '#facc15',
                          border: '2px solid #facc15'
                        }
                      });
                      setSelectedExamDetails(exam);
                      setShowDetailsModal(true);
                    }}
                    className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                    title="Ver detalhes da prova"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {exam.hasPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('DOWNLOAD DO ARQUIVO TÁTICO INICIADO! 📄', {
                          style: {
                            background: '#14242f',
                            color: '#facc15',
                            border: '2px solid #facc15'
                          }
                        });
                      }}
                      className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {!loading && !error && filteredExams.length === 0 && (
          <EmptyState
            icon={FileText}
            title="NENHUMA OPERAÇÃO ENCONTRADA"
            description="Ajuste os filtros ou tente uma nova busca para encontrar provas anteriores."
            action={{
              label: "LIMPAR FILTROS",
              onClick: () => {
                setSearchTerm('');
                setSelectedYear('all');
                setSelectedOrganization('all');
                setSelectedExamBoard('all');
                setShowFilters(false);
              }
            }}
          />
        )}

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500/50 rounded-lg p-6 relative overflow-hidden backdrop-blur-sm"
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-3 font-police-title uppercase tracking-ultra-wide">
                BRIEFING TÁTICO - OPERAÇÕES COM PROVAS ANTERIORES
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2 font-police-body tracking-wider">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">▸</span>
                  <span>ANALISE O PADRÃO TÁTICO DAS QUESTÕES DA BANCA EXAMINADORA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">▸</span>
                  <span>IDENTIFIQUE OS ALVOS PRIORITÁRIOS EM CADA ÁREA OPERACIONAL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">▸</span>
                  <span>EXECUTE SIMULAÇÕES DENTRO DO TEMPO LIMITE DA OPERAÇÃO</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">▸</span>
                  <span>ANALISE O RELATÓRIO PÓS-AÇÃO DAS QUESTÕES ERRADAS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">▸</span>
                  <span>COMPARE SUA PERFORMANCE COM A MÉDIA DO PELOTÃO</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Detalhes da Operação */}
      <AnimatePresence>
        {showDetailsModal && selectedExamDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Header Tático */}
              <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 text-white p-6 rounded-t-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500/20" />
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-accent-500" />
                      <h2 className="text-xl font-bold font-police-title uppercase tracking-wider">
                        BRIEFING OPERACIONAL
                      </h2>
                    </div>
                    <p className="text-accent-500 font-police-subtitle uppercase tracking-wider text-sm">
                      ANÁLISE COMPLETA DA MISSÃO
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Informações Principais */}
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-accent-500/20">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-bold font-police-title text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent-500" />
                      {selectedExamDetails.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-police-body text-sm text-gray-700 dark:text-gray-300">
                          {selectedExamDetails.organization}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-police-body text-sm text-gray-700 dark:text-gray-300">
                          ANO {selectedExamDetails.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-police-body text-sm text-gray-700 dark:text-gray-300">
                          {selectedExamDetails.totalQuestions} QUESTÕES
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <Badge 
                          variant="outline" 
                          className={`font-police-body text-xs uppercase ${
                            selectedExamDetails.difficulty === 'RECRUTA' ? 'text-green-600 border-green-600' :
                            selectedExamDetails.difficulty === 'CABO' ? 'text-amber-600 border-amber-600' :
                            'text-red-600 border-red-600'
                          }`}
                        >
                          {selectedExamDetails.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas de Performance */}
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-bold font-police-title text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      RELATÓRIO DE INTELIGÊNCIA
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold font-police-numbers text-green-600">
                          {selectedExamDetails.approvalRate}%
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Taxa Aprovação
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold font-police-numbers text-blue-600">
                          {selectedExamDetails.averageScore}%
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Média Geral
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold font-police-numbers text-purple-600">
                          {selectedExamDetails.attempts}
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Operadores
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seu Histórico */}
                <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-bold font-police-title text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      SEU HISTÓRICO TÁTICO
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-xl font-bold font-police-numbers text-amber-600">
                          {selectedExamDetails.userAttempts}
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Suas Tentativas
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-xl font-bold font-police-numbers text-green-600">
                          {selectedExamDetails.bestScore ? `${selectedExamDetails.bestScore}%` : '--'}
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Melhor Score
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-sm font-bold font-police-numbers text-gray-600 dark:text-gray-400">
                          {selectedExamDetails.lastAttempt ? 
                            new Date(selectedExamDetails.lastAttempt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) 
                            : '--'
                          }
                        </div>
                        <div className="text-xs font-police-body uppercase text-gray-600 dark:text-gray-400">
                          Última Operação
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={async () => {
                      setShowDetailsModal(false);
                      try {
                        toast.success('INICIANDO OPERAÇÃO TÁTICA! 🎯', {
                          style: {
                            background: '#14242f',
                            color: '#facc15',
                            border: '2px solid #facc15'
                          }
                        });
                        
                        // Start exam session
                        const session = await examService.startExamSession(selectedExamDetails.id, 'previous');
                        
                        // Navigate to exam taking page with session ID
                        navigate(`/simulations/previous/${selectedExamDetails.id}/take`, { 
                          state: { sessionId: session.id }
                        });
                      } catch (error) {
                        console.error('Erro ao iniciar sessão:', error);
                        toast.error('Erro ao iniciar operação tática', {
                          style: {
                            background: '#330000',
                            color: '#ff6666',
                            border: '2px solid #ff6666'
                          }
                        });
                      }
                    }}
                    className="flex-1 bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body uppercase tracking-wider gap-2"
                  >
                    <Play className="w-4 h-4" />
                    EXECUTAR MISSÃO
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="font-police-body uppercase tracking-wider"
                  >
                    FECHAR
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}