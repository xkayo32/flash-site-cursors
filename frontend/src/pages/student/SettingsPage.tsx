import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
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
  Wifi,
  Download,
  Trash2,
  AlertCircle,
  Check,
  X,
  LogOut,
  HelpCircle,
  FileText,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';

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
    title: 'Lembretes de Estudo',
    description: 'Notificações sobre sessões de estudo agendadas',
    enabled: true,
    channels: { email: true, push: true, sms: false }
  },
  {
    id: 'new-content',
    title: 'Novo Conteúdo',
    description: 'Avisos sobre novas aulas, questões e materiais',
    enabled: true,
    channels: { email: true, push: false, sms: false }
  },
  {
    id: 'achievements',
    title: 'Conquistas',
    description: 'Notificações sobre metas alcançadas e badges',
    enabled: true,
    channels: { email: false, push: true, sms: false }
  },
  {
    id: 'marketing',
    title: 'Promoções e Ofertas',
    description: 'Comunicações sobre descontos e novidades',
    enabled: false,
    channels: { email: false, push: false, sms: false }
  }
];

const privacySettings: PrivacySetting[] = [
  {
    id: 'profile-visibility',
    title: 'Perfil Público',
    description: 'Permitir que outros usuários vejam seu perfil e estatísticas',
    enabled: false
  },
  {
    id: 'ranking-participation',
    title: 'Participar do Ranking',
    description: 'Aparecer no ranking geral e comparações',
    enabled: true
  },
  {
    id: 'study-data-sharing',
    title: 'Compartilhar Dados de Estudo',
    description: 'Contribuir anonimamente para melhorias do sistema',
    enabled: true
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [privacy, setPrivacy] = useState(privacySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Sections do menu
  const sections = [
    { id: 'account', label: 'Conta', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'study', label: 'Estudos', icon: Settings },
    { id: 'data', label: 'Dados', icon: Download },
    { id: 'help', label: 'Ajuda', icon: HelpCircle }
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
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Componente de toggle
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-primary-600" : "bg-gray-200"
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Configurações</h1>
        <p className="text-primary-600">
          Gerencie suas preferências e configurações da conta
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu lateral */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary-100 text-primary-900"
                      : "hover:bg-gray-100 text-primary-600"
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Seção: Conta */}
            {activeSection === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Informações da Conta</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Foto de perfil */}
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-3">
                        Foto de Perfil
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Camera className="w-4 h-4" />
                            Alterar Foto
                          </Button>
                          <p className="text-xs text-primary-500 mt-1">
                            JPG, PNG ou GIF. Máximo 2MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Informações pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          CPF
                        </label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Alterar senha */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">Segurança</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            Senha Atual
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full px-4 py-2 pr-10 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-primary-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-primary-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                              Nova Senha
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                              Confirmar Nova Senha
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Conta
                      </Button>
                      <Button onClick={saveSettings} disabled={isLoading}>
                        {isLoading ? (
                          <>Salvando...</>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Preferências de Notificação</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {notifications.map(notif => (
                      <div key={notif.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-primary-900">{notif.title}</h3>
                            <p className="text-sm text-primary-600">{notif.description}</p>
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
                                className="rounded border-primary-300"
                              />
                              <Mail className="w-4 h-4 text-primary-600" />
                              <span className="text-sm">Email</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notif.channels.push}
                                onChange={() => toggleNotification(notif.id, 'push')}
                                className="rounded border-primary-300"
                              />
                              <Smartphone className="w-4 h-4 text-primary-600" />
                              <span className="text-sm">Push</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notif.channels.sms}
                                onChange={() => toggleNotification(notif.id, 'sms')}
                                className="rounded border-primary-300"
                              />
                              <Volume2 className="w-4 h-4 text-primary-600" />
                              <span className="text-sm">SMS</span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={isLoading}>
                        Salvar Preferências
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Configurações de Privacidade</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {privacy.map(setting => (
                      <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-primary-900">{setting.title}</h3>
                          <p className="text-sm text-primary-600">{setting.description}</p>
                        </div>
                        <Toggle
                          enabled={setting.enabled}
                          onChange={() => togglePrivacy(setting.id)}
                        />
                      </div>
                    ))}
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800">
                            Suas informações pessoais são protegidas de acordo com a LGPD.
                            Nunca compartilhamos seus dados com terceiros sem sua autorização.
                          </p>
                          <Button variant="link" size="sm" className="text-blue-600 p-0 mt-2">
                            Ler Política de Privacidade
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={isLoading}>
                        Salvar Configurações
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Personalização Visual</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tema */}
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">Tema</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-colors",
                            theme === 'light' ? "border-primary-500" : "border-primary-200"
                          )}
                        >
                          <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                          <p className="font-medium">Claro</p>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-colors",
                            theme === 'dark' ? "border-primary-500" : "border-primary-200"
                          )}
                        >
                          <Moon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <p className="font-medium">Escuro</p>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-colors",
                            theme === 'system' ? "border-primary-500" : "border-primary-200"
                          )}
                        >
                          <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                          <p className="font-medium">Sistema</p>
                        </button>
                      </div>
                    </div>

                    {/* Outras preferências visuais */}
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">Preferências Visuais</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary-900">Animações</p>
                            <p className="text-sm text-primary-600">Ativar animações e transições</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary-900">Modo Compacto</p>
                            <p className="text-sm text-primary-600">Reduzir espaçamentos na interface</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={isLoading}>
                        Aplicar Tema
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Estudos */}
            {activeSection === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Preferências de Estudo</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Metas diárias */}
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">Metas Diárias</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            Tempo de Estudo (minutos)
                          </label>
                          <input
                            type="number"
                            defaultValue="120"
                            min="15"
                            max="480"
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            Questões por Dia
                          </label>
                          <input
                            type="number"
                            defaultValue="50"
                            min="10"
                            max="200"
                            className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferências de revisão */}
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">Sistema de Revisão</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary-900">Revisar Automaticamente</p>
                            <p className="text-sm text-primary-600">Adicionar questões erradas à revisão</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary-900">Modo Focado</p>
                            <p className="text-sm text-primary-600">Ocultar distrações durante o estudo</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={isLoading}>
                        Salvar Preferências
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Seus Dados</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-primary-900">Exportar Dados</h3>
                          <p className="text-sm text-primary-600">
                            Baixe todos os seus dados em formato JSON
                          </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Exportar
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-primary-900">Histórico de Atividades</h3>
                          <p className="text-sm text-primary-600">
                            Relatório detalhado de todas as suas atividades
                          </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Gerar Relatório
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-red-200 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-red-900">Limpar Cache</h3>
                          <p className="text-sm text-red-600">
                            Remove dados temporários para liberar espaço
                          </p>
                        </div>
                        <Button variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                          Limpar
                        </Button>
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900">Central de Ajuda</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a href="#" className="p-4 border rounded-lg hover:border-primary-500 transition-colors">
                        <FileText className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="font-medium text-primary-900">Documentação</h3>
                        <p className="text-sm text-primary-600">Guias e tutoriais</p>
                      </a>
                      
                      <a href="#" className="p-4 border rounded-lg hover:border-primary-500 transition-colors">
                        <Mail className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="font-medium text-primary-900">Suporte</h3>
                        <p className="text-sm text-primary-600">Entre em contato</p>
                      </a>
                      
                      <a href="#" className="p-4 border rounded-lg hover:border-primary-500 transition-colors">
                        <HelpCircle className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="font-medium text-primary-900">FAQ</h3>
                        <p className="text-sm text-primary-600">Perguntas frequentes</p>
                      </a>
                      
                      <a href="#" className="p-4 border rounded-lg hover:border-primary-500 transition-colors">
                        <Shield className="w-8 h-8 text-primary-600 mb-3" />
                        <h3 className="font-medium text-primary-900">Termos de Uso</h3>
                        <p className="text-sm text-primary-600">Políticas e termos</p>
                      </a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <h3 className="font-medium text-primary-900 mb-2">Precisa de ajuda?</h3>
                      <p className="text-sm text-primary-600 mb-4">
                        Nossa equipe está disponível de segunda a sexta, das 9h às 18h
                      </p>
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Mensagem
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
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  Excluir Conta Permanentemente?
                </h3>
                <p className="text-primary-600">
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Digite "EXCLUIR" para confirmar
                </label>
                <input
                  type="text"
                  placeholder="EXCLUIR"
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled
                >
                  Excluir Conta
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}