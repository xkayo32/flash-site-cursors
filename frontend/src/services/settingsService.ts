import api from './api';

// Types
export interface NotificationSetting {
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface NotificationSettings {
  'study-reminders': NotificationSetting;
  'new-content': NotificationSetting;
  'achievements': NotificationSetting;
  'marketing': NotificationSetting;
}

export interface PrivacySettings {
  'profile-visibility': boolean;
  'ranking-participation': boolean;
  'study-data-sharing': boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  stealthMode: boolean;
  animations: boolean;
}

export interface StudySettings {
  dailyTimeGoal: number;
  dailyCardsGoal: number;
  autoReview: boolean;
  intensiveMode: boolean;
  focusMode: boolean;
}

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface UserSettings {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  study: StudySettings;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Settings Service
class SettingsService {
  private readonly baseUrl = '/api/v1/settings';

  // Get system settings
  async getSystemSettings() {
    try {
      const response = await api.get(this.baseUrl);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar configurações do sistema'
      };
    }
  }

  // Update system settings
  async updateSystemSettings(settings: any) {
    try {
      const response = await api.put(this.baseUrl, settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao salvar configurações do sistema'
      };
    }
  }

  // Get user settings
  async getUserSettings(): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/user`);
      return {
        success: true,
        data: response.data.settings
      };
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar configurações do usuário'
      };
    }
  }

  // Save user settings
  async saveUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/user`, settings);
      return {
        success: true,
        data: response.data.settings
      };
    } catch (error: any) {
      console.error('Error saving user settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao salvar configurações'
      };
    }
  }

  // Update profile settings
  async updateProfile(profile: Partial<ProfileSettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/user`, { profile });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar perfil'
      };
    }
  }

  // Update notification settings
  async updateNotifications(notifications: Partial<NotificationSettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/notifications`, notifications);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar notificações'
      };
    }
  }

  // Update privacy settings
  async updatePrivacy(privacy: Partial<PrivacySettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/user`, { privacy });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating privacy:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar privacidade'
      };
    }
  }

  // Update appearance settings
  async updateAppearance(appearance: Partial<AppearanceSettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/user`, { appearance });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating appearance:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar aparência'
      };
    }
  }

  // Update study settings
  async updateStudySettings(study: Partial<StudySettings>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/user`, { study });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating study settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar configurações de estudo'
      };
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/password`, passwordData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao alterar senha'
      };
    }
  }

  // Validate settings
  validateProfileSettings(profile: Partial<ProfileSettings>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (profile.name !== undefined && profile.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (profile.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        errors.push('E-mail inválido');
      }
    }

    if (profile.phone !== undefined && profile.phone.length > 0) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(profile.phone)) {
        errors.push('Telefone deve estar no formato (00) 00000-0000');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateStudySettings(study: Partial<StudySettings>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (study.dailyTimeGoal !== undefined) {
      if (study.dailyTimeGoal < 15 || study.dailyTimeGoal > 480) {
        errors.push('Meta de tempo deve estar entre 15 e 480 minutos');
      }
    }

    if (study.dailyCardsGoal !== undefined) {
      if (study.dailyCardsGoal < 5 || study.dailyCardsGoal > 500) {
        errors.push('Meta de cards deve estar entre 5 e 500');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validatePasswordChange(data: ChangePasswordData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.currentPassword) {
      errors.push('Senha atual é obrigatória');
    }

    if (!data.newPassword) {
      errors.push('Nova senha é obrigatória');
    }

    if (!data.confirmPassword) {
      errors.push('Confirmação de senha é obrigatória');
    }

    if (data.newPassword && data.newPassword.length < 6) {
      errors.push('Nova senha deve ter pelo menos 6 caracteres');
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.push('Nova senha e confirmação não conferem');
    }

    if (data.currentPassword === data.newPassword) {
      errors.push('Nova senha deve ser diferente da atual');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export user data
  async exportUserData(): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error exporting user data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }

  // Format phone number
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    
    return phone;
  }

  // Get default settings
  getDefaultUserSettings(): UserSettings {
    return {
      profile: {
        name: '',
        email: '',
        phone: '',
        avatar: ''
      },
      notifications: {
        'study-reminders': {
          enabled: true,
          channels: { email: true, push: true, sms: false }
        },
        'new-content': {
          enabled: true,
          channels: { email: true, push: false, sms: false }
        },
        'achievements': {
          enabled: true,
          channels: { email: false, push: true, sms: false }
        },
        'marketing': {
          enabled: false,
          channels: { email: false, push: false, sms: false }
        }
      },
      privacy: {
        'profile-visibility': false,
        'ranking-participation': true,
        'study-data-sharing': true
      },
      appearance: {
        theme: 'system',
        compactMode: false,
        stealthMode: false,
        animations: true
      },
      study: {
        dailyTimeGoal: 120,
        dailyCardsGoal: 50,
        autoReview: true,
        intensiveMode: false,
        focusMode: true
      }
    };
  }
}

export const settingsService = new SettingsService();