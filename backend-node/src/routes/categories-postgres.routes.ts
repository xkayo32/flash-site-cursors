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
});

const router = Router();

// GET /categories - List all categories with hierarchy
router.get('/', async (_req, res: Response) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.description,
        c.parent_id,
        c.content_count,
        c.created_at,
        c.updated_at,
        p.name as parent_name,
        COUNT(DISTINCT ch.id) as children_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN categories ch ON ch.parent_id = c.id
      GROUP BY c.id, p.id, p.name
      ORDER BY c.name
    `;

    const result = await pool.query(query);

    // Organize categories in hierarchy
    const categoriesMap = new Map();
    const rootCategories: any[] = [];

    result.rows.forEach(cat => {
      const category = {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        description: cat.description,
        parent_id: cat.parent_id,
        parent_name: cat.parent_name,
        children_count: parseInt(cat.children_count),
        content_count: cat.content_count,
        children: [],
        created_at: cat.created_at,
        updated_at: cat.updated_at
      };

      categoriesMap.set(cat.id, category);

      if (!cat.parent_id) {
        rootCategories.push(category);
      }
    });

    // Build hierarchy
    result.rows.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoriesMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoriesMap.get(cat.id));
        }
      }
    });

    res.json({
      success: true,
      categories: rootCategories,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /categories/flat - List all categories flat (no hierarchy)
router.get('/flat', async (_req, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        type,
        description,
        parent_id,
        content_count,
        created_at,
        updated_at
      FROM categories
      ORDER BY name
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /categories/subjects - Get main subjects only
router.get('/subjects', async (_req, res: Response) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.external_id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.color,
        c.order_index,
        COUNT(DISTINCT ch.id) as topic_count,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT fc.id) as flashcard_count
      FROM categories c
      LEFT JOIN categories ch ON ch.parent_id = c.id
      LEFT JOIN questions q ON q.subject = c.name
      LEFT JOIN flashcards fc ON fc.category = c.name
      WHERE c.parent_id IS NULL AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.order_index, c.name
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      subjects: result.rows.map(cat => ({
        id: cat.external_id || cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order_index: cat.order_index,
        topic_count: parseInt(cat.topic_count),
        question_count: parseInt(cat.question_count),
        flashcard_count: parseInt(cat.flashcard_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Erro ao buscar matérias' });
  }
});

// GET /categories/:id/topics - Get topics for a subject
router.get('/:id/topics', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.id,
        c.external_id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.color,
        c.order_index,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT fc.id) as flashcard_count
      FROM categories c
      LEFT JOIN questions q ON q.topic = c.name
      LEFT JOIN flashcards fc ON fc.subcategory = c.name
      WHERE c.parent_id = (
        SELECT id FROM categories 
        WHERE external_id = $1 OR id::text = $1
      ) AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.order_index, c.name
    `;

    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      topics: result.rows.map(cat => ({
        id: cat.external_id || cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order_index: cat.order_index,
        question_count: parseInt(cat.question_count),
        flashcard_count: parseInt(cat.flashcard_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Erro ao buscar tópicos' });
  }
});

// POST /categories - Create new category (admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const {
      name,
      slug,
      description,
      icon,
      color,
      parent_id,
      order_index = 0,
      metadata
    } = req.body;

    const external_id = 'cat_' + Date.now();

    // Check if slug already exists
    const checkQuery = 'SELECT id FROM categories WHERE slug = $1';
    const checkResult = await pool.query(checkQuery, [slug || name.toLowerCase().replace(/\s+/g, '-')]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Slug já existe' });
    }

    const insertQuery = `
      INSERT INTO categories (
        external_id, name, slug, description, icon, color,
        parent_id, order_index, metadata, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *
    `;

    const values = [
      external_id,
      name,
      slug || name.toLowerCase().replace(/\s+/g, '-'),
      description || null,
      icon || null,
      color || null,
      parent_id || null,
      order_index,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      category: {
        ...result.rows[0],
        id: result.rows[0].external_id || result.rows[0].id
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /categories/:id - Update category (admin only)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    delete updates.id;
    delete updates.external_id;
    delete updates.created_at;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      paramCount++;
      updateFields.push(`${key} = $${paramCount}`);
      
      if (key === 'metadata') {
        values.push(JSON.stringify(updates[key]));
      } else {
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE categories
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $${paramCount} OR id::text = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      category: {
        ...result.rows[0],
        id: result.rows[0].external_id || result.rows[0].id
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// DELETE /categories/:id - Delete category (admin only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;

    // Check if category has children
    const checkQuery = `
      SELECT COUNT(*) as children
      FROM categories
      WHERE parent_id = (
        SELECT id FROM categories 
        WHERE external_id = $1 OR id::text = $1
      )
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (parseInt(checkResult.rows[0].children) > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar categoria com subcategorias' 
      });
    }

    // Soft delete
    const query = `
      UPDATE categories
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $1 OR id::text = $1
      RETURNING external_id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({
      success: true,
      message: 'Categoria desativada com sucesso'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

// GET /categories/stats - Get categories statistics
router.get('/stats', async (_req, res: Response) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT c.id) as total_categories,
        COUNT(DISTINCT CASE WHEN c.parent_id IS NULL THEN c.id END) as total_subjects,
        COUNT(DISTINCT CASE WHEN c.parent_id IS NOT NULL THEN c.id END) as total_topics,
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT fc.id) as total_flashcards
      FROM categories c
      LEFT JOIN questions q ON q.subject = c.name OR q.topic = c.name
      LEFT JOIN flashcards fc ON fc.category = c.name OR fc.subcategory = c.name
      WHERE c.is_active = true
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      stats: {
        total_categories: parseInt(result.rows[0].total_categories),
        total_subjects: parseInt(result.rows[0].total_subjects),
        total_topics: parseInt(result.rows[0].total_topics),
        total_questions: parseInt(result.rows[0].total_questions),
        total_flashcards: parseInt(result.rows[0].total_flashcards)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;