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
  Info
} from 'lucide-react';
import { mockStatistics, mockCourses } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
  const stats = mockStatistics;
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Estados para calendário
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Listener para status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Função para refresh dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const statsCards = [
    {
      title: 'Questões Resolvidas',
      value: stats.questionsAnswered.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progress: Math.round((stats.correctAnswers / stats.questionsAnswered) * 100),
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Taxa de Acerto',
      value: `${Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: Math.round((stats.correctAnswers / stats.questionsAnswered) * 100),
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Flashcards Revisados',
      value: stats.flashcardsReviewed.toLocaleString(),
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      progress: 85,
      change: '-2%',
      trend: 'down',
    },
    {
      title: 'Sequência de Estudos',
      value: `${stats.studyStreak} dias`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      progress: (stats.studyStreak / 30) * 100,
      change: '+1',
      trend: 'up',
    },
  ];

  const dailyGoals = [
    { 
      task: 'Resolver 50 questões', 
      completed: 32, 
      total: 50, 
      icon: BookOpen,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      borderColor: 'border-blue-200 dark:border-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-800/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      progressGradient: 'from-blue-400 to-blue-600'
    },
    { 
      task: 'Revisar 30 flashcards', 
      completed: 30, 
      total: 30, 
      icon: Brain,
      color: 'purple',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
      borderColor: 'border-purple-200 dark:border-purple-700',
      iconBg: 'bg-purple-100 dark:bg-purple-800/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      progressGradient: 'from-purple-400 to-purple-600'
    },
    { 
      task: 'Estudar por 4 horas', 
      completed: 2.5, 
      total: 4, 
      icon: Clock,
      color: 'amber',
      bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30',
      borderColor: 'border-amber-200 dark:border-amber-700',
      iconBg: 'bg-amber-100 dark:bg-amber-800/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      progressGradient: 'from-amber-400 to-amber-600'
    },
    { 
      task: 'Fazer 1 simulado', 
      completed: 0, 
      total: 1, 
      icon: Trophy,
      color: 'green',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      borderColor: 'border-green-200 dark:border-green-700',
      iconBg: 'bg-green-100 dark:bg-green-800/50',
      iconColor: 'text-green-600 dark:text-green-400',
      progressGradient: 'from-green-400 to-green-600'
    },
  ];

  const upcomingEvents = [
    { title: 'Prova Polícia Federal - Agente', date: '2024-03-15', daysLeft: 45, type: 'exam', progress: 68 },
    { title: 'Simulado Semanal - PF', date: '2024-02-10', daysLeft: 12, type: 'simulation', progress: 100 },
    { title: 'Revisão Direito Penal', date: '2024-02-05', daysLeft: 7, type: 'study', progress: 45 },
  ];

  const editalProgress = [
    { materia: 'Direito Constitucional', total: 120, concluido: 89, porcentagem: 74 },
    { materia: 'Direito Administrativo', total: 95, concluido: 67, porcentagem: 71 },
    { materia: 'Direito Penal', total: 110, concluido: 58, porcentagem: 53 },
    { materia: 'Português', total: 80, concluido: 72, porcentagem: 90 },
    { materia: 'Raciocínio Lógico', total: 60, concluido: 38, porcentagem: 63 },
  ];

  const studyTips = [
    'Use a técnica Pomodoro: 25min estudo + 5min pausa',
    'Revise flashcards antes de dormir para melhor fixação',
    'Faça questões de provas anteriores da mesma banca',
    'Mantenha um cronograma consistente de estudos',
  ];

  const weakSubjects = [
    { name: 'Direito Penal', accuracy: 65, questions: 150 },
    { name: 'Raciocínio Lógico', accuracy: 72, questions: 98 },
    { name: 'Informática', accuracy: 78, questions: 87 },
  ];

  // Dados das turmas
  const userGroups = [
    {
      id: '1',
      name: 'TURMA ELITE PF 2024',
      members: 127,
      role: 'Aluno',
      badge: '🎯',
      progress: 78,
      nextActivity: 'Simulado às 19h',
      instructor: 'Prof. Carlos Silva',
      rank: 12
    },
    {
      id: '2',
      name: 'GRUPO DE ESTUDOS - CONSTITUCIONAL',
      members: 42,
      role: 'Moderador',
      badge: '📚',
      progress: 85,
      nextActivity: 'Revisão amanhã',
      instructor: 'Ana Santos',
      rank: 3
    }
  ];

  // Eventos do calendário
  const calendarEvents = {
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-15`]: [
      { type: 'exam', title: 'Simulado Nacional', time: '14:00' },
      { type: 'class', title: 'Aula ao vivo - Dir. Penal', time: '19:00' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-18`]: [
      { type: 'deadline', title: 'Entrega de Resumos', time: '23:59' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-22`]: [
      { type: 'class', title: 'Revisão Geral', time: '20:00' }
    ],
    [`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-25`]: [
      { type: 'exam', title: 'Prova Final - Módulo 3', time: '09:00' }
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header com saudação personalizada */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-900">
                {getCurrentTime()}, {user?.name?.split(' ')[0] || 'Estudante'}! 👋
              </h1>
              <div className="flex items-center gap-2">
                {/* Status de conexão */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                
                {/* Botão de refresh */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <p className="text-primary-600">
              Continue sua jornada rumo à aprovação. Você está no caminho certo!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Informações do plano - Mobile friendly */}
            <div className="text-right">
              <div className="flex items-center gap-2 lg:justify-end">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Medal className="w-4 h-4 lg:w-5 lg:h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    Plano {user?.subscription?.plan}
                  </p>
                  <p className="text-xs text-primary-600">
                    Expira em {user?.subscription?.expiresAt}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Avatar do usuário */}
            <div className="relative">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=14242f&color=fff`}
                alt={user?.name || 'Usuário'}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-primary-200 hover:border-primary-300 transition-colors cursor-pointer"
                onClick={() => navigate('/settings')}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas principais com tendências */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="stats-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="stats-loaded"
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
                  <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500 bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-800 dark:to-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                          stat.trend === 'up' 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-red-700 bg-red-100'
                        }`}>
                          <TrendIcon className="w-3 h-3" />
                          {stat.change}
                        </div>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-primary-600 mb-4">{stat.title}</p>
                      
                      {/* Progress Bar melhorada */}
                      <div className="relative">
                        <div className="bg-primary-100 rounded-full h-2.5 overflow-hidden">
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
                        <span className="absolute right-0 -top-6 text-xs font-medium text-primary-700">
                          {stat.progress}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metas Diárias */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="goals-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-16 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <GoalCardSkeleton key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="goals-loaded"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-gradient-to-br from-white to-primary-50/20 dark:from-gray-800 dark:to-gray-800/50 border-primary-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5" />
                    Metas de Hoje
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-primary-100">
                      {dailyGoals.filter(goal => goal.completed >= goal.total).length}/{dailyGoals.length} concluídas
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-xs font-bold">
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
                        className="relative"
                      >
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                          isCompleted 
                            ? `border-green-300 dark:border-green-600 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-green-100` 
                            : `${goal.borderColor} bg-gradient-to-br ${goal.bgGradient} hover:shadow-lg`
                        } shadow-lg hover:shadow-xl`}>
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
                          
                          <p className="text-sm font-semibold text-primary-900 mb-3 leading-relaxed">
                            {goal.task}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="font-medium text-primary-700">
                              {goal.completed}/{goal.total}
                            </span>
                            <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                              isCompleted 
                                ? 'bg-green-200 dark:bg-green-800/70 text-green-800 dark:text-green-200' 
                                : `${goal.iconBg} ${goal.iconColor}`
                            }`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          
                          <div className="relative">
                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
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
                <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-primary-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Flame className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">Continue assim!</p>
                      <p className="text-sm text-primary-600">
                        {dailyGoals.filter(goal => goal.completed >= goal.total).length === dailyGoals.length
                          ? "🎉 Todas as metas concluídas! Você está no caminho certo!"
                          : `Faltam apenas ${dailyGoals.length - dailyGoals.filter(goal => goal.completed >= goal.total).length} metas para completar o dia.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progresso no Edital - Inspirado no Painel Tático */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Progresso no Edital - PF Agente
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tactical')}>
                Ver Painel Tático
                <TrendingUp className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editalProgress.map((materia, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-primary-900">{materia.materia}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-primary-600">
                        {materia.concluido}/{materia.total} tópicos
                      </span>
                      <span className={`text-sm font-medium ${
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
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(editalProgress.reduce((acc, curr) => acc + curr.porcentagem, 0) / editalProgress.length)}%
                  </p>
                  <p className="text-sm text-primary-600">Progresso Geral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {editalProgress.reduce((acc, curr) => acc + curr.concluido, 0)}
                  </p>
                  <p className="text-sm text-primary-600">Tópicos Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {editalProgress.reduce((acc, curr) => acc + (curr.total - curr.concluido), 0)}
                  </p>
                  <p className="text-sm text-primary-600">Tópicos Restantes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions melhorado */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-800 dark:to-gray-800/50 border-primary-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary-900">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-600" />
              </div>
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: BookOpen,
                  title: "Resolver Questões",
                  subtitle: "32/50 questões hoje",
                  color: "blue",
                  path: "/questions",
                  bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
                  borderColor: "border-blue-200 dark:border-blue-700",
                  hoverColor: "hover:border-blue-300 dark:hover:border-blue-600"
                },
                {
                  icon: Brain,
                  title: "Revisar Flashcards",
                  subtitle: "15 cards para hoje",
                  color: "purple",
                  path: "/flashcards",
                  bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30",
                  borderColor: "border-purple-200 dark:border-purple-700",
                  hoverColor: "hover:border-purple-300 dark:hover:border-purple-600"
                },
                {
                  icon: Trophy,
                  title: "Fazer Simulado",
                  subtitle: "Teste seus conhecimentos",
                  color: "green",
                  path: "/simulations",
                  bgGradient: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30",
                  borderColor: "border-green-200 dark:border-green-700",
                  hoverColor: "hover:border-green-300 dark:hover:border-green-600"
                },
                {
                  icon: Calendar,
                  title: "Ver Cronograma",
                  subtitle: "Planejar estudos",
                  color: "amber",
                  path: "/schedule",
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
                        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-${action.color}-100`}>
                          <Icon className={`w-7 h-7 text-${action.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-900 mb-1 group-hover:text-primary-800 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-primary-600 group-hover:text-primary-700 transition-colors">
                            {action.subtitle}
                          </p>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className={`w-3 h-3 text-${action.color}-600`} />
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

      {/* Turmas e Calendário */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minhas Turmas */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-police-title">
              <Users className="w-5 h-5" />
              MINHAS TURMAS
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
                      <h3 className="font-bold text-gray-900 dark:text-white font-police-subtitle">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        {group.instructor} • {group.members} membros
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-accent-500 text-black font-police-numbers">
                      #{group.rank}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-police-body">
                      {group.role}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">Progresso do módulo</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">{group.progress}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all"
                      style={{ width: `${group.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    <Clock className="w-4 h-4" />
                    <span>{group.nextActivity}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 font-police-subtitle">
                    <ChevronRight className="w-4 h-4" />
                    ACESSAR
                  </Button>
                </div>
              </motion.div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full gap-2 font-police-subtitle"
              onClick={() => navigate('/groups')}
            >
              <Users className="w-4 h-4" />
              EXPLORAR MAIS TURMAS
            </Button>
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white font-police-title">
                <CalendarDays className="w-5 h-5" />
                CALENDÁRIO DE ESTUDOS
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
                <span className="text-sm font-medium text-gray-900 dark:text-white font-police-subtitle min-w-[120px] text-center">
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
                <div key={day} className="text-center text-xs font-bold text-gray-600 dark:text-gray-400 font-police-subtitle p-2">
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
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 font-police-subtitle">
                  EVENTOS - {selectedDate.toLocaleDateString('pt-BR')}
                </h4>
                <div className="space-y-2">
                  {calendarEvents[formatDateKey(selectedDate)].map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={cn("w-2 h-2 rounded-full", getEventTypeColor(event.type))} />
                      <span className="font-police-numbers text-gray-600 dark:text-gray-400">{event.time}</span>
                      <span className="text-gray-900 dark:text-white font-police-body">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body">Prova</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body">Aula</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400 font-police-body">Prazo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid de 3 colunas: Próximos Eventos, Matérias Fracas, Dicas de Estudo */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const getEventColor = (type: string) => {
                switch (type) {
                  case 'exam': return 'text-red-600 bg-red-100';
                  case 'simulation': return 'text-blue-600 bg-blue-100';
                  default: return 'text-green-600 bg-green-100';
                }
              };
              
              return (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-primary-900 text-sm">{event.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEventColor(event.type)}`}>
                      {event.daysLeft}d
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 mb-2">{event.date}</p>
                  {event.progress && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-primary-600">{event.progress}%</span>
                    </div>
                  )}
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="w-full">
              Ver todos os eventos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Matérias que precisam de atenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Foque nestas matérias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakSubjects.map((subject, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-900 text-sm">{subject.name}</h4>
                  <span className="text-sm font-medium text-red-600">{subject.accuracy}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-primary-600">{subject.questions} questões resolvidas</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              Ver relatório completo
              <BarChart3 className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Dica de estudo do dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Dica do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Lightbulb className="w-6 h-6 text-amber-600 mb-2" />
                <p className="text-sm text-amber-800 font-medium mb-2">
                  Técnica de Hoje
                </p>
                <p className="text-sm text-amber-700">
                  {studyTips[0]}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-primary-900 text-sm">Outras dicas:</h4>
                {studyTips.slice(1, 3).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary-700">{tip}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Ver mais dicas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cursos em Andamento e Atividade Recente */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cursos em Andamento
              </CardTitle>
              <Button variant="ghost" size="sm">
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 border border-primary-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer hover:bg-primary-50"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-primary-900">{course.name}</h4>
                  <span className="text-sm font-medium text-primary-600">{course.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-primary-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.totalQuestions} questões
                  </span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    {course.totalFlashcards} cards
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {Math.floor(Math.random() * 500) + 100} alunos
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  icon: BookOpen, 
                  text: 'Resolveu 25 questões de Direito Constitucional', 
                  time: '2 horas atrás',
                  score: '+78%',
                  type: 'questions'
                },
                { 
                  icon: Brain, 
                  text: 'Revisou 30 flashcards de Português', 
                  time: '4 horas atrás',
                  score: '100%',
                  type: 'flashcards'
                },
                { 
                  icon: Trophy, 
                  text: 'Completou simulado de Direito Penal', 
                  time: 'Ontem',
                  score: '+85%',
                  type: 'simulation'
                },
                { 
                  icon: Flame, 
                  text: 'Atingiu nova sequência de 15 dias', 
                  time: 'Ontem',
                  score: '🎉',
                  type: 'streak'
                },
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-900">{activity.text}</p>
                        <span className="text-sm font-medium text-green-600">{activity.score}</span>
                      </div>
                      <p className="text-xs text-primary-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver histórico completo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}