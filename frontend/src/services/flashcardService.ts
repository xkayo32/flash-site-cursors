import { API_BASE_URL } from '../config/api';

// Flashcard types and interfaces matching backend
export type FlashcardType = 'basic' | 'basic_reversed' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer' | 'image_occlusion';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type FlashcardStatus = 'draft' | 'published' | 'archived';

export interface OcclusionArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  answer: string;
  shape: 'rectangle' | 'circle';
}

export interface Flashcard {
  id: string;
  type: FlashcardType;
  difficulty: DifficultyLevel;
  category: string;
  subcategory?: string;
  tags: string[];
  status: FlashcardStatus;
  
  // Basic types (basic, basic_reversed)
  front?: string;
  back?: string;
  extra?: string; // For basic_reversed additional info
  
  // Cloze deletion
  text?: string; // Text with {{c1::word}} format
  
  // Multiple choice
  question?: string;
  options?: string[];
  correct?: number; // Index of correct answer
  explanation?: string;
  
  // True/False
  statement?: string;
  answer?: string; // 'true' or 'false'
  
  // Type answer
  hint?: string;
  
  // Image occlusion
  image?: string; // Image URL or path
  occlusionAreas?: OcclusionArea[];
  
  // Study statistics
  times_studied: number;
  times_correct: number;
  correct_rate: number;
  ease_factor: number; // For spaced repetition (SM-2 algorithm)
  interval: number; // Days until next review
  next_review: string; // ISO date string
  
  // Audit
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFlashcardData {
  type: FlashcardType;
  difficulty: DifficultyLevel;
  category: string;
  subcategory?: string;
  tags?: string[];
  status?: FlashcardStatus;
  
  // Type-specific fields
  front?: string;
  back?: string;
  extra?: string;
  text?: string;
  question?: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  statement?: string;
  answer?: string;
  hint?: string;
  image?: string;
  occlusionAreas?: OcclusionArea[];
}

export interface UpdateFlashcardData extends Partial<CreateFlashcardData> {}

export interface FlashcardFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  difficulty?: DifficultyLevel;
  type?: FlashcardType;
  status?: FlashcardStatus;
  author_id?: string;
  due_only?: boolean; // For study sessions
}

export interface FlashcardResponse {
  success: boolean;
  data: Flashcard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: FlashcardFilters;
}

export interface SingleFlashcardResponse {
  success: boolean;
  data: Flashcard;
}

export interface FlashcardStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  byCategory: { [key: string]: number };
  byDifficulty: { [key: string]: number };
  byType: { [key: string]: number };
  avgCorrectRate: number;
  totalStudies: number;
  flashcardsWithStats: number;
  dueForReview: number;
}

export interface FlashcardStatsResponse {
  success: boolean;
  data: FlashcardStats;
}

export interface FilterOptions {
  categories: string[];
  subcategories: string[];
  authors: { id: string; name: string }[];
  difficulties: DifficultyLevel[];
  types: FlashcardType[];
  statuses: FlashcardStatus[];
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

export interface StudySessionResponse {
  success: boolean;
  message: string;
  data: {
    flashcard_id: string;
    times_studied: number;
    correct_rate: number;
    ease_factor: number;
    interval: number;
    next_review: string;
  };
}

class FlashcardService {
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

  // List flashcards with filters and pagination
  async getFlashcards(filters: FlashcardFilters = {}): Promise<FlashcardResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/api/v1/flashcards${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<FlashcardResponse>(response);
  }

  // Get single flashcard by ID
  async getFlashcard(id: string): Promise<SingleFlashcardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleFlashcardResponse>(response);
  }

  // Create new flashcard (admin only)
  async createFlashcard(data: CreateFlashcardData): Promise<SingleFlashcardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleFlashcardResponse>(response);
  }

  // Update existing flashcard (admin only)
  async updateFlashcard(id: string, data: UpdateFlashcardData): Promise<SingleFlashcardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleFlashcardResponse>(response);
  }

  // Delete flashcard (admin only)
  async deleteFlashcard(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Get flashcard statistics (admin only)
  async getStats(): Promise<FlashcardStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<FlashcardStatsResponse>(response);
  }

  // Get filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/filters`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<FilterOptionsResponse>(response);
  }

  // Record study session for statistics and SM-2 algorithm
  async recordStudySession(flashcardId: string, isCorrect: boolean, quality: number = 3): Promise<StudySessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/${flashcardId}/study`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_correct: isCorrect, quality })
    });

    return this.handleResponse<StudySessionResponse>(response);
  }

  // Bulk import flashcards (admin only)
  async bulkImport(flashcards: CreateFlashcardData[]): Promise<BulkImportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcards/bulk-import`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ flashcards })
    });

    return this.handleResponse<BulkImportResponse>(response);
  }

  // Helper method to get unique categories for filtering
  async getCategories(): Promise<string[]> {
    const filterOptions = await this.getFilterOptions();
    return filterOptions.data.categories;
  }

  // Helper method to get unique subcategories for filtering
  async getSubcategories(): Promise<string[]> {
    const filterOptions = await this.getFilterOptions();
    return filterOptions.data.subcategories;
  }

  // Search flashcards by text
  async searchFlashcards(searchTerm: string, filters: Omit<FlashcardFilters, 'search'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      search: searchTerm
    });
  }

  // Get flashcards by category
  async getFlashcardsByCategory(category: string, filters: Omit<FlashcardFilters, 'category'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      category
    });
  }

  // Get flashcards by type
  async getFlashcardsByType(type: FlashcardType, filters: Omit<FlashcardFilters, 'type'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      type
    });
  }

  // Get flashcards by difficulty
  async getFlashcardsByDifficulty(difficulty: DifficultyLevel, filters: Omit<FlashcardFilters, 'difficulty'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      difficulty
    });
  }

  // Get published flashcards only (for students)
  async getPublishedFlashcards(filters: Omit<FlashcardFilters, 'status'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      status: 'published'
    });
  }

  // Get flashcards due for review (study mode)
  async getDueFlashcards(filters: Omit<FlashcardFilters, 'due_only'> = {}): Promise<FlashcardResponse> {
    return this.getFlashcards({
      ...filters,
      status: 'published',
      due_only: true
    });
  }

  // Get flashcards for study session
  async getStudySession(category?: string, difficulty?: DifficultyLevel, limit: number = 20): Promise<FlashcardResponse> {
    return this.getFlashcards({
      category,
      difficulty,
      status: 'published',
      due_only: true,
      limit,
      page: 1
    });
  }

  // Helper method to parse cloze deletions
  static parseClozeText(text: string): { text: string; clozes: string[] } {
    const clozeRegex = /{{c\d+::(.*?)}}/g;
    const clozes: string[] = [];
    let match;
    
    while ((match = clozeRegex.exec(text)) !== null) {
      clozes.push(match[1]);
    }
    
    const parsedText = text.replace(clozeRegex, '_____');
    
    return { text: parsedText, clozes };
  }

  // Helper method to validate flashcard data
  static validateFlashcardData(type: FlashcardType, data: CreateFlashcardData): string[] {
    const errors: string[] = [];

    if (!data.category) errors.push('Categoria é obrigatória');
    if (!data.difficulty) errors.push('Dificuldade é obrigatória');

    switch (type) {
      case 'basic':
      case 'basic_reversed':
        if (!data.front) errors.push('Campo "Frente" é obrigatório');
        if (!data.back) errors.push('Campo "Verso" é obrigatório');
        break;

      case 'cloze':
        if (!data.text) errors.push('Texto com lacunas é obrigatório');
        if (data.text && !data.text.includes('{{c')) {
          errors.push('Texto deve conter lacunas no formato {{c1::palavra}}');
        }
        break;

      case 'multiple_choice':
        if (!data.question) errors.push('Pergunta é obrigatória');
        if (!data.options || data.options.length < 2) {
          errors.push('Pelo menos 2 opções são obrigatórias');
        }
        if (data.correct === undefined || data.correct < 0) {
          errors.push('Resposta correta deve ser selecionada');
        }
        break;

      case 'true_false':
        if (!data.statement) errors.push('Afirmação é obrigatória');
        if (!data.answer) errors.push('Resposta (verdadeiro/falso) é obrigatória');
        break;

      case 'type_answer':
        if (!data.question) errors.push('Pergunta é obrigatória');
        if (!data.answer) errors.push('Resposta é obrigatória');
        break;

      case 'image_occlusion':
        if (!data.image) errors.push('Imagem é obrigatória');
        if (!data.occlusionAreas || data.occlusionAreas.length === 0) {
          errors.push('Pelo menos uma área de oclusão é obrigatória');
        }
        break;
    }

    return errors;
  }
}

// Export singleton instance
export const flashcardService = new FlashcardService();
export default flashcardService;