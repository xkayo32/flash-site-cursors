import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

export type CategoryType = 'subject' | 'topic' | 'exam_board' | 'year';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
  description?: string;
  contentCount?: {
    questions: number;
    flashcards: number;
    summaries: number;
    courses: number;
  };
  children?: Category[];
  created_at: string;
  updated_at: string;
}

interface CategoriesResponse {
  success: boolean;
  categories?: Category[];
  data?: Category[];
  message?: string;
}

interface CategoryResponse {
  success: boolean;
  data?: Category;
  message?: string;
}

interface CreateCategoryData {
  name: string;
  type: CategoryType;
  parent?: string;
  description?: string;
}

interface UpdateCategoryData {
  name?: string;
  type?: CategoryType;
  description?: string;
}

class CategoryService {
  private getAuthHeaders() {
    // Tentar pegar token do store ou localStorage
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'SIM' : 'NÃO');
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listCategories(): Promise<CategoriesResponse> {
    try {
      console.log('🔍 CategoryService: Fazendo requisição para:', API_ENDPOINTS.categories.list);
      const headers = this.getAuthHeaders();
      console.log('📡 Headers da requisição:', headers);
      
      const response = await fetch(`${API_ENDPOINTS.categories.list}`, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ Response error:', response.status, response.statusText);
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('📊 CategoryService data:', data);
      return data;
    } catch (error) {
      console.error('❌ CategoryService error:', error);
      return { success: false, message: 'Erro ao listar categorias' };
    }
  }

  async getCategoriesByType(type: CategoryType): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.categories.list}/type/${type}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing categories by type:', error);
      return { success: false, message: 'Erro ao listar categorias por tipo' };
    }
  }

  async getCategory(id: string): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.categories.get(id)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting category:', error);
      return { success: false, message: 'Erro ao buscar categoria' };
    }
  }

  async createCategory(categoryData: CreateCategoryData): Promise<CategoryResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.categories.create, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, message: 'Erro ao criar categoria' };
    }
  }

  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<CategoryResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.categories.update(id), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, message: 'Erro ao atualizar categoria' };
    }
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.categories.delete(id), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, message: 'Erro ao excluir categoria' };
    }
  }

  async getSubcategories(parentCategoryId: string): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.categories.list}/parent/${parentCategoryId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      // Garantir que sempre retornamos no formato esperado
      if (data.categories && !data.data) {
        data.data = data.categories;
      }
      return data;
    } catch (error) {
      console.error('Error getting subcategories:', error);
      return { success: false, message: 'Erro ao buscar subcategorias' };
    }
  }

  async getCategoryByName(name: string): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.categories.list}/name/${name}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting category by name:', error);
      return { success: false, message: 'Erro ao buscar categoria por nome' };
    }
  }

  // Método utilitário para obter hierarquia completa
  async getCategoryHierarchy(): Promise<Category[]> {
    try {
      const response = await this.listCategories();
      // A API já retorna as categorias com children preenchido!
      const categories = response.categories || response.data || [];
      
      // Filtrar apenas categorias principais (sem parent_id)
      // A API já inclui as children em cada categoria
      return categories.filter(cat => !cat.parent_id);
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      return [];
    }
  }
}

export const categoryService = new CategoryService();