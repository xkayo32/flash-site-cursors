import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

// Tactical military terminology for admin interface
const plans = ['Todos', 'RECRUTA', 'ESPECIALISTA', 'ELITE', 'COMANDO SUPREMO'];
const roles = ['Todos', 'student', 'instructor', 'admin'];
const statuses = ['Todos', 'active', 'suspended', 'pending', 'inactive'];

export default function UserManager() {
  const navigate = useNavigate();
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
      admin: { label: 'COMANDO', variant: 'default' as const, icon: Shield, color: 'bg-accent-500 text-black dark:bg-accent-600 dark:text-black border-2 border-accent-600' },
      instructor: { label: 'OFICIAL', variant: 'secondary' as const, icon: Crown, color: 'bg-gray-600 text-white dark:bg-gray-400 dark:text-gray-800 border-2 border-gray-700' },
      student: { label: 'OPERADOR', variant: 'secondary' as const, icon: User, color: 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white border-2 border-gray-600' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 font-police-title font-bold uppercase tracking-ultra-wide shadow-lg`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'OPERACIONAL', color: 'bg-green-500 text-white dark:bg-green-600 dark:text-white border-2 border-green-600' },
      suspended: { label: 'SUSPENSO', color: 'bg-red-500 text-white dark:bg-red-600 dark:text-white border-2 border-red-600' },
      pending: { label: 'EM ANÁLISE', color: 'bg-yellow-500 text-black dark:bg-yellow-600 dark:text-black border-2 border-yellow-600' },
      inactive: { label: 'FORA DE SERVIÇO', color: 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white border-2 border-gray-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} font-police-title font-bold uppercase tracking-ultra-wide shadow-lg`}>
        {config.label}
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'ATIVA', color: 'bg-accent-500 text-black dark:bg-accent-600 dark:text-black', icon: CheckCircle },
      inactive: { label: 'INATIVA', color: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300', icon: X },
      expired: { label: 'EXPIRADA', color: 'bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-300', icon: AlertCircle },
      cancelled: { label: 'CANCELADA', color: 'bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-300', icon: X },
      trial: { label: 'TRIAL', color: 'bg-gray-600 text-white dark:bg-gray-400 dark:text-gray-800', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 font-police-body font-semibold uppercase tracking-wider`}>
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
    <div className="p-4 space-y-4 bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-gray-800 min-h-full relative">
      {/* Tactical Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
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
      
      {/* Tactical Corner Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-accent-500/20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-500/20" />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="relative z-10">
          {/* Command Header with Tactical Elements */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            <div className="w-1 h-8 bg-accent-500/60" />
            <Shield className="w-8 h-8 text-accent-500" />
            <div className="w-1 h-8 bg-accent-500/60" />
            <User className="w-6 h-6 text-accent-500" />
          </div>
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-ultra-wide text-gray-900 dark:text-white">
            GESTÃO DE TROPAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            SISTEMA INTEGRADO DE COMANDO PESSOAL
          </p>
          {/* Tactical underline */}
          <div className="mt-3 w-40 h-1 bg-gradient-to-r from-accent-500 via-accent-600 to-transparent" />
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              navigate('/admin/users/new');
              toast.success('Redirecionando para novo usuário', {
                duration: 2000,
                icon: '📋'
              });
            }}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-title font-bold uppercase tracking-ultra-wide transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-accent-600 hover:border-accent-700 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            NOVO USUÁRIO
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden">
          <CardContent className="p-3 relative z-10">
            {/* Tactical Elements */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent-500/60 to-accent-500/30" />
            <div className="absolute top-0 left-0 w-8 h-1 bg-accent-500/50 group-hover:bg-accent-500 transition-all duration-300" />
            <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-accent-500/20 group-hover:border-accent-500/60 transition-all duration-300" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-bold text-gray-600 dark:text-accent-500 uppercase tracking-ultra-wide">
                  TROPAS OPERACIONAIS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <User className="w-6 h-6 text-accent-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden">
          <CardContent className="p-3 relative z-10">
            {/* Tactical Elements */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-500/60 to-green-500/30" />
            <div className="absolute top-0 left-0 w-8 h-1 bg-green-500/50 group-hover:bg-green-500 transition-all duration-300" />
            <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-green-500/20 group-hover:border-green-500/60 transition-all duration-300" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-bold text-gray-600 dark:text-green-400 uppercase tracking-ultra-wide">
                  CLEARANCE ATIVO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.subscription?.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center border-2 border-accent-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden">
          <CardContent className="p-3 relative z-10">
            {/* Tactical Elements */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500/60 to-blue-500/30" />
            <div className="absolute top-0 left-0 w-8 h-1 bg-blue-500/50 group-hover:bg-blue-500 transition-all duration-300" />
            <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500/20 group-hover:border-blue-500/60 transition-all duration-300" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-bold text-gray-600 dark:text-blue-400 uppercase tracking-ultra-wide">
                  RECRUTAS RECENTES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  12
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border-2 border-gray-700 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden">
          <CardContent className="p-3 relative z-10">
            {/* Tactical Elements */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500/60 to-red-500/30" />
            <div className="absolute top-0 left-0 w-8 h-1 bg-red-500/50 group-hover:bg-red-500 transition-all duration-300" />
            <div className="absolute bottom-0 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500/20 group-hover:border-red-500/60 transition-all duration-300" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-subtitle font-bold text-gray-600 dark:text-red-400 uppercase tracking-ultra-wide">
                  DESERÇÃO TÁTICA
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  2.3%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <DollarSign className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg relative overflow-hidden"
      >
        {/* Tactical Filter Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500/30 via-accent-500/60 to-accent-500/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500/20" />
        <div className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-accent-500 transition-colors" />
            <input
              type="text"
              placeholder="BUSCAR POR NOME OU EMAIL..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-subtitle placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-300 shadow-inner hover:shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role === 'Todos' ? role.toUpperCase() : role.toUpperCase()}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-police-body uppercase tracking-wider">INCLUIR INATIVOS</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-800/80">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  USUÁRIO
                </th>
                <th className="px-4 py-2 text-left text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  FUNÇÃO
                </th>
                <th className="px-4 py-2 text-left text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-2 text-left text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  ASSINATURA
                </th>
                <th className="px-4 py-2 text-left text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  ÚLTIMO ACESSO
                </th>
                <th className="px-6 py-3 text-right text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                    <p className="mt-2 text-gray-500">Carregando usuários...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                          alt={user.name}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-police-subtitle font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                          {user.subscription?.plan || 'SEM PLANO'}
                        </p>
                        {getSubscriptionBadge(user.subscription?.status || 'inactive')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-police-numbers">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'NUNCA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={!canDeleteUser(user)}
                          className={`transition-colors ${
                            canDeleteUser(user)
                              ? 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  NOVO USUÁRIO
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
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    NOME *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    SENHA *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    TELEFONE
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    FUNÇÃO
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">ALUNO</option>
                    <option value="instructor">INSTRUTOR</option>
                    <option value="admin">ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    STATUS
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">ATIVO</option>
                    <option value="suspended">SUSPENSO</option>
                    <option value="pending">PENDENTE</option>
                    <option value="inactive">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  CANCELAR
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  <Save className="w-4 h-4" />
                  CRIAR USUÁRIO
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  EDITAR USUÁRIO
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
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    NOME
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    NOVA SENHA (DEIXE EM BRANCO PARA MANTER A ATUAL)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    TELEFONE
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    FUNÇÃO
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">ALUNO</option>
                    <option value="instructor">INSTRUTOR</option>
                    <option value="admin">ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    STATUS
                    {selectedUser && !canModifyUserStatus(selectedUser) && (
                      <span className="text-xs text-gray-500 ml-2 font-police-body">(NÃO EDITÁVEL)</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={selectedUser && !canModifyUserStatus(selectedUser)}
                  >
                    <option value="active">ATIVO</option>
                    <option value="suspended">SUSPENSO</option>
                    <option value="pending">PENDENTE</option>
                    <option value="inactive">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  CANCELAR
                </Button>
                <Button 
                  onClick={handleUpdateUser} 
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  <Save className="w-4 h-4" />
                  SALVAR ALTERAÇÕES
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  DETALHES DO USUÁRIO
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
                    <h3 className="text-xl font-police-subtitle font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 font-police-body">{selectedUser.email}</p>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">EMAIL</p>
                      <p className="font-police-body font-semibold text-gray-900 dark:text-white">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">TELEFONE</p>
                      <p className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                        {selectedUser.phone || 'NÃO INFORMADO'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">CADASTRO</p>
                      <p className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">ÚLTIMO ACESSO</p>
                      <p className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('pt-BR') : 'NUNCA'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-police-subtitle font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                    INFORMAÇÕES DA ASSINATURA
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">PLANO</p>
                      <p className="font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        {selectedUser.subscription?.plan || 'SEM PLANO'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body font-medium uppercase tracking-wider">STATUS</p>
                      {getSubscriptionBadge(selectedUser.subscription?.status || 'inactive')}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    ENVIAR EMAIL
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                    onClick={() => {
                      handleEditUser(selectedUser);
                      setShowUserModal(false);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    EDITAR
                  </Button>
                  <Button className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors">
                    <CreditCard className="w-4 h-4" />
                    GERENCIAR ASSINATURA
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