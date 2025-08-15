import api from './api';

// Types
export interface PerformanceData {
  date: string;
  examsTaken: number;
  averageScore: number;
  studyTime: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  improvement: number;
  color: string;
  icon: string;
}

export interface CompetitorData {
  id: string;
  name: string;
  avatar: string;
  score: number;
  examsTaken: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface WeakPoint {
  id: string;
  subject: string;
  topic: string;
  accuracy: number;
  questionsAttempted: number;
  priority: 'alta' | 'media' | 'baixa';
  recommendation: string;
  color: string;
}

export interface StudyPattern {
  period: string;
  averageTime: number;
  peakHour: string;
  consistency: number;
  totalSessions: number;
}

export interface TacticalStats {
  totalExamsTaken: number;
  averageScore: number;
  totalStudyTime: number;
  questionsAnswered: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  totalUsers: number;
  improvement: number;
}

export interface AnalyticsResponse {
  performance: PerformanceData[];
  subjectPerformance: SubjectPerformance[];
  competitors: CompetitorData[];
  weakPoints: WeakPoint[];
  studyPatterns: StudyPattern[];
  stats: TacticalStats;
}

// Service class
class AnalyticsService {
  /**
   * Get user's performance analytics
   */
  async getAnalytics(period: string = '30days'): Promise<AnalyticsResponse> {
    try {
      const response = await api.get(`/analytics?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting analytics:', error);
      throw new Error(error.response?.data?.error || 'Failed to get analytics');
    }
  }

  /**
   * Get performance data for charts
   */
  async getPerformanceData(period: string = '30days'): Promise<PerformanceData[]> {
    try {
      const response = await api.get(`/analytics/performance?period=${period}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting performance data:', error);
      throw new Error(error.response?.data?.error || 'Failed to get performance data');
    }
  }

  /**
   * Get subject performance breakdown
   */
  async getSubjectPerformance(): Promise<SubjectPerformance[]> {
    try {
      const response = await api.get('/analytics/subjects');
      return response.data;
    } catch (error: any) {
      console.error('Error getting subject performance:', error);
      throw new Error(error.response?.data?.error || 'Failed to get subject performance');
    }
  }

  /**
   * Get ranking and competitors
   */
  async getRanking(): Promise<{ user: CompetitorData; competitors: CompetitorData[] }> {
    try {
      const response = await api.get('/analytics/ranking');
      return response.data;
    } catch (error: any) {
      console.error('Error getting ranking:', error);
      throw new Error(error.response?.data?.error || 'Failed to get ranking');
    }
  }

  /**
   * Get weak points analysis
   */
  async getWeakPoints(): Promise<WeakPoint[]> {
    try {
      const response = await api.get('/analytics/weak-points');
      return response.data;
    } catch (error: any) {
      console.error('Error getting weak points:', error);
      throw new Error(error.response?.data?.error || 'Failed to get weak points');
    }
  }

  /**
   * Get study patterns
   */
  async getStudyPatterns(): Promise<StudyPattern[]> {
    try {
      const response = await api.get('/analytics/study-patterns');
      return response.data;
    } catch (error: any) {
      console.error('Error getting study patterns:', error);
      throw new Error(error.response?.data?.error || 'Failed to get study patterns');
    }
  }

  /**
   * Get tactical statistics
   */
  async getTacticalStats(): Promise<TacticalStats> {
    try {
      const response = await api.get('/analytics/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error getting tactical stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to get tactical stats');
    }
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const response = await api.get(`/analytics/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error exporting data:', error);
      throw new Error(error.response?.data?.error || 'Failed to export data');
    }
  }

  /**
   * Update analytics (refresh data)
   */
  async refreshAnalytics(): Promise<void> {
    try {
      await api.post('/analytics/refresh');
    } catch (error: any) {
      console.error('Error refreshing analytics:', error);
      throw new Error(error.response?.data?.error || 'Failed to refresh analytics');
    }
  }

  /**
   * Get color for performance level
   */
  getPerformanceColor(accuracy: number): string {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  /**
   * Get background color for performance level
   */
  getPerformanceBgColor(accuracy: number): string {
    if (accuracy >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (accuracy >= 60) return 'bg-amber-100 dark:bg-amber-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  }

  /**
   * Get priority color for weak points
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'alta': return 'text-red-600';
      case 'media': return 'text-amber-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Format time in hours and minutes
   */
  formatStudyTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Calculate improvement percentage
   */
  calculateImprovement(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get trend icon based on improvement
   */
  getTrendIcon(improvement: number): 'up' | 'down' | 'stable' {
    if (improvement > 5) return 'up';
    if (improvement < -5) return 'down';
    return 'stable';
  }

  /**
   * Generate subject colors
   */
  getSubjectColor(index: number): string {
    const colors = [
      '#22c55e', // green
      '#3b82f6', // blue
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
    ];
    return colors[index % colors.length];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();