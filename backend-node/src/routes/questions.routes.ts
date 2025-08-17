import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { query } from '../database/db';

const router = Router();

// Type definitions
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'draft' | 'published' | 'archived';

export interface Question {
  id: number;
  title: string;
  type: QuestionType;
  subject: string;
  topic: string;
  category_id?: string;
  difficulty: DifficultyLevel;
  status: QuestionStatus;
  
  // Multiple choice specific
  options?: string[];
  correct_answer?: number;
  
  // True/False specific
  correct_boolean?: boolean;
  
  // Essay/Fill blank specific
  expected_answer?: string;
  
  explanation?: string;
  exam_board?: string;
  exam_year?: number;
  exam_name?: string;
  reference?: string;
  tags: string[];
  
  // Audit
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionData {
  title: string;
  type: QuestionType;
  subject: string;
  topic: string;
  category_id?: string;
  difficulty: DifficultyLevel;
  status?: QuestionStatus;
  options?: string[];
  correct_answer?: number;
  correct_boolean?: boolean;
  expected_answer?: string;
  explanation?: string;
  exam_board?: string;
  exam_year?: number;
  exam_name?: string;
  reference?: string;
  tags?: string[];
}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
  status?: QuestionStatus;
  type?: QuestionType;
  exam_board?: string;
}

// GET /api/v1/questions - List questions with filters and pagination
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      subject,
      topic,
      difficulty,
      status,
      type,
      exam_board
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build WHERE clauses
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`title ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (subject && subject !== 'Todos') {
      conditions.push(`subject = $${paramIndex}`);
      params.push(subject);
      paramIndex++;
    }

    if (topic && topic !== 'Todos') {
      conditions.push(`topic = $${paramIndex}`);
      params.push(topic);
      paramIndex++;
    }

    if (difficulty && difficulty !== 'Todos') {
      conditions.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    if (status && status !== 'Todos') {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (type && type !== 'Todos') {
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (exam_board && exam_board !== 'Todos') {
      conditions.push(`exam_board = $${paramIndex}`);
      params.push(exam_board);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Count total questions
    const countQuery = `SELECT COUNT(*) FROM questions ${whereClause}`;
    const countResult = await query(countQuery, params);
    const totalQuestions = parseInt(countResult.rows[0].count);

    // Get questions with pagination
    const questionsQuery = `
      SELECT 
        id, title, type, subject, topic, category_id, difficulty, status,
        options, correct_answer, correct_boolean, expected_answer,
        explanation, exam_board, exam_year, exam_name, reference, tags,
        created_by, created_at, updated_at
      FROM questions 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(Number(limit), offset);
    const questionsResult = await query(questionsQuery, params);

    // Transform results
    const questions = questionsResult.rows.map((row: any) => ({
      ...row,
      options: row.options || [],
      tags: row.tags || []
    }));

    res.json({
      success: true,
      data: questions,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: totalQuestions,
        total_pages: Math.ceil(totalQuestions / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/v1/questions/filters - Get available filter options
router.get('/filters', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get distinct subjects
    const subjectsResult = await query('SELECT DISTINCT subject FROM questions WHERE subject IS NOT NULL ORDER BY subject');
    const subjects = subjectsResult.rows.map((row: any) => row.subject);

    // Get distinct topics
    const topicsResult = await query('SELECT DISTINCT topic FROM questions WHERE topic IS NOT NULL ORDER BY topic');
    const topics = topicsResult.rows.map((row: any) => row.topic);

    // Get distinct exam boards
    const examBoardsResult = await query('SELECT DISTINCT exam_board FROM questions WHERE exam_board IS NOT NULL ORDER BY exam_board');
    const examBoards = examBoardsResult.rows.map((row: any) => row.exam_board);

    res.json({
      success: true,
      data: {
        subjects,
        topics,
        examBoards
      }
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/v1/questions/:id - Get single question
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM questions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }

    const question = {
      ...result.rows[0],
      options: result.rows[0].options || [],
      tags: result.rows[0].tags || []
    };

    res.json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/v1/questions - Create new question
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const questionData: CreateQuestionData = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!questionData.title || !questionData.type || !questionData.subject || !questionData.difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, type, subject, difficulty'
      });
    }

    const insertQuery = `
      INSERT INTO questions (
        title, type, subject, topic, category_id, difficulty, status,
        options, correct_answer, correct_boolean, expected_answer,
        explanation, exam_board, exam_year, exam_name, reference, tags,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18
      ) RETURNING *
    `;

    const values = [
      questionData.title,
      questionData.type,
      questionData.subject,
      questionData.topic || '',
      questionData.category_id || null,
      questionData.difficulty,
      questionData.status || 'draft',
      questionData.options ? JSON.stringify(questionData.options) : null,
      questionData.correct_answer || null,
      questionData.correct_boolean || null,
      questionData.expected_answer || null,
      questionData.explanation || null,
      questionData.exam_board || null,
      questionData.exam_year || null,
      questionData.exam_name || null,
      questionData.reference || null,
      questionData.tags ? JSON.stringify(questionData.tags) : '[]',
      userId
    ];

    const result = await query(insertQuery, values);
    const newQuestion = {
      ...result.rows[0],
      options: result.rows[0].options || [],
      tags: result.rows[0].tags || []
    };

    res.status(201).json({
      success: true,
      data: newQuestion,
      message: 'Questão criada com sucesso'
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/v1/questions/:id - Update question
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const questionData: Partial<CreateQuestionData> = req.body;

    // Check if question exists
    const existingResult = await query('SELECT id FROM questions WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }

    const updateQuery = `
      UPDATE questions SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        subject = COALESCE($3, subject),
        topic = COALESCE($4, topic),
        category_id = COALESCE($5, category_id),
        difficulty = COALESCE($6, difficulty),
        status = COALESCE($7, status),
        options = COALESCE($8, options),
        correct_answer = COALESCE($9, correct_answer),
        correct_boolean = COALESCE($10, correct_boolean),
        expected_answer = COALESCE($11, expected_answer),
        explanation = COALESCE($12, explanation),
        exam_board = COALESCE($13, exam_board),
        exam_year = COALESCE($14, exam_year),
        exam_name = COALESCE($15, exam_name),
        reference = COALESCE($16, reference),
        tags = COALESCE($17, tags),
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `;

    const values = [
      questionData.title,
      questionData.type,
      questionData.subject,
      questionData.topic,
      questionData.category_id,
      questionData.difficulty,
      questionData.status,
      questionData.options ? JSON.stringify(questionData.options) : null,
      questionData.correct_answer,
      questionData.correct_boolean,
      questionData.expected_answer,
      questionData.explanation,
      questionData.exam_board,
      questionData.exam_year,
      questionData.exam_name,
      questionData.reference,
      questionData.tags ? JSON.stringify(questionData.tags) : null,
      id
    ];

    const result = await query(updateQuery, values);
    const updatedQuestion = {
      ...result.rows[0],
      options: result.rows[0].options || [],
      tags: result.rows[0].tags || []
    };

    res.json({
      success: true,
      data: updatedQuestion,
      message: 'Questão atualizada com sucesso'
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/v1/questions/:id - Delete question
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Questão excluída com sucesso'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;