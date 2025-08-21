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

// GET /api/v1/flashcard-decks - List all decks
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { user_id, category, search } = req.query;
    
    let query = 'SELECT * FROM flashcard_decks WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      decks: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching decks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/flashcard-decks/:id - Get single deck
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM flashcard_decks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      deck: result.rows[0] // Manter compatibilidade
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deck'
    });
  }
});

// POST /api/v1/flashcard-decks - Create new deck
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, category, flashcard_ids } = req.body;
    const user_id = (req as any).user?.id || '1';
    const id = `deck_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const result = await pool.query(
      `INSERT INTO flashcard_decks (id, name, description, category, user_id, flashcard_ids, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, name, description, category, user_id, JSON.stringify(flashcard_ids || [])]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      deck: result.rows[0], // Manter compatibilidade
      message: 'Deck created successfully'
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating deck',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/v1/flashcard-decks/:id - Update deck
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, flashcard_ids } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    
    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }
    
    if (flashcard_ids !== undefined) {
      updates.push(`flashcard_ids = $${paramIndex}`);
      values.push(JSON.stringify(flashcard_ids));
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `UPDATE flashcard_decks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      deck: result.rows[0], // Manter compatibilidade
      message: 'Deck updated successfully'
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating deck'
    });
  }
});

// DELETE /api/v1/flashcard-decks/:id - Delete deck
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM flashcard_decks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Deck deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting deck'
    });
  }
});

// POST /api/v1/flashcard-decks/:id/flashcards - Add flashcards to deck
router.post('/:id/flashcards', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { flashcard_ids } = req.body;
    
    // Get current deck
    const currentDeck = await pool.query('SELECT flashcard_ids FROM flashcard_decks WHERE id = $1', [id]);
    
    if (currentDeck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }
    
    // Merge flashcard IDs
    const currentIds = currentDeck.rows[0].flashcard_ids || [];
    const newIds = [...new Set([...currentIds, ...flashcard_ids])];
    
    // Update deck
    const result = await pool.query(
      'UPDATE flashcard_decks SET flashcard_ids = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(newIds), id]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      deck: result.rows[0], // Manter compatibilidade
      message: 'Flashcards added to deck'
    });
  } catch (error) {
    console.error('Error adding flashcards to deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding flashcards to deck'
    });
  }
});

// DELETE /api/v1/flashcard-decks/:id/flashcards/:flashcardId - Remove flashcard from deck
router.delete('/:id/flashcards/:flashcardId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, flashcardId } = req.params;
    
    // Get current deck
    const currentDeck = await pool.query('SELECT flashcard_ids FROM flashcard_decks WHERE id = $1', [id]);
    
    if (currentDeck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }
    
    // Remove flashcard ID
    const currentIds = currentDeck.rows[0].flashcard_ids || [];
    const newIds = currentIds.filter((fid: string) => fid !== flashcardId);
    
    // Update deck
    const result = await pool.query(
      'UPDATE flashcard_decks SET flashcard_ids = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(newIds), id]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      deck: result.rows[0], // Manter compatibilidade
      message: 'Flashcard removed from deck'
    });
  } catch (error) {
    console.error('Error removing flashcard from deck:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing flashcard from deck'
    });
  }
});

export default router;