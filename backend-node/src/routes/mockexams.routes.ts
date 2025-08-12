import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { Question } from './questions.routes';

const router = Router();

// Mock exams data storage
const mockExamsPath = path.join(__dirname, '../../data/mockexams.json');
const examAttemptsPath = path.join(__dirname, '../../data/exam-attempts.json');
const questionsPath = path.join(__dirname, '../../data/questions.json');

// Ensure data directory exists
const dataDir = path.dirname(mockExamsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
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
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  questions: string[]; // Question IDs selected for this attempt
  answers: Record<string, any>; // questionId -> user answer
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
}

// Default mock exams for demonstration
const defaultMockExams: MockExam[] = [
  {
    id: 'me1',
    title: 'Simulado Polícia Federal - Agente 2024',
    description: 'Simulado completo baseado no último edital da Polícia Federal para o cargo de Agente.',
    type: 'AUTOMATIC',
    difficulty: 'SARGENTO',
    duration: 240,
    total_questions: 120,
    filters: {
      subjects: ['Direito Constitucional', 'Direito Administrativo', 'Direito Penal'],
      exam_boards: ['CESPE'],
      years: [2023, 2024]
    },
    passing_score: 60,
    max_attempts: 3,
    available_from: '2024-01-01T00:00:00Z',
    available_until: '2024-12-31T23:59:59Z',
    status: 'published',
    created_by: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    total_attempts: 1250,
    completed_attempts: 1180,
    average_score: 58.5,
    pass_rate: 42.3
  },
  {
    id: 'me2',
    title: 'Simulado PRF - Policial Rodoviário 2024',
    description: 'Preparatório para concurso da PRF com questões atualizadas.',
    type: 'RANDOM',
    difficulty: 'CABO',
    duration: 180,
    total_questions: 80,
    passing_score: 50,
    max_attempts: 5,
    status: 'published',
    created_by: '1',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    total_attempts: 980,
    completed_attempts: 923,
    average_score: 52.3,
    pass_rate: 51.8
  },
  {
    id: 'me3',
    title: 'Simulado Direito Constitucional - Básico',
    description: 'Simulado focado em princípios fundamentais da Constituição.',
    type: 'MANUAL',
    difficulty: 'RECRUTA',
    duration: 90,
    total_questions: 30,
    questions: ['q1', 'q2'], // Specific question IDs
    passing_score: 70,
    max_attempts: 10,
    status: 'published',
    created_by: '1',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    total_attempts: 650,
    completed_attempts: 612,
    average_score: 68.4,
    pass_rate: 73.5
  }
];

// Load or initialize mock exams
let mockExams: MockExam[] = [];
if (fs.existsSync(mockExamsPath)) {
  try {
    mockExams = JSON.parse(fs.readFileSync(mockExamsPath, 'utf-8'));
  } catch {
    mockExams = [...defaultMockExams];
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));
  }
} else {
  mockExams = [...defaultMockExams];
  fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));
}

// Load or initialize exam attempts
let examAttempts: ExamAttempt[] = [];
if (fs.existsSync(examAttemptsPath)) {
  try {
    examAttempts = JSON.parse(fs.readFileSync(examAttemptsPath, 'utf-8'));
  } catch {
    examAttempts = [];
    fs.writeFileSync(examAttemptsPath, JSON.stringify(examAttempts, null, 2));
  }
} else {
  examAttempts = [];
  fs.writeFileSync(examAttemptsPath, JSON.stringify(examAttempts, null, 2));
}

// Helper function to load questions
function loadQuestions(): Question[] {
  try {
    if (fs.existsSync(questionsPath)) {
      return JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    }
    return [];
  } catch {
    return [];
  }
}

// Helper function to generate questions for an exam
function generateQuestionsForExam(exam: MockExam): string[] {
  const questions = loadQuestions().filter(q => q.status === 'published');
  
  if (exam.type === 'MANUAL' && exam.questions) {
    return exam.questions.slice(0, exam.total_questions);
  }
  
  let filteredQuestions = questions;
  
  if (exam.type === 'AUTOMATIC' && exam.filters) {
    filteredQuestions = questions.filter(q => {
      const matchesSubject = !exam.filters?.subjects || exam.filters.subjects.includes(q.subject);
      const matchesTopic = !exam.filters?.topics || (q.topic && exam.filters.topics.includes(q.topic));
      const matchesBoard = !exam.filters?.exam_boards || (q.exam_board && exam.filters.exam_boards.includes(q.exam_board));
      const matchesYear = !exam.filters?.years || (q.exam_year && exam.filters.years.includes(parseInt(q.exam_year)));
      
      return matchesSubject && matchesTopic && matchesBoard && matchesYear;
    });
  }
  
  // Filter by difficulty
  if (exam.difficulty !== 'MIXED') {
    const difficultyMap: Record<DifficultyLevel, string> = { 'RECRUTA': 'easy', 'CABO': 'medium', 'SARGENTO': 'hard', 'MIXED': 'mixed' };
    const targetDifficulty = difficultyMap[exam.difficulty];
    if (targetDifficulty && targetDifficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === targetDifficulty);
    }
  }
  
  // Shuffle and select questions
  const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, exam.total_questions).map(q => q.id);
}

// Helper function to calculate exam score
function calculateExamScore(questions: Question[], answers: Record<string, any>): {
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  review: ExamAttempt['review'];
} {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  const review: ExamAttempt['review'] = [];
  
  questions.forEach(question => {
    const userAnswer = answers[question.id];
    const isBlank = userAnswer === undefined || userAnswer === null || userAnswer === '';
    
    if (isBlank) {
      blank++;
      review?.push({
        question_id: question.id,
        is_correct: false,
        user_answer: null,
        correct_answer: getCorrectAnswer(question),
        explanation: question.explanation
      });
      return;
    }
    
    const isCorrect = checkAnswer(question, userAnswer);
    if (isCorrect) {
      correct++;
    } else {
      wrong++;
    }
    
    review?.push({
      question_id: question.id,
      is_correct: isCorrect,
      user_answer: userAnswer,
      correct_answer: getCorrectAnswer(question),
      explanation: question.explanation
    });
  });
  
  const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
  
  return { score: Number(score.toFixed(1)), correct, wrong, blank, review };
}

// Helper function to get correct answer
function getCorrectAnswer(question: Question) {
  switch (question.type) {
    case 'multiple_choice':
      return question.correct_answer;
    case 'true_false':
      return question.correct_boolean;
    case 'fill_blank':
    case 'essay':
      return question.expected_answer;
    default:
      return null;
  }
}

// Helper function to check if answer is correct
function checkAnswer(question: Question, userAnswer: any): boolean {
  switch (question.type) {
    case 'multiple_choice':
      return parseInt(userAnswer) === question.correct_answer;
    case 'true_false':
      return Boolean(userAnswer) === question.correct_boolean;
    case 'fill_blank':
      if (!question.expected_answer) return false;
      return userAnswer.toString().toLowerCase().trim() === question.expected_answer.toLowerCase().trim();
    case 'essay':
      // For essays, we'll need manual review, so return false for auto-grading
      return false;
    default:
      return false;
  }
}

// Update exam statistics
function updateExamStats(examId: string, _score: number, _passed: boolean): void {
  const examIndex = mockExams.findIndex(e => e.id === examId);
  if (examIndex === -1) return;
  
  const exam = mockExams[examIndex];
  exam.completed_attempts = (exam.completed_attempts || 0) + 1;
  
  // Recalculate average score
  const allCompletedAttempts = examAttempts.filter(a => a.exam_id === examId && a.status === 'completed');
  if (allCompletedAttempts.length > 0) {
    exam.average_score = allCompletedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / allCompletedAttempts.length;
    exam.pass_rate = (allCompletedAttempts.filter(a => a.score >= exam.passing_score).length / allCompletedAttempts.length) * 100;
  }
  
  exam.updated_at = new Date().toISOString();
  mockExams[examIndex] = exam;
  fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));
}

// GET /api/v1/mockexams - List mock exams (with filters)
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').toLowerCase();
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const created_by = req.query.created_by as string;

    // Filter mock exams
    let filteredExams = mockExams.filter(exam => {
      const matchesSearch = !search || 
        exam.title.toLowerCase().includes(search) ||
        exam.description.toLowerCase().includes(search);

      const matchesDifficulty = !difficulty || exam.difficulty === difficulty;
      const matchesType = !type || exam.type === type;
      const matchesStatus = !status || exam.status === status;
      const matchesCreator = !created_by || exam.created_by === created_by;

      return matchesSearch && matchesDifficulty && matchesType && matchesStatus && matchesCreator;
    });

    // For students, only show published exams
    if (req.user?.role === 'student') {
      filteredExams = filteredExams.filter(exam => exam.status === 'published');
    }

    // Sort by creation date (newest first)
    filteredExams.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExams = filteredExams.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalPages = Math.ceil(filteredExams.length / limit);

    res.json({
      success: true,
      data: paginatedExams,
      pagination: {
        page,
        limit,
        total: filteredExams.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error listing mock exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar simulados' 
    });
  }
});

// GET /api/v1/mockexams/available - List available mock exams for students
router.get('/available', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas estudantes' 
      });
      return;
    }

    const now = new Date();
    const availableExams = mockExams.filter(exam => {
      const isPublished = exam.status === 'published';
      const isAvailable = (!exam.available_from || new Date(exam.available_from) <= now) &&
                         (!exam.available_until || new Date(exam.available_until) >= now);
      
      return isPublished && isAvailable;
    });

    // Get user's attempt counts
    const userId = req.user.id.toString();
    const examsWithAttempts = availableExams.map(exam => {
      const userAttempts = examAttempts.filter(a => a.exam_id === exam.id && a.user_id === userId);
      const canTakeExam = userAttempts.length < exam.max_attempts;
      const inProgressAttempt = userAttempts.find(a => a.status === 'in_progress');
      
      return {
        ...exam,
        user_attempts: userAttempts.length,
        can_take_exam: canTakeExam,
        has_in_progress: !!inProgressAttempt,
        in_progress_attempt_id: inProgressAttempt?.id
      };
    });

    res.json({
      success: true,
      data: examsWithAttempts
    });
  } catch (error) {
    console.error('Error listing available mock exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar simulados disponíveis' 
    });
  }
});

// GET /api/v1/mockexams/:id - Get single mock exam
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const exam = mockExams.find(e => e.id === req.params.id);
    
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Check permissions
    if (req.user?.role === 'student' && exam.status !== 'published') {
      res.status(403).json({ 
        success: false,
        message: 'Simulado não disponível' 
      });
      return;
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error getting mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar simulado' 
    });
  }
});

// POST /api/v1/mockexams - Create new mock exam (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem criar simulados' 
    });
    return;
  }

  try {
    const {
      title,
      description,
      type,
      difficulty,
      duration,
      total_questions,
      questions,
      filters,
      passing_score,
      max_attempts,
      available_from,
      available_until,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !difficulty || !duration || !total_questions || !passing_score || !max_attempts) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios faltando' 
      });
      return;
    }

    // Validate type-specific requirements
    if (type === 'MANUAL' && (!questions || !Array.isArray(questions))) {
      res.status(400).json({ 
        success: false,
        message: 'Simulados manuais precisam ter questões específicas' 
      });
      return;
    }

    if (type === 'AUTOMATIC' && !filters) {
      res.status(400).json({ 
        success: false,
        message: 'Simulados automáticos precisam ter filtros' 
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `me_${timestamp}_${random}`;

    // Create new mock exam
    const newExam: MockExam = {
      id: newId,
      title,
      description,
      type,
      difficulty,
      duration,
      total_questions,
      questions: type === 'MANUAL' ? questions : undefined,
      filters: type === 'AUTOMATIC' ? filters : undefined,
      passing_score,
      max_attempts,
      available_from,
      available_until,
      status,
      created_by: req.user.id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_attempts: 0,
      completed_attempts: 0,
      average_score: 0,
      pass_rate: 0
    };

    // Add to array and save
    mockExams.push(newExam);
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado criado com sucesso',
      data: newExam
    });
  } catch (error) {
    console.error('Error creating mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar simulado' 
    });
  }
});

// PUT /api/v1/mockexams/:id - Update mock exam (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem editar simulados' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const examIndex = mockExams.findIndex(e => e.id === examId);

    if (examIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    const existingExam = mockExams[examIndex];
    
    // Check if exam has attempts (maybe prevent certain changes)
    const hasAttempts = examAttempts.some(a => a.exam_id === examId);
    if (hasAttempts && req.body.total_questions && req.body.total_questions !== existingExam.total_questions) {
      res.status(400).json({ 
        success: false,
        message: 'Não é possível alterar número de questões em simulado com tentativas' 
      });
      return;
    }

    // Update exam data (preserve statistics and audit fields)
    const updatedExam: MockExam = {
      ...existingExam,
      ...req.body,
      id: existingExam.id, // Don't allow ID change
      total_attempts: existingExam.total_attempts, // Preserve stats
      completed_attempts: existingExam.completed_attempts, // Preserve stats
      average_score: existingExam.average_score, // Preserve stats
      pass_rate: existingExam.pass_rate, // Preserve stats
      created_by: existingExam.created_by, // Preserve creator
      created_at: existingExam.created_at, // Preserve creation date
      updated_at: new Date().toISOString()
    };

    mockExams[examIndex] = updatedExam;
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado atualizado com sucesso',
      data: updatedExam
    });
  } catch (error) {
    console.error('Error updating mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar simulado' 
    });
  }
});

// DELETE /api/v1/mockexams/:id - Delete mock exam (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem excluir simulados' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const examIndex = mockExams.findIndex(e => e.id === examId);

    if (examIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Check if exam has attempts
    const hasAttempts = examAttempts.some(a => a.exam_id === examId);
    if (hasAttempts) {
      res.status(400).json({ 
        success: false,
        message: 'Não é possível excluir simulado com tentativas. Considere arquivar.' 
      });
      return;
    }

    // Remove exam
    mockExams.splice(examIndex, 1);
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir simulado' 
    });
  }
});

// POST /api/v1/mockexams/:id/publish - Publish mock exam (admin only)
router.post('/:id/publish', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const examIndex = mockExams.findIndex(e => e.id === examId);

    if (examIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    mockExams[examIndex].status = 'published';
    mockExams[examIndex].updated_at = new Date().toISOString();
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado publicado com sucesso',
      data: mockExams[examIndex]
    });
  } catch (error) {
    console.error('Error publishing mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao publicar simulado' 
    });
  }
});

// POST /api/v1/mockexams/:id/archive - Archive mock exam (admin only)
router.post('/:id/archive', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const examIndex = mockExams.findIndex(e => e.id === examId);

    if (examIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    mockExams[examIndex].status = 'archived';
    mockExams[examIndex].updated_at = new Date().toISOString();
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado arquivado com sucesso',
      data: mockExams[examIndex]
    });
  } catch (error) {
    console.error('Error archiving mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao arquivar simulado' 
    });
  }
});

// POST /api/v1/mockexams/:id/duplicate - Duplicate mock exam (admin only)
router.post('/:id/duplicate', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const exam = mockExams.find(e => e.id === examId);

    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `me_${timestamp}_${random}`;

    // Create duplicate
    const duplicatedExam: MockExam = {
      ...exam,
      id: newId,
      title: `${exam.title} (Cópia)`,
      status: 'draft',
      created_by: req.user.id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_attempts: 0,
      completed_attempts: 0,
      average_score: 0,
      pass_rate: 0
    };

    mockExams.push(duplicatedExam);
    fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));

    res.json({
      success: true,
      message: 'Simulado duplicado com sucesso',
      data: duplicatedExam
    });
  } catch (error) {
    console.error('Error duplicating mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao duplicar simulado' 
    });
  }
});

// GET /api/v1/mockexams/:id/preview - Preview exam questions (admin only)
router.get('/:id/preview', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const exam = mockExams.find(e => e.id === req.params.id);
    
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Generate questions for preview
    const questionIds = generateQuestionsForExam(exam);
    const questions = loadQuestions().filter(q => questionIds.includes(q.id));

    res.json({
      success: true,
      data: {
        exam,
        questions: questions.map(q => ({
          id: q.id,
          title: q.title,
          type: q.type,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty
        }))
      }
    });
  } catch (error) {
    console.error('Error previewing mock exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao visualizar simulado' 
    });
  }
});

// POST /api/v1/mockexams/:id/start - Start exam attempt (student only)
router.post('/:id/start', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const exam = mockExams.find(e => e.id === examId);
    
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    if (exam.status !== 'published') {
      res.status(400).json({ 
        success: false,
        message: 'Simulado não disponível' 
      });
      return;
    }

    const userId = req.user.id.toString();
    
    // Check if user has reached max attempts
    const userAttempts = examAttempts.filter(a => a.exam_id === examId && a.user_id === userId);
    if (userAttempts.length >= exam.max_attempts) {
      res.status(400).json({ 
        success: false,
        message: `Limite de tentativas atingido (${exam.max_attempts})` 
      });
      return;
    }

    // Check if user has an in-progress attempt
    const inProgressAttempt = userAttempts.find(a => a.status === 'in_progress');
    if (inProgressAttempt) {
      res.status(400).json({ 
        success: false,
        message: 'Você já tem uma tentativa em andamento',
        data: { attempt_id: inProgressAttempt.id }
      });
      return;
    }

    // Generate questions for this attempt
    const questionIds = generateQuestionsForExam(exam);
    
    if (questionIds.length < exam.total_questions) {
      res.status(400).json({ 
        success: false,
        message: 'Não há questões suficientes para este simulado' 
      });
      return;
    }

    // Create new attempt
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const attemptId = `ea_${timestamp}_${random}`;

    const newAttempt: ExamAttempt = {
      id: attemptId,
      exam_id: examId,
      user_id: userId,
      user_name: req.user.name,
      questions: questionIds,
      answers: {},
      started_at: new Date().toISOString(),
      time_spent: 0,
      score: 0,
      correct_answers: 0,
      wrong_answers: 0,
      blank_answers: 0,
      status: 'in_progress'
    };

    examAttempts.push(newAttempt);
    fs.writeFileSync(examAttemptsPath, JSON.stringify(examAttempts, null, 2));

    // Update exam total attempts
    const examIndex = mockExams.findIndex(e => e.id === examId);
    if (examIndex !== -1) {
      mockExams[examIndex].total_attempts++;
      fs.writeFileSync(mockExamsPath, JSON.stringify(mockExams, null, 2));
    }

    res.json({
      success: true,
      message: 'Simulado iniciado com sucesso',
      data: {
        attempt_id: attemptId,
        exam_title: exam.title,
        duration_minutes: exam.duration,
        total_questions: exam.total_questions,
        started_at: newAttempt.started_at
      }
    });
  } catch (error) {
    console.error('Error starting exam attempt:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao iniciar simulado' 
    });
  }
});

// GET /api/v1/mockexams/attempts/:attemptId - Get exam attempt details
router.get('/attempts/:attemptId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const attemptId = req.params.attemptId;
    const attempt = examAttempts.find(a => a.id === attemptId);
    
    if (!attempt) {
      res.status(404).json({ 
        success: false,
        message: 'Tentativa não encontrada' 
      });
      return;
    }

    const userId = req.user?.id.toString();
    
    // Check permissions
    if (req.user?.role === 'student' && attempt.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Get exam info
    const exam = mockExams.find(e => e.id === attempt.exam_id);
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Get questions (don't send answers for in-progress attempts)
    const questions = loadQuestions().filter(q => attempt.questions.includes(q.id));
    const questionsData = questions.map(q => {
      if (attempt.status === 'in_progress' && req.user?.role === 'student') {
        // Don't send correct answers while exam is in progress
        const { correct_answer, correct_boolean, expected_answer, ...safeQuestion } = q;
        return safeQuestion;
      }
      return q;
    });

    res.json({
      success: true,
      data: {
        attempt,
        exam,
        questions: questionsData
      }
    });
  } catch (error) {
    console.error('Error getting exam attempt:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar tentativa' 
    });
  }
});

// POST /api/v1/mockexams/attempts/:attemptId/answer - Save answer
router.post('/attempts/:attemptId/answer', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const attemptId = req.params.attemptId;
    const { question_id, answer } = req.body;

    const attemptIndex = examAttempts.findIndex(a => a.id === attemptId);
    
    if (attemptIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Tentativa não encontrada' 
      });
      return;
    }

    const attempt = examAttempts[attemptIndex];
    const userId = req.user.id.toString();
    
    // Check permissions and status
    if (attempt.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (attempt.status !== 'in_progress') {
      res.status(400).json({ 
        success: false,
        message: 'Tentativa não está em andamento' 
      });
      return;
    }

    // Validate question belongs to this attempt
    if (!attempt.questions.includes(question_id)) {
      res.status(400).json({ 
        success: false,
        message: 'Questão não pertence a esta tentativa' 
      });
      return;
    }

    // Save answer
    attempt.answers[question_id] = answer;
    examAttempts[attemptIndex] = attempt;
    fs.writeFileSync(examAttemptsPath, JSON.stringify(examAttempts, null, 2));

    res.json({
      success: true,
      message: 'Resposta salva com sucesso'
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao salvar resposta' 
    });
  }
});

// POST /api/v1/mockexams/attempts/:attemptId/submit - Submit exam
router.post('/attempts/:attemptId/submit', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const attemptId = req.params.attemptId;
    const { time_spent } = req.body; // time in seconds

    const attemptIndex = examAttempts.findIndex(a => a.id === attemptId);
    
    if (attemptIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Tentativa não encontrada' 
      });
      return;
    }

    const attempt = examAttempts[attemptIndex];
    const userId = req.user.id.toString();
    
    // Check permissions and status
    if (attempt.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (attempt.status !== 'in_progress') {
      res.status(400).json({ 
        success: false,
        message: 'Tentativa já foi submetida' 
      });
      return;
    }

    // Get exam and questions
    const exam = mockExams.find(e => e.id === attempt.exam_id);
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    const questions = loadQuestions().filter(q => attempt.questions.includes(q.id));
    
    // Calculate score
    const results = calculateExamScore(questions, attempt.answers);
    const passed = results.score >= exam.passing_score;

    // Update attempt
    attempt.submitted_at = new Date().toISOString();
    attempt.time_spent = time_spent || 0;
    attempt.score = results.score;
    attempt.correct_answers = results.correct;
    attempt.wrong_answers = results.wrong;
    attempt.blank_answers = results.blank;
    attempt.status = 'completed';
    attempt.review = results.review;

    examAttempts[attemptIndex] = attempt;
    fs.writeFileSync(examAttemptsPath, JSON.stringify(examAttempts, null, 2));

    // Update exam statistics
    updateExamStats(exam.id, results.score, passed);

    res.json({
      success: true,
      message: 'Simulado submetido com sucesso',
      data: {
        attempt_id: attemptId,
        score: results.score,
        correct_answers: results.correct,
        wrong_answers: results.wrong,
        blank_answers: results.blank,
        passed,
        passing_score: exam.passing_score,
        time_spent: attempt.time_spent
      }
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao submeter simulado' 
    });
  }
});

// GET /api/v1/mockexams/attempts/:attemptId/results - Get exam results
router.get('/attempts/:attemptId/results', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const attemptId = req.params.attemptId;
    const attempt = examAttempts.find(a => a.id === attemptId);
    
    if (!attempt) {
      res.status(404).json({ 
        success: false,
        message: 'Tentativa não encontrada' 
      });
      return;
    }

    const userId = req.user?.id.toString();
    
    // Check permissions
    if (req.user?.role === 'student' && attempt.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (attempt.status !== 'completed') {
      res.status(400).json({ 
        success: false,
        message: 'Simulado ainda não foi finalizado' 
      });
      return;
    }

    // Get exam info
    const exam = mockExams.find(e => e.id === attempt.exam_id);
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Get questions with full details for review
    const questions = loadQuestions().filter(q => attempt.questions.includes(q.id));

    res.json({
      success: true,
      data: {
        attempt,
        exam,
        questions,
        passed: attempt.score >= exam.passing_score
      }
    });
  } catch (error) {
    console.error('Error getting exam results:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar resultados' 
    });
  }
});

// GET /api/v1/mockexams/my-attempts - List user's attempts
router.get('/my-attempts', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const userId = req.user.id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get user's attempts
    let userAttempts = examAttempts.filter(a => a.user_id === userId);

    // Sort by start date (newest first)
    userAttempts.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAttempts = userAttempts.slice(startIndex, endIndex);

    // Get exam titles
    const attemptsWithExamInfo = paginatedAttempts.map(attempt => {
      const exam = mockExams.find(e => e.id === attempt.exam_id);
      return {
        ...attempt,
        exam_title: exam?.title || 'Simulado não encontrado',
        exam_difficulty: exam?.difficulty,
        exam_passing_score: exam?.passing_score,
        passed: attempt.status === 'completed' ? attempt.score >= (exam?.passing_score || 0) : false
      };
    });

    const totalPages = Math.ceil(userAttempts.length / limit);

    res.json({
      success: true,
      data: attemptsWithExamInfo,
      pagination: {
        page,
        limit,
        total: userAttempts.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error listing user attempts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar tentativas' 
    });
  }
});

// GET /api/v1/mockexams/:id/statistics - Get exam statistics (admin only)
router.get('/:id/statistics', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const examId = req.params.id;
    const exam = mockExams.find(e => e.id === examId);
    
    if (!exam) {
      res.status(404).json({ 
        success: false,
        message: 'Simulado não encontrado' 
      });
      return;
    }

    // Get all attempts for this exam
    const examAttemptsList = examAttempts.filter(a => a.exam_id === examId);
    const completedAttempts = examAttemptsList.filter(a => a.status === 'completed');

    // Calculate statistics
    const stats = {
      total_attempts: examAttemptsList.length,
      completed_attempts: completedAttempts.length,
      in_progress_attempts: examAttemptsList.filter(a => a.status === 'in_progress').length,
      abandoned_attempts: examAttemptsList.filter(a => a.status === 'abandoned').length,
      
      average_score: completedAttempts.length > 0 
        ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length
        : 0,
      
      pass_rate: completedAttempts.length > 0 
        ? (completedAttempts.filter(a => a.score >= exam.passing_score).length / completedAttempts.length) * 100
        : 0,
      
      average_time: completedAttempts.length > 0 
        ? completedAttempts.reduce((sum, a) => sum + a.time_spent, 0) / completedAttempts.length
        : 0,

      score_distribution: {
        '0-20': completedAttempts.filter(a => a.score < 20).length,
        '20-40': completedAttempts.filter(a => a.score >= 20 && a.score < 40).length,
        '40-60': completedAttempts.filter(a => a.score >= 40 && a.score < 60).length,
        '60-80': completedAttempts.filter(a => a.score >= 60 && a.score < 80).length,
        '80-100': completedAttempts.filter(a => a.score >= 80).length,
      }
    };

    res.json({
      success: true,
      data: {
        exam,
        statistics: {
          ...stats,
          average_score: Number(stats.average_score.toFixed(1)),
          pass_rate: Number(stats.pass_rate.toFixed(1)),
          average_time_minutes: Number((stats.average_time / 60).toFixed(1))
        }
      }
    });
  } catch (error) {
    console.error('Error getting exam statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

// GET /api/v1/mockexams/reports/performance - Performance report (admin only)
router.get('/reports/performance', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const completedAttempts = examAttempts.filter(a => a.status === 'completed');
    
    // Overall statistics
    const overallStats = {
      total_exams: mockExams.length,
      published_exams: mockExams.filter(e => e.status === 'published').length,
      total_attempts: examAttempts.length,
      completed_attempts: completedAttempts.length,
      
      overall_average_score: completedAttempts.length > 0 
        ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length
        : 0,
      
      overall_pass_rate: completedAttempts.length > 0 
        ? (completedAttempts.filter(a => {
            const exam = mockExams.find(e => e.id === a.exam_id);
            return exam && a.score >= exam.passing_score;
          }).length / completedAttempts.length) * 100
        : 0
    };

    // Top performing exams
    const examStats = mockExams.map(exam => {
      const examAttemptsList = completedAttempts.filter(a => a.exam_id === exam.id);
      const avgScore = examAttemptsList.length > 0 
        ? examAttemptsList.reduce((sum, a) => sum + a.score, 0) / examAttemptsList.length
        : 0;
      const passRate = examAttemptsList.length > 0 
        ? (examAttemptsList.filter(a => a.score >= exam.passing_score).length / examAttemptsList.length) * 100
        : 0;
      
      return {
        id: exam.id,
        title: exam.title,
        attempts: examAttemptsList.length,
        average_score: Number(avgScore.toFixed(1)),
        pass_rate: Number(passRate.toFixed(1))
      };
    }).sort((a, b) => b.average_score - a.average_score);

    res.json({
      success: true,
      data: {
        overall: {
          ...overallStats,
          overall_average_score: Number(overallStats.overall_average_score.toFixed(1)),
          overall_pass_rate: Number(overallStats.overall_pass_rate.toFixed(1))
        },
        top_exams: examStats.slice(0, 10),
        all_exams: examStats
      }
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao gerar relatório' 
    });
  }
});

export default router;