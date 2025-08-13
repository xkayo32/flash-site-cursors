import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, StatCardSkeleton, GoalCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  BookmarkPlus,
  Settings,
  Gift,
  Flame,
  ChevronRight,
  Timer,
  Medal,
  Lightbulb,
  RefreshCw,
  Wifi,
  WifiOff,
  GraduationCap,
  CalendarDays,
  UserCheck,
  BookMarked,
  ChevronLeft,
  Info,
  Shield,
  Activity,
  AlertTriangle,
  Command,
  Crosshair
} from 'lucide-react';
import { dashboardService, type StudentDashboardData } from '@/services/dashboardService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  // Estados de loading e dados
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para calendário
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setError(null);
      const response = await dashboardService.getStudentDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Erro ao carregar dados do painel');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregamento inicial
  useEffect(() => {
    loadDashboardData();

    // Listener para status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Função para refresh dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
      toast.success('DADOS TÁTICOS ATUALIZADOS!', {
        icon: '🎯',
        duration: 3000
      });
    } catch (error) {
      toast.error('FALHA NA ATUALIZAÇÃO TÁTICA', {
        icon: '⚠️'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to construct proper image URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';
  const getImageUrl = (path: string | undefined | null): string | null => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it starts with /uploads/, prepend the API base URL
    if (path.startsWith('/uploads/')) {
      return `${API_BASE_URL}${path}`;
    }
    
    // Otherwise return the path as is
    return path;
  };

  // Helper to get user initials
  const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'BOM DIA';
    if (hour < 18) return 'BOA TARDE';
    return 'BOA NOITE';
  };

  // Se não tem dados ainda, mostrar loading
  if (isLoading || !dashboardData) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Se houve erro, mostrar mensagem
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-police-title uppercase tracking-wider text-gray-900 dark:text-white mb-2">
            FALHA NA COMUNICAÇÃO TÁTICA
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            TENTAR NOVAMENTE
          </Button>
        </Card>
      </div>
    );
  }

  const stats = dashboardData.statistics;
  
  const statsCards = [
    {
      title: 'EXERCÍCIOS TÁTICOS COMPLETADOS',
      value: stats.questionsAnswered.toLocaleString(),
      icon: Crosshair,
      color: 'text-accent-500',
      bgColor: 'bg-blue-100',
      progress: stats.accuracyRate,
      change: '+12%',
      trend: 'up' as const,
    },
    {
      title: 'TAXA DE PRECISÃO',
      value: `${stats.accuracyRate}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: stats.accuracyRate,
      change: '+5%',
      trend: 'up' as const,
    },
    {
      title: 'CARTÕES TÁTICOS REVISADOS',
      value: stats.flashcardsReviewed.toLocaleString(),
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      progress: 85,
      change: '-2%',
      trend: 'down' as const,
    },
    {
      title: 'SEQUÊNCIA OPERACIONAL',
      value: `${stats.studyStreak} DIAS`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      progress: (stats.studyStreak / 30) * 100,
      change: '+1',
      trend: 'up' as const,
    },
  ];

  // Mapear dados da API para o formato esperado pelos componentes visuais
  const dailyGoals = dashboardData.dailyGoals.map((goal, index) => {
    const colorConfigs = [
      {
        color: 'blue',
        icon: Crosshair,
        bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
        borderColor: 'border-blue-200 dark:border-blue-700',
        iconBg: 'bg-blue-100 dark:bg-blue-800/50',
        iconColor: 'text-accent-500 dark:text-accent-400',
        progressGradient: 'from-blue-400 to-blue-600'
      },
      {
        color: 'purple',
        icon: Brain,
        bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
        borderColor: 'border-purple-200 dark:border-purple-700',
        iconBg: 'bg-purple-100 dark:bg-purple-800/50',
        iconColor: 'text-purple-600 dark:text-purple-400',
        progressGradient: 'from-purple-400 to-purple-600'
      },
      {
        color: 'amber',
        icon: Clock,
        bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30',
        borderColor: 'border-amber-200 dark:border-amber-700',
        iconBg: 'bg-amber-100 dark:bg-amber-800/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        progressGradient: 'from-amber-400 to-amber-600'
      },
      {
        color: 'green',
        icon: Trophy,
        bgGradient: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
        borderColor: 'border-green-200 dark:border-green-700',
        iconBg: 'bg-green-100 dark:bg-green-800/50',
        iconColor: 'text-green-600 dark:text-green-400',
        progressGradient: 'from-green-400 to-green-600'
      }
    ];
    
    const config = colorConfigs[index] || colorConfigs[0];
    
    return {
      ...goal,
      ...config
    };
  });

  const upcomingEvents = dashboardData.upcomingEvents;

  const editalProgress = dashboardData.editalProgress;

  const studyTips = dashboardData.studyTips;

  const weakSubjects = dashboardData.weakSubjects;

  // Dados dos esquadrões (antigas turmas)
  const userGroups = dashboardData.userGroups;

  // Eventos do calendário
  const calendarEvents = {
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-15`]: [
      { type: 'exam', title: 'SIMULAÇÃO NACIONAL', time: '14:00' },
      { type: 'class', title: 'BRIEFING AO VIVO - DIR. PENAL', time: '19:00' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-18`]: [
      { type: 'deadline', title: 'ENTREGA DE RELATÓRIOS', time: '23:59' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-22`]: [
      { type: 'class', title: 'REVISÃO GERAL TÁTICA', time: '20:00' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-25`]: [
      { type: 'exam', title: 'OPERAÇÃO FINAL - MÓDULO 3', time: '09:00' }
    ]
  };

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Dias do mês anterior
    for (let i = firstDay; i > 0; i--) {
      days.push({
        date: new Date(year, month, 1 - i),
        isCurrentMonth: false
      });
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    // Completar a última semana
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-500';
      case 'class': return 'bg-blue-500';
      case 'deadline': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Função para obter tooltips explicativos dos cards
  const getGoalTooltip = (goal: any) => {
    switch (goal.type) {
      case 'questions':
        return 'EXERCÍCIOS TÁTICOS: Complete questões de concursos para treinar seus conhecimentos. Meta diária recomendada para manter o ritmo de estudos.';
      case 'flashcards':
        return 'CARTÕES TÁTICOS: Revise flashcards para fixar conceitos importantes. O sistema de repetição espaçada otimiza sua memorização.';
      case 'study_time':
        return 'TEMPO DE TREINO: Dedique tempo aos estudos para construir disciplina. Inclui aulas, exercícios e revisões. Meta em horas.';
      case 'simulation':
        return 'SIMULAÇÃO TÁTICA: Execute simulados para testar seus conhecimentos em condições reais de prova. Essencial para aprovação.';
      default:
        return 'OBJETIVO OPERACIONAL: Complete esta meta diária para manter seu progresso nos estudos.';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header com saudação personalizada */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border border-gray-700">
          {/* Tactical background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500 to-transparent" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500 to-transparent" />
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-police-title font-bold uppercase tracking-wider text-white">
                  {getCurrentTime()}, OPERADOR {dashboardData.user?.name?.split(' ')[0]?.toUpperCase() || 'RECRUTA'}! 
                </h1>
                <Command className="w-6 h-6 text-accent-500" />
                <div className="flex items-center gap-2">
                  {/* Status de conexão */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-police-body uppercase tracking-wider border ${
                    isOnline 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? 'OPERACIONAL' : 'OFFLINE'}
                  </div>
                  
                  {/* Botão de refresh */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider">
                COMANDO TÁTICO ATIVO. MANTENHA FOCO NA MISSÃO E EXCELÊNCIA OPERACIONAL!
              </p>
            </div>
          
            <div className="flex items-center gap-4">
              {/* Informações do plano - Mobile friendly */}
              <div className="text-right">
                <div className="flex items-center gap-2 lg:justify-end">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-accent-500 flex items-center justify-center shadow-lg">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-police-body font-medium text-white uppercase tracking-wider">
                      CLEARANCE {dashboardData.user?.subscription?.plan?.toUpperCase() || 'BÁSICO'}
                    </p>
                    <p className="text-xs text-gray-300 font-police-numbers">
                      EXPIRA EM {dashboardData.user?.subscription?.expiresAt || '30 DIAS'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Avatar do usuário */}
              <div className="relative">
                {dashboardData.user?.avatar && getImageUrl(dashboardData.user.avatar) ? (
                  <img
                    src={getImageUrl(dashboardData.user.avatar)!}
                    alt={dashboardData.user?.name || 'Usuário'}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-accent-500 hover:border-accent-600 transition-colors cursor-pointer shadow-lg object-cover"
                    onClick={() => navigate('/settings')}
                  />
                ) : (
                  <div
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-accent-500 hover:border-accent-600 transition-colors cursor-pointer shadow-lg bg-gradient-to-br from-[#14242f] to-gray-800 flex items-center justify-center"
                    onClick={() => navigate('/settings')}
                  >
                    <span className="text-white font-police-title text-sm lg:text-base font-semibold">
                      {getUserInitials(dashboardData.user?.name)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas principais com tendências */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, shadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                {/* Tactical corner elements */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/20" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-police-numbers font-medium px-2 py-1 rounded-full ${
                      stat.trend === 'up' 
                        ? 'text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-400' 
                        : 'text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-police-numbers font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">{stat.title}</p>
                  
                  {/* Progress Bar melhorada */}
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          stat.progress >= 75 
                            ? 'from-green-400 to-green-600' 
                            : stat.progress >= 50 
                            ? 'from-yellow-400 to-yellow-600' 
                            : 'from-red-400 to-red-600'
                        }`}
                      />
                    </div>
                    <span className="absolute right-0 -top-6 text-xs font-police-numbers font-medium text-gray-700 dark:text-gray-300">
                      {stat.progress}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Objetivos da Missão (antigas Metas Diárias) */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 relative overflow-hidden">
              {/* Tactical stripes */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-transparent to-accent-500 opacity-50" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-30" />
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white font-police-title uppercase tracking-wider">
                    <Crosshair className="w-5 h-5 text-accent-500" />
                    ALVOS OPERACIONAIS - HOJE
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-police-body text-gray-300 uppercase tracking-wider">
                      {dailyGoals.filter(goal => goal.completed >= goal.total).length}/{dailyGoals.length} CONCLUÍDOS
                    </span>
                    <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
                      <span className="text-xs font-police-numbers font-bold text-black">
                        {Math.round((dailyGoals.filter(goal => goal.completed >= goal.total).length / dailyGoals.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dailyGoals.map((goal, index) => {
                    const Icon = goal.icon;
                    const progress = (goal.completed / goal.total) * 100;
                    const isCompleted = goal.completed >= goal.total;
                    
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative group"
                      >
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                          isCompleted 
                            ? `border-green-300 dark:border-green-600 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-green-100` 
                            : `${goal.borderColor} bg-gradient-to-br ${goal.bgGradient} hover:shadow-lg`
                        } shadow-lg hover:shadow-xl`}>
                          
                          {/* Tooltip explicativo */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 max-w-80 text-center shadow-xl border border-gray-200 dark:border-gray-600 leading-relaxed">
                              {getGoalTooltip(goal)}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                            </div>
                          </div>
                          
                          {/* Efeito de confete para metas concluídas */}
                          {isCompleted && (
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="absolute top-3 right-3 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="absolute bottom-3 left-3 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl transition-all ${
                              isCompleted 
                                ? 'bg-green-200 dark:bg-green-800/70 shadow-md scale-110' 
                                : goal.iconBg
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isCompleted ? 'text-green-700 dark:text-green-300' : goal.iconColor
                              }`} />
                            </div>
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.6 }}
                              >
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </motion.div>
                            )}
                          </div>
                          
                          <p className="text-sm font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 leading-relaxed">
                            {goal.task}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="font-police-numbers font-medium text-gray-700 dark:text-gray-300">
                              {goal.type === 'study_time' 
                                ? `${parseFloat(goal.completed).toFixed(2)}/${goal.total}` 
                                : `${Math.round(goal.completed)}/${goal.total}`
                              }
                            </span>
                            <span className={`font-police-numbers font-bold px-2 py-1 rounded-full text-xs ${
                              isCompleted 
                                ? 'bg-green-200 dark:bg-green-800/70 text-green-800 dark:text-green-200' 
                                : `${goal.iconBg} ${goal.iconColor}`
                            }`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          
                          <div className="relative">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                                className={`h-full rounded-full transition-all ${
                                  isCompleted 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                    : `bg-gradient-to-r ${goal.progressGradient}`
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Motivational message */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-accent-100/50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                      <Flame className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">MANTENHA O RITMO OPERACIONAL!</p>
                      <p className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                        {dailyGoals.filter(goal => goal.completed >= goal.total).length === dailyGoals.length
                          ? "🎯 TODOS OS OBJETIVOS CONCLUÍDOS! VOCÊ É UM OPERADOR DE ELITE!"
                          : `FALTAM APENAS ${dailyGoals.length - dailyGoals.filter(goal => goal.completed >= goal.total).length} OBJETIVOS PARA COMPLETAR A MISSÃO.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
      </motion.div>

      {/* Progresso no Edital - Inspirado no Painel Tático */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Tactical corner accents */}
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent-500/20" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent-500/20" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Activity className="w-5 h-5 text-accent-500" />
                STATUS OPERACIONAL - PF AGENTE
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/student/tactical-panel')}
                className="gap-2 font-police-body uppercase tracking-wider hover:bg-accent-500 hover:text-black border border-accent-500/30 hover:border-accent-500"
              >
                COMANDO TÁTICO
                <Command className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editalProgress.map((materia, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">{materia.materia}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-police-numbers text-gray-600 dark:text-gray-400">
                        {materia.concluido}/{materia.total} TÓPICOS
                      </span>
                      <span className={`text-sm font-police-numbers font-medium ${
                        materia.porcentagem >= 75 ? 'text-green-600 dark:text-green-400' :
                        materia.porcentagem >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {materia.porcentagem}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        materia.porcentagem >= 75 ? 'bg-green-500' :
                        materia.porcentagem >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${materia.porcentagem}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-police-numbers font-bold text-green-600 dark:text-green-400">
                    {Math.round(editalProgress.reduce((acc, curr) => acc + curr.porcentagem, 0) / editalProgress.length)}%
                  </p>
                  <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">PROGRESSO GERAL</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-police-numbers font-bold text-accent-500 dark:text-accent-400">
                    {editalProgress.reduce((acc, curr) => acc + curr.concluido, 0)}
                  </p>
                  <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">TÓPICOS CONCLUÍDOS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-police-numbers font-bold text-orange-600 dark:text-orange-400">
                    {editalProgress.reduce((acc, curr) => acc + (curr.total - curr.concluido), 0)}
                  </p>
                  <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">TÓPICOS RESTANTES</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ações Rápidas melhorado */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Tactical grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-police-title text-gray-900 dark:text-white uppercase tracking-wider">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center shadow-lg border border-accent-600">
                <Command className="w-5 h-5 text-black" />
              </div>
              ARSENAL TÁTICO - ACESSO RÁPIDO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Crosshair,
                  title: "ARSENAL TÁTICO",
                  subtitle: "32/50 ALVOS ELIMINADOS",
                  color: "blue",
                  path: "/student/questions",
                  bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
                  borderColor: "border-blue-200 dark:border-blue-700",
                  hoverColor: "hover:border-blue-300 dark:hover:border-blue-600"
                },
                {
                  icon: Brain,
                  title: "INTEL CARDS",
                  subtitle: "15 BRIEFINGS PENDENTES",
                  color: "purple",
                  path: "/student/flashcards",
                  bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30",
                  borderColor: "border-purple-200 dark:border-purple-700",
                  hoverColor: "hover:border-purple-300 dark:hover:border-purple-600"
                },
                {
                  icon: Trophy,
                  title: "OPERAÇÃO SIMULADA",
                  subtitle: "TREINO OPERACIONAL",
                  color: "green",
                  path: "/student/mock-exams",
                  bgGradient: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30",
                  borderColor: "border-green-200 dark:border-green-700",
                  hoverColor: "hover:border-green-300 dark:hover:border-green-600"
                },
                {
                  icon: Calendar,
                  title: "PLANEJAMENTO TÁTICO",
                  subtitle: "ORGANIZAR MISSÕES",
                  color: "amber",
                  path: "/student/schedule",
                  bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30",
                  borderColor: "border-amber-200 dark:border-amber-700",
                  hoverColor: "hover:border-amber-300 dark:hover:border-amber-600"
                }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => navigate(action.path)}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group ${action.borderColor} ${action.hoverColor} bg-gradient-to-br ${action.bgGradient} hover:shadow-lg active:shadow-sm`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-${action.color}-100`}>
                          <Icon className={cn(
                            "w-7 h-7",
                            action.color === 'blue' && "text-accent-500",
                            action.color === 'purple' && "text-purple-600",
                            action.color === 'green' && "text-green-600",
                            action.color === 'amber' && "text-amber-600"
                          )} />
                        </div>
                        <div>
                          <h3 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors uppercase tracking-wider">
                            {action.title}
                          </h3>
                          <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors uppercase tracking-wider">
                            {action.subtitle}
                          </p>
                        </div>
                        <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className={cn(
                            "w-3 h-3",
                            action.color === 'blue' && "text-accent-500",
                            action.color === 'purple' && "text-purple-600",
                            action.color === 'green' && "text-green-600",
                            action.color === 'amber' && "text-amber-600"
                          )} />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Esquadrões e Calendário */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meus Esquadrões */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
              <Users className="w-5 h-5 text-accent-500" />
              MEUS ESQUADRÕES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userGroups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.badge}</span>
                    <div>
                      <h3 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        {group.instructor} • {group.members} OPERADORES
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-accent-500 text-black font-police-numbers font-semibold">
                      #{group.rank}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-police-body uppercase tracking-wider">
                      {group.role}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">PROGRESSO DO MÓDULO</span>
                    <span className="font-police-numbers font-bold text-gray-900 dark:text-white">{group.progress}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all"
                      style={{ width: `${group.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>{group.nextActivity}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1 font-police-body uppercase tracking-wider hover:bg-accent-500 hover:text-black dark:hover:bg-accent-600 hover:border-accent-500 dark:hover:border-accent-600 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                    ACESSAR
                  </Button>
                </div>
              </motion.div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full gap-2 font-police-subtitle uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
              onClick={() => navigate('/student/groups')}
            >
              <Users className="w-4 h-4" />
              EXPLORAR MAIS ESQUADRÕES
            </Button>
          </CardContent>
        </Card>

        {/* Calendário Operacional */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                <CalendarDays className="w-5 h-5 text-accent-500" />
                CALENDÁRIO OPERACIONAL
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth('prev')}
                  className="p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth('next')}
                  className="p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
                <div key={day} className="text-center text-xs font-police-subtitle font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((dayInfo, index) => {
                const dateKey = formatDateKey(dayInfo.date);
                const events = calendarEvents[dateKey] || [];
                const hasEvents = events.length > 0;
                const isSelected = selectedDate.toDateString() === dayInfo.date.toDateString();
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedDate(dayInfo.date)}
                    className={cn(
                      "relative p-2 min-h-[60px] rounded-lg cursor-pointer transition-all",
                      dayInfo.isCurrentMonth ? "bg-gray-50 dark:bg-gray-700/30" : "bg-gray-100/50 dark:bg-gray-800/30",
                      isToday(dayInfo.date) && "ring-2 ring-accent-500",
                      isSelected && "bg-accent-100 dark:bg-accent-900/30",
                      "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-police-numbers",
                      dayInfo.isCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600",
                      isToday(dayInfo.date) && "font-bold text-accent-600 dark:text-accent-400"
                    )}>
                      {dayInfo.date.getDate()}
                    </span>
                    
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                        {events.map((event, idx) => (
                          <div
                            key={idx}
                            className={cn("w-1 h-1 rounded-full", getEventTypeColor(event.type))}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Eventos do dia selecionado */}
            {calendarEvents[formatDateKey(selectedDate)] && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                  OPERAÇÕES - {selectedDate.toLocaleDateString('pt-BR')}
                </h4>
                <div className="space-y-2">
                  {calendarEvents[formatDateKey(selectedDate)].map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", getEventTypeColor(event.type))} />
                      <span className="font-police-numbers text-gray-600 dark:text-gray-400">{event.time}</span>
                      <span className="text-gray-900 dark:text-white font-police-body uppercase tracking-wider">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">OPERAÇÃO</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">BRIEFING</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">PRAZO</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid de 3 colunas: Próximas Operações, Áreas de Melhoria, Inteligência Tática */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Operações */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 text-accent-500" />
              PRÓXIMAS OPERAÇÕES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const getEventColor = (type: string) => {
                switch (type) {
                  case 'exam': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
                  case 'simulation': return 'text-accent-500 bg-accent-100 dark:bg-accent-900/50 dark:text-accent-400';
                  default: return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400';
                }
              };
              
              return (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-police-body font-medium text-gray-900 dark:text-white text-sm uppercase tracking-wider">{event.title}</h4>
                    <span className={`text-xs font-police-numbers px-2 py-1 rounded-full ${getEventColor(event.type)}`}>
                      {event.daysLeft}D
                    </span>
                  </div>
                  <p className="text-xs font-police-numbers text-gray-600 dark:text-gray-400 mb-2">{event.date}</p>
                  {event.progress && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-accent-500 h-1.5 rounded-full"
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-police-numbers text-gray-600 dark:text-gray-400">{event.progress}%</span>
                    </div>
                  )}
                </div>
              );
            })}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
            >
              VER TODAS AS OPERAÇÕES
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Áreas de Melhoria Tática */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              FOCO TÁTICO NECESSÁRIO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakSubjects.map((subject, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-police-body font-medium text-gray-900 dark:text-white text-sm uppercase tracking-wider">{subject.name}</h4>
                  <span className="text-sm font-police-numbers font-medium text-red-600 dark:text-red-400">{subject.accuracy}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <p className="text-xs font-police-numbers text-gray-600 dark:text-gray-400">{subject.questions} EXERCÍCIOS REALIZADOS</p>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
            >
              VER RELATÓRIO COMPLETO
              <BarChart3 className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Inteligência Tática do Dia */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
              <Lightbulb className="w-5 h-5 text-accent-500" />
              INTELIGÊNCIA TÁTICA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg">
                <Lightbulb className="w-6 h-6 text-accent-600 dark:text-accent-400 mb-2" />
                <p className="text-sm font-police-subtitle text-accent-800 dark:text-accent-200 font-medium mb-2 uppercase tracking-wider">
                  TÉCNICA OPERACIONAL DO DIA
                </p>
                <p className="text-sm font-police-body text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                  {studyTips[0]}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white text-sm uppercase tracking-wider">OUTRAS TÁTICAS:</h4>
                {studyTips.slice(1, 3).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-police-body text-gray-700 dark:text-gray-300 uppercase tracking-wider">{tip}</p>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
              >
                VER MAIS INTELIGÊNCIA
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Operações em Andamento e Atividade Recente */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <BookOpen className="w-5 h-5 text-accent-500" />
                OPERAÇÕES EM ANDAMENTO
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                className="font-police-body uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                VER TODAS
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.courses.map((course) => (
              <div
                key={course.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{course.name}</h4>
                  <span className="text-sm font-police-numbers font-medium text-gray-600 dark:text-gray-400">{course.progress}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
                    <Crosshair className="w-4 h-4" />
                    {course.totalQuestions} EXERCÍCIOS
                  </span>
                  <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
                    <Brain className="w-4 h-4" />
                    {course.totalFlashcards} CARDS
                  </span>
                  <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    {Math.floor(Math.random() * 500) + 100} OPERADORES
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
              <Activity className="w-5 h-5 text-accent-500" />
              ATIVIDADE OPERACIONAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => {
                const getIcon = (iconName: string) => {
                  switch (iconName) {
                    case 'crosshair': return Crosshair;
                    case 'brain': return Brain;
                    case 'trophy': return Trophy;
                    case 'flame': return Flame;
                    default: return Activity;
                  }
                };
                const Icon = getIcon(activity.icon);
                
                const formatTime = (timestamp: string) => {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  
                  if (diffHours < 1) return 'AGORA';
                  if (diffHours < 24) return `${diffHours} HORAS ATRÁS`;
                  if (diffDays === 1) return 'ONTEM';
                  return `${diffDays} DIAS ATRÁS`;
                };
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                      <Icon className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">{activity.title}</p>
                        <span className="text-sm font-police-numbers font-medium text-green-600 dark:text-green-400">
                          {activity.type === 'questions' ? `+${activity.score}%` : 
                           activity.type === 'flashcards' ? `${activity.score}%` :
                           activity.type === 'exam' ? `+${activity.score}%` : '🎯'}
                        </span>
                      </div>
                      <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 mt-0.5">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
            >
              VER HISTÓRICO COMPLETO
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}