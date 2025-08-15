import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Clock,
  Shield,
  Play,
  Loader2,
  AlertCircle,
  Award,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockExamService, type MockExam as MockExamAPI } from '@/services/mockExamService';

interface SimulationDetails extends MockExamAPI {
  organization: string;
}

export default function SimulationDetailsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState<SimulationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingExam, setStartingExam] = useState(false);

  useEffect(() => {
    if (examId) {
      loadSimulationDetails();
    }
  }, [examId]);

  const loadSimulationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get simulation details from available exams
      const response = await mockExamService.getAvailableExams();
      
      if (response.success && response.data) {
        const exam = response.data.find(e => e.id === examId);
        
        if (exam) {
          // Extract organization from title for tactical display
          let organization = 'COMANDO GERAL';
          if (exam.title.includes('Polícia Federal') || exam.title.includes('PF')) {
            organization = 'COMANDO PF';
          } else if (exam.title.includes('PRF') || exam.title.includes('Rodoviário')) {
            organization = 'COMANDO PRF';
          } else if (exam.title.includes('Polícia Civil')) {
            organization = 'COMANDO PC';
          } else if (exam.title.includes('Polícia Militar') || exam.title.includes('PM')) {
            organization = 'COMANDO PM';
          } else if (exam.title.includes('Tribunal')) {
            organization = 'COMANDO TCU';
          } else if (exam.title.includes('Constitucional')) {
            organization = 'COMANDO JURÍDICO';
          }

          setSimulation({
            ...exam,
            organization
          });
        } else {
          setError('Simulado não encontrado');
        }
      } else {
        throw new Error('Falha ao carregar detalhes do simulado');
      }
    } catch (err: any) {
      console.error('Erro ao carregar simulado:', err);
      setError(err.message || 'Erro ao carregar detalhes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!simulation) return;
    
    try {
      setStartingExam(true);
      const response = await mockExamService.startExam(simulation.id);
      
      if (response.success && response.data) {
        navigate(`/exam/${response.data.attempt_id}`);
      } else {
        setError('Erro ao iniciar simulado. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao iniciar simulado:', err);
      
      // Handle specific case where user has in-progress attempt
      if (err.response?.status === 400 && err.response?.data?.data?.attempt_id) {
        // User has in-progress attempt, redirect to continue it
        const attemptId = err.response.data.data.attempt_id;
        navigate(`/exam/${attemptId}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao iniciar simulado. Verifique sua conexão.');
      }
    } finally {
      setStartingExam(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'RECRUTA': return 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400';
      case 'CABO': return 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400';
      case 'SARGENTO': return 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400';
      default: return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'AUTOMATIC': return 'AUTOMÁTICO';
      case 'MANUAL': return 'MANUAL';
      case 'RANDOM': return 'ALEATÓRIO';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              CARREGANDO DETALHES TÁTICOS...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-red-200 dark:border-red-800 p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
              {error || 'Simulado não encontrado'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={loadSimulationDetails}
                variant="outline"
                className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
              >
                TENTAR NOVAMENTE
              </Button>
              <Button
                onClick={() => navigate('/simulations')}
                variant="outline"
                className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                VOLTAR
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
        className="flex items-center gap-4"
      >
        <Button
          onClick={() => navigate('/simulations')}
          variant="outline"
          size="sm"
          className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          VOLTAR
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            BRIEFING OPERACIONAL
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            ANÁLISE DETALHADA DA OPERAÇÃO TÁTICA
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operation Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">
                      {simulation.title}
                    </h2>
                    <Badge variant="outline" className="text-sm font-police-body border-gray-400 text-gray-600 dark:text-gray-400 mb-3">
                      {simulation.organization}
                    </Badge>
                    <p className="text-gray-600 dark:text-gray-400 font-police-body leading-relaxed">
                      {simulation.description}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`font-police-subtitle tracking-wider border-2 ${getDifficultyColor(simulation.difficulty)} text-lg px-4 py-2`}
                  >
                    {simulation.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Operation Parameters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                  PARÂMETROS DA OPERAÇÃO
                </h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-accent-500" />
                      <span className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300">ALVOS TOTAIS:</span>
                    </div>
                    <span className="text-2xl font-bold font-police-numbers text-gray-900 dark:text-white">
                      {simulation.total_questions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-accent-500" />
                      <span className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300">DURAÇÃO:</span>
                    </div>
                    <span className="text-2xl font-bold font-police-numbers text-gray-900 dark:text-white">
                      {simulation.duration} MIN
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-accent-500" />
                      <span className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300">NOTA MÍNIMA:</span>
                    </div>
                    <span className="text-2xl font-bold font-police-numbers text-gray-900 dark:text-white">
                      {simulation.passing_score}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-accent-500" />
                      <span className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300">TIPO:</span>
                    </div>
                    <span className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">
                      {getTypeLabel(simulation.type)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                  INTEL OPERACIONAL
                </h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold font-police-numbers text-blue-900 dark:text-blue-100">
                      {simulation.total_attempts}
                    </div>
                    <div className="text-sm font-police-body uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      OPERADORES
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Award className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold font-police-numbers text-green-900 dark:text-green-100">
                      {simulation.average_score.toFixed(1)}%
                    </div>
                    <div className="text-sm font-police-body uppercase tracking-wider text-green-700 dark:text-green-300">
                      PRECISÃO MÉDIA
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold font-police-numbers text-amber-900 dark:text-amber-100">
                      {simulation.pass_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm font-police-body uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      TAXA DE SUCESSO
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Action Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-[#14242f] text-white shadow-xl relative overflow-hidden">
              {/* Corner tactical accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-500/30"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/30"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500/30"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-2 h-8 bg-accent-500 mr-3"></div>
                  <Target className="w-10 h-10 text-accent-500 mr-3" />
                  <div className="w-2 h-8 bg-accent-500"></div>
                </div>
                <h3 className="text-xl font-bold font-police-title uppercase tracking-wider text-center">
                  PAINEL TÁTICO
                </h3>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 relative z-10">
                <div className="space-y-4">
                  
                  {/* Attempts Info */}
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="font-police-body text-sm uppercase tracking-wider text-gray-300">
                        TENTATIVAS:
                      </span>
                      <span className="font-police-numbers text-lg font-bold">
                        {simulation.user_attempts || 0}/{simulation.max_attempts}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="font-police-body text-sm uppercase tracking-wider text-gray-300">
                        STATUS:
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="font-police-numbers text-sm font-bold text-green-400">
                          OPERACIONAL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleStartExam}
                      disabled={startingExam}
                      className="w-full bg-accent-500 dark:bg-gray-100 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-bold uppercase tracking-wider gap-2 transition-all duration-300 hover:scale-105 shadow-lg text-lg py-4"
                    >
                      {startingExam ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                      {startingExam ? 'INICIANDO...' : 'INICIAR OPERAÇÃO'}
                      {!startingExam && <ArrowRight className="w-6 h-6 ml-2" />}
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t border-white/20">
                    <div className="space-y-2 text-sm text-gray-300 font-police-body">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent-500" />
                        <span>DISPONÍVEL 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent-500" />
                        <span>CORREÇÃO AUTOMÁTICA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent-500" />
                        <span>RELATÓRIO DETALHADO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}