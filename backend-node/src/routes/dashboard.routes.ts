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

    // Load real data
    const users = loadData(usersPath, []);
    const questionsPath = path.join(__dirname, '../../data/questions.json');
    const flashcardsPath = path.join(__dirname, '../../data/flashcards.json');
    const coursesPath = path.join(__dirname, '../../data/courses.json');
    const examAttemptsPath = path.join(__dirname, '../../data/exam-attempts.json');
    
    const questions = loadData(questionsPath, []);
    const flashcards = loadData(flashcardsPath, []);
    const courses = loadData(coursesPath, []);
    const examAttempts = loadData(examAttemptsPath, []);

    // Calculate real daily registrations (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyRegistrations = last7Days.map(date => {
      const count = users.filter((user: any) => {
        const userDate = new Date(user.createdAt).toISOString().split('T')[0];
        return userDate === date;
      }).length;
      return { date, count };
    });

    // Calculate real content engagement
    const totalQuestionAttempts = examAttempts.reduce((total: number, attempt: any) => {
      return total + (attempt.answers?.length || 0);
    }, 0);

    const correctAnswers = examAttempts.reduce((total: number, attempt: any) => {
      if (!attempt.answers || !Array.isArray(attempt.answers)) return total;
      return total + attempt.answers.filter((answer: any) => answer.isCorrect).length;
    }, 0);

    const correctRate = totalQuestionAttempts > 0 ? 
      Math.round((correctAnswers / totalQuestionAttempts) * 100) : 0;

    const totalFlashcardReviews = flashcards.reduce((total: number, card: any) => {
      return total + (card.reviews || 0);
    }, 0);

    const flashcardRetention = flashcards.length > 0 ? 
      Math.round(flashcards.reduce((avg: number, card: any) => {
        const rate = card.reviews > 0 ? (card.correctCount || 0) / card.reviews * 100 : 0;
        return avg + rate;
      }, 0) / flashcards.length) : 0;

    const courseCompletions = users.reduce((total: number, user: any) => {
      return total + (user.completedCourses?.length || 0);
    }, 0);

    const averageProgress = users.length > 0 ? 
      Math.round(users.reduce((avg: number, user: any) => {
        const progress = user.courseProgress ? 
          Object.values(user.courseProgress).reduce((sum: number, p: any) => sum + (p || 0), 0) / 
          Object.keys(user.courseProgress).length : 0;
        return avg + progress;
      }, 0) / users.length) : 0;

    const contentEngagement = {
      questions: { 
        attempts: totalQuestionAttempts, 
        correctRate: correctRate 
      },
      flashcards: { 
        reviews: totalFlashcardReviews, 
        retentionRate: flashcardRetention 
      },
      courses: { 
        completions: courseCompletions, 
        averageProgress: averageProgress 
      }
    };

    // Calculate real top categories based on user engagement
    const categoryStats: any = {};
    
    // Count users by categories they're studying
    users.forEach((user: any) => {
      if (user.subscribedCategories) {
        user.subscribedCategories.forEach((category: string) => {
          if (!categoryStats[category]) {
            categoryStats[category] = { students: 0, lastWeek: 0 };
          }
          categoryStats[category].students++;
          
          // Check if user was active in last week
          const lastActivity = new Date(user.lastLogin || user.createdAt);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          if (lastActivity > oneWeekAgo) {
            categoryStats[category].lastWeek++;
          }
        });
      }
    });

    // Calculate growth and sort by popularity
    const topCategories = Object.entries(categoryStats)
      .map(([name, stats]: [string, any]) => {
        const growth = stats.students > 0 ? 
          Math.round((stats.lastWeek / stats.students) * 100) : 0;
        return {
          name: name.toUpperCase(),
          students: stats.students,
          growth: `+${growth}%`
        };
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    // Add default categories if no data
    if (topCategories.length === 0) {
      const categories = loadData(categoriesPath, []);
      const defaultCategories = categories.slice(0, 4).map((cat: any, index: number) => ({
        name: cat.name?.toUpperCase() || `CATEGORIA ${index + 1}`,
        students: Math.floor(Math.random() * 100) + 50,
        growth: `+${Math.floor(Math.random() * 20) + 5}%`
      }));
      topCategories.push(...defaultCategories);
    }

    res.json({
      success: true,
      data: {
        dailyRegistrations,
        contentEngagement,
        topCategories: topCategories.slice(0, 4)
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

// Get student dashboard
router.get('/student', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if user is student or admin
    if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
      res.status(403).json({ 
        success: false,
        message: 'Acesso negado - apenas estudantes e administradores' 
      });
      return;
    }

    // Load data files
    const usersPath = path.join(__dirname, '../../data/users.json');
    const coursesPath = path.join(__dirname, '../../data/courses.json');
    const questionsPath = path.join(__dirname, '../../data/questions.json');
    const flashcardsPath = path.join(__dirname, '../../data/flashcards.json');
    const examAttemptsPath = path.join(__dirname, '../../data/exam-attempts.json');

    const users = loadData(usersPath, []);
    const courses = loadData(coursesPath, []);
    const questions = loadData(questionsPath, []);
    const flashcards = loadData(flashcardsPath, []);
    const examAttempts = loadData(examAttemptsPath, []);

    // Get current user data
    const currentUser = users.find((u: any) => u.id === req.user?.id);
    
    if (!currentUser) {
      res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
      return;
    }

    // Calculate user statistics
    const userQuestions = questions.filter((q: any) => 
      q.userId === currentUser.id || q.answeredBy?.includes(currentUser.id)
    );
    const userFlashcards = flashcards.filter((f: any) => 
      f.userId === currentUser.id || f.studiedBy?.includes(currentUser.id)
    );
    const userExamAttempts = examAttempts.filter((e: any) => e.userId === currentUser.id);

    // Calculate stats
    const questionsAnswered = userQuestions.length;
    const correctAnswers = userQuestions.filter((q: any) => q.correct === true).length;
    const accuracyRate = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    const flashcardsReviewed = userFlashcards.reduce((total: number, f: any) => total + (f.reviews || 0), 0);

    // Calculate study streak based on user login activity
    const today = new Date();
    const lastLogin = new Date(currentUser.lastLogin || currentUser.createdAt);
    const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    const studyStreak = Math.max(1, Math.min(daysDiff, 30)); // Max 30 days, min 1

    // Get enrolled courses
    const enrolledCourses = courses.filter((c: any) => 
      c.enrolledStudents?.includes(currentUser.id) || c.createdBy === currentUser.id
    ).map((course: any) => ({
      id: course.id,
      name: course.name,
      category: course.category || 'Geral',
      progress: Math.min(100, Math.round((userQuestions.filter(q => q.courseId === course.id).length / Math.max(1, course.totalLessons || 10)) * 100)), // Real progress based on completed questions
      totalQuestions: questions.filter((q: any) => q.courseId === course.id).length,
      totalFlashcards: flashcards.filter((f: any) => f.courseId === course.id).length,
      enrolledAt: course.createdAt || new Date().toISOString(),
      thumbnail: course.thumbnail || null
    }));

    // Recent activities based on real data - mais detalhadas
    const recentActivities = [];
    
    // Add recent question activities
    const recentQuestions = userQuestions
      .sort((a, b) => new Date(b.createdAt || b.answeredAt || '').getTime() - new Date(a.createdAt || a.answeredAt || '').getTime())
      .slice(0, 3);
    
    recentQuestions.forEach((q, index) => {
      const courseName = courses.find(c => c.id === q.courseId)?.name || 'Questão Avulsa';
      recentActivities.push({
        id: `q-${q.id || index}`,
        type: 'question',
        title: `${q.correct ? 'ACERTOU' : 'ERROU'}: ${courseName}`,
        description: q.subject || 'Exercício Tático',
        timestamp: q.createdAt || q.answeredAt || new Date().toISOString(),
        score: q.correct ? 100 : 0,
        icon: 'crosshair',
        success: q.correct,
        details: `${q.subject || 'Geral'} - ${q.difficulty || 'Médio'}`
      });
    });
    
    // Add recent flashcard activities  
    const recentFlashcards = userFlashcards
      .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime())
      .slice(0, 2);
    
    recentFlashcards.forEach((f, index) => {
      const accuracy = Math.round(((f.correctCount || 0) / Math.max(1, f.reviews || 1)) * 100);
      recentActivities.push({
        id: `f-${f.id || index}`,
        type: 'flashcard',
        title: `REVIOU FLASHCARD: ${accuracy}% precisão`,
        description: f.category || 'Cartão Tático',
        timestamp: f.updatedAt || new Date().toISOString(),
        score: accuracy,
        icon: 'brain',
        success: accuracy >= 75,
        details: `${f.reviews || 1} revisões - ${f.category || 'Geral'}`
      });
    });
    
    // Add course access activities
    enrolledCourses.slice(0, 1).forEach((course, index) => {
      recentActivities.push({
        id: `c-${course.id}`,
        type: 'course',
        title: `ACESSOU CURSO: ${course.name}`,
        description: `${Math.round(course.progress)}% concluído`,
        timestamp: course.enrolledAt || new Date().toISOString(),
        score: course.progress,
        icon: 'book',
        success: course.progress > 0,
        details: `${course.category} - ${course.totalQuestions} questões`
      });
    });
    
    // Sort by timestamp and limit to 5 most recent
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = recentActivities.slice(0, 5);
    
    // If no recent activities, add helpful suggestions
    if (limitedActivities.length === 0) {
      limitedActivities.push({
        id: 'welcome',
        type: 'welcome',
        title: 'COMECE SUA OPERAÇÃO TÁTICA',
        description: 'Inicie seus estudos para ver atividades aqui',
        timestamp: new Date().toISOString(),
        score: 0,
        icon: 'star',
        success: true,
        details: 'Sistema pronto para uso'
      });
    }

    // Daily goals
    const dailyGoals = [
      {
        id: 1,
        task: 'COMPLETAR 50 EXERCÍCIOS TÁTICOS',
        completed: Math.min(questionsAnswered, 50),
        total: 50,
        type: 'questions'
      },
      {
        id: 2,
        task: 'REVISAR 30 CARTÕES TÁTICOS',
        completed: Math.min(flashcardsReviewed, 30),
        total: 30,
        type: 'flashcards'
      },
      {
        id: 3,
        task: 'TREINAR POR 4 HORAS',
        completed: Math.min(4, (questionsAnswered * 0.05) + (flashcardsReviewed * 0.02)), // Estimate study time based on activities
        total: 4,
        type: 'study_time'
      },
      {
        id: 4,
        task: 'EXECUTAR 1 SIMULAÇÃO TÁTICA',
        completed: userExamAttempts.length > 0 ? 1 : 0,
        total: 1,
        type: 'simulation'
      }
    ];

    // Subject performance based on real data
    const subjectStats = {};
    userQuestions.forEach(q => {
      const subject = q.subject || q.category || 'GERAL';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, total: 0 };
      }
      subjectStats[subject].total++;
      if (q.correct) subjectStats[subject].correct++;
    });

    const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]: [string, any]) => ({
      subject: subject.toUpperCase(),
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      questions: stats.total
    }));

    // Add default subjects if no data available
    if (subjectPerformance.length === 0) {
      subjectPerformance.push(
        { subject: 'GERAL', accuracy: 0, questions: 0 }
      );
    }

    // Próximos estudos programados baseados em dados reais
    const upcomingStudies = [];
    
    // Adicionar revisões de flashcards pendentes
    if (userFlashcards.length > 0) {
      const flashcardsForReview = userFlashcards.filter(f => {
        const lastReview = new Date(f.lastReviewed || f.createdAt || Date.now());
        const daysSinceReview = Math.floor((today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceReview >= 1; // Cards que precisam de revisão
      }).length;
      
      if (flashcardsForReview > 0) {
        upcomingStudies.push({
          id: 'flashcards-review',
          title: 'REVISÃO DE CARTÕES TÁTICOS',
          description: `${flashcardsForReview} cartões aguardando revisão`,
          date: new Date().toISOString(),
          daysLeft: 0,
          type: 'flashcards',
          priority: 'high',
          progress: 0,
          action: '/flashcards'
        });
      }
    }
    
    // Adicionar cursos com baixo progresso
    const coursesNeedingAttention = enrolledCourses.filter(c => c.progress < 30).slice(0, 2);
    coursesNeedingAttention.forEach((course, index) => {
      upcomingStudies.push({
        id: `course-${course.id}`,
        title: `CONTINUAR ${course.name.toUpperCase()}`,
        description: `${Math.round(course.progress)}% concluído - ${course.totalQuestions} questões disponíveis`,
        date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 0,
        type: 'course',
        priority: 'medium',
        progress: course.progress,
        action: `/course/${course.id}`
      });
    });
    
    // Adicionar estudo das matérias fracas
    const weakestSubject = subjectPerformance.find(s => s.accuracy < 50);
    if (weakestSubject && weakestSubject.questions > 0) {
      upcomingStudies.push({
        id: 'weak-subject',
        title: `REFORÇO EM ${weakestSubject.subject}`,
        description: `Apenas ${weakestSubject.accuracy}% de acerto - precisa de atenção`,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 1,
        type: 'practice',
        priority: 'high',
        progress: weakestSubject.accuracy,
        action: '/questions'
      });
    }
    
    // Se não há estudos específicos, adicionar sugestões gerais
    if (upcomingStudies.length === 0) {
      upcomingStudies.push(
        {
          id: 'daily-practice',
          title: 'EXERCÍCIOS DIÁRIOS',
          description: 'Mantenha a disciplina com exercícios diários',
          date: new Date().toISOString(),
          daysLeft: 0,
          type: 'practice',
          priority: 'medium',
          progress: 0,
          action: '/questions'
        },
        {
          id: 'flashcard-study',
          title: 'ESTUDO COM FLASHCARDS',
          description: 'Otimize sua memorização com cartões inteligentes',
          date: new Date().toISOString(),
          daysLeft: 0,
          type: 'flashcards',
          priority: 'medium',
          progress: 0,
          action: '/flashcards'
        }
      );
    }
    
    // Limitar a 3 itens e ordenar por prioridade
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const upcomingEvents = upcomingStudies
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 3);

    // Study tips - rotacionados por dia da semana + personalização
    const allStudyTips = [
      'USE A TÉCNICA POMODORO: 25MIN OPERAÇÃO + 5MIN DESCANSO TÁTICO',
      'REVISE CARTÕES TÁTICOS ANTES DO DESCANSO NOTURNO',
      'EXECUTE EXERCÍCIOS DE OPERAÇÕES ANTERIORES DA MESMA BANCA',
      'MANTENHA CRONOGRAMA OPERACIONAL CONSISTENTE',
      'FAÇA INTERVALOS DE 15 MINUTOS A CADA 2 HORAS DE ESTUDO INTENSO',
      'PRIORIZE MATÉRIAS FRACAS NOS HORÁRIOS DE MAIOR CONCENTRAÇÃO',
      'CRIE MAPAS MENTAIS PARA CONECTAR CONCEITOS COMPLEXOS',
      'PRATIQUE QUESTÕES ANTES DE ESTUDAR TEORIA NOVA',
      'MANTENHA UM DIÁRIO DE ERROS PARA REVISÃO SEMANAL',
      'SIMULE CONDIÇÕES REAIS DE PROVA: TEMPO E AMBIENTE'
    ];
    
    // Personalizar dica principal baseada no desempenho do usuário
    let dailyTip = '';
    const dayOfWeek = today.getDay();
    
    if (accuracyRate < 50) {
      dailyTip = 'FOQUE EM REVISÃO: Suas estatísticas mostram necessidade de consolidação. Revise conceitos básicos antes de avançar.';
    } else if (questionsAnswered < 10) {
      dailyTip = 'ACELERE A PRÁTICA: Aumente o volume de exercícios diários. Meta: 30 questões por dia para ganhar ritmo.';
    } else if (flashcardsReviewed < 20) {
      dailyTip = 'ATIVE OS FLASHCARDS: Use cartões de memória para fixar conceitos. 15 minutos diários fazem diferença.';
    } else {
      // Usar dica rotativa baseada no dia da semana
      dailyTip = allStudyTips[dayOfWeek % allStudyTips.length];
    }
    
    const studyTips = {
      daily: dailyTip,
      additional: allStudyTips
        .filter(tip => tip !== dailyTip)
        .slice(((dayOfWeek * 3) % allStudyTips.length), ((dayOfWeek * 3) % allStudyTips.length) + 3),
      total: allStudyTips.length,
      category: accuracyRate < 50 ? 'improvement' : questionsAnswered < 10 ? 'volume' : flashcardsReviewed < 20 ? 'memory' : 'general'
    };

    res.json({
      success: true,
      data: {
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar || null,
          role: currentUser.role,
          subscription: currentUser.subscription || { plan: 'BÁSICO', expiresAt: '30 DIAS' }
        },
        statistics: {
          questionsAnswered,
          correctAnswers,
          accuracyRate,
          flashcardsReviewed,
          studyStreak,
          totalStudyTime: (questionsAnswered * 3) + (flashcardsReviewed * 1), // Estimate in minutes based on activities
        },
        courses: enrolledCourses,
        // Cursos em progresso (operações em andamento)
        coursesInProgress: enrolledCourses
          .filter(course => course.progress > 0 && course.progress < 100)
          .slice(0, 4)
          .map(course => ({
            id: course.id,
            name: course.name,
            category: course.category,
            progress: course.progress,
            totalQuestions: course.totalQuestions,
            totalFlashcards: course.totalFlashcards,
            thumbnail: course.thumbnail,
            estimatedTimeLeft: course.progress > 0 ? 
              Math.ceil((100 - course.progress) / 10) + ' semanas' : '4-6 semanas',
            nextAction: course.progress < 25 ? 'Continuar lições básicas' :
                       course.progress < 50 ? 'Praticar exercícios' :
                       course.progress < 75 ? 'Revisar conteúdo' : 'Finalizar módulos',
            priority: course.progress < 25 ? 'high' : course.progress < 75 ? 'medium' : 'low',
            lastAccessed: course.enrolledAt
          })),
        recentActivities: limitedActivities,
        dailyGoals,
        subjectPerformance,
        upcomingEvents,
        studyTips,
        // Additional progress data based on subject performance
        editalProgress: subjectPerformance.map(subject => {
          const completed = subject.questions;
          const total = Math.max(completed, 50); // Minimum total for percentage calculation
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            materia: subject.subject,
            total: total,
            concluido: completed,
            porcentagem: Math.min(100, percentage)
          };
        }),
        // Recent courses accessed by user
        recentCourses: enrolledCourses
          .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
          .slice(0, 3)
          .map(course => ({
            id: course.id,
            name: course.name,
            category: course.category,
            progress: course.progress,
            totalQuestions: course.totalQuestions,
            totalFlashcards: course.totalFlashcards,
            lastAccessedAt: course.enrolledAt,
            thumbnail: course.thumbnail,
            difficulty: course.difficulty || 'INTERMEDIÁRIO',
            estimatedTime: course.estimatedTime || '2-3 semanas'
          })),
        // Weak subjects that need attention
        weakSubjects: subjectPerformance
          .filter(s => s.accuracy < 75)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3)
          .map(s => ({
            name: s.subject,
            accuracy: s.accuracy,
            questions: s.questions
          }))
      }
    });
  } catch (error) {
    console.error('Error getting student dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar dados do painel do estudante' 
    });
  }
});

export default router;