import api from './api';

// Types
export type MockExamType = 'AUTOMATIC' | 'MANUAL' | 'RANDOM';
export type DifficultyLevel = 'RECRUTA' | 'CABO' | 'SARGENTO' | 'MIXED';
export type ExamStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface MockExam {
  id: string;
  title: string;
  description: string;
  type: MockExamType;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  total_questions: number;
  questions?: string[]; // Question IDs (for MANUAL type)
  filters?: {
    subjects?: string[];
    topics?: string[];
    exam_boards?: string[];
    years?: number[];
  }; // For AUTOMATIC type
  passing_score: number; // percentage
  max_attempts: number;
  available_from?: string;
  available_until?: string;
  status: ExamStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Statistics
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  pass_rate: number;

  // Student specific fields
  user_attempts?: number;
  can_take_exam?: boolean;
  has_in_progress?: boolean;
  in_progress_attempt_id?: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  questions: string[];
  answers: Record<string, any>;
  started_at: string;
  submitted_at?: string;
  time_spent: number; // seconds
  score: number; // percentage
  correct_answers: number;
  wrong_answers: number;
  blank_answers: number;
  status: AttemptStatus;
  review?: {
    question_id: string;
    is_correct: boolean;
    user_answer: any;
    correct_answer: any;
    explanation?: string;
  }[];

  // Additional fields from API response
  exam_title?: string;
  exam_difficulty?: DifficultyLevel;
  exam_passing_score?: number;
  passed?: boolean;
}

export interface Question {
  id: string;
  title: string;
  type: string;
  subject: string;
  topic?: string;
  difficulty: string;
  options?: string[];
  correct_answer?: number;
  correct_boolean?: boolean;
  expected_answer?: string;
  explanation?: string;
  exam_board?: string;
  exam_year?: string;
  exam_name?: string;
  reference?: string;
  tags: string[];
}

export interface MockExamCreateData {
  title: string;
  description: string;
  type: MockExamType;
  difficulty: DifficultyLevel;
  duration: number;
  total_questions: number;
  questions?: string[];
  filters?: {
    subjects?: string[];
    topics?: string[];
    exam_boards?: string[];
    years?: number[];
  };
  passing_score: number;
  max_attempts: number;
  available_from?: string;
  available_until?: string;
  status?: ExamStatus;
}

export interface ExamStatistics {
  exam: MockExam;
  statistics: {
    total_attempts: number;
    completed_attempts: number;
    in_progress_attempts: number;
    abandoned_attempts: number;
    average_score: number;
    pass_rate: number;
    average_time_minutes: number;
    score_distribution: {
      '0-20': number;
      '20-40': number;
      '40-60': number;
      '60-80': number;
      '80-100': number;
    };
  };
}

export interface PerformanceReport {
  overall: {
    total_exams: number;
    published_exams: number;
    total_attempts: number;
    completed_attempts: number;
    overall_average_score: number;
    overall_pass_rate: number;
  };
  top_exams: Array<{
    id: string;
    title: string;
    attempts: number;
    average_score: number;
    pass_rate: number;
  }>;
  all_exams: Array<{
    id: string;
    title: string;
    attempts: number;
    average_score: number;
    pass_rate: number;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class MockExamService {
  private baseUrl = '/mockexams';

  // Mock Exam Management (Admin)
  async getAllMockExams(params: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    type?: string;
    status?: string;
    created_by?: string;
  } = {}): Promise<PaginatedResponse<MockExam>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}?${searchParams.toString()}`);
    return response.data;
  }

  async getMockExam(id: string): Promise<ApiResponse<MockExam>> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createMockExam(data: MockExamCreateData): Promise<ApiResponse<MockExam>> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateMockExam(id: string, data: Partial<MockExamCreateData>): Promise<ApiResponse<MockExam>> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteMockExam(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async publishMockExam(id: string): Promise<ApiResponse<MockExam>> {
    const response = await api.post(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  async archiveMockExam(id: string): Promise<ApiResponse<MockExam>> {
    const response = await api.post(`${this.baseUrl}/${id}/archive`);
    return response.data;
  }

  async duplicateMockExam(id: string): Promise<ApiResponse<MockExam>> {
    const response = await api.post(`${this.baseUrl}/${id}/duplicate`);
    return response.data;
  }

  async previewMockExam(id: string): Promise<ApiResponse<{ exam: MockExam; questions: Question[] }>> {
    const response = await api.get(`${this.baseUrl}/${id}/preview`);
    return response.data;
  }

  // Student Exam Taking
  async getAvailableExams(): Promise<ApiResponse<MockExam[]>> {
    const response = await api.get(`${this.baseUrl}/available`);
    return response.data;
  }

  async startExam(examId: string): Promise<ApiResponse<{
    attempt_id: string;
    exam_title: string;
    duration_minutes: number;
    total_questions: number;
    started_at: string;
  }>> {
    const response = await api.post(`${this.baseUrl}/${examId}/start`);
    return response.data;
  }

  async getExamAttempt(attemptId: string): Promise<ApiResponse<{
    attempt: ExamAttempt;
    exam: MockExam;
    questions: Question[];
  }>> {
    const response = await api.get(`${this.baseUrl}/attempts/${attemptId}`);
    return response.data;
  }

  async saveAnswer(attemptId: string, questionId: string, answer: any): Promise<ApiResponse<void>> {
    const response = await api.post(`${this.baseUrl}/attempts/${attemptId}/answer`, {
      question_id: questionId,
      answer: answer
    });
    return response.data;
  }

  async submitExam(attemptId: string, timeSpent: number): Promise<ApiResponse<{
    attempt_id: string;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    blank_answers: number;
    passed: boolean;
    passing_score: number;
    time_spent: number;
  }>> {
    const response = await api.post(`${this.baseUrl}/attempts/${attemptId}/submit`, {
      time_spent: timeSpent
    });
    return response.data;
  }

  async getExamResults(attemptId: string): Promise<ApiResponse<{
    attempt: ExamAttempt;
    exam: MockExam;
    questions: Question[];
    passed: boolean;
  }>> {
    const response = await api.get(`${this.baseUrl}/attempts/${attemptId}/results`);
    return response.data;
  }

  async getMyAttempts(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<ExamAttempt>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}/my-attempts?${searchParams.toString()}`);
    return response.data;
  }

  // Statistics and Reports (Admin)
  async getExamStatistics(examId: string): Promise<ApiResponse<ExamStatistics>> {
    const response = await api.get(`${this.baseUrl}/${examId}/statistics`);
    return response.data;
  }

  async getPerformanceReport(): Promise<ApiResponse<PerformanceReport>> {
    const response = await api.get(`${this.baseUrl}/reports/performance`);
    return response.data;
  }

  // Utility methods
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  formatScore(score: number): string {
    return `${score.toFixed(1)}%`;
  }

  getDifficultyLabel(difficulty: DifficultyLevel): string {
    const labels: Record<DifficultyLevel, string> = {
      'RECRUTA': 'Recruta',
      'CABO': 'Cabo',
      'SARGENTO': 'Sargento',
      'MIXED': 'Misto'
    };
    return labels[difficulty];
  }

  getDifficultyColor(difficulty: DifficultyLevel): string {
    const colors: Record<DifficultyLevel, string> = {
      'RECRUTA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CABO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'SARGENTO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'MIXED': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[difficulty];
  }

  getStatusLabel(status: ExamStatus): string {
    const labels: Record<ExamStatus, string> = {
      'draft': 'Rascunho',
      'published': 'Publicado',
      'archived': 'Arquivado'
    };
    return labels[status];
  }

  getStatusColor(status: ExamStatus): string {
    const colors: Record<ExamStatus, string> = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'archived': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[status];
  }

  getTypeLabel(type: MockExamType): string {
    const labels: Record<MockExamType, string> = {
      'AUTOMATIC': 'Automático',
      'MANUAL': 'Manual',
      'RANDOM': 'Aleatório'
    };
    return labels[type];
  }

  getAttemptStatusLabel(status: AttemptStatus): string {
    const labels: Record<AttemptStatus, string> = {
      'in_progress': 'Em Andamento',
      'completed': 'Finalizado',
      'abandoned': 'Abandonado'
    };
    return labels[status];
  }

  getAttemptStatusColor(status: AttemptStatus): string {
    const colors: Record<AttemptStatus, string> = {
      'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'abandoned': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status];
  }

  isExamAvailable(exam: MockExam): boolean {
    const now = new Date();
    const availableFrom = exam.available_from ? new Date(exam.available_from) : null;
    const availableUntil = exam.available_until ? new Date(exam.available_until) : null;
    
    return (!availableFrom || availableFrom <= now) && 
           (!availableUntil || availableUntil >= now);
  }

  calculateTimeLeft(exam: MockExam): string | null {
    if (!exam.available_until) return null;
    
    const now = new Date();
    const endDate = new Date(exam.available_until);
    const diffMs = endDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expirado';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}min ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}

export const mockExamService = new MockExamService();
export default mockExamService;