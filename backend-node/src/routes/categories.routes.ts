import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Categories data storage
const categoriesPath = path.join(__dirname, '../../data/categories.json');

// Ensure data directory exists
const dataDir = path.dirname(categoriesPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
type CategoryType = 'subject' | 'topic' | 'exam_board' | 'year';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parent?: string;
  description?: string;
  contentCount: {
    questions: number;
    flashcards: number;
    summaries: number;
    courses: number;
  };
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// Default categories
const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Direito',
    type: 'subject',
    description: 'Disciplinas jurídicas para concursos',
    contentCount: { questions: 1200, flashcards: 800, summaries: 45, courses: 12 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '1.1',
        name: 'Direito Constitucional',
        type: 'topic',
        parent: '1',
        description: 'Estudo da Constituição Federal',
        contentCount: { questions: 400, flashcards: 300, summaries: 15, courses: 4 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: [
          {
            id: '1.1.1',
            name: 'Princípios Fundamentais',
            type: 'topic',
            parent: '1.1',
            description: 'Arts. 1º ao 4º da CF/88',
            contentCount: { questions: 50, flashcards: 40, summaries: 3, courses: 1 },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '1.1.2',
            name: 'Direitos e Garantias',
            type: 'topic',
            parent: '1.1',
            description: 'Art. 5º da CF/88',
            contentCount: { questions: 80, flashcards: 60, summaries: 4, courses: 1 },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      },
      {
        id: '1.2',
        name: 'Direito Administrativo',
        type: 'topic',
        parent: '1',
        description: 'Lei 8.112/90 e princípios administrativos',
        contentCount: { questions: 300, flashcards: 200, summaries: 10, courses: 3 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '1.3',
        name: 'Direito Penal',
        type: 'topic',
        parent: '1',
        description: 'Código Penal e legislação especial',
        contentCount: { questions: 500, flashcards: 300, summaries: 20, courses: 5 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Matemática',
    type: 'subject',
    description: 'Matemática e Raciocínio Lógico',
    contentCount: { questions: 800, flashcards: 600, summaries: 30, courses: 8 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '2.1',
        name: 'Matemática Financeira',
        type: 'topic',
        parent: '2',
        description: 'Juros simples, compostos e descontos',
        contentCount: { questions: 200, flashcards: 150, summaries: 8, courses: 2 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2.2',
        name: 'Raciocínio Lógico',
        type: 'topic',
        parent: '2',
        description: 'Proposições, argumentos e estruturas lógicas',
        contentCount: { questions: 300, flashcards: 250, summaries: 12, courses: 3 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2.3',
        name: 'Estatística',
        type: 'topic',
        parent: '2',
        description: 'Estatística descritiva e probabilidade',
        contentCount: { questions: 300, flashcards: 200, summaries: 10, courses: 3 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Português',
    type: 'subject',
    description: 'Língua Portuguesa e Interpretação',
    contentCount: { questions: 900, flashcards: 700, summaries: 35, courses: 10 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '3.1',
        name: 'Gramática',
        type: 'topic',
        parent: '3',
        description: 'Morfologia, sintaxe e semântica',
        contentCount: { questions: 400, flashcards: 300, summaries: 15, courses: 4 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3.2',
        name: 'Interpretação de Texto',
        type: 'topic',
        parent: '3',
        description: 'Compreensão e interpretação textual',
        contentCount: { questions: 300, flashcards: 250, summaries: 12, courses: 3 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3.3',
        name: 'Redação',
        type: 'topic',
        parent: '3',
        description: 'Técnicas de redação para concursos',
        contentCount: { questions: 200, flashcards: 150, summaries: 8, courses: 3 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Informática',
    type: 'subject',
    description: 'Informática básica e avançada',
    contentCount: { questions: 600, flashcards: 500, summaries: 25, courses: 7 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'eb1',
    name: 'CESPE/CEBRASPE',
    type: 'exam_board',
    description: 'Centro de Seleção e de Promoção de Eventos',
    contentCount: { questions: 2500, flashcards: 1800, summaries: 80, courses: 15 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'eb2',
    name: 'FCC',
    type: 'exam_board',
    description: 'Fundação Carlos Chagas',
    contentCount: { questions: 2000, flashcards: 1500, summaries: 70, courses: 12 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'eb3',
    name: 'FGV',
    type: 'exam_board',
    description: 'Fundação Getúlio Vargas',
    contentCount: { questions: 1800, flashcards: 1200, summaries: 60, courses: 10 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'eb4',
    name: 'VUNESP',
    type: 'exam_board',
    description: 'Fundação para o Vestibular da UNESP',
    contentCount: { questions: 1500, flashcards: 1000, summaries: 50, courses: 8 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'y2024',
    name: '2024',
    type: 'year',
    description: 'Conteúdo do ano de 2024',
    contentCount: { questions: 500, flashcards: 400, summaries: 20, courses: 5 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'y2023',
    name: '2023',
    type: 'year',
    description: 'Conteúdo do ano de 2023',
    contentCount: { questions: 800, flashcards: 600, summaries: 30, courses: 8 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Load or initialize categories
let categories: Category[] = [];
if (fs.existsSync(categoriesPath)) {
  try {
    categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  } catch {
    categories = [...defaultCategories];
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
  }
} else {
  categories = [...defaultCategories];
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
}

// Helper function to find category recursively
function findCategoryRecursive(categories: Category[], id: string): Category | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryRecursive(category.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to update category recursively
function updateCategoryRecursive(categories: Category[], id: string, data: Partial<Category>): boolean {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      categories[i] = { ...categories[i], ...data, updated_at: new Date().toISOString() };
      return true;
    }
    if (categories[i].children) {
      if (updateCategoryRecursive(categories[i].children!, id, data)) {
        return true;
      }
    }
  }
  return false;
}

// Helper function to delete category recursively
function deleteCategoryRecursive(categories: Category[], id: string): boolean {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      categories.splice(i, 1);
      return true;
    }
    if (categories[i].children) {
      if (deleteCategoryRecursive(categories[i].children!, id)) {
        return true;
      }
    }
  }
  return false;
}

// Get all categories
router.get('/', (_req: AuthRequest, res: Response): void => {
  try {
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar categorias' 
    });
  }
});

// Get categories by type
router.get('/type/:type', (req: AuthRequest, res: Response): void => {
  try {
    const type = req.params.type as CategoryType;
    const filteredCategories = categories.filter(cat => cat.type === type);
    
    res.json({
      success: true,
      data: filteredCategories
    });
  } catch (error) {
    console.error('Error filtering categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao filtrar categorias' 
    });
  }
});

// Get single category
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const category = findCategoryRecursive(categories, req.params.id);
    
    if (!category) {
      res.status(404).json({ 
        success: false,
        message: 'Categoria não encontrada' 
      });
      return;
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar categoria' 
    });
  }
});

// Create new category (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    const { name, type, parent, description } = req.body;

    // Validate required fields
    if (!name || !type) {
      res.status(400).json({ 
        success: false,
        message: 'Nome e tipo são obrigatórios' 
      });
      return;
    }

    // Generate new ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `cat_${timestamp}_${random}`;

    // Create new category
    const newCategory: Category = {
      id: newId,
      name,
      type,
      parent,
      description,
      contentCount: {
        questions: 0,
        flashcards: 0,
        summaries: 0,
        courses: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to appropriate location
    if (parent) {
      const parentCategory = findCategoryRecursive(categories, parent);
      if (parentCategory) {
        if (!parentCategory.children) {
          parentCategory.children = [];
        }
        parentCategory.children.push(newCategory);
      } else {
        res.status(400).json({ 
          success: false,
          message: 'Categoria pai não encontrada' 
        });
        return;
      }
    } else {
      categories.push(newCategory);
    }

    // Save to file
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));

    res.json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar categoria' 
    });
  }
});

// Update category (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  // Check if user is admin
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado' 
    });
    return;
  }

  try {
    const categoryId = req.params.id;
    const { name, type, description } = req.body;

    // Find and update category
    const updateData: Partial<Category> = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;

    const updated = updateCategoryRecursive(categories, categoryId, updateData);

    if (!updated) {
      res.status(404).json({ 
        success: false,
        message: 'Categoria não encontrada' 
      });
      return;
    }

    // Save to file
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: findCategoryRecursive(categories, categoryId)
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar categoria' 
    });
  }
});

// Delete category (admin only)
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
    const categoryId = req.params.id;
    
    // Check if category has content
    const category = findCategoryRecursive(categories, categoryId);
    if (category) {
      const totalContent = 
        category.contentCount.questions + 
        category.contentCount.flashcards + 
        category.contentCount.summaries + 
        category.contentCount.courses;
      
      if (totalContent > 0) {
        res.status(400).json({ 
          success: false,
          message: 'Não é possível excluir categoria com conteúdo associado' 
        });
        return;
      }
    }

    const deleted = deleteCategoryRecursive(categories, categoryId);

    if (!deleted) {
      res.status(404).json({ 
        success: false,
        message: 'Categoria não encontrada' 
      });
      return;
    }

    // Save to file
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));

    res.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir categoria' 
    });
  }
});

export default router;