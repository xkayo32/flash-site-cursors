import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  instructor: {
    id: string;
    name: string;
  };
  thumbnail?: string;
  previewVideo?: string;
  price?: number;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    hours?: number;
    months?: number;
  };
  language?: string;
  requirements?: string[];
  objectives?: string[];
  targetAudience?: string;
  certificationAvailable: boolean;
  stats: {
    enrollments: number;
    rating: number;
    modules: number;
    lessons: number;
  };
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface CourseModule {
  id: string;
  courseId?: string;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  stats: {
    lessons: number;
    duration?: number;
  };
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  moduleId?: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live';
  orderIndex: number;
  duration?: number;
  videoUrl?: string;
  content?: string;
  isPublished: boolean;
  isFree: boolean;
  stats?: {
    resources: number;
  };
  resources?: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'download';
  url: string;
  size?: number;
  createdAt: string;
}

interface CoursesResponse {
  success: boolean;
  data?: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

interface CourseResponse {
  success: boolean;
  data?: Course;
  message?: string;
}

interface ModulesResponse {
  success: boolean;
  data?: CourseModule[];
  message?: string;
}

interface ModuleResponse {
  success: boolean;
  data?: CourseModule;
  message?: string;
}

interface LessonsResponse {
  success: boolean;
  data?: Lesson[];
  message?: string;
}

interface LessonResponse {
  success: boolean;
  data?: Lesson;
  message?: string;
}

interface CreateCourseData {
  title: string;
  description?: string;
  category: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price?: number;
  difficulty_level?: string;
  duration_hours?: number;
  duration_months?: number;
  requirements?: string[];
  objectives?: string[];
  target_audience?: string;
  certification_available?: boolean;
  instructor_id?: string;
}

interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price?: number;
  difficulty_level?: string;
  duration_hours?: number;
  duration_months?: number;
  requirements?: string[];
  objectives?: string[];
  target_audience?: string;
  certification_available?: boolean;
  status?: string;
  visibility?: string;
}

interface CreateModuleData {
  title: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

interface UpdateModuleData {
  title?: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

interface CreateLessonData {
  title: string;
  description?: string;
  type: string;
  order_index?: number;
  duration_minutes?: number;
  video_url?: string;
  content?: string;
  is_published?: boolean;
  is_free?: boolean;
}

interface UpdateLessonData {
  title?: string;
  description?: string;
  type?: string;
  order_index?: number;
  duration_minutes?: number;
  video_url?: string;
  content?: string;
  is_published?: boolean;
  is_free?: boolean;
}

interface CreateResourceData {
  title: string;
  type: string;
  url: string;
  size_bytes?: number;
}

class CourseService {
  private getAuthHeaders(isMultipart: boolean = false) {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    
    // Don't set Content-Type for multipart/form-data - let browser set it with boundary
    if (!isMultipart) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    return headers;
  }

  // =================== COURSES ===================

  async listCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<CoursesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);

      const response = await fetch(`${API_ENDPOINTS.courses.list}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing courses:', error);
      return { success: false, message: 'Erro ao listar cursos' };
    }
  }

  async getCourse(id: string): Promise<CourseResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.get(id), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting course:', error);
      return { success: false, message: 'Erro ao buscar curso' };
    }
  }

  async createCourse(courseData: CreateCourseData | FormData): Promise<CourseResponse> {
    try {
      let body: FormData | string;
      let isMultipart = false;
      
      if (courseData instanceof FormData) {
        body = courseData;
        isMultipart = true;
      } else {
        const params = new URLSearchParams();
        Object.entries(courseData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        body = params.toString();
      }

      const response = await fetch(API_ENDPOINTS.courses.create, {
        method: 'POST',
        headers: this.getAuthHeaders(isMultipart),
        body: body,
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        console.error('JSON parse error in create:', parseError);
        console.error('Response text:', responseText);
        return { 
          success: false, 
          message: 'Erro no servidor: resposta inválida',
          raw_response: responseText
        };
      }
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, message: 'Erro ao criar curso' };
    }
  }

  async updateCourse(id: string, courseData: UpdateCourseData | FormData): Promise<CourseResponse> {
    try {
      let body: FormData | string;
      let isMultipart = false;
      
      if (courseData instanceof FormData) {
        body = courseData;
        isMultipart = true;
      } else {
        const params = new URLSearchParams();
        Object.entries(courseData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        body = params.toString();
      }

      const response = await fetch(API_ENDPOINTS.courses.update(id), {
        method: 'PUT',
        headers: this.getAuthHeaders(isMultipart),
        body: body,
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        return { 
          success: false, 
          message: 'Erro no servidor: resposta inválida',
          raw_response: responseText
        };
      }
    } catch (error) {
      console.error('Error updating course:', error);
      return { success: false, message: 'Erro ao atualizar curso' };
    }
  }

  async deleteCourse(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.delete(id), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting course:', error);
      return { success: false, message: 'Erro ao excluir curso' };
    }
  }

  async uploadCourseImage(id: string, formData: FormData): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.courses.uploadImage(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro ao enviar imagem'
        };
      }
    } catch (error) {
      console.error('Error uploading course image:', error);
      return { success: false, message: 'Erro ao enviar imagem do curso' };
    }
  }

  // =================== MODULES ===================

  async listModules(courseId: string): Promise<ModulesResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.modules.list(courseId), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing modules:', error);
      return { success: false, message: 'Erro ao listar módulos' };
    }
  }

  async getModule(courseId: string, id: string): Promise<ModuleResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.modules.get(courseId, id), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting module:', error);
      return { success: false, message: 'Erro ao buscar módulo' };
    }
  }

  async createModule(courseId: string, moduleData: CreateModuleData): Promise<ModuleResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(moduleData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.courses.modules.create(courseId), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating module:', error);
      return { success: false, message: 'Erro ao criar módulo' };
    }
  }

  async updateModule(courseId: string, id: string, moduleData: UpdateModuleData): Promise<ModuleResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(moduleData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.courses.modules.update(courseId, id), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating module:', error);
      return { success: false, message: 'Erro ao atualizar módulo' };
    }
  }

  async deleteModule(courseId: string, id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.modules.delete(courseId, id), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting module:', error);
      return { success: false, message: 'Erro ao excluir módulo' };
    }
  }

  async reorderModules(courseId: string, moduleIds: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const params = new URLSearchParams();
      params.append('module_ids', JSON.stringify(moduleIds));

      const response = await fetch(API_ENDPOINTS.courses.modules.reorder(courseId), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reordering modules:', error);
      return { success: false, message: 'Erro ao reordenar módulos' };
    }
  }

  // =================== LESSONS ===================

  async listLessons(moduleId: string): Promise<LessonsResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.lessons.list(moduleId), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing lessons:', error);
      return { success: false, message: 'Erro ao listar aulas' };
    }
  }

  async getLesson(moduleId: string, id: string): Promise<LessonResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.lessons.get(moduleId, id), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting lesson:', error);
      return { success: false, message: 'Erro ao buscar aula' };
    }
  }

  async createLesson(moduleId: string, lessonData: CreateLessonData): Promise<LessonResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(lessonData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.courses.lessons.create(moduleId), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { success: false, message: 'Erro ao criar aula' };
    }
  }

  async updateLesson(moduleId: string, id: string, lessonData: UpdateLessonData): Promise<LessonResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(lessonData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.courses.lessons.update(moduleId, id), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { success: false, message: 'Erro ao atualizar aula' };
    }
  }

  async deleteLesson(moduleId: string, id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.courses.lessons.delete(moduleId, id), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, message: 'Erro ao excluir aula' };
    }
  }

  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const params = new URLSearchParams();
      params.append('lesson_ids', JSON.stringify(lessonIds));

      const response = await fetch(API_ENDPOINTS.courses.lessons.reorder(moduleId), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reordering lessons:', error);
      return { success: false, message: 'Erro ao reordenar aulas' };
    }
  }

  async addLessonResource(moduleId: string, lessonId: string, resourceData: CreateResourceData): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const params = new URLSearchParams();
      Object.entries(resourceData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ENDPOINTS.courses.lessons.addResource(moduleId, lessonId), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: params.toString(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding lesson resource:', error);
      return { success: false, message: 'Erro ao adicionar recurso' };
    }
  }
}

export const courseService = new CourseService();
export type { Course, CourseModule, Lesson, LessonResource, CreateCourseData, UpdateCourseData };