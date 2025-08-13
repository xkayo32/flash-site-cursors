import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/courses');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `course-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Data storage paths
const COURSES_FILE = path.join(__dirname, '../../data/courses.json');
const MODULES_FILE = path.join(__dirname, '../../data/modules.json');
const LESSONS_FILE = path.join(__dirname, '../../data/lessons.json');

// Utility functions for data persistence
const readJsonFile = (filepath: string): any[] => {
  try {
    if (!fs.existsSync(filepath)) {
      return [];
    }
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filepath}:`, error);
    return [];
  }
};

const writeJsonFile = (filepath: string, data: any[]): void => {
  try {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filepath}:`, error);
  }
};

const getCourses = (): any[] => readJsonFile(COURSES_FILE);
const getModules = (): any[] => readJsonFile(MODULES_FILE);
const getLessons = (): any[] => readJsonFile(LESSONS_FILE);

const saveCourses = (courses: any[]): void => writeJsonFile(COURSES_FILE, courses);
const saveModules = (modules: any[]): void => writeJsonFile(MODULES_FILE, modules);
const saveLessons = (lessons: any[]): void => writeJsonFile(LESSONS_FILE, lessons);

// Initialize default data if files don't exist
if (!fs.existsSync(COURSES_FILE)) {
  const defaultCourses = [
    {
      id: uuidv4(),
      title: 'Direito Constitucional Completo',
      description: 'Curso completo de Direito Constitucional para concursos públicos militares e civis',
      category: 'DIREITO',
      thumbnail: null,
      price: 297.00,
      instructor: {
        id: uuidv4(),
        name: 'Dr. Carlos Silva',
        avatar: null
      },
      difficulty_level: 'intermediate',
      duration_hours: 40,
      duration_months: 3,
      status: 'published',
      visibility: 'public',
      certification_available: true,
      requirements: ['Ensino médio completo', 'Dedicação de 2h por dia'],
      objectives: ['Dominar os princípios constitucionais', 'Resolver questões de concursos'],
      tags: ['CONCURSO', 'FEDERAL', 'DIREITO'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        enrollments: 0,
        rating: 0,
        modules: 0,
        lessons: 0
      }
    }
  ];
  saveCourses(defaultCourses);
}

if (!fs.existsSync(MODULES_FILE)) {
  saveModules([]);
}

if (!fs.existsSync(LESSONS_FILE)) {
  saveLessons([]);
}

// ===================== COURSES ENDPOINTS =====================

// GET /api/v1/courses - List all courses with filtering and pagination
router.get('/', optionalAuth, (req: Request, res: Response): void => {
  try {
    let courses = getCourses();
    const modules = getModules();
    const lessons = getLessons();
    
    // Add module and lesson counts
    courses = courses.map(course => {
      const courseModules = modules.filter(m => m.course_id === course.id);
      const courseModuleIds = courseModules.map(m => m.id);
      const courseLessons = lessons.filter(l => courseModuleIds.includes(l.module_id));
      
      return {
        ...course,
        stats: {
          ...course.stats,
          modules: courseModules.length,
          lessons: courseLessons.length
        }
      };
    });
    
    // Apply filters
    const { search, category, status, instructor, page = 1, limit = 10 } = req.query;
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (category && category !== 'TODOS') {
      courses = courses.filter(c => c.category === category);
    }
    
    if (status && status !== 'TODOS') {
      courses = courses.filter(c => c.status === status);
    }
    
    if (instructor) {
      courses = courses.filter(c => 
        c.instructor.name.toLowerCase().includes((instructor as string).toLowerCase())
      );
    }
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedCourses = courses.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedCourses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: courses.length,
        pages: Math.ceil(courses.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error listing courses:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/v1/courses/stats - Get course statistics (admin only)
router.get('/stats', authMiddleware, (_: AuthRequest, res: Response): void => {
  try {
    const courses = getCourses();
    const modules = getModules();
    const lessons = getLessons();
    
    const stats = {
      total_courses: courses.length,
      published_courses: courses.filter(c => c.status === 'published').length,
      draft_courses: courses.filter(c => c.status === 'draft').length,
      archived_courses: courses.filter(c => c.status === 'archived').length,
      total_modules: modules.length,
      total_lessons: lessons.length,
      total_enrollments: courses.reduce((sum, c) => sum + (c.stats?.enrollments || 0), 0),
      average_rating: courses.length > 0 ? 
        courses.reduce((sum, c) => sum + (c.stats?.rating || 0), 0) / courses.length : 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting course stats:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/v1/courses/:id - Get course by ID with modules and lessons
router.get('/:id', optionalAuth, (req: Request, res: Response): void => {
  try {
    const courses = getCourses();
    const course = courses.find(c => c.id === req.params.id);
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Curso não encontrado' });
      return;
    }
    
    // Get course modules with lessons
    const modules = getModules().filter(m => m.course_id === course.id);
    const lessons = getLessons();
    
    const courseWithModules = {
      ...course,
      modules: modules.map(module => ({
        ...module,
        lessons: lessons.filter(l => l.module_id === module.id)
          .sort((a, b) => a.order_index - b.order_index)
      })).sort((a, b) => a.order_index - b.order_index)
    };
    
    res.json({ success: true, data: courseWithModules });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/v1/courses - Create new course (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      title,
      description,
      category,
      price = 0,
      difficulty_level = 'beginner',
      duration_hours = 10,
      duration_months = 1,
      certification_available = false,
      requirements = [],
      objectives = [],
      tags = [],
      instructor_name,
      instructor_rank
    } = req.body;
    
    if (!title || !description || !category) {
      res.status(400).json({ 
        success: false, 
        message: 'Título, descrição e categoria são obrigatórios' 
      });
      return;
    }
    
    const newCourse = {
      id: uuidv4(),
      title,
      description,
      category,
      thumbnail: null,
      price: parseFloat(price) || 0,
      instructor: {
        id: uuidv4(),
        name: instructor_name || 'Instrutor',
        rank: instructor_rank || '',
        avatar: null
      },
      difficulty_level,
      duration_hours: parseInt(duration_hours) || 10,
      duration_months: parseInt(duration_months) || 1,
      status: 'draft',
      visibility: 'private',
      certification_available: Boolean(certification_available),
      requirements: Array.isArray(requirements) ? requirements : 
        typeof requirements === 'string' ? JSON.parse(requirements || '[]') : [],
      objectives: Array.isArray(objectives) ? objectives :
        typeof objectives === 'string' ? JSON.parse(objectives || '[]') : [],
      tags: Array.isArray(tags) ? tags :
        typeof tags === 'string' ? JSON.parse(tags || '[]') : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        enrollments: 0,
        rating: 0,
        modules: 0,
        lessons: 0
      }
    };
    
    const courses = getCourses();
    courses.push(newCourse);
    saveCourses(courses);
    
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/courses/:id - Update course (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const courses = getCourses();
    const courseIndex = courses.findIndex(c => c.id === req.params.id);
    
    if (courseIndex === -1) {
      res.status(404).json({ success: false, message: 'Curso não encontrado' });
      return;
    }
    
    const updateData = { ...req.body };
    
    // Parse JSON strings if needed
    if (typeof updateData.requirements === 'string') {
      try {
        updateData.requirements = JSON.parse(updateData.requirements);
      } catch (e) {
        updateData.requirements = [];
      }
    }
    
    if (typeof updateData.objectives === 'string') {
      try {
        updateData.objectives = JSON.parse(updateData.objectives);
      } catch (e) {
        updateData.objectives = [];
      }
    }
    
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = [];
      }
    }
    
    // Convert numeric fields
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price) || 0;
    }
    if (updateData.duration_hours !== undefined) {
      updateData.duration_hours = parseInt(updateData.duration_hours) || 0;
    }
    if (updateData.duration_months !== undefined) {
      updateData.duration_months = parseInt(updateData.duration_months) || 0;
    }
    
    // Convert boolean fields
    if (updateData.certification_available !== undefined) {
      updateData.certification_available = Boolean(updateData.certification_available);
    }
    
    const updatedCourse = {
      ...courses[courseIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    courses[courseIndex] = updatedCourse;
    saveCourses(courses);
    
    res.json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /api/v1/courses/:id - Delete course (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const courses = getCourses();
    const courseIndex = courses.findIndex(c => c.id === req.params.id);
    
    if (courseIndex === -1) {
      res.status(404).json({ success: false, message: 'Curso não encontrado' });
      return;
    }
    
    const courseId = req.params.id;
    
    // Remove associated modules and lessons
    const modules = getModules();
    const courseModules = modules.filter(m => m.course_id === courseId);
    const moduleIds = courseModules.map(m => m.id);
    
    const lessons = getLessons();
    const remainingLessons = lessons.filter(l => !moduleIds.includes(l.module_id));
    const remainingModules = modules.filter(m => m.course_id !== courseId);
    
    // Remove the course
    courses.splice(courseIndex, 1);
    
    // Save all changes
    saveCourses(courses);
    saveModules(remainingModules);
    saveLessons(remainingLessons);
    
    res.json({ success: true, message: 'Curso excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/v1/courses/:id/thumbnail - Upload course thumbnail
router.post('/:id/thumbnail', authMiddleware, upload.single('thumbnail'), 
  (req: AuthRequest, res: Response): void => {
    try {
      const courses = getCourses();
      const courseIndex = courses.findIndex(c => c.id === req.params.id);
      
      if (courseIndex === -1) {
        res.status(404).json({ success: false, message: 'Curso não encontrado' });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Nenhuma imagem fornecida' });
        return;
      }
      
      const thumbnailUrl = `/uploads/courses/${req.file.filename}`;
      courses[courseIndex].thumbnail = thumbnailUrl;
      courses[courseIndex].updated_at = new Date().toISOString();
      
      saveCourses(courses);
      
      res.json({ 
        success: true, 
        data: { thumbnail: thumbnailUrl },
        message: 'Imagem enviada com sucesso'
      });
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
);

// ===================== MODULES ENDPOINTS =====================

// GET /api/v1/courses/:courseId/modules - List course modules
router.get('/:courseId/modules', optionalAuth, (req: Request, res: Response): void => {
  try {
    const modules = getModules().filter(m => m.course_id === req.params.courseId);
    const lessons = getLessons();
    
    const modulesWithLessons = modules.map(module => ({
      ...module,
      lessons: lessons.filter(l => l.module_id === module.id)
        .sort((a, b) => a.order_index - b.order_index)
    })).sort((a, b) => a.order_index - b.order_index);
    
    res.json({ success: true, data: modulesWithLessons });
  } catch (error) {
    console.error('Error listing modules:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/v1/courses/:courseId/modules/:id - Get specific module
router.get('/:courseId/modules/:id', optionalAuth, (req: Request, res: Response): void => {
  try {
    const modules = getModules();
    const module = modules.find(m => m.id === req.params.id && m.course_id === req.params.courseId);
    
    if (!module) {
      res.status(404).json({ success: false, message: 'Módulo não encontrado' });
      return;
    }
    
    const lessons = getLessons().filter(l => l.module_id === module.id)
      .sort((a, b) => a.order_index - b.order_index);
    
    res.json({ 
      success: true, 
      data: { ...module, lessons }
    });
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/v1/courses/:courseId/modules - Create new module
router.post('/:courseId/modules', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { title, description, is_published = false } = req.body;
    
    if (!title) {
      res.status(400).json({ success: false, message: 'Título do módulo é obrigatório' });
      return;
    }
    
    // Verify course exists
    const courses = getCourses();
    const course = courses.find(c => c.id === req.params.courseId);
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Curso não encontrado' });
      return;
    }
    
    const modules = getModules();
    const courseModules = modules.filter(m => m.course_id === req.params.courseId);
    const maxOrder = courseModules.length > 0 ? 
      Math.max(...courseModules.map(m => m.order_index)) : 0;
    
    const newModule = {
      id: uuidv4(),
      course_id: req.params.courseId,
      title,
      description: description || '',
      order_index: maxOrder + 1,
      is_published: Boolean(is_published),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    modules.push(newModule);
    saveModules(modules);
    
    res.status(201).json({ success: true, data: newModule });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/courses/:courseId/modules/:id - Update module
router.put('/:courseId/modules/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const modules = getModules();
    const moduleIndex = modules.findIndex(m => 
      m.id === req.params.id && m.course_id === req.params.courseId
    );
    
    if (moduleIndex === -1) {
      res.status(404).json({ success: false, message: 'Módulo não encontrado' });
      return;
    }
    
    const updateData = { ...req.body };
    
    // Convert boolean fields
    if (updateData.is_published !== undefined) {
      updateData.is_published = Boolean(updateData.is_published);
    }
    
    const updatedModule = {
      ...modules[moduleIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    modules[moduleIndex] = updatedModule;
    saveModules(modules);
    
    res.json({ success: true, data: updatedModule });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /api/v1/courses/:courseId/modules/:id - Delete module
router.delete('/:courseId/modules/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const modules = getModules();
    const moduleIndex = modules.findIndex(m => 
      m.id === req.params.id && m.course_id === req.params.courseId
    );
    
    if (moduleIndex === -1) {
      res.status(404).json({ success: false, message: 'Módulo não encontrado' });
      return;
    }
    
    const moduleId = req.params.id;
    
    // Remove associated lessons
    const lessons = getLessons();
    const remainingLessons = lessons.filter(l => l.module_id !== moduleId);
    
    // Remove the module
    modules.splice(moduleIndex, 1);
    
    // Save changes
    saveModules(modules);
    saveLessons(remainingLessons);
    
    res.json({ success: true, message: 'Módulo excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/courses/:courseId/modules/reorder - Reorder modules
router.put('/:courseId/modules/reorder', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { module_ids } = req.body;
    
    if (!Array.isArray(module_ids)) {
      res.status(400).json({ success: false, message: 'module_ids deve ser um array' });
      return;
    }
    
    const modules = getModules();
    
    // Update order indices
    module_ids.forEach((moduleId: string, index: number) => {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex !== -1) {
        modules[moduleIndex].order_index = index + 1;
        modules[moduleIndex].updated_at = new Date().toISOString();
      }
    });
    
    saveModules(modules);
    
    res.json({ success: true, message: 'Ordem dos módulos atualizada' });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ===================== LESSONS ENDPOINTS =====================

// GET /api/v1/modules/:moduleId/lessons - List module lessons
router.get('/modules/:moduleId/lessons', optionalAuth, (req: Request, res: Response): void => {
  try {
    const lessons = getLessons().filter(l => l.module_id === req.params.moduleId)
      .sort((a, b) => a.order_index - b.order_index);
    
    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error('Error listing lessons:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/v1/modules/:moduleId/lessons/:id - Get specific lesson
router.get('/modules/:moduleId/lessons/:id', optionalAuth, (req: Request, res: Response): void => {
  try {
    const lessons = getLessons();
    const lesson = lessons.find(l => 
      l.id === req.params.id && l.module_id === req.params.moduleId
    );
    
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Aula não encontrada' });
      return;
    }
    
    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Error getting lesson:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/v1/modules/:moduleId/lessons - Create new lesson
router.post('/modules/:moduleId/lessons', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      title,
      description,
      type = 'video',
      duration_minutes = 0,
      video_url,
      content,
      is_published = false,
      is_free = false
    } = req.body;
    
    if (!title) {
      res.status(400).json({ success: false, message: 'Título da aula é obrigatório' });
      return;
    }
    
    // Verify module exists
    const modules = getModules();
    const module = modules.find(m => m.id === req.params.moduleId);
    
    if (!module) {
      res.status(404).json({ success: false, message: 'Módulo não encontrado' });
      return;
    }
    
    const lessons = getLessons();
    const moduleLessons = lessons.filter(l => l.module_id === req.params.moduleId);
    const maxOrder = moduleLessons.length > 0 ? 
      Math.max(...moduleLessons.map(l => l.order_index)) : 0;
    
    const newLesson = {
      id: uuidv4(),
      module_id: req.params.moduleId,
      title,
      description: description || '',
      type,
      order_index: maxOrder + 1,
      duration_minutes: parseInt(duration_minutes) || 0,
      video_url: video_url || null,
      content: content || null,
      is_published: Boolean(is_published),
      is_free: Boolean(is_free),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    lessons.push(newLesson);
    saveLessons(lessons);
    
    res.status(201).json({ success: true, data: newLesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/modules/:moduleId/lessons/:id - Update lesson
router.put('/modules/:moduleId/lessons/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const lessons = getLessons();
    const lessonIndex = lessons.findIndex(l => 
      l.id === req.params.id && l.module_id === req.params.moduleId
    );
    
    if (lessonIndex === -1) {
      res.status(404).json({ success: false, message: 'Aula não encontrada' });
      return;
    }
    
    const updateData = { ...req.body };
    
    // Convert numeric fields
    if (updateData.duration_minutes !== undefined) {
      updateData.duration_minutes = parseInt(updateData.duration_minutes) || 0;
    }
    
    // Convert boolean fields
    if (updateData.is_published !== undefined) {
      updateData.is_published = Boolean(updateData.is_published);
    }
    if (updateData.is_free !== undefined) {
      updateData.is_free = Boolean(updateData.is_free);
    }
    
    const updatedLesson = {
      ...lessons[lessonIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    lessons[lessonIndex] = updatedLesson;
    saveLessons(lessons);
    
    res.json({ success: true, data: updatedLesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /api/v1/modules/:moduleId/lessons/:id - Delete lesson
router.delete('/modules/:moduleId/lessons/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const lessons = getLessons();
    const lessonIndex = lessons.findIndex(l => 
      l.id === req.params.id && l.module_id === req.params.moduleId
    );
    
    if (lessonIndex === -1) {
      res.status(404).json({ success: false, message: 'Aula não encontrada' });
      return;
    }
    
    // Remove the lesson
    lessons.splice(lessonIndex, 1);
    saveLessons(lessons);
    
    res.json({ success: true, message: 'Aula excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/v1/modules/:moduleId/lessons/reorder - Reorder lessons
router.put('/modules/:moduleId/lessons/reorder', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { lesson_ids } = req.body;
    
    if (!Array.isArray(lesson_ids)) {
      res.status(400).json({ success: false, message: 'lesson_ids deve ser um array' });
      return;
    }
    
    const lessons = getLessons();
    
    // Update order indices
    lesson_ids.forEach((lessonId: string, index: number) => {
      const lessonIndex = lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1) {
        lessons[lessonIndex].order_index = index + 1;
        lessons[lessonIndex].updated_at = new Date().toISOString();
      }
    });
    
    saveLessons(lessons);
    
    res.json({ success: true, message: 'Ordem das aulas atualizada' });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ===================== ENROLLMENT ENDPOINTS =====================

// Data storage for enrollments
const ENROLLMENTS_FILE = path.join(__dirname, '../../data/enrollments.json');

const getEnrollments = (): any[] => readJsonFile(ENROLLMENTS_FILE);
const saveEnrollments = (enrollments: any[]): void => writeJsonFile(ENROLLMENTS_FILE, enrollments);

// Initialize enrollments file if it doesn't exist
if (!fs.existsSync(ENROLLMENTS_FILE)) {
  saveEnrollments([]);
}

// POST /api/v1/courses/:id/enroll - Enroll in course (student only)
router.post('/:id/enroll', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const courses = getCourses();
    const courseIndex = courses.findIndex(c => c.id === req.params.id);
    
    if (courseIndex === -1) {
      res.status(404).json({ success: false, message: 'OPERAÇÃO NÃO ENCONTRADA' });
      return;
    }
    
    const course = courses[courseIndex];
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
      return;
    }
    
    // Check if course is published and available
    if (course.status !== 'published') {
      res.status(400).json({ success: false, message: 'OPERAÇÃO NÃO DISPONÍVEL PARA MATRÍCULA' });
      return;
    }
    
    // Check for existing enrollment
    const enrollments = getEnrollments();
    const existingEnrollment = enrollments.find(e => 
      e.user_id === userId && e.course_id === req.params.id
    );
    
    if (existingEnrollment) {
      res.status(400).json({ 
        success: false, 
        message: 'AGENTE JÁ REGISTRADO NESTA OPERAÇÃO',
        data: {
          enrollment: existingEnrollment,
          status: 'already_enrolled'
        }
      });
      return;
    }
    
    // Create new enrollment record
    const newEnrollment = {
      id: uuidv4(),
      user_id: userId,
      course_id: req.params.id,
      status: 'active', // active, paused, completed, cancelled
      progress: {
        percentage: 0,
        completed_modules: [],
        completed_lessons: [],
        last_accessed: new Date().toISOString()
      },
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completion_date: null,
      certificate_issued: false,
      tactical_notes: [] // Array for student notes/achievements
    };
    
    // Add enrollment to records
    enrollments.push(newEnrollment);
    saveEnrollments(enrollments);
    
    // Update course statistics
    course.stats.enrollments += 1;
    course.updated_at = new Date().toISOString();
    courses[courseIndex] = course;
    saveCourses(courses);
    
    res.json({ 
      success: true, 
      message: 'MATRÍCULA OPERACIONAL CONFIRMADA!',
      data: {
        enrollment: newEnrollment,
        course: {
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          modules: course.stats?.modules || 0,
          lessons: course.stats?.lessons || 0
        },
        next_steps: [
          'ACESSE O MÓDULO INICIAL PARA COMEÇAR SUA PREPARAÇÃO',
          'COMPLETE AS MISSÕES NA ORDEM SEQUENCIAL',
          'UTILIZE OS ARSENAIS DE FLASHCARDS PARA MEMORIZAÇÃO',
          'MONITORE SEU PROGRESSO TÁTICO NO DASHBOARD'
        ]
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
  }
});

// GET /api/v1/courses/:id/enrollment - Check enrollment status
router.get('/:id/enrollment', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
      return;
    }
    
    const enrollments = getEnrollments();
    const enrollment = enrollments.find(e => 
      e.user_id === userId && e.course_id === req.params.id
    );
    
    if (!enrollment) {
      res.json({ 
        success: true, 
        data: { enrolled: false, status: 'not_enrolled' }
      });
      return;
    }
    
    res.json({ 
      success: true, 
      data: { 
        enrolled: true,
        enrollment,
        status: enrollment.status,
        progress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
  }
});

// PUT /api/v1/courses/:id/enrollment - Update enrollment (pause, resume, etc)
router.put('/:id/enrollment', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const { status, tactical_notes } = req.body;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
      return;
    }
    
    const enrollments = getEnrollments();
    const enrollmentIndex = enrollments.findIndex(e => 
      e.user_id === userId && e.course_id === req.params.id
    );
    
    if (enrollmentIndex === -1) {
      res.status(404).json({ success: false, message: 'MATRÍCULA NÃO ENCONTRADA' });
      return;
    }
    
    // Update enrollment data
    if (status) {
      enrollments[enrollmentIndex].status = status;
    }
    
    if (tactical_notes) {
      enrollments[enrollmentIndex].tactical_notes.push({
        note: tactical_notes,
        timestamp: new Date().toISOString()
      });
    }
    
    enrollments[enrollmentIndex].updated_at = new Date().toISOString();
    saveEnrollments(enrollments);
    
    res.json({ 
      success: true, 
      message: 'STATUS OPERACIONAL ATUALIZADO',
      data: { enrollment: enrollments[enrollmentIndex] }
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
  }
});

// GET /api/v1/enrollments - List user's enrollments
router.get('/enrollments/my-courses', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
      return;
    }
    
    const enrollments = getEnrollments().filter(e => e.user_id === userId);
    const courses = getCourses();
    
    // Enrich enrollments with course data
    const enrichedEnrollments = enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      return {
        ...enrollment,
        course: course || null
      };
    }).filter(e => e.course); // Remove enrollments for deleted courses
    
    res.json({ 
      success: true, 
      data: enrichedEnrollments,
      stats: {
        total_enrollments: enrichedEnrollments.length,
        active: enrollments.filter(e => e.status === 'active').length,
        completed: enrollments.filter(e => e.status === 'completed').length,
        paused: enrollments.filter(e => e.status === 'paused').length
      }
    });
  } catch (error) {
    console.error('Error listing enrollments:', error);
    res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
  }
});

// POST /api/v1/courses/:courseId/lessons/:lessonId/complete - Mark lesson as complete
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, 
  (req: AuthRequest, res: Response): void => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
        return;
      }
      
      const lessons = getLessons();
      const lesson = lessons.find(l => l.id === req.params.lessonId);
      
      if (!lesson) {
        res.status(404).json({ success: false, message: 'MISSÃO NÃO ENCONTRADA' });
        return;
      }
      
      // Find user's enrollment
      const enrollments = getEnrollments();
      const enrollmentIndex = enrollments.findIndex(e => 
        e.user_id === userId && e.course_id === req.params.courseId
      );
      
      if (enrollmentIndex === -1) {
        res.status(404).json({ success: false, message: 'MATRÍCULA NÃO ENCONTRADA' });
        return;
      }
      
      const enrollment = enrollments[enrollmentIndex];
      
      // Add lesson to completed list if not already there
      if (!enrollment.progress.completed_lessons.includes(req.params.lessonId)) {
        enrollment.progress.completed_lessons.push(req.params.lessonId);
        
        // Update last accessed
        enrollment.progress.last_accessed = new Date().toISOString();
        enrollment.updated_at = new Date().toISOString();
        
        // Calculate new progress percentage (basic calculation)
        const modules = getModules().filter(m => m.course_id === req.params.courseId);
        const moduleIds = modules.map(m => m.id);
        const allCourseLessons = lessons.filter(l => moduleIds.includes(l.module_id));
        const totalLessons = allCourseLessons.length;
        const completedLessons = enrollment.progress.completed_lessons.length;
        
        enrollment.progress.percentage = totalLessons > 0 ? 
          Math.round((completedLessons / totalLessons) * 100) : 0;
        
        // Check if course is completed
        if (enrollment.progress.percentage >= 100 && enrollment.status === 'active') {
          enrollment.status = 'completed';
          enrollment.completion_date = new Date().toISOString();
          enrollment.certificate_issued = true;
        }
        
        saveEnrollments(enrollments);
      }
      
      res.json({ 
        success: true, 
        message: 'MISSÃO CONCLUÍDA COM SUCESSO!',
        data: {
          progress: enrollment.progress,
          status: enrollment.status,
          next_lesson: null, // Could implement next lesson logic
          achievement_unlocked: enrollment.progress.percentage >= 100
        }
      });
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
    }
  }
);

// GET /api/v1/courses/my-enrollments - Get user's enrolled courses (alias for dashboard)
router.get('/my-enrollments', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'AGENTE NÃO IDENTIFICADO' });
      return;
    }
    
    const enrollments = getEnrollments().filter(e => e.user_id === userId && e.status === 'active');
    const courses = getCourses();
    
    // Get enrolled courses with progress
    const enrolledCourses = enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (!course) return null;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        category: course.category,
        stats: course.stats,
        enrollment: {
          status: enrollment.status,
          progress: enrollment.progress.percentage,
          enrolled_at: enrollment.enrolled_at,
          last_accessed: enrollment.progress.last_accessed
        }
      };
    }).filter(c => c !== null);
    
    res.json({ 
      success: true, 
      data: enrolledCourses,
      message: `${enrolledCourses.length} OPERAÇÕES EM ANDAMENTO`
    });
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    res.status(500).json({ success: false, message: 'ERRO NO SISTEMA OPERACIONAL' });
  }
});

export default router;