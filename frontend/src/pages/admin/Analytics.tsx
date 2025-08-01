import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Brain,
  DollarSign,
  Activity,
  Eye,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data
const overviewStats = [
  {
    title: 'Usuários Ativos',
    value: '2,543',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    description: 'Últimos 30 dias'
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 89,432',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    description: 'Janeiro 2024'
  },
  {
    title: 'Questões Respondidas',
    value: '45,892',
    change: '+15.3%',
    trend: 'up',
    icon: Brain,
    description: 'Este mês'
  },
  {
    title: 'Taxa de Retenção',
    value: '87.5%',
    change: '-2.1%',
    trend: 'down',
    icon: Target,
    description: 'Últimos 7 dias'
  }
];

const topCourses = [
  {
    id: 1,
    title: 'Direito Constitucional Completo',
    enrollments: 1234,
    completionRate: 78.5,
    avgRating: 4.8,
    revenue: 45670.50,
    category: 'Direito'
  },
  {
    id: 2,
    title: 'Matemática para Concursos',
    enrollments: 987,
    completionRate: 82.3,
    avgRating: 4.6,
    revenue: 32450.80,
    category: 'Matemática'
  },
  {
    id: 3,
    title: 'Português Essencial',
    enrollments: 856,
    completionRate: 75.2,
    avgRating: 4.7,
    revenue: 28930.40,
    category: 'Português'
  },
  {
    id: 4,
    title: 'História do Brasil',
    enrollments: 654,
    completionRate: 69.8,
    avgRating: 4.5,
    revenue: 19620.00,
    category: 'História'
  }
];

const userEngagement = [
  {
    metric: 'Tempo Médio por Sessão',
    value: '24 min',
    change: '+5.2%',
    trend: 'up'
  },
  {
    metric: 'Páginas por Sessão',
    value: '8.3',
    change: '+12.1%',
    trend: 'up'
  },
  {
    metric: 'Taxa de Bounce',
    value: '23.4%',
    change: '-3.8%',
    trend: 'up'
  },
  {
    metric: 'Sessões Mensais',
    value: '15,642',
    change: '+18.5%',
    trend: 'up'
  }
];

const subscriptionMetrics = [
  {
    plan: 'Básico',
    subscribers: 1245,
    revenue: 37350.00,
    churnRate: 5.2,
    avgLifetime: '4.2 meses'
  },
  {
    plan: 'Premium',
    subscribers: 987,
    revenue: 49350.00,
    churnRate: 3.8,
    avgLifetime: '6.8 meses'
  },
  {
    plan: 'VIP',
    subscribers: 311,
    revenue: 27990.00,
    churnRate: 2.1,
    avgLifetime: '9.1 meses'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'new_user',
    message: 'João Silva se inscreveu no plano Premium',
    timestamp: '2 minutos atrás',
    value: 'R$ 49,90'
  },
  {
    id: 2,
    type: 'course_completion',
    message: 'Maria Santos completou "Direito Constitucional"',
    timestamp: '15 minutos atrás',
    value: '98% aproveitamento'
  },
  {
    id: 3,
    type: 'milestone',
    message: '1000 questões respondidas hoje',
    timestamp: '1 hora atrás',
    value: 'Marco atingido'
  },
  {
    id: 4,
    type: 'review',
    message: 'Pedro Costa avaliou curso com 5 estrelas',
    timestamp: '2 horas atrás',
    value: '5 ⭐'
  }
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const getActivityIcon = (type: string) => {
    const icons = {
      new_user: Users,
      course_completion: Award,
      milestone: Target,
      review: Star
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      new_user: 'text-blue-600',
      course_completion: 'text-green-600',
      milestone: 'text-purple-600',
      review: 'text-yellow-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Analytics & Relatórios
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Métricas e insights da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-primary-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-primary-500 dark:text-gray-500">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Visão Geral de Usuários</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Barras
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <LineChart className="w-4 h-4" />
                  Linha
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-primary-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <p className="text-primary-600 dark:text-gray-400">
                    Gráfico de usuários ativos seria renderizado aqui
                  </p>
                  <p className="text-sm text-primary-500 dark:text-gray-500 mt-2">
                    Integração com biblioteca de gráficos (Chart.js, Recharts, etc.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border border-primary-100 dark:border-gray-700 rounded-lg"
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm text-primary-900 dark:text-white">
                          {activity.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-primary-600 dark:text-gray-400">
                            {activity.timestamp}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {activity.value}
                          </Badge>
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

      {/* User Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Métricas de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userEngagement.map((metric, index) => (
                <div key={index} className="text-center p-4 border border-primary-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xl font-bold text-primary-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-sm text-primary-600 dark:text-gray-400 mb-2">
                    {metric.metric}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-sm text-green-600">
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Cursos Mais Populares</CardTitle>
              <Button variant="ghost" size="sm">
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border border-primary-100 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {course.title}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          {course.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-primary-900 dark:text-white">
                        {course.enrollments} inscritos
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm text-primary-600 dark:text-gray-400">
                          {course.avgRating}
                        </span>
                        <span className="text-sm text-primary-600 dark:text-gray-400">
                          •
                        </span>
                        <span className="text-sm text-primary-600 dark:text-gray-400">
                          {course.completionRate}% conclusão
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Métricas de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionMetrics.map((plan, index) => (
                  <div
                    key={index}
                    className="p-4 border border-primary-100 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-primary-900 dark:text-white">
                          Plano {plan.plan}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          {plan.subscribers} assinantes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-900 dark:text-white">
                          R$ {plan.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          Receita mensal
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-primary-600 dark:text-gray-400">Taxa de Churn</p>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {plan.churnRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-600 dark:text-gray-400">Tempo Médio</p>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {plan.avgLifetime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Evolução da Receita</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <PieChart className="w-4 h-4" />
                Distribuição
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <LineChart className="w-4 h-4" />
                Tendência
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-primary-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <p className="text-primary-600 dark:text-gray-400">
                  Gráfico de receita mensal seria renderizado aqui
                </p>
                <p className="text-sm text-primary-500 dark:text-gray-500 mt-2">
                  Mostrando crescimento ao longo do tempo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Indicadores de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  94.5%
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Uptime da Plataforma
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  1.2s
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tempo de Resposta
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  89.2%
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Satisfação do Cliente
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  76.8%
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Taxa de Conclusão
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}