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
  const user = useAuthStore((state) => state.user);

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

  // Seções do menu
  const sections = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'branding', label: 'Marca e Logo', icon: Palette },
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