import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Helper function to get user exam data
async function getUserExamData(userId: string) {
  try {
    // Read exam sessions
    const sessionsPath = path.join(__dirname, '../../data/exam_sessions.json');
    const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
    const sessions = JSON.parse(sessionsData);
    
    // Filter user sessions
    const userSessions = sessions.filter((s: any) => 
      s.userId === userId || s.userId === parseInt(userId)
    );

    // Read questions for subject mapping
    const questionsPath = path.join(__dirname, '../../data/questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsData);

    return { sessions: userSessions, questions };
  } catch (error) {
    return { sessions: [], questions: [] };
  }
}

// Get analytics overview
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId.toString();
    const period = req.query.period || '30days';
    
    const { sessions } = await getUserExamData(userId);
    
    // Calculate performance data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter((s: any) => 
      new Date(s.startedAt) >= thirtyDaysAgo && s.status === 'submitted'
    );

    // Generate performance data by day
    const performanceData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = recentSessions.filter((s: any) => 
        s.startedAt.split('T')[0] === dateStr
      );
      
      const examsTaken = daySessions.length;
      const totalScore = daySessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
      const averageScore = examsTaken > 0 ? Math.round(totalScore / examsTaken) : 0;
      const studyTime = daySessions.reduce((sum: number, s: any) => sum + (s.timeSpent || 0), 0);
      const correctAnswers = daySessions.reduce((sum: number, s: any) => sum + (s.correctAnswers || 0), 0);
      const totalQuestions = daySessions.reduce((sum: number, s: any) => sum + (s.totalQuestions || 0), 0);
      
      performanceData.push({
        date: dateStr,
        examsTaken,
        averageScore,
        studyTime: Math.round(studyTime / 60), // Convert to minutes
        correctAnswers,
        totalQuestions
      });
    }

    // Subject performance
    const subjectStats: any = {};
    recentSessions.forEach((session: any) => {
      session.questions?.forEach((q: any) => {
        const subject = q.subject || 'Geral';
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            subject,
            totalQuestions: 0,
            correctAnswers: 0,
            totalTime: 0
          };
        }
        subjectStats[subject].totalQuestions++;
        if (session.answers && session.answers[q.id] === q.correctAnswer) {
          subjectStats[subject].correctAnswers++;
        }
        subjectStats[subject].totalTime += 60; // Estimate 60s per question
      });
    });

    const subjectPerformance = Object.values(subjectStats).map((stat: any, index: number) => {
      const accuracy = stat.totalQuestions > 0 ? 
        Math.round((stat.correctAnswers / stat.totalQuestions) * 100) : 0;
      
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      
      return {
        ...stat,
        accuracy,
        averageTime: Math.round(stat.totalTime / Math.max(stat.totalQuestions, 1)),
        improvement: Math.floor(Math.random() * 20) - 10, // Simulated for now
        color: colors[index % colors.length],
        icon: 'BookOpen'
      };
    });

    // Mock competitors (since we need real ranking system)
    const competitors = [
      { id: userId, name: 'Você', avatar: '/avatar-default.png', score: 85, examsTaken: recentSessions.length, rank: 1, trend: 'up' as const },
      { id: '2', name: 'Operador Alpha', avatar: '/avatar-1.png', score: 82, examsTaken: 15, rank: 2, trend: 'stable' as const },
      { id: '3', name: 'Agente Beta', avatar: '/avatar-2.png', score: 79, examsTaken: 12, rank: 3, trend: 'down' as const }
    ];

    // Weak points analysis
    const weakPoints = subjectPerformance
      .filter((s: any) => s.accuracy < 70)
      .map((s: any) => ({
        id: s.subject.toLowerCase().replace(' ', '-'),
        subject: s.subject,
        topic: `Conceitos básicos de ${s.subject}`,
        accuracy: s.accuracy,
        questionsAttempted: s.totalQuestions,
        priority: s.accuracy < 50 ? 'alta' : s.accuracy < 65 ? 'media' : 'baixa',
        recommendation: s.accuracy < 50 ? 
          'Revisar fundamentos básicos' : 
          'Praticar exercícios específicos',
        color: s.color
      }));

    // Study patterns
    const studyPatterns = [
      {
        period: 'Manhã (06:00-12:00)',
        averageTime: 45,
        peakHour: '09:00',
        consistency: 85,
        totalSessions: Math.floor(recentSessions.length * 0.4)
      },
      {
        period: 'Tarde (12:00-18:00)',
        averageTime: 32,
        peakHour: '15:00',
        consistency: 72,
        totalSessions: Math.floor(recentSessions.length * 0.35)
      },
      {
        period: 'Noite (18:00-24:00)',
        averageTime: 28,
        peakHour: '20:00',
        consistency: 90,
        totalSessions: Math.floor(recentSessions.length * 0.25)
      }
    ];

    // Tactical stats
    const totalScore = recentSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const totalTime = recentSessions.reduce((sum: number, s: any) => sum + (s.timeSpent || 0), 0);
    const totalQuestions = recentSessions.reduce((sum: number, s: any) => sum + (s.totalQuestions || 0), 0);
    
    const stats = {
      totalExamsTaken: recentSessions.length,
      averageScore: recentSessions.length > 0 ? Math.round(totalScore / recentSessions.length) : 0,
      totalStudyTime: Math.round(totalTime / 60), // Convert to minutes
      questionsAnswered: totalQuestions,
      currentStreak: Math.min(recentSessions.length, 7), // Simulate streak
      bestStreak: Math.min(recentSessions.length + 2, 15),
      rank: 1,
      totalUsers: 1250,
      improvement: 12 // Simulated improvement
    };

    res.json({
      performance: performanceData,
      subjectPerformance,
      competitors,
      weakPoints,
      studyPatterns,
      stats
    });

  } catch (error: any) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get performance data
router.get('/performance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId.toString();
    const period = req.query.period || '30days';
    
    const { sessions } = await getUserExamData(userId);
    
    // Calculate days based on period
    let days = 30;
    if (period === '7days') days = 7;
    if (period === '90days') days = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const recentSessions = sessions.filter((s: any) => 
      new Date(s.startedAt) >= startDate && s.status === 'submitted'
    );

    // Generate performance data
    const performanceData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = recentSessions.filter((s: any) => 
        s.startedAt.split('T')[0] === dateStr
      );
      
      const examsTaken = daySessions.length;
      const totalScore = daySessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
      const averageScore = examsTaken > 0 ? Math.round(totalScore / examsTaken) : 0;
      const studyTime = daySessions.reduce((sum: number, s: any) => sum + (s.timeSpent || 0), 0);
      const correctAnswers = daySessions.reduce((sum: number, s: any) => sum + (s.correctAnswers || 0), 0);
      const totalQuestions = daySessions.reduce((sum: number, s: any) => sum + (s.totalQuestions || 0), 0);
      
      performanceData.push({
        date: dateStr,
        examsTaken,
        averageScore,
        studyTime: Math.round(studyTime / 60),
        correctAnswers,
        totalQuestions
      });
    }

    res.json(performanceData);
  } catch (error: any) {
    console.error('Error getting performance data:', error);
    res.status(500).json({ error: 'Failed to get performance data' });
  }
});

// Get tactical stats
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId.toString();
    const { sessions } = await getUserExamData(userId);
    
    const recentSessions = sessions.filter((s: any) => s.status === 'submitted');
    
    const totalScore = recentSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const totalTime = recentSessions.reduce((sum: number, s: any) => sum + (s.timeSpent || 0), 0);
    const totalQuestions = recentSessions.reduce((sum: number, s: any) => sum + (s.totalQuestions || 0), 0);
    
    const stats = {
      totalExamsTaken: recentSessions.length,
      averageScore: recentSessions.length > 0 ? Math.round(totalScore / recentSessions.length) : 0,
      totalStudyTime: Math.round(totalTime / 60),
      questionsAnswered: totalQuestions,
      currentStreak: Math.min(recentSessions.length, 7),
      bestStreak: Math.min(recentSessions.length + 2, 15),
      rank: 1,
      totalUsers: 1250,
      improvement: 12
    };

    res.json(stats);
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Refresh analytics
router.post('/refresh', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.json({ success: true, message: 'Analytics refreshed successfully' });
  } catch (error: any) {
    console.error('Error refreshing analytics:', error);
    res.status(500).json({ error: 'Failed to refresh analytics' });
  }
});

// Export data
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    const format = req.query.format || 'pdf';
    
    // For now, return a simple response
    // In production, you'd generate actual PDF/Excel files
    res.json({ 
      success: true, 
      message: `Export in ${format} format initiated`,
      downloadUrl: `/exports/analytics-${Date.now()}.${format}`
    });
  } catch (error: any) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;