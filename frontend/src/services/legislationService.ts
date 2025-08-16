import api from './api';

// Type definitions
export type LegislationType = 'constitution' | 'law' | 'decree' | 'ordinance' | 'normative' | 'resolution';
export type LegislationStatus = 'active' | 'revoked' | 'superseded';

export interface LegislationDocument {
  id: string;
  title: string;
  type: LegislationType;
  number?: string; // Lei 12.965/14
  year: number;
  subject_area: string; // 'Direito Penal', 'Direito Civil', etc.
  description: string;
  full_text: string; // Texto completo da lei
  articles: LegislationArticle[];
  keywords: string[];
  related_laws?: string[]; // IDs de outras leis relacionadas
  status: LegislationStatus;
  publication_date: string;
  effective_date?: string;
  revocation_date?: string;
  source_url?: string;
  summary?: string; // Resumo executivo
  key_changes?: string[]; // Principais mudanças se for atualização
  affected_groups?: string[]; // Quem é afetado pela lei
  penalties?: string[]; // Penalidades previstas
  statistics?: {
    views: number;
    searches: number;
    bookmarks: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LegislationArticle {
  id: string;
  number: string; // "Art. 1º", "Art. 2º"
  title?: string;
  content: string;
  paragraphs?: {
    id: string;
    number: string; // "§1º", "§2º"
    content: string;
    items?: {
      id: string;
      number: string; // "I", "II", "III"
      content: string;
      subitems?: {
        id: string;
        number: string; // "a)", "b)", "c)"
        content: string;
      }[];
    }[];
  }[];
  comments?: string; // Comentários explicativos
  jurisprudence?: string[]; // Jurisprudência relacionada
}

export interface LegislationBookmark {
  id: string;
  user_id: string;
  legislation_id: string;
  article_id?: string;
  notes?: string;
  created_at: string;
  legislation?: {
    id: string;
    title: string;
    type: LegislationType;
    number?: string;
    year: number;
    subject_area: string;
  };
}

export interface LegislationStatistic {
  legislation_id: string;
  article_id?: string;
  action: 'view' | 'search' | 'bookmark';
  user_id?: string;
  timestamp: string;
  metadata?: {
    search_term?: string;
    session_duration?: number;
  };
}

export interface LegislationSearchResult {
  query: string;
  total: number;
  results: LegislationDocument[];
}

export interface LegislationListResponse {
  legislation: LegislationDocument[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface LegislationTypeCount {
  type: LegislationType;
  count: number;
}

export interface LegislationSubjectCount {
  subject: string;
  count: number;
}

export interface LegislationStatisticsOverview {
  totals: {
    legislation: number;
    views: number;
    bookmarks: number;
    searches: number;
  };
  by_type: Record<string, number>;
  by_subject: Record<string, number>;
  recent_activity: number;
}

// API Service Class
class LegislationService {
  private baseUrl = '/legislation';

  // CRUD Operations
  async getAll(params?: {
    type?: LegislationType;
    subject_area?: string;
    status?: LegislationStatus;
    year?: number;
    keyword?: string;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<LegislationListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await api.get(url);
    return response.data;
  }

  async getById(id: string): Promise<LegislationDocument> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: Partial<LegislationDocument>): Promise<LegislationDocument> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: Partial<LegislationDocument>): Promise<LegislationDocument> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Search Operations
  async search(params: {
    q: string;
    limit?: number;
    type?: LegislationType;
    subject_area?: string;
  }): Promise<LegislationSearchResult> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    const response = await api.get(`${this.baseUrl}/search?${searchParams.toString()}`);
    return response.data;
  }

  // Article Operations
  async getArticles(id: string, articleNumber?: string): Promise<{
    legislation_id: string;
    legislation_title: string;
    articles: LegislationArticle[];
  }> {
    const params = articleNumber ? `?article_number=${articleNumber}` : '';
    const response = await api.get(`${this.baseUrl}/${id}/articles${params}`);
    return response.data;
  }

  // Bookmark Operations
  async addBookmark(legislationId: string, data?: { article_id?: string; notes?: string }): Promise<LegislationBookmark> {
    const response = await api.post(`${this.baseUrl}/${legislationId}/bookmark`, data || {});
    return response.data;
  }

  async removeBookmark(legislationId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${legislationId}/bookmark`);
    return response.data;
  }

  async getBookmarks(): Promise<LegislationBookmark[]> {
    const response = await api.get(`${this.baseUrl}/bookmarks`);
    return response.data;
  }

  // Metadata Operations
  async getTypes(): Promise<LegislationTypeCount[]> {
    const response = await api.get(`${this.baseUrl}/types`);
    return response.data;
  }

  async getSubjects(): Promise<LegislationSubjectCount[]> {
    const response = await api.get(`${this.baseUrl}/subjects`);
    return response.data;
  }

  // Special Lists
  async getRecent(limit?: number): Promise<LegislationDocument[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`${this.baseUrl}/recent${params}`);
    return response.data;
  }

  async getPopular(limit?: number): Promise<LegislationDocument[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`${this.baseUrl}/popular${params}`);
    return response.data;
  }

  async getRelated(id: string): Promise<LegislationDocument[]> {
    const response = await api.get(`${this.baseUrl}/${id}/related`);
    return response.data;
  }

  // Statistics (Admin only)
  async getStatisticsOverview(): Promise<LegislationStatisticsOverview> {
    const response = await api.get(`${this.baseUrl}/statistics/overview`);
    return response.data;
  }

  // Utility Methods
  formatLegislationNumber(legislation: LegislationDocument): string {
    if (legislation.number) {
      return legislation.number;
    }
    return `${legislation.type.toUpperCase()}/${legislation.year}`;
  }

  formatLegislationTitle(legislation: LegislationDocument): string {
    const number = this.formatLegislationNumber(legislation);
    return `${legislation.title} (${number})`;
  }

  getTypeDisplayName(type: LegislationType): string {
    const typeNames: Record<LegislationType, string> = {
      constitution: 'Constituição',
      law: 'Lei',
      decree: 'Decreto',
      ordinance: 'Portaria',
      normative: 'Instrução Normativa',
      resolution: 'Resolução'
    };
    return typeNames[type] || type;
  }

  getStatusDisplayName(status: LegislationStatus): string {
    const statusNames: Record<LegislationStatus, string> = {
      active: 'Vigente',
      revoked: 'Revogada',
      superseded: 'Superada'
    };
    return statusNames[status] || status;
  }

  getStatusColor(status: LegislationStatus): string {
    const colors: Record<LegislationStatus, string> = {
      active: 'text-green-600 bg-green-100',
      revoked: 'text-red-600 bg-red-100',
      superseded: 'text-yellow-600 bg-yellow-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  // Search Utilities
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }

  // Article Navigation
  findArticleById(legislation: LegislationDocument, articleId: string): LegislationArticle | null {
    return legislation.articles.find(article => article.id === articleId) || null;
  }

  findNextArticle(legislation: LegislationDocument, currentArticleId: string): LegislationArticle | null {
    const currentIndex = legislation.articles.findIndex(article => article.id === currentArticleId);
    if (currentIndex === -1 || currentIndex === legislation.articles.length - 1) {
      return null;
    }
    return legislation.articles[currentIndex + 1];
  }

  findPreviousArticle(legislation: LegislationDocument, currentArticleId: string): LegislationArticle | null {
    const currentIndex = legislation.articles.findIndex(article => article.id === currentArticleId);
    if (currentIndex <= 0) {
      return null;
    }
    return legislation.articles[currentIndex - 1];
  }

  // Content Processing
  extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter((word, index, array) => array.indexOf(word) === index);
    
    return words.slice(0, 20); // Limit to top 20 keywords
  }

  // Date Formatting
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }

  formatDateTime(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  }

  // Validation
  validateLegislationData(data: Partial<LegislationDocument>): string[] {
    const errors: string[] = [];
    
    if (!data.title?.trim()) {
      errors.push('Título é obrigatório');
    }
    
    if (!data.type) {
      errors.push('Tipo é obrigatório');
    }
    
    if (!data.subject_area?.trim()) {
      errors.push('Área do assunto é obrigatória');
    }
    
    if (!data.year || data.year < 1800 || data.year > new Date().getFullYear()) {
      errors.push('Ano deve ser válido');
    }
    
    if (data.publication_date) {
      const pubDate = new Date(data.publication_date);
      if (isNaN(pubDate.getTime())) {
        errors.push('Data de publicação inválida');
      }
    }
    
    return errors;
  }

  // Export/Import Utilities
  async exportToJSON(legislation: LegislationDocument[]): Promise<string> {
    return JSON.stringify(legislation, null, 2);
  }

  async exportToCSV(legislation: LegislationDocument[]): Promise<string> {
    const headers = ['ID', 'Título', 'Tipo', 'Número', 'Ano', 'Área', 'Status', 'Data Publicação'];
    const rows = legislation.map(leg => [
      leg.id,
      leg.title,
      this.getTypeDisplayName(leg.type),
      leg.number || '',
      leg.year.toString(),
      leg.subject_area,
      this.getStatusDisplayName(leg.status),
      this.formatDate(leg.publication_date)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
}

// Create singleton instance
const legislationService = new LegislationService();

// Export both the class and the instance
export { LegislationService };
export default legislationService;