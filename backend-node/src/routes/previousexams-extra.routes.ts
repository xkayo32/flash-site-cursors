import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Data paths
const previousExamsPath = path.join(__dirname, '../../data/previous-exams.json');
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

// GET /api/v1/previousexams-extra/available - Get available previous exams for students
router.get('/available', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    console.log('📚 [PREVIOUS-EXAMS-EXTRA] Getting available previous exams for student');
    
    const previousExams = loadData<any>(previousExamsPath);
    
    // Filter only published exams for students
    const availableExams = previousExams
      .filter((exam: any) => exam.status === 'published')
      .map((exam: any) => ({
        id: exam.id,
        title: exam.title,
        organization: exam.organization,
        exam_board: exam.exam_board,
        position: exam.position,
        year: exam.year,
        total_questions: exam.total_questions,
        duration: exam.duration,
        subjects: exam.subjects,
        difficulty_distribution: exam.difficulty_distribution,
        statistics: exam.statistics
      }));

    console.log(`📚 [PREVIOUS-EXAMS-EXTRA] Found ${availableExams.length} available exams`);
    
    res.json({
      success: true,
      data: availableExams,
      total: availableExams.length
    });
  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS-EXTRA] Error getting available exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar provas disponíveis' 
    });
  }
});

// GET /api/v1/previousexams-extra/stats - Get previous exams statistics (admin only)
router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false,
      message: 'Acesso negado - apenas administradores' 
    });
    return;
  }

  try {
    console.log('📊 [PREVIOUS-EXAMS-EXTRA] Getting statistics for admin');
    
    const previousExams = loadData<any>(previousExamsPath);
    const examAttempts = loadData<any>(examAttemptsPath);

    // Calculate overall statistics
    const totalExams = previousExams.length;
    const publishedExams = previousExams.filter((e: any) => e.status === 'published').length;
    const totalAttempts = examAttempts.length;
    const completedAttempts = examAttempts.filter((a: any) => a.status === 'completed').length;
    
    // Calculate average scores
    const allScores = examAttempts
      .filter((a: any) => a.status === 'completed' && a.score !== undefined)
      .map((a: any) => a.score);
    
    const avgScore = allScores.length > 0 
      ? allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length 
      : 0;

    // Group by organization
    const byOrganization = previousExams.reduce((acc: any, exam: any) => {
      acc[exam.organization] = (acc[exam.organization] || 0) + 1;
      return acc;
    }, {});

    // Group by exam board
    const byExamBoard = previousExams.reduce((acc: any, exam: any) => {
      acc[exam.exam_board] = (acc[exam.exam_board] || 0) + 1;
      return acc;
    }, {});

    // Group by year
    const byYear = previousExams.reduce((acc: any, exam: any) => {
      acc[exam.year] = (acc[exam.year] || 0) + 1;
      return acc;
    }, {});

    // Group by position
    const byPosition = previousExams.reduce((acc: any, exam: any) => {
      acc[exam.position] = (acc[exam.position] || 0) + 1;
      return acc;
    }, {});

    // Most attempted exams
    const examAttemptCounts = examAttempts.reduce((acc: any, attempt: any) => {
      acc[attempt.exam_id] = (acc[attempt.exam_id] || 0) + 1;
      return acc;
    }, {});

    const popularExams = Object.entries(examAttemptCounts)
      .map(([examId, count]) => {
        const exam = previousExams.find((e: any) => e.id === examId);
        return {
          id: examId,
          title: exam?.title || 'Prova removida',
          organization: exam?.organization,
          position: exam?.position,
          year: exam?.year,
          attemptCount: count
        };
      })
      .sort((a: any, b: any) => b.attemptCount - a.attemptCount)
      .slice(0, 10);

    console.log('📊 [PREVIOUS-EXAMS-EXTRA] Statistics calculated successfully');
    
    res.json({
      success: true,
      data: {
        overall: {
          total_exams: totalExams,
          published_exams: publishedExams,
          draft_exams: totalExams - publishedExams,
          total_attempts: totalAttempts,
          completed_attempts: completedAttempts,
          average_score: Number(avgScore.toFixed(1)),
          completion_rate: totalAttempts > 0 
            ? Number(((completedAttempts / totalAttempts) * 100).toFixed(1))
            : 0
        },
        distribution: {
          by_organization: byOrganization,
          by_exam_board: byExamBoard,
          by_year: byYear,
          by_position: byPosition
        },
        popular_exams: popularExams
      }
    });
  } catch (error) {
    console.error('❌ [PREVIOUS-EXAMS-EXTRA] Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

export default router;