import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, EmptyState } from '@/components/student';
import toast from 'react-hot-toast';

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
  rating: number;
  views: number;
  userAttempts: number;
  bestScore: number | null;
  lastAttempt: string | null;
  avgScore: number;
  totalAttempts: number;
  passingScore: number;
}

// Dados de exemplo
const previousExams: PreviousExam[] = [
  {
    id: 1,
    title: 'OPERAÇÃO PF - AGENTE 2021',
    organization: 'Polícia Federal',
    examBoard: 'CESPE',
    year: 2021,
    examDate: '2021-05-23',
    position: 'Agente de Polícia Federal',
    totalQuestions: 120,
    difficulty: 'hard',
    hasAnswerSheet: true,
    hasPDF: true,
    rating: 4.8,
    views: 15420,
    userAttempts: 3,
    bestScore: 78.5,
    lastAttempt: '2024-01-18',
    avgScore: 58.5,
    totalAttempts: 3250,
    passingScore: 60
  },
  {
    id: 2,
    title: 'OPERAÇÃO PRF - POLICIAL RODOVIÁRIO 2021',
    organization: 'Polícia Rodoviária Federal',
    examBoard: 'CESPE',
    year: 2021,
    examDate: '2021-08-15',
    position: 'Policial Rodoviário Federal',
    totalQuestions: 120,
    difficulty: 'hard',
    hasAnswerSheet: true,
    hasPDF: true,
    rating: 4.6,
    views: 12350,
    userAttempts: 1,
    bestScore: 52.3,
    lastAttempt: '2024-01-10',
    avgScore: 52.3,
    totalAttempts: 2840,
    passingScore: 50
  },
  {
    id: 3,
    title: 'OPERAÇÃO PCSP - ESCRIVÃO 2023',
    organization: 'Polícia Civil SP',
    examBoard: 'VUNESP',
    year: 2023,
    examDate: '2023-03-12',
    position: 'Escrivão de Polícia',
    totalQuestions: 100,
    difficulty: 'medium',
    hasAnswerSheet: true,
    hasPDF: true,
    rating: 4.4,
    views: 8930,
    userAttempts: 0,
    bestScore: null,
    lastAttempt: null,
    avgScore: 61.2,
    totalAttempts: 1950,
    passingScore: 50
  },
  {
    id: 4,
    title: 'OPERAÇÃO PMSP - SOLDADO 2022',
    organization: 'Polícia Militar SP',
    examBoard: 'VUNESP',
    year: 2022,
    examDate: '2022-11-20',
    position: 'Soldado PM 2ª Classe',
    totalQuestions: 80,
    difficulty: 'medium',
    hasAnswerSheet: true,
    hasPDF: false,
    rating: 4.2,
    views: 6750,
    userAttempts: 2,
    bestScore: 65.8,
    lastAttempt: '2024-01-05',
    avgScore: 65.8,
    totalAttempts: 1420,
    passingScore: 50
  }
];

export default function PreviousExamsStudentPage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="ARSENAL DE PROVAS ANTERIORES"
          subtitle="TREINAMENTO TÁTICO COM PROVAS REAIS DOS PRINCIPAIS ÓRGÃOS"
          icon={FileText}
          breadcrumbs={[
            { label: 'DASHBOARD', href: '/student/dashboard' },
            { label: 'PROVAS ANTERIORES' }
          ]}
        />

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
                className="pl-10 w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 font-police-body uppercase tracking-wider"
            >
              <Filter className="w-4 h-4" />
              FILTROS
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 space-y-4 border border-gray-200 dark:border-gray-700">
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                  ANO
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                  INSTITUIÇÃO
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                  BANCA
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
          </div>
        )}

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExams.map((exam, index) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Building className="w-4 h-4" />
                      <span>{exam.organization}</span>
                      <span>•</span>
                      <span>{exam.examBoard}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {exam.position}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{exam.year}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      ({exam.rating.toFixed(1)})
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                    {getDifficultyLabel(exam.difficulty)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Questões</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nota de Corte</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.passingScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Visualizações</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tentativas</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.totalAttempts.toLocaleString()}</span>
                  </div>
                </div>

                {/* User Progress */}
                {exam.userAttempts > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Seu Melhor Resultado</span>
                        <span className={`font-medium ${
                          exam.bestScore && exam.bestScore >= exam.passingScore
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {exam.bestScore?.toFixed(1)}%
                          {exam.bestScore && exam.bestScore >= exam.passingScore && (
                            <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Suas Tentativas</span>
                        <span className="font-medium text-gray-900 dark:text-white">{exam.userAttempts}</span>
                      </div>
                      {exam.lastAttempt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Última Tentativa</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(exam.lastAttempt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resources */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className={`w-4 h-4 ${exam.hasPDF ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={exam.hasPDF ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                        PDF da Prova
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Award className={`w-4 h-4 ${exam.hasAnswerSheet ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={exam.hasAnswerSheet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                        Gabarito Oficial
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                    onClick={() => {
                      toast.success('INICIANDO OPERAÇÃO!', { icon: '🎯' });
                      navigate(`/student/exam-taking?examId=${exam.id}`);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    EXECUTAR MISSÃO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/exam-results?examId=${exam.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {exam.hasPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('DOWNLOAD INICIADO!', {
                          description: 'PDF da prova sendo baixado...',
                          icon: '📄'
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
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
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2 font-police-title uppercase tracking-wider">
                DICAS TÁTICAS PARA OPERAÇÕES COM PROVAS ANTERIORES
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside font-police-body">
                <li>ANALISE O PADRÃO TÁTICO DAS QUESTÕES DA BANCA EXAMINADORA</li>
                <li>IDENTIFIQUE OS ASSUNTOS MAIS COBRADOS EM CADA ÁREA OPERACIONAL</li>
                <li>PRATIQUE A RESOLUÇÃO DENTRO DO TEMPO ESTIPULADO</li>
                <li>ESTUDE AS EXPLICAÇÕES DAS QUESTÕES QUE ERROU</li>
                <li>COMPARE SEU DESEMPENHO COM A MÉDIA DOS OUTROS OPERADORES</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}