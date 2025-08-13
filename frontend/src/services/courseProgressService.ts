import apiConfig from '@/config/api';

export interface LessonProgress {
  id?: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  current_time: number;
  duration: number;
  watched_percentage: number;
  completed: boolean;
  last_accessed: string | null;
  total_watch_time?: number;
  sessions?: Array<{
    timestamp: string;
    watch_time: number;
    session_duration?: number;
    completed_session: boolean;
  }>;
}

export interface ModuleProgress {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    duration_minutes: number;
    video_url: string | null;
    content: string | null;
    order_index: number;
    is_published: boolean;
    is_free: boolean;
    progress: LessonProgress;
  }>;
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
}

export interface CourseProgress {
  enrollment: {
    id: string;
    status: string;
    progress: {
      percentage: number;
      completed_lessons: string[];
      last_accessed: string;
    };
    enrolled_at: string;
  };
  modules: ModuleProgress[];
  current_lesson_id: string | null;
  next_lesson_id: string | null;
  total_watch_time: number;
}

class CourseProgressService {
  private apiUrl = apiConfig.baseURL;

  /**
   * Atualizar progresso de uma aula
   */
  async updateLessonProgress(
    courseId: string,
    lessonId: string,
    progress: {
      currentTime: number;
      duration: number;
      completed?: boolean;
      watchedPercentage?: number;
    }
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/lessons/${lessonId}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentTime: progress.currentTime,
            duration: progress.duration,
            completed: progress.completed || false,
            watchedPercentage: progress.watchedPercentage || 0
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar progresso');
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar progresso da aula:', error);
      throw error;
    }
  }

  /**
   * Obter progresso de uma aula específica
   */
  async getLessonProgress(
    courseId: string,
    lessonId: string
  ): Promise<LessonProgress | null> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/lessons/${lessonId}/progress`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao obter progresso');
      }

      return data.data;
    } catch (error: any) {
      console.error('Erro ao obter progresso da aula:', error);
      return null;
    }
  }

  /**
   * Obter progresso completo do curso
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/progress`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao obter progresso do curso');
      }

      return data.data;
    } catch (error: any) {
      console.error('Erro ao obter progresso do curso:', error);
      return null;
    }
  }

  /**
   * Marcar aula como completa (endpoint legacy)
   */
  async markLessonComplete(
    courseId: string,
    lessonId: string
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/lessons/${lessonId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao marcar aula como completa');
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao marcar aula como completa:', error);
      throw error;
    }
  }

  /**
   * Verificar se o usuário está matriculado no curso
   */
  async getEnrollmentStatus(courseId: string): Promise<{
    enrolled: boolean;
    status?: string;
    progress?: any;
    enrollment?: any;
  }> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/enrollment`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar matrícula');
      }

      return data.data;
    } catch (error: any) {
      console.error('Erro ao verificar matrícula:', error);
      return { enrolled: false };
    }
  }

  /**
   * Matricular no curso
   */
  async enrollInCourse(courseId: string): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${this.apiUrl}/courses/${courseId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer matrícula');
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao fazer matrícula:', error);
      throw error;
    }
  }

  /**
   * Calcular porcentagem assistida de um vídeo
   */
  calculateWatchedPercentage(currentTime: number, duration: number): number {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.round((currentTime / duration) * 100));
  }

  /**
   * Salvar progresso de vídeo automaticamente (debounced)
   */
  private progressSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  saveProgressDebounced(
    courseId: string,
    lessonId: string,
    currentTime: number,
    duration: number,
    delay: number = 2000 // 2 segundos de delay
  ): void {
    const key = `${courseId}-${lessonId}`;
    
    // Limpar timeout anterior se existir
    const existingTimeout = this.progressSaveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Criar novo timeout
    const timeout = setTimeout(async () => {
      try {
        const watchedPercentage = this.calculateWatchedPercentage(currentTime, duration);
        
        await this.updateLessonProgress(courseId, lessonId, {
          currentTime,
          duration,
          watchedPercentage,
          completed: watchedPercentage >= 90
        });

        console.log(`✅ Progresso salvo: ${watchedPercentage}% da aula ${lessonId}`);
      } catch (error) {
        console.error('Erro ao salvar progresso automaticamente:', error);
      }
      
      // Remover timeout do map
      this.progressSaveTimeouts.delete(key);
    }, delay);

    // Salvar timeout no map
    this.progressSaveTimeouts.set(key, timeout);
  }

  /**
   * Limpar todos os timeouts pendentes
   */
  clearPendingSaves(): void {
    this.progressSaveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.progressSaveTimeouts.clear();
  }

  /**
   * Encontrar próxima aula na sequência
   */
  findNextLesson(courseProgress: CourseProgress): {
    module?: ModuleProgress;
    lesson?: any;
  } | null {
    if (courseProgress.next_lesson_id) {
      for (const module of courseProgress.modules) {
        const lesson = module.lessons.find(l => l.id === courseProgress.next_lesson_id);
        if (lesson) {
          return { module, lesson };
        }
      }
    }
    return null;
  }

  /**
   * Encontrar aula atual (próxima incompleta)
   */
  findCurrentLesson(courseProgress: CourseProgress): {
    module?: ModuleProgress;
    lesson?: any;
  } | null {
    if (courseProgress.current_lesson_id) {
      for (const module of courseProgress.modules) {
        const lesson = module.lessons.find(l => l.id === courseProgress.current_lesson_id);
        if (lesson) {
          return { module, lesson };
        }
      }
    }
    return null;
  }

  /**
   * Obter estatísticas resumidas do progresso
   */
  getProgressStats(courseProgress: CourseProgress): {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    totalWatchTime: number;
    currentModule: string | null;
    nextLesson: string | null;
  } {
    const totalLessons = courseProgress.modules.reduce(
      (sum, module) => sum + module.total_lessons, 0
    );
    
    const completedLessons = courseProgress.modules.reduce(
      (sum, module) => sum + module.completed_lessons, 0
    );

    const progressPercentage = totalLessons > 0 ? 
      Math.round((completedLessons / totalLessons) * 100) : 0;

    const currentLesson = this.findCurrentLesson(courseProgress);
    const nextLesson = this.findNextLesson(courseProgress);

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
      totalWatchTime: courseProgress.total_watch_time,
      currentModule: currentLesson?.module?.title || null,
      nextLesson: nextLesson?.lesson?.title || null
    };
  }
}

export const courseProgressService = new CourseProgressService();