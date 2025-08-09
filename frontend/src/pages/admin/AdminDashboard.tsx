import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TacticalIcon, TacticalIconName } from '@/components/icons/TacticalIcon';

// TypeScript interfaces
interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: TacticalIconName;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastActivity: string;
}

interface RecentContentItem {
  id: number;
  title: string;
  type: 'course' | 'questions' | 'flashcards';
  author: string;
  status: 'published' | 'draft';
  updatedAt: string;
  views: number;
}

interface SystemAlert {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

// Mock data
const dashboardStats: DashboardStat[] = [
  {
    title: 'TROPAS ATIVAS',
    value: '2,543',
    change: '+12%',
    trend: 'up',
    icon: 'users'
  },
  {
    title: 'MISSÕES OPERACIONAIS',
    value: '42',
    change: '+3',
    trend: 'up',
    icon: 'book'
  },
  {
    title: 'ARSENAL TÁTICO',
    value: '15,890',
    change: '+245',
    trend: 'up',
    icon: 'brain'
  },
  {
    title: 'RECEITA OPERACIONAL',
    value: 'R$ 89,432',
    change: '+8.2%',
    trend: 'up',
    icon: 'dollar'
  }
];

const recentUsers: RecentUser[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    plan: 'ELITE',
    status: 'active' as const,
    joinDate: '2024-01-15',
    lastActivity: '2 horas atrás'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    plan: 'RECRUTA',
    status: 'active' as const,
    joinDate: '2024-01-14',
    lastActivity: '1 dia atrás'
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    plan: 'COMANDO',
    status: 'inactive' as const,
    joinDate: '2024-01-13',
    lastActivity: '3 dias atrás'
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    plan: 'ELITE',
    status: 'active' as const,
    joinDate: '2024-01-12',
    lastActivity: '5 horas atrás'
  }
];

const recentContent: RecentContentItem[] = [
  {
    id: 1,
    title: 'Direito Constitucional - Teoria Geral',
    type: 'course' as const,
    author: 'Prof. Dr. Carlos Lima',
    status: 'published' as const,
    updatedAt: '2024-01-15',
    views: 234
  },
  {
    id: 2,
    title: 'Questões de Matemática - ENEM 2023',
    type: 'questions' as const,
    author: 'Sistema',
    status: 'draft' as const,
    updatedAt: '2024-01-14',
    views: 0
  },
  {
    id: 3,
    title: 'Flashcards - Português Básico',
    type: 'flashcards' as const,
    author: 'Prof. Ana Maria',
    status: 'published' as const,
    updatedAt: '2024-01-13',
    views: 189
  }
];

const systemAlerts: SystemAlert[] = [
  {
    id: 1,
    type: 'warning' as const,
    message: 'Servidor de backup offline há 2 horas',
    timestamp: '2024-01-15 14:30'
  },
  {
    id: 2,
    type: 'info' as const,
    message: 'Nova versão do sistema disponível',
    timestamp: '2024-01-15 12:00'
  },
  {
    id: 3,
    type: 'success' as const,
    message: 'Backup automático concluído com sucesso',
    timestamp: '2024-01-15 10:00'
  }
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('7d');

  type StatusType = 'active' | 'inactive' | 'published' | 'draft';
  
  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      active: { label: 'ATIVO', variant: 'default' as const },
      inactive: { label: 'INATIVO', variant: 'secondary' as const },
      published: { label: 'PUBLICADO', variant: 'default' as const },
      draft: { label: 'RASCUNHO', variant: 'secondary' as const }
    };
    
    const config = statusConfig[status];
    return (
      <Badge 
        variant={config.variant} 
        className="font-police-subtitle tracking-wider border-2 border-current"
      >
        {config.label}
      </Badge>
    );
  };

  type ContentType = 'course' | 'questions' | 'flashcards';
  
  const getTypeIcon = (type: ContentType) => {
    const icons = {
      course: BookOpen,
      questions: Brain,
      flashcards: Star
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  type AlertType = 'warning' | 'info' | 'success';
  
  const getAlertIcon = (type: AlertType) => {
    const icons = {
      warning: AlertCircle,
      info: Activity,
      success: CheckCircle
    };
    const Icon = icons[type] || Activity;
    return Icon;
  };

  const getAlertColor = (type: AlertType) => {
    const colors = {
      warning: 'text-gray-700 dark:text-gray-300',
      info: 'text-gray-600 dark:text-gray-400',
      success: 'text-gray-700 dark:text-gray-300'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 min-h-full relative">
      {/* Tactical Corner Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent-500/20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500/20" />
      {/* Enhanced Tactical Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(250, 204, 21, 0.05) 35px,
              rgba(250, 204, 21, 0.05) 70px
            )
          `,
          backgroundSize: '20px 20px, 100px 100px'
        }}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="relative">
          {/* Command Header with Tactical Elements */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            <div className="w-1 h-8 bg-accent-500/60" />
            <Shield className="w-8 h-8 text-accent-500" />
            <div className="w-1 h-8 bg-accent-500/60" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            CENTRAL DE COMANDO
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            MONITORAMENTO TÁTICO EM TEMPO REAL
          </p>
          {/* Tactical underline */}
          <div className="mt-3 w-32 h-1 bg-gradient-to-r from-accent-500 via-accent-600 to-transparent" />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
          >
            <option value="7d">PERÍODO: 7 DIAS</option>
            <option value="30d">PERÍODO: 30 DIAS</option>
            <option value="90d">PERÍODO: 90 DIAS</option>
          </select>
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
            <Card className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-accent-500/10 group">
              <CardContent className="p-4 relative overflow-hidden">
                {/* Enhanced Tactical Elements */}
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent-500 via-accent-600 to-accent-500" />
                <div className="absolute top-0 left-0 w-8 h-1 bg-accent-500/50 group-hover:bg-accent-500 transition-all duration-300" />
                <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-accent-500/20 group-hover:border-accent-500/60 transition-all duration-300" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      {stat.trend === 'up' ? (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-sm font-police-numbers font-bold">{stat.change}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                          <span className="text-sm font-police-numbers font-bold">{stat.change}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center border-3 border-accent-500/30 group-hover:border-accent-500 shadow-lg group-hover:scale-110 transition-all duration-300">
                      <TacticalIcon name={stat.icon} className="w-6 h-6 text-gray-700 dark:text-accent-500 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse shadow-lg" />
                    {/* Tactical corner accent */}
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent-500/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: UsersIcon, label: 'NOVO RECRUTA' },
          { icon: BookOpen, label: 'NOVA MISSÃO' },
          { icon: Brain, label: 'NOVO ARSENAL' },
          { icon: Shield, label: 'RELATÓRIO TÁTICO' }
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-accent-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg hover:shadow-xl"
            >
              {/* Tactical Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/0 group-hover:border-accent-500/40 transition-all duration-300" />
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent-500 group-hover:to-accent-600 group-hover:scale-110 transition-all duration-300 border-2 border-gray-300 dark:border-gray-600 group-hover:border-accent-500 shadow-lg">
                  <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-black transition-all duration-300" />
                </div>
                <span className="text-xs font-police-title uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400 group-hover:text-accent-500 font-bold text-center leading-tight">
                  {action.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 hover:border-accent-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
            {/* Tactical Card Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500/50 via-accent-500 to-accent-500/50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500/20" />
            
            <CardHeader className="flex flex-row items-center justify-between border-b-4 border-accent-500/30 relative z-10">
              <CardTitle className="text-lg font-police-title uppercase tracking-widest flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent-500" />
                RECRUTAS RECENTES
              </CardTitle>
              <Button variant="ghost" size="sm" className="font-police-body uppercase tracking-wider hover:text-accent-500">
                VER TODOS
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-all duration-300 group relative overflow-hidden backdrop-blur-sm"
                  >
                    {/* User Row Tactical Elements */}
                    <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/0 group-hover:bg-accent-500/60 transition-all duration-300" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-500/0 group-hover:border-accent-500/40 transition-all duration-300" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-black font-bold font-police-title shadow-lg border-2 border-accent-500/50 group-hover:scale-110 transition-all duration-300">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white font-police-body">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                          {user.plan}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
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
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 hover:border-accent-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
            {/* Tactical Alert Card Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/30 via-accent-500/50 to-red-500/30" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent-500/20" />
            
            <CardHeader className="border-b-4 border-accent-500/30 relative z-10">
              <CardTitle className="text-lg font-police-title uppercase tracking-widest flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-accent-500" />
                ALERTAS TÁTICOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-police-body">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-police-body">
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
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 hover:border-accent-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
          {/* Content Table Tactical Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-accent-500/20" />
          
          <CardHeader className="flex flex-row items-center justify-between border-b-4 border-accent-500/30 relative z-10">
            <CardTitle className="text-lg font-police-title uppercase tracking-widest flex items-center gap-3">
              <Target className="w-5 h-5 text-accent-500" />
              ARSENAL DE CONTEÚDO
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 font-police-body uppercase tracking-wider hover:text-accent-500">
                <Filter className="w-4 h-4" />
                FILTRAR
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 font-police-body uppercase tracking-wider hover:text-accent-500">
                <Search className="w-4 h-4" />
                BUSCAR
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Título
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Autor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Visualizações
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentContent.map((content) => (
                    <tr
                      key={content.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 group relative"
                    >
                      <td className="py-3 px-4 relative">
                        {/* Table Row Tactical Hover */}
                        <div className="absolute left-0 top-0 w-1 h-full bg-accent-500/0 group-hover:bg-accent-500/40 transition-all duration-300" />
                        <div className="flex items-center gap-2">
                          {getTypeIcon(content.type)}
                          <span className="text-gray-900 dark:text-white font-medium font-police-body">
                            {content.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400 capitalize font-police-body">
                          {content.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body">
                          {content.author}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(content.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400 font-police-numbers">
                          {content.views}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="hover:text-accent-500">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:text-accent-500">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:text-red-600">
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