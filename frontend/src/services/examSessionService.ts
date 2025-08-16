import api from '@/services/api';

export interface ExamSession {
  id: string;
  userId: string;
  examId: string;
  examType: 'mock' | 'previous' | 'practice';
  title: string;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers?: ExamAnswer[];
}

export interface ExamAnswer {
  questionId: string;
  selectedOption: number | string;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface CreateSessionData {
  examId: string;
  examType: 'mock' | 'previous' | 'practice';
  title: string;
  totalQuestions: number;
}

export interface SubmitAnswerData {
  questionId: string;
  selectedOption: number | string;
  timeSpent?: number;
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  topic?: string;
}

export interface ExamResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  percentile?: number;
  detailedResults: {
    questionId: string;
    question: string;
    userAnswer: number | string;
    correctAnswer: number | string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  categoryPerformance?: {
    category: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
}

class ExamSessionService {
  private readonly baseUrl = '/exam-sessions';

  /**
   * Criar nova sessão de exame
   */
  async createSession(data: CreateSessionData): Promise<{ success: boolean; data?: ExamSession; message?: string }> {
    try {
      const response = await api.post(this.baseUrl, data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar sessão de exame'
      };
    }
  }

  /**
   * Obter sessão atual
   */
  async getCurrentSession(): Promise<{ success: boolean; data?: ExamSession; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/current`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Nenhuma sessão ativa'
      };
    }
  }

  /**
   * Obter sessão por ID
   */
  async getSession(sessionId: string): Promise<{ success: boolean; data?: ExamSession; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/${sessionId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sessão não encontrada'
      };
    }
  }

  /**
   * Obter questões do exame
   */
  async getExamQuestions(sessionId: string): Promise<{ success: boolean; data?: ExamQuestion[]; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/${sessionId}/questions`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar questões'
      };
    }
  }

  /**
   * Submeter resposta
   */
  async submitAnswer(sessionId: string, data: SubmitAnswerData): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/${sessionId}/answer`, data);
      return {
        success: true,
        message: 'Resposta registrada'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar resposta'
      };
    }
  }

  /**
   * Submeter múltiplas respostas
   */
  async submitAnswers(sessionId: string, answers: SubmitAnswerData[]): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/${sessionId}/answers`, { answers });
      return {
        success: true,
        message: 'Respostas registradas'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar respostas'
      };
    }
  }

  /**
   * Finalizar exame
   */
  async finishExam(sessionId: string): Promise<{ success: boolean; data?: ExamResult; message?: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${sessionId}/finish`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao finalizar exame'
      };
    }
  }

  /**
   * Abandonar exame
   */
  async abandonExam(sessionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/${sessionId}/abandon`);
      return {
        success: true,
        message: 'Exame abandonado'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao abandonar exame'
      };
    }
  }

  /**
   * Obter resultado do exame
   */
  async getExamResult(sessionId: string): Promise<{ success: boolean; data?: ExamResult; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/${sessionId}/result`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Resultado não disponível'
      };
    }
  }

  /**
   * Obter histórico de exames
   */
  async getExamHistory(params?: { 
    examType?: 'mock' | 'previous' | 'practice';
    status?: 'completed' | 'abandoned';
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: ExamSession[]; message?: string }> {
    try {
      const response = await api.get(this.baseUrl, { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar histórico'
      };
    }
  }

  /**
   * Obter estatísticas de exames
   */
  async getExamStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas'
      };
    }
  }

  /**
   * Pausar exame (salvar progresso)
   */
  async pauseExam(sessionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post(`${this.baseUrl}/${sessionId}/pause`);
      return {
        success: true,
        message: 'Exame pausado'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao pausar exame'
      };
    }
  }

  /**
   * Retomar exame pausado
   */
  async resumeExam(sessionId: string): Promise<{ success: boolean; data?: ExamSession; message?: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${sessionId}/resume`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao retomar exame'
      };
    }
  }
}

export const examSessionService = new ExamSessionService();