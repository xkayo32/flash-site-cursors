import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5532'),
  database: process.env.DB_NAME || 'estudos_db',
  user: process.env.DB_USER || 'estudos_user',
  password: process.env.DB_PASSWORD || 'estudos_pass',
});

// GET /api/v1/flashcards - List all flashcards with filters
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      category,
      subcategory,
      difficulty,
      status,
      search,
      limit = 100,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM flashcards WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (subcategory) {
      query += ` AND subcategory = $${paramIndex}`;
      params.push(subcategory);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (front ILIKE $${paramIndex} OR back ILIKE $${paramIndex} OR text ILIKE $${paramIndex} OR question ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      flashcards: result.rows,
      total: result.rows.length,
      data: result.rows // For compatibility
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flashcards',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/flashcards/stats - Get flashcard statistics
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        AVG(times_studied) as avg_studied,
        AVG(correct_rate) as avg_correct_rate
      FROM flashcards
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching flashcard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// GET /api/v1/flashcards/filters - Get available filter options
router.get('/filters', authMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = await pool.query('SELECT DISTINCT category FROM flashcards WHERE category IS NOT NULL ORDER BY category');
    const subcategories = await pool.query('SELECT DISTINCT subcategory FROM flashcards WHERE subcategory IS NOT NULL ORDER BY subcategory');
    const difficulties = await pool.query('SELECT DISTINCT difficulty FROM flashcards WHERE difficulty IS NOT NULL ORDER BY difficulty');

    res.json({
      success: true,
      filters: {
        categories: categories.rows.map(r => r.category),
        subcategories: subcategories.rows.map(r => r.subcategory),
        difficulties: difficulties.rows.map(r => r.difficulty)
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filters'
    });
  }
});

// GET /api/v1/flashcards/:id - Get single flashcard
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM flashcards WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flashcard'
    });
  }
});

// POST /api/v1/flashcards - Create new flashcard (admin only)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      type,
      category,
      subcategory,
      difficulty,
      tags,
      status = 'draft',
      front,
      back,
      extra,
      text,
      question,
      options,
      correct,
      explanation,
      statement,
      answer,
      hint,
      image,
      occlusion_areas
    } = req.body;

    const id = `fc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const author_id = (req as any).user?.id || 1;

    const result = await pool.query(
      `INSERT INTO flashcards (
        id, type, category, subcategory, difficulty, tags, status,
        front, back, extra, text, question, options, correct, explanation,
        statement, answer, hint, image, occlusion_areas, author_id,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, NOW(), NOW()
      ) RETURNING *`,
      [
        id, type, category, subcategory, difficulty, JSON.stringify(tags || []), status,
        front, back, extra, text, question, JSON.stringify(options || []), correct, explanation,
        statement, answer, hint, image, JSON.stringify(occlusion_areas || []), author_id
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating flashcard'
    });
  }
});

// PUT /api/v1/flashcards/:id - Update flashcard (admin only)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const updateFields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...updateFields.map(field => {
      if (['tags', 'options', 'occlusion_areas'].includes(field)) {
        return JSON.stringify(updates[field]);
      }
      return updates[field];
    })];

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const query = `UPDATE flashcards SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating flashcard'
    });
  }
});

// DELETE /api/v1/flashcards/:id - Delete flashcard (admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM flashcards WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting flashcard'
    });
  }
});

// POST /api/v1/flashcards/:id/study - Record study session
router.post('/:id/study', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { correct, time_spent } = req.body;

    // Get current flashcard
    const current = await pool.query('SELECT * FROM flashcards WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const flashcard = current.rows[0];
    const times_studied = flashcard.times_studied + 1;
    const times_correct = flashcard.times_correct + (correct ? 1 : 0);
    const correct_rate = (times_correct / times_studied) * 100;

    // Update statistics
    await pool.query(
      `UPDATE flashcards 
       SET times_studied = $1, times_correct = $2, correct_rate = $3, updated_at = NOW() 
       WHERE id = $4`,
      [times_studied, times_correct, correct_rate, id]
    );

    res.json({
      success: true,
      message: 'Study session recorded'
    });
  } catch (error) {
    console.error('Error recording study session:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording study session'
    });
  }
});

export default router;