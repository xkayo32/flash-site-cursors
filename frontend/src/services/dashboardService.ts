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

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  subscription: {
    plan: string;
    expiresAt: string;
  };
}

export interface StudentStatistics {
  questionsAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  flashcardsReviewed: number;
  studyStreak: number;
  totalStudyTime: number;
}

export interface StudentCourse {
  id: string;
  name: string;
  category: string;
  progress: number;
  totalQuestions: number;
  totalFlashcards: number;
  enrolledAt: string;
  thumbnail?: string;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  timestamp: string;
  score: number;
  icon: string;
}

export interface DailyGoal {
  id: number;
  task: string;
  completed: number;
  total: number;
  type: string;
}

export interface SubjectPerformance {
  subject: string;
  accuracy: number;
  questions: number;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  daysLeft: number;
  type: string;
  progress: number;
}

export interface EditalProgress {
  materia: string;
  total: number;
  concluido: number;
  porcentagem: number;
}

export interface UserGroup {
  id: string;
  name: string;
  members: number;
  role: string;
  badge: string;
  progress: number;
  nextActivity: string;
  instructor: string;
  rank: number;
}

export interface StudentDashboardData {
  user: StudentUser;
  statistics: StudentStatistics;
  courses: StudentCourse[];
  recentActivities: RecentActivity[];
  dailyGoals: DailyGoal[];
  subjectPerformance: SubjectPerformance[];
  upcomingEvents: UpcomingEvent[];
  studyTips: string[];
  editalProgress: EditalProgress[];
  userGroups: UserGroup[];
  weakSubjects: Array<{
    name: string;
    accuracy: number;
    questions: number;
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

  async getStudentDashboard(): Promise<{ success: boolean; data?: StudentDashboardData; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.dashboard.student}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return { success: false, message: 'Erro ao buscar dados do painel do estudante' };
    }
  }
}

export const dashboardService = new DashboardService();