import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Users data storage
const usersPath = path.join(__dirname, '../../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(usersPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default users if file doesn't exist
const defaultUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@studypro.com',
    password: '$2a$10$EJ.w1nfT1SsuRQ8RmCEVBu1bO/FXq6N7x1M5Pw0S3GX1CvuBkT7mS', // Admin@123
    role: 'admin',
    status: 'active',
    phone: '(11) 98765-4321',
    avatar: '/uploads/avatars/admin-avatar.jpg',
    emailVerified: true,
    subscription: {
      plan: 'COMANDO SUPREMO',
      status: 'active',
      expiresAt: '2025-12-31T23:59:59Z'
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2025-08-11T12:00:00Z',
    updated_at: '2025-08-11T12:00:00Z'
  },
  {
    id: 2,
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    password: '$2a$10$7mjZ1K1Dd5pqQ7aH5mSXZ.sRgJQnJf3P/lKKU1LZKSEPHQhN7L8Fy', // aluno123
    role: 'student',
    status: 'active',
    phone: '(11) 91234-5678',
    avatar: '/uploads/avatars/default-avatar.jpg',
    emailVerified: true,
    subscription: {
      plan: 'RECRUTA',
      status: 'active',
      expiresAt: '2025-06-30T23:59:59Z'
    },
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2025-08-10T15:30:00Z',
    updated_at: '2025-08-10T15:30:00Z'
  },
  {
    id: 3,
    name: 'João Silva',
    email: 'joao@example.com',
    password: '$2a$10$PZ7lW6JJsY2Kgzp3aQFPQ.Uu0YxNQtGHUKTyWXKyqwRqhcDO5AJZ6', // senha123
    role: 'student',
    status: 'active',
    phone: '(21) 98888-7777',
    avatar: null,
    emailVerified: false,
    subscription: {
      plan: 'ESPECIALISTA',
      status: 'active',
      expiresAt: '2025-09-15T23:59:59Z'
    },
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2025-08-09T10:15:00Z',
    updated_at: '2025-08-09T10:15:00Z'
  },
  {
    id: 4,
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: '$2a$10$8xJBKJP43MQuH9n0CEJjh.Pq.tTmz5NMZMfhBXgRVCMqRK1qlGbGO', // maria456
    role: 'student',
    status: 'suspended',
    phone: '(31) 97777-6666',
    avatar: null,
    emailVerified: true,
    subscription: {
      plan: 'ELITE',
      status: 'expired',
      expiresAt: '2025-07-01T23:59:59Z'
    },
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: '2025-07-01T18:20:00Z',
    updated_at: '2025-07-01T18:20:00Z'
  },
  {
    id: 5,
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    password: '$2a$10$MOCK_HASH', // pedro789
    role: 'instructor',
    status: 'active',
    phone: '(41) 96666-5555',
    avatar: null,
    emailVerified: true,
    subscription: null,
    createdAt: '2024-03-10T00:00:00Z',
    lastLogin: '2025-08-11T08:00:00Z',
    updated_at: '2025-08-11T08:00:00Z'
  }
];

// Load or initialize users
let users: any[] = [];
if (fs.existsSync(usersPath)) {
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  } catch {
    users = [...defaultUsers];
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
} else {
  users = [...defaultUsers];
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Get all users (admin only) with pagination and filters
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    // Parse query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').toLowerCase();
    const role = req.query.role as string;
    const status = req.query.status as string;
    const includeInactive = req.query.include_inactive === 'true';

    // Filter users
    let filteredUsers = [...users];

    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone?.includes(search)
      );
    }

    // Apply role filter
    if (role && role !== 'Todos') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Apply status filter
    if (status && status !== 'Todos') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Apply inactive filter
    if (!includeInactive) {
      filteredUsers = filteredUsers.filter(user => user.status !== 'inactive');
    }

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    // Get paginated users (remove password field)
    const paginatedUsers = filteredUsers.slice(start, end).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar usuários' 
    });
  }
});

// Get user by ID (admin or own profile)
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }
    
    // Check permissions
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }
    
    // Remove password before sending
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar usuário' 
    });
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    const { email, password, name, role, status, phone, plan_id } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({ 
        success: false,
        message: 'Email, senha e nome são obrigatórios' 
      });
      return;
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      res.status(400).json({ 
        success: false,
        message: 'Email já cadastrado' 
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      status: status || 'active',
      phone: phone || null,
      avatar: null,
      emailVerified: false,
      subscription: plan_id ? {
        plan: plan_id,
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      } : null,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      updated_at: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    
    // Save to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar usuário' 
    });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    const { email, password, name, role, status, phone, plan_id } = req.body;
    const currentUser = users[userIndex];

    // Check if email is being changed and already exists
    if (email && email !== currentUser.email && users.find(u => u.email === email)) {
      res.status(400).json({ 
        success: false,
        message: 'Email já cadastrado' 
      });
      return;
    }

    // Update user fields
    if (name) currentUser.name = name;
    if (email) currentUser.email = email;
    if (role) currentUser.role = role;
    if (status) currentUser.status = status;
    if (phone !== undefined) currentUser.phone = phone;
    
    // Update password if provided
    if (password) {
      currentUser.password = await bcrypt.hash(password, 10);
    }

    // Update subscription if plan_id provided
    if (plan_id !== undefined) {
      if (plan_id) {
        currentUser.subscription = {
          plan: plan_id,
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };
      } else {
        currentUser.subscription = null;
      }
    }

    currentUser.updated_at = new Date().toISOString();

    // Save to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = currentUser;

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar usuário' 
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    // Don't allow deleting self
    if (userId === req.user?.id) {
      res.status(400).json({ 
        success: false,
        message: 'Você não pode excluir seu próprio usuário' 
      });
      return;
    }

    // Remove user
    users.splice(userIndex, 1);
    
    // Save to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir usuário' 
    });
  }
});

export default router;