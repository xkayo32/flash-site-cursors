import { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  Type,
  Zap,
  Server,
  Database,
  Lock,
  Users,
  BarChart3,
  Wrench,
  Building2,
  Share2,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSettingsStore } from '@/store/settingsStore';
import { useProfileStore } from '@/store/profileStore';
import { useToast } from '@/contexts/ToastContext';

export default function AdminSettings() {
  const { settings, isLoading, error, fetchSettings, updateGeneralSettings, updateCompanySettings, updateBrandSettings, updateSocialSettings, uploadLogo, clearError } = useSettingsStore();
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, updateProfile, uploadAvatar, clearError: clearProfileError } = useProfileStore();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('perfil');
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    general: {},
    company: {},
    brand: {},
    social: {}
  });

  // Estados das configurações anteriores - agora integrado com o store
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    newCourseAlerts: true,
    examReminders: true,
    paymentAlerts: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false,
    loginAlerts: true,
    dataSharing: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    accentColor: '#facc15',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
    autoBackup: true,
    maintenanceMode: false
  });

  useEffect(() => {
    console.log('AdminSettings mounted, fetching data...');
    fetchSettings();
    fetchProfile();
  }, []);

  useEffect(() => {
    console.log('Settings updated in component:', settings);
    if (settings) {
      setFormData({
        general: settings.general || {},
        company: settings.company || {},
        brand: settings.brand || {},
        social: settings.social || {}
      });
      const newFormData = {
        general: settings.general || {},
        company: settings.company || {},
        brand: settings.brand || {},
        social: settings.social || {}
      };
      console.log('FormData updated with values:', {
        site_name: newFormData.general?.site_name,
        company_name: newFormData.company?.company_name,
        brand_primary_color: newFormData.brand?.brand_primary_color
      });
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setProfileSettings(prev => {
        // Only update if profile data actually changed
        const shouldUpdate = (
          prev.name !== (profile.name || '') ||
          prev.email !== (profile.email || '') ||
          prev.phone !== (profile.phone || '') ||
          prev.bio !== (profile.bio || '') ||
          (!prev.avatar || (!prev.avatar.startsWith('data:') && prev.avatar !== profile.avatar))
        );
        
        if (!shouldUpdate) {
          return prev; // Don't trigger re-render if nothing changed
        }
        
        const newAvatar = (prev.avatar && prev.avatar.startsWith('data:')) 
          ? prev.avatar 
          : profile.avatar || '';
        
        console.log('Profile update needed:', {
          prevAvatar: prev.avatar?.substring(0, 30) + '...',
          profileAvatar: profile.avatar?.substring(0, 30) + '...',
          newAvatar: newAvatar?.substring(0, 30) + '...'
        });
        
        return {
          name: profile.name || '',
          email: profile.email || '',
          password: prev.password, // Keep existing password
          phone: profile.phone || '',
          bio: profile.bio || '',
          avatar: newAvatar
        };
      });
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      showToast('error', 'Erro', error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
    if (profileError) {
      showToast('error', 'Erro', profileError);
      clearProfileError();
    }
  }, [profileError]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async (section: string) => {
    try {
      console.log(`Saving ${section} settings:`, formData[section as keyof typeof formData]);
      switch (section) {
        case 'general':
          await updateGeneralSettings(formData.general);
          break;
        case 'company':
          await updateCompanySettings(formData.company);
          break;
        case 'brand':
          await updateBrandSettings(formData.brand);
          break;
        case 'social':
          await updateSocialSettings(formData.social);
          break;
        default:
          showToast('success', 'Sucesso', 'Configurações salvas localmente!');
          setHasChanges(false);
          return;
      }
      showToast('success', 'Sucesso', `Configurações de ${section} salvas com sucesso!`);
      setHasChanges(false);
    } catch (error) {
      showToast('error', 'Erro', 'Falha ao salvar configurações');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadLogo(file, type);
      showToast('success', 'Sucesso', 'Logo atualizada com sucesso!');
      
      const brandKey = type === 'light' ? 'brand_logo_light' : 
                       type === 'dark' ? 'brand_logo_dark' : 
                       'brand_favicon';
      handleInputChange('brand', brandKey, url);
    } catch (error) {
      showToast('error', 'Erro', 'Falha ao fazer upload da logo');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Erro', 'Por favor, selecione apenas arquivos de imagem');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB
      showToast('error', 'Erro', 'A imagem deve ter no máximo 2MB');
      return;
    }

    console.log('Starting avatar upload...');

    // Create local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Local preview created:', result.substring(0, 50) + '...');
      setProfileSettings(prev => ({ ...prev, avatar: result }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);

    try {
      // Upload to backend and get server URL
      const url = await uploadAvatar(file);
      console.log('Avatar uploaded successfully, URL:', url?.substring(0, 50) + '...');
      showToast('success', 'Sucesso', 'Avatar atualizado com sucesso!');
      
      // Keep the local preview - the server URL will be used when profile is refreshed
      // Don't immediately switch to server URL to avoid flicker
    } catch (error) {
      console.error('Avatar upload failed:', error);
      showToast('error', 'Erro', 'Falha ao fazer upload do avatar');
      
      // Revert to previous avatar on error
      if (profile?.avatar) {
        setProfileSettings(prev => ({ ...prev, avatar: profile.avatar }));
      }
    }
  };

  const handleProfileSave = async () => {
    try {
      const dataToSave = {
        name: profileSettings.name,
        email: profileSettings.email,
        phone: profileSettings.phone,
        bio: profileSettings.bio,
        ...(profileSettings.password && { password: profileSettings.password })
        // Note: Avatar is handled separately via uploadAvatar, not in profile update
      };

      await updateProfile(dataToSave);
      showToast('success', 'Sucesso', 'Perfil atualizado com sucesso!');
      setHasChanges(false);
      
      // Clear password field after save
      setProfileSettings(prev => ({ ...prev, password: '' }));
    } catch (error) {
      showToast('error', 'Erro', 'Falha ao salvar perfil');
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'brand', label: 'Marca', icon: Palette },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'privacidade', label: 'Privacidade', icon: Shield },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Wrench },
    { id: 'social', label: 'Redes Sociais', icon: Share2 },
  ];

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-police-title tracking-wider uppercase text-gray-900 dark:text-white">
            CONFIGURAÇÕES DO SISTEMA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as configurações gerais do sistema
          </p>
        </div>
        {hasChanges && (
          <Badge className="bg-yellow-500 text-black">
            Alterações não salvas
          </Badge>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent-500 text-accent-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-police-body">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Perfil Settings */}
          {activeTab === 'perfil' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Informações Pessoais</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={
                        profileSettings.avatar 
                          ? profileSettings.avatar.startsWith('data:') || profileSettings.avatar.startsWith('http')
                            ? profileSettings.avatar
                            : `http://173.208.151.106:8180${profileSettings.avatar}`
                          : 'http://173.208.151.106:8180/default-avatar.png'
                      }
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-accent-500"
                      onError={(e) => {
                        // First fallback: try backend default avatar
                        if (!e.currentTarget.src.includes('default-avatar.png')) {
                          e.currentTarget.src = 'http://173.208.151.106:8180/default-avatar.png';
                        } else {
                          // Ultimate fallback: use data URL for a simple avatar
                          e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
                            <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="75" cy="75" r="75" fill="#14242f"/>
                              <circle cx="75" cy="60" r="25" fill="#facc15"/>
                              <path d="M75 95c-20 0-35 10-35 25v30h70v-30c0-15-15-25-35-25z" fill="#facc15"/>
                            </svg>
                          `);
                        }
                      }}
                    />
                    <label className="absolute bottom-0 right-0 p-1 bg-accent-500 rounded-full text-black hover:bg-accent-600 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleAvatarUpload(e);
                          // Clear input to allow selecting the same file again
                          e.target.value = '';
                        }}
                        className="hidden"
                        disabled={profileLoading}
                      />
                    </label>
                    {profileLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-police-subtitle font-semibold text-gray-900 dark:text-white">
                      Foto de Perfil
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      JPG, PNG ou GIF. Máximo 2MB.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {profileLoading ? 'Fazendo upload...' : 'Clique no ícone da câmera para alterar'}
                    </p>
                    {hasChanges && profileSettings.avatar && profileSettings.avatar.startsWith('data:') && (
                      <p className="text-xs text-accent-500 mt-1 font-medium">
                        ✅ Nova imagem selecionada - Clique em "Salvar Perfil" para confirmar
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileSettings.name}
                      onChange={(e) => {
                        setProfileSettings({...profileSettings, name: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => {
                        setProfileSettings({...profileSettings, email: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={profileSettings.phone}
                      onChange={(e) => {
                        setProfileSettings({...profileSettings, phone: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Deixe em branco para manter a atual"
                      value={profileSettings.password}
                      onChange={(e) => {
                        setProfileSettings({...profileSettings, password: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileSettings.bio}
                    onChange={(e) => {
                      setProfileSettings({...profileSettings, bio: e.target.value});
                      setHasChanges(true);
                    }}
                    rows={3}
                    placeholder="Descreva um pouco sobre você..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body uppercase tracking-wider transition-colors"
                  >
                    {profileLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Configurações Gerais</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Site
                    </label>
                    <input
                      type="text"
                      value={formData.general?.site_name || ''}
                      onChange={(e) => handleInputChange('general', 'site_name', e.target.value)}
                      placeholder="Digite o nome do site"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={formData.general?.site_tagline || ''}
                      onChange={(e) => handleInputChange('general', 'site_tagline', e.target.value)}
                      placeholder="Digite o slogan/tagline"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.general?.site_description || ''}
                    onChange={(e) => handleInputChange('general', 'site_description', e.target.value)}
                    rows={3}
                    placeholder="Digite a descrição do site (para SEO)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Palavras-chave (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.general?.site_keywords || ''}
                    onChange={(e) => handleInputChange('general', 'site_keywords', e.target.value)}
                    placeholder="concursos, questões, flashcards, simulados (separadas por vírgula)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.general?.maintenance_mode || false}
                      onChange={(e) => handleInputChange('general', 'maintenance_mode', e.target.checked)}
                      className="w-4 h-4 text-accent-500 bg-gray-100 border-gray-300 rounded focus:ring-accent-500 dark:focus:ring-accent-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Modo de Manutenção
                    </span>
                  </label>
                  <Button
                    onClick={() => handleSave('general')}
                    disabled={isLoading}
                    className="bg-accent-500 hover:bg-accent-600 text-black"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Settings */}
          {activeTab === 'company' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Informações da Empresa</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_name || ''}
                      onChange={(e) => handleInputChange('company', 'company_name', e.target.value)}
                      placeholder="Nome completo da empresa"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_cnpj || ''}
                      onChange={(e) => handleInputChange('company', 'company_cnpj', e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                {/* Endereço completo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_address || ''}
                      onChange={(e) => handleInputChange('company', 'company_address', e.target.value)}
                      placeholder="Rua Principal, 123 - Centro"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_city || ''}
                      onChange={(e) => handleInputChange('company', 'company_city', e.target.value)}
                      placeholder="São Paulo"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_state || ''}
                      onChange={(e) => handleInputChange('company', 'company_state', e.target.value)}
                      placeholder="SP"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_zip || ''}
                      onChange={(e) => handleInputChange('company', 'company_zip', e.target.value)}
                      placeholder="01000-000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_phone || ''}
                      onChange={(e) => handleInputChange('company', 'company_phone', e.target.value)}
                      placeholder="(11) 1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.company?.company_email || ''}
                      onChange={(e) => handleInputChange('company', 'company_email', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.company?.company_whatsapp || ''}
                      onChange={(e) => handleInputChange('company', 'company_whatsapp', e.target.value)}
                      placeholder="(11) 91234-5678"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('company')}
                    disabled={isLoading}
                    className="bg-accent-500 hover:bg-accent-600 text-black"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Settings */}
          {activeTab === 'brand' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Identidade Visual</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Logos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo (Tema Claro)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      {formData.brand?.brand_logo_light ? (
                        <img src={formData.brand.brand_logo_light} alt="Logo Light" className="max-h-20 mx-auto mb-2" />
                      ) : (
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'light')}
                          className="hidden"
                        />
                        <span className="text-sm text-accent-500 hover:text-accent-600">
                          {formData.brand?.brand_logo_light ? 'Alterar' : 'Enviar'} Logo
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo (Tema Escuro)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      {formData.brand?.brand_logo_dark ? (
                        <img src={formData.brand.brand_logo_dark} alt="Logo Dark" className="max-h-20 mx-auto mb-2" />
                      ) : (
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'dark')}
                          className="hidden"
                        />
                        <span className="text-sm text-accent-500 hover:text-accent-600">
                          {formData.brand?.brand_logo_dark ? 'Alterar' : 'Enviar'} Logo
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Favicon
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      {formData.brand?.brand_favicon ? (
                        <img src={formData.brand.brand_favicon} alt="Favicon" className="max-h-20 mx-auto mb-2" />
                      ) : (
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'favicon')}
                          className="hidden"
                        />
                        <span className="text-sm text-accent-500 hover:text-accent-600">
                          {formData.brand?.brand_favicon ? 'Alterar' : 'Enviar'} Favicon
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cor Primária
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.brand?.brand_primary_color || ''}
                        onChange={(e) => handleInputChange('brand', 'brand_primary_color', e.target.value)}
                        placeholder="rgb(250, 204, 21)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                      <div 
                        className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: formData.brand?.brand_primary_color || 'rgb(250, 204, 21)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cor Secundária
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.brand?.brand_secondary_color || ''}
                        onChange={(e) => handleInputChange('brand', 'brand_secondary_color', e.target.value)}
                        placeholder="rgb(20, 36, 47)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                      <div 
                        className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: formData.brand?.brand_secondary_color || 'rgb(20, 36, 47)' }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Fonts Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fontes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fonte Principal (Títulos)
                      </label>
                      <input
                        type="text"
                        value={formData.brand?.brand_font_primary || ''}
                        onChange={(e) => handleInputChange('brand', 'brand_font_primary', e.target.value)}
                        placeholder="Orbitron"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fonte Secundária (Corpo)
                      </label>
                      <input
                        type="text"
                        value={formData.brand?.brand_font_secondary || ''}
                        onChange={(e) => handleInputChange('brand', 'brand_font_secondary', e.target.value)}
                        placeholder="Rajdhani"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('brand')}
                    disabled={isLoading}
                    className="bg-accent-500 hover:bg-accent-600 text-black"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notificacoes' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Preferências de Notificação</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Notificações por Email</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receba atualizações importantes por email</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={notificationSettings.emailNotifications} 
                      onChange={() => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Notificações SMS</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receba SMS para alertas urgentes</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={notificationSettings.smsNotifications} 
                      onChange={() => setNotificationSettings({...notificationSettings, smsNotifications: !notificationSettings.smsNotifications})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Notificações Push</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notificações no navegador</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={notificationSettings.pushNotifications} 
                      onChange={() => setNotificationSettings({...notificationSettings, pushNotifications: !notificationSettings.pushNotifications})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacidade' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Privacidade e Segurança</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Autenticação de Dois Fatores</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Adicione uma camada extra de segurança</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={privacySettings.twoFactorAuth} 
                      onChange={() => setPrivacySettings({...privacySettings, twoFactorAuth: !privacySettings.twoFactorAuth})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Alertas de Login</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notifique sobre novos acessos</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={privacySettings.loginAlerts} 
                      onChange={() => setPrivacySettings({...privacySettings, loginAlerts: !privacySettings.loginAlerts})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Visibilidade do Perfil</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Controle quem pode ver seu perfil</p>
                      </div>
                    </div>
                    <select 
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                      <option value="friends">Apenas Amigos</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'aparencia' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Aparência</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                          appearanceSettings.theme === 'light' 
                            ? 'border-accent-500 bg-accent-500/10' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Sun className="w-6 h-6" />
                        <span className="text-sm">Claro</span>
                      </button>
                      <button 
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                          appearanceSettings.theme === 'dark' 
                            ? 'border-accent-500 bg-accent-500/10' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Moon className="w-6 h-6" />
                        <span className="text-sm">Escuro</span>
                      </button>
                      <button 
                        onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${
                          appearanceSettings.theme === 'system' 
                            ? 'border-accent-500 bg-accent-500/10' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Monitor className="w-6 h-6" />
                        <span className="text-sm">Sistema</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tamanho da Fonte
                    </label>
                    <select 
                      value={appearanceSettings.fontSize}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, fontSize: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="small">Pequena</option>
                      <option value="medium">Média</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Reduzir Movimento</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Desativa animações</p>
                    </div>
                    <Toggle 
                      enabled={appearanceSettings.reducedMotion} 
                      onChange={() => setAppearanceSettings({...appearanceSettings, reducedMotion: !appearanceSettings.reducedMotion})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'sistema' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Configurações do Sistema</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Idioma
                    </label>
                    <select 
                      value={systemSettings.language}
                      onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fuso Horário
                    </label>
                    <select 
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Formato de Data
                    </label>
                    <select 
                      value={systemSettings.dateFormat}
                      onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Moeda
                    </label>
                    <select 
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-accent-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Backup Automático</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fazer backup diário dos dados</p>
                    </div>
                  </div>
                  <Toggle 
                    enabled={systemSettings.autoBackup} 
                    onChange={() => setSystemSettings({...systemSettings, autoBackup: !systemSettings.autoBackup})}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Settings */}
          {activeTab === 'social' && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold font-police-subtitle">Redes Sociais</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.social?.facebook || ''}
                      onChange={(e) => handleInputChange('social', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/suapagina"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.social?.instagram || ''}
                      onChange={(e) => handleInputChange('social', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/suapagina"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.social?.twitter || ''}
                      onChange={(e) => handleInputChange('social', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/suapagina"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={formData.social?.linkedin || ''}
                      onChange={(e) => handleInputChange('social', 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/suaempresa"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={formData.social?.youtube || ''}
                      onChange={(e) => handleInputChange('social', 'youtube', e.target.value)}
                      placeholder="https://youtube.com/@seucanal"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('social')}
                    disabled={isLoading}
                    className="bg-accent-500 hover:bg-accent-600 text-black"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}