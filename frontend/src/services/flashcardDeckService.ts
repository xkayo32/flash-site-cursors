import { API_BASE_URL } from '../config/api';

// Flashcard deck types
export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  category: string;
  flashcard_ids: string[];
  user_id: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  total_cards?: number;
  studied_count?: number;
  mastery_level?: number;
}

export interface CreateDeckData {
  name: string;
  description?: string;
  category?: string;
  subject?: string; // Backend usa subject ao invés de category
  flashcard_ids?: string[];
  is_public?: boolean;
}

export interface UpdateDeckData extends Partial<CreateDeckData> {}

class FlashcardDeckService {
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
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Não autorizado - Faça login novamente');
      } else if (response.status === 403) {
        throw new Error('Acesso negado');
      } else if (response.status === 404) {
        throw new Error('Arsenal não encontrado');
      }
      
      throw new Error(errorData.message || `Erro HTTP ${response.status}`);
    }
    return response.json();
  }

  // Get all decks (user's own + public decks)
  async getDecks(filters?: { search?: string; category?: string }): Promise<{ success: boolean; decks: FlashcardDeck[]; total: number }> {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters?.category) {
      queryParams.append('category', filters.category);
    }
    
    const url = `${API_BASE_URL}/api/v1/flashcard-decks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; decks: FlashcardDeck[]; total: number }>(response);
  }

  // Get single deck by ID
  async getDeck(id: string): Promise<{ success: boolean; data: FlashcardDeck }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; data: FlashcardDeck }>(response);
  }

  // Create new deck
  async createDeck(data: CreateDeckData): Promise<{ success: boolean; message: string; data: FlashcardDeck }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ success: boolean; message: string; data: FlashcardDeck }>(response);
  }

  // Update existing deck
  async updateDeck(id: string, data: UpdateDeckData): Promise<{ success: boolean; message: string; data: FlashcardDeck }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<{ success: boolean; message: string; data: FlashcardDeck }>(response);
  }

  // Delete deck
  async deleteDeck(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Add flashcards to deck
  async addFlashcardsToDeck(deckId: string, flashcardIds: string[]): Promise<{ success: boolean; message: string; data: FlashcardDeck }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks/${deckId}/flashcards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ flashcard_ids: flashcardIds })
    });

    return this.handleResponse<{ success: boolean; message: string; data: FlashcardDeck }>(response);
  }

  // Remove flashcards from deck
  async removeFlashcardsFromDeck(deckId: string, flashcardIds: string[]): Promise<{ success: boolean; message: string; data: FlashcardDeck }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/flashcard-decks/${deckId}/flashcards`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ flashcard_ids: flashcardIds })
    });

    return this.handleResponse<{ success: boolean; message: string; data: FlashcardDeck }>(response);
  }

  // Get user's own decks
  async getUserDecks(userId?: string): Promise<FlashcardDeck[]> {
    const result = await this.getDecks();
    const actualUserId = userId || localStorage.getItem('userId'); // Use provided ID or stored ID
    if (!actualUserId) return [];
    return result.decks.filter(deck => deck.user_id === actualUserId);
  }

  // Get public decks
  async getPublicDecks(): Promise<FlashcardDeck[]> {
    const result = await this.getDecks();
    return result.decks.filter(deck => deck.is_public);
  }
}

// Export singleton instance
export const flashcardDeckService = new FlashcardDeckService();
export default flashcardDeckService;