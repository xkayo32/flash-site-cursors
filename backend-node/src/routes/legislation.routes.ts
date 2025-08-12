import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Data file paths - try data directory first, fallback to project root
const getDataPath = (filename: string) => {
  const dataPath = path.join(__dirname, '../../data', filename);
  const rootPath = path.join(__dirname, '../../', filename);
  return fs.existsSync(dataPath) ? dataPath : rootPath;
};

const legislationPath = getDataPath('legislation.json');
const legislationBookmarksPath = getDataPath('legislation-bookmarks.json');
const legislationStatisticsPath = getDataPath('legislation-statistics.json');

// Ensure data directory exists
const dataDir = path.dirname(legislationPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
export type LegislationType = 'constitution' | 'law' | 'decree' | 'ordinance' | 'normative' | 'resolution';
export type LegislationStatus = 'active' | 'revoked' | 'superseded';

export interface LegislationDocument {
  id: string;
  title: string;
  type: LegislationType;
  number?: string; // Lei 12.965/14
  year: number;
  subject_area: string; // 'Direito Penal', 'Direito Civil', etc.
  description: string;
  full_text: string; // Texto completo da lei
  articles: LegislationArticle[];
  keywords: string[];
  related_laws?: string[]; // IDs de outras leis relacionadas
  status: LegislationStatus;
  publication_date: string;
  effective_date?: string;
  revocation_date?: string;
  source_url?: string;
  summary?: string; // Resumo executivo
  key_changes?: string[]; // Principais mudanças se for atualização
  affected_groups?: string[]; // Quem é afetado pela lei
  penalties?: string[]; // Penalidades previstas
  statistics?: {
    views: number;
    searches: number;
    bookmarks: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LegislationArticle {
  id: string;
  number: string; // "Art. 1º", "Art. 2º"
  title?: string;
  content: string;
  paragraphs?: {
    id: string;
    number: string; // "§1º", "§2º"
    content: string;
    items?: {
      id: string;
      number: string; // "I", "II", "III"
      content: string;
      subitems?: {
        id: string;
        number: string; // "a)", "b)", "c)"
        content: string;
      }[];
    }[];
  }[];
  comments?: string; // Comentários explicativos
  jurisprudence?: string[]; // Jurisprudência relacionada
}

export interface LegislationBookmark {
  id: string;
  user_id: string;
  legislation_id: string;
  article_id?: string;
  notes?: string;
  created_at: string;
}

export interface LegislationStatistic {
  legislation_id: string;
  article_id?: string;
  action: 'view' | 'search' | 'bookmark';
  user_id?: string;
  timestamp: string;
  metadata?: {
    search_term?: string;
    session_duration?: number;
  };
}

// Utility functions
const readJSONFile = <T>(filePath: string, defaultValue: T): T => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
};

const writeJSONFile = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw new Error('Failed to save data');
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const logStatistic = (action: string, legislationId: string, userId?: string, articleId?: string, metadata?: any): void => {
  try {
    const statistics = readJSONFile<LegislationStatistic[]>(legislationStatisticsPath, []);
    const statistic: LegislationStatistic = {
      legislation_id: legislationId,
      article_id: articleId,
      action: action as 'view' | 'search' | 'bookmark',
      user_id: userId,
      timestamp: new Date().toISOString(),
      metadata
    };
    statistics.push(statistic);
    writeJSONFile(legislationStatisticsPath, statistics);
  } catch (error) {
    console.error('Error logging statistic:', error);
  }
};

const updateLegislationStatistics = (legislationId: string, action: 'view' | 'search' | 'bookmark'): void => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const index = legislation.findIndex(l => l.id === legislationId);
    if (index !== -1) {
      if (!legislation[index].statistics) {
        legislation[index].statistics = { views: 0, searches: 0, bookmarks: 0 };
      }
      legislation[index].statistics[action === 'view' ? 'views' : action === 'search' ? 'searches' : 'bookmarks']++;
      legislation[index].updated_at = new Date().toISOString();
      writeJSONFile(legislationPath, legislation);
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
};

// Routes - IMPORTANT: Specific routes MUST come before parameterized routes

// GET /api/v1/legislation/search - Full-text search
router.get('/search', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const { q, limit = '20', type, subject_area } = req.query as any;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const searchTerm = q.toLowerCase();
    let results = legislation.filter(l => {
      const matchesText = 
        l.title.toLowerCase().includes(searchTerm) ||
        l.description.toLowerCase().includes(searchTerm) ||
        l.full_text.toLowerCase().includes(searchTerm) ||
        l.summary?.toLowerCase().includes(searchTerm) ||
        l.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
        l.number?.toLowerCase().includes(searchTerm) ||
        l.articles.some(a => 
          a.content.toLowerCase().includes(searchTerm) ||
          a.title?.toLowerCase().includes(searchTerm)
        );

      // Apply additional filters
      if (type && l.type !== type) return false;
      if (subject_area && !l.subject_area.toLowerCase().includes(subject_area.toLowerCase())) return false;

      return matchesText;
    });

    // Log search statistics for each result
    results.forEach(r => {
      logStatistic('search', r.id, undefined, undefined, { search_term: searchTerm });
      updateLegislationStatistics(r.id, 'search');
    });

    // Limit results
    results = results.slice(0, parseInt(limit));

    res.json({
      query: q,
      total: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching legislation:', error);
    res.status(500).json({ error: 'Failed to search legislation' });
  }
});

// GET /api/v1/legislation/types - List legislation types
router.get('/types', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const types = [...new Set(legislation.map(l => l.type))];
    
    const typesWithCount = types.map(type => ({
      type,
      count: legislation.filter(l => l.type === type).length
    }));

    res.json(typesWithCount);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// GET /api/v1/legislation/subjects - List subject areas
router.get('/subjects', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const subjects = [...new Set(legislation.map(l => l.subject_area))];
    
    const subjectsWithCount = subjects.map(subject => ({
      subject,
      count: legislation.filter(l => l.subject_area === subject).length
    }));

    res.json(subjectsWithCount);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/v1/legislation/bookmarks - Get user bookmarks
router.get('/bookmarks', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = readJSONFile<LegislationBookmark[]>(legislationBookmarksPath, []);
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    
    const userBookmarks = bookmarks.filter(b => b.user_id === req.user!.id);
    
    const bookmarksWithLegislation = userBookmarks.map(bookmark => {
      const legislationDoc = legislation.find(l => l.id === bookmark.legislation_id);
      return {
        ...bookmark,
        legislation: legislationDoc ? {
          id: legislationDoc.id,
          title: legislationDoc.title,
          type: legislationDoc.type,
          number: legislationDoc.number,
          year: legislationDoc.year,
          subject_area: legislationDoc.subject_area
        } : null
      };
    });

    res.json(bookmarksWithLegislation);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// GET /api/v1/legislation/recent - Recent legislation
router.get('/recent', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const { limit = '10' } = req.query as any;
    
    const recent = legislation
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, parseInt(limit));

    res.json(recent);
  } catch (error) {
    console.error('Error fetching recent legislation:', error);
    res.status(500).json({ error: 'Failed to fetch recent legislation' });
  }
});

// GET /api/v1/legislation/popular - Most popular legislation
router.get('/popular', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const { limit = '10' } = req.query as any;
    
    const popular = legislation
      .filter(l => l.statistics && l.statistics.views > 0)
      .sort((a, b) => (b.statistics?.views || 0) - (a.statistics?.views || 0))
      .slice(0, parseInt(limit));

    res.json(popular);
  } catch (error) {
    console.error('Error fetching popular legislation:', error);
    res.status(500).json({ error: 'Failed to fetch popular legislation' });
  }
});

// GET /api/v1/legislation/statistics/overview - Statistics overview (admin only)
router.get('/statistics/overview', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const statistics = readJSONFile<LegislationStatistic[]>(legislationStatisticsPath, []);
    
    // Only admins can see full statistics
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalLegislation = legislation.length;
    const totalViews = legislation.reduce((sum, l) => sum + (l.statistics?.views || 0), 0);
    const totalBookmarks = legislation.reduce((sum, l) => sum + (l.statistics?.bookmarks || 0), 0);
    const totalSearches = legislation.reduce((sum, l) => sum + (l.statistics?.searches || 0), 0);

    const byType = legislation.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySubject = legislation.reduce((acc, l) => {
      acc[l.subject_area] = (acc[l.subject_area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = statistics
      .filter(s => new Date(s.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .length;

    res.json({
      totals: {
        legislation: totalLegislation,
        views: totalViews,
        bookmarks: totalBookmarks,
        searches: totalSearches
      },
      by_type: byType,
      by_subject: bySubject,
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/v1/legislation - List legislation with filters
router.get('/', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    
    const {
      type,
      subject_area,
      status,
      year,
      keyword,
      limit = '50',
      offset = '0',
      sort = 'created_at',
      order = 'desc'
    } = req.query as any;

    let filtered = [...legislation];

    // Apply filters
    if (type) {
      filtered = filtered.filter(l => l.type === type);
    }
    if (subject_area) {
      filtered = filtered.filter(l => l.subject_area.toLowerCase().includes(subject_area.toLowerCase()));
    }
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (year) {
      filtered = filtered.filter(l => l.year === parseInt(year));
    }
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchTerm) ||
        l.description.toLowerCase().includes(searchTerm) ||
        l.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
        l.number?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = (a as any)[sort] || '';
      const bValue = (b as any)[sort] || '';
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const total = filtered.length;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      legislation: paginated,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < total
      }
    });
  } catch (error) {
    console.error('Error fetching legislation:', error);
    res.status(500).json({ error: 'Failed to fetch legislation' });
  }
});

// POST /api/v1/legislation - Create legislation document
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    
    const newLegislation: LegislationDocument = {
      id: generateId(),
      ...req.body,
      statistics: { views: 0, searches: 0, bookmarks: 0 },
      created_by: req.user!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate required fields
    if (!newLegislation.title || !newLegislation.type || !newLegislation.subject_area) {
      return res.status(400).json({ error: 'Missing required fields: title, type, subject_area' });
    }

    legislation.push(newLegislation);
    writeJSONFile(legislationPath, legislation);

    res.status(201).json(newLegislation);
  } catch (error) {
    console.error('Error creating legislation:', error);
    res.status(500).json({ error: 'Failed to create legislation' });
  }
});

// GET /api/v1/legislation/:id - Get specific legislation
router.get('/:id', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const document = legislation.find(l => l.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    // Log view statistic
    logStatistic('view', document.id);
    updateLegislationStatistics(document.id, 'view');

    res.json(document);
  } catch (error) {
    console.error('Error fetching legislation:', error);
    res.status(500).json({ error: 'Failed to fetch legislation' });
  }
});

// PUT /api/v1/legislation/:id - Update legislation
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const index = legislation.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    // Check if user can edit (creator or admin)
    if (legislation[index].created_by !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this legislation' });
    }

    const updatedLegislation = {
      ...legislation[index],
      ...req.body,
      id: req.params.id, // Preserve ID
      created_by: legislation[index].created_by, // Preserve creator
      created_at: legislation[index].created_at, // Preserve creation date
      updated_at: new Date().toISOString()
    };

    legislation[index] = updatedLegislation;
    writeJSONFile(legislationPath, legislation);

    res.json(updatedLegislation);
  } catch (error) {
    console.error('Error updating legislation:', error);
    res.status(500).json({ error: 'Failed to update legislation' });
  }
});

// DELETE /api/v1/legislation/:id - Delete legislation
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const index = legislation.findIndex(l => l.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    // Check if user can delete (creator or admin)
    if (legislation[index].created_by !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this legislation' });
    }

    legislation.splice(index, 1);
    writeJSONFile(legislationPath, legislation);

    res.json({ message: 'Legislation deleted successfully' });
  } catch (error) {
    console.error('Error deleting legislation:', error);
    res.status(500).json({ error: 'Failed to delete legislation' });
  }
});

// GET /api/v1/legislation/:id/articles - Get specific articles
router.get('/:id/articles', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const document = legislation.find(l => l.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    const { article_number } = req.query as any;
    
    let articles = document.articles;
    if (article_number) {
      articles = articles.filter(a => a.number.toLowerCase().includes(article_number.toLowerCase()));
    }

    res.json({
      legislation_id: document.id,
      legislation_title: document.title,
      articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST /api/v1/legislation/:id/bookmark - Bookmark legislation
router.post('/:id/bookmark', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = readJSONFile<LegislationBookmark[]>(legislationBookmarksPath, []);
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    
    const document = legislation.find(l => l.id === req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    // Check if already bookmarked
    const existingBookmark = bookmarks.find(b => 
      b.legislation_id === req.params.id && b.user_id === req.user!.id
    );

    if (existingBookmark) {
      return res.status(400).json({ error: 'Already bookmarked' });
    }

    const newBookmark: LegislationBookmark = {
      id: generateId(),
      user_id: req.user!.id,
      legislation_id: req.params.id,
      article_id: req.body.article_id,
      notes: req.body.notes,
      created_at: new Date().toISOString()
    };

    bookmarks.push(newBookmark);
    writeJSONFile(legislationBookmarksPath, bookmarks);

    // Update statistics
    logStatistic('bookmark', req.params.id, req.user!.id);
    updateLegislationStatistics(req.params.id, 'bookmark');

    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// DELETE /api/v1/legislation/:id/bookmark - Remove bookmark
router.delete('/:id/bookmark', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = readJSONFile<LegislationBookmark[]>(legislationBookmarksPath, []);
    
    const index = bookmarks.findIndex(b => 
      b.legislation_id === req.params.id && b.user_id === req.user!.id
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    bookmarks.splice(index, 1);
    writeJSONFile(legislationBookmarksPath, bookmarks);

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// GET /api/v1/legislation/:id/related - Related legislation
router.get('/:id/related', (req, res: Response) => {
  try {
    const legislation = readJSONFile<LegislationDocument[]>(legislationPath, []);
    const document = legislation.find(l => l.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Legislation not found' });
    }

    let related: LegislationDocument[] = [];

    // Add explicitly related laws
    if (document.related_laws) {
      related = legislation.filter(l => document.related_laws!.includes(l.id));
    }

    // Add laws from same subject area (if we need more)
    if (related.length < 5) {
      const sameSubject = legislation.filter(l => 
        l.id !== document.id && 
        l.subject_area === document.subject_area &&
        !related.some(r => r.id === l.id)
      ).slice(0, 5 - related.length);
      
      related = [...related, ...sameSubject];
    }

    // Add laws with similar keywords (if we need more)
    if (related.length < 5) {
      const similarKeywords = legislation.filter(l => 
        l.id !== document.id &&
        !related.some(r => r.id === l.id) &&
        l.keywords.some(k => document.keywords.includes(k))
      ).slice(0, 5 - related.length);
      
      related = [...related, ...similarKeywords];
    }

    res.json(related);
  } catch (error) {
    console.error('Error fetching related legislation:', error);
    res.status(500).json({ error: 'Failed to fetch related legislation' });
  }
});

export default router;