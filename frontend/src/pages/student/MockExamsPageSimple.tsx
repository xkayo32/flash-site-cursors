import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Target, 
  Clock, 
  Users, 
  Shield, 
  Play,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle,
  Crosshair,
  Award,
  Zap,
  TrendingUp,
  Activity,
  Timer,
  Brain,
  Sword
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockExamService, type MockExam as MockExamAPI, type DifficultyLevel } from '@/services/mockExamService';

interface MockExamDisplay {
  id: string;
  title: string;
  organization: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  difficulty: string;
  isActive: boolean;
}

export default function MockExamsPageSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('TODOS');
  const [mockExams, setMockExams] = useState<MockExamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load mock exams from API
  useEffect(() => {
    loadMockExams();
  }, []);

  const loadMockExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockExamService.getAvailableExams();
      
      if (response.success && response.data) {
        // Transform API data to display format
        const transformedExams: MockExamDisplay[] = response.data.map((exam: MockExamAPI) => ({
          id: exam.id,
          title: exam.title.toUpperCase(),
          organization: `COMANDO ${exam.description ? exam.description.split(' ')[0] : 'GERAL'}`,
          totalQuestions: exam.total_questions,
          timeLimitMinutes: exam.duration,
          difficulty: exam.difficulty,
          isActive: exam.status === 'published'
        }));
        
        setMockExams(transformedExams);
      } else {
        throw new Error('Falha ao carregar simulados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar simulados:', err);
      setError(err.message || 'Erro ao carregar simulados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'TODOS' || exam.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'RECRUTA': return 'text-green-600 dark:text-green-400';
      case 'CABO': return 'text-amber-600 dark:text-amber-400';
      case 'SARGENTO': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full relative">
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
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            ARSENAL DE SIMULAÇÕES TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            TESTE SUAS HABILIDADES COM SIMULAÇÕES COMPLETAS DE OPERAÇÕES TÁTICAS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-police-numbers border-accent-500 text-accent-500">
            {filteredExams.length} SIMULAÇÕES DISPONÍVEIS
          </Badge>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row items-center gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR SIMULAÇÕES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
          >
            <option value="TODOS">TODOS OS NÍVEIS</option>
            <option value="RECRUTA">RECRUTA</option>
            <option value="CABO">CABO</option>
            <option value="SARGENTO">SARGENTO</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Target, label: 'SIMULAÇÕES ATIVAS', value: mockExams.filter(e => e.isActive).length, color: 'text-green-600' },
            { icon: Clock, label: 'TEMPO MÉDIO', value: mockExams.length > 0 ? `${Math.round(mockExams.reduce((acc, exam) => acc + exam.timeLimitMinutes, 0) / mockExams.length)} MIN` : '0 MIN', color: 'text-amber-600' },
            { icon: Shield, label: 'TOTAL DISPONÍVEL', value: mockExams.length, color: 'text-accent-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                CARREGANDO SIMULAÇÕES TÁTICAS...
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-red-200 dark:border-red-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
                {error}
              </p>
              <Button
                onClick={loadMockExams}
                variant="outline"
                className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
              >
                TENTAR NOVAMENTE
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Simulados Grid */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
            <Card className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl relative overflow-hidden backdrop-blur-sm group">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider group-hover:text-accent-500 transition-colors">
                      {exam.title}
                    </h3>
                    <Badge variant="outline" className="text-xs font-police-body border-gray-400 text-gray-600 dark:text-gray-400">
                      {exam.organization}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className={`font-police-subtitle tracking-wider border-2 border-current ${getDifficultyColor(exam.difficulty)}`}>
                    {exam.difficulty}
                  </Badge>
                </div>
                
                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-500" />
                      <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">ALVOS:</span>
                    </div>
                    <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-500" />
                      <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">DURAÇÃO:</span>
                    </div>
                    <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.timeLimitMinutes} min</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/simulations/${exam.id}/take`)}
                    className="w-full bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    INICIAR OPERAÇÃO
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/simulations/${exam.id}/details`)}
                    className="w-full font-police-body uppercase tracking-wider gap-2 hover:border-accent-500 hover:text-accent-500"
                  >
                    DETALHES TÁTICOS
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tactical Command Center */}
      {!loading && !error && filteredExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-white relative overflow-hidden border border-accent-500/20"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(250, 204, 21, 0.1) 20px,
                rgba(250, 204, 21, 0.1) 40px
              )`
            }} />
          </div>
          
          {/* Corner tactical accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-accent-500/30"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent-500/30"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent-500/30"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent-500/30"></div>
          
          <div className="relative z-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sword className="w-8 h-8 text-accent-500 mr-2" />
                  <span className="text-3xl font-bold font-police-numbers text-accent-500">
                    {mockExams.filter(e => e.isActive).length}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                  OPERAÇÕES ATIVAS
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crosshair className="w-8 h-8 text-accent-500 mr-2" />
                  <span className="text-3xl font-bold font-police-numbers text-accent-500">
                    {mockExams.reduce((acc, exam) => acc + exam.totalQuestions, 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                  TOTAL DE ALVOS
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="w-8 h-8 text-accent-500 mr-2" />
                  <span className="text-3xl font-bold font-police-numbers text-accent-500">
                    {mockExams.length > 0 ? Math.round(mockExams.reduce((acc, exam) => acc + exam.timeLimitMinutes, 0) / mockExams.length) : 0}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                  TEMPO MÉDIO (MIN)
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-8 h-8 text-accent-500 mr-2" />
                  <span className="text-3xl font-bold font-police-numbers text-accent-500">
                    {filteredExams.length}
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                  OPERAÇÕES DISPONÍVEIS
                </p>
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-2 h-8 bg-accent-500 mr-3"></div>
                <Crosshair className="w-10 h-10 text-accent-500 mr-3" />
                <div className="w-2 h-8 bg-accent-500"></div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-3 font-police-title uppercase tracking-wider">
                CENTRO DE OPERAÇÕES TÁTICAS
              </h2>
              
              <p className="text-gray-300 mb-2 max-w-3xl mx-auto font-police-body tracking-wider">
                PREPARE-SE PARA O COMBATE COM SIMULAÇÕES REALÍSTICAS DE CAMPO
              </p>
              
              <div className="w-24 h-1 bg-accent-500 mx-auto"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => {
                  // Find a random active exam
                  const activeExams = mockExams.filter(e => e.isActive);
                  if (activeExams.length > 0) {
                    const randomExam = activeExams[Math.floor(Math.random() * activeExams.length)];
                    navigate(`/simulations/${randomExam.id}/take`);
                  }
                }}
                className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black hover:text-white dark:hover:text-white font-police-body font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl min-w-[220px]"
              >
                <Zap className="w-5 h-5 mr-2" />
                MISSÃO ALEATÓRIA
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const totalTime = mockExams.reduce((acc, exam) => acc + exam.timeLimitMinutes, 0);
                  const totalQuestions = mockExams.reduce((acc, exam) => acc + exam.totalQuestions, 0);
                  const avgDifficulty = mockExams.length > 0 
                    ? Math.round((mockExams.filter(e => e.difficulty === 'SARGENTO').length / mockExams.length) * 100)
                    : 0;
                  
                  alert(`🎯 RELATÓRIO DE OPERAÇÕES\n\n⚡ ${mockExams.filter(e => e.isActive).length} operações ativas\n🎯 ${totalQuestions} alvos totais disponíveis\n⏱️ ${totalTime} minutos de combate total\n🔥 ${avgDifficulty}% operações de alta dificuldade`);
                }}
                className="border-accent-500/50 hover:border-accent-500 text-white hover:bg-accent-500/10 font-police-body font-semibold uppercase tracking-wider transition-all duration-300 min-w-[220px]"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                RELATÓRIO DE COMBATE
              </Button>
            </div>

            {/* Performance Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-police-body uppercase">PRONTIDÃO OPERACIONAL:</span>
                <span className="text-sm font-bold text-accent-500 font-police-numbers">
                  {mockExams.filter(e => e.isActive).length}/{mockExams.length} OPERACIONAIS
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${mockExams.length > 0 ? Math.round((mockExams.filter(e => e.isActive).length / mockExams.length) * 100) : 0}%` 
                  }}
                  transition={{ duration: 1, delay: 1 }}
                  className="bg-gradient-to-r from-accent-500 to-yellow-400 h-full rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredExams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              NENHUMA SIMULAÇÃO LOCALIZADA COM OS FILTROS APLICADOS
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedDifficulty('TODOS');
              }}
              className="mt-4 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              LIMPAR FILTROS
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}