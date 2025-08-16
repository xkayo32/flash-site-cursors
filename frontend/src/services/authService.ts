import api from '@/services/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'admin' | 'instructor';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
    };
    expiresIn?: number;
  };
  message?: string;
}

export interface VerifyResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
    };
  };
  message?: string;
}

class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * Login com credenciais
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/login`, credentials);
      
      // Se a API já retorna success diretamente, usa essa estrutura
      if (response.data.success) {
        return {
          success: true,
          data: {
            token: response.data.token,
            user: response.data.user
          }
        };
      }
      
      // Fallback para estrutura anterior
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  }

  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/register`, data);
      
      // Se a API já retorna success diretamente, usa essa estrutura
      if (response.data.success) {
        return {
          success: true,
          data: response.data.token ? {
            token: response.data.token,
            user: response.data.user
          } : undefined,
          message: response.data.message
        };
      }
      
      // Fallback para estrutura anterior
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário'
      };
    }
  }

  /**
   * Verificar token atual
   */
  async verify(): Promise<VerifyResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/verify`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token inválido ou expirado'
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/logout`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer logout'
      };
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/refresh`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao renovar token'
      };
    }
  }

  /**
   * Solicitar redefinição de senha
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/forgot-password`, { email });
      return {
        success: true,
        message: 'Email de redefinição enviado com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao solicitar redefinição de senha'
      };
    }
  }

  /**
   * Redefinir senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/reset-password`, { token, password: newPassword });
      return {
        success: true,
        message: 'Senha redefinida com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao redefinir senha'
      };
    }
  }
}

export const authService = new AuthService();