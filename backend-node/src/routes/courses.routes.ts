import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Mock courses data
const courses = [
  {
    id: 1,
    title: 'Direito Constitucional',
    description: 'Curso completo de Direito Constitucional para concursos públicos',
    price: 297.00,
    instructor: 'Prof. Silva',
    duration: '40h',
    level: 'intermediario',
    category: 'direito'
  },
  {
    id: 2,
    title: 'Português para Concursos',
    description: 'Gramática, interpretação de texto e redação para concursos',
    price: 197.00,
    instructor: 'Prof. Santos',
    duration: '30h',
    level: 'basico',
    category: 'portugues'
  },
  {
    id: 3,
    title: 'Matemática e Raciocínio Lógico',
    description: 'Matemática básica e raciocínio lógico para concursos',
    price: 247.00,
    instructor: 'Prof. Costa',
    duration: '35h',
    level: 'basico',
    category: 'matematica'
  }
];

// Get all courses
router.get('/', optionalAuth, (_req, res) => {
  res.json(courses);
});

// Get course by ID
router.get('/:id', optionalAuth, (req, res): void => {
  const courseId = parseInt(req.params.id);
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    res.status(404).json({ error: 'Curso não encontrado' });
    return;
  }
  
  res.json(course);
});

export default router;