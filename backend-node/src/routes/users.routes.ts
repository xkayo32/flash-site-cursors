import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Mock users data
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@studypro.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    role: 'student',
    created_at: '2024-01-02T00:00:00Z',
    last_login: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'student',
    created_at: '2024-01-03T00:00:00Z',
    last_login: '2024-01-14T14:20:00Z'
  }
];

// Get all users (admin only)
router.get('/', authMiddleware, (req: any, res): void => {
  // In production, check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Acesso negado' });
    return;
  }
  
  res.json(users);
});

// Get user by ID (admin or own profile)
router.get('/:id', authMiddleware, (req: any, res): void => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  
  // Check permissions
  if (req.user?.role !== 'admin' && req.user?.id !== userId) {
    res.status(403).json({ error: 'Acesso negado' });
    return;
  }
  
  res.json(user);
});

export default router;