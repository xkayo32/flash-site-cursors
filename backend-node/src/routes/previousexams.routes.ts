import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { Question } from './questions.routes';

const router = Router();

// Previous exams data storage
const previousExamsPath = '/tmp/previousexams.json';
const examAttemptsPath = '/tmp/previous-exam-attempts.json';
const questionsPath = path.join(__dirname, '../../data/questions.json');

// Ensure data directory exists
const dataDir = path.dirname(previousExamsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
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
}

// Helper functions
function loadPreviousExams(): PreviousExam[] {
  try {
    if (fs.existsSync(previousExamsPath)) {
      const data = fs.readFileSync(previousExamsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading previous exams:', error);
    return [];
  }
}

function savePreviousExams(exams: PreviousExam[]): void {
  try {
    fs.writeFileSync(previousExamsPath, JSON.stringify(exams, null, 2));
  } catch (error) {
    console.error('Error saving previous exams:', error);
    throw error;
  }
}

function loadPreviousExamAttempts(): PreviousExamAttempt[] {
  try {
    if (fs.existsSync(examAttemptsPath)) {
      const data = fs.readFileSync(examAttemptsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading previous exam attempts:', error);
    return [];
  }
}

function savePreviousExamAttempts(attempts: PreviousExamAttempt[]): void {
  try {
    fs.writeFileSync(examAttemptsPath, JSON.stringify(attempts, null, 2));
  } catch (error) {
    console.error('Error saving previous exam attempts:', error);
    throw error;
  }
}

function loadQuestions(): Question[] {
  try {
    if (fs.existsSync(questionsPath)) {
      const data = fs.readFileSync(questionsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

function generateId(): string {
  return 'pe_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function generateAttemptId(): string {
  return 'pea_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function calculateExamStatistics(examId: string, attempts: PreviousExamAttempt[]): any {
  const examAttempts = attempts.filter(a => a.exam_id === examId && a.status === 'completed');
  
  if (examAttempts.length === 0) {
    return {
      total_attempts: 0,
      average_score: 0,
      approval_rate: 0
    };
  }

  const totalScore = examAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalScore / examAttempts.length;
  const approvedCount = examAttempts.filter(a => a.score >= 70).length;
  const approvalRate = (approvedCount / examAttempts.length) * 100;

  return {
    total_attempts: examAttempts.length,
    average_score: Math.round(averageScore * 100) / 100,
    approval_rate: Math.round(approvalRate * 100) / 100
  };
}

function evaluateAnswer(question: Question, userAnswer: any): boolean {
  switch (question.type) {
    case 'multiple_choice':
      return userAnswer === question.correct_answer;
    case 'true_false':
      return userAnswer === question.correct_boolean;
    case 'fill_blank':
      if (!question.expected_answer || !userAnswer) return false;
      return userAnswer?.toLowerCase().trim() === question.expected_answer?.toLowerCase().trim();
    case 'essay':
      // Para questões dissertativas, sempre considera correto (avaliação manual)
      return true;
    default:
      return false;
  }
}

// =========================
// ADMIN ROUTES
// =========================

// GET /api/v1/previousexams - Listar provas anteriores (com filtros)
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting all previous exams for user:', req.user?.id);
    
    const { 
      search, 
      organization, 
      exam_board, 
      position, 
      year_from, 
      year_to,
      subject,
      status,
      page = '1',
      limit = '10'
    } = req.query;

    let exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();

    // Apply filters
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      exams = exams.filter(exam => 
        exam.title.toLowerCase().includes(searchLower) ||
        exam.organization.toLowerCase().includes(searchLower) ||
        exam.position.toLowerCase().includes(searchLower) ||
        exam.description?.toLowerCase().includes(searchLower)
      );
    }

    if (organization && typeof organization === 'string') {
      exams = exams.filter(exam => exam.organization === organization);
    }

    if (exam_board && typeof exam_board === 'string') {
      exams = exams.filter(exam => exam.exam_board === exam_board);
    }

    if (position && typeof position === 'string') {
      exams = exams.filter(exam => exam.position === position);
    }

    if (year_from && typeof year_from === 'string') {
      exams = exams.filter(exam => exam.year >= parseInt(year_from));
    }

    if (year_to && typeof year_to === 'string') {
      exams = exams.filter(exam => exam.year <= parseInt(year_to));
    }

    if (subject && typeof subject === 'string') {
      exams = exams.filter(exam => exam.subjects.includes(subject));
    }

    if (status && typeof status === 'string') {
      exams = exams.filter(exam => exam.status === status);
    }

    // Add statistics to each exam
    exams = exams.map(exam => ({
      ...exam,
      statistics: calculateExamStatistics(exam.id, attempts)
    }));

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedExams = exams.slice(startIndex, endIndex);

    console.log(`📚 [PREVIOUS-EXAMS] Found ${exams.length} exams, returning page ${pageNum} with ${paginatedExams.length} exams`);

    res.json({
      exams: paginatedExams,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: exams.length,
        total_pages: Math.ceil(exams.length / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting previous exams:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/:id - Obter prova específica
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Getting previous exam:', id);

    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      console.log('❌ [PREVIOUS-EXAMS] Previous exam not found:', id);
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const attempts = loadPreviousExamAttempts();
    const examWithStats = {
      ...exam,
      statistics: calculateExamStatistics(exam.id, attempts)
    };

    console.log('✅ [PREVIOUS-EXAMS] Previous exam found:', exam.title);
    res.json(examWithStats);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams - Criar nova prova anterior
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Creating new previous exam for user:', req.user?.id);

    const {
      title,
      organization,
      exam_board,
      position,
      year,
      application_date,
      total_questions,
      duration,
      description,
      questions = [],
      subjects = [],
      difficulty_distribution,
      metadata
    } = req.body;

    // Validation
    if (!title || !organization || !exam_board || !position || !year) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: title, organization, exam_board, position, year' 
      });
    }

    if (year < 2010 || year > new Date().getFullYear()) {
      return res.status(400).json({ 
        error: 'Ano deve estar entre 2010 e ano atual' 
      });
    }

    // Validate questions exist
    const allQuestions = loadQuestions();
    const invalidQuestions = questions.filter((qId: string) => 
      !allQuestions.some(q => q.id === qId)
    );

    if (invalidQuestions.length > 0) {
      return res.status(400).json({ 
        error: `Questões não encontradas: ${invalidQuestions.join(', ')}` 
      });
    }

    const newExam: PreviousExam = {
      id: generateId(),
      title,
      organization,
      exam_board,
      position,
      year: parseInt(year),
      application_date,
      total_questions: parseInt(total_questions) || questions.length,
      duration: duration ? parseInt(duration) : undefined,
      description,
      questions: Array.isArray(questions) ? questions : [],
      subjects: Array.isArray(subjects) ? subjects : [],
      status: 'draft',
      difficulty_distribution,
      metadata,
      created_by: req.user?.id || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const exams = loadPreviousExams();
    exams.push(newExam);
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam created:', newExam.id, newExam.title);
    res.status(201).json(newExam);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error creating previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/previousexams/:id - Atualizar prova anterior
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Updating previous exam:', id);

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const {
      title,
      organization,
      exam_board,
      position,
      year,
      application_date,
      total_questions,
      duration,
      description,
      questions,
      subjects,
      status,
      difficulty_distribution,
      metadata
    } = req.body;

    // Validate year if provided
    if (year && (year < 2010 || year > new Date().getFullYear())) {
      return res.status(400).json({ 
        error: 'Ano deve estar entre 2010 e ano atual' 
      });
    }

    // Validate questions exist if provided
    if (questions && Array.isArray(questions)) {
      const allQuestions = loadQuestions();
      const invalidQuestions = questions.filter((qId: string) => 
        !allQuestions.some(q => q.id === qId)
      );

      if (invalidQuestions.length > 0) {
        return res.status(400).json({ 
          error: `Questões não encontradas: ${invalidQuestions.join(', ')}` 
        });
      }
    }

    // Update exam
    const updatedExam = {
      ...exams[examIndex],
      ...(title && { title }),
      ...(organization && { organization }),
      ...(exam_board && { exam_board }),
      ...(position && { position }),
      ...(year && { year: parseInt(year) }),
      ...(application_date !== undefined && { application_date }),
      ...(total_questions && { total_questions: parseInt(total_questions) }),
      ...(duration !== undefined && { duration: duration ? parseInt(duration) : undefined }),
      ...(description !== undefined && { description }),
      ...(questions && { questions: Array.isArray(questions) ? questions : [] }),
      ...(subjects && { subjects: Array.isArray(subjects) ? subjects : [] }),
      ...(status && { status }),
      ...(difficulty_distribution && { difficulty_distribution }),
      ...(metadata && { metadata }),
      updated_at: new Date().toISOString()
    };

    exams[examIndex] = updatedExam;
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam updated:', id);
    res.json(updatedExam);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error updating previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/v1/previousexams/:id - Deletar prova anterior
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Deleting previous exam:', id);

    // Check if exam has attempts
    const attempts = loadPreviousExamAttempts();
    const hasAttempts = attempts.some(a => a.exam_id === id);

    if (hasAttempts) {
      return res.status(400).json({ 
        error: 'Não é possível deletar prova com tentativas registradas' 
      });
    }

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const examTitle = exams[examIndex].title;
    exams.splice(examIndex, 1);
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam deleted:', id, examTitle);
    res.json({ message: 'Prova anterior deletada com sucesso' });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error deleting previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/:id/publish - Publicar prova
router.post('/:id/publish', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Publishing previous exam:', id);

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const exam = exams[examIndex];
    
    // Validation for publishing
    if (exam.questions.length === 0) {
      return res.status(400).json({ 
        error: 'Prova deve ter pelo menos uma questão para ser publicada' 
      });
    }

    exam.status = 'published';
    exam.updated_at = new Date().toISOString();
    
    exams[examIndex] = exam;
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam published:', id, exam.title);
    res.json(exam);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error publishing previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/:id/archive - Arquivar prova
router.post('/:id/archive', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Archiving previous exam:', id);

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const exam = exams[examIndex];
    exam.status = 'archived';
    exam.updated_at = new Date().toISOString();
    
    exams[examIndex] = exam;
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam archived:', id, exam.title);
    res.json(exam);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error archiving previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/:id/duplicate - Duplicar prova
router.post('/:id/duplicate', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Duplicating previous exam:', id);

    const exams = loadPreviousExams();
    const originalExam = exams.find(e => e.id === id);

    if (!originalExam) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const duplicatedExam: PreviousExam = {
      ...originalExam,
      id: generateId(),
      title: `${originalExam.title} (Cópia)`,
      status: 'draft',
      created_by: req.user?.id || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    exams.push(duplicatedExam);
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam duplicated:', id, '→', duplicatedExam.id);
    res.status(201).json(duplicatedExam);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error duplicating previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/:id/preview - Preview das questões
router.get('/:id/preview', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Getting preview for previous exam:', id);

    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const allQuestions = loadQuestions();
    const examQuestions = allQuestions.filter(q => exam.questions.includes(q.id));

    const preview = {
      exam_info: {
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year,
        total_questions: exam.total_questions,
        duration: exam.duration,
        subjects: exam.subjects
      },
      questions: examQuestions.map(q => ({
        id: q.id,
        title: q.title,
        type: q.type,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        // Não incluir respostas no preview
        ...(q.type === 'multiple_choice' && { options: q.options }),
        ...(q.type === 'true_false' && { statement: q.title }),
        exam_board: q.exam_board,
        exam_year: q.exam_year
      })),
      summary: {
        total_questions: examQuestions.length,
        by_subject: examQuestions.reduce((acc: any, q) => {
          acc[q.subject] = (acc[q.subject] || 0) + 1;
          return acc;
        }, {}),
        by_difficulty: examQuestions.reduce((acc: any, q) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        }, {}),
        by_type: examQuestions.reduce((acc: any, q) => {
          acc[q.type] = (acc[q.type] || 0) + 1;
          return acc;
        }, {})
      }
    };

    console.log('✅ [PREVIOUS-EXAMS] Preview generated for:', exam.title);
    res.json(preview);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting preview:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/:id/questions/:questionId - Vincular questão
router.post('/:id/questions/:questionId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id, questionId } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Adding question to exam:', questionId, '→', id);

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    // Validate question exists
    const allQuestions = loadQuestions();
    const question = allQuestions.find(q => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    const exam = exams[examIndex];

    // Check if question is already linked
    if (exam.questions.includes(questionId)) {
      return res.status(400).json({ error: 'Questão já vinculada à prova' });
    }

    exam.questions.push(questionId);
    
    // Update subjects if not already included
    if (!exam.subjects.includes(question.subject)) {
      exam.subjects.push(question.subject);
    }

    exam.updated_at = new Date().toISOString();
    
    exams[examIndex] = exam;
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Question added to exam:', questionId, '→', id);
    res.json({ 
      message: 'Questão vinculada com sucesso',
      exam: exam,
      question: question
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error adding question to exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/v1/previousexams/:id/questions/:questionId - Desvincular questão
router.delete('/:id/questions/:questionId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id, questionId } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Removing question from exam:', questionId, '←', id);

    const exams = loadPreviousExams();
    const examIndex = exams.findIndex(e => e.id === id);

    if (examIndex === -1) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const exam = exams[examIndex];

    // Check if question is linked
    const questionIndex = exam.questions.indexOf(questionId);
    if (questionIndex === -1) {
      return res.status(400).json({ error: 'Questão não está vinculada à prova' });
    }

    exam.questions.splice(questionIndex, 1);
    exam.updated_at = new Date().toISOString();
    
    exams[examIndex] = exam;
    savePreviousExams(exams);

    console.log('✅ [PREVIOUS-EXAMS] Question removed from exam:', questionId, '←', id);
    res.json({ 
      message: 'Questão desvinculada com sucesso',
      exam: exam
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error removing question from exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =========================
// STUDENT ROUTES
// =========================

// GET /api/v1/previousexams/available - Listar provas disponíveis para estudante
router.get('/available', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting available exams for student:', req.user?.id);
    
    const { 
      search, 
      organization, 
      exam_board, 
      position, 
      year_from, 
      year_to,
      subject,
      page = '1',
      limit = '12'
    } = req.query;

    let exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();

    // Only show published exams
    exams = exams.filter(exam => exam.status === 'published');

    // Apply filters
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      exams = exams.filter(exam => 
        exam.title.toLowerCase().includes(searchLower) ||
        exam.organization.toLowerCase().includes(searchLower) ||
        exam.position.toLowerCase().includes(searchLower) ||
        exam.description?.toLowerCase().includes(searchLower)
      );
    }

    if (organization && typeof organization === 'string') {
      exams = exams.filter(exam => exam.organization === organization);
    }

    if (exam_board && typeof exam_board === 'string') {
      exams = exams.filter(exam => exam.exam_board === exam_board);
    }

    if (position && typeof position === 'string') {
      exams = exams.filter(exam => exam.position === position);
    }

    if (year_from && typeof year_from === 'string') {
      exams = exams.filter(exam => exam.year >= parseInt(year_from));
    }

    if (year_to && typeof year_to === 'string') {
      exams = exams.filter(exam => exam.year <= parseInt(year_to));
    }

    if (subject && typeof subject === 'string') {
      exams = exams.filter(exam => exam.subjects.includes(subject));
    }

    // Add user-specific data
    const userId = req.user?.id || '';
    exams = exams.map(exam => {
      const userAttempts = attempts.filter(a => a.exam_id === exam.id && a.user_id === userId);
      const completedAttempts = userAttempts.filter(a => a.status === 'completed');
      const hasInProgressAttempt = userAttempts.some(a => a.status === 'in_progress');
      
      return {
        ...exam,
        statistics: calculateExamStatistics(exam.id, attempts),
        user_stats: {
          attempts_count: completedAttempts.length,
          best_score: completedAttempts.length > 0 
            ? Math.max(...completedAttempts.map(a => a.score))
            : null,
          last_attempt: completedAttempts.length > 0
            ? completedAttempts.sort((a, b) => 
                new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime()
              )[0].submitted_at
            : null,
          has_in_progress: hasInProgressAttempt
        }
      };
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedExams = exams.slice(startIndex, endIndex);

    console.log(`📚 [PREVIOUS-EXAMS] Found ${exams.length} available exams for student`);

    res.json({
      exams: paginatedExams,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: exams.length,
        total_pages: Math.ceil(exams.length / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting available exams:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/:id/start - Iniciar prova anterior
router.post('/:id/start', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '';
    const userName = req.user?.name || req.user?.email || 'Usuário';

    console.log('📚 [PREVIOUS-EXAMS] Starting previous exam:', id, 'for user:', userId);

    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    if (exam.status !== 'published') {
      return res.status(400).json({ error: 'Prova não está disponível para execução' });
    }

    // Check for existing in-progress attempt
    const attempts = loadPreviousExamAttempts();
    const existingAttempt = attempts.find(a => 
      a.exam_id === id && 
      a.user_id === userId && 
      a.status === 'in_progress'
    );

    if (existingAttempt) {
      console.log('📚 [PREVIOUS-EXAMS] Resuming existing attempt:', existingAttempt.id);
      return res.json({
        message: 'Retomando prova em andamento',
        attempt: existingAttempt
      });
    }

    // Get questions for the exam
    const allQuestions = loadQuestions();
    const examQuestions = allQuestions.filter(q => exam.questions.includes(q.id));

    if (examQuestions.length === 0) {
      return res.status(400).json({ error: 'Prova não possui questões cadastradas' });
    }

    // Create new attempt
    const newAttempt: PreviousExamAttempt = {
      id: generateAttemptId(),
      exam_id: id,
      user_id: userId,
      user_name: userName,
      questions: exam.questions, // Manter ordem original
      answers: {},
      started_at: new Date().toISOString(),
      time_spent: 0,
      score: 0,
      correct_answers: 0,
      wrong_answers: 0,
      blank_answers: 0,
      status: 'in_progress'
    };

    attempts.push(newAttempt);
    savePreviousExamAttempts(attempts);

    console.log('✅ [PREVIOUS-EXAMS] Previous exam attempt started:', newAttempt.id);
    res.status(201).json({
      message: 'Prova iniciada com sucesso',
      attempt: newAttempt,
      exam_info: {
        title: exam.title,
        organization: exam.organization,
        position: exam.position,
        year: exam.year,
        duration: exam.duration,
        total_questions: exam.total_questions
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error starting previous exam:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/attempts/:attemptId - Obter tentativa em andamento
router.get('/attempts/:attemptId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.id || '';

    console.log('📚 [PREVIOUS-EXAMS] Getting attempt:', attemptId, 'for user:', userId);

    const attempts = loadPreviousExamAttempts();
    const attempt = attempts.find(a => a.id === attemptId && a.user_id === userId);

    if (!attempt) {
      return res.status(404).json({ error: 'Tentativa não encontrada' });
    }

    // Get exam info
    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === attempt.exam_id);

    if (!exam) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Get questions
    const allQuestions = loadQuestions();
    const attemptQuestions = allQuestions.filter(q => attempt.questions.includes(q.id));

    // Sort questions by attempt order
    const orderedQuestions = attempt.questions.map(qId => 
      attemptQuestions.find(q => q.id === qId)
    ).filter(Boolean);

    const response = {
      attempt: attempt,
      exam: {
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year,
        duration: exam.duration,
        description: exam.description
      },
      questions: orderedQuestions.map((q: any, index: number) => ({
        id: q.id,
        number: index + 1,
        title: q.title,
        type: q.type,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        // Include options/choices but not answers
        ...(q.type === 'multiple_choice' && { options: q.options }),
        ...(q.type === 'drag_drop' && { items: q.items }),
        ...(q.type === 'fill_blank' && { 
          blanks_count: q.correct_answers?.length || 1 
        }),
        // User's current answer
        user_answer: attempt.answers[q.id] || null
      }))
    };

    console.log('✅ [PREVIOUS-EXAMS] Attempt data retrieved for:', attemptId);
    res.json(response);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting attempt:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/attempts/:attemptId/answer - Salvar resposta
router.post('/attempts/:attemptId/answer', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { attemptId } = req.params;
    const { question_id, answer } = req.body;
    const userId = req.user?.id || '';

    console.log('📚 [PREVIOUS-EXAMS] Saving answer for attempt:', attemptId, 'question:', question_id);

    if (!question_id || answer === undefined) {
      return res.status(400).json({ error: 'question_id e answer são obrigatórios' });
    }

    const attempts = loadPreviousExamAttempts();
    const attemptIndex = attempts.findIndex(a => a.id === attemptId && a.user_id === userId);

    if (attemptIndex === -1) {
      return res.status(404).json({ error: 'Tentativa não encontrada' });
    }

    const attempt = attempts[attemptIndex];

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Tentativa não está em andamento' });
    }

    // Validate question belongs to this attempt
    if (!attempt.questions.includes(question_id)) {
      return res.status(400).json({ error: 'Questão não pertence a esta tentativa' });
    }

    // Save answer
    attempt.answers[question_id] = answer;
    
    attempts[attemptIndex] = attempt;
    savePreviousExamAttempts(attempts);

    console.log('✅ [PREVIOUS-EXAMS] Answer saved for question:', question_id);
    res.json({ 
      message: 'Resposta salva com sucesso',
      question_id: question_id,
      answer: answer
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error saving answer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/v1/previousexams/attempts/:attemptId/submit - Submeter prova
router.post('/attempts/:attemptId/submit', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { attemptId } = req.params;
    const { time_spent } = req.body;
    const userId = req.user?.id || '';

    console.log('📚 [PREVIOUS-EXAMS] Submitting attempt:', attemptId, 'for user:', userId);

    const attempts = loadPreviousExamAttempts();
    const attemptIndex = attempts.findIndex(a => a.id === attemptId && a.user_id === userId);

    if (attemptIndex === -1) {
      return res.status(404).json({ error: 'Tentativa não encontrada' });
    }

    const attempt = attempts[attemptIndex];

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Tentativa não está em andamento' });
    }

    // Get questions for evaluation
    const allQuestions = loadQuestions();
    const attemptQuestions = allQuestions.filter(q => attempt.questions.includes(q.id));

    // Evaluate answers
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let blankAnswers = 0;
    const review: any[] = [];

    attemptQuestions.forEach(question => {
      const userAnswer = attempt.answers[question.id];
      
      if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
        blankAnswers++;
        review.push({
          question_id: question.id,
          is_correct: false,
          user_answer: null,
          correct_answer: getCorrectAnswer(question),
          explanation: question.explanation
        });
      } else {
        const isCorrect = evaluateAnswer(question, userAnswer);
        if (isCorrect) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
        
        review.push({
          question_id: question.id,
          is_correct: isCorrect,
          user_answer: userAnswer,
          correct_answer: getCorrectAnswer(question),
          explanation: question.explanation
        });
      }
    });

    // Calculate score
    const totalQuestions = attemptQuestions.length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Update attempt
    attempt.submitted_at = new Date().toISOString();
    attempt.time_spent = parseInt(time_spent) || 0;
    attempt.score = Math.round(score * 100) / 100;
    attempt.correct_answers = correctAnswers;
    attempt.wrong_answers = wrongAnswers;
    attempt.blank_answers = blankAnswers;
    attempt.status = 'completed';
    attempt.review = review;

    attempts[attemptIndex] = attempt;
    savePreviousExamAttempts(attempts);

    console.log('✅ [PREVIOUS-EXAMS] Attempt submitted:', attemptId, 'Score:', attempt.score);

    res.json({
      message: 'Prova submetida com sucesso',
      result: {
        attempt_id: attempt.id,
        score: attempt.score,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        blank_answers: blankAnswers,
        total_questions: totalQuestions,
        time_spent: attempt.time_spent,
        submitted_at: attempt.submitted_at,
        passed: attempt.score >= 70 // Critério padrão de aprovação
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error submitting attempt:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Helper function to get correct answer for display
function getCorrectAnswer(question: Question): any {
  switch (question.type) {
    case 'multiple_choice':
      return {
        index: question.correct_answer,
        text: question.options?.[question.correct_answer!]
      };
    case 'true_false':
      return question.correct_boolean;
    case 'fill_blank':
      return question.expected_answer;
    case 'essay':
      return 'Resposta dissertativa - avaliação manual';
    default:
      return null;
  }
}

// GET /api/v1/previousexams/attempts/:attemptId/results - Ver resultados com revisão
router.get('/attempts/:attemptId/results', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.id || '';

    console.log('📚 [PREVIOUS-EXAMS] Getting results for attempt:', attemptId);

    const attempts = loadPreviousExamAttempts();
    const attempt = attempts.find(a => a.id === attemptId && a.user_id === userId);

    if (!attempt) {
      return res.status(404).json({ error: 'Tentativa não encontrada' });
    }

    if (attempt.status !== 'completed') {
      return res.status(400).json({ error: 'Tentativa ainda não foi concluída' });
    }

    // Get exam info
    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === attempt.exam_id);

    if (!exam) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Get questions with review
    const allQuestions = loadQuestions();
    const reviewData = attempt.review?.map((reviewItem, index) => {
      const question = allQuestions.find(q => q.id === reviewItem.question_id);
      return {
        question_number: index + 1,
        question: question ? {
          id: question.id,
          title: question.title,
          type: question.type,
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          ...(question.type === 'multiple_choice' && { options: question.options })
        } : null,
        review: reviewItem
      };
    });

    const results = {
      attempt: {
        id: attempt.id,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        time_spent: attempt.time_spent,
        score: attempt.score,
        correct_answers: attempt.correct_answers,
        wrong_answers: attempt.wrong_answers,
        blank_answers: attempt.blank_answers
      },
      exam: {
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year
      },
      review: reviewData,
      statistics: {
        total_questions: attempt.questions.length,
        accuracy: attempt.questions.length > 0 
          ? Math.round((attempt.correct_answers / attempt.questions.length) * 10000) / 100
          : 0,
        passed: attempt.score >= 70,
        by_subject: {}
      }
    };

    // Calculate statistics by subject
    if (reviewData) {
      const subjectStats: any = {};
      reviewData.forEach(item => {
        if (item.question) {
          const subject = item.question.subject;
          if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, total: 0 };
          }
          subjectStats[subject].total++;
          if (item.review.is_correct) {
            subjectStats[subject].correct++;
          }
        }
      });

      // Convert to percentage
      Object.keys(subjectStats).forEach(subject => {
        const stats = subjectStats[subject];
        subjectStats[subject] = {
          ...stats,
          percentage: Math.round((stats.correct / stats.total) * 10000) / 100
        };
      });

      results.statistics.by_subject = subjectStats;
    }

    console.log('✅ [PREVIOUS-EXAMS] Results retrieved for attempt:', attemptId);
    res.json(results);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting results:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/my-attempts - Listar minhas tentativas
router.get('/my-attempts', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id || '';
    console.log('📚 [PREVIOUS-EXAMS] Getting attempts for user:', userId);

    const { 
      status,
      exam_id,
      page = '1',
      limit = '10'
    } = req.query;

    const attempts = loadPreviousExamAttempts();
    let userAttempts = attempts.filter(a => a.user_id === userId);

    // Apply filters
    if (status && typeof status === 'string') {
      userAttempts = userAttempts.filter(a => a.status === status);
    }

    if (exam_id && typeof exam_id === 'string') {
      userAttempts = userAttempts.filter(a => a.exam_id === exam_id);
    }

    // Get exam info for each attempt
    const exams = loadPreviousExams();
    const attemptsWithExamInfo = userAttempts.map(attempt => {
      const exam = exams.find(e => e.id === attempt.exam_id);
      return {
        ...attempt,
        exam: exam ? {
          id: exam.id,
          title: exam.title,
          organization: exam.organization,
          exam_board: exam.exam_board,
          position: exam.position,
          year: exam.year
        } : null
      };
    });

    // Sort by most recent first
    attemptsWithExamInfo.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedAttempts = attemptsWithExamInfo.slice(startIndex, endIndex);

    console.log(`📚 [PREVIOUS-EXAMS] Found ${userAttempts.length} attempts for user`);

    res.json({
      attempts: paginatedAttempts,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: userAttempts.length,
        total_pages: Math.ceil(userAttempts.length / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting user attempts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =========================
// SEARCH & FILTERS
// =========================

// GET /api/v1/previousexams/organizations - Listar organizações disponíveis
router.get('/search/organizations', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting available organizations');

    const exams = loadPreviousExams();
    const organizations = [...new Set(exams.map(e => e.organization))].sort();

    res.json({ organizations });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting organizations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/exam-boards - Listar bancas disponíveis
router.get('/search/exam-boards', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting available exam boards');

    const exams = loadPreviousExams();
    const examBoards = [...new Set(exams.map(e => e.exam_board))].sort();

    res.json({ exam_boards: examBoards });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting exam boards:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/positions - Listar cargos disponíveis
router.get('/search/positions', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting available positions');

    const exams = loadPreviousExams();
    const positions = [...new Set(exams.map(e => e.position))].sort();

    res.json({ positions });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting positions:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/search - Busca avançada com filtros múltiplos
router.get('/search', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Advanced search request');

    const { 
      q, // query geral
      organizations,
      exam_boards,
      positions,
      years,
      subjects,
      status,
      sort_by = 'year',
      sort_order = 'desc',
      page = '1',
      limit = '12'
    } = req.query;

    let exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();

    // General search
    if (q && typeof q === 'string') {
      const searchLower = q.toLowerCase();
      exams = exams.filter(exam => 
        exam.title.toLowerCase().includes(searchLower) ||
        exam.organization.toLowerCase().includes(searchLower) ||
        exam.position.toLowerCase().includes(searchLower) ||
        exam.exam_board.toLowerCase().includes(searchLower) ||
        exam.description?.toLowerCase().includes(searchLower) ||
        exam.subjects.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // Multi-select filters
    if (organizations && typeof organizations === 'string') {
      const orgList = (organizations as string).split(',').map((s: string) => s.trim());
      exams = exams.filter(exam => orgList.includes(exam.organization));
    }

    if (exam_boards && typeof exam_boards === 'string') {
      const boardsList = (exam_boards as string).split(',').map((s: string) => s.trim());
      exams = exams.filter(exam => boardsList.includes(exam.exam_board));
    }

    if (positions && typeof positions === 'string') {
      const positionsList = (positions as string).split(',').map((s: string) => s.trim());
      exams = exams.filter(exam => positionsList.includes(exam.position));
    }

    if (years && typeof years === 'string') {
      const yearsList = (years as string).split(',').map((s: string) => parseInt(s.trim())).filter((y: number) => !isNaN(y));
      exams = exams.filter(exam => yearsList.includes(exam.year));
    }

    if (subjects && typeof subjects === 'string') {
      const subjectsList = (subjects as string).split(',').map((s: string) => s.trim());
      exams = exams.filter(exam => 
        exam.subjects.some(subject => subjectsList.includes(subject))
      );
    }

    if (status && typeof status === 'string') {
      const statusList = (status as string).split(',').map((s: string) => s.trim() as ExamStatus);
      exams = exams.filter(exam => statusList.includes(exam.status));
    }

    // Add statistics
    exams = exams.map(exam => ({
      ...exam,
      statistics: calculateExamStatistics(exam.id, attempts)
    }));

    // Sorting
    exams.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort_by) {
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'organization':
          aValue = a.organization.toLowerCase();
          bValue = b.organization.toLowerCase();
          break;
        case 'popularity':
          aValue = a.statistics?.total_attempts || 0;
          bValue = b.statistics?.total_attempts || 0;
          break;
        case 'difficulty':
          aValue = a.statistics?.approval_rate || 100;
          bValue = b.statistics?.approval_rate || 100;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.year;
          bValue = b.year;
      }

      if (sort_order === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedExams = exams.slice(startIndex, endIndex);

    console.log(`📚 [PREVIOUS-EXAMS] Advanced search found ${exams.length} exams`);

    res.json({
      exams: paginatedExams,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: exams.length,
        total_pages: Math.ceil(exams.length / limitNum)
      },
      filters_applied: {
        query: q || null,
        organizations: organizations ? organizations.split(',').map(s => s.trim()) : [],
        exam_boards: exam_boards ? exam_boards.split(',').map(s => s.trim()) : [],
        positions: positions ? positions.split(',').map(s => s.trim()) : [],
        years: years ? years.split(',').map(s => parseInt(s.trim())).filter(y => !isNaN(y)) : [],
        subjects: subjects ? subjects.split(',').map(s => s.trim()) : [],
        status: status ? status.split(',').map(s => s.trim()) : []
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error in advanced search:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =========================
// STATISTICS & REPORTS
// =========================

// GET /api/v1/previousexams/:id/statistics - Estatísticas da prova específica
router.get('/:id/statistics', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    console.log('📚 [PREVIOUS-EXAMS] Getting statistics for exam:', id);

    const exams = loadPreviousExams();
    const exam = exams.find(e => e.id === id);

    if (!exam) {
      return res.status(404).json({ error: 'Prova anterior não encontrada' });
    }

    const attempts = loadPreviousExamAttempts();
    const examAttempts = attempts.filter(a => a.exam_id === id && a.status === 'completed');

    if (examAttempts.length === 0) {
      return res.json({
        exam_info: {
          id: exam.id,
          title: exam.title,
          organization: exam.organization,
          year: exam.year
        },
        general_stats: {
          total_attempts: 0,
          average_score: 0,
          approval_rate: 0,
          completion_rate: 0
        },
        score_distribution: {},
        difficulty_analysis: {},
        time_analysis: {}
      });
    }

    // General statistics
    const totalScore = examAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = totalScore / examAttempts.length;
    const approvedCount = examAttempts.filter(a => a.score >= 70).length;
    const approvalRate = (approvedCount / examAttempts.length) * 100;

    // Score distribution
    const scoreRanges = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71-80': 0,
      '81-90': 0,
      '91-100': 0
    };

    examAttempts.forEach(attempt => {
      const score = attempt.score;
      if (score <= 10) scoreRanges['0-10']++;
      else if (score <= 20) scoreRanges['11-20']++;
      else if (score <= 30) scoreRanges['21-30']++;
      else if (score <= 40) scoreRanges['31-40']++;
      else if (score <= 50) scoreRanges['41-50']++;
      else if (score <= 60) scoreRanges['51-60']++;
      else if (score <= 70) scoreRanges['61-70']++;
      else if (score <= 80) scoreRanges['71-80']++;
      else if (score <= 90) scoreRanges['81-90']++;
      else scoreRanges['91-100']++;
    });

    // Time analysis
    const timesSpent = examAttempts.map(a => a.time_spent).filter(t => t > 0);
    const averageTime = timesSpent.length > 0 
      ? timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length
      : 0;

    const timeAnalysis = {
      average_time_minutes: Math.round(averageTime / 60),
      fastest_completion_minutes: timesSpent.length > 0 
        ? Math.round(Math.min(...timesSpent) / 60)
        : 0,
      slowest_completion_minutes: timesSpent.length > 0 
        ? Math.round(Math.max(...timesSpent) / 60)
        : 0
    };

    const statistics = {
      exam_info: {
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year,
        total_questions: exam.total_questions,
        duration: exam.duration
      },
      general_stats: {
        total_attempts: examAttempts.length,
        average_score: Math.round(averageScore * 100) / 100,
        approval_rate: Math.round(approvalRate * 100) / 100,
        completion_rate: 100 // Só conta tentativas completed
      },
      score_distribution: scoreRanges,
      time_analysis: timeAnalysis
    };

    console.log('✅ [PREVIOUS-EXAMS] Statistics generated for exam:', id);
    res.json(statistics);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting exam statistics:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/reports/performance - Relatório de desempenho geral
router.get('/reports/performance', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting performance report');

    const exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();
    const completedAttempts = attempts.filter(a => a.status === 'completed');

    // Overall statistics
    const totalExams = exams.length;
    const totalAttempts = completedAttempts.length;
    const averageScore = totalAttempts > 0 
      ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;
    const approvalRate = totalAttempts > 0
      ? (completedAttempts.filter(a => a.score >= 70).length / totalAttempts) * 100
      : 0;

    // Performance by organization
    const organizationStats: any = {};
    exams.forEach(exam => {
      const examAttempts = completedAttempts.filter(a => a.exam_id === exam.id);
      if (!organizationStats[exam.organization]) {
        organizationStats[exam.organization] = {
          total_exams: 0,
          total_attempts: 0,
          total_score: 0,
          approved: 0
        };
      }
      
      organizationStats[exam.organization].total_exams++;
      organizationStats[exam.organization].total_attempts += examAttempts.length;
      organizationStats[exam.organization].total_score += examAttempts.reduce((sum, a) => sum + a.score, 0);
      organizationStats[exam.organization].approved += examAttempts.filter(a => a.score >= 70).length;
    });

    // Calculate percentages for organizations
    Object.keys(organizationStats).forEach(org => {
      const stats = organizationStats[org];
      organizationStats[org] = {
        ...stats,
        average_score: stats.total_attempts > 0 
          ? Math.round((stats.total_score / stats.total_attempts) * 100) / 100
          : 0,
        approval_rate: stats.total_attempts > 0
          ? Math.round((stats.approved / stats.total_attempts) * 10000) / 100
          : 0
      };
    });

    // Performance by year
    const yearStats: any = {};
    exams.forEach(exam => {
      const examAttempts = completedAttempts.filter(a => a.exam_id === exam.id);
      if (!yearStats[exam.year]) {
        yearStats[exam.year] = {
          total_exams: 0,
          total_attempts: 0,
          total_score: 0,
          approved: 0
        };
      }
      
      yearStats[exam.year].total_exams++;
      yearStats[exam.year].total_attempts += examAttempts.length;
      yearStats[exam.year].total_score += examAttempts.reduce((sum, a) => sum + a.score, 0);
      yearStats[exam.year].approved += examAttempts.filter(a => a.score >= 70).length;
    });

    // Calculate percentages for years
    Object.keys(yearStats).forEach(year => {
      const stats = yearStats[year];
      yearStats[year] = {
        ...stats,
        average_score: stats.total_attempts > 0 
          ? Math.round((stats.total_score / stats.total_attempts) * 100) / 100
          : 0,
        approval_rate: stats.total_attempts > 0
          ? Math.round((stats.approved / stats.total_attempts) * 10000) / 100
          : 0
      };
    });

    const performanceReport = {
      overview: {
        total_exams: totalExams,
        published_exams: exams.filter(e => e.status === 'published').length,
        total_attempts: totalAttempts,
        average_score: Math.round(averageScore * 100) / 100,
        approval_rate: Math.round(approvalRate * 100) / 100,
        active_users: [...new Set(completedAttempts.map(a => a.user_id))].length
      },
      by_organization: organizationStats,
      by_year: yearStats
    };

    console.log('✅ [PREVIOUS-EXAMS] Performance report generated');
    res.json(performanceReport);

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting performance report:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/reports/popular - Provas mais realizadas
router.get('/reports/popular', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { limit = '10' } = req.query;
    console.log('📚 [PREVIOUS-EXAMS] Getting popular exams report');

    const exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();
    
    // Add attempt counts and statistics to each exam
    const examsWithStats = exams.map(exam => {
      const examAttempts = attempts.filter(a => a.exam_id === exam.id && a.status === 'completed');
      const totalScore = examAttempts.reduce((sum, a) => sum + a.score, 0);
      const approvedCount = examAttempts.filter(a => a.score >= 70).length;
      
      return {
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year,
        status: exam.status,
        total_questions: exam.total_questions,
        attempts_count: examAttempts.length,
        average_score: examAttempts.length > 0 
          ? Math.round((totalScore / examAttempts.length) * 100) / 100
          : 0,
        approval_rate: examAttempts.length > 0
          ? Math.round((approvedCount / examAttempts.length) * 10000) / 100
          : 0,
        unique_users: [...new Set(examAttempts.map(a => a.user_id))].length
      };
    });

    // Sort by popularity (attempts count)
    const popularExams = examsWithStats
      .filter(exam => exam.status === 'published')
      .sort((a, b) => b.attempts_count - a.attempts_count)
      .slice(0, parseInt(limit as string));

    console.log(`✅ [PREVIOUS-EXAMS] Popular exams report generated (top ${limit})`);
    res.json({
      popular_exams: popularExams,
      metadata: {
        total_published_exams: exams.filter(e => e.status === 'published').length,
        report_limit: parseInt(limit as string),
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting popular exams report:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/v1/previousexams/reports/difficulty - Análise de dificuldade por prova
router.get('/reports/difficulty', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS] Getting difficulty analysis report');

    const exams = loadPreviousExams();
    const attempts = loadPreviousExamAttempts();
    
    const difficultyAnalysis = exams
      .filter(exam => exam.status === 'published')
      .map(exam => {
        const examAttempts = attempts.filter(a => a.exam_id === exam.id && a.status === 'completed');
        
        if (examAttempts.length === 0) {
          return {
            id: exam.id,
            title: exam.title,
            organization: exam.organization,
            exam_board: exam.exam_board,
            position: exam.position,
            year: exam.year,
            total_questions: exam.total_questions,
            attempts_count: 0,
            average_score: 0,
            approval_rate: 0,
            difficulty_level: 'N/A',
            difficulty_score: 0
          };
        }

        const totalScore = examAttempts.reduce((sum, a) => sum + a.score, 0);
        const averageScore = totalScore / examAttempts.length;
        const approvalRate = (examAttempts.filter(a => a.score >= 70).length / examAttempts.length) * 100;
        
        // Difficulty classification based on approval rate
        let difficultyLevel: string;
        let difficultyScore: number;
        
        if (approvalRate >= 80) {
          difficultyLevel = 'Muito Fácil';
          difficultyScore = 1;
        } else if (approvalRate >= 60) {
          difficultyLevel = 'Fácil';
          difficultyScore = 2;
        } else if (approvalRate >= 40) {
          difficultyLevel = 'Médio';
          difficultyScore = 3;
        } else if (approvalRate >= 20) {
          difficultyLevel = 'Difícil';
          difficultyScore = 4;
        } else {
          difficultyLevel = 'Muito Difícil';
          difficultyScore = 5;
        }

        return {
          id: exam.id,
          title: exam.title,
          organization: exam.organization,
          exam_board: exam.exam_board,
          position: exam.position,
          year: exam.year,
          total_questions: exam.total_questions,
          attempts_count: examAttempts.length,
          average_score: Math.round(averageScore * 100) / 100,
          approval_rate: Math.round(approvalRate * 100) / 100,
          difficulty_level: difficultyLevel,
          difficulty_score: difficultyScore
        };
      })
      .filter(exam => exam.attempts_count >= 3) // Só incluir exames com pelo menos 3 tentativas
      .sort((a, b) => b.difficulty_score - a.difficulty_score); // Mais difíceis primeiro

    // Summary statistics
    const summary = {
      total_analyzed_exams: difficultyAnalysis.length,
      difficulty_distribution: {
        'Muito Fácil': difficultyAnalysis.filter(e => e.difficulty_level === 'Muito Fácil').length,
        'Fácil': difficultyAnalysis.filter(e => e.difficulty_level === 'Fácil').length,
        'Médio': difficultyAnalysis.filter(e => e.difficulty_level === 'Médio').length,
        'Difícil': difficultyAnalysis.filter(e => e.difficulty_level === 'Difícil').length,
        'Muito Difícil': difficultyAnalysis.filter(e => e.difficulty_level === 'Muito Difícil').length
      },
      hardest_exams: difficultyAnalysis.slice(0, 5),
      easiest_exams: difficultyAnalysis.slice(-5).reverse()
    };

    console.log('✅ [PREVIOUS-EXAMS] Difficulty analysis report generated');
    res.json({
      summary,
      all_exams: difficultyAnalysis,
      metadata: {
        minimum_attempts_threshold: 3,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS] Error getting difficulty analysis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;