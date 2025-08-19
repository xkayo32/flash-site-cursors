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
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async listCategories(): Promise<CategoriesResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.categories.list}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing categories:', error);
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
}

export const categoryService = new CategoryService();