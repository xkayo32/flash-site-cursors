import { API_BASE_URL } from '../config/api';

// Question types and interfaces matching backend
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'draft' | 'published' | 'archived';

export interface Question {
  id: string;
  title: string; // Enunciado da questão
  type: QuestionType;
  subject: string; // Matéria (ex: "Direito Constitucional")
  topic?: string; // Tópico específico (ex: "Princípios Fundamentais")
  category_id?: string; // Link para categoria existente
  difficulty: DifficultyLevel;
  
  // Multiple choice specific
  options?: string[]; // Para múltipla escolha
  correct_answer?: number; // Índice da resposta correta (múltipla escolha)
  
  // True/False specific
  correct_boolean?: boolean; // Para verdadeiro/falso
  
  // Essay/Fill blank specific
  expected_answer?: string; // Resposta esperada para dissertativas
  
  explanation?: string; // Explicação da resposta
  
  // Metadata
  exam_board?: string; // Banca (CESPE, FCC, etc.)
  exam_year?: string; // Ano da prova
  exam_name?: string; // Nome do concurso
  reference?: string; // Referência legal/bibliográfica
  
  tags: string[]; // Tags para busca
  status: QuestionStatus;
  
  // Statistics
  times_answered: number;
  times_correct: number;
  correct_rate: number; // Calculado: times_correct / times_answered
  
  // Audit
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionData {
  title: string;
  type: QuestionType;
  subject: string;
  topic?: string;
  category_id?: string;
  difficulty: DifficultyLevel;
  options?: string[];
  correct_answer?: number;
  correct_boolean?: boolean;
  expected_answer?: string;
  explanation?: string;
  exam_board?: string;
  exam_year?: string;
  exam_name?: string;
  reference?: string;
  tags?: string[];
  status?: QuestionStatus;
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  status?: QuestionStatus;
  exam_board?: string;
  author_id?: string;
}

export interface QuestionResponse {
  success: boolean;
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: QuestionFilters;
}

export interface SingleQuestionResponse {
  success: boolean;
  data: Question;
}

export interface QuestionStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  bySubject: { [key: string]: number };
  byDifficulty: { [key: string]: number };
  byType: { [key: string]: number };
  avgCorrectRate: number;
  totalAnswers: number;
  questionsWithStats: number;
}

export interface QuestionStatsResponse {
  success: boolean;
  data: QuestionStats;
}

export interface FilterOptions {
  subjects: string[];
  topics: string[];
  examBoards: string[];
  authors: { id: string; name: string }[];
  difficulties: DifficultyLevel[];
  types: QuestionType[];
  statuses: QuestionStatus[];
}

export interface FilterOptionsResponse {
  success: boolean;
  data: FilterOptions;
}

export interface BulkImportResult {
  success: number;
  errors: { index: number; error: string }[];
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  data: BulkImportResult;
}

export interface AnswerRecordResponse {
  success: boolean;
  message: string;
  data: {
    question_id: string;
    times_answered: number;
    correct_rate: number;
  };
}

class QuestionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // List questions with filters and pagination
  async getQuestions(filters: QuestionFilters = {}): Promise<QuestionResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/api/v1/questions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<QuestionResponse>(response);
  }

  // Get single question by ID
  async getQuestion(id: string): Promise<SingleQuestionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleQuestionResponse>(response);
  }

  // Create new question (admin only)
  async createQuestion(data: CreateQuestionData): Promise<SingleQuestionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleQuestionResponse>(response);
  }

  // Update existing question (admin only)
  async updateQuestion(id: string, data: UpdateQuestionData): Promise<SingleQuestionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleQuestionResponse>(response);
  }

  // Delete question (admin only)
  async deleteQuestion(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Get question statistics (admin only)
  async getStats(): Promise<QuestionStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<QuestionStatsResponse>(response);
  }

  // Get filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/filters`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<FilterOptionsResponse>(response);
  }

  // Record answer for statistics
  async recordAnswer(questionId: string, isCorrect: boolean): Promise<AnswerRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${questionId}/answer`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_correct: isCorrect })
    });

    return this.handleResponse<AnswerRecordResponse>(response);
  }

  // Bulk import questions (admin only)
  async bulkImport(questions: CreateQuestionData[]): Promise<BulkImportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questions/bulk-import`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ questions })
    });

    return this.handleResponse<BulkImportResponse>(response);
  }

  // Helper method to get unique subjects for filtering
  async getSubjects(): Promise<string[]> {
    const filterOptions = await this.getFilterOptions();
    return filterOptions.data.subjects;
  }

  // Helper method to get unique topics for filtering
  async getTopics(): Promise<string[]> {
    const filterOptions = await this.getFilterOptions();
    return filterOptions.data.topics;
  }

  // Helper method to get unique exam boards for filtering
  async getExamBoards(): Promise<string[]> {
    const filterOptions = await this.getFilterOptions();
    return filterOptions.data.examBoards;
  }

  // Search questions by text
  async searchQuestions(searchTerm: string, filters: Omit<QuestionFilters, 'search'> = {}): Promise<QuestionResponse> {
    return this.getQuestions({
      ...filters,
      search: searchTerm
    });
  }

  // Get questions by subject
  async getQuestionsBySubject(subject: string, filters: Omit<QuestionFilters, 'subject'> = {}): Promise<QuestionResponse> {
    return this.getQuestions({
      ...filters,
      subject
    });
  }

  // Get questions by type
  async getQuestionsByType(type: QuestionType, filters: Omit<QuestionFilters, 'type'> = {}): Promise<QuestionResponse> {
    return this.getQuestions({
      ...filters,
      type
    });
  }

  // Get questions by difficulty
  async getQuestionsByDifficulty(difficulty: DifficultyLevel, filters: Omit<QuestionFilters, 'difficulty'> = {}): Promise<QuestionResponse> {
    return this.getQuestions({
      ...filters,
      difficulty
    });
  }

  // Get published questions only (for students)
  async getPublishedQuestions(filters: Omit<QuestionFilters, 'status'> = {}): Promise<QuestionResponse> {
    return this.getQuestions({
      ...filters,
      status: 'published'
    });
  }

  // Get questions for practice/exams
  async getQuestionsForPractice(subject?: string, difficulty?: DifficultyLevel, limit: number = 20): Promise<QuestionResponse> {
    return this.getQuestions({
      subject,
      difficulty,
      status: 'published',
      limit,
      page: 1
    });
  }
}

// Export singleton instance
export const questionService = new QuestionService();
export default questionService;