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
  ToggleRight,
  Info,
  CreditCard,
  Upload,
  Image,
  Type,
  Zap,
  Server,
  Database,
  Lock,
  Users,
  BarChart3,
  Wrench,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import '../../styles/police-fonts.css';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import toast from 'react-hot-toast';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { NotificationsSection, BackupSection, AnalyticsSection } from './AdminSettingsExtensions';

// Componente Toggle
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-accent-500" : "bg-gray-300 dark:bg-gray-700"
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
}

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { systemName, systemLogo, companyInfo, updateSystemName, updateSystemLogo, updateCompanyInfo } = useSystemSettings();
  const [localSystemName, setLocalSystemName] = useState(systemName);
  const [logoLight, setLogoLight] = useState<string | null>(systemLogo);
  const [logoDark, setLogoDark] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Configurações de pagamento
  const [paymentSettings, setPaymentSettings] = useState({
    stripePublishableKey: 'pk_test_...',
    stripeSecretKey: 'sk_test_...',
    stripeWebhookSecret: 'whsec_...',
    enableTestMode: true,
    currency: 'BRL',
    enableSubscriptions: true,
    enableOneTimePayments: true,
    taxRate: 0, // %
    processingFee: 2.9, // %
    enablePix: true,
    enableBoleto: false,
    enableCreditCard: true,
    enableDebitCard: false
  });

  // Configurações do sistema
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maxFileSize: 10, // MB
    sessionTimeout: 30, // minutos
    backupFrequency: 'daily'
  });

  // Usar informações da empresa do store
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);

  // Configurações de SMTP
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: 'noreply@studypro.com.br',
    password: '',
    fromName: 'Study Pro',
    fromEmail: 'noreply@studypro.com.br'
  });

  // Termos e Políticas
  const [legalSettings, setLegalSettings] = useState({
    termsOfService: 'Ao utilizar nossa plataforma...',
    privacyPolicy: 'Nossa política de privacidade...',
    cookiePolicy: 'Utilizamos cookies para...',
    refundPolicy: 'Nossa política de reembolso...',
    dataRetentionDays: 365
  });

  // Seções do menu
  const sections = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'branding', label: 'Marca e Logo', icon: Palette },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'smtp', label: 'Servidor de Email', icon: Mail },
    { id: 'legal', label: 'Termos e Políticas', icon: FileText },
    { id: 'system', label: 'Sistema', icon: Server },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // Upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'light') {
          setLogoLight(result);
        } else {
          setLogoDark(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover logo
  const removeLogo = (type: 'light' | 'dark') => {
    if (type === 'light') {
      setLogoLight(null);
    } else {
      setLogoDark(null);
    }
  };

  // Toggle configuração do sistema
  const toggleSystemSetting = (key: keyof typeof systemSettings) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle configuração de pagamento
  const togglePaymentSetting = (key: keyof typeof paymentSettings) => {
    if (typeof paymentSettings[key] === 'boolean') {
      setPaymentSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  // Atualizar configuração de pagamento
  const updatePaymentSetting = (key: keyof typeof paymentSettings, value: string | number) => {
    setPaymentSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Atualizar informações da empresa localmente
  const updateLocalCompanyInfo = (key: string, value: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setLocalCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setLocalCompanyInfo(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Atualizar configurações SMTP
  const updateSmtpSetting = (key: keyof typeof smtpSettings, value: string | number | boolean) => {
    setSmtpSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Atualizar termos e políticas
  const updateLegalSetting = (key: keyof typeof legalSettings, value: string | number) => {
    setLegalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Salvar configurações
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Aqui você faria as chamadas para a API para salvar as configurações
      // Por enquanto, vamos simular o salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o store global
      updateSystemName(localSystemName);
      if (logoLight) {
        updateSystemLogo(logoLight);
      }
      updateCompanyInfo(localCompanyInfo);
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-police-title uppercase tracking-widest text-gray-900 dark:text-white mb-2">
          CONFIGURAÇÕES DO COMANDO
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
          Central de controle operacional da plataforma
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu Lateral */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <nav className="space-y-1 p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all font-police-body uppercase tracking-wider",
                      activeSection === section.id
                        ? "bg-gray-900 dark:bg-gray-700 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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

          {/* Info Card */}
          <Card className="mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{user?.name}</p>
                  <p className="text-sm text-accent-500 font-police-body uppercase tracking-wider">COMANDANTE</p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 font-police-numbers">
                <p>VERSÃO: 1.0.0</p>
                <p>ACESSO: HOJE 14:30</p>
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  STATUS: OPERACIONAL
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conteúdo Principal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            {/* Seção: Geral */}
            {activeSection === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES GERAIS</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        NOME DA PLATAFORMA
                      </label>
                      <input
                        type="text"
                        value={localSystemName}
                        onChange={(e) => setLocalSystemName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        DESCRIÇÃO DA PLATAFORMA
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Plataforma completa para preparação em concursos públicos"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        FUSO HORÁRIO
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all">
                        <option>America/Sao_Paulo (UTC-3)</option>
                        <option>America/New_York (UTC-5)</option>
                        <option>Europe/London (UTC+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        IDIOMA PADRÃO
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all">
                        <option>Português (Brasil)</option>
                        <option>English (US)</option>
                        <option>Español</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Marca e Logo */}
            {activeSection === 'branding' && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">IDENTIDADE VISUAL</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Aviso sobre logo */}
                    <div className="p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-accent-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">CONFIGURAÇÃO ATUAL</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            O sistema está usando a logo colorida (Logo_colorida_2.png) em ambos os temas.
                            Para alterar a logo, faça upload de uma nova imagem abaixo.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Logo Principal */}
                    <div>
                      <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                        LOGO PRINCIPAL
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:border-accent-500 dark:hover:border-accent-500">
                        {logoLight ? (
                          <div className="text-center">
                            <img src={logoLight} alt="Logo Principal" className="max-h-20 mx-auto mb-3" />
                            <div className="flex gap-2 justify-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeLogo('light')} 
                                className="gap-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                REMOVER
                              </Button>
                              <label className="cursor-pointer">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 border-gray-300 dark:border-gray-600 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500 dark:hover:text-accent-500 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  SUBSTITUIR
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLogoUpload(e, 'light')}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block text-center">
                            <div className="text-gray-600 dark:text-gray-400">
                              <Upload className="w-10 h-10 mx-auto mb-3 text-accent-500" />
                              <p className="text-sm font-police-body font-medium uppercase tracking-wider">CLIQUE PARA FAZER UPLOAD</p>
                              <p className="text-xs font-police-numbers mt-1">PNG, JPG ATÉ 2MB</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleLogoUpload(e, 'light')}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Logo Tema Escuro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Logo - Tema Escuro
                      </label>
                      <div className="border-2 border-dashed border-primary-300 dark:border-gray-600 rounded-lg p-6 bg-gray-900">
                        {logoDark ? (
                          <div className="text-center">
                            <img src={logoDark} alt="Logo Escuro" className="max-h-16 mx-auto mb-3" />
                            <div className="flex gap-2 justify-center">
                              <Button variant="outline" size="sm" onClick={() => removeLogo('dark')} className="gap-2 bg-white text-gray-900">
                                <Trash2 className="w-4 h-4" />
                                Remover
                              </Button>
                              <label className="cursor-pointer">
                                <Button variant="outline" size="sm" className="gap-2 bg-white text-gray-900">
                                  <Upload className="w-4 h-4" />
                                  Substituir
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLogoUpload(e, 'dark')}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block text-center">
                            <div className="text-gray-400">
                              <Upload className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Clique para fazer upload</p>
                              <p className="text-xs">PNG, JPG até 2MB • Versão para tema escuro</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleLogoUpload(e, 'dark')}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <h3 className="font-police-subtitle font-medium text-gray-900 dark:text-white mb-3 uppercase tracking-wider">PRÉ-VISUALIZAÇÃO</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-2">Tema Claro</p>
                          <div className="flex items-center gap-2">
                            <StudyProLogo variant="icon" size="sm" />
                            <span className="font-police-title text-gray-900 uppercase tracking-widest">{localSystemName}</span>
                          </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-400 mb-2">Tema Escuro</p>
                          <div className="flex items-center gap-2">
                            <StudyProLogo variant="icon" size="sm" />
                            <span className="font-police-title text-white uppercase tracking-widest">{localSystemName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Informações da Empresa */}
            {activeSection === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  {/* Dados Básicos */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">DADOS DA EMPRESA</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            value={localCompanyInfo.cnpj}
                            onChange={(e) => updateLocalCompanyInfo('cnpj', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
                            placeholder="00.000.000/0001-00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Razão Social
                          </label>
                          <input
                            type="text"
                            value={companyInfo.razaoSocial}
                            onChange={(e) => updateCompanyInfo('razaoSocial', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="Study Pro Educação Ltda"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Nome Fantasia
                          </label>
                          <input
                            type="text"
                            value={companyInfo.nomeFantasia}
                            onChange={(e) => updateCompanyInfo('nomeFantasia', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="Study Pro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Email de Contato
                          </label>
                          <input
                            type="email"
                            value={companyInfo.email}
                            onChange={(e) => updateCompanyInfo('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="contato@studypro.com.br"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Telefone
                          </label>
                          <input
                            type="text"
                            value={companyInfo.telefone}
                            onChange={(e) => updateCompanyInfo('telefone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            WhatsApp
                          </label>
                          <input
                            type="text"
                            value={companyInfo.whatsapp}
                            onChange={(e) => updateCompanyInfo('whatsapp', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Endereço */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">ENDEREÇO OPERACIONAL</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.cep}
                            onChange={(e) => updateCompanyInfo('endereco.cep', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="01234-567"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Logradouro
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.logradouro}
                            onChange={(e) => updateCompanyInfo('endereco.logradouro', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="Rua das Flores, 123"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.bairro}
                            onChange={(e) => updateCompanyInfo('endereco.bairro', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="Centro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.cidade}
                            onChange={(e) => updateCompanyInfo('endereco.cidade', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="São Paulo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Estado
                          </label>
                          <select
                            value={companyInfo.endereco.estado}
                            onChange={(e) => updateCompanyInfo('endereco.estado', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          >
                            <option value="SP">São Paulo</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="PR">Paraná</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="BA">Bahia</option>
                            <option value="GO">Goiás</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="PE">Pernambuco</option>
                            <option value="CE">Ceará</option>
                            <option value="PA">Pará</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="PB">Paraíba</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="AL">Alagoas</option>
                            <option value="SE">Sergipe</option>
                            <option value="PI">Piauí</option>
                            <option value="MA">Maranhão</option>
                            <option value="TO">Tocantins</option>
                            <option value="AC">Acre</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="AM">Amazonas</option>
                            <option value="AP">Amapá</option>
                          </select>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.complemento}
                            onChange={(e) => updateCompanyInfo('endereco.complemento', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            placeholder="Sala 45"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Seção: Configurações de Pagamento */}
            {activeSection === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  {/* Configurações do Stripe */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DO STRIPE</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Modo de Teste */}
                      <div className="flex items-center justify-between p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                        <div>
                          <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">MODO DE TESTE</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Usar chaves de teste do Stripe (recomendado para desenvolvimento)</p>
                        </div>
                        <Toggle
                          enabled={paymentSettings.enableTestMode}
                          onChange={() => togglePaymentSetting('enableTestMode')}
                        />
                      </div>

                      {/* Chaves da API */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">CHAVES DA API</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="gap-2 border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 font-police-body uppercase tracking-wider transition-colors"
                          >
                            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showApiKeys ? 'Ocultar' : 'Mostrar'}
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                              PUBLISHABLE KEY {paymentSettings.enableTestMode && <Badge className="ml-2 bg-accent-500/20 text-accent-500 border-accent-500/30 font-police-numbers">TEST</Badge>}
                            </label>
                            <div className="relative">
                              <input
                                type={showApiKeys ? "text" : "password"}
                                value={paymentSettings.stripePublishableKey}
                                onChange={(e) => updatePaymentSetting('stripePublishableKey', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                placeholder="pk_test_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                              SECRET KEY {paymentSettings.enableTestMode && <Badge className="ml-2 bg-accent-500/20 text-accent-500 border-accent-500/30 font-police-numbers">TEST</Badge>}
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={paymentSettings.stripeSecretKey}
                                onChange={(e) => updatePaymentSetting('stripeSecretKey', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-mono text-sm"
                                placeholder="sk_test_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                              Webhook Secret
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={paymentSettings.stripeWebhookSecret}
                                onChange={(e) => updatePaymentSetting('stripeWebhookSecret', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-mono text-sm"
                                placeholder="whsec_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              URL do Webhook: https://seudominio.com/api/webhooks/stripe
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Configurações Gerais */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Configurações Gerais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                              Moeda Padrão
                            </label>
                            <select
                              value={paymentSettings.currency}
                              onChange={(e) => updatePaymentSetting('currency', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            >
                              <option value="BRL">Real Brasileiro (BRL)</option>
                              <option value="USD">Dólar Americano (USD)</option>
                              <option value="EUR">Euro (EUR)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                              Taxa de Processamento (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={paymentSettings.processingFee}
                              onChange={(e) => updatePaymentSetting('processingFee', Number(e.target.value))}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métodos de Pagamento */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">MÉTODOS DE PAGAMENTO</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gray-800 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-police-numbers font-bold">CARD</span>
                            </div>
                            <div>
                              <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">CARTÃO DE CRÉDITO</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={paymentSettings.enableCreditCard}
                            onChange={() => togglePaymentSetting('enableCreditCard')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-accent-500 rounded flex items-center justify-center">
                              <span className="text-black text-xs font-police-numbers font-bold">PIX</span>
                            </div>
                            <div>
                              <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">PIX</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pagamento instantâneo brasileiro</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={paymentSettings.enablePix}
                            onChange={() => togglePaymentSetting('enablePix')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-orange-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">BOL</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Boleto Bancário</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pagamento via boleto (vencimento em 3 dias)</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={paymentSettings.enableBoleto}
                            onChange={() => togglePaymentSetting('enableBoleto')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">DEB</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Cartão de Débito</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Débito em conta corrente</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={paymentSettings.enableDebitCard}
                            onChange={() => togglePaymentSetting('enableDebitCard')}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tipos de Pagamento */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tipos de Pagamento</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Assinaturas Recorrentes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cobrança mensal/anual automática</p>
                        </div>
                        <Toggle
                          enabled={paymentSettings.enableSubscriptions}
                          onChange={() => togglePaymentSetting('enableSubscriptions')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Pagamentos Únicos</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Compras avulsas de cursos individuais</p>
                        </div>
                        <Toggle
                          enabled={paymentSettings.enableOneTimePayments}
                          onChange={() => togglePaymentSetting('enableOneTimePayments')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status e Testes */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Status e Testes</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
                            <span className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">STRIPE CONECTADO</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">API funcionando corretamente</p>
                        </div>

                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
                            <span className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">WEBHOOK ATIVO</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Eventos sendo recebidos</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                          <Wrench className="w-4 h-4" />
                          Testar Conexão
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Dashboard Stripe
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Seção: Servidor de Email (SMTP) */}
            {activeSection === 'smtp' && (
              <motion.div
                key="smtp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">SERVIDOR DE EMAIL (SMTP)</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-accent-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">CONFIGURAÇÃO SMTP</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Configure o servidor SMTP para envio de emails do sistema (confirmações, notificações, etc.)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Servidor SMTP
                        </label>
                        <input
                          type="text"
                          value={smtpSettings.host}
                          onChange={(e) => updateSmtpSetting('host', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Porta
                        </label>
                        <select
                          value={smtpSettings.port}
                          onChange={(e) => updateSmtpSetting('port', Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        >
                          <option value={25}>25 (Padrão)</option>
                          <option value={465}>465 (SSL)</option>
                          <option value={587}>587 (TLS)</option>
                          <option value={2525}>2525 (Alternativa)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Usuário/Email
                        </label>
                        <input
                          type="email"
                          value={smtpSettings.username}
                          onChange={(e) => updateSmtpSetting('username', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="noreply@studypro.com.br"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Senha
                        </label>
                        <input
                          type="password"
                          value={smtpSettings.password}
                          onChange={(e) => updateSmtpSetting('password', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="Senha do email ou app password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Nome do Remetente
                        </label>
                        <input
                          type="text"
                          value={smtpSettings.fromName}
                          onChange={(e) => updateSmtpSetting('fromName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="Study Pro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Email do Remetente
                        </label>
                        <input
                          type="email"
                          value={smtpSettings.fromEmail}
                          onChange={(e) => updateSmtpSetting('fromEmail', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="noreply@studypro.com.br"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Conexão Segura (TLS/SSL)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Usar criptografia para envio de emails</p>
                      </div>
                      <Toggle
                        enabled={smtpSettings.secure}
                        onChange={() => updateSmtpSetting('secure', !smtpSettings.secure)}
                      />
                    </div>

                    {/* Teste de Conexão */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">TESTE DE CONEXÃO</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enviar email de teste para verificar configurações</p>
                        </div>
                        <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 font-police-body uppercase tracking-wider transition-colors">
                          <Mail className="w-4 h-4" />
                          ENVIAR TESTE
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Termos e Políticas */}
            {activeSection === 'legal' && (
              <motion.div
                key="legal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  {/* Termos de Serviço */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">TERMOS DE SERVIÇO</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={8}
                        value={legalSettings.termsOfService}
                        onChange={(e) => updateLegalSetting('termsOfService', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-body"
                        placeholder="Digite os termos de serviço da plataforma..."
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Estes termos serão exibidos na página de registro e podem ser acessados pelo rodapé do site.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Política de Privacidade */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Política de Privacidade</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={8}
                        value={legalSettings.privacyPolicy}
                        onChange={(e) => updateLegalSetting('privacyPolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                        placeholder="Digite a política de privacidade da plataforma..."
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Descreva como os dados dos usuários são coletados, utilizados e protegidos.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Política de Cookies */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Política de Cookies</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={6}
                        value={legalSettings.cookiePolicy}
                        onChange={(e) => updateLegalSetting('cookiePolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                        placeholder="Digite a política de cookies..."
                      />
                    </CardContent>
                  </Card>

                  {/* Política de Reembolso */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Política de Reembolso</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={6}
                        value={legalSettings.refundPolicy}
                        onChange={(e) => updateLegalSetting('refundPolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                        placeholder="Digite a política de reembolso..."
                      />
                    </CardContent>
                  </Card>

                  {/* Configurações de Dados */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configurações de Dados</h2>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Retenção de Dados (dias)
                        </label>
                        <input
                          type="number"
                          value={legalSettings.dataRetentionDays}
                          onChange={(e) => updateLegalSetting('dataRetentionDays', Number(e.target.value))}
                          className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                          placeholder="365"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Por quantos dias os dados dos usuários devem ser mantidos após exclusão da conta.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações Rápidas */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ações Rápidas</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Visualizar Termos
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Visualizar Privacidade
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Exportar Documentos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Seção: Sistema */}
            {activeSection === 'system' && (
              <motion.div
                key="system"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DO SISTEMA</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                        <div>
                          <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">MODO MANUTENÇÃO</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Temporariamente desabilitar acesso ao sistema</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.maintenanceMode}
                          onChange={() => toggleSystemSetting('maintenanceMode')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                        <div>
                          <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">PERMITIR REGISTROS</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Novos usuários podem se cadastrar</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.allowRegistrations}
                          onChange={() => toggleSystemSetting('allowRegistrations')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Verificação de Email</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Exigir verificação de email no cadastro</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.requireEmailVerification}
                          onChange={() => toggleSystemSetting('requireEmailVerification')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Notificações do Sistema</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enviar notificações por email</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.enableNotifications}
                          onChange={() => toggleSystemSetting('enableNotifications')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                          TAMANHO MÁXIMO DE ARQUIVO (MB)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                          Timeout de Sessão (minutos)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Seção: Usuários */}
            {activeSection === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="space-y-6">
                  {/* Estatísticas de Usuários */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">ESTATÍSTICAS DE USUÁRIOS</h2>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">1,247</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">TOTAL DE USUÁRIOS</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">3</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">ADMINISTRADORES</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">1,244</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">ESTUDANTES</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                              <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">142</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">ONLINE AGORA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configurações de Usuários */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DE USUÁRIOS</h2>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">APROVAÇÃO AUTOMÁTICA</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Novos usuários são aprovados automaticamente</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">LIMITE DE SESSÕES</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Controlar número máximo de sessões simultâneas</p>
                          </div>
                          <Toggle enabled={false} onChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">VERIFICAÇÃO 2FA</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Exigir autenticação de dois fatores para administradores</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            LIMITE DE TENTATIVAS DE LOGIN
                          </label>
                          <input
                            type="number"
                            defaultValue={5}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            TEMPO DE BLOQUEIO (MINUTOS)
                          </label>
                          <input
                            type="number"
                            defaultValue={15}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Usuários Recentes */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">USUÁRIOS RECENTES</h2>
                    </CardHeader>
                    <CardContent className="p-0">
                      {[
                        { name: 'João Silva', email: 'joao@example.com', role: 'Estudante', status: 'online', joined: '2024-01-15' },
                        { name: 'Maria Santos', email: 'maria@example.com', role: 'Estudante', status: 'offline', joined: '2024-01-14' },
                        { name: 'Pedro Costa', email: 'pedro@example.com', role: 'Administrador', status: 'online', joined: '2024-01-13' },
                        { name: 'Ana Lima', email: 'ana@example.com', role: 'Estudante', status: 'offline', joined: '2024-01-12' },
                      ].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://ui-avatars.com/api/?name=${user.name}&background=14242f&color=fff`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">{user.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">{user.role}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Desde {user.joined}</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${user.status === 'online' ? 'bg-accent-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
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
                <div className="space-y-6">
                  {/* Status de Segurança */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">STATUS DE SEGURANÇA</h2>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                              <Shield className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <p className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">SEGURO</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Sistema protegido</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">256</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">CRIPTOGRAFIA AES</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">0</p>
                              <p className="text-sm font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">AMEAÇAS DETECTADAS</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configurações de Segurança */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">CONFIGURAÇÕES DE SEGURANÇA</h2>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">FIREWALL ATIVO</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Proteção contra ataques externos</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">DETECÇÃO DE INTRUSÃO</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Monitoramento de atividades suspeitas</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">LOG DE AUDITORIA</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Registro detalhado de todas as ações</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-accent-500 dark:hover:border-accent-500 transition-colors">
                          <div>
                            <h4 className="font-police-subtitle font-medium text-gray-900 dark:text-white uppercase tracking-wider">HTTPS OBRIGATÓRIO</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Forçar conexões seguras</p>
                          </div>
                          <Toggle enabled={true} onChange={() => {}} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            TEMPO DE SESSÃO (HORAS)
                          </label>
                          <input
                            type="number"
                            defaultValue={24}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all font-police-numbers"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            FORÇA DA SENHA
                          </label>
                          <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all">
                            <option>FORTE (8+ caracteres, símbolos)</option>
                            <option>MUITO FORTE (12+ caracteres)</option>
                            <option>MILITAR (16+ caracteres, complexa)</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Logs de Segurança */}
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white">LOGS DE SEGURANÇA</h2>
                    </CardHeader>
                    <CardContent className="p-0">
                      {[
                        { type: 'LOGIN', user: 'admin@studypro.com', action: 'Login bem-sucedido', ip: '192.168.1.100', time: '14:30', status: 'success' },
                        { type: 'FAILED', user: 'hacker@evil.com', action: 'Tentativa de login falhada', ip: '192.168.1.200', time: '14:25', status: 'warning' },
                        { type: 'ADMIN', user: 'admin@studypro.com', action: 'Configurações alteradas', ip: '192.168.1.100', time: '14:20', status: 'info' },
                        { type: 'BLOCKED', user: 'suspicious@test.com', action: 'IP bloqueado por tentativas excessivas', ip: '192.168.1.300', time: '14:15', status: 'danger' },
                      ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`px-2 py-1 rounded text-xs font-police-numbers uppercase tracking-wider ${
                              log.status === 'success' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                              log.status === 'warning' ? 'bg-accent-500/20 text-accent-500' :
                              log.status === 'info' ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                              'bg-gray-400 text-white dark:bg-gray-500'
                            }`}>
                              {log.type}
                            </div>
                            <div>
                              <p className="font-police-body font-medium text-gray-900 dark:text-white">{log.action}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{log.user} • {log.ip}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-police-numbers text-gray-600 dark:text-gray-400">{log.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Seção: Notificações */}
            {activeSection === 'notifications' && <NotificationsSection />}

            {/* Seção: Backup */}
            {activeSection === 'backup' && <BackupSection />}

            {/* Seção: Analytics */}
            {activeSection === 'analytics' && <AnalyticsSection />}
            
          </AnimatePresence>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex gap-3"
          >
            <Button 
              onClick={saveSettings} 
              disabled={isLoading} 
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body uppercase tracking-wider transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SALVAR CONFIGURAÇÕES
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-police-body uppercase tracking-wider transition-colors"
            >
              <Zap className="w-4 h-4" />
              RESTAURAR PADRÕES
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}