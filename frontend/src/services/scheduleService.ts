import { API_BASE_URL } from '../config/api';

// Schedule types and interfaces matching backend
export type TaskType = 'study' | 'practice' | 'review' | 'exam';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EventType = 'course' | 'lesson' | 'exam' | 'meeting' | 'deadline';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  subject?: string;
  course_id?: string;
  lesson_id?: string;
  exam_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  all_day: boolean;
  color?: string;
  course_id?: string;
  lesson_id?: string;
  exam_id?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration: number; // minutes
  subject: string;
  type: 'course' | 'lesson' | 'module' | 'questions' | 'simulation' | 'flashcards' | 'revision';
  course_id?: string;
  lesson_id?: string;
  module_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number; // 0-100
  score?: number; // for questions and simulations
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  study_hours_target: number;
  study_hours_completed: number;
  tasks_target: number;
  tasks_completed: number;
  questions_target: number;
  questions_completed: number;
  flashcards_target: number;
  flashcards_completed: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleStats {
  today: {
    date: string;
    tasks: {
      total: number;
      completed: number;
      pending: number;
      completion_rate: number;
    };
    study_time: {
      completed_minutes: number;
      completed_hours: number;
      target_hours: number;
      completion_rate: number;
    };
    questions_answered: number;
    average_score: number;
    goals?: DailyGoal;
  };
  weekly: {
    week_start: string;
    week_end: string;
    tasks_total: number;
    tasks_completed: number;
    study_time_minutes: number;
    study_time_hours: number;
    sessions_completed: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TaskFilters {
  date?: string;
  status?: TaskStatus;
  type?: TaskType;
  priority?: TaskPriority;
}

export interface EventFilters {
  start_date?: string;
  end_date?: string;
  type?: EventType;
}

export interface StudySessionFilters {
  date?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type?: 'course' | 'lesson' | 'module' | 'questions' | 'simulation' | 'flashcards' | 'revision';
}

export interface DailyGoalFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// Helper function to build query string
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value.toString());
    }
  });
  return query.toString();
}

class ScheduleService {
  private baseUrl = `${API_BASE_URL}/schedule`;

  // Tasks API
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      const queryString = buildQueryString(filters);
      const url = `${this.baseUrl}/tasks${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar tarefas: ${response.status}`);
      }

      const result: ApiResponse<Task[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar tarefas');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar tarefa: ${response.status}`);
      }

      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar tarefa');
      }

      return result.data!;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar tarefa: ${response.status}`);
      }

      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar tarefa');
      }

      return result.data!;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir tarefa: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao excluir tarefa');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async completeTask(id: string, completed: boolean = true, notes?: string): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed, notes }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao marcar tarefa: ${response.status}`);
      }

      const result: ApiResponse<Task> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao marcar tarefa');
      }

      return result.data!;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  // Events API
  async getEvents(filters: EventFilters = {}): Promise<CalendarEvent[]> {
    try {
      const queryString = buildQueryString(filters);
      const url = `${this.baseUrl}/events${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos: ${response.status}`);
      }

      const result: ApiResponse<CalendarEvent[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar eventos');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  // Study Sessions API
  async getStudySessions(filters: StudySessionFilters = {}): Promise<StudySession[]> {
    try {
      const queryString = buildQueryString(filters);
      const url = `${this.baseUrl}/study-sessions${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar sessões de estudo: ${response.status}`);
      }

      const result: ApiResponse<StudySession[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar sessões de estudo');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting study sessions:', error);
      throw error;
    }
  }

  // Daily Goals API
  async getDailyGoals(filters: DailyGoalFilters = {}): Promise<DailyGoal[]> {
    try {
      const queryString = buildQueryString(filters);
      const url = `${this.baseUrl}/daily-goals${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar metas diárias: ${response.status}`);
      }

      const result: ApiResponse<DailyGoal[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar metas diárias');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting daily goals:', error);
      throw error;
    }
  }

  async updateDailyGoal(date: string, updates: Partial<DailyGoal>): Promise<DailyGoal> {
    try {
      const response = await fetch(`${this.baseUrl}/daily-goals/${date}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar meta diária: ${response.status}`);
      }

      const result: ApiResponse<DailyGoal> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar meta diária');
      }

      return result.data!;
    } catch (error) {
      console.error('Error updating daily goal:', error);
      throw error;
    }
  }

  // Statistics API
  async getStats(date?: string): Promise<ScheduleStats> {
    try {
      const queryString = date ? `?date=${date}` : '';
      const url = `${this.baseUrl}/stats${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
      }

      const result: ApiResponse<ScheduleStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar estatísticas');
      }

      return result.data!;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Utility methods
  async getTasksForDate(date: string): Promise<Task[]> {
    return this.getTasks({ date });
  }

  async getEventsForDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return this.getEvents({ start_date: startDate, end_date: endDate });
  }

  async getStudySessionsForDate(date: string): Promise<StudySession[]> {
    return this.getStudySessions({ date });
  }

  async getTodayGoal(): Promise<DailyGoal | null> {
    const today = new Date().toISOString().split('T')[0];
    const goals = await this.getDailyGoals({ date: today });
    return goals.length > 0 ? goals[0] : null;
  }

  async getWeeklyGoals(): Promise<DailyGoal[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.getDailyGoals({
      start_date: startOfWeek.toISOString().split('T')[0],
      end_date: endOfWeek.toISOString().split('T')[0]
    });
  }

  // Task completion helpers
  async markTaskAsCompleted(taskId: string, notes?: string): Promise<Task> {
    return this.completeTask(taskId, true, notes);
  }

  async markTaskAsPending(taskId: string): Promise<Task> {
    return this.completeTask(taskId, false);
  }

  // Bulk operations
  async getScheduleForDate(date: string): Promise<{
    tasks: Task[];
    events: CalendarEvent[];
    studySessions: StudySession[];
    goal?: DailyGoal;
  }> {
    try {
      const [tasks, events, studySessions, goals] = await Promise.all([
        this.getTasksForDate(date),
        this.getEvents({ start_date: date, end_date: date }),
        this.getStudySessionsForDate(date),
        this.getDailyGoals({ date })
      ]);

      return {
        tasks,
        events,
        studySessions,
        goal: goals.length > 0 ? goals[0] : undefined
      };
    } catch (error) {
      console.error('Error getting schedule for date:', error);
      throw error;
    }
  }

  async getDashboardData(): Promise<{
    todayStats: ScheduleStats;
    upcomingTasks: Task[];
    todayEvents: CalendarEvent[];
    recentSessions: StudySession[];
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const [stats, upcomingTasks, todayEvents, recentSessions] = await Promise.all([
        this.getStats(today),
        this.getTasks({ status: 'pending' }),
        this.getEvents({ start_date: today, end_date: tomorrowStr }),
        this.getStudySessions({ status: 'completed' })
      ]);

      return {
        todayStats: stats,
        upcomingTasks: upcomingTasks.slice(0, 5), // Limit to 5 upcoming tasks
        todayEvents,
        recentSessions: recentSessions.slice(0, 10) // Limit to 10 recent sessions
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService();