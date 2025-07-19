import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  User,
  Crown,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  X,
  Save,
  Ban,
  UserCheck,
  Download,
  Upload,
  CreditCard,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data
const users = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    role: 'student',
    status: 'active',
    plan: 'Premium',
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-06-15',
    joinDate: '2024-01-15',
    lastLogin: '2024-01-15 14:30',
    totalSpent: 149.80,
    coursesEnrolled: 3,
    questionsAnswered: 1234,
    flashcardsStudied: 567,
    studyStreak: 15,
    avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=14242f&color=fff'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    role: 'student',
    status: 'active',
    plan: 'Básico',
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-05-20',
    joinDate: '2024-01-10',
    lastLogin: '2024-01-14 09:15',
    totalSpent: 59.90,
    coursesEnrolled: 1,
    questionsAnswered: 456,
    flashcardsStudied: 234,
    studyStreak: 7,
    avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=14242f&color=fff'
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '(11) 77777-7777',
    role: 'instructor',
    status: 'active',
    plan: 'VIP',
    subscriptionStatus: 'expired',
    subscriptionExpiry: '2024-01-10',
    joinDate: '2023-12-01',
    lastLogin: '2024-01-12 16:45',
    totalSpent: 299.70,
    coursesEnrolled: 5,
    questionsAnswered: 2345,
    flashcardsStudied: 1123,
    studyStreak: 0,
    avatar: 'https://ui-avatars.com/api/?name=Pedro+Costa&background=14242f&color=fff'
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    phone: '(11) 66666-6666',
    role: 'student',
    status: 'suspended',
    plan: 'Premium',
    subscriptionStatus: 'cancelled',
    subscriptionExpiry: '2024-02-28',
    joinDate: '2023-11-15',
    lastLogin: '2024-01-08 11:20',
    totalSpent: 89.90,
    coursesEnrolled: 2,
    questionsAnswered: 678,
    flashcardsStudied: 345,
    studyStreak: 0,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=14242f&color=fff'
  },
  {
    id: 5,
    name: 'Carlos Lima',
    email: 'carlos.lima@email.com',
    phone: '(11) 55555-5555',
    role: 'admin',
    status: 'active',
    plan: 'Unlimited',
    subscriptionStatus: 'active',
    subscriptionExpiry: null,
    joinDate: '2023-01-01',
    lastLogin: '2024-01-15 15:00',
    totalSpent: 0,
    coursesEnrolled: 0,
    questionsAnswered: 0,
    flashcardsStudied: 0,
    studyStreak: 0,
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Lima&background=14242f&color=fff'
  }
];

const plans = ['Todos', 'Básico', 'Premium', 'VIP', 'Unlimited'];
const roles = ['Todos', 'student', 'instructor', 'admin'];
const statuses = ['Todos', 'active', 'suspended', 'pending'];
const subscriptionStatuses = ['Todos', 'active', 'expired', 'cancelled', 'trial'];

export default function UserManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Todos');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedSubscriptionStatus, setSelectedSubscriptionStatus] = useState('Todos');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === 'Todos' || user.plan === selectedPlan;
    const matchesRole = selectedRole === 'Todos' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'Todos' || user.status === selectedStatus;
    const matchesSubscription = selectedSubscriptionStatus === 'Todos' || user.subscriptionStatus === selectedSubscriptionStatus;
    
    return matchesSearch && matchesPlan && matchesRole && matchesStatus && matchesSubscription;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', variant: 'default' as const, icon: Shield, color: 'bg-red-100 text-red-800' },
      instructor: { label: 'Instrutor', variant: 'secondary' as const, icon: Crown, color: 'bg-purple-100 text-purple-800' },
      student: { label: 'Aluno', variant: 'secondary' as const, icon: User, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspenso', color: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { label: 'Expirada', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: X },
      trial: { label: 'Trial', color: 'bg-blue-100 text-blue-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(user => user !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
            Gestão de Usuários
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Gerencie usuários, assinaturas e permissões
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Usuários
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {users.length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Assinaturas Ativas
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {users.filter(u => u.subscriptionStatus === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Receita Total
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  R$ {users.reduce((acc, user) => acc + user.totalSpent, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Novos este Mês
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {users.filter(u => u.joinDate.startsWith('2024-01')).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                />
              </div>

              {/* Plan Filter */}
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {plans.map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'Todos' ? role : role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {/* Bulk Actions */}
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Ações em Lote
              </Button>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-primary-50 dark:bg-gray-800 rounded-lg border border-primary-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                        <span className="text-sm text-primary-900 dark:text-white">
                          Selecionar todos ({selectedUsers.length})
                        </span>
                      </label>
                    </div>
                    
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Mail className="w-3 h-3" />
                          Enviar Email
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Ban className="w-3 h-3" />
                          Suspender
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-red-600">
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-gray-800">
                  <tr>
                    {showBulkActions && (
                      <th className="text-left py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length}
                          onChange={handleSelectAll}
                          className="rounded border-primary-300"
                        />
                      </th>
                    )}
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Usuário
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Papel
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Plano
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Assinatura
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Atividade
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                    >
                      {showBulkActions && (
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-primary-300"
                          />
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-primary-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-primary-600 dark:text-gray-400">
                              {user.email}
                            </p>
                            <p className="text-xs text-primary-500 dark:text-gray-500">
                              Entrou em {user.joinDate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-primary-900 dark:text-white font-medium">
                            {user.plan}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {getSubscriptionBadge(user.subscriptionStatus)}
                          {user.subscriptionExpiry && (
                            <p className="text-xs text-primary-500 dark:text-gray-500">
                              Expira em {user.subscriptionExpiry}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-sm">
                          <p className="text-primary-600 dark:text-gray-400">
                            Último login: {user.lastLogin}
                          </p>
                          <p className="text-primary-600 dark:text-gray-400">
                            Sequência: {user.studyStreak} dias
                          </p>
                          <p className="text-primary-600 dark:text-gray-400">
                            Total gasto: R$ {user.totalSpent.toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Visualizar"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Gerenciar Assinatura">
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Mais opções">
                            <MoreVertical className="w-4 h-4" />
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

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  Detalhes do Usuário
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 dark:text-white">
                      {selectedUser.name}
                    </h4>
                    <p className="text-primary-600 dark:text-gray-400">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-primary-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {selectedUser.coursesEnrolled}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Cursos
                    </p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {selectedUser.questionsAnswered}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Questões
                    </p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {selectedUser.flashcardsStudied}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Flashcards
                    </p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {selectedUser.studyStreak}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Sequência
                    </p>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="p-4 border border-primary-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-primary-900 dark:text-white mb-3">
                    Informações da Assinatura
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Plano</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.plan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Status</p>
                      {getSubscriptionBadge(selectedUser.subscriptionStatus)}
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Total Gasto</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        R$ {selectedUser.totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {selectedUser.subscriptionExpiry && (
                    <div className="mt-3">
                      <p className="text-sm text-primary-600 dark:text-gray-400">Expira em</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.subscriptionExpiry}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Gerenciar Assinatura
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}