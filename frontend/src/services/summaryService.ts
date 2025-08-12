import { API_BASE_URL } from '@/config/api';

// Types
export type SummaryType = 'text' | 'outline' | 'mindmap' | 'flashcards' | 'checklist';
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';
export type SummaryStatus = 'draft' | 'published' | 'archived';
export type VisibilityLevel = 'private' | 'shared' | 'public';

export interface Summary {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  content: string;
  summary_type: SummaryType;
  difficulty: DifficultyLevel;
  estimated_reading_time: number;
  tags: string[];
  sections?: SummarySection[];
  references?: SummaryReference[];
  visibility: VisibilityLevel;
  statistics?: SummaryStatistics;
  status: SummaryStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface SummarySection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface SummaryReference {
  title: string;
  url?: string;
  author?: string;
  date?: string;
  type: 'book' | 'article' | 'law' | 'jurisprudence' | 'other';
}

export interface SummaryStatistics {
  views: number;
  likes: number;
  shares: number;
  study_sessions: number;
  average_rating: number;
  total_ratings: number;
}

export interface SummaryStudySession {
  id: string;
  summary_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  time_spent: number;
  completion_percentage: number;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface SummaryCollection {
  id: string;
  name: string;
  description?: string;
  summary_ids: string[];
  visibility: VisibilityLevel;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSummaryData {
  title: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  content: string;
  summary_type: SummaryType;
  difficulty: DifficultyLevel;
  tags: string[];
  sections?: Omit<SummarySection, 'id'>[];
  references?: SummaryReference[];
  visibility: VisibilityLevel;
}

export interface UpdateSummaryData extends Partial<CreateSummaryData> {
  id: string;
}

export interface SummaryListResponse {
  summaries: Summary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingleSummaryResponse {
  summary: Summary;
}

export interface SummarySearchFilters {
  q?: string;
  subject?: string;
  topic?: string;
  summary_type?: SummaryType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  visibility?: VisibilityLevel;
  status?: SummaryStatus;
  created_by?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

class SummaryService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Admin/Creator Methods
  async getAll(filters: SummarySearchFilters = {}): Promise<SummaryListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/summaries?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  async getById(id: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async create(data: CreateSummaryData): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async update(id: string, data: Partial<CreateSummaryData>): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async publish(id: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/publish`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async archive(id: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/archive`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async duplicate(id: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async preview(id: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/preview`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  // Content Management
  async addSection(id: string, section: Omit<SummarySection, 'id'>): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/sections`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(section)
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async updateSection(id: string, sectionId: string, section: Partial<SummarySection>): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/sections/${sectionId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(section)
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async removeSection(id: string, sectionId: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/sections/${sectionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async addReference(id: string, reference: SummaryReference): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/references`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reference)
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  async removeReference(id: string, refId: string): Promise<SingleSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/references/${refId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SingleSummaryResponse>(response);
  }

  // Student Methods
  async getAvailable(filters: SummarySearchFilters = {}): Promise<SummaryListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/available?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  async startStudySession(summaryId: string): Promise<{ session: SummaryStudySession }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${summaryId}/study-session`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ session: SummaryStudySession }>(response);
  }

  async updateStudySession(sessionId: string, data: { 
    completion_percentage?: number; 
    notes?: string; 
    time_spent?: number; 
  }): Promise<{ session: SummaryStudySession }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/study-sessions/${sessionId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ session: SummaryStudySession }>(response);
  }

  async completeStudySession(sessionId: string, data: {
    completion_percentage: number;
    time_spent: number;
    notes?: string;
    rating?: number;
    feedback?: string;
  }): Promise<{ session: SummaryStudySession }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/study-sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ session: SummaryStudySession }>(response);
  }

  async getMyStudySessions(): Promise<{ sessions: SummaryStudySession[] }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/my-sessions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ sessions: SummaryStudySession[] }>(response);
  }

  async rateSummary(id: string, rating: number, feedback?: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/rate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rating, feedback })
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async likeSummary(id: string): Promise<{ message: string; liked: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string; liked: boolean }>(response);
  }

  // Search & Discovery
  async search(filters: SummarySearchFilters): Promise<SummaryListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/search?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  async getSubjects(): Promise<{ subjects: string[] }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/subjects`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ subjects: string[] }>(response);
  }

  async getPopular(limit = 10): Promise<SummaryListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/popular?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  async getRecent(limit = 10): Promise<SummaryListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/recent?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  async getRecommended(limit = 10): Promise<SummaryListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/recommended?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<SummaryListResponse>(response);
  }

  // Collections
  async getCollections(): Promise<{ collections: SummaryCollection[] }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/collections`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ collections: SummaryCollection[] }>(response);
  }

  async createCollection(data: { 
    name: string; 
    description?: string; 
    visibility: VisibilityLevel;
  }): Promise<{ collection: SummaryCollection }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/collections`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ collection: SummaryCollection }>(response);
  }

  async addToCollection(collectionId: string, summaryId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/collections/${collectionId}/summaries/${summaryId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async removeFromCollection(collectionId: string, summaryId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/collections/${collectionId}/summaries/${summaryId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Statistics
  async getStatistics(id: string): Promise<{
    statistics: SummaryStatistics;
    study_sessions: SummaryStudySession[];
    ratings: Array<{ rating: number; feedback?: string; created_at: string }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/${id}/statistics`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{
      statistics: SummaryStatistics;
      study_sessions: SummaryStudySession[];
      ratings: Array<{ rating: number; feedback?: string; created_at: string }>;
    }>(response);
  }

  async getUsageReport(): Promise<{
    total_summaries: number;
    total_study_sessions: number;
    total_time_spent: number;
    most_viewed: Summary[];
    most_liked: Summary[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/summaries/reports/usage`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{
      total_summaries: number;
      total_study_sessions: number;
      total_time_spent: number;
      most_viewed: Summary[];
      most_liked: Summary[];
    }>(response);
  }
}

// Utility functions
export const summaryUtils = {
  // Format reading time
  formatReadingTime: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min` 
      : `${hours}h`;
  },

  // Get type label
  getTypeLabel: (type: SummaryType): string => {
    const labels: Record<SummaryType, string> = {
      text: 'Texto',
      outline: 'Esquema', 
      mindmap: 'Mapa Mental',
      flashcards: 'Flashcards',
      checklist: 'Checklist'
    };
    return labels[type] || type;
  },

  // Get difficulty label
  getDifficultyLabel: (difficulty: DifficultyLevel): string => {
    const labels: Record<DifficultyLevel, string> = {
      basic: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    };
    return labels[difficulty] || difficulty;
  },

  // Get status label
  getStatusLabel: (status: SummaryStatus): string => {
    const labels: Record<SummaryStatus, string> = {
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado'
    };
    return labels[status] || status;
  },

  // Get visibility label
  getVisibilityLabel: (visibility: VisibilityLevel): string => {
    const labels: Record<VisibilityLevel, string> = {
      private: 'Privado',
      shared: 'Compartilhado',
      public: 'Público'
    };
    return labels[visibility] || visibility;
  },

  // Get type color
  getTypeColor: (type: SummaryType): string => {
    const colors: Record<SummaryType, string> = {
      text: 'blue',
      outline: 'green',
      mindmap: 'purple',
      flashcards: 'orange',
      checklist: 'red'
    };
    return colors[type] || 'gray';
  },

  // Get difficulty color
  getDifficultyColor: (difficulty: DifficultyLevel): string => {
    const colors: Record<DifficultyLevel, string> = {
      basic: 'green',
      intermediate: 'yellow',
      advanced: 'red'
    };
    return colors[difficulty] || 'gray';
  },

  // Get status color
  getStatusColor: (status: SummaryStatus): string => {
    const colors: Record<SummaryStatus, string> = {
      draft: 'yellow',
      published: 'green',
      archived: 'gray'
    };
    return colors[status] || 'gray';
  },

  // Calculate study progress
  calculateProgress: (sessions: SummaryStudySession[]): {
    totalSessions: number;
    totalTimeSpent: number; // in minutes
    averageCompletion: number;
    lastStudied?: string;
  } => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageCompletion: 0
      };
    }

    const totalTimeSpent = sessions.reduce((sum, session) => sum + session.time_spent, 0) / 60; // Convert to minutes
    const averageCompletion = sessions.reduce((sum, session) => sum + session.completion_percentage, 0) / sessions.length;
    const lastStudied = sessions
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
      .started_at;

    return {
      totalSessions: sessions.length,
      totalTimeSpent: Math.round(totalTimeSpent),
      averageCompletion: Math.round(averageCompletion),
      lastStudied
    };
  },

  // Validate summary data
  validateSummary: (data: CreateSummaryData): string[] => {
    const errors: string[] = [];

    if (!data.title.trim()) errors.push('Título é obrigatório');
    if (!data.subject.trim()) errors.push('Matéria é obrigatória');
    if (!data.content.trim()) errors.push('Conteúdo é obrigatório');
    if (data.estimated_reading_time < 1) errors.push('Tempo de leitura deve ser maior que 0');
    if (data.tags.length === 0) errors.push('Pelo menos uma tag é obrigatória');

    return errors;
  }
};

export const summaryService = new SummaryService();
export default summaryService;