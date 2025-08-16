import api from '@/services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
    language?: string;
  };
  stats?: {
    coursesEnrolled?: number;
    coursesCompleted?: number;
    totalStudyHours?: number;
    averageScore?: number;
    currentStreak?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
    language?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class ProfileService {
  private readonly baseUrl = '/profile';

  /**
   * Obter perfil do usuário atual
   */
  async getProfile(): Promise<{ success: boolean; data?: UserProfile; message?: string }> {
    try {
      const response = await api.get(this.baseUrl);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar perfil'
      };
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data?: UserProfile; message?: string }> {
    try {
      const response = await api.put(this.baseUrl, data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Perfil atualizado com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil'
      };
    }
  }

  /**
   * Upload de avatar
   */
  async uploadAvatar(file: File): Promise<{ success: boolean; data?: { avatarUrl: string }; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`${this.baseUrl}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Avatar atualizado com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer upload do avatar'
      };
    }
  }

  /**
   * Remover avatar
   */
  async removeAvatar(): Promise<{ success: boolean; message?: string }> {
    try {
      await api.delete(`${this.baseUrl}/avatar`);
      return {
        success: true,
        message: 'Avatar removido com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao remover avatar'
      };
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/change-password`, data);
      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar senha'
      };
    }
  }

  /**
   * Obter estatísticas do perfil
   */
  async getProfileStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas'
      };
    }
  }

  /**
   * Obter histórico de atividades
   */
  async getActivityHistory(params?: { limit?: number; offset?: number }): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/activities`, { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar histórico'
      };
    }
  }

  /**
   * Deletar conta
   */
  async deleteAccount(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.delete(this.baseUrl, {
        data: { password }
      });
      return {
        success: true,
        message: 'Conta excluída com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir conta'
      };
    }
  }

  /**
   * Exportar dados do perfil (LGPD)
   */
  async exportProfileData(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/export`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }
}

export const profileService = new ProfileService();