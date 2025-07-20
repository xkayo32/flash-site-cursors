import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  subscription?: {
    plan: string;
    status: string;
  };
  createdAt: string;
  lastLogin: string;
}

interface UsersResponse {
  success: boolean;
  data?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

interface UserResponse {
  success: boolean;
  data?: User & { plans?: any[] };
  message?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
  phone?: string;
  plan_id?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  phone?: string;
  plan_id?: string;
}

class UserService {
  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status && params.status !== 'Todos') queryParams.append('status', params.status);
      if (params?.role && params.role !== 'Todos') queryParams.append('role', params.role);

      const response = await fetch(`${API_ENDPOINTS.users.list}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing users:', error);
      return { success: false, message: 'Erro ao listar usuários' };
    }
  }

  async getUser(id: string): Promise<UserResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.users.get(id), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, message: 'Erro ao buscar usuário' };
    }
  }

  async createUser(userData: CreateUserData): Promise<UserResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.users.create, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Erro ao criar usuário' };
    }
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.users.update(id), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: 'Erro ao atualizar usuário' };
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.users.delete(id), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: 'Erro ao excluir usuário' };
    }
  }
}

export const userService = new UserService();