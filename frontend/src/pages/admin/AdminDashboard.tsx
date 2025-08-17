import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  User,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Activity,
  TrendingUp,
  BookOpen,
  Brain,
  DollarSign,
  Users as UsersIcon,
  Shield,
  Zap,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TacticalIcon, TacticalIconName } from '@/components/icons/TacticalIcon';
import { dashboardService, DashboardStats, DashboardActivities, PerformanceMetrics } from '@/services/dashboardService';
import toast from 'react-hot-toast';

// TypeScript interfaces
interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: TacticalIconName;
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivities | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data in parallel
      const [statsRes, activitiesRes, performanceRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities(),
        dashboardService.getPerformance()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data);
      }
      if (performanceRes.success && performanceRes.data) {
        setPerformance(performanceRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard atualizado');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getDashboardStats = (): DashboardStat[] => {
    if (!stats) return [];
    
    return [
      {
        title: 'TROPAS ATIVAS',
        value: stats.users.active.toString(),
        change: stats.users.growth,
        trend: stats.users.growth.includes('+') ? 'up' : 'down',
        icon: 'users'
      },
      {
        title: 'MISSÕES OPERACIONAIS',
        value: stats.content.courses.toString(),
        change: `+${stats.categories.subjects}`,
        trend: 'up',
        icon: 'book'
      },
      {
        title: 'ARSENAL TÁTICO',
        value: formatNumber(stats.content.total),
        change: `+${Math.floor(stats.content.total * 0.02)}`,
        trend: 'up',
        icon: 'brain'
      },
      {
        title: 'RECEITA OPERACIONAL',
        value: formatCurrency(stats.revenue.monthly),
        change: stats.revenue.growth,
        trend: stats.revenue.growth.includes('+') ? 'up' : 'down',
        icon: 'dollar'
      }
    ];
  };

  type StatusType = 'active' | 'inactive' | 'suspended' | 'published' | 'draft';
  
  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      active: { label: 'ATIVO', variant: 'default' as const },
      inactive: { label: 'INATIVO', variant: 'secondary' as const },
      suspended: { label: 'SUSPENSO', variant: 'destructive' as const },
      published: { label: 'PUBLICADO', variant: 'success' as const },
      draft: { label: 'RASCUNHO', variant: 'warning' as const }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAlertIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getContentIcon = (type: 'course' | 'questions' | 'flashcards') => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'questions':
        return Brain;
      case 'flashcards':
        return Star;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
      </div>
    );
  }

  const dashboardStats = getDashboardStats();

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            CENTRO DE COMANDO
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            DASHBOARD OPERACIONAL - VISÃO GERAL DO SISTEMA
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <TacticalIcon name={stat.icon} className="w-8 h-8 text-accent-500" />
                <div className={`flex items-center gap-1 text-sm font-police-numbers font-bold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="font-police-subtitle text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider">
                  ATIVIDADE OPERACIONAL
                </CardTitle>
                <Activity className="w-5 h-5 text-accent-500" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple chart representation */}
              <div className="h-48 flex items-end justify-between gap-2">
                {performance?.dailyRegistrations.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-accent-500/20 dark:bg-accent-500/10 rounded-t relative" 
                         style={{ height: `${(day.count / 35) * 100}%` }}>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-police-numbers font-bold text-gray-700 dark:text-gray-300">
                        {day.count}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative h-full">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider">
                  ALERTAS DO SISTEMA
                </CardTitle>
                <Shield className="w-5 h-5 text-accent-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities?.systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-police-body">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-body">
                      {formatDate(alert.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider">
                  RECRUTAS RECENTES
                </CardTitle>
                <UsersIcon className="w-5 h-5 text-accent-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-500/20 dark:bg-accent-500/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-accent-500" />
                      </div>
                      <div>
                        <p className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{user.plan}</Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                        {formatDate(user.joinDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider">
                  CONTEÚDO RECENTE
                </CardTitle>
                <FileText className="w-5 h-5 text-accent-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.recentContent.map((item) => {
                  const Icon = getContentIcon(item.type);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500/20 dark:bg-accent-500/10 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent-500" />
                        </div>
                        <div>
                          <p className="font-police-subtitle font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                            Por {item.author}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(item.status)}
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="w-3 h-3" />
                          <span className="font-police-numbers">{item.views}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
            <CardHeader>
              <CardTitle className="font-police-title uppercase tracking-wider">
                MÉTRICAS DE PERFORMANCE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Questions Performance */}
                <div className="text-center">
                  <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase mb-2">
                    QUESTÕES
                  </h4>
                  <p className="text-2xl font-police-numbers font-bold text-accent-500">
                    {formatNumber(performance?.contentEngagement.questions.attempts || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    Tentativas
                  </p>
                  <div className="mt-2">
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {performance?.contentEngagement.questions.correctRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      Taxa de Acerto
                    </p>
                  </div>
                </div>

                {/* Flashcards Performance */}
                <div className="text-center">
                  <Star className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase mb-2">
                    FLASHCARDS
                  </h4>
                  <p className="text-2xl font-police-numbers font-bold text-accent-500">
                    {formatNumber(performance?.contentEngagement.flashcards.reviews || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    Revisões
                  </p>
                  <div className="mt-2">
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {performance?.contentEngagement.flashcards.retentionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      Taxa de Retenção
                    </p>
                  </div>
                </div>

                {/* Courses Performance */}
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase mb-2">
                    CURSOS
                  </h4>
                  <p className="text-2xl font-police-numbers font-bold text-accent-500">
                    {formatNumber(performance?.contentEngagement.courses.completions || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    Conclusões
                  </p>
                  <div className="mt-2">
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {performance?.contentEngagement.courses.averageProgress.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                      Progresso Médio
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}