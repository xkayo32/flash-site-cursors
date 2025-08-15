import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Building,
  AlertCircle,
  Play,
  RotateCcw,
  Trophy,
  Users,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, EmptyState } from '@/components/student';
import toast from 'react-hot-toast';

interface MockExam {
  id: number;
  title: string;
  organization: string;
  examType: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  attempts: number;
  userAttempts: number;
  bestScore: number | null;
  lastAttempt: string | null;
  isLocked: boolean;
  requiredPlan: string | null;
  avgScore: number;
  totalAttempts: number;
}

// Dados de exemplo
const mockExams: MockExam[] = [
  {
    id: 1,
    title: 'OPERAÇÃO SIMULADA PF - AGENTE TÁTICO',
    organization: 'Polícia Federal',
    examType: 'Concurso Público',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    passingScore: 60,
    difficulty: 'advanced',
    tags: ['PF', 'Agente', 'CESPE'],
    attempts: 1250,
    userAttempts: 2,
    bestScore: 72.5,
    lastAttempt: '2024-01-20',
    isLocked: false,
    requiredPlan: null,
    avgScore: 58.5,
    totalAttempts: 15420
  },
  {
    id: 2,
    title: 'OPERAÇÃO SIMULADA PRF - POLICIAL RODOVIÁRIO',
    organization: 'Polícia Rodoviária Federal',
    examType: 'Concurso Público',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    passingScore: 50,
    difficulty: 'advanced',
    tags: ['PRF', 'CESPE'],
    attempts: 980,
    userAttempts: 0,
    bestScore: null,
    lastAttempt: null,
    isLocked: false,
    requiredPlan: null,
    avgScore: 52.3,
    totalAttempts: 12350
  },
  {
    id: 3,
    title: 'OPERAÇÃO SIMULADA PCSP - ESCRIVÃO',
    organization: 'Polícia Civil SP',
    examType: 'Concurso Público',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    passingScore: 50,
    difficulty: 'intermediate',
    tags: ['PC-SP', 'Escrivão', 'VUNESP'],
    attempts: 650,
    userAttempts: 1,
    bestScore: 68.0,
    lastAttempt: '2024-01-15',
    isLocked: false,
    requiredPlan: null,
    avgScore: 61.2,
    totalAttempts: 8750
  },
  {
    id: 4,
    title: 'OPERAÇÃO SIMULADA ENEM - CIÊNCIAS HUMANAS',
    organization: 'INEP',
    examType: 'Vestibular',
    totalQuestions: 45,
    timeLimitMinutes: 90,
    passingScore: 60,
    difficulty: 'intermediate',
    tags: ['ENEM', 'Humanas'],
    attempts: 2340,
    userAttempts: 0,
    bestScore: null,
    lastAttempt: null,
    isLocked: true,
    requiredPlan: 'Premium',
    avgScore: 65.8,
    totalAttempts: 25600
  }
];

export default function MockExamsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const organizations = Array.from(new Set(mockExams.map(exam => exam.organization)));

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

  const handleStartExam = (exam: MockExam) => {
    if (exam.isLocked) {
      toast.error('ACESSO RESTRITO!', {
        description: 'Upgrade necessário para esta operação',
        icon: '🔒'
      });
      navigate('/student/subscription');
    } else {
      toast.success('INICIANDO OPERAÇÃO SIMULADA!', { icon: '🎯' });
      navigate(`/simulations/mock/${exam.id}/take`);
    }
  };

  // Stats Summary
  const totalAttempts = mockExams.reduce((sum, exam) => sum + exam.userAttempts, 0);
  const avgUserScore = mockExams
    .filter(exam => exam.bestScore !== null)
    .reduce((sum, exam, _, arr) => sum + (exam.bestScore || 0) / arr.length, 0);
  const passedExams = mockExams.filter(exam => exam.bestScore !== null && exam.bestScore >= exam.passingScore).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="ARSENAL DE SIMULADOS TÁTICOS"
          subtitle="OPERAÇÕES SIMULADAS PARA TREINAMENTO DE ELITE"
          icon={Target}
          breadcrumbs={[
            { label: 'DASHBOARD', href: '/student/dashboard' },
            { label: 'SIMULADOS' }
          ]}
        />

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="OPERAÇÕES EXECUTADAS"
            value={totalAttempts}
            icon={Target}
            color="blue"
          />

          <StatCard
            title="PRECISÃO TÁTICA"
            value={`${avgUserScore ? avgUserScore.toFixed(1) : '0.0'}%`}
            icon={TrendingUp}
            color="purple"
          />

          <StatCard
            title="MISSÕES APROVADAS"
            value={passedExams}
            icon={Trophy}
            color="green"
          />

          <StatCard
            title="RANKING OPERACIONAL"
            value="#127"
            icon={Award}
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
                placeholder="BUSCAR OPERAÇÕES SIMULADAS..."
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
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                  NÍVEL TÁTICO
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
                  COMANDO
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
            </div>
          </div>
        )}

        {/* Mock Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <div
              key={exam.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                exam.isLocked ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'
              } overflow-hidden hover:shadow-md transition-shadow relative`}
            >
              {exam.isLocked && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                      {exam.requiredPlan}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building className="w-4 h-4" />
                      {exam.organization}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {exam.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Questões</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duração</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {exam.timeLimitMinutes} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Nota de Corte</span>
                    <span className="font-medium text-gray-900 dark:text-white">{exam.passingScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Dificuldade</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {getDifficultyLabel(exam.difficulty)}
                    </span>
                  </div>
                </div>

                {exam.userAttempts > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Melhor Nota</span>
                        <span className={`font-medium ${
                          exam.bestScore && exam.bestScore >= exam.passingScore
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {exam.bestScore?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tentativas</span>
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

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{exam.totalAttempts.toLocaleString()} realizações</span>
                    </div>
                    <span>Média: {exam.avgScore.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {exam.userAttempts > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 font-police-body uppercase tracking-wider"
                        onClick={() => {
                          toast.success('ACESSANDO RELATÓRIOS!', { icon: '📊' });
                          navigate(`/student/simulations/${exam.id}/results`);
                        }}
                      >
                        <Trophy className="w-4 h-4" />
                        RELATÓRIO
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                        onClick={() => handleStartExam(exam)}
                        disabled={exam.isLocked}
                      >
                        <RotateCcw className="w-4 h-4" />
                        REFAZER
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                      onClick={() => handleStartExam(exam)}
                      disabled={exam.isLocked}
                    >
                      <Play className="w-4 h-4" />
                      INICIAR MISSÃO
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <EmptyState
            icon={Target}
            title="NENHUMA OPERAÇÃO ENCONTRADA"
            description="Ajuste os filtros ou tente uma nova busca para encontrar operações simuladas."
            action={{
              label: "LIMPAR FILTROS",
              onClick: () => {
                setSearchTerm('');
                setSelectedDifficulty('all');
                setSelectedOrganization('all');
                setShowFilters(false);
              }
            }}
          />
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 font-police-title uppercase tracking-wider">
                PROTOCOLO TÁTICO PARA OPERAÇÕES SIMULADAS
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside font-police-body">
                <li>RESERVE UM AMBIENTE TÁTICO SEM INTERFERÊNCIAS EXTERNAS</li>
                <li>SIMULE AS CONDIÇÕES REAIS DA OPERAÇÃO DE CAMPO</li>
                <li>GERENCIE O TEMPO COMO EM MISSÃO CRÍTICA</li>
                <li>ANALISE FALHAS APÓS CADA OPERAÇÃO</li>
                <li>REGISTRE ÁREAS QUE PRECISAM DE TREINAMENTO ADICIONAL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}