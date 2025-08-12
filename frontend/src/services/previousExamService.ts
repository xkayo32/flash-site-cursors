import { api } from '@/config/api';

// Types
export type ExamStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface PreviousExam {
  id: string;
  title: string;
  organization: string; // "Polícia Federal", "Polícia Civil", "Polícia Militar"
  exam_board: string; // "CESPE", "FCC", "VUNESP", "FGV"
  position: string; // "Agente", "Escrivão", "Delegado"
  year: number;
  application_date?: string;
  total_questions: number;
  duration?: number; // minutos
  description?: string;
  questions: string[]; // IDs das questões vinculadas
  subjects: string[]; // Matérias abordadas
  status: ExamStatus;
  difficulty_distribution?: {
    easy: number;
    medium: number;  
    hard: number;
  };
  metadata?: {
    source_document?: string;
    oficial_resolution?: string;
    pdf_url?: string;
  };
  statistics?: {
    total_attempts: number;
    average_score: number;
    approval_rate: number; // baseado em score >= 70%
  };
  created_by: string;
  created_at: string;
  updated_at: string;

  // Student specific fields (only present in student endpoints)
  user_stats?: {
    attempts_count: number;
    best_score: number | null;
    last_attempt: string | null;
    has_in_progress: boolean;
  };
}

export interface PreviousExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  questions: string[]; // IDs das questões na ordem apresentada
  answers: Record<string, any>; // questionId -> resposta
  started_at: string;
  submitted_at?: string;
  time_spent: number; // segundos
  score: number;
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

  // Exam info (only present in some responses)
  exam?: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
  };
}

export interface PaginatedResponse<T> {
  [key: string]: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface QuestionForAttempt {
  id: string;
  number: number;
  title: string;
  type: string;
  subject: string;
  topic: string;
  difficulty: string;
  options?: string[];
  items?: string[];
  blanks_count?: number;
  user_answer?: any;
}

export interface AttemptResponse {
  attempt: PreviousExamAttempt;
  exam: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
    duration?: number;
    description?: string;
  };
  questions: QuestionForAttempt[];
}

export interface ExamResults {
  attempt: {
    id: string;
    started_at: string;
    submitted_at?: string;
    time_spent: number;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    blank_answers: number;
  };
  exam: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
  };
  review: {
    question_number: number;
    question: {
      id: string;
      title: string;
      type: string;
      subject: string;
      topic: string;
      difficulty: string;
      options?: string[];
    } | null;
    review: {
      question_id: string;
      is_correct: boolean;
      user_answer: any;
      correct_answer: any;
      explanation?: string;
    };
  }[];
  statistics: {
    total_questions: number;
    accuracy: number;
    passed: boolean;
    by_subject: Record<string, {
      correct: number;
      total: number;
      percentage: number;
    }>;
  };
}

export interface ExamPreview {
  exam_info: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
    total_questions: number;
    duration?: number;
    subjects: string[];
  };
  questions: {
    id: string;
    title: string;
    type: string;
    subject: string;
    topic: string;
    difficulty: string;
    options?: string[];
    exam_board: string;
    exam_year: number;
  }[];
  summary: {
    total_questions: number;
    by_subject: Record<string, number>;
    by_difficulty: Record<string, number>;
    by_type: Record<string, number>;
  };
}

export interface ExamStatistics {
  exam_info: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
    total_questions: number;
    duration?: number;
  };
  general_stats: {
    total_attempts: number;
    average_score: number;
    approval_rate: number;
    completion_rate: number;
  };
  score_distribution: Record<string, number>;
  time_analysis: {
    average_time_minutes: number;
    fastest_completion_minutes: number;
    slowest_completion_minutes: number;
  };
}

export interface PerformanceReport {
  overview: {
    total_exams: number;
    published_exams: number;
    total_attempts: number;
    average_score: number;
    approval_rate: number;
    active_users: number;
  };
  by_organization: Record<string, {
    total_exams: number;
    total_attempts: number;
    average_score: number;
    approval_rate: number;
  }>;
  by_year: Record<string, {
    total_exams: number;
    total_attempts: number;
    average_score: number;
    approval_rate: number;
  }>;
}

export interface PopularExamsReport {
  popular_exams: {
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
    status: ExamStatus;
    total_questions: number;
    attempts_count: number;
    average_score: number;
    approval_rate: number;
    unique_users: number;
  }[];
  metadata: {
    total_published_exams: number;
    report_limit: number;
    generated_at: string;
  };
}

export interface DifficultyAnalysisReport {
  summary: {
    total_analyzed_exams: number;
    difficulty_distribution: Record<string, number>;
    hardest_exams: Array<{
      id: string;
      title: string;
      organization: string;
      exam_board: string;
      position: string;
      year: number;
      total_questions: number;
      attempts_count: number;
      average_score: number;
      approval_rate: number;
      difficulty_level: string;
      difficulty_score: number;
    }>;
    easiest_exams: Array<{
      id: string;
      title: string;
      organization: string;
      exam_board: string;
      position: string;
      year: number;
      total_questions: number;
      attempts_count: number;
      average_score: number;
      approval_rate: number;
      difficulty_level: string;
      difficulty_score: number;
    }>;
  };
  all_exams: Array<{
    id: string;
    title: string;
    organization: string;
    exam_board: string;
    position: string;
    year: number;
    total_questions: number;
    attempts_count: number;
    average_score: number;
    approval_rate: number;
    difficulty_level: string;
    difficulty_score: number;
  }>;
  metadata: {
    minimum_attempts_threshold: number;
    generated_at: string;
  };
}

// =========================
// ADMIN SERVICES
// =========================

export const previousExamService = {
  // Previous Exams Management (Admin)
  async getAll(params?: {
    search?: string;
    organization?: string;
    exam_board?: string;
    position?: string;
    year_from?: number;
    year_to?: number;
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PreviousExam>> {
    const response = await api.get('/previousexams', { params });
    return response.data;
  },

  async getById(id: string): Promise<PreviousExam> {
    const response = await api.get(`/previousexams/${id}`);
    return response.data;
  },

  async create(examData: Partial<PreviousExam>): Promise<PreviousExam> {
    const response = await api.post('/previousexams', examData);
    return response.data;
  },

  async update(id: string, examData: Partial<PreviousExam>): Promise<PreviousExam> {
    const response = await api.put(`/previousexams/${id}`, examData);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/previousexams/${id}`);
    return response.data;
  },

  async publish(id: string): Promise<PreviousExam> {
    const response = await api.post(`/previousexams/${id}/publish`);
    return response.data;
  },

  async archive(id: string): Promise<PreviousExam> {
    const response = await api.post(`/previousexams/${id}/archive`);
    return response.data;
  },

  async duplicate(id: string): Promise<PreviousExam> {
    const response = await api.post(`/previousexams/${id}/duplicate`);
    return response.data;
  },

  async getPreview(id: string): Promise<ExamPreview> {
    const response = await api.get(`/previousexams/${id}/preview`);
    return response.data;
  },

  async linkQuestion(id: string, questionId: string): Promise<{ message: string; exam: PreviousExam; question: any }> {
    const response = await api.post(`/previousexams/${id}/questions/${questionId}`);
    return response.data;
  },

  async unlinkQuestion(id: string, questionId: string): Promise<{ message: string; exam: PreviousExam }> {
    const response = await api.delete(`/previousexams/${id}/questions/${questionId}`);
    return response.data;
  },

  // Search & Filters
  async getOrganizations(): Promise<{ organizations: string[] }> {
    const response = await api.get('/previousexams/search/organizations');
    return response.data;
  },

  async getExamBoards(): Promise<{ exam_boards: string[] }> {
    const response = await api.get('/previousexams/search/exam-boards');
    return response.data;
  },

  async getPositions(): Promise<{ positions: string[] }> {
    const response = await api.get('/previousexams/search/positions');
    return response.data;
  },

  async search(params: {
    q?: string;
    organizations?: string;
    exam_boards?: string;
    positions?: string;
    years?: string;
    subjects?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PreviousExam> & {
    filters_applied: {
      query: string | null;
      organizations: string[];
      exam_boards: string[];
      positions: string[];
      years: number[];
      subjects: string[];
      status: string[];
    };
  }> {
    const response = await api.get('/previousexams/search', { params });
    return response.data;
  },

  // Statistics & Reports
  async getExamStatistics(id: string): Promise<ExamStatistics> {
    const response = await api.get(`/previousexams/${id}/statistics`);
    return response.data;
  },

  async getPerformanceReport(): Promise<PerformanceReport> {
    const response = await api.get('/previousexams/reports/performance');
    return response.data;
  },

  async getPopularExams(limit?: number): Promise<PopularExamsReport> {
    const response = await api.get('/previousexams/reports/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  async getDifficultyAnalysis(): Promise<DifficultyAnalysisReport> {
    const response = await api.get('/previousexams/reports/difficulty');
    return response.data;
  }
};

// =========================
// STUDENT SERVICES
// =========================

export const studentPreviousExamService = {
  // Student Access
  async getAvailable(params?: {
    search?: string;
    organization?: string;
    exam_board?: string;
    position?: string;
    year_from?: number;
    year_to?: number;
    subject?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PreviousExam>> {
    const response = await api.get('/api/v1/previousexams', { params });
    return response.data;
  },

  async startExam(id: string): Promise<{
    message: string;
    attempt: PreviousExamAttempt;
    exam_info: {
      title: string;
      organization: string;
      position: string;
      year: number;
      duration?: number;
      total_questions: number;
    };
  }> {
    const response = await api.post(`/previousexams/${id}/start`);
    return response.data;
  },

  async getAttempt(attemptId: string): Promise<AttemptResponse> {
    const response = await api.get(`/previousexams/attempts/${attemptId}`);
    return response.data;
  },

  async saveAnswer(attemptId: string, questionId: string, answer: any): Promise<{
    message: string;
    question_id: string;
    answer: any;
  }> {
    const response = await api.post(`/previousexams/attempts/${attemptId}/answer`, {
      question_id: questionId,
      answer
    });
    return response.data;
  },

  async submitExam(attemptId: string, timeSpent: number): Promise<{
    message: string;
    result: {
      attempt_id: string;
      score: number;
      correct_answers: number;
      wrong_answers: number;
      blank_answers: number;
      total_questions: number;
      time_spent: number;
      submitted_at: string;
      passed: boolean;
    };
  }> {
    const response = await api.post(`/previousexams/attempts/${attemptId}/submit`, {
      time_spent: timeSpent
    });
    return response.data;
  },

  async getResults(attemptId: string): Promise<ExamResults> {
    const response = await api.get(`/previousexams/attempts/${attemptId}/results`);
    return response.data;
  },

  async getMyAttempts(params?: {
    status?: string;
    exam_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PreviousExamAttempt>> {
    const response = await api.get('/previousexams/my-attempts', { params });
    return response.data;
  }
};

// =========================
// UTILITY FUNCTIONS
// =========================

export const previousExamUtils = {
  formatDuration(minutes?: number): string {
    if (!minutes) return 'Não especificado';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutos`;
    } else if (mins === 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${mins}min`;
    }
  },

  formatScore(score: number): string {
    return `${score.toFixed(1)}%`;
  },

  formatApprovalRate(rate: number): string {
    return `${rate.toFixed(1)}%`;
  },

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  },

  getDifficultyColor(approvalRate: number): string {
    if (approvalRate >= 80) return 'text-green-600'; // Muito Fácil
    if (approvalRate >= 60) return 'text-blue-600';  // Fácil
    if (approvalRate >= 40) return 'text-yellow-600'; // Médio
    if (approvalRate >= 20) return 'text-orange-600'; // Difícil
    return 'text-red-600'; // Muito Difícil
  },

  getDifficultyLabel(approvalRate: number): string {
    if (approvalRate >= 80) return 'Muito Fácil';
    if (approvalRate >= 60) return 'Fácil';
    if (approvalRate >= 40) return 'Médio';
    if (approvalRate >= 20) return 'Difícil';
    return 'Muito Difícil';
  },

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  getStatusBadgeColor(status: ExamStatus): string {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  getStatusLabel(status: ExamStatus): string {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'published': return 'Publicado';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  },

  getAttemptStatusColor(status: AttemptStatus): string {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  getAttemptStatusLabel(status: AttemptStatus): string {
    switch (status) {
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'abandoned': return 'Abandonada';
      default: return status;
    }
  }
};

export default previousExamService;