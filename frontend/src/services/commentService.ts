import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  user_id: number;
  course_id: string;
  lesson_id?: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  replies_count: number;
  is_instructor_reply: boolean;
  status: string;
  user: User;
  liked_by?: Array<{ user_id: number; created_at: string }>;
}

interface CommentsResponse {
  success: boolean;
  data?: Comment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

interface CommentResponse {
  success: boolean;
  data?: Comment;
  message?: string;
}

interface CreateCommentData {
  content: string;
  lesson_id?: string;
  parent_id?: string;
}

interface UpdateCommentData {
  content: string;
}

interface LikeResponse {
  success: boolean;
  data?: {
    comment_id: string;
    likes: number;
    user_liked: boolean;
  };
  message?: string;
}

class CommentService {
  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  private handleApiResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: false, message: text || 'Erro desconhecido', raw_response: text };
      }
    }
    
    return data;
  };

  // =================== COMMENTS ===================

  async getComments(courseId: string, params?: {
    lesson_id?: string;
    page?: number;
    limit?: number;
  }): Promise<CommentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.lesson_id) queryParams.append('lesson_id', params.lesson_id);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_ENDPOINTS.courses.get(courseId)}/comments?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, message: 'Erro ao buscar relatórios operacionais' };
    }
  }

  async createComment(courseId: string, commentData: CreateCommentData): Promise<CommentResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(commentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_ENDPOINTS.courses.get(courseId)}/comments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await this.handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return { success: false, message: 'Erro ao criar relatório operacional' };
    }
  }

  async updateComment(courseId: string, commentId: string, commentData: UpdateCommentData): Promise<CommentResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(commentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_ENDPOINTS.courses.get(courseId)}/comments/${commentId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await this.handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, message: 'Erro ao atualizar relatório operacional' };
    }
  }

  async deleteComment(courseId: string, commentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.courses.get(courseId)}/comments/${commentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, message: 'Erro ao excluir relatório operacional' };
    }
  }

  async likeComment(courseId: string, commentId: string): Promise<LikeResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.courses.get(courseId)}/comments/${commentId}/like`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: new URLSearchParams(),
      });

      const data = await this.handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Error liking comment:', error);
      return { success: false, message: 'Erro ao registrar apoio' };
    }
  }

  // Helper function to format time ago
  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years}a`;
    if (months > 0) return `${months}m`;
    if (weeks > 0) return `${weeks}sem`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'agora';
  }

  // Helper function to get initials from name
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}

export const commentService = new CommentService();
export type { 
  Comment, 
  CommentsResponse, 
  CommentResponse,
  CreateCommentData,
  UpdateCommentData,
  LikeResponse,
  User
};