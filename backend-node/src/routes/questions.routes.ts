import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Questions data storage
const questionsPath = path.join(__dirname, '../../data/questions.json');

// Ensure data directory exists
const dataDir = path.dirname(questionsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
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

// Default questions for demonstration
const defaultQuestions: Question[] = [
  {
    id: 'q1',
    title: 'Qual é o princípio constitucional que garante a igualdade perante a lei?',
    type: 'multiple_choice',
    subject: 'Direito Constitucional',
    topic: 'Princípios Fundamentais',
    category_id: '1.1.1', // Link para categoria existente
    difficulty: 'medium',
    options: [
      'Princípio da Legalidade',
      'Princípio da Isonomia',
      'Princípio da Moralidade',
      'Princípio da Publicidade'
    ],
    correct_answer: 1,
    explanation: 'O Princípio da Isonomia estabelece que todos são iguais perante a lei, conforme previsto no art. 5º da Constituição Federal.',
    exam_board: 'CESPE',
    exam_year: '2023',
    exam_name: 'Concurso Público Federal',
    reference: 'CF/88, Art. 5º, caput',
    tags: ['constitucional', 'princípios', 'isonomia', 'igualdade'],
    status: 'published',
    times_answered: 1234,
    times_correct: 968,
    correct_rate: 78.4,
    author_id: '1',
    author_name: 'Prof. Carlos Lima',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'q2',
    title: 'A Constituição Federal de 1988 estabelece o sistema presidencialista de governo.',
    type: 'true_false',
    subject: 'Direito Constitucional',
    topic: 'Sistema de Governo',
    category_id: '1.1',
    difficulty: 'easy',
    correct_boolean: true,
    explanation: 'Correto. O Brasil adota o sistema presidencialista, onde o Presidente é chefe de Estado e de Governo.',
    exam_board: 'FCC',
    exam_year: '2024',
    exam_name: 'Tribunal de Contas',
    reference: 'CF/88, Art. 76 e seguintes',
    tags: ['constitucional', 'presidencialismo', 'governo'],
    status: 'published',
    times_answered: 876,
    times_correct: 789,
    correct_rate: 90.1,
    author_id: '1',
    author_name: 'Prof. Carlos Lima',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'q3',
    title: 'Complete: Os direitos fundamentais podem ser _______ em situações excepcionais.',
    type: 'fill_blank',
    subject: 'Direito Constitucional',
    topic: 'Direitos Fundamentais',
    category_id: '1.1.2',
    difficulty: 'hard',
    expected_answer: 'suspensos ou limitados',
    explanation: 'Os direitos fundamentais podem ser suspensos durante estado de defesa ou sítio, conforme arts. 136 e 139 da CF/88.',
    exam_board: 'VUNESP',
    exam_year: '2023',
    exam_name: 'Defensoria Pública',
    reference: 'CF/88, Arts. 136 e 139',
    tags: ['direitos fundamentais', 'suspensão', 'estado exceção'],
    status: 'published',
    times_answered: 456,
    times_correct: 234,
    correct_rate: 51.3,
    author_id: '1',
    author_name: 'Prof. Ana Santos',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'q4',
    title: 'Explique o conceito de separação dos poderes e sua importância no Estado Democrático de Direito.',
    type: 'essay',
    subject: 'Direito Constitucional',
    topic: 'Separação dos Poderes',
    category_id: '1.1',
    difficulty: 'hard',
    expected_answer: 'A separação dos poderes é um princípio que divide o poder estatal em três funções: legislativa, executiva e judiciária. Cada poder possui suas competências específicas e serve como limite aos demais, evitando a concentração de poder e garantindo o equilíbrio democrático.',
    explanation: 'Resposta deve abordar: conceito, três poderes (funções), sistema de freios e contrapesos, importância democrática.',
    exam_board: 'CESPE',
    exam_year: '2024',
    exam_name: 'Magistratura Federal',
    reference: 'CF/88, Art. 2º; Montesquieu - Do Espírito das Leis',
    tags: ['separação poderes', 'montesquieu', 'democracia', 'executivo', 'legislativo', 'judiciário'],
    status: 'published',
    times_answered: 234,
    times_correct: 156,
    correct_rate: 66.7,
    author_id: '1',
    author_name: 'Prof. Carlos Lima',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: 'q5',
    title: 'Qual das alternativas apresenta corretamente os princípios da Administração Pública?',
    type: 'multiple_choice',
    subject: 'Direito Administrativo',
    topic: 'Princípios Administrativos',
    category_id: '1.2',
    difficulty: 'medium',
    options: [
      'Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência',
      'Legalidade, Personalidade, Moralidade, Publicidade e Eficácia',
      'Constitucionalidade, Impessoalidade, Ética, Publicidade e Eficiência',
      'Legalidade, Pessoalidade, Moralidade, Transparência e Eficiência'
    ],
    correct_answer: 0,
    explanation: 'Os princípios expressos da Administração Pública estão previstos no art. 37, caput, da CF/88: LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência).',
    exam_board: 'FGV',
    exam_year: '2023',
    exam_name: 'Tribunal de Contas',
    reference: 'CF/88, Art. 37, caput',
    tags: ['administrativo', 'princípios', 'LIMPE', 'administração pública'],
    status: 'published',
    times_answered: 2156,
    times_correct: 1678,
    correct_rate: 77.8,
    author_id: '1',
    author_name: 'Prof. Maria Costa',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

// Load or initialize questions
let questions: Question[] = [];
if (fs.existsSync(questionsPath)) {
  try {
    questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  } catch {
    questions = [...defaultQuestions];
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
  }
} else {
  questions = [...defaultQuestions];
  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
}

// Helper function to calculate correct rate
function calculateCorrectRate(times_correct: number, times_answered: number): number {
  return times_answered > 0 ? Number(((times_correct / times_answered) * 100).toFixed(1)) : 0;
}

// Helper function to update question statistics
function updateQuestionStats(questionId: string, isCorrect: boolean): Question | null {
  const questionIndex = questions.findIndex(q => q.id === questionId);
  if (questionIndex === -1) return null;

  const question = questions[questionIndex];
  question.times_answered += 1;
  if (isCorrect) {
    question.times_correct += 1;
  }
  question.correct_rate = calculateCorrectRate(question.times_correct, question.times_answered);
  question.updated_at = new Date().toISOString();

  questions[questionIndex] = question;
  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
  
  return question;
}

// Get all questions with filtering and pagination
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').toLowerCase();
    const subject = req.query.subject as string;
    const topic = req.query.topic as string;
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const exam_board = req.query.exam_board as string;
    const author_id = req.query.author_id as string;

    // Filter questions
    let filteredQuestions = questions.filter(question => {
      // Search in title, subject, topic, tags
      const matchesSearch = !search || 
        question.title.toLowerCase().includes(search) ||
        question.subject.toLowerCase().includes(search) ||
        question.topic?.toLowerCase().includes(search) ||
        question.tags.some(tag => tag.toLowerCase().includes(search)) ||
        question.explanation?.toLowerCase().includes(search);

      // Filter by specific fields
      const matchesSubject = !subject || question.subject === subject;
      const matchesTopic = !topic || question.topic === topic;
      const matchesDifficulty = !difficulty || question.difficulty === difficulty;
      const matchesType = !type || question.type === type;
      const matchesStatus = !status || question.status === status;
      const matchesExamBoard = !exam_board || question.exam_board === exam_board;
      const matchesAuthor = !author_id || question.author_id === author_id;

      return matchesSearch && matchesSubject && matchesTopic && 
             matchesDifficulty && matchesType && matchesStatus && 
             matchesExamBoard && matchesAuthor;
    });

    // Sort by creation date (newest first)
    filteredQuestions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalPages = Math.ceil(filteredQuestions.length / limit);

    res.json({
      success: true,
      data: paginatedQuestions,
      pagination: {
        page,
        limit,
        total: filteredQuestions.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        subject,
        topic,
        difficulty,
        type,
        status,
        exam_board,
        author_id
      }
    });
  } catch (error) {
    console.error('Error listing questions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar questões' 
    });
  }
});

// Get question statistics and aggregations
router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Calculate statistics
    const total = questions.length;
    const published = questions.filter(q => q.status === 'published').length;
    const draft = questions.filter(q => q.status === 'draft').length;
    const archived = questions.filter(q => q.status === 'archived').length;

    // Group by subject
    const bySubject: { [key: string]: number } = {};
    questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });

    // Group by difficulty
    const byDifficulty: { [key: string]: number } = {};
    questions.forEach(q => {
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    });

    // Group by type
    const byType: { [key: string]: number } = {};
    questions.forEach(q => {
      byType[q.type] = (byType[q.type] || 0) + 1;
    });

    // Average correct rate
    const questionsWithAnswers = questions.filter(q => q.times_answered > 0);
    const avgCorrectRate = questionsWithAnswers.length > 0 
      ? questionsWithAnswers.reduce((sum, q) => sum + q.correct_rate, 0) / questionsWithAnswers.length
      : 0;

    // Total answers
    const totalAnswers = questions.reduce((sum, q) => sum + q.times_answered, 0);

    res.json({
      success: true,
      data: {
        total,
        published,
        draft,
        archived,
        bySubject,
        byDifficulty,
        byType,
        avgCorrectRate: Number(avgCorrectRate.toFixed(1)),
        totalAnswers,
        questionsWithStats: questionsWithAnswers.length
      }
    });
  } catch (error) {
    console.error('Error getting question stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

// Get unique subjects, topics, exam boards for filters
router.get('/filters', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    const subjects = [...new Set(questions.map(q => q.subject))].sort();
    const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))].sort();
    const examBoards = [...new Set(questions.map(q => q.exam_board).filter(Boolean))].sort();
    const authors = [...new Set(questions.map(q => ({ 
      id: q.author_id, 
      name: q.author_name 
    })))];

    res.json({
      success: true,
      data: {
        subjects,
        topics,
        examBoards,
        authors,
        difficulties: ['easy', 'medium', 'hard'],
        types: ['multiple_choice', 'true_false', 'essay', 'fill_blank'],
        statuses: ['draft', 'published', 'archived']
      }
    });
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar filtros' 
    });
  }
});

// Get single question
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const question = questions.find(q => q.id === req.params.id);
    
    if (!question) {
      res.status(404).json({ 
        success: false,
        message: 'Questão não encontrada' 
      });
      return;
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar questão' 
    });
  }
});

// Create new question (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem criar questões' 
    });
    return;
  }

  try {
    const {
      title,
      type,
      subject,
      topic,
      category_id,
      difficulty,
      options,
      correct_answer,
      correct_boolean,
      expected_answer,
      explanation,
      exam_board,
      exam_year,
      exam_name,
      reference,
      tags,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !type || !subject || !difficulty) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: title, type, subject, difficulty' 
      });
      return;
    }

    // Type-specific validations
    if (type === 'multiple_choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Questões de múltipla escolha precisam ter pelo menos 2 opções'
        });
        return;
      }
      if (correct_answer === undefined || correct_answer < 0 || correct_answer >= options.length) {
        res.status(400).json({
          success: false,
          message: 'Resposta correta deve ser um índice válido das opções'
        });
        return;
      }
    }

    if (type === 'true_false' && correct_boolean === undefined) {
      res.status(400).json({
        success: false,
        message: 'Questões verdadeiro/falso precisam da resposta correta'
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `q_${timestamp}_${random}`;

    // Create new question
    const newQuestion: Question = {
      id: newId,
      title,
      type,
      subject,
      topic,
      category_id,
      difficulty,
      options: type === 'multiple_choice' ? options : undefined,
      correct_answer: type === 'multiple_choice' ? correct_answer : undefined,
      correct_boolean: type === 'true_false' ? correct_boolean : undefined,
      expected_answer: (type === 'essay' || type === 'fill_blank') ? expected_answer : undefined,
      explanation,
      exam_board,
      exam_year,
      exam_name,
      reference,
      tags: Array.isArray(tags) ? tags : [],
      status,
      times_answered: 0,
      times_correct: 0,
      correct_rate: 0,
      author_id: req.user!.id.toString(),
      author_name: req.user!.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to array and save
    questions.push(newQuestion);
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    res.json({
      success: true,
      message: 'Questão criada com sucesso',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar questão' 
    });
  }
});

// Update question (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem editar questões' 
    });
    return;
  }

  try {
    const questionId = req.params.id;
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Questão não encontrada' 
      });
      return;
    }

    const existingQuestion = questions[questionIndex];
    
    // Update question data (preserve statistics and audit fields)
    const updatedQuestion: Question = {
      ...existingQuestion,
      ...req.body,
      id: existingQuestion.id, // Don't allow ID change
      times_answered: existingQuestion.times_answered, // Preserve stats
      times_correct: existingQuestion.times_correct, // Preserve stats
      correct_rate: existingQuestion.correct_rate, // Preserve stats
      author_id: existingQuestion.author_id, // Preserve original author
      author_name: existingQuestion.author_name, // Preserve original author
      created_at: existingQuestion.created_at, // Preserve creation date
      updated_at: new Date().toISOString()
    };

    // Type-specific validations (same as create)
    if (updatedQuestion.type === 'multiple_choice') {
      if (!updatedQuestion.options || !Array.isArray(updatedQuestion.options) || updatedQuestion.options.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Questões de múltipla escolha precisam ter pelo menos 2 opções'
        });
        return;
      }
      if (updatedQuestion.correct_answer === undefined || updatedQuestion.correct_answer < 0 || updatedQuestion.correct_answer >= updatedQuestion.options.length) {
        res.status(400).json({
          success: false,
          message: 'Resposta correta deve ser um índice válido das opções'
        });
        return;
      }
    }

    questions[questionIndex] = updatedQuestion;
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    res.json({
      success: true,
      message: 'Questão atualizada com sucesso',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar questão' 
    });
  }
});

// Delete question (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem excluir questões' 
    });
    return;
  }

  try {
    const questionId = req.params.id;
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Questão não encontrada' 
      });
      return;
    }

    const question = questions[questionIndex];

    // Check if question has been answered (maybe prevent deletion)
    if (question.times_answered > 0) {
      res.status(400).json({ 
        success: false,
        message: `Não é possível excluir questão que já foi respondida ${question.times_answered} vezes. Considere arquivar.` 
      });
      return;
    }

    // Remove question
    questions.splice(questionIndex, 1);
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    res.json({
      success: true,
      message: 'Questão excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir questão' 
    });
  }
});

// Record answer (for statistics) - can be used by students
router.post('/:id/answer', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const questionId = req.params.id;
    const { is_correct } = req.body;

    if (typeof is_correct !== 'boolean') {
      res.status(400).json({ 
        success: false,
        message: 'Campo is_correct deve ser booleano' 
      });
      return;
    }

    const updatedQuestion = updateQuestionStats(questionId, is_correct);

    if (!updatedQuestion) {
      res.status(404).json({ 
        success: false,
        message: 'Questão não encontrada' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Resposta registrada com sucesso',
      data: {
        question_id: questionId,
        times_answered: updatedQuestion.times_answered,
        correct_rate: updatedQuestion.correct_rate
      }
    });
  } catch (error) {
    console.error('Error recording answer:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao registrar resposta' 
    });
  }
});

// Bulk import questions (admin only)
router.post('/bulk-import', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem importar questões' 
    });
    return;
  }

  try {
    const { questions: importQuestions } = req.body;

    if (!Array.isArray(importQuestions)) {
      res.status(400).json({ 
        success: false,
        message: 'Formato inválido. Esperado array de questões.' 
      });
      return;
    }

    const results = {
      success: 0,
      errors: [] as { index: number; error: string }[]
    };

    importQuestions.forEach((questionData, index) => {
      try {
        // Validate required fields
        if (!questionData.title || !questionData.type || !questionData.subject || !questionData.difficulty) {
          results.errors.push({
            index,
            error: 'Campos obrigatórios faltando: title, type, subject, difficulty'
          });
          return;
        }

        // Generate ID
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const newId = `q_${timestamp}_${random}_${index}`;

        // Create question
        const newQuestion: Question = {
          id: newId,
          title: questionData.title,
          type: questionData.type,
          subject: questionData.subject,
          topic: questionData.topic,
          category_id: questionData.category_id,
          difficulty: questionData.difficulty,
          options: questionData.options,
          correct_answer: questionData.correct_answer,
          correct_boolean: questionData.correct_boolean,
          expected_answer: questionData.expected_answer,
          explanation: questionData.explanation,
          exam_board: questionData.exam_board,
          exam_year: questionData.exam_year,
          exam_name: questionData.exam_name,
          reference: questionData.reference,
          tags: Array.isArray(questionData.tags) ? questionData.tags : [],
          status: questionData.status || 'draft',
          times_answered: 0,
          times_correct: 0,
          correct_rate: 0,
          author_id: req.user!.id.toString(),
          author_name: req.user!.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        questions.push(newQuestion);
        results.success++;
      } catch (error) {
        results.errors.push({
          index,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    });

    // Save all questions
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    res.json({
      success: true,
      message: `Importação concluída: ${results.success} questões importadas, ${results.errors.length} erros`,
      data: results
    });
  } catch (error) {
    console.error('Error bulk importing questions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao importar questões' 
    });
  }
});

export default router;