import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock,
  Building,
  Calendar,
  Users,
  Play,
  Eye,
  Download,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  FileText,
  AlertTriangle,
  Star,
  ExternalLink,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { StatCard, EmptyState } from '@/components/student';
import { studentPreviousExamService, type PreviousExam } from '@/services/previousExamService';
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


export default function PreviousExamsStudentPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [selectedExamBoard, setSelectedExamBoard] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [previousExams, setPreviousExams] = useState<PreviousExamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load previous exams from API
  useEffect(() => {
    loadPreviousExams();
  }, []);

  const loadPreviousExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentPreviousExamService.getAvailable();
      
      if (response.exams) {
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
        
        setPreviousExams(transformedExams);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err: any) {
      console.error('Erro ao carregar provas anteriores:', err);
      setError(err.message || 'Erro ao carregar provas anteriores. Tente novamente.');
    } finally {
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

  // Stats Summary
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
              FILTROS TÁTICOS
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
            {/* Tactical stripe */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:border-accent-500/50 transition-all duration-300 backdrop-blur-sm relative group"
            >
              {/* Tactical stripe */}
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">RECONHECIMENTO</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">OPERAÇÕES</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{exam.totalAttempts.toLocaleString()}</span>
                  </div>
                </div>

                {/* User Progress */}
                {exam.userAttempts > 0 && (
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">SUA MELHOR MARCA</span>
                        <span className={`font-bold font-police-numbers ${
                          exam.bestScore && exam.bestScore >= exam.passingScore
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {exam.bestScore?.toFixed(1)}%
                          {exam.bestScore && exam.bestScore >= exam.passingScore && (
                            <CheckCircle className="inline w-4 h-4 ml-1 text-green-600 dark:text-green-400" />
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">MISSÕES EXECUTADAS</span>
                        <span className="font-bold font-police-numbers text-gray-900 dark:text-white">{exam.userAttempts}</span>
                      </div>
                      {exam.lastAttempt && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">ÚLTIMA OPERAÇÃO</span>
                          <span className="text-gray-500 dark:text-gray-400 font-police-numbers">
                            {new Date(exam.lastAttempt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resources */}
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        exam.hasPDF ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <FileText className={`w-4 h-4 ${exam.hasPDF ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-police-body uppercase tracking-wider ${
                        exam.hasPDF ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`}>
                        ARQUIVO TÁTICO
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        exam.hasAnswerSheet ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Award className={`w-4 h-4 ${exam.hasAnswerSheet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-police-body uppercase tracking-wider ${
                        exam.hasAnswerSheet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`}>
                        GABARITO OFICIAL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      toast.success('INICIANDO OPERAÇÃO TÁTICA!', { 
                        icon: '🎯',
                        style: {
                          background: '#14242f',
                          color: '#facc15',
                          border: '2px solid #facc15'
                        }
                      });
                      navigate(`/simulations/previous/${exam.id}/take`);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    EXECUTAR MISSÃO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast('ACESSANDO RELATÓRIO TÁTICO', {
                        icon: '📊',
                        style: {
                          background: '#14242f',
                          color: '#facc15',
                          border: '2px solid #facc15'
                        }
                      });
                      navigate(`/simulations/previous/${exam.id}/results`);
                    }}
                    className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {exam.hasPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('DOWNLOAD DO ARQUIVO TÁTICO INICIADO!', {
                          description: 'Preparando documento classificado...',
                          icon: '📄',
                          style: {
                            background: '#14242f',
                            color: '#facc15',
                            border: '2px solid #facc15'
                          }
                        });
                        // Simulate download
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = `${exam.title.replace(/\s+/g, '_')}.pdf`;
                        link.click();
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
          {/* Tactical stripe */}
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
    </div>
  );
}