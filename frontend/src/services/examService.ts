import { api } from '../config/api';

// Types
export interface ExamSession {
  id: string;
  examId: string;
  examType: 'mock' | 'previous';
  userId: string;
  title: string;
  questions: Question[];
  answers: Record<string, string>; // questionId -> alternativeId
  flaggedQuestions: string[];
  startedAt: string;
  submittedAt?: string;
  duration: number; // tempo total em minutos
  timeSpent: number; // tempo gasto em segundos
  score?: number;
  correctAnswers?: number;
  totalQuestions: number;
  status: 'active' | 'submitted' | 'expired';
  results?: ExamResults;
}

export interface Question {
  id: string;
  number: number;
  subject: string;
  statement: string;
  alternatives: Alternative[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'RECRUTA' | 'CABO' | 'SARGENTO';
  year?: number;
  institution?: string;
}

export interface Alternative {
  id: string;
  letter: string;
  text: string;
}

export interface ExamResults {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  subjectPerformance: SubjectPerformance[];
  percentile: number;
  averageScore: number;
  recommendedStudyTopics: string[];
  questions: QuestionResult[];
  ranking: number;
  totalParticipants: number;
}

export interface SubjectPerformance {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
  color: string;
}

export interface QuestionResult {
  id: string;
  number: number;
  subject: string;
  statement: string;
  alternatives: Alternative[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect: boolean;
  explanation: string;
  difficulty: string;
  year?: number;
  institution?: string;
}

// Service class
class ExamService {
  /**
   * Start a new exam session
   */
  async startExamSession(examId: string, examType: 'mock' | 'previous'): Promise<ExamSession> {
    try {
      const response = await api.post(`/exams/${examType}/${examId}/sessions`);
      return response.data;
    } catch (error: any) {
      console.error('Error starting exam session:', error);
      throw new Error(error.response?.data?.error || 'Failed to start exam session');
    }
  }

  /**
   * Get exam session details
   */
  async getExamSession(sessionId: string): Promise<ExamSession> {
    try {
      const response = await api.get(`/exam-sessions/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting exam session:', error);
      throw new Error(error.response?.data?.error || 'Failed to get exam session');
    }
  }

  /**
   * Save answer to a question
   */
  async saveAnswer(sessionId: string, questionId: string, alternativeId: string): Promise<void> {
    try {
      await api.put(`/exam-sessions/sessions/${sessionId}/answers`, {
        questionId,
        alternativeId
      });
    } catch (error: any) {
      console.error('Error saving answer:', error);
      throw new Error(error.response?.data?.error || 'Failed to save answer');
    }
  }

  /**
   * Toggle flag status of a question
   */
  async toggleFlag(sessionId: string, questionId: string, flagged: boolean): Promise<void> {
    try {
      await api.put(`/exam-sessions/sessions/${sessionId}/answers`, {
        questionId,
        flagged
      });
    } catch (error: any) {
      console.error('Error toggling flag:', error);
      throw new Error(error.response?.data?.error || 'Failed to toggle flag');
    }
  }

  /**
   * Update time spent in session
   */
  async updateTimeSpent(sessionId: string, timeSpent: number): Promise<void> {
    try {
      await api.put(`/exam-sessions/sessions/${sessionId}/time`, {
        timeSpent
      });
    } catch (error: any) {
      console.error('Error updating time:', error);
      // Don't throw error for time updates as they're not critical
    }
  }

  /**
   * Submit exam session
   */
  async submitExam(sessionId: string, timeSpent: number): Promise<{ sessionId: string; results: any }> {
    try {
      const response = await api.post(`/exam-sessions/sessions/${sessionId}/submit`, {
        timeSpent
      });
      return response.data;
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit exam');
    }
  }

  /**
   * Get exam results
   */
  async getExamResults(sessionId: string): Promise<ExamResults> {
    try {
      const response = await api.get(`/exam-sessions/sessions/${sessionId}/results`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting results:', error);
      throw new Error(error.response?.data?.error || 'Failed to get results');
    }
  }

  /**
   * Get user's exam sessions
   */
  async getUserExamSessions(filters?: {
    status?: 'active' | 'submitted' | 'expired';
    examType?: 'mock' | 'previous';
  }): Promise<ExamSession[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.examType) params.append('examType', filters.examType);

      const response = await api.get(`/exam-sessions/sessions?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting exam sessions:', error);
      throw new Error(error.response?.data?.error || 'Failed to get exam sessions');
    }
  }

  /**
   * Batch save answers and flags (for optimization)
   */
  async batchSaveAnswers(sessionId: string, updates: Array<{
    questionId: string;
    alternativeId?: string;
    flagged?: boolean;
  }>): Promise<void> {
    try {
      // Since the API doesn't support batch updates, we'll send them sequentially
      // In a real-world scenario, you'd want to implement a batch endpoint
      for (const update of updates) {
        if (update.alternativeId || update.flagged !== undefined) {
          await api.put(`/exam-sessions/sessions/${sessionId}/answers`, update);
        }
      }
    } catch (error: any) {
      console.error('Error batch saving answers:', error);
      throw new Error(error.response?.data?.error || 'Failed to batch save answers');
    }
  }

  /**
   * Resume an existing active session or start a new one
   */
  async resumeOrStartSession(examId: string, examType: 'mock' | 'previous'): Promise<ExamSession> {
    try {
      // Try to get existing active sessions first
      const sessions = await this.getUserExamSessions({ 
        status: 'active', 
        examType 
      });
      
      const existingSession = sessions.find(s => s.examId === examId);
      
      if (existingSession) {
        return existingSession;
      }
      
      // No active session found, start a new one
      return await this.startExamSession(examId, examType);
    } catch (error: any) {
      console.error('Error resuming or starting session:', error);
      throw new Error(error.response?.data?.error || 'Failed to resume or start session');
    }
  }

  /**
   * Auto-save functionality with debouncing
   */
  private autoSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  debouncedSaveAnswer(sessionId: string, questionId: string, alternativeId: string, delay = 1000): void {
    const key = `${sessionId}-${questionId}`;
    
    // Clear existing timeout
    const existingTimeout = this.autoSaveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await this.saveAnswer(sessionId, questionId, alternativeId);
        this.autoSaveTimeouts.delete(key);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    this.autoSaveTimeouts.set(key, timeout);
  }

  /**
   * Auto-save time updates (every 30 seconds)
   */
  private timeUpdateInterval: NodeJS.Timeout | null = null;

  startTimeTracking(sessionId: string, intervalMs = 30000): void {
    this.stopTimeTracking(); // Clear any existing interval

    let startTime = Date.now();
    
    this.timeUpdateInterval = setInterval(async () => {
      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        await this.updateTimeSpent(sessionId, timeSpent);
      } catch (error) {
        console.error('Time update failed:', error);
      }
    }, intervalMs);
  }

  stopTimeTracking(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(answers: Record<string, string>, totalQuestions: number): number {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / totalQuestions) * 100);
  }

  /**
   * Get score color based on percentage
   */
  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get score background color
   */
  getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  /**
   * Get performance badge text
   */
  getPerformanceBadge(score: number): string {
    if (score >= 80) return 'EXCELENTE';
    if (score >= 60) return 'BOM';
    return 'REGULAR';
  }
}

// Export singleton instance
export const examService = new ExamService();