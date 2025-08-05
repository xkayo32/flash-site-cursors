import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
  Camera,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Download,
  Trash2,
  AlertCircle,
  Check,
  X,
  LogOut,
  HelpCircle,
  FileText,
  ExternalLink,
  Info,
  CreditCard,
  Upload,
  Target,
  ShieldCheck,
  Lock,
  Activity,
  Crosshair,
  AlertTriangle,
  Zap,
  Swords,
  Clock,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { PageHeader } from '@/components/student';
import toast from 'react-hot-toast';

// Tipos
interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

// Dados mockados
const notificationSettings: NotificationSetting[] = [
  {
    id: 'study-reminders',
    title: 'ALERTAS DE MISSÃO',
    description: 'NOTIFICAÇÕES SOBRE OPERAÇÕES AGENDADAS',
    enabled: true,
    channels: { email: true, push: true, sms: false }
  },
  {
    id: 'new-content',
    title: 'NOVO ARSENAL TÁTICO',
    description: 'AVISOS SOBRE NOVOS RECURSOS E ARMAMENTOS',
    enabled: true,
    channels: { email: true, push: false, sms: false }
  },
  {
    id: 'achievements',
    title: 'CONDECORAÇÕES',
    description: 'ALERTAS SOBRE MEDALHAS E PROMOÇÕES',
    enabled: true,
    channels: { email: false, push: true, sms: false }
  },
  {
    id: 'marketing',
    title: 'COMUNICADOS DO COMANDO',
    description: 'INFORMAÇÕES ESTRATÉGICAS E ATUALIZAÇÕES',
    enabled: false,
    channels: { email: false, push: false, sms: false }
  }
];

const privacySettings: PrivacySetting[] = [
  {
    id: 'profile-visibility',
    title: 'PERFIL PÚBLICO',
    description: 'PERMITIR QUE OUTROS AGENTES VEJAM SEU PERFIL E ESTATÍSTICAS',
    enabled: false
  },
  {
    id: 'ranking-participation',
    title: 'RANKING OPERACIONAL',
    description: 'APARECER NO RANKING GERAL DE AGENTES',
    enabled: true
  },
  {
    id: 'study-data-sharing',
    title: 'INTELIGÊNCIA COMPARTILHADA',
    description: 'CONTRIBUIR ANONIMAMENTE PARA MELHORIAS DO SISTEMA',
    enabled: true
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [privacy, setPrivacy] = useState(privacySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Sections do menu
  const sections = [
    { id: 'account', label: 'DADOS DO AGENTE', icon: User },
    { id: 'security', label: 'SEGURANÇA', icon: ShieldCheck },
    { id: 'notifications', label: 'COMUNICAÇÕES', icon: Bell },
    { id: 'privacy', label: 'PRIVACIDADE', icon: Shield },
    { id: 'appearance', label: 'INTERFACE', icon: Monitor },
    { id: 'study', label: 'TREINAMENTO', icon: Target },
    { id: 'data', label: 'INTELIGÊNCIA', icon: Activity },
    { id: 'help', label: 'SUPORTE TÁTICO', icon: HelpCircle }
  ];

  // Toggle notificação
  const toggleNotification = (id: string, field?: 'enabled' | 'email' | 'push' | 'sms') => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === id) {
        if (field === 'enabled') {
          return { ...notif, enabled: !notif.enabled };
        } else if (field && field !== 'enabled') {
          return {
            ...notif,
            channels: { ...notif.channels, [field]: !notif.channels[field] }
          };
        }
      }
      return notif;
    }));
  };

  // Toggle privacidade
  const togglePrivacy = (id: string) => {
    setPrivacy(prev => prev.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  // Salvar configurações
  const saveSettings = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('CONFIGURAÇÕES ATUALIZADAS!', { icon: '✅' });
  };

  // Componente de toggle
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-accent-500" : "bg-gray-300 dark:bg-gray-600"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="CENTRO DE COMANDO"
        subtitle="GERENCIE SUAS CONFIGURAÇÕES OPERACIONAIS"
        icon={Settings}
        breadcrumbs={[
          { label: 'PAINEL DE COMANDO', href: '/student/dashboard' },
          { label: 'CONFIGURAÇÕES' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu lateral */}
        <Card className="lg:col-span-1 h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all font-police-body uppercase tracking-wider",
                    activeSection === section.id
                      ? "bg-gray-900 dark:bg-gray-700 text-white shadow-lg"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <section.icon className={cn(
                    "w-5 h-5",
                    activeSection === section.id ? "text-accent-500" : ""
                  )} />
                  <span className="text-sm font-medium">{section.label}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 ml-auto transition-transform",
                    activeSection === section.id ? "rotate-90" : ""
                  )} />
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Seção: Dados do Agente */}
            {activeSection === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <User className="w-6 h-6 text-accent-500" />
                      IDENTIFICAÇÃO DO AGENTE
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Foto de perfil */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 font-police-body uppercase">
                        FOTO DE IDENTIFICAÇÃO
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold font-police-title">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 font-police-body uppercase tracking-wider"
                          >
                            <Camera className="w-4 h-4" />
                            ALTERAR FOTO
                          </Button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG ou GIF. Máximo 2MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Informações pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                          NOME COMPLETO
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                          E-MAIL OPERACIONAL
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                          CONTATO TÁTICO
                        </label>
                        <input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                          IDENTIFICAÇÃO (CPF)
                        </label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                        INFORMAÇÕES DE COMBATE
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                          <Flag className="w-8 h-8 mx-auto mb-2 text-accent-500" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">127</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">DIAS EM CAMPO</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                          <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">89%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">PRECISÃO</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                          <Swords className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">15</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">MEDALHAS</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">ELITE</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">PATENTE</p>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-police-body uppercase tracking-wider"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        ENCERRAR MISSÃO
                      </Button>
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        {isLoading ? (
                          <>SALVANDO...</>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            SALVAR DADOS
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Segurança */}
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-accent-500" />
                      SEGURANÇA OPERACIONAL
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Alterar senha */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                        CREDENCIAIS DE ACESSO
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                            SENHA ATUAL
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                              NOVA SENHA
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                              CONFIRMAR NOVA SENHA
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Autenticação de dois fatores */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                        AUTENTICAÇÃO DE DOIS FATORES
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">PROTEÇÃO ADICIONAL</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Adicione uma camada extra de segurança à sua conta
                            </p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>

                    {/* Sessões ativas */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                        SESSÕES ATIVAS
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Chrome - Windows</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">São Paulo, Brasil • Agora</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50">
                            ATIVA
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">App Mobile - iOS</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">São Paulo, Brasil • 2 horas atrás</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600">
                            ENCERRAR
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        ATUALIZAR SEGURANÇA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Notificações */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <Bell className="w-6 h-6 text-accent-500" />
                      SISTEMA DE COMUNICAÇÕES
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {notifications.map(notif => (
                      <div key={notif.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white font-police-body">{notif.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{notif.description}</p>
                          </div>
                          <Toggle
                            enabled={notif.enabled}
                            onChange={() => toggleNotification(notif.id, 'enabled')}
                          />
                        </div>
                        
                        {notif.enabled && (
                          <div className="flex items-center gap-6 mt-4 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notif.channels.email}
                                onChange={() => toggleNotification(notif.id, 'email')}
                                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                              />
                              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm font-police-body">EMAIL</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notif.channels.push}
                                onChange={() => toggleNotification(notif.id, 'push')}
                                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                              />
                              <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm font-police-body">PUSH</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notif.channels.sms}
                                onChange={() => toggleNotification(notif.id, 'sms')}
                                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                              />
                              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm font-police-body">SMS</span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        SALVAR PREFERÊNCIAS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Privacidade */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <Shield className="w-6 h-6 text-accent-500" />
                      PROTOCOLOS DE PRIVACIDADE
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {privacy.map(setting => (
                      <div key={setting.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white font-police-body">{setting.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <Toggle
                          enabled={setting.enabled}
                          onChange={() => togglePrivacy(setting.id)}
                        />
                      </div>
                    ))}
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Suas informações são protegidas seguindo os mais altos padrões de segurança militar.
                            Dados sensíveis são criptografados e nunca compartilhados sem autorização.
                          </p>
                          <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 p-0 mt-2 font-police-body">
                            LER POLÍTICA COMPLETA
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        CONFIRMAR PROTOCOLOS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Aparência */}
            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <Monitor className="w-6 h-6 text-accent-500" />
                      INTERFACE DE COMANDO
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Tema */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        MODO DE VISUALIZAÇÃO
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-all",
                            theme === 'light' 
                              ? "border-accent-500 bg-accent-500/10" 
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          )}
                        >
                          <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                          <p className="font-medium text-gray-900 dark:text-white font-police-body">DIURNO</p>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-all",
                            theme === 'dark' 
                              ? "border-accent-500 bg-accent-500/10" 
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          )}
                        >
                          <Moon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <p className="font-medium text-gray-900 dark:text-white font-police-body">NOTURNO</p>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-all",
                            theme === 'system' 
                              ? "border-accent-500 bg-accent-500/10" 
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          )}
                        >
                          <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                          <p className="font-medium text-gray-900 dark:text-white font-police-body">AUTOMÁTICO</p>
                        </button>
                      </div>
                    </div>

                    {/* Outras preferências visuais */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        PREFERÊNCIAS VISUAIS
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">ANIMAÇÕES TÁTICAS</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ativar transições e efeitos visuais</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">MODO COMPACTO</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reduzir espaçamentos para mais informação</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">MODO FURTIVO</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reduzir brilho e contraste</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        APLICAR CONFIGURAÇÕES
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Treinamento */}
            {activeSection === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <Target className="w-6 h-6 text-accent-500" />
                      CONFIGURAÇÕES DE TREINAMENTO
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Metas diárias */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        OBJETIVOS OPERACIONAIS
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                            TEMPO DE OPERAÇÃO (MINUTOS)
                          </label>
                          <input
                            type="number"
                            defaultValue="120"
                            min="15"
                            max="480"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                            ALVOS POR DIA
                          </label>
                          <input
                            type="number"
                            defaultValue="50"
                            min="10"
                            max="200"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferências de revisão */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        SISTEMA DE REVISÃO TÁTICA
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">REVISÃO AUTOMÁTICA</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Adicionar alvos perdidos à revisão</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">MODO INTENSIVO</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Focar em áreas de maior dificuldade</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white font-police-body">MODO FURTIVO</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ocultar distrações durante operações</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas de desempenho */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        ANÁLISE DE DESEMPENHO
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-police-numbers">92%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">PRECISÃO GERAL</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-police-numbers">2.5h</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">TEMPO MÉDIO</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-police-numbers">127</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">SEQUÊNCIA ATUAL</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-police-numbers">15k</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">ALVOS ELIMINADOS</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={saveSettings} 
                        disabled={isLoading}
                        className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        SALVAR OBJETIVOS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Dados */}
            {activeSection === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <Activity className="w-6 h-6 text-accent-500" />
                      INTELIGÊNCIA DE DADOS
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white font-police-subtitle uppercase">EXPORTAR DADOS OPERACIONAIS</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Baixe todo seu histórico de operações em formato JSON
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="gap-2 font-police-body uppercase tracking-wider"
                          onClick={() => toast.info('PREPARANDO EXPORTAÇÃO...', { icon: '📦' })}
                        >
                          <Download className="w-4 h-4" />
                          EXPORTAR
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white font-police-subtitle uppercase">RELATÓRIO DE ATIVIDADES</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Análise detalhada de todas as suas operações táticas
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="gap-2 font-police-body uppercase tracking-wider"
                          onClick={() => toast.info('GERANDO RELATÓRIO...', { icon: '📊' })}
                        >
                          <FileText className="w-4 h-4" />
                          GERAR PDF
                        </Button>
                      </div>
                    </div>

                    {/* Estatísticas de uso */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase">
                        ESTATÍSTICAS DE USO
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <p className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">524MB</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">ESPAÇO UTILIZADO</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <p className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">1,247</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">OPERAÇÕES REALIZADAS</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <p className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">385h</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">TEMPO TOTAL</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Ajuda */}
            {activeSection === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                      <HelpCircle className="w-6 h-6 text-accent-500" />
                      CENTRAL DE SUPORTE TÁTICO
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a href="#" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                        <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-accent-500 mb-3" />
                        <h3 className="font-medium text-gray-900 dark:text-white font-police-body uppercase">MANUAL OPERACIONAL</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Guias e procedimentos táticos</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                        <Mail className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-accent-500 mb-3" />
                        <h3 className="font-medium text-gray-900 dark:text-white font-police-body uppercase">CONTATO DIRETO</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fale com o comando</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                        <HelpCircle className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-accent-500 mb-3" />
                        <h3 className="font-medium text-gray-900 dark:text-white font-police-body uppercase">PERGUNTAS FREQUENTES</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Respostas rápidas</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                        <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-accent-500 mb-3" />
                        <h3 className="font-medium text-gray-900 dark:text-white font-police-body uppercase">TERMOS OPERACIONAIS</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Políticas e regulamentos</p>
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-center text-white">
                      <Crosshair className="w-12 h-12 mx-auto mb-3 text-accent-500" />
                      <h3 className="font-bold text-lg mb-2 font-police-title uppercase">PRECISA DE SUPORTE IMEDIATO?</h3>
                      <p className="text-gray-300 mb-4 font-police-body">
                        Nossa equipe tática está disponível 24/7 para assistência
                      </p>
                      <Button 
                        className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                        onClick={() => toast.info('ABRINDO CANAL SEGURO...', { icon: '📡' })}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        INICIAR CONTATO
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de exclusão de conta */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase">
                  ENCERRAR MISSÃO PERMANENTEMENTE?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  Esta ação é irreversível. Todos os dados operacionais serão apagados.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase">
                  Digite "ENCERRAR" para confirmar
                </label>
                <input
                  type="text"
                  placeholder="ENCERRAR"
                  className="w-full px-4 py-2 border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-police-body uppercase tracking-wider"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  CANCELAR
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 font-police-body uppercase tracking-wider"
                  disabled
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  ENCERRAR MISSÃO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}