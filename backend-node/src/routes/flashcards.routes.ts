import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Flashcards data storage
const flashcardsPath = path.join(__dirname, '../../data/flashcards.json');

// Ensure data directory exists
const dataDir = path.dirname(flashcardsPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
export type FlashcardType = 'basic' | 'basic_reversed' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer' | 'image_occlusion';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type FlashcardStatus = 'draft' | 'published' | 'archived';

export interface OcclusionArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  answer: string;
  shape: 'rectangle' | 'circle';
}

export interface Flashcard {
  id: string;
  type: FlashcardType;
  difficulty: DifficultyLevel;
  category: string;
  subcategory?: string;
  tags: string[];
  status: FlashcardStatus;
  
  // Basic types (basic, basic_reversed)
  front?: string;
  back?: string;
  extra?: string; // For basic_reversed additional info
  
  // Cloze deletion
  text?: string; // Text with {{c1::word}} format
  
  // Multiple choice
  question?: string;
  options?: string[];
  correct?: number; // Index of correct answer
  explanation?: string;
  
  // True/False
  statement?: string;
  answer?: string; // 'true' or 'false'
  
  // Type answer
  hint?: string;
  
  // Image occlusion
  image?: string; // Image URL or path
  occlusionAreas?: OcclusionArea[];
  
  // Study statistics
  times_studied: number;
  times_correct: number;
  correct_rate: number;
  ease_factor: number; // For spaced repetition (SM-2 algorithm)
  interval: number; // Days until next review
  next_review: string; // ISO date string
  
  // Audit
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// Default flashcards for demonstration
const defaultFlashcards: Flashcard[] = [
  {
    id: 'fc1',
    type: 'basic',
    difficulty: 'medium',
    category: 'DIREITO',
    subcategory: 'Penal',
    tags: ['CP', 'HOMICIDIO', 'ARTIGO'],
    status: 'published',
    front: 'Art. 121 do Código Penal',
    back: 'Matar alguém\nPena - reclusão, de seis a vinte anos.',
    times_studied: 45,
    times_correct: 38,
    correct_rate: 84.4,
    ease_factor: 2.5,
    interval: 7,
    next_review: '2025-08-18T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. Carlos Lima',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'fc2',
    type: 'basic_reversed',
    difficulty: 'medium',
    category: 'DIREITO',
    subcategory: 'Penal Militar',
    tags: ['CPM', 'DESERÇÃO', 'MILITAR'],
    status: 'published',
    front: 'Deserção',
    back: 'Art. 298 CPM',
    extra: 'Ausentar-se o militar, sem licença, da unidade em que serve, ou do lugar em que deve permanecer, por mais de oito dias.\nPena - detenção, de seis meses a dois anos',
    times_studied: 32,
    times_correct: 28,
    correct_rate: 87.5,
    ease_factor: 2.6,
    interval: 5,
    next_review: '2025-08-16T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. Ana Santos',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'fc3',
    type: 'cloze',
    difficulty: 'hard',
    category: 'DIREITO',
    subcategory: 'Penal',
    tags: ['CP', 'FURTO', 'PATRIMÔNIO'],
    status: 'published',
    text: 'Art. 155 CP - Subtrair, para si ou para outrem, coisa {{c1::alheia}} {{c2::móvel}}: Pena - reclusão, de {{c3::um a quatro anos}}, e multa.',
    extra: 'Crime de Furto - Código Penal',
    times_studied: 67,
    times_correct: 34,
    correct_rate: 50.7,
    ease_factor: 2.2,
    interval: 3,
    next_review: '2025-08-14T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. Maria Costa',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z'
  },
  {
    id: 'fc4',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: 'DIREITO',
    subcategory: 'Penal Militar',
    tags: ['CPM', 'DESERÇÃO', 'PENAS'],
    status: 'published',
    question: 'Qual a pena para deserção no CPM?',
    options: [
      'Detenção de 1 a 3 anos',
      'Detenção de 6 meses a 2 anos',
      'Reclusão de 2 a 8 anos',
      'Prisão de 15 dias a 6 meses'
    ],
    correct: 1,
    explanation: 'Art. 298 CPM - Pena: detenção, de seis meses a dois anos',
    times_studied: 89,
    times_correct: 71,
    correct_rate: 79.8,
    ease_factor: 2.4,
    interval: 6,
    next_review: '2025-08-17T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. João Silva',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'fc5',
    type: 'true_false',
    difficulty: 'easy',
    category: 'DIREITO',
    subcategory: 'Processual Penal',
    tags: ['CPP', 'FLAGRANTE', 'PRISÃO'],
    status: 'published',
    statement: 'A prisão em flagrante pode ser realizada por qualquer pessoa.',
    answer: 'true',
    explanation: 'Art. 301 do CPP - Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito.',
    times_studied: 123,
    times_correct: 111,
    correct_rate: 90.2,
    ease_factor: 2.8,
    interval: 9,
    next_review: '2025-08-20T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. Ana Santos',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: 'fc6',
    type: 'type_answer',
    difficulty: 'medium',
    category: 'DIREITO',
    subcategory: 'Penal Militar',
    tags: ['CPM', 'CRIME MILITAR'],
    status: 'published',
    question: 'Complete o artigo: "Art. 9º CPM - Consideram-se crimes militares, em tempo de..."',
    answer: 'paz',
    hint: 'Oposto de guerra',
    times_studied: 56,
    times_correct: 42,
    correct_rate: 75.0,
    ease_factor: 2.3,
    interval: 4,
    next_review: '2025-08-15T00:00:00Z',
    author_id: '1',
    author_name: 'Prof. Carlos Lima',
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: 'fc7',
    type: 'image_occlusion',
    difficulty: 'hard',
    category: 'SEGURANÇA PÚBLICA',
    subcategory: 'Hierarquia',
    tags: ['HIERARQUIA', 'MILITAR', 'OFICIAIS'],
    status: 'published',
    image: '/api/placeholder/800/600',
    occlusionAreas: [
      { id: 'area-1', x: 100, y: 50, width: 150, height: 40, answer: 'Coronel', shape: 'rectangle' },
      { id: 'area-2', x: 100, y: 120, width: 150, height: 40, answer: 'Tenente-Coronel', shape: 'rectangle' }
    ],
    extra: 'Hierarquia Militar - Oficiais Superiores',
    times_studied: 23,
    times_correct: 15,
    correct_rate: 65.2,
    ease_factor: 2.1,
    interval: 2,
    next_review: '2025-08-13T00:00:00Z',
    author_id: '1',
    author_name: 'Major Silva',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  }
];

// Load or initialize flashcards
let flashcards: Flashcard[] = [];
if (fs.existsSync(flashcardsPath)) {
  try {
    flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf-8'));
  } catch {
    flashcards = [...defaultFlashcards];
    fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));
  }
} else {
  flashcards = [...defaultFlashcards];
  fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));
}

// Helper function to calculate correct rate
function calculateCorrectRate(times_correct: number, times_studied: number): number {
  return times_studied > 0 ? Number(((times_correct / times_studied) * 100).toFixed(1)) : 0;
}

// Helper function to update study statistics (SM-2 algorithm implementation)
function updateStudyStats(flashcardId: string, isCorrect: boolean, quality: number = 3): Flashcard | null {
  const flashcardIndex = flashcards.findIndex(f => f.id === flashcardId);
  if (flashcardIndex === -1) return null;

  const flashcard = flashcards[flashcardIndex];
  flashcard.times_studied += 1;
  if (isCorrect) {
    flashcard.times_correct += 1;
  }
  flashcard.correct_rate = calculateCorrectRate(flashcard.times_correct, flashcard.times_studied);

  // SM-2 Algorithm for spaced repetition
  let easeFactor = flashcard.ease_factor;
  let interval = flashcard.interval;

  if (quality >= 3) {
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  } else {
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  flashcard.ease_factor = Number(easeFactor.toFixed(2));
  flashcard.interval = interval;
  
  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  flashcard.next_review = nextReview.toISOString();
  
  flashcard.updated_at = new Date().toISOString();

  flashcards[flashcardIndex] = flashcard;
  fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));
  
  return flashcard;
}

// Get all flashcards with filtering and pagination
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').toLowerCase();
    const category = req.query.category as string;
    const subcategory = req.query.subcategory as string;
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const author_id = req.query.author_id as string;
    const due_only = req.query.due_only === 'true'; // For study sessions

    // Filter flashcards
    let filteredFlashcards = flashcards.filter(flashcard => {
      // Search in front, back, question, statement, text, tags
      const matchesSearch = !search || 
        flashcard.front?.toLowerCase().includes(search) ||
        flashcard.back?.toLowerCase().includes(search) ||
        flashcard.question?.toLowerCase().includes(search) ||
        flashcard.statement?.toLowerCase().includes(search) ||
        flashcard.text?.toLowerCase().includes(search) ||
        flashcard.tags.some(tag => tag.toLowerCase().includes(search));

      // Filter by specific fields
      const matchesCategory = !category || flashcard.category === category;
      const matchesSubcategory = !subcategory || flashcard.subcategory === subcategory;
      const matchesDifficulty = !difficulty || flashcard.difficulty === difficulty;
      const matchesType = !type || flashcard.type === type;
      const matchesStatus = !status || flashcard.status === status;
      const matchesAuthor = !author_id || flashcard.author_id === author_id;

      // Filter for due cards (study mode)
      const isDue = !due_only || new Date(flashcard.next_review) <= new Date();

      return matchesSearch && matchesCategory && matchesSubcategory && 
             matchesDifficulty && matchesType && matchesStatus && 
             matchesAuthor && isDue;
    });

    // Sort by next review date for study mode, or creation date otherwise
    if (due_only) {
      filteredFlashcards.sort((a, b) => 
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );
    } else {
      filteredFlashcards.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFlashcards = filteredFlashcards.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalPages = Math.ceil(filteredFlashcards.length / limit);

    res.json({
      success: true,
      data: paginatedFlashcards,
      pagination: {
        page,
        limit,
        total: filteredFlashcards.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        category,
        subcategory,
        difficulty,
        type,
        status,
        author_id,
        due_only
      }
    });
  } catch (error) {
    console.error('Error listing flashcards:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar flashcards' 
    });
  }
});

// Get flashcard statistics and aggregations
router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Calculate statistics
    const total = flashcards.length;
    const published = flashcards.filter(f => f.status === 'published').length;
    const draft = flashcards.filter(f => f.status === 'draft').length;
    const archived = flashcards.filter(f => f.status === 'archived').length;

    // Group by category
    const byCategory: { [key: string]: number } = {};
    flashcards.forEach(f => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    });

    // Group by difficulty
    const byDifficulty: { [key: string]: number } = {};
    flashcards.forEach(f => {
      byDifficulty[f.difficulty] = (byDifficulty[f.difficulty] || 0) + 1;
    });

    // Group by type
    const byType: { [key: string]: number } = {};
    flashcards.forEach(f => {
      byType[f.type] = (byType[f.type] || 0) + 1;
    });

    // Average correct rate
    const flashcardsWithStudies = flashcards.filter(f => f.times_studied > 0);
    const avgCorrectRate = flashcardsWithStudies.length > 0 
      ? flashcardsWithStudies.reduce((sum, f) => sum + f.correct_rate, 0) / flashcardsWithStudies.length
      : 0;

    // Total studies
    const totalStudies = flashcards.reduce((sum, f) => sum + f.times_studied, 0);

    // Due for review
    const dueForReview = flashcards.filter(f => 
      f.status === 'published' && new Date(f.next_review) <= new Date()
    ).length;

    res.json({
      success: true,
      data: {
        total,
        published,
        draft,
        archived,
        byCategory,
        byDifficulty,
        byType,
        avgCorrectRate: Number(avgCorrectRate.toFixed(1)),
        totalStudies,
        flashcardsWithStats: flashcardsWithStudies.length,
        dueForReview
      }
    });
  } catch (error) {
    console.error('Error getting flashcard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

// Get filter options
router.get('/filters', authMiddleware, (_req: AuthRequest, res: Response): void => {
  try {
    const categories = [...new Set(flashcards.map(f => f.category))].sort();
    const subcategories = [...new Set(flashcards.map(f => f.subcategory).filter(Boolean))].sort();
    const authors = [...new Set(flashcards.map(f => ({ 
      id: f.author_id, 
      name: f.author_name 
    })))];

    res.json({
      success: true,
      data: {
        categories,
        subcategories,
        authors,
        difficulties: ['easy', 'medium', 'hard'],
        types: ['basic', 'basic_reversed', 'cloze', 'multiple_choice', 'true_false', 'type_answer', 'image_occlusion'],
        statuses: ['draft', 'published', 'archived']
      }
    });
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar filtros' 
    });
  }
});

// Get single flashcard
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const flashcard = flashcards.find(f => f.id === req.params.id);
    
    if (!flashcard) {
      res.status(404).json({ 
        success: false,
        message: 'Flashcard não encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    console.error('Error getting flashcard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar flashcard' 
    });
  }
});

// Create new flashcard (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem criar flashcards' 
    });
    return;
  }

  try {
    const {
      type,
      difficulty,
      category,
      subcategory,
      tags,
      status = 'draft',
      // Basic types
      front,
      back,
      extra,
      // Cloze
      text,
      // Multiple choice
      question,
      options,
      correct,
      explanation,
      // True/False
      statement,
      answer,
      // Type answer
      hint,
      // Image occlusion
      image,
      occlusionAreas
    } = req.body;

    // Validate required fields
    if (!type || !difficulty || !category) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: type, difficulty, category' 
      });
      return;
    }

    // Type-specific validations
    if ((type === 'basic' || type === 'basic_reversed') && (!front || !back)) {
      res.status(400).json({
        success: false,
        message: 'Flashcards básicos precisam de frente e verso'
      });
      return;
    }

    if (type === 'cloze' && !text) {
      res.status(400).json({
        success: false,
        message: 'Flashcards de lacuna precisam de texto com {{c1::palavra}}'
      });
      return;
    }

    if (type === 'multiple_choice') {
      if (!question || !options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Questões de múltipla escolha precisam de pergunta e pelo menos 2 opções'
        });
        return;
      }
      if (correct === undefined || correct < 0 || correct >= options.length) {
        res.status(400).json({
          success: false,
          message: 'Resposta correta deve ser um índice válido das opções'
        });
        return;
      }
    }

    if (type === 'true_false' && (!statement || !answer)) {
      res.status(400).json({
        success: false,
        message: 'Questões verdadeiro/falso precisam de afirmação e resposta'
      });
      return;
    }

    if (type === 'type_answer' && (!question || !answer)) {
      res.status(400).json({
        success: false,
        message: 'Questões de digitação precisam de pergunta e resposta'
      });
      return;
    }

    if (type === 'image_occlusion' && (!image || !occlusionAreas || occlusionAreas.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Oclusão de imagem precisa de imagem e pelo menos uma área'
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `fc_${timestamp}_${random}`;

    // Calculate initial next review (tomorrow for new cards)
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);

    // Create new flashcard
    const newFlashcard: Flashcard = {
      id: newId,
      type,
      difficulty,
      category,
      subcategory,
      tags: Array.isArray(tags) ? tags : [],
      status,
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
      occlusionAreas: Array.isArray(occlusionAreas) ? occlusionAreas : [],
      times_studied: 0,
      times_correct: 0,
      correct_rate: 0,
      ease_factor: 2.5, // Default SM-2 ease factor
      interval: 0,
      next_review: nextReview.toISOString(),
      author_id: req.user!.id.toString(),
      author_name: req.user!.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to array and save
    flashcards.push(newFlashcard);
    fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));

    res.json({
      success: true,
      message: 'Flashcard criado com sucesso',
      data: newFlashcard
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar flashcard' 
    });
  }
});

// Update flashcard (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem editar flashcards' 
    });
    return;
  }

  try {
    const flashcardId = req.params.id;
    const flashcardIndex = flashcards.findIndex(f => f.id === flashcardId);

    if (flashcardIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Flashcard não encontrado' 
      });
      return;
    }

    const existingFlashcard = flashcards[flashcardIndex];
    
    // Update flashcard data (preserve statistics and audit fields)
    const updatedFlashcard: Flashcard = {
      ...existingFlashcard,
      ...req.body,
      id: existingFlashcard.id, // Don't allow ID change
      times_studied: existingFlashcard.times_studied, // Preserve stats
      times_correct: existingFlashcard.times_correct, // Preserve stats
      correct_rate: existingFlashcard.correct_rate, // Preserve stats
      ease_factor: existingFlashcard.ease_factor, // Preserve SM-2 data
      interval: existingFlashcard.interval, // Preserve SM-2 data
      next_review: existingFlashcard.next_review, // Preserve review schedule
      author_id: existingFlashcard.author_id, // Preserve original author
      author_name: existingFlashcard.author_name, // Preserve original author
      created_at: existingFlashcard.created_at, // Preserve creation date
      updated_at: new Date().toISOString()
    };

    flashcards[flashcardIndex] = updatedFlashcard;
    fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));

    res.json({
      success: true,
      message: 'Flashcard atualizado com sucesso',
      data: updatedFlashcard
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar flashcard' 
    });
  }
});

// Delete flashcard (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem excluir flashcards' 
    });
    return;
  }

  try {
    const flashcardId = req.params.id;
    const flashcardIndex = flashcards.findIndex(f => f.id === flashcardId);

    if (flashcardIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Flashcard não encontrado' 
      });
      return;
    }

    const flashcard = flashcards[flashcardIndex];

    // Check if flashcard has been studied (maybe prevent deletion)
    if (flashcard.times_studied > 0) {
      res.status(400).json({ 
        success: false,
        message: `Não é possível excluir flashcard que já foi estudado ${flashcard.times_studied} vezes. Considere arquivar.` 
      });
      return;
    }

    // Remove flashcard
    flashcards.splice(flashcardIndex, 1);
    fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));

    res.json({
      success: true,
      message: 'Flashcard excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir flashcard' 
    });
  }
});

// Record study session (for statistics and SM-2 algorithm)
router.post('/:id/study', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const flashcardId = req.params.id;
    const { is_correct, quality = 3 } = req.body;

    if (typeof is_correct !== 'boolean') {
      res.status(400).json({ 
        success: false,
        message: 'Campo is_correct deve ser booleano' 
      });
      return;
    }

    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      res.status(400).json({ 
        success: false,
        message: 'Campo quality deve ser número entre 0 e 5' 
      });
      return;
    }

    const updatedFlashcard = updateStudyStats(flashcardId, is_correct, quality);

    if (!updatedFlashcard) {
      res.status(404).json({ 
        success: false,
        message: 'Flashcard não encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Sessão de estudo registrada com sucesso',
      data: {
        flashcard_id: flashcardId,
        times_studied: updatedFlashcard.times_studied,
        correct_rate: updatedFlashcard.correct_rate,
        ease_factor: updatedFlashcard.ease_factor,
        interval: updatedFlashcard.interval,
        next_review: updatedFlashcard.next_review
      }
    });
  } catch (error) {
    console.error('Error recording study session:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao registrar sessão de estudo' 
    });
  }
});

// Bulk import flashcards (admin only)
router.post('/bulk-import', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores podem importar flashcards' 
    });
    return;
  }

  try {
    const { flashcards: importFlashcards } = req.body;

    if (!Array.isArray(importFlashcards)) {
      res.status(400).json({ 
        success: false,
        message: 'Formato inválido. Esperado array de flashcards.' 
      });
      return;
    }

    const results = {
      success: 0,
      errors: [] as { index: number; error: string }[]
    };

    importFlashcards.forEach((flashcardData, index) => {
      try {
        // Validate required fields
        if (!flashcardData.type || !flashcardData.difficulty || !flashcardData.category) {
          results.errors.push({
            index,
            error: 'Campos obrigatórios faltando: type, difficulty, category'
          });
          return;
        }

        // Generate ID
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const newId = `fc_${timestamp}_${random}_${index}`;

        // Calculate initial next review
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);

        // Create flashcard
        const newFlashcard: Flashcard = {
          id: newId,
          type: flashcardData.type,
          difficulty: flashcardData.difficulty,
          category: flashcardData.category,
          subcategory: flashcardData.subcategory,
          tags: Array.isArray(flashcardData.tags) ? flashcardData.tags : [],
          status: flashcardData.status || 'draft',
          front: flashcardData.front,
          back: flashcardData.back,
          extra: flashcardData.extra,
          text: flashcardData.text,
          question: flashcardData.question,
          options: flashcardData.options,
          correct: flashcardData.correct,
          explanation: flashcardData.explanation,
          statement: flashcardData.statement,
          answer: flashcardData.answer,
          hint: flashcardData.hint,
          image: flashcardData.image,
          occlusionAreas: Array.isArray(flashcardData.occlusionAreas) ? flashcardData.occlusionAreas : [],
          times_studied: 0,
          times_correct: 0,
          correct_rate: 0,
          ease_factor: 2.5,
          interval: 0,
          next_review: nextReview.toISOString(),
          author_id: req.user!.id.toString(),
          author_name: req.user!.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        flashcards.push(newFlashcard);
        results.success++;
      } catch (error) {
        results.errors.push({
          index,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    });

    // Save all flashcards
    fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2));

    res.json({
      success: true,
      message: `Importação concluída: ${results.success} flashcards importados, ${results.errors.length} erros`,
      data: results
    });
  } catch (error) {
    console.error('Error bulk importing flashcards:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao importar flashcards' 
    });
  }
});

export default router;