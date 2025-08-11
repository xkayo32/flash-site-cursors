import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    newThisMonth: number;
    growth: string;
  };
  subscriptions: Record<string, number>;
  content: {
    questions: number;
    flashcards: number;
    summaries: number;
    courses: number;
    total: number;
  };
  revenue: {
    monthly: number;
    growth: string;
    currency: string;
  };
  categories: {
    total: number;
    subjects: number;
    examBoards: number;
    years: number;
  };
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  joinDate: string;
  lastActivity: string;
}

export interface RecentContent {
  id: number;
  title: string;
  type: 'course' | 'questions' | 'flashcards';
  author: string;
  status: 'published' | 'draft';
  updatedAt: string;
  views: number;
}

export interface SystemAlert {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

export interface DashboardActivities {
  recentUsers: RecentUser[];
  recentContent: RecentContent[];
  systemAlerts: SystemAlert[];
}

export interface PerformanceMetrics {
  dailyRegistrations: Array<{ date: string; count: number }>;
  contentEngagement: {
    questions: { attempts: number; correctRate: number };
    flashcards: { reviews: number; retentionRate: number };
    courses: { completions: number; averageProgress: number };
  };
  topCategories: Array<{
    name: string;
    students: number;
    growth: string;
  }>;
}

class DashboardService {
  private getAuthHeaders() {
    const token = useAuthStore.getState().token;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getStats(): Promise<{ success: boolean; data?: DashboardStats; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.dashboard.stats}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, message: 'Erro ao buscar estatísticas' };
    }
  }

  async getActivities(): Promise<{ success: boolean; data?: DashboardActivities; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.dashboard.activities}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, message: 'Erro ao buscar atividades' };
    }
  }

  async getPerformance(): Promise<{ success: boolean; data?: PerformanceMetrics; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.dashboard.performance}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return { success: false, message: 'Erro ao buscar métricas' };
    }
  }
}

export const dashboardService = new DashboardService();