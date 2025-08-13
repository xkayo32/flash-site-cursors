import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Data file paths
const summariesPath = path.join(__dirname, '../../data/summaries.json');
const summaryVersionsPath = path.join(__dirname, '../../data/summary-versions.json');
const summaryStudySessionsPath = path.join(__dirname, '../../data/summary-study-sessions.json');
const summaryCollectionsPath = path.join(__dirname, '../../data/summary-collections.json');

// Ensure data directory exists
const dataDir = path.dirname(summariesPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
export type SummaryType = 'text' | 'outline' | 'mindmap' | 'flashcards' | 'checklist';
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';
export type SummaryStatus = 'draft' | 'published' | 'archived';
export type VisibilityLevel = 'private' | 'shared' | 'public';
export type ReferenceType = 'book' | 'article' | 'law' | 'jurisprudence' | 'other';

export interface Summary {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  content: string; // Markdown/HTML do resumo
  summary_type: SummaryType;
  difficulty: DifficultyLevel;
  estimated_reading_time: number; // em minutos
  tags: string[];
  
  // Estrutura hierárquica
  sections?: {
    id: string;
    title: string;
    content: string;
    subsections?: {
      id: string;
      title: string;
      content: string;
    }[];
  }[];
  
  // Referências e fontes
  references?: {
    id: string;
    title: string;
    url?: string;
    author?: string;
    date?: string;
    type: ReferenceType;
  }[];
  
  // Metadados de estudo
  study_metadata?: {
    key_concepts: string[];
    important_dates?: string[];
    formulas?: string[];
    legal_articles?: string[];
    exam_tips?: string[];
  };
  
  // Configurações de compartilhamento
  visibility: VisibilityLevel;
  shared_with?: string[]; // User IDs
  
  // Estatísticas
  statistics?: {
    views: number;
    likes: number;
    shares: number;
    study_sessions: number;
    average_rating: number;
    total_ratings: number;
  };
  
  status: SummaryStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface SummaryVersion {
  id: string;
  summary_id: string;
  version: number;
  title: string;
  content: string;
  changes_description?: string;
  created_by: string;
  created_at: string;
}

export interface SummaryStudySession {
  id: string;
  summary_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  time_spent: number; // segundos
  completion_percentage: number;
  notes?: string;
  rating?: number; // 1-5
  feedback?: string;
}

export interface SummaryCollection {
  id: string;
  name: string;
  description?: string;
  summary_ids: string[];
  visibility: VisibilityLevel;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Load or initialize data files
let summaries: Summary[] = [];
let summaryVersions: SummaryVersion[] = [];
let summaryStudySessions: SummaryStudySession[] = [];
let summaryCollections: SummaryCollection[] = [];

// Helper function to load data from file
function loadDataFromFile<T>(filePath: string, defaultData: T[] = []): T[] {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return defaultData;
    }
  } else {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// Helper function to load summaries
function loadSummaries(): Summary[] {
  return loadDataFromFile<Summary>(summariesPath, summaries);
}

// Helper function to save data to file
function saveDataToFile<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Initialize data
summaries = loadDataFromFile<Summary>(summariesPath);
summaryVersions = loadDataFromFile<SummaryVersion>(summaryVersionsPath);
summaryStudySessions = loadDataFromFile<SummaryStudySession>(summaryStudySessionsPath);
summaryCollections = loadDataFromFile<SummaryCollection>(summaryCollectionsPath);

// Helper function to generate unique ID
function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Helper function to check if user can access summary
function canAccessSummary(summary: Summary, userId: string, userRole: string): boolean {
  if (userRole === 'admin') return true;
  if (summary.created_by === userId) return true;
  if (summary.visibility === 'public' && summary.status === 'published') return true;
  if (summary.visibility === 'shared' && summary.shared_with?.includes(userId)) return true;
  return false;
}

// Helper function to update summary statistics
function updateSummaryStatistics(summaryId: string, operation: string, value?: number): void {
  const summaryIndex = summaries.findIndex(s => s.id === summaryId);
  if (summaryIndex === -1) return;

  if (!summaries[summaryIndex].statistics) {
    summaries[summaryIndex].statistics = {
      views: 0,
      likes: 0,
      shares: 0,
      study_sessions: 0,
      average_rating: 0,
      total_ratings: 0
    };
  }

  const stats = summaries[summaryIndex].statistics!;

  switch (operation) {
    case 'view':
      stats.views++;
      break;
    case 'like':
      stats.likes += value || 1;
      break;
    case 'share':
      stats.shares++;
      break;
    case 'study_session':
      stats.study_sessions++;
      break;
    case 'rate':
      if (value !== undefined && value >= 1 && value <= 5) {
        const totalRatings = stats.total_ratings;
        const currentTotal = stats.average_rating * totalRatings;
        stats.total_ratings++;
        stats.average_rating = Number(((currentTotal + value) / stats.total_ratings).toFixed(1));
      }
      break;
  }

  summaries[summaryIndex].updated_at = new Date().toISOString();
  saveDataToFile(summariesPath, summaries);
}

// CRUD Operations - Summary Management

// GET /api/v1/summaries - List summaries with filters
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').toLowerCase();
    const subject = req.query.subject as string;
    const topic = req.query.topic as string;
    const summary_type = req.query.summary_type as string;
    const difficulty = req.query.difficulty as string;
    const status = req.query.status as string;
    const visibility = req.query.visibility as string;
    const created_by = req.query.created_by as string;
    const tags = req.query.tags as string;

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Filter summaries based on access permissions and filters
    let filteredSummaries = summaries.filter(summary => {
      // Access control
      if (!canAccessSummary(summary, userId, userRole)) {
        return false;
      }

      // Text search
      const matchesSearch = !search || 
        summary.title.toLowerCase().includes(search) ||
        summary.content.toLowerCase().includes(search) ||
        summary.subject.toLowerCase().includes(search) ||
        (summary.topic && summary.topic.toLowerCase().includes(search));

      // Filters
      const matchesSubject = !subject || summary.subject === subject;
      const matchesTopic = !topic || summary.topic === topic;
      const matchesType = !summary_type || summary.summary_type === summary_type;
      const matchesDifficulty = !difficulty || summary.difficulty === difficulty;
      const matchesStatus = !status || summary.status === status;
      const matchesVisibility = !visibility || summary.visibility === visibility;
      const matchesCreator = !created_by || summary.created_by === created_by;
      
      const matchesTags = !tags || (summary.tags && summary.tags.some(tag => 
        tags.split(',').map(t => t.trim().toLowerCase()).includes(tag.toLowerCase())
      ));

      return matchesSearch && matchesSubject && matchesTopic && matchesType && 
             matchesDifficulty && matchesStatus && matchesVisibility && 
             matchesCreator && matchesTags;
    });

    // Sort by updated_at (newest first)
    filteredSummaries.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = filteredSummaries.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalPages = Math.ceil(filteredSummaries.length / limit);

    res.json({
      success: true,
      data: paginatedSummaries,
      pagination: {
        page,
        limit,
        total: filteredSummaries.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error listing summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar resumos' 
    });
  }
});

// GET /api/v1/summaries/available - List available summaries for students
router.get('/available', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas estudantes' 
      });
      return;
    }

    const userId = req.user.id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const subject = req.query.subject as string;
    const difficulty = req.query.difficulty as string;

    // Get available summaries for students
    let availableSummaries = summaries.filter(summary => {
      const isPublished = summary.status === 'published';
      const isAccessible = summary.visibility === 'public' || 
                          summary.visibility === 'shared' && summary.shared_with?.includes(userId);
      
      const matchesSubject = !subject || summary.subject === subject;
      const matchesDifficulty = !difficulty || summary.difficulty === difficulty;
      
      return isPublished && isAccessible && matchesSubject && matchesDifficulty;
    });

    // Sort by popularity (views + likes)
    availableSummaries.sort((a, b) => {
      const scoreA = (a.statistics?.views || 0) + (a.statistics?.likes || 0);
      const scoreB = (b.statistics?.views || 0) + (b.statistics?.likes || 0);
      return scoreB - scoreA;
    });

    // Add user study progress
    const summariesWithProgress = availableSummaries.map(summary => {
      const userSessions = summaryStudySessions.filter(
        session => session.summary_id === summary.id && session.user_id === userId
      );
      
      const lastSession = userSessions.sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0];

      return {
        ...summary,
        user_progress: {
          has_studied: userSessions.length > 0,
          last_studied: lastSession?.started_at,
          completion_percentage: lastSession?.completion_percentage || 0,
          total_time_spent: userSessions.reduce((sum, s) => sum + s.time_spent, 0)
        }
      };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = summariesWithProgress.slice(startIndex, endIndex);

    const totalPages = Math.ceil(summariesWithProgress.length / limit);

    res.json({
      success: true,
      data: paginatedSummaries,
      pagination: {
        page,
        limit,
        total: summariesWithProgress.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error listing available summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar resumos disponíveis' 
    });
  }
});

// GET /api/v1/summaries/search - Search summaries
router.get('/search', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const query = (req.query.q || req.query.query || '').toString().toLowerCase();
    const subject = req.query.subject as string;
    const topic = req.query.topic as string;
    const tags = req.query.tags as string;
    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const summariesData = loadSummaries();
    
    // Filter summaries based on search criteria
    let filteredSummaries = summariesData.filter(summary => {
      const matchesQuery = !query || 
        summary.title.toLowerCase().includes(query) ||
        summary.content.toLowerCase().includes(query) ||
        summary.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesSubject = !subject || summary.subject === subject;
      const matchesTopic = !topic || summary.topic === topic;
      const matchesType = !type || summary.summary_type === type;
      const matchesDifficulty = !difficulty || summary.difficulty === difficulty;
      
      const matchesTags = !tags || 
        tags.split(',').some(tag => 
          summary.tags.some(summaryTag => 
            summaryTag.toLowerCase().includes(tag.trim().toLowerCase())
          )
        );
      
      return matchesQuery && matchesSubject && matchesTopic && 
             matchesType && matchesDifficulty && matchesTags;
    });

    // Sort by relevance (title matches first, then content matches)
    if (query) {
      filteredSummaries.sort((a, b) => {
        const aInTitle = a.title.toLowerCase().includes(query);
        const bInTitle = b.title.toLowerCase().includes(query);
        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        return 0;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = filteredSummaries.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedSummaries,
      pagination: {
        page,
        limit,
        total: filteredSummaries.length,
        pages: Math.ceil(filteredSummaries.length / limit)
      }
    });
  } catch (error) {
    console.error('Error searching summaries:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar resumos'
    });
  }
});

// GET /api/v1/summaries/subjects - Get unique subjects from summaries
router.get('/subjects', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summariesData = loadSummaries();
    
    // Get unique subjects with counts
    const subjectMap = new Map<string, number>();
    summariesData.forEach(summary => {
      const count = subjectMap.get(summary.subject) || 0;
      subjectMap.set(summary.subject, count + 1);
    });

    // Convert to array and sort by count (most summaries first)
    const subjects = Array.from(subjectMap.entries())
      .map(([subject, count]) => ({
        subject,
        count,
        topics: getTopicsForSubjectHelper(summariesData, subject)
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: subjects,
      total: subjects.length
    });
  } catch (error) {
    console.error('Error getting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar matérias'
    });
  }
});

// Helper function to get topics for a subject
function getTopicsForSubjectHelper(summariesData: any[], subject: string): string[] {
  const topics = new Set<string>();
  summariesData
    .filter(s => s.subject === subject && s.topic)
    .forEach(s => topics.add(s.topic));
  return Array.from(topics);
}

// GET /api/v1/summaries/:id - Get single summary
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summary = summaries.find(s => s.id === req.params.id);
    
    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (!canAccessSummary(summary, userId, userRole)) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Update view count for published summaries
    if (summary.status === 'published' && userRole === 'student') {
      updateSummaryStatistics(summary.id, 'view');
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar resumo' 
    });
  }
});

// POST /api/v1/summaries - Create new summary
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      title,
      subject,
      topic,
      subtopic,
      content,
      summary_type,
      difficulty,
      tags = [],
      sections = [],
      references = [],
      study_metadata,
      visibility = 'private',
      shared_with = [],
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !subject || !content || !summary_type || !difficulty) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: title, subject, content, summary_type, difficulty' 
      });
      return;
    }

    // Generate new ID
    const newId = generateId('sm');

    // Calculate reading time
    const estimatedReadingTime = calculateReadingTime(content);

    // Create new summary
    const newSummary: Summary = {
      id: newId,
      title,
      subject,
      topic,
      subtopic,
      content,
      summary_type,
      difficulty,
      estimated_reading_time: estimatedReadingTime,
      tags: Array.isArray(tags) ? tags : [],
      sections: sections.map((section: any) => ({
        ...section,
        id: section.id || generateId('sec'),
        subsections: section.subsections?.map((sub: any) => ({
          ...sub,
          id: sub.id || generateId('sub')
        })) || []
      })),
      references: references.map((ref: any) => ({
        ...ref,
        id: ref.id || generateId('ref')
      })),
      study_metadata,
      visibility,
      shared_with: visibility === 'shared' ? shared_with : [],
      statistics: {
        views: 0,
        likes: 0,
        shares: 0,
        study_sessions: 0,
        average_rating: 0,
        total_ratings: 0
      },
      status,
      created_by: req.user!.id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to array and save
    summaries.push(newSummary);
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Resumo criado com sucesso',
      data: newSummary
    });
  } catch (error) {
    console.error('Error creating summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar resumo' 
    });
  }
});

// PUT /api/v1/summaries/:id - Update summary
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const existingSummary = summaries[summaryIndex];
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions (only creator or admin can edit)
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas o criador ou admin pode editar' 
      });
      return;
    }

    const {
      title,
      subject,
      topic,
      subtopic,
      content,
      summary_type,
      difficulty,
      tags,
      sections,
      references,
      study_metadata,
      visibility,
      shared_with,
      status
    } = req.body;

    // Create version backup if content changed
    if (content && content !== existingSummary.content) {
      const newVersion: SummaryVersion = {
        id: generateId('sv'),
        summary_id: summaryId,
        version: summaryVersions.filter(v => v.summary_id === summaryId).length + 1,
        title: existingSummary.title,
        content: existingSummary.content,
        changes_description: req.body.changes_description,
        created_by: userId,
        created_at: new Date().toISOString()
      };

      summaryVersions.push(newVersion);
      saveDataToFile(summaryVersionsPath, summaryVersions);
    }

    // Update summary
    const updatedSummary: Summary = {
      ...existingSummary,
      title: title || existingSummary.title,
      subject: subject || existingSummary.subject,
      topic: topic || existingSummary.topic,
      subtopic: subtopic || existingSummary.subtopic,
      content: content || existingSummary.content,
      summary_type: summary_type || existingSummary.summary_type,
      difficulty: difficulty || existingSummary.difficulty,
      estimated_reading_time: content ? calculateReadingTime(content) : existingSummary.estimated_reading_time,
      tags: tags !== undefined ? tags : existingSummary.tags,
      sections: sections !== undefined ? sections.map((section: any) => ({
        ...section,
        id: section.id || generateId('sec'),
        subsections: section.subsections?.map((sub: any) => ({
          ...sub,
          id: sub.id || generateId('sub')
        })) || []
      })) : existingSummary.sections,
      references: references !== undefined ? references.map((ref: any) => ({
        ...ref,
        id: ref.id || generateId('ref')
      })) : existingSummary.references,
      study_metadata: study_metadata !== undefined ? study_metadata : existingSummary.study_metadata,
      visibility: visibility || existingSummary.visibility,
      shared_with: visibility === 'shared' ? (shared_with || existingSummary.shared_with) : [],
      status: status || existingSummary.status,
      updated_at: new Date().toISOString(),
      published_at: status === 'published' && existingSummary.status !== 'published' 
        ? new Date().toISOString() 
        : existingSummary.published_at
    };

    summaries[summaryIndex] = updatedSummary;
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Resumo atualizado com sucesso',
      data: updatedSummary
    });
  } catch (error) {
    console.error('Error updating summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar resumo' 
    });
  }
});

// DELETE /api/v1/summaries/:id - Delete summary
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const existingSummary = summaries[summaryIndex];
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions (only creator or admin can delete)
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas o criador ou admin pode excluir' 
      });
      return;
    }

    // Check if summary has study sessions
    const hasStudySessions = summaryStudySessions.some(session => session.summary_id === summaryId);
    if (hasStudySessions) {
      res.status(400).json({ 
        success: false,
        message: 'Não é possível excluir resumo com sessões de estudo. Considere arquivar.' 
      });
      return;
    }

    // Remove summary
    summaries.splice(summaryIndex, 1);
    saveDataToFile(summariesPath, summaries);

    // Remove related versions
    summaryVersions = summaryVersions.filter(v => v.summary_id !== summaryId);
    saveDataToFile(summaryVersionsPath, summaryVersions);

    // Remove from collections
    summaryCollections.forEach(collection => {
      collection.summary_ids = collection.summary_ids.filter(id => id !== summaryId);
    });
    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Resumo excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir resumo' 
    });
  }
});

// POST /api/v1/summaries/:id/publish - Publish summary
router.post('/:id/publish', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    summaries[summaryIndex].status = 'published';
    summaries[summaryIndex].published_at = new Date().toISOString();
    summaries[summaryIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Resumo publicado com sucesso',
      data: summaries[summaryIndex]
    });
  } catch (error) {
    console.error('Error publishing summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao publicar resumo' 
    });
  }
});

// POST /api/v1/summaries/:id/archive - Archive summary
router.post('/:id/archive', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    summaries[summaryIndex].status = 'archived';
    summaries[summaryIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Resumo arquivado com sucesso',
      data: summaries[summaryIndex]
    });
  } catch (error) {
    console.error('Error archiving summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao arquivar resumo' 
    });
  }
});

// POST /api/v1/summaries/:id/duplicate - Duplicate summary
router.post('/:id/duplicate', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check if user can access the original summary
    if (!canAccessSummary(summary, userId, userRole)) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Create duplicate
    const newId = generateId('sm');
    const duplicatedSummary: Summary = {
      ...summary,
      id: newId,
      title: `${summary.title} (Cópia)`,
      status: 'draft',
      visibility: 'private',
      shared_with: [],
      statistics: {
        views: 0,
        likes: 0,
        shares: 0,
        study_sessions: 0,
        average_rating: 0,
        total_ratings: 0
      },
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: undefined
    };

    summaries.push(duplicatedSummary);
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Resumo duplicado com sucesso',
      data: duplicatedSummary
    });
  } catch (error) {
    console.error('Error duplicating summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao duplicar resumo' 
    });
  }
});

// GET /api/v1/summaries/:id/preview - Preview summary
router.get('/:id/preview', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summary = summaries.find(s => s.id === req.params.id);
    
    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (userRole !== 'admin' && summary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas o criador ou admin' 
      });
      return;
    }

    // Return preview (summary without full content)
    const previewData = {
      id: summary.id,
      title: summary.title,
      subject: summary.subject,
      topic: summary.topic,
      subtopic: summary.subtopic,
      summary_type: summary.summary_type,
      difficulty: summary.difficulty,
      estimated_reading_time: summary.estimated_reading_time,
      tags: summary.tags,
      content: summary.content.substring(0, 500) + (summary.content.length > 500 ? '...' : ''),
      sections: summary.sections?.map(section => ({
        ...section,
        content: section.content.substring(0, 200) + (section.content.length > 200 ? '...' : ''),
        subsections: section.subsections?.map(sub => ({
          ...sub,
          content: sub.content.substring(0, 100) + (sub.content.length > 100 ? '...' : '')
        }))
      })),
      references: summary.references,
      study_metadata: summary.study_metadata,
      visibility: summary.visibility,
      status: summary.status,
      created_at: summary.created_at,
      updated_at: summary.updated_at
    };

    res.json({
      success: true,
      data: previewData
    });
  } catch (error) {
    console.error('Error previewing summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao visualizar resumo' 
    });
  }
});

// Content Management Routes

// POST /api/v1/summaries/:id/sections - Add section
router.post('/:id/sections', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const { title, content, subsections = [] } = req.body;

    if (!title || !content) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: title, content' 
      });
      return;
    }

    const newSection = {
      id: generateId('sec'),
      title,
      content,
      subsections: subsections.map((sub: any) => ({
        ...sub,
        id: sub.id || generateId('sub')
      }))
    };

    if (!summaries[summaryIndex].sections) {
      summaries[summaryIndex].sections = [];
    }

    summaries[summaryIndex].sections!.push(newSection);
    summaries[summaryIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Seção adicionada com sucesso',
      data: newSection
    });
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar seção' 
    });
  }
});

// PUT /api/v1/summaries/:id/sections/:sectionId - Update section
router.put('/:id/sections/:sectionId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const sectionId = req.params.sectionId;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (!existingSummary.sections) {
      res.status(404).json({ 
        success: false,
        message: 'Seção não encontrada' 
      });
      return;
    }

    const sectionIndex = existingSummary.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Seção não encontrada' 
      });
      return;
    }

    const { title, content, subsections } = req.body;

    summaries[summaryIndex].sections![sectionIndex] = {
      ...existingSummary.sections[sectionIndex],
      title: title || existingSummary.sections[sectionIndex].title,
      content: content || existingSummary.sections[sectionIndex].content,
      subsections: subsections !== undefined ? subsections.map((sub: any) => ({
        ...sub,
        id: sub.id || generateId('sub')
      })) : existingSummary.sections[sectionIndex].subsections
    };

    summaries[summaryIndex].updated_at = new Date().toISOString();
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Seção atualizada com sucesso',
      data: summaries[summaryIndex].sections![sectionIndex]
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar seção' 
    });
  }
});

// DELETE /api/v1/summaries/:id/sections/:sectionId - Remove section
router.delete('/:id/sections/:sectionId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const sectionId = req.params.sectionId;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (!existingSummary.sections) {
      res.status(404).json({ 
        success: false,
        message: 'Seção não encontrada' 
      });
      return;
    }

    const sectionIndex = existingSummary.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Seção não encontrada' 
      });
      return;
    }

    summaries[summaryIndex].sections!.splice(sectionIndex, 1);
    summaries[summaryIndex].updated_at = new Date().toISOString();
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Seção removida com sucesso'
    });
  } catch (error) {
    console.error('Error removing section:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover seção' 
    });
  }
});

// POST /api/v1/summaries/:id/references - Add reference
router.post('/:id/references', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const { title, url, author, date, type } = req.body;

    if (!title || !type) {
      res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: title, type' 
      });
      return;
    }

    const newReference = {
      id: generateId('ref'),
      title,
      url,
      author,
      date,
      type
    };

    if (!summaries[summaryIndex].references) {
      summaries[summaryIndex].references = [];
    }

    summaries[summaryIndex].references!.push(newReference);
    summaries[summaryIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Referência adicionada com sucesso',
      data: newReference
    });
  } catch (error) {
    console.error('Error adding reference:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar referência' 
    });
  }
});

// DELETE /api/v1/summaries/:id/references/:refId - Remove reference
router.delete('/:id/references/:refId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const refId = req.params.refId;
    const summaryIndex = summaries.findIndex(s => s.id === summaryId);

    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingSummary = summaries[summaryIndex];

    // Check permissions
    if (userRole !== 'admin' && existingSummary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (!existingSummary.references) {
      res.status(404).json({ 
        success: false,
        message: 'Referência não encontrada' 
      });
      return;
    }

    const refIndex = existingSummary.references.findIndex(r => r.id === refId);
    if (refIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Referência não encontrada' 
      });
      return;
    }

    summaries[summaryIndex].references!.splice(refIndex, 1);
    summaries[summaryIndex].updated_at = new Date().toISOString();
    saveDataToFile(summariesPath, summaries);

    res.json({
      success: true,
      message: 'Referência removida com sucesso'
    });
  } catch (error) {
    console.error('Error removing reference:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover referência' 
    });
  }
});

// Version Control Routes

// GET /api/v1/summaries/:id/versions - List versions
router.get('/:id/versions', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (userRole !== 'admin' && summary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const versions = summaryVersions
      .filter(v => v.summary_id === summaryId)
      .sort((a, b) => b.version - a.version);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error listing versions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar versões' 
    });
  }
});

// POST /api/v1/summaries/:id/versions - Create new version
router.post('/:id/versions', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (userRole !== 'admin' && summary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const { changes_description } = req.body;

    const newVersion: SummaryVersion = {
      id: generateId('sv'),
      summary_id: summaryId,
      version: summaryVersions.filter(v => v.summary_id === summaryId).length + 1,
      title: summary.title,
      content: summary.content,
      changes_description,
      created_by: userId,
      created_at: new Date().toISOString()
    };

    summaryVersions.push(newVersion);
    saveDataToFile(summaryVersionsPath, summaryVersions);

    res.json({
      success: true,
      message: 'Versão criada com sucesso',
      data: newVersion
    });
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar versão' 
    });
  }
});

// GET /api/v1/summaries/:id/versions/:versionId - Get specific version
router.get('/:id/versions/:versionId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const versionId = req.params.versionId;

    const summary = summaries.find(s => s.id === summaryId);
    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (userRole !== 'admin' && summary.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const version = summaryVersions.find(v => v.id === versionId && v.summary_id === summaryId);
    if (!version) {
      res.status(404).json({ 
        success: false,
        message: 'Versão não encontrada' 
      });
      return;
    }

    res.json({
      success: true,
      data: version
    });
  } catch (error) {
    console.error('Error getting version:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar versão' 
    });
  }
});

// POST /api/v1/summaries/:id/versions/:versionId/restore - Restore version
router.post('/:id/versions/:versionId/restore', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const versionId = req.params.versionId;

    const summaryIndex = summaries.findIndex(s => s.id === summaryId);
    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions
    if (userRole !== 'admin' && summaries[summaryIndex].created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const version = summaryVersions.find(v => v.id === versionId && v.summary_id === summaryId);
    if (!version) {
      res.status(404).json({ 
        success: false,
        message: 'Versão não encontrada' 
      });
      return;
    }

    // Create backup of current version
    const currentBackup: SummaryVersion = {
      id: generateId('sv'),
      summary_id: summaryId,
      version: summaryVersions.filter(v => v.summary_id === summaryId).length + 1,
      title: summaries[summaryIndex].title,
      content: summaries[summaryIndex].content,
      changes_description: `Backup antes de restaurar versão ${version.version}`,
      created_by: userId,
      created_at: new Date().toISOString()
    };

    summaryVersions.push(currentBackup);

    // Restore version
    summaries[summaryIndex].title = version.title;
    summaries[summaryIndex].content = version.content;
    summaries[summaryIndex].estimated_reading_time = calculateReadingTime(version.content);
    summaries[summaryIndex].updated_at = new Date().toISOString();

    saveDataToFile(summariesPath, summaries);
    saveDataToFile(summaryVersionsPath, summaryVersions);

    res.json({
      success: true,
      message: `Versão ${version.version} restaurada com sucesso`,
      data: summaries[summaryIndex]
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao restaurar versão' 
    });
  }
});

// Student Study Features

// POST /api/v1/summaries/:id/study-session - Start study session
router.post('/:id/study-session', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user.id.toString();

    // Check if summary is accessible
    if (!canAccessSummary(summary, userId, 'student')) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado ao resumo' 
      });
      return;
    }

    // Check for existing in-progress session
    const existingSession = summaryStudySessions.find(
      s => s.summary_id === summaryId && s.user_id === userId && !s.ended_at
    );

    if (existingSession) {
      res.json({
        success: true,
        message: 'Sessão de estudo já iniciada',
        data: { session_id: existingSession.id }
      });
      return;
    }

    // Create new study session
    const newSession: SummaryStudySession = {
      id: generateId('ss'),
      summary_id: summaryId,
      user_id: userId,
      started_at: new Date().toISOString(),
      time_spent: 0,
      completion_percentage: 0
    };

    summaryStudySessions.push(newSession);
    saveDataToFile(summaryStudySessionsPath, summaryStudySessions);

    // Update summary statistics
    updateSummaryStatistics(summaryId, 'study_session');

    res.json({
      success: true,
      message: 'Sessão de estudo iniciada',
      data: { session_id: newSession.id }
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao iniciar sessão de estudo' 
    });
  }
});

// PUT /api/v1/summaries/study-sessions/:sessionId - Update study session
router.put('/study-sessions/:sessionId', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const sessionId = req.params.sessionId;
    const sessionIndex = summaryStudySessions.findIndex(s => s.id === sessionId);

    if (sessionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Sessão não encontrada' 
      });
      return;
    }

    const userId = req.user.id.toString();
    const session = summaryStudySessions[sessionIndex];

    // Check permissions
    if (session.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (session.ended_at) {
      res.status(400).json({ 
        success: false,
        message: 'Sessão já foi finalizada' 
      });
      return;
    }

    const { time_spent, completion_percentage, notes } = req.body;

    // Update session
    summaryStudySessions[sessionIndex] = {
      ...session,
      time_spent: time_spent !== undefined ? time_spent : session.time_spent,
      completion_percentage: completion_percentage !== undefined ? completion_percentage : session.completion_percentage,
      notes: notes !== undefined ? notes : session.notes
    };

    saveDataToFile(summaryStudySessionsPath, summaryStudySessions);

    res.json({
      success: true,
      message: 'Sessão atualizada com sucesso',
      data: summaryStudySessions[sessionIndex]
    });
  } catch (error) {
    console.error('Error updating study session:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar sessão' 
    });
  }
});

// POST /api/v1/summaries/study-sessions/:sessionId/complete - Complete study session
router.post('/study-sessions/:sessionId/complete', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const sessionId = req.params.sessionId;
    const sessionIndex = summaryStudySessions.findIndex(s => s.id === sessionId);

    if (sessionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Sessão não encontrada' 
      });
      return;
    }

    const userId = req.user.id.toString();
    const session = summaryStudySessions[sessionIndex];

    // Check permissions
    if (session.user_id !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    if (session.ended_at) {
      res.status(400).json({ 
        success: false,
        message: 'Sessão já foi finalizada' 
      });
      return;
    }

    const { time_spent, completion_percentage, rating, feedback, notes } = req.body;

    // Complete session
    summaryStudySessions[sessionIndex] = {
      ...session,
      ended_at: new Date().toISOString(),
      time_spent: time_spent || session.time_spent,
      completion_percentage: completion_percentage || 100,
      rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
      feedback,
      notes: notes || session.notes
    };

    saveDataToFile(summaryStudySessionsPath, summaryStudySessions);

    // Update summary rating if provided
    if (rating && rating >= 1 && rating <= 5) {
      updateSummaryStatistics(session.summary_id, 'rate', rating);
    }

    res.json({
      success: true,
      message: 'Sessão finalizada com sucesso',
      data: summaryStudySessions[sessionIndex]
    });
  } catch (error) {
    console.error('Error completing study session:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao finalizar sessão' 
    });
  }
});

// GET /api/v1/summaries/my-sessions - List user's study sessions
router.get('/my-sessions', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const userId = req.user.id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get user's sessions
    let userSessions = summaryStudySessions.filter(s => s.user_id === userId);

    // Sort by start date (newest first)
    userSessions.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    // Add summary info
    const sessionsWithSummaryInfo = userSessions.map(session => {
      const summary = summaries.find(s => s.id === session.summary_id);
      return {
        ...session,
        summary_title: summary?.title || 'Resumo não encontrado',
        summary_subject: summary?.subject,
        summary_difficulty: summary?.difficulty
      };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSessions = sessionsWithSummaryInfo.slice(startIndex, endIndex);

    const totalPages = Math.ceil(sessionsWithSummaryInfo.length / limit);

    res.json({
      success: true,
      data: paginatedSessions,
      pagination: {
        page,
        limit,
        total: sessionsWithSummaryInfo.length,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error listing study sessions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar sessões de estudo' 
    });
  }
});

// POST /api/v1/summaries/:id/rate - Rate summary
router.post('/:id/rate', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user.id.toString();

    // Check if summary is accessible
    if (!canAccessSummary(summary, userId, 'student')) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado ao resumo' 
      });
      return;
    }

    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ 
        success: false,
        message: 'Rating deve estar entre 1 e 5' 
      });
      return;
    }

    // Update rating
    updateSummaryStatistics(summaryId, 'rate', rating);

    res.json({
      success: true,
      message: 'Avaliação registrada com sucesso'
    });
  } catch (error) {
    console.error('Error rating summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao avaliar resumo' 
    });
  }
});

// POST /api/v1/summaries/:id/like - Like/Unlike summary
router.post('/:id/like', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user.id.toString();

    // Check if summary is accessible
    if (!canAccessSummary(summary, userId, 'student')) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado ao resumo' 
      });
      return;
    }

    // For simplicity, we'll just increment/decrement likes
    // In a real app, you'd track individual user likes
    const { like } = req.body; // true to like, false to unlike

    updateSummaryStatistics(summaryId, 'like', like ? 1 : -1);

    res.json({
      success: true,
      message: like ? 'Resumo curtido' : 'Curtida removida'
    });
  } catch (error) {
    console.error('Error liking summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao curtir resumo' 
    });
  }
});

// Collections Management

// GET /api/v1/summaries/collections - List collections
router.get('/collections', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Filter collections based on visibility and ownership
    let filteredCollections = summaryCollections.filter(collection => {
      if (userRole === 'admin') return true;
      if (collection.created_by === userId) return true;
      if (collection.visibility === 'public') return true;
      return false;
    });

    // Add summary count and titles
    const collectionsWithInfo = filteredCollections.map(collection => {
      const summaryTitles = collection.summary_ids.map(id => {
        const summary = summaries.find(s => s.id === id);
        return summary ? summary.title : 'Resumo não encontrado';
      });

      return {
        ...collection,
        summary_count: collection.summary_ids.length,
        summary_titles: summaryTitles.slice(0, 3), // Show first 3 titles
        total_summaries: collection.summary_ids.length
      };
    });

    res.json({
      success: true,
      data: collectionsWithInfo
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar coleções' 
    });
  }
});

// POST /api/v1/summaries/collections - Create collection
router.post('/collections', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { name, description, summary_ids = [], visibility = 'private' } = req.body;

    if (!name) {
      res.status(400).json({ 
        success: false,
        message: 'Nome da coleção é obrigatório' 
      });
      return;
    }

    const userId = req.user!.id.toString();

    // Validate summary IDs
    const validSummaryIds = summary_ids.filter((id: string) => {
      const summary = summaries.find(s => s.id === id);
      return summary && canAccessSummary(summary, userId, req.user!.role);
    });

    const newCollection: SummaryCollection = {
      id: generateId('sc'),
      name,
      description,
      summary_ids: validSummaryIds,
      visibility,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    summaryCollections.push(newCollection);
    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Coleção criada com sucesso',
      data: newCollection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar coleção' 
    });
  }
});

// PUT /api/v1/summaries/collections/:id - Update collection
router.put('/collections/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const collectionId = req.params.id;
    const collectionIndex = summaryCollections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingCollection = summaryCollections[collectionIndex];

    // Check permissions
    if (userRole !== 'admin' && existingCollection.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const { name, description, summary_ids, visibility } = req.body;

    // Validate summary IDs if provided
    let validSummaryIds = existingCollection.summary_ids;
    if (summary_ids !== undefined) {
      validSummaryIds = summary_ids.filter((id: string) => {
        const summary = summaries.find(s => s.id === id);
        return summary && canAccessSummary(summary, userId, userRole);
      });
    }

    summaryCollections[collectionIndex] = {
      ...existingCollection,
      name: name || existingCollection.name,
      description: description !== undefined ? description : existingCollection.description,
      summary_ids: validSummaryIds,
      visibility: visibility || existingCollection.visibility,
      updated_at: new Date().toISOString()
    };

    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Coleção atualizada com sucesso',
      data: summaryCollections[collectionIndex]
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar coleção' 
    });
  }
});

// DELETE /api/v1/summaries/collections/:id - Delete collection
router.delete('/collections/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const collectionId = req.params.id;
    const collectionIndex = summaryCollections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const existingCollection = summaryCollections[collectionIndex];

    // Check permissions
    if (userRole !== 'admin' && existingCollection.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    summaryCollections.splice(collectionIndex, 1);
    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Coleção excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao excluir coleção' 
    });
  }
});

// POST /api/v1/summaries/collections/:id/summaries/:summaryId - Add summary to collection
router.post('/collections/:id/summaries/:summaryId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const collectionId = req.params.id;
    const summaryId = req.params.summaryId;

    const collectionIndex = summaryCollections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada' 
      });
      return;
    }

    const summary = summaries.find(s => s.id === summaryId);
    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const collection = summaryCollections[collectionIndex];

    // Check permissions
    if (userRole !== 'admin' && collection.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Check if user can access summary
    if (!canAccessSummary(summary, userId, userRole)) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado ao resumo' 
      });
      return;
    }

    // Check if summary is already in collection
    if (collection.summary_ids.includes(summaryId)) {
      res.status(400).json({ 
        success: false,
        message: 'Resumo já está na coleção' 
      });
      return;
    }

    summaryCollections[collectionIndex].summary_ids.push(summaryId);
    summaryCollections[collectionIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Resumo adicionado à coleção',
      data: summaryCollections[collectionIndex]
    });
  } catch (error) {
    console.error('Error adding summary to collection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar resumo à coleção' 
    });
  }
});

// DELETE /api/v1/summaries/collections/:id/summaries/:summaryId - Remove summary from collection
router.delete('/collections/:id/summaries/:summaryId', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const collectionId = req.params.id;
    const summaryId = req.params.summaryId;

    const collectionIndex = summaryCollections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Coleção não encontrada' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    const collection = summaryCollections[collectionIndex];

    // Check permissions
    if (userRole !== 'admin' && collection.created_by !== userId) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const summaryIndex = collection.summary_ids.indexOf(summaryId);
    if (summaryIndex === -1) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado na coleção' 
      });
      return;
    }

    summaryCollections[collectionIndex].summary_ids.splice(summaryIndex, 1);
    summaryCollections[collectionIndex].updated_at = new Date().toISOString();
    
    saveDataToFile(summaryCollectionsPath, summaryCollections);

    res.json({
      success: true,
      message: 'Resumo removido da coleção'
    });
  } catch (error) {
    console.error('Error removing summary from collection:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover resumo da coleção' 
    });
  }
});

// Search & Discovery Routes

// GET /api/v1/summaries/search - Advanced search
router.get('/search', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      q: query,
      subject,
      topics,
      difficulty,
      summary_type,
      tags,
      min_rating,
      max_reading_time,
      author,
      sort_by = 'relevance',
      page = '1',
      limit = '10'
    } = req.query;

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Filter accessible summaries
    let searchResults = summaries.filter(summary => 
      canAccessSummary(summary, userId, userRole) && 
      summary.status === 'published'
    );

    // Apply search filters
    if (query) {
      const searchTerm = (query as string).toLowerCase();
      searchResults = searchResults.filter(summary => 
        summary.title.toLowerCase().includes(searchTerm) ||
        summary.content.toLowerCase().includes(searchTerm) ||
        summary.subject.toLowerCase().includes(searchTerm) ||
        (summary.topic && summary.topic.toLowerCase().includes(searchTerm)) ||
        summary.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (subject) {
      searchResults = searchResults.filter(summary => summary.subject === subject);
    }

    if (topics) {
      const topicList = (topics as string).split(',').map(t => t.trim());
      searchResults = searchResults.filter(summary => 
        summary.topic && topicList.includes(summary.topic)
      );
    }

    if (difficulty) {
      searchResults = searchResults.filter(summary => summary.difficulty === difficulty);
    }

    if (summary_type) {
      searchResults = searchResults.filter(summary => summary.summary_type === summary_type);
    }

    if (tags) {
      const tagList = (tags as string).split(',').map(t => t.trim().toLowerCase());
      searchResults = searchResults.filter(summary => 
        summary.tags.some(tag => tagList.includes(tag.toLowerCase()))
      );
    }

    if (min_rating) {
      const minRating = parseFloat(min_rating as string);
      searchResults = searchResults.filter(summary => 
        (summary.statistics?.average_rating || 0) >= minRating
      );
    }

    if (max_reading_time) {
      const maxTime = parseInt(max_reading_time as string);
      searchResults = searchResults.filter(summary => 
        summary.estimated_reading_time <= maxTime
      );
    }

    if (author) {
      searchResults = searchResults.filter(summary => 
        summary.created_by === author
      );
    }

    // Sort results
    switch (sort_by) {
      case 'title':
        searchResults.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        searchResults.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        searchResults.sort((a, b) => 
          (b.statistics?.average_rating || 0) - (a.statistics?.average_rating || 0)
        );
        break;
      case 'popularity':
        searchResults.sort((a, b) => {
          const scoreA = (a.statistics?.views || 0) + (a.statistics?.likes || 0);
          const scoreB = (b.statistics?.views || 0) + (b.statistics?.likes || 0);
          return scoreB - scoreA;
        });
        break;
      case 'reading_time':
        searchResults.sort((a, b) => a.estimated_reading_time - b.estimated_reading_time);
        break;
      default: // relevance
        // For relevance, we could implement a more sophisticated scoring algorithm
        // For now, sort by a combination of rating and views
        searchResults.sort((a, b) => {
          const scoreA = (a.statistics?.average_rating || 0) * 0.7 + (a.statistics?.views || 0) * 0.3;
          const scoreB = (b.statistics?.average_rating || 0) * 0.7 + (b.statistics?.views || 0) * 0.3;
          return scoreB - scoreA;
        });
    }

    // Pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    const totalPages = Math.ceil(searchResults.length / limitNum);

    res.json({
      success: true,
      data: paginatedResults,
      search_info: {
        query: query || '',
        total_results: searchResults.length,
        applied_filters: {
          subject,
          topics,
          difficulty,
          summary_type,
          tags,
          min_rating,
          max_reading_time,
          author,
          sort_by
        }
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: searchResults.length,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error searching summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao pesquisar resumos' 
    });
  }
});

// GET /api/v1/summaries/subjects - List available subjects
router.get('/subjects', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Get accessible summaries
    const accessibleSummaries = summaries.filter(summary => 
      canAccessSummary(summary, userId, userRole)
    );

    // Extract unique subjects with counts
    const subjectCounts: Record<string, { count: number; topics: string[] }> = {};

    accessibleSummaries.forEach(summary => {
      if (!subjectCounts[summary.subject]) {
        subjectCounts[summary.subject] = { count: 0, topics: [] };
      }
      subjectCounts[summary.subject].count++;
      
      if (summary.topic && !subjectCounts[summary.subject].topics.includes(summary.topic)) {
        subjectCounts[summary.subject].topics.push(summary.topic);
      }
    });

    const subjects = Object.entries(subjectCounts).map(([subject, data]) => ({
      subject,
      count: data.count,
      topics: data.topics.sort()
    })).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error listing subjects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao listar matérias' 
    });
  }
});

// GET /api/v1/summaries/popular - Popular summaries
router.get('/popular', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Get accessible published summaries
    let popularSummaries = summaries.filter(summary => 
      canAccessSummary(summary, userId, userRole) && 
      summary.status === 'published'
    );

    // Sort by popularity score (views + likes + study sessions)
    popularSummaries.sort((a, b) => {
      const scoreA = (a.statistics?.views || 0) + 
                    (a.statistics?.likes || 0) * 2 + 
                    (a.statistics?.study_sessions || 0) * 1.5;
      const scoreB = (b.statistics?.views || 0) + 
                    (b.statistics?.likes || 0) * 2 + 
                    (b.statistics?.study_sessions || 0) * 1.5;
      return scoreB - scoreA;
    });

    const topSummaries = popularSummaries.slice(0, limit);

    res.json({
      success: true,
      data: topSummaries
    });
  } catch (error) {
    console.error('Error getting popular summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar resumos populares' 
    });
  }
});

// GET /api/v1/summaries/recent - Recent summaries
router.get('/recent', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Get accessible published summaries
    let recentSummaries = summaries.filter(summary => 
      canAccessSummary(summary, userId, userRole) && 
      summary.status === 'published'
    );

    // Sort by publication date (newest first)
    recentSummaries.sort((a, b) => 
      new Date(b.published_at || b.created_at).getTime() - 
      new Date(a.published_at || a.created_at).getTime()
    );

    const latestSummaries = recentSummaries.slice(0, limit);

    res.json({
      success: true,
      data: latestSummaries
    });
  } catch (error) {
    console.error('Error getting recent summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar resumos recentes' 
    });
  }
});

// GET /api/v1/summaries/recommended - Recommended summaries for user
router.get('/recommended', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas estudantes' 
    });
    return;
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user.id.toString();

    // Get user's study history
    const userSessions = summaryStudySessions.filter(s => s.user_id === userId);
    const studiedSummaryIds = [...new Set(userSessions.map(s => s.summary_id))];

    // Get user's preferences based on study history
    const studiedSummaries = summaries.filter(s => studiedSummaryIds.includes(s.id));
    const preferredSubjects = [...new Set(studiedSummaries.map(s => s.subject))];
    const preferredDifficulties = [...new Set(studiedSummaries.map(s => s.difficulty))];

    // Get accessible published summaries (excluding already studied)
    let recommendedSummaries = summaries.filter(summary => 
      canAccessSummary(summary, userId, 'student') && 
      summary.status === 'published' &&
      !studiedSummaryIds.includes(summary.id)
    );

    // Score summaries based on preferences
    const scoredSummaries = recommendedSummaries.map(summary => {
      let score = 0;

      // Prefer subjects user has studied
      if (preferredSubjects.includes(summary.subject)) {
        score += 3;
      }

      // Prefer similar difficulty levels
      if (preferredDifficulties.includes(summary.difficulty)) {
        score += 2;
      }

      // Boost popular summaries
      score += (summary.statistics?.views || 0) * 0.1;
      score += (summary.statistics?.likes || 0) * 0.2;
      score += (summary.statistics?.average_rating || 0) * 0.5;

      // Prefer newer summaries slightly
      const daysOld = (Date.now() - new Date(summary.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 30) {
        score += 1;
      }

      return { ...summary, recommendation_score: score };
    });

    // Sort by recommendation score
    scoredSummaries.sort((a, b) => b.recommendation_score - a.recommendation_score);

    const recommendations = scoredSummaries.slice(0, limit);

    res.json({
      success: true,
      data: recommendations.map(({ recommendation_score, ...summary }) => summary),
      recommendation_info: {
        based_on_subjects: preferredSubjects,
        based_on_difficulties: preferredDifficulties,
        total_studied: studiedSummaryIds.length
      }
    });
  } catch (error) {
    console.error('Error getting recommended summaries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar resumos recomendados' 
    });
  }
});

// Statistics & Analytics Routes

// GET /api/v1/summaries/:id/statistics - Get summary statistics
router.get('/:id/statistics', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaryId = req.params.id;
    const summary = summaries.find(s => s.id === summaryId);

    if (!summary) {
      res.status(404).json({ 
        success: false,
        message: 'Resumo não encontrado' 
      });
      return;
    }

    const userId = req.user?.id.toString() || '';
    const userRole = req.user?.role || 'student';

    // Check permissions (creator, admin, or published summary)
    if (userRole !== 'admin' && summary.created_by !== userId && summary.status !== 'published') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Get study sessions for this summary
    const summarySessions = summaryStudySessions.filter(s => s.summary_id === summaryId);
    const completedSessions = summarySessions.filter(s => s.ended_at);

    // Calculate detailed statistics
    const stats = {
      basic_stats: summary.statistics || {
        views: 0,
        likes: 0,
        shares: 0,
        study_sessions: 0,
        average_rating: 0,
        total_ratings: 0
      },
      
      study_analytics: {
        total_sessions: summarySessions.length,
        completed_sessions: completedSessions.length,
        completion_rate: summarySessions.length > 0 
          ? (completedSessions.length / summarySessions.length) * 100 
          : 0,
        
        average_completion_percentage: completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.completion_percentage, 0) / completedSessions.length
          : 0,
        
        average_study_time: completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.time_spent, 0) / completedSessions.length
          : 0,
        
        unique_students: [...new Set(summarySessions.map(s => s.user_id))].length
      },
      
      engagement_metrics: {
        ratings_distribution: {
          '1': completedSessions.filter(s => s.rating === 1).length,
          '2': completedSessions.filter(s => s.rating === 2).length,
          '3': completedSessions.filter(s => s.rating === 3).length,
          '4': completedSessions.filter(s => s.rating === 4).length,
          '5': completedSessions.filter(s => s.rating === 5).length,
        },
        
        feedback_count: completedSessions.filter(s => s.feedback).length,
        notes_count: completedSessions.filter(s => s.notes).length
      },
      
      time_analytics: {
        sessions_by_day: getSessionsByDay(summarySessions),
        peak_study_hours: getPeakStudyHours(summarySessions),
        average_session_duration: completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.time_spent, 0) / completedSessions.length / 60
          : 0 // in minutes
      }
    };

    res.json({
      success: true,
      data: {
        summary: {
          id: summary.id,
          title: summary.title,
          subject: summary.subject,
          created_at: summary.created_at,
          status: summary.status
        },
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error getting summary statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

// GET /api/v1/summaries/reports/usage - Usage report
router.get('/reports/usage', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filter recent data
    const recentSessions = summaryStudySessions.filter(s => 
      new Date(s.started_at) >= startDate
    );

    const recentSummaries = summaries.filter(s => 
      new Date(s.created_at) >= startDate
    );

    // Calculate usage statistics
    const usageStats = {
      period_info: {
        days,
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      },
      
      content_stats: {
        total_summaries: summaries.length,
        published_summaries: summaries.filter(s => s.status === 'published').length,
        draft_summaries: summaries.filter(s => s.status === 'draft').length,
        archived_summaries: summaries.filter(s => s.status === 'archived').length,
        new_summaries_period: recentSummaries.length
      },
      
      engagement_stats: {
        total_study_sessions: summaryStudySessions.length,
        sessions_in_period: recentSessions.length,
        completed_sessions: summaryStudySessions.filter(s => s.ended_at).length,
        total_study_time_hours: summaryStudySessions.reduce((sum, s) => sum + s.time_spent, 0) / 3600,
        unique_users_period: [...new Set(recentSessions.map(s => s.user_id))].length
      },
      
      summary_type_distribution: getSummaryTypeDistribution(),
      subject_distribution: getSubjectDistribution(),
      difficulty_distribution: getDifficultyDistribution(),
      
      top_summaries: getTopSummaries(10),
      most_active_users: getMostActiveUsers(recentSessions, 10),
      
      daily_activity: getDailyActivity(recentSessions, days)
    };

    res.json({
      success: true,
      data: usageStats
    });
  } catch (error) {
    console.error('Error generating usage report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao gerar relatório de uso' 
    });
  }
});

// GET /api/v1/summaries/reports/performance - Performance report
router.get('/reports/performance', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const completedSessions = summaryStudySessions.filter(s => s.ended_at);

    // Performance metrics
    const performanceStats = {
      overall_metrics: {
        total_summaries: summaries.length,
        published_summaries: summaries.filter(s => s.status === 'published').length,
        total_study_sessions: summaryStudySessions.length,
        completed_sessions: completedSessions.length,
        
        overall_completion_rate: summaryStudySessions.length > 0 
          ? (completedSessions.length / summaryStudySessions.length) * 100 
          : 0,
        
        average_rating: completedSessions.filter(s => s.rating).length > 0
          ? completedSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / 
            completedSessions.filter(s => s.rating).length
          : 0,
        
        average_completion_percentage: completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.completion_percentage, 0) / completedSessions.length
          : 0
      },
      
      content_performance: {
        best_rated_summaries: getBestRatedSummaries(10),
        most_studied_summaries: getMostStudiedSummaries(10),
        highest_completion_summaries: getHighestCompletionSummaries(10)
      },
      
      engagement_analysis: {
        by_subject: getPerformanceBySubject(),
        by_difficulty: getPerformanceByDifficulty(),
        by_type: getPerformanceByType(),
        by_reading_time: getPerformanceByReadingTime()
      },
      
      user_engagement: {
        average_sessions_per_user: getUserEngagementStats(),
        retention_metrics: getRetentionMetrics()
      }
    };

    res.json({
      success: true,
      data: performanceStats
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao gerar relatório de performance' 
    });
  }
});

// GET /api/v1/summaries/analytics/dashboard - Analytics dashboard
router.get('/analytics/dashboard', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSessions30 = summaryStudySessions.filter(s => new Date(s.started_at) >= last30Days);
    const recentSessions7 = summaryStudySessions.filter(s => new Date(s.started_at) >= last7Days);

    const dashboard = {
      overview: {
        total_summaries: summaries.length,
        published_summaries: summaries.filter(s => s.status === 'published').length,
        total_views: summaries.reduce((sum, s) => sum + (s.statistics?.views || 0), 0),
        total_likes: summaries.reduce((sum, s) => sum + (s.statistics?.likes || 0), 0),
        total_study_sessions: summaryStudySessions.length,
        unique_students: [...new Set(summaryStudySessions.map(s => s.user_id))].length
      },
      
      recent_activity: {
        sessions_last_7_days: recentSessions7.length,
        sessions_last_30_days: recentSessions30.length,
        new_summaries_last_7_days: summaries.filter(s => new Date(s.created_at) >= last7Days).length,
        new_summaries_last_30_days: summaries.filter(s => new Date(s.created_at) >= last30Days).length
      },
      
      quick_stats: {
        most_popular_subject: getMostPopularSubject(),
        average_reading_time: summaries.reduce((sum, s) => sum + s.estimated_reading_time, 0) / summaries.length,
        completion_rate: summaryStudySessions.length > 0 
          ? (summaryStudySessions.filter(s => s.ended_at).length / summaryStudySessions.length) * 100 
          : 0,
        average_session_duration: getAverageSessionDuration()
      },
      
      trends: {
        daily_sessions_last_week: getDailySessionsLastWeek(),
        popular_summaries: getTopSummaries(5),
        active_subjects: getActiveSubjects(5)
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error generating analytics dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao gerar dashboard de analytics' 
    });
  }
});

// Helper functions for statistics and analytics
function getSessionsByDay(sessions: SummaryStudySession[]): Record<string, number> {
  const sessionsByDay: Record<string, number> = {};
  
  sessions.forEach(session => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    sessionsByDay[date] = (sessionsByDay[date] || 0) + 1;
  });
  
  return sessionsByDay;
}

function getPeakStudyHours(sessions: SummaryStudySession[]): Record<string, number> {
  const hourCounts: Record<string, number> = {};
  
  sessions.forEach(session => {
    const hour = new Date(session.started_at).getHours();
    const hourKey = `${hour}:00`;
    hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
  });
  
  return hourCounts;
}

function getSummaryTypeDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  summaries.forEach(summary => {
    distribution[summary.summary_type] = (distribution[summary.summary_type] || 0) + 1;
  });
  return distribution;
}

function getSubjectDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  summaries.forEach(summary => {
    distribution[summary.subject] = (distribution[summary.subject] || 0) + 1;
  });
  return distribution;
}

function getDifficultyDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  summaries.forEach(summary => {
    distribution[summary.difficulty] = (distribution[summary.difficulty] || 0) + 1;
  });
  return distribution;
}

function getTopSummaries(limit: number): any[] {
  return summaries
    .filter(s => s.status === 'published')
    .sort((a, b) => {
      const scoreA = (a.statistics?.views || 0) + (a.statistics?.likes || 0) * 2;
      const scoreB = (b.statistics?.views || 0) + (b.statistics?.likes || 0) * 2;
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map(s => ({
      id: s.id,
      title: s.title,
      subject: s.subject,
      views: s.statistics?.views || 0,
      likes: s.statistics?.likes || 0,
      study_sessions: s.statistics?.study_sessions || 0
    }));
}

function getMostActiveUsers(sessions: SummaryStudySession[], limit: number): any[] {
  const userActivity: Record<string, number> = {};
  
  sessions.forEach(session => {
    userActivity[session.user_id] = (userActivity[session.user_id] || 0) + 1;
  });
  
  return Object.entries(userActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([userId, count]) => ({
      user_id: userId,
      session_count: count
    }));
}

function getDailyActivity(sessions: SummaryStudySession[], days: number): any[] {
  const dailyActivity: Record<string, number> = {};
  
  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyActivity[dateKey] = 0;
  }
  
  // Count sessions per day
  sessions.forEach(session => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    if (dailyActivity[date] !== undefined) {
      dailyActivity[date]++;
    }
  });
  
  return Object.entries(dailyActivity)
    .map(([date, count]) => ({ date, sessions: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getBestRatedSummaries(limit: number): any[] {
  return summaries
    .filter(s => s.statistics?.total_ratings && s.statistics.total_ratings > 0)
    .sort((a, b) => (b.statistics?.average_rating || 0) - (a.statistics?.average_rating || 0))
    .slice(0, limit)
    .map(s => ({
      id: s.id,
      title: s.title,
      subject: s.subject,
      average_rating: s.statistics?.average_rating || 0,
      total_ratings: s.statistics?.total_ratings || 0
    }));
}

function getMostStudiedSummaries(limit: number): any[] {
  return summaries
    .sort((a, b) => (b.statistics?.study_sessions || 0) - (a.statistics?.study_sessions || 0))
    .slice(0, limit)
    .map(s => ({
      id: s.id,
      title: s.title,
      subject: s.subject,
      study_sessions: s.statistics?.study_sessions || 0
    }));
}

function getHighestCompletionSummaries(limit: number): any[] {
  const completionRates = summaries.map(summary => {
    const sessions = summaryStudySessions.filter(s => s.summary_id === summary.id);
    const completedSessions = sessions.filter(s => s.ended_at);
    const completionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
    
    return {
      id: summary.id,
      title: summary.title,
      subject: summary.subject,
      completion_rate: completionRate,
      total_sessions: sessions.length
    };
  });
  
  return completionRates
    .filter(s => s.total_sessions >= 5) // Only include summaries with at least 5 sessions
    .sort((a, b) => b.completion_rate - a.completion_rate)
    .slice(0, limit);
}

function getPerformanceBySubject(): any[] {
  const subjectStats: Record<string, { sessions: number; completed: number; totalRating: number; ratingCount: number }> = {};
  
  summaries.forEach(summary => {
    if (!subjectStats[summary.subject]) {
      subjectStats[summary.subject] = { sessions: 0, completed: 0, totalRating: 0, ratingCount: 0 };
    }
    
    const sessions = summaryStudySessions.filter(s => s.summary_id === summary.id);
    const completed = sessions.filter(s => s.ended_at);
    const rated = completed.filter(s => s.rating);
    
    subjectStats[summary.subject].sessions += sessions.length;
    subjectStats[summary.subject].completed += completed.length;
    subjectStats[summary.subject].totalRating += rated.reduce((sum, s) => sum + (s.rating || 0), 0);
    subjectStats[summary.subject].ratingCount += rated.length;
  });
  
  return Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    total_sessions: stats.sessions,
    completed_sessions: stats.completed,
    completion_rate: stats.sessions > 0 ? (stats.completed / stats.sessions) * 100 : 0,
    average_rating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
  }));
}

function getPerformanceByDifficulty(): any[] {
  const difficultyStats: Record<string, { sessions: number; completed: number; totalRating: number; ratingCount: number }> = {};
  
  summaries.forEach(summary => {
    if (!difficultyStats[summary.difficulty]) {
      difficultyStats[summary.difficulty] = { sessions: 0, completed: 0, totalRating: 0, ratingCount: 0 };
    }
    
    const sessions = summaryStudySessions.filter(s => s.summary_id === summary.id);
    const completed = sessions.filter(s => s.ended_at);
    const rated = completed.filter(s => s.rating);
    
    difficultyStats[summary.difficulty].sessions += sessions.length;
    difficultyStats[summary.difficulty].completed += completed.length;
    difficultyStats[summary.difficulty].totalRating += rated.reduce((sum, s) => sum + (s.rating || 0), 0);
    difficultyStats[summary.difficulty].ratingCount += rated.length;
  });
  
  return Object.entries(difficultyStats).map(([difficulty, stats]) => ({
    difficulty,
    total_sessions: stats.sessions,
    completed_sessions: stats.completed,
    completion_rate: stats.sessions > 0 ? (stats.completed / stats.sessions) * 100 : 0,
    average_rating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
  }));
}

function getPerformanceByType(): any[] {
  const typeStats: Record<string, { sessions: number; completed: number; totalRating: number; ratingCount: number }> = {};
  
  summaries.forEach(summary => {
    if (!typeStats[summary.summary_type]) {
      typeStats[summary.summary_type] = { sessions: 0, completed: 0, totalRating: 0, ratingCount: 0 };
    }
    
    const sessions = summaryStudySessions.filter(s => s.summary_id === summary.id);
    const completed = sessions.filter(s => s.ended_at);
    const rated = completed.filter(s => s.rating);
    
    typeStats[summary.summary_type].sessions += sessions.length;
    typeStats[summary.summary_type].completed += completed.length;
    typeStats[summary.summary_type].totalRating += rated.reduce((sum, s) => sum + (s.rating || 0), 0);
    typeStats[summary.summary_type].ratingCount += rated.length;
  });
  
  return Object.entries(typeStats).map(([type, stats]) => ({
    type,
    total_sessions: stats.sessions,
    completed_sessions: stats.completed,
    completion_rate: stats.sessions > 0 ? (stats.completed / stats.sessions) * 100 : 0,
    average_rating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
  }));
}

function getPerformanceByReadingTime(): any[] {
  const timeRanges = [
    { min: 0, max: 5, label: '0-5 min' },
    { min: 6, max: 10, label: '6-10 min' },
    { min: 11, max: 20, label: '11-20 min' },
    { min: 21, max: 30, label: '21-30 min' },
    { min: 31, max: Infinity, label: '30+ min' }
  ];
  
  return timeRanges.map(range => {
    const rangeSummaries = summaries.filter(s => 
      s.estimated_reading_time >= range.min && s.estimated_reading_time <= range.max
    );
    
    const sessions = summaryStudySessions.filter(s => 
      rangeSummaries.some(summary => summary.id === s.summary_id)
    );
    
    const completed = sessions.filter(s => s.ended_at);
    const rated = completed.filter(s => s.rating);
    
    return {
      reading_time_range: range.label,
      summary_count: rangeSummaries.length,
      total_sessions: sessions.length,
      completed_sessions: completed.length,
      completion_rate: sessions.length > 0 ? (completed.length / sessions.length) * 100 : 0,
      average_rating: rated.length > 0 ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length : 0
    };
  });
}

function getUserEngagementStats(): any {
  const userSessions: Record<string, number> = {};
  
  summaryStudySessions.forEach(session => {
    userSessions[session.user_id] = (userSessions[session.user_id] || 0) + 1;
  });
  
  const sessionCounts = Object.values(userSessions);
  const totalUsers = sessionCounts.length;
  
  return {
    total_active_users: totalUsers,
    average_sessions_per_user: totalUsers > 0 ? sessionCounts.reduce((sum, count) => sum + count, 0) / totalUsers : 0,
    users_with_1_session: sessionCounts.filter(count => count === 1).length,
    users_with_2_5_sessions: sessionCounts.filter(count => count >= 2 && count <= 5).length,
    users_with_6_plus_sessions: sessionCounts.filter(count => count > 5).length
  };
}

function getRetentionMetrics(): any {
  const now = new Date();
  const userFirstSessions: Record<string, Date> = {};
  const userLastSessions: Record<string, Date> = {};
  
  summaryStudySessions.forEach(session => {
    const sessionDate = new Date(session.started_at);
    
    if (!userFirstSessions[session.user_id] || sessionDate < userFirstSessions[session.user_id]) {
      userFirstSessions[session.user_id] = sessionDate;
    }
    
    if (!userLastSessions[session.user_id] || sessionDate > userLastSessions[session.user_id]) {
      userLastSessions[session.user_id] = sessionDate;
    }
  });
  
  const userIds = Object.keys(userFirstSessions);
  const totalUsers = userIds.length;
  
  // Users active in last 7, 30 days
  const activeLastWeek = userIds.filter(userId => {
    const daysSince = (now.getTime() - userLastSessions[userId].getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;
  
  const activeLastMonth = userIds.filter(userId => {
    const daysSince = (now.getTime() - userLastSessions[userId].getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  }).length;
  
  return {
    total_users: totalUsers,
    active_last_7_days: activeLastWeek,
    active_last_30_days: activeLastMonth,
    retention_7_days: totalUsers > 0 ? (activeLastWeek / totalUsers) * 100 : 0,
    retention_30_days: totalUsers > 0 ? (activeLastMonth / totalUsers) * 100 : 0
  };
}

function getMostPopularSubject(): string {
  const subjectViews: Record<string, number> = {};
  
  summaries.forEach(summary => {
    subjectViews[summary.subject] = (subjectViews[summary.subject] || 0) + (summary.statistics?.views || 0);
  });
  
  return Object.entries(subjectViews).reduce((a, b) => a[1] > b[1] ? a : b)[0] || '';
}

function getAverageSessionDuration(): number {
  const completedSessions = summaryStudySessions.filter(s => s.ended_at);
  
  if (completedSessions.length === 0) return 0;
  
  const totalDuration = completedSessions.reduce((sum, session) => sum + session.time_spent, 0);
  return totalDuration / completedSessions.length / 60; // in minutes
}

function getDailySessionsLastWeek(): any[] {
  const result = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const sessionsCount = summaryStudySessions.filter(s => 
      s.started_at.startsWith(dateStr)
    ).length;
    
    result.push({
      date: dateStr,
      sessions: sessionsCount,
      day_name: date.toLocaleDateString('pt-BR', { weekday: 'short' })
    });
  }
  
  return result;
}

function getActiveSubjects(limit: number): any[] {
  const subjectActivity: Record<string, number> = {};
  
  summaries.forEach(summary => {
    const sessions = summaryStudySessions.filter(s => s.summary_id === summary.id);
    subjectActivity[summary.subject] = (subjectActivity[summary.subject] || 0) + sessions.length;
  });
  
  return Object.entries(subjectActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([subject, sessions]) => ({
      subject,
      total_sessions: sessions,
      summary_count: summaries.filter(s => s.subject === subject).length
    }));
}

// MOVIDO PARA ANTES DE /:id
// GET /api/v1/summaries/search - Search summaries
/*
router.get('/search', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const query = (req.query.q || req.query.query || '').toString().toLowerCase();
    const subject = req.query.subject as string;
    const topic = req.query.topic as string;
    const tags = req.query.tags as string;
    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const summaries = loadSummaries();
    
    // Filter summaries based on search criteria
    let filteredSummaries = summaries.filter(summary => {
      const matchesQuery = !query || 
        summary.title.toLowerCase().includes(query) ||
        summary.content.toLowerCase().includes(query) ||
        summary.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesSubject = !subject || summary.subject === subject;
      const matchesTopic = !topic || summary.topic === topic;
      const matchesType = !type || summary.summary_type === type;
      const matchesDifficulty = !difficulty || summary.difficulty === difficulty;
      
      const matchesTags = !tags || 
        tags.split(',').some(tag => 
          summary.tags.some(summaryTag => 
            summaryTag.toLowerCase().includes(tag.trim().toLowerCase())
          )
        );
      
      return matchesQuery && matchesSubject && matchesTopic && 
             matchesType && matchesDifficulty && matchesTags;
    });

    // Sort by relevance (title matches first, then content matches)
    if (query) {
      filteredSummaries.sort((a, b) => {
        const aInTitle = a.title.toLowerCase().includes(query);
        const bInTitle = b.title.toLowerCase().includes(query);
        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        return 0;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = filteredSummaries.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedSummaries,
      pagination: {
        page,
        limit,
        total: filteredSummaries.length,
        pages: Math.ceil(filteredSummaries.length / limit)
      }
    });
  } catch (error) {
    console.error('Error searching summaries:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar resumos'
    });
  }
});

// GET /api/v1/summaries/subjects - Get unique subjects from summaries
router.get('/subjects', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const summaries = loadSummaries();
    
    // Get unique subjects with counts
    const subjectMap = new Map<string, number>();
    summaries.forEach(summary => {
      const count = subjectMap.get(summary.subject) || 0;
      subjectMap.set(summary.subject, count + 1);
    });

    // Convert to array and sort by count (most summaries first)
    const subjects = Array.from(subjectMap.entries())
      .map(([subject, count]) => ({
        subject,
        count,
        topics: getTopicsForSubject(summaries, subject)
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: subjects,
      total: subjects.length
    });
  } catch (error) {
    console.error('Error getting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar matérias'
    });
  }
});

// Helper function to get topics for a subject
function getTopicsForSubject(summaries: any[], subject: string): string[] {
  const topics = new Set<string>();
  summaries
    .filter(s => s.subject === subject && s.topic)
    .forEach(s => topics.add(s.topic));
  return Array.from(topics);
}
*/

export default router;