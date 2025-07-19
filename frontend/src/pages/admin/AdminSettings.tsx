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

// Componente Toggle
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
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
  const [systemName, setSystemName] = useState('Study Pro');
  const [logoLight, setLogoLight] = useState<string | null>(null);
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

  // Informações da empresa
  const [companyInfo, setCompanyInfo] = useState({
    cnpj: '00.000.000/0001-00',
    razaoSocial: 'Study Pro Educação Ltda',
    nomeFantasia: 'Study Pro',
    email: 'contato@studypro.com.br',
    telefone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      complemento: 'Sala 45'
    }
  });

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

  // Atualizar informações da empresa
  const updateCompanyInfo = (key: string, value: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setCompanyInfo(prev => ({
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
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">
          Configurações Administrativas
        </h1>
        <p className="text-primary-600 dark:text-gray-300">
          Gerencie as configurações globais da plataforma
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu Lateral */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1 p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all",
                      activeSection === section.id
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100"
                        : "text-primary-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800"
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
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-primary-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-primary-600 dark:text-gray-400">Administrador</p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-primary-600 dark:text-gray-400">
                <p>Versão: 1.0.0</p>
                <p>Último login: Hoje, 14:30</p>
                <p>Status: Online</p>
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Configurações Gerais</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Nome da Plataforma
                      </label>
                      <input
                        type="text"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Descrição da Plataforma
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Plataforma completa para preparação em concursos públicos"
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Fuso Horário
                      </label>
                      <select className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white">
                        <option>America/Sao_Paulo (UTC-3)</option>
                        <option>America/New_York (UTC-5)</option>
                        <option>Europe/London (UTC+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Idioma Padrão
                      </label>
                      <select className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white">
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Marca e Logo</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Logo Tema Claro */}
                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Logo - Tema Claro
                      </label>
                      <div className="border-2 border-dashed border-primary-300 dark:border-gray-600 rounded-lg p-6">
                        {logoLight ? (
                          <div className="text-center">
                            <img src={logoLight} alt="Logo Claro" className="max-h-16 mx-auto mb-3" />
                            <div className="flex gap-2 justify-center">
                              <Button variant="outline" size="sm" onClick={() => removeLogo('light')} className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Remover
                              </Button>
                              <label className="cursor-pointer">
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Upload className="w-4 h-4" />
                                  Substituir
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
                            <div className="text-primary-600 dark:text-gray-400">
                              <Upload className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Clique para fazer upload</p>
                              <p className="text-xs">PNG, JPG até 2MB</p>
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
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
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
                      <h3 className="font-medium text-primary-900 dark:text-white mb-3">Preview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-2">Tema Claro</p>
                          <div className="flex items-center gap-2">
                            {logoLight ? (
                              <img src={logoLight} alt="Logo" className="h-8" />
                            ) : (
                              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">SP</span>
                              </div>
                            )}
                            <span className="font-bold text-gray-900">{systemName}</span>
                          </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-400 mb-2">Tema Escuro</p>
                          <div className="flex items-center gap-2">
                            {logoDark ? (
                              <img src={logoDark} alt="Logo" className="h-8" />
                            ) : (
                              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">SP</span>
                              </div>
                            )}
                            <span className="font-bold text-white">{systemName}</span>
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
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Dados da Empresa</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            value={companyInfo.cnpj}
                            onChange={(e) => updateCompanyInfo('cnpj', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="00.000.000/0001-00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Razão Social
                          </label>
                          <input
                            type="text"
                            value={companyInfo.razaoSocial}
                            onChange={(e) => updateCompanyInfo('razaoSocial', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="Study Pro Educação Ltda"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Nome Fantasia
                          </label>
                          <input
                            type="text"
                            value={companyInfo.nomeFantasia}
                            onChange={(e) => updateCompanyInfo('nomeFantasia', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="Study Pro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Email de Contato
                          </label>
                          <input
                            type="email"
                            value={companyInfo.email}
                            onChange={(e) => updateCompanyInfo('email', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="contato@studypro.com.br"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Telefone
                          </label>
                          <input
                            type="text"
                            value={companyInfo.telefone}
                            onChange={(e) => updateCompanyInfo('telefone', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            WhatsApp
                          </label>
                          <input
                            type="text"
                            value={companyInfo.whatsapp}
                            onChange={(e) => updateCompanyInfo('whatsapp', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Endereço */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Endereço</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.cep}
                            onChange={(e) => updateCompanyInfo('endereco.cep', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="01234-567"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Logradouro
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.logradouro}
                            onChange={(e) => updateCompanyInfo('endereco.logradouro', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="Rua das Flores, 123"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.bairro}
                            onChange={(e) => updateCompanyInfo('endereco.bairro', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="Centro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.cidade}
                            onChange={(e) => updateCompanyInfo('endereco.cidade', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            placeholder="São Paulo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Estado
                          </label>
                          <select
                            value={companyInfo.endereco.estado}
                            onChange={(e) => updateCompanyInfo('endereco.estado', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
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
                          <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={companyInfo.endereco.complemento}
                            onChange={(e) => updateCompanyInfo('endereco.complemento', e.target.value)}
                            className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
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
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Configurações do Stripe</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Modo de Teste */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Modo de Teste</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300">Usar chaves de teste do Stripe (recomendado para desenvolvimento)</p>
                        </div>
                        <Toggle
                          enabled={paymentSettings.enableTestMode}
                          onChange={() => togglePaymentSetting('enableTestMode')}
                        />
                      </div>

                      {/* Chaves da API */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-primary-900 dark:text-white">Chaves da API</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKeys(!showApiKeys)}
                            className="gap-2"
                          >
                            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showApiKeys ? 'Ocultar' : 'Mostrar'}
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                              Publishable Key {paymentSettings.enableTestMode && <Badge variant="secondary" className="ml-2">TEST</Badge>}
                            </label>
                            <div className="relative">
                              <input
                                type={showApiKeys ? "text" : "password"}
                                value={paymentSettings.stripePublishableKey}
                                onChange={(e) => updatePaymentSetting('stripePublishableKey', e.target.value)}
                                className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white font-mono text-sm"
                                placeholder="pk_test_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                              Secret Key {paymentSettings.enableTestMode && <Badge variant="secondary" className="ml-2">TEST</Badge>}
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={paymentSettings.stripeSecretKey}
                                onChange={(e) => updatePaymentSetting('stripeSecretKey', e.target.value)}
                                className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white font-mono text-sm"
                                placeholder="sk_test_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                              Webhook Secret
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={paymentSettings.stripeWebhookSecret}
                                onChange={(e) => updatePaymentSetting('stripeWebhookSecret', e.target.value)}
                                className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white font-mono text-sm"
                                placeholder="whsec_..."
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-primary-600 dark:text-gray-400 mt-1">
                              URL do Webhook: https://seudominio.com/api/webhooks/stripe
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Configurações Gerais */}
                      <div>
                        <h4 className="font-medium text-primary-900 dark:text-white mb-3">Configurações Gerais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                              Moeda Padrão
                            </label>
                            <select
                              value={paymentSettings.currency}
                              onChange={(e) => updatePaymentSetting('currency', e.target.value)}
                              className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            >
                              <option value="BRL">Real Brasileiro (BRL)</option>
                              <option value="USD">Dólar Americano (USD)</option>
                              <option value="EUR">Euro (EUR)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                              Taxa de Processamento (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={paymentSettings.processingFee}
                              onChange={(e) => updatePaymentSetting('processingFee', Number(e.target.value))}
                              className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métodos de Pagamento */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Métodos de Pagamento</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">CARD</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-primary-900 dark:text-white">Cartão de Crédito</h4>
                              <p className="text-sm text-primary-600 dark:text-gray-400">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={paymentSettings.enableCreditCard}
                            onChange={() => togglePaymentSetting('enableCreditCard')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">PIX</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-primary-900 dark:text-white">PIX</h4>
                              <p className="text-sm text-primary-600 dark:text-gray-400">Pagamento instantâneo brasileiro</p>
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
                              <h4 className="font-medium text-primary-900 dark:text-white">Boleto Bancário</h4>
                              <p className="text-sm text-primary-600 dark:text-gray-400">Pagamento via boleto (vencimento em 3 dias)</p>
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
                              <h4 className="font-medium text-primary-900 dark:text-white">Cartão de Débito</h4>
                              <p className="text-sm text-primary-600 dark:text-gray-400">Débito em conta corrente</p>
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
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Tipos de Pagamento</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Assinaturas Recorrentes</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Cobrança mensal/anual automática</p>
                        </div>
                        <Toggle
                          enabled={paymentSettings.enableSubscriptions}
                          onChange={() => togglePaymentSetting('enableSubscriptions')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Pagamentos Únicos</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Compras avulsas de cursos individuais</p>
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
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Status e Testes</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-800 dark:text-green-300">Stripe Conectado</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400">API funcionando corretamente</p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="font-medium text-blue-800 dark:text-blue-300">Webhook Ativo</span>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Eventos sendo recebidos</p>
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Configurações do Servidor de Email</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Configuração SMTP</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Configure o servidor SMTP para envio de emails do sistema (confirmações, notificações, etc.)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Servidor SMTP
                        </label>
                        <input
                          type="text"
                          value={smtpSettings.host}
                          onChange={(e) => updateSmtpSetting('host', e.target.value)}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Porta
                        </label>
                        <select
                          value={smtpSettings.port}
                          onChange={(e) => updateSmtpSetting('port', Number(e.target.value))}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        >
                          <option value={25}>25 (Padrão)</option>
                          <option value={465}>465 (SSL)</option>
                          <option value={587}>587 (TLS)</option>
                          <option value={2525}>2525 (Alternativa)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Usuário/Email
                        </label>
                        <input
                          type="email"
                          value={smtpSettings.username}
                          onChange={(e) => updateSmtpSetting('username', e.target.value)}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="noreply@studypro.com.br"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Senha
                        </label>
                        <input
                          type="password"
                          value={smtpSettings.password}
                          onChange={(e) => updateSmtpSetting('password', e.target.value)}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="Senha do email ou app password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Nome do Remetente
                        </label>
                        <input
                          type="text"
                          value={smtpSettings.fromName}
                          onChange={(e) => updateSmtpSetting('fromName', e.target.value)}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="Study Pro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Email do Remetente
                        </label>
                        <input
                          type="email"
                          value={smtpSettings.fromEmail}
                          onChange={(e) => updateSmtpSetting('fromEmail', e.target.value)}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="noreply@studypro.com.br"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <h4 className="font-medium text-primary-900 dark:text-white">Conexão Segura (TLS/SSL)</h4>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Usar criptografia para envio de emails</p>
                      </div>
                      <Toggle
                        enabled={smtpSettings.secure}
                        onChange={() => updateSmtpSetting('secure', !smtpSettings.secure)}
                      />
                    </div>

                    {/* Teste de Conexão */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">Teste de Conexão</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">Enviar email de teste para verificar configurações</p>
                        </div>
                        <Button variant="outline" className="gap-2 border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                          <Mail className="w-4 h-4" />
                          Enviar Teste
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
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Termos de Serviço</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={8}
                        value={legalSettings.termsOfService}
                        onChange={(e) => updateLegalSetting('termsOfService', e.target.value)}
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white resize-none"
                        placeholder="Digite os termos de serviço da plataforma..."
                      />
                      <p className="text-xs text-primary-600 dark:text-gray-400 mt-2">
                        Estes termos serão exibidos na página de registro e podem ser acessados pelo rodapé do site.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Política de Privacidade */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Política de Privacidade</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={8}
                        value={legalSettings.privacyPolicy}
                        onChange={(e) => updateLegalSetting('privacyPolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white resize-none"
                        placeholder="Digite a política de privacidade da plataforma..."
                      />
                      <p className="text-xs text-primary-600 dark:text-gray-400 mt-2">
                        Descreva como os dados dos usuários são coletados, utilizados e protegidos.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Política de Cookies */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Política de Cookies</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={6}
                        value={legalSettings.cookiePolicy}
                        onChange={(e) => updateLegalSetting('cookiePolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white resize-none"
                        placeholder="Digite a política de cookies..."
                      />
                    </CardContent>
                  </Card>

                  {/* Política de Reembolso */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Política de Reembolso</h2>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        rows={6}
                        value={legalSettings.refundPolicy}
                        onChange={(e) => updateLegalSetting('refundPolicy', e.target.value)}
                        className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white resize-none"
                        placeholder="Digite a política de reembolso..."
                      />
                    </CardContent>
                  </Card>

                  {/* Configurações de Dados */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Configurações de Dados</h2>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Retenção de Dados (dias)
                        </label>
                        <input
                          type="number"
                          value={legalSettings.dataRetentionDays}
                          onChange={(e) => updateLegalSetting('dataRetentionDays', Number(e.target.value))}
                          className="w-full max-w-xs px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                          placeholder="365"
                        />
                        <p className="text-xs text-primary-600 dark:text-gray-400 mt-1">
                          Por quantos dias os dados dos usuários devem ser mantidos após exclusão da conta.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações Rápidas */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold text-primary-900 dark:text-white">Ações Rápidas</h2>
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
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">Configurações do Sistema</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Modo Manutenção</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Temporariamente desabilitar acesso ao sistema</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.maintenanceMode}
                          onChange={() => toggleSystemSetting('maintenanceMode')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Permitir Registros</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Novos usuários podem se cadastrar</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.allowRegistrations}
                          onChange={() => toggleSystemSetting('allowRegistrations')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Verificação de Email</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Exigir verificação de email no cadastro</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.requireEmailVerification}
                          onChange={() => toggleSystemSetting('requireEmailVerification')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-primary-200 dark:border-gray-600 rounded-lg">
                        <div>
                          <h4 className="font-medium text-primary-900 dark:text-white">Notificações do Sistema</h4>
                          <p className="text-sm text-primary-600 dark:text-gray-400">Enviar notificações por email</p>
                        </div>
                        <Toggle
                          enabled={systemSettings.enableNotifications}
                          onChange={() => toggleSystemSetting('enableNotifications')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Tamanho Máximo de Arquivo (MB)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Timeout de Sessão (minutos)
                        </label>
                        <input
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                          className="w-full px-4 py-2 border border-primary-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Outras seções podem ser implementadas aqui */}
            
          </AnimatePresence>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex gap-3"
          >
            <Button onClick={saveSettings} disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Restaurar Padrões
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}