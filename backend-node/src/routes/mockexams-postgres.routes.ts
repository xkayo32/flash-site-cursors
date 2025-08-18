import { Router, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'estudos_db',
  user: process.env.DB_USERNAME || 'estudos_user',
  password: process.env.DB_PASSWORD || 'estudos_pass',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const router = Router();

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
  duration: number;
  total_questions: number;
  questions?: string[];
  filters?: any;
  passing_score: number;
  max_attempts: number;
  available_from?: string;
  available_until?: string;
  status: ExamStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  pass_rate: number;
}

// GET /mockexams - List all mock exams with filters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      difficulty, 
      type, 
      status,
      created_by 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT 
        id,
        external_id as id,
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
        status,
        created_by,
        created_at,
        updated_at,
        total_attempts,
        completed_attempts,
        average_score,
        pass_rate
      FROM mock_exams
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (difficulty) {
      paramCount++;
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
    }
    
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }
    
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }
    
    if (created_by) {
      paramCount++;
      query += ` AND created_by = $${paramCount}`;
      params.push(created_by);
    }
    
    // Get total count
    const countQuery = query.replace(
      'SELECT id, external_id as id, title, description, type, difficulty, duration, total_questions, questions, filters, passing_score, max_attempts, available_from, available_until, status, created_by, created_at, updated_at, total_attempts, completed_attempts, average_score, pass_rate',
      'SELECT COUNT(*) as total'
    );
    
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Add pagination
    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(Number(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        difficulty: row.difficulty || 'MIXED',
        total_attempts: row.total_attempts || 0,
        completed_attempts: row.completed_attempts || 0,
        average_score: row.average_score || 0,
        pass_rate: row.pass_rate || 0
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: offset + Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching mock exams:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar simulados' 
    });
  }
});

// GET /mockexams/available - Get available exams for students
router.get('/available', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const query = `
      SELECT 
        me.id,
        me.external_id as id,
        me.title,
        me.description,
        me.type,
        me.difficulty,
        me.duration,
        me.total_questions,
        me.passing_score,
        me.max_attempts,
        me.available_from,
        me.available_until,
        me.status,
        me.total_attempts,
        me.completed_attempts,
        me.average_score,
        me.pass_rate,
        COUNT(ea.id) as user_attempts,
        (me.max_attempts - COUNT(ea.id)) > 0 as can_take_exam,
        EXISTS(
          SELECT 1 FROM exam_attempts 
          WHERE exam_id = me.id 
          AND user_id = $1 
          AND status = 'in_progress'
        ) as has_in_progress
      FROM mock_exams me
      LEFT JOIN exam_attempts ea ON ea.exam_id = me.id AND ea.user_id = $1
      WHERE me.status = 'published'
        AND (me.available_from IS NULL OR me.available_from <= NOW())
        AND (me.available_until IS NULL OR me.available_until >= NOW())
      GROUP BY me.id
      ORDER BY me.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        user_attempts: parseInt(row.user_attempts) || 0,
        can_take_exam: row.can_take_exam || false,
        has_in_progress: row.has_in_progress || false
      }))
    });
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar simulados disponíveis' 
    });
  }
});

// GET /mockexams/:id - Get specific mock exam
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        external_id as id,
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
        status,
        created_by,
        created_at,
        updated_at,
        total_attempts,
        completed_attempts,
        average_score,
        pass_rate
      FROM mock_exams
      WHERE external_id = $1 OR id::text = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Simulado não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching mock exam:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar simulado' 
    });
  }
});

// POST /mockexams - Create new mock exam (Admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }
    
    const {
      title,
      description,
      type = 'AUTOMATIC',
      difficulty = 'MIXED',
      duration = 180,
      total_questions = 50,
      questions,
      filters,
      passing_score = 60,
      max_attempts = 3,
      available_from,
      available_until,
      status = 'draft'
    } = req.body;
    
    const external_id = 'me' + Date.now();
    
    const query = `
      INSERT INTO mock_exams (
        external_id, title, description, type, difficulty,
        duration, total_questions, questions, filters,
        passing_score, max_attempts, available_from,
        available_until, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING 
        id,
        external_id as id,
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
        status,
        created_by,
        created_at,
        updated_at
    `;
    
    const values = [
      external_id,
      title,
      description,
      type,
      difficulty,
      duration,
      total_questions,
      questions ? JSON.stringify(questions) : null,
      filters ? JSON.stringify(filters) : null,
      passing_score,
      max_attempts,
      available_from,
      available_until,
      status,
      req.user.id
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating mock exam:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar simulado' 
    });
  }
});

// PUT /mockexams/:id - Update mock exam (Admin only)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at' && key !== 'created_by') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        
        if (key === 'questions' || key === 'filters') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhum campo para atualizar' 
      });
    }
    
    paramCount++;
    values.push(id);
    
    const query = `
      UPDATE mock_exams
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $${paramCount} OR id::text = $${paramCount}
      RETURNING 
        id,
        external_id as id,
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
        status,
        created_by,
        created_at,
        updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Simulado não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating mock exam:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar simulado' 
    });
  }
});

// DELETE /mockexams/:id - Delete mock exam (Admin only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }
    
    const { id } = req.params;
    
    const query = `
      DELETE FROM mock_exams
      WHERE external_id = $1 OR id::text = $1
      RETURNING external_id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Simulado não encontrado' 
      });
    }
    
    res.json({
      success: true,
      message: 'Simulado excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting mock exam:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao excluir simulado' 
    });
  }
});

// POST /mockexams/:id/start - Start exam attempt (Student)
router.post('/:id/start', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Check if exam exists and is available
    const examQuery = `
      SELECT 
        me.*,
        COUNT(ea.id) as user_attempts
      FROM mock_exams me
      LEFT JOIN exam_attempts ea ON ea.exam_id = me.id AND ea.user_id = $1
      WHERE (me.external_id = $2 OR me.id::text = $2)
        AND me.status = 'published'
        AND (me.available_from IS NULL OR me.available_from <= NOW())
        AND (me.available_until IS NULL OR me.available_until >= NOW())
      GROUP BY me.id
    `;
    
    const examResult = await pool.query(examQuery, [userId, id]);
    
    if (examResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Simulado não disponível' 
      });
    }
    
    const exam = examResult.rows[0];
    
    // Check max attempts
    if (parseInt(exam.user_attempts) >= exam.max_attempts) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número máximo de tentativas atingido' 
      });
    }
    
    // Check for existing in-progress attempt
    const inProgressQuery = `
      SELECT external_id FROM exam_attempts
      WHERE exam_id = $1 AND user_id = $2 AND status = 'in_progress'
    `;
    
    const inProgressResult = await pool.query(inProgressQuery, [exam.id, userId]);
    
    if (inProgressResult.rows.length > 0) {
      return res.json({
        success: true,
        data: { attempt_id: inProgressResult.rows[0].external_id }
      });
    }
    
    // Select questions based on exam type
    let selectedQuestions = [];
    
    if (exam.type === 'MANUAL' && exam.questions) {
      selectedQuestions = exam.questions;
    } else {
      // For AUTOMATIC and RANDOM, select questions from questions table
      // This is simplified - you'd implement actual filtering logic
      const questionQuery = `
        SELECT id FROM questions 
        ORDER BY RANDOM() 
        LIMIT $1
      `;
      const questionResult = await pool.query(questionQuery, [exam.total_questions]);
      selectedQuestions = questionResult.rows.map(r => r.id.toString());
    }
    
    // Create new attempt
    const attemptId = 'attempt_' + Date.now();
    
    const createAttemptQuery = `
      INSERT INTO exam_attempts (
        external_id, exam_id, user_id, questions, status
      ) VALUES ($1, $2, $3, $4, 'in_progress')
      RETURNING external_id
    `;
    
    const attemptResult = await pool.query(createAttemptQuery, [
      attemptId,
      exam.id,
      userId,
      JSON.stringify(selectedQuestions)
    ]);
    
    res.json({
      success: true,
      data: { 
        attempt_id: attemptResult.rows[0].external_id,
        questions: selectedQuestions
      }
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao iniciar simulado' 
    });
  }
});

// GET /mockexams/my-attempts - Get user's attempts
router.get('/my-attempts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const query = `
      SELECT 
        ea.external_id as id,
        ea.exam_id,
        me.external_id as exam_external_id,
        me.title as exam_title,
        me.difficulty as exam_difficulty,
        me.passing_score as exam_passing_score,
        ea.started_at,
        ea.submitted_at,
        ea.time_spent,
        ea.score,
        ea.correct_answers,
        ea.wrong_answers,
        ea.blank_answers,
        ea.status,
        ea.score >= me.passing_score as passed
      FROM exam_attempts ea
      JOIN mock_exams me ON me.id = ea.exam_id
      WHERE ea.user_id = $1
      ORDER BY ea.started_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, Number(limit), offset]);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM exam_attempts
      WHERE user_id = $1
    `;
    
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: offset + Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar tentativas' 
    });
  }
});

export default router;