import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Data paths
const usersPath = path.join(__dirname, '../../data/users.json');
const categoriesPath = path.join(__dirname, '../../data/categories.json');
const settingsPath = path.join(__dirname, '../../data/settings.json');

// Load data helper
function loadData(filePath: string, defaultValue: any = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return defaultValue;
}

// Get dashboard statistics
router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas administradores' 
      });
      return;
    }

    // Load all data
    const users = loadData(usersPath, []);
    const categories = loadData(categoriesPath, []);
    
    // Calculate user statistics
    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.status === 'active').length;
    const suspendedUsers = users.filter((u: any) => u.status === 'suspended').length;
    const newUsersThisMonth = users.filter((u: any) => {
      const createdAt = new Date(u.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear();
    }).length;

    // Calculate subscription statistics
    const subscriptions = users.reduce((acc: any, user: any) => {
      if (user.subscription?.plan) {
        acc[user.subscription.plan] = (acc[user.subscription.plan] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate content statistics from categories
    const contentStats = categories.reduce((acc: any, category: any) => {
      acc.questions += category.contentCount?.questions || 0;
      acc.flashcards += category.contentCount?.flashcards || 0;
      acc.summaries += category.contentCount?.summaries || 0;
      acc.courses += category.contentCount?.courses || 0;
      
      // Include nested categories
      if (category.children) {
        category.children.forEach((child: any) => {
          acc.questions += child.contentCount?.questions || 0;
          acc.flashcards += child.contentCount?.flashcards || 0;
          acc.summaries += child.contentCount?.summaries || 0;
          acc.courses += child.contentCount?.courses || 0;
          
          // Include deeply nested categories
          if (child.children) {
            child.children.forEach((grandchild: any) => {
              acc.questions += grandchild.contentCount?.questions || 0;
              acc.flashcards += grandchild.contentCount?.flashcards || 0;
              acc.summaries += grandchild.contentCount?.summaries || 0;
              acc.courses += grandchild.contentCount?.courses || 0;
            });
          }
        });
      }
      
      return acc;
    }, { questions: 0, flashcards: 0, summaries: 0, courses: 0 });

    // Calculate revenue (mock data for now)
    const monthlyRevenue = users.reduce((total: number, user: any) => {
      if (user.subscription?.status === 'active') {
        // Mock pricing based on plan
        const pricing: any = {
          'COMANDO SUPREMO': 297,
          'ELITE': 197,
          'ESPECIALISTA': 147,
          'RECRUTA': 97
        };
        return total + (pricing[user.subscription.plan] || 0);
      }
      return total;
    }, 0);

    // Calculate growth percentages (mock for now)
    const lastMonthUsers = Math.floor(totalUsers * 0.88); // Mock 12% growth
    const userGrowth = totalUsers > 0 ? 
      ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : 0;

    const lastMonthRevenue = monthlyRevenue * 0.92; // Mock 8% growth
    const revenueGrowth = monthlyRevenue > 0 ?
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          newThisMonth: newUsersThisMonth,
          growth: `+${userGrowth}%`
        },
        subscriptions,
        content: {
          questions: contentStats.questions,
          flashcards: contentStats.flashcards,
          summaries: contentStats.summaries,
          courses: contentStats.courses,
          total: contentStats.questions + contentStats.flashcards + 
                 contentStats.summaries + contentStats.courses
        },
        revenue: {
          monthly: monthlyRevenue,
          growth: `+${revenueGrowth}%`,
          currency: 'BRL'
        },
        categories: {
          total: categories.length,
          subjects: categories.filter((c: any) => c.type === 'subject').length,
          examBoards: categories.filter((c: any) => c.type === 'exam_board').length,
          years: categories.filter((c: any) => c.type === 'year').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

// Get recent activities
router.get('/activities', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    const users = loadData(usersPath, []);
    
    // Get recent users (last 5)
    const recentUsers = users
      .sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.subscription?.plan || 'Sem plano',
        status: user.status,
        joinDate: user.createdAt,
        lastActivity: user.lastLogin || user.createdAt
      }));

    // Mock recent content (for now)
    const recentContent = [
      {
        id: 1,
        title: 'Direito Constitucional - Módulo Avançado',
        type: 'course',
        author: 'Admin',
        status: 'published',
        updatedAt: new Date().toISOString(),
        views: 1245
      },
      {
        id: 2,
        title: 'Questões de Português - Banca FCC',
        type: 'questions',
        author: 'Prof. Silva',
        status: 'published',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        views: 892
      },
      {
        id: 3,
        title: 'Flashcards - Direito Administrativo',
        type: 'flashcards',
        author: 'Prof. Costa',
        status: 'draft',
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        views: 456
      }
    ];

    // System alerts (mock)
    const systemAlerts = [
      {
        id: 1,
        type: 'success',
        message: 'Sistema atualizado com sucesso para versão 2.0',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'warning',
        message: '3 usuários com pagamento pendente',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'info',
        message: 'Backup automático agendado para 00:00',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        recentUsers,
        recentContent,
        systemAlerts
      }
    });
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar atividades recentes' 
    });
  }
});

// Get performance metrics
router.get('/performance', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado' 
      });
      return;
    }

    // Mock performance data for charts
    const dailyRegistrations = [
      { date: '2025-08-05', count: 12 },
      { date: '2025-08-06', count: 18 },
      { date: '2025-08-07', count: 15 },
      { date: '2025-08-08', count: 22 },
      { date: '2025-08-09', count: 28 },
      { date: '2025-08-10', count: 25 },
      { date: '2025-08-11', count: 31 }
    ];

    const contentEngagement = {
      questions: { attempts: 15890, correctRate: 67.8 },
      flashcards: { reviews: 8932, retentionRate: 82.3 },
      courses: { completions: 234, averageProgress: 72.5 }
    };

    const topCategories = [
      { name: 'Direito', students: 892, growth: '+12%' },
      { name: 'Matemática', students: 654, growth: '+8%' },
      { name: 'Português', students: 587, growth: '+15%' },
      { name: 'Informática', students: 423, growth: '+5%' }
    ];

    res.json({
      success: true,
      data: {
        dailyRegistrations,
        contentEngagement,
        topCategories
      }
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar métricas de performance' 
    });
  }
});

export default router;