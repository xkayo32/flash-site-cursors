import { useState, useEffect } from 'react';
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
  Activity,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const plans = ['Todos', 'Básico', 'Premium', 'VIP', 'Unlimited'];
const roles = ['Todos', 'student', 'instructor', 'admin'];
const statuses = ['Todos', 'active', 'suspended', 'pending', 'inactive'];

export default function UserManager() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Todos');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
    phone: '',
    plan_id: ''
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus, includeInactive]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.listUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: selectedRole,
        status: selectedStatus,
        includeInactive: includeInactive
      });

      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalUsers(response.pagination.total);
        }
      } else {
        toast.error(response.message || 'Erro ao carregar usuários');
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await userService.createUser(formData);
      if (response.success) {
        toast.success('Usuário criado com sucesso');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          status: 'active',
          phone: '',
          plan_id: ''
        });
        loadUsers();
      } else {
        toast.error(response.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData: any = {};
      if (formData.name && formData.name !== selectedUser.name) updateData.name = formData.name;
      if (formData.email && formData.email !== selectedUser.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.role !== selectedUser.role) updateData.role = formData.role;
      if (formData.status !== selectedUser.status) updateData.status = formData.status;
      if (formData.phone !== selectedUser.phone) updateData.phone = formData.phone;

      const response = await userService.updateUser(selectedUser.id, updateData);
      if (response.success) {
        toast.success('Usuário atualizado com sucesso');
        setShowEditModal(false);
        loadUsers();
      } else {
        toast.error(response.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success('Usuário desativado com sucesso');
        loadUsers();
      } else {
        toast.error(response.message || 'Erro ao desativar usuário');
      }
    } catch (error) {
      toast.error('Erro ao desativar usuário');
    }
  };

  // Check if current admin can modify user status
  const canModifyUserStatus = (user: any) => {
    if (!currentUser) return false;
    
    // Cannot modify own status
    if (currentUser.id === user.id) return false;
    
    // Cannot modify other admin's status
    if (user.role === 'admin') return false;
    
    return true;
  };

  // Check if current admin can delete user
  const canDeleteUser = (user: any) => {
    if (!currentUser) return false;
    
    // Cannot delete self
    if (currentUser.id === user.id) return false;
    
    // Cannot delete other admins
    if (user.role === 'admin') return false;
    
    return true;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', variant: 'default' as const, icon: Shield, color: 'bg-red-100 text-red-800' },
      instructor: { label: 'Instrutor', variant: 'secondary' as const, icon: Crown, color: 'bg-purple-100 text-purple-800' },
      student: { label: 'Aluno', variant: 'secondary' as const, icon: User, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
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
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'Inativa', color: 'bg-gray-100 text-gray-800', icon: X },
      expired: { label: 'Expirada', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: X },
      trial: { label: 'Trial', color: 'bg-blue-100 text-blue-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewUser = async (user: any) => {
    try {
      const response = await userService.getUser(user.id);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowUserModal(true);
      } else {
        toast.error('Erro ao carregar detalhes do usuário');
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes do usuário');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      plan_id: ''
    });
    setShowEditModal(true);
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
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
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
                  {totalUsers}
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
                  {users.filter(u => u.subscription?.status === 'active').length}
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
                  Novos este Mês
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  12
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Taxa de Churn
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  2.3%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Incluir inativos</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assinatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                    <p className="mt-2 text-gray-500">Carregando usuários...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                          alt={user.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.subscription?.plan || 'Sem plano'}
                        </p>
                        {getSubscriptionBadge(user.subscription?.status || 'inactive')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={!canDeleteUser(user)}
                          className={`${
                            canDeleteUser(user)
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={canDeleteUser(user) ? "Desativar" : "Não é possível desativar este usuário"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                  Novo Usuário
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Função
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Aluno</option>
                    <option value="instructor">Instrutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} className="gap-2">
                  <Save className="w-4 h-4" />
                  Criar Usuário
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                  Editar Usuário
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedUser && !canModifyUserStatus(selectedUser) && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {currentUser?.id === selectedUser.id 
                      ? "Você não pode alterar seu próprio status"
                      : "O status de outros administradores não pode ser alterado"
                    }
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha (deixe em branco para manter a atual)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Função
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Aluno</option>
                    <option value="instructor">Instrutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                    {selectedUser && !canModifyUserStatus(selectedUser) && (
                      <span className="text-xs text-gray-500 ml-2">(não editável)</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={selectedUser && !canModifyUserStatus(selectedUser)}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser} className="gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                  Detalhes do Usuário
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-start gap-6">
                  <img
                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=14242f&color=fff`}
                    alt={selectedUser.name}
                    className="w-24 h-24 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-primary-600 dark:text-gray-300">{selectedUser.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Telefone</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.phone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Cadastro</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Último Acesso</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-bold text-primary-900 dark:text-white mb-3">
                    Informações da Assinatura
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Plano</p>
                      <p className="font-medium text-primary-900 dark:text-white">
                        {selectedUser.subscription?.plan || 'Sem plano'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 dark:text-gray-400">Status</p>
                      {getSubscriptionBadge(selectedUser.subscription?.status || 'inactive')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      handleEditUser(selectedUser);
                      setShowUserModal(false);
                    }}
                  >
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