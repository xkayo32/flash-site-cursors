import { Router, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
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

// GET /users - List all users (admin only)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { search = '', role, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        id, name, email, role, phone, 
        avatar, status, email_verified,
        created_at, updated_at, last_login_at as last_login,
        subscription
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (status !== undefined) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` ORDER BY created_at DESC`;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(Number(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      users: result.rows.map(user => ({
        ...user,
        password: undefined // Never send password
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// GET /users/:id - Get specific user
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check permission
    if (req.user?.role !== 'admin' && req.user?.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const query = `
      SELECT 
        id, external_id, name, email, role, phone, cpf,
        birth_date, avatar_url, is_active, email_verified,
        created_at, updated_at, last_login, subscription_status,
        subscription_plan, subscription_expires_at, address,
        professional_info, preferences, metadata
      FROM users
      WHERE external_id = $1 OR id::text = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        ...user,
        id: user.external_id || user.id,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// POST /users - Create new user (admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const {
      name,
      email,
      password,
      role = 'student',
      phone,
      cpf,
      birth_date,
      avatar_url,
      is_active = true,
      subscription_plan
    } = req.body;

    // Check if email already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const external_id = 'user_' + Date.now();

    const insertQuery = `
      INSERT INTO users (
        external_id, name, email, password, role, phone, cpf,
        birth_date, avatar_url, is_active, subscription_plan,
        subscription_status, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, external_id, name, email, role, phone, cpf,
        birth_date, avatar_url, is_active, created_at,
        subscription_plan, subscription_status
    `;

    const values = [
      external_id,
      name,
      email,
      hashedPassword,
      role,
      phone || null,
      cpf || null,
      birth_date || null,
      avatar_url || null,
      is_active,
      subscription_plan || 'free',
      subscription_plan ? 'active' : 'inactive',
      false
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        ...result.rows[0],
        id: result.rows[0].external_id || result.rows[0].id,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// PUT /users/:id - Update user
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check permission
    if (req.user?.role !== 'admin' && req.user?.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const updates = req.body;
    delete updates.id;
    delete updates.external_id;
    delete updates.created_at;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      paramCount++;
      updateFields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $${paramCount} OR id::text = $${paramCount}
      RETURNING 
        id, external_id, name, email, role, phone, cpf,
        birth_date, avatar_url, is_active, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        ...result.rows[0],
        id: result.rows[0].external_id || result.rows[0].id,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;

    // Soft delete - just deactivate
    const query = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE (external_id = $1 OR id::text = $1) AND id != 1
      RETURNING external_id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// POST /users/:id/toggle-status - Toggle user active status (admin only)
router.post('/:id/toggle-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;

    const query = `
      UPDATE users
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE external_id = $1 OR id::text = $1
      RETURNING id, external_id, name, is_active
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      message: `Usuário ${result.rows[0].is_active ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        ...result.rows[0],
        id: result.rows[0].external_id || result.rows[0].id
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Erro ao alterar status do usuário' });
  }
});

export default router;