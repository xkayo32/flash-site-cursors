import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Brain,
  Trophy,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  User,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data
const dashboardStats = [
  {
    title: 'Total de Usuários',
    value: '2,543',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'Cursos Ativos',
    value: '42',
    change: '+3',
    trend: 'up',
    icon: BookOpen,
    color: 'bg-green-500'
  },
  {
    title: 'Questões no Banco',
    value: '15,890',
    change: '+245',
    trend: 'up',
    icon: Brain,
    color: 'bg-purple-500'
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 89,432',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-emerald-500'
  }
];

const recentUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    plan: 'Premium',
    status: 'active',
    joinDate: '2024-01-15',
    lastActivity: '2 horas atrás'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    plan: 'Básico',
    status: 'active',
    joinDate: '2024-01-14',
    lastActivity: '1 dia atrás'
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    plan: 'VIP',
    status: 'inactive',
    joinDate: '2024-01-13',
    lastActivity: '3 dias atrás'
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    plan: 'Premium',
    status: 'active',
    joinDate: '2024-01-12',
    lastActivity: '5 horas atrás'
  }
];

const recentContent = [
  {
    id: 1,
    title: 'Direito Constitucional - Teoria Geral',
    type: 'course',
    author: 'Prof. Dr. Carlos Lima',
    status: 'published',
    updatedAt: '2024-01-15',
    views: 234
  },
  {
    id: 2,
    title: 'Questões de Matemática - ENEM 2023',
    type: 'questions',
    author: 'Sistema',
    status: 'draft',
    updatedAt: '2024-01-14',
    views: 0
  },
  {
    id: 3,
    title: 'Flashcards - Português Básico',
    type: 'flashcards',
    author: 'Prof. Ana Maria',
    status: 'published',
    updatedAt: '2024-01-13',
    views: 189
  }
];

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Servidor de backup offline há 2 horas',
    timestamp: '2024-01-15 14:30'
  },
  {
    id: 2,
    type: 'info',
    message: 'Nova versão do sistema disponível',
    timestamp: '2024-01-15 12:00'
  },
  {
    id: 3,
    type: 'success',
    message: 'Backup automático concluído com sucesso',
    timestamp: '2024-01-15 10:00'
  }
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('7d');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      inactive: { label: 'Inativo', variant: 'secondary' as const },
      published: { label: 'Publicado', variant: 'default' as const },
      draft: { label: 'Rascunho', variant: 'secondary' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      course: BookOpen,
      questions: Brain,
      flashcards: Star
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      warning: AlertCircle,
      info: Activity,
      success: CheckCircle
    };
    const Icon = icons[type as keyof typeof icons] || Activity;
    return Icon;
  };

  const getAlertColor = (type: string) => {
    const colors = {
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400'
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
            Painel Administrativo
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Visão geral da plataforma StudyPro
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
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Usuários Recentes</CardTitle>
              <Button variant="ghost" size="sm">
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-primary-100 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-primary-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-900 dark:text-white">
                          {user.plan}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-gray-400">
                          {user.lastActivity}
                        </p>
                      </div>
                      {getStatusBadge(user.status)}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Alertas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 border border-primary-100 dark:border-gray-700 rounded-lg"
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm text-primary-900 dark:text-white">
                          {alert.message}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-gray-400 mt-1">
                          {alert.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Conteúdo Recente</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Título
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Autor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Visualizações
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentContent.map((content) => (
                    <tr
                      key={content.id}
                      className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(content.type)}
                          <span className="text-primary-900 dark:text-white font-medium">
                            {content.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-primary-600 dark:text-gray-400 capitalize">
                          {content.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-primary-600 dark:text-gray-400">
                          {content.author}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(content.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-primary-600 dark:text-gray-400">
                          {content.views}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}