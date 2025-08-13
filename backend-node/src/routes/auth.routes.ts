import { Router } from 'express';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Mock users database (in production, this would be PostgreSQL)
/*
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@studypro.com',
    password: '$2a$10$YourHashedPasswordHere', // Admin@123
    role: 'admin'
  },
  {
    id: 2,
    name: 'Aluno Teste',
    email: 'aluno@example.com',
    password: '$2a$10$YourHashedPasswordHere', // aluno123
    role: 'student'
  }
];
*/

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    // For demo purposes, accept the hardcoded credentials
    if (email === 'admin@studypro.com' && password === 'Admin@123') {
      const token = jwt.sign(
        { id: 1, email, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@studypro.com',
          role: 'admin'
        }
      });
      return;
    }

    if (email === 'aluno@example.com' && password === 'aluno123') {
      const token = jwt.sign(
        { id: 2, email, role: 'student' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: 2,
          name: 'Aluno Teste',
          email: 'aluno@example.com',
          role: 'student'
        }
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Email ou senha incorretos'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Mock registration
    res.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: {
        id: 3,
        name,
        email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário'
    });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req: any, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Logout
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

export default router;