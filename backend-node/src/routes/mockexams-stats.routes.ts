import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Data paths
const mockExamsPath = path.join(__dirname, '../../data/mockexams.json');
const examSessionsPath = path.join(__dirname, '../../data/exam-sessions.json');
const examAttemptsPath = path.join(__dirname, '../../data/exam-attempts.json');

// Helper function to load data
function loadData<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

// GET /api/v1/mockexams-stats/general - Get mock exams statistics (ADMIN ONLY)
router.get('/general', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    // Check if admin
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar estatísticas.'
      });
      return;
    }

    const mockExams = loadData<any>(mockExamsPath);
    const examSessions = loadData<any>(examSessionsPath);
    const examAttempts = loadData<any>(examAttemptsPath);
    
    const mockExamSessions = examSessions.filter((session: any) => session.examType === 'mock');

    // General statistics
    const totalExams = mockExams.length;
    const publishedExams = mockExams.filter((exam: any) => exam.status === 'published').length;
    const totalSessions = mockExamSessions.length;
    const completedSessions = mockExamSessions.filter((session: any) => session.status === 'completed').length;
    const totalAttempts = examAttempts.length;
    const completedAttempts = examAttempts.filter((attempt: any) => attempt.status === 'completed').length;

    // Difficulty statistics
    const difficultyStats = mockExams.reduce((acc: any, exam: any) => {
      const difficulty = exam.difficulty || 'MIXED';
      if (!acc[difficulty]) {
        acc[difficulty] = { count: 0, sessions: 0, attempts: 0 };
      }
      acc[difficulty].count++;
      acc[difficulty].sessions += mockExamSessions.filter((s: any) => s.examId === exam.id).length;
      acc[difficulty].attempts += examAttempts.filter((a: any) => a.exam_id === exam.id).length;
      return acc;
    }, {});

    // Type statistics
    const typeStats = mockExams.reduce((acc: any, exam: any) => {
      const type = exam.type || 'AUTOMATIC';
      if (!acc[type]) {
        acc[type] = { count: 0, sessions: 0, attempts: 0 };
      }
      acc[type].count++;
      acc[type].sessions += mockExamSessions.filter((s: any) => s.examId === exam.id).length;
      acc[type].attempts += examAttempts.filter((a: any) => a.exam_id === exam.id).length;
      return acc;
    }, {});

    // Average performance
    const sessionsWithScores = mockExamSessions.filter((session: any) => 
      session.status === 'completed' && session.score !== undefined
    );
    const averageScore = sessionsWithScores.length > 0
      ? sessionsWithScores.reduce((sum: number, session: any) => sum + (session.score || 0), 0) / sessionsWithScores.length
      : 0;

    // Most popular exams
    const examPopularity = mockExams.map((exam: any) => {
      const sessions = mockExamSessions.filter((s: any) => s.examId === exam.id);
      const attempts = examAttempts.filter((a: any) => a.exam_id === exam.id);
      const completedAttempts = attempts.filter((a: any) => a.status === 'completed');
      
      return {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        difficulty: exam.difficulty,
        sessions: sessions.length,
        attempts: attempts.length,
        completions: completedAttempts.length,
        averageScore: completedAttempts.length > 0
          ? completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAttempts.length
          : 0,
        passRate: completedAttempts.length > 0
          ? (completedAttempts.filter((a: any) => a.score >= exam.passing_score).length / completedAttempts.length) * 100
          : 0
      };
    }).sort((a, b) => b.attempts - a.attempts).slice(0, 10);

    // Recent activity
    const recentSessions = mockExamSessions
      .sort((a: any, b: any) => new Date(b.createdAt || b.started_at).getTime() - new Date(a.createdAt || a.started_at).getTime())
      .slice(0, 20)
      .map((session: any) => ({
        sessionId: session.id,
        examId: session.examId,
        examTitle: mockExams.find((e: any) => e.id === session.examId)?.title || 'Simulado removido',
        userId: session.userId,
        status: session.status,
        score: session.score,
        createdAt: session.createdAt || session.started_at,
        completedAt: session.completedAt || session.submitted_at
      }));

    const stats = {
      general: {
        totalExams,
        publishedExams,
        draftExams: totalExams - publishedExams,
        totalSessions,
        completedSessions,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      },
      byDifficulty: difficultyStats,
      byType: typeStats,
      popularExams: examPopularity,
      recentActivity: recentSessions
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching mock exam stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;