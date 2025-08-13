import express from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Types
interface ExamSession {
  id: string;
  examId: string;
  examType: 'mock' | 'previous'; // mock exam ou previous exam
  userId: string;
  title: string;
  questions: Question[];
  answers: Record<string, string>; // questionId -> alternativeId
  flaggedQuestions: string[];
  startedAt: string;
  submittedAt?: string;
  duration: number; // tempo total em minutos
  timeSpent: number; // tempo gasto em segundos
  score?: number;
  correctAnswers?: number;
  totalQuestions: number;
  status: 'active' | 'submitted' | 'expired';
  results?: ExamResults;
}

interface Question {
  id: string;
  number: number;
  subject: string;
  statement: string;
  alternatives: Alternative[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'RECRUTA' | 'CABO' | 'SARGENTO';
  year?: number;
  institution?: string;
}

interface Alternative {
  id: string;
  letter: string;
  text: string;
}

interface ExamResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  subjectPerformance: SubjectPerformance[];
  percentile: number;
  averageScore: number;
  recommendedStudyTopics: string[];
}

interface SubjectPerformance {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
  color: string;
}

// Utility functions
const getDataPath = () => path.join(__dirname, '../../data/exam_sessions.json');
const getMockExamsPath = () => path.join(__dirname, '../../data/mockexams.json');
const getPreviousExamsPath = () => path.join(__dirname, '../../data/previousexams.json');

const loadExamSessions = (): ExamSession[] => {
  try {
    const dataPath = getDataPath();
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading exam sessions:', error);
    return [];
  }
};

const saveExamSessions = (sessions: ExamSession[]): void => {
  try {
    const dataPath = getDataPath();
    // Ensure data directory exists
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('Error saving exam sessions:', error);
    throw new Error('Failed to save exam session');
  }
};

const loadExamData = (examId: string, examType: 'mock' | 'previous'): any => {
  try {
    const filePath = examType === 'mock' ? getMockExamsPath() : getPreviousExamsPath();
    const data = fs.readFileSync(filePath, 'utf8');
    const exams = JSON.parse(data);
    return exams.find((exam: any) => exam.id === examId);
  } catch (error) {
    console.error('Error loading exam data:', error);
    return null;
  }
};

const calculateResults = (session: ExamSession): ExamResults => {
  const { questions, answers } = session;
  let correctAnswers = 0;
  const subjectStats: Record<string, { total: number; correct: number }> = {};

  // Calculate correct answers and subject performance
  questions.forEach(question => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctAnswers++;
    }

    // Track subject performance
    if (!subjectStats[question.subject]) {
      subjectStats[question.subject] = { total: 0, correct: 0 };
    }
    subjectStats[question.subject].total++;
    if (isCorrect) {
      subjectStats[question.subject].correct++;
    }
  });

  const score = (correctAnswers / questions.length) * 100;

  // Convert subject stats to required format
  const subjectColors = [
    'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-red-500', 'bg-indigo-500'
  ];

  const subjectPerformance: SubjectPerformance[] = Object.entries(subjectStats).map(
    ([subject, stats], index) => ({
      subject,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100),
      color: subjectColors[index % subjectColors.length]
    })
  );

  // Generate study recommendations based on weak subjects
  const weakSubjects = subjectPerformance
    .filter(s => s.percentage < 70)
    .map(s => s.subject);

  const recommendedStudyTopics = weakSubjects.length > 0 
    ? weakSubjects.map(subject => `${subject} - Revisar conceitos fundamentais`)
    : ['Continuar revisões periódicas para manter o desempenho'];

  // Mock data for comparative statistics
  const averageScore = 68.5;
  const percentile = score > averageScore ? Math.round(score - 15) : Math.round(score - 25);

  return {
    score: Math.round(score * 100) / 100,
    correctAnswers,
    totalQuestions: questions.length,
    timeSpent: session.timeSpent,
    completedAt: new Date().toISOString(),
    subjectPerformance,
    percentile: Math.max(10, Math.min(95, percentile)),
    averageScore,
    recommendedStudyTopics: recommendedStudyTopics.slice(0, 3)
  };
};

// Routes

// POST /api/v1/exams/:examId/sessions - Start exam session
router.post('/:examType/:examId/sessions', authMiddleware, async (req, res) => {
  try {
    const { examId, examType } = req.params;
    const userId = (req as any).userId;

    if (!['mock', 'previous'].includes(examType)) {
      return res.status(400).json({ error: 'Invalid exam type' });
    }

    // Load exam data
    const examData = loadExamData(examId, examType as 'mock' | 'previous');
    if (!examData) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Check if user already has an active session for this exam
    const sessions = loadExamSessions();
    const existingSession = sessions.find(
      s => s.examId === examId && s.userId === userId && s.status === 'active'
    );

    if (existingSession) {
      return res.json(existingSession);
    }

    // Create new session
    const sessionId = `session_${examId}_${userId}_${Date.now()}`;
    const newSession: ExamSession = {
      id: sessionId,
      examId,
      examType: examType as 'mock' | 'previous',
      userId,
      title: examData.title,
      questions: examData.questions || [],
      answers: {},
      flaggedQuestions: [],
      startedAt: new Date().toISOString(),
      duration: examData.duration || 180, // Default 3 hours
      timeSpent: 0,
      totalQuestions: (examData.questions || []).length,
      status: 'active'
    };

    sessions.push(newSession);
    saveExamSessions(sessions);

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error starting exam session:', error);
    res.status(500).json({ error: 'Failed to start exam session' });
  }
});

// PUT /api/v1/exam-sessions/:sessionId/answers - Save answer
router.put('/sessions/:sessionId/answers', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, alternativeId, flagged } = req.body;
    const userId = (req as any).userId;

    const sessions = loadExamSessions();
    const sessionIndex = sessions.findIndex(
      s => s.id === sessionId && s.userId === userId && s.status === 'active'
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    const session = sessions[sessionIndex];

    // Update answer
    if (questionId && alternativeId) {
      session.answers[questionId] = alternativeId;
    }

    // Update flagged status
    if (questionId && typeof flagged === 'boolean') {
      if (flagged) {
        if (!session.flaggedQuestions.includes(questionId)) {
          session.flaggedQuestions.push(questionId);
        }
      } else {
        session.flaggedQuestions = session.flaggedQuestions.filter(id => id !== questionId);
      }
    }

    sessions[sessionIndex] = session;
    saveExamSessions(sessions);

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// PUT /api/v1/exam-sessions/:sessionId/time - Update time spent
router.put('/sessions/:sessionId/time', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body;
    const userId = (req as any).userId;

    const sessions = loadExamSessions();
    const sessionIndex = sessions.findIndex(
      s => s.id === sessionId && s.userId === userId && s.status === 'active'
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    sessions[sessionIndex].timeSpent = timeSpent;
    saveExamSessions(sessions);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating time:', error);
    res.status(500).json({ error: 'Failed to update time' });
  }
});

// POST /api/v1/exam-sessions/:sessionId/submit - Submit exam
router.post('/sessions/:sessionId/submit', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body;
    const userId = (req as any).userId;

    const sessions = loadExamSessions();
    const sessionIndex = sessions.findIndex(
      s => s.id === sessionId && s.userId === userId && s.status === 'active'
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    const session = sessions[sessionIndex];

    // Update session with final data
    session.submittedAt = new Date().toISOString();
    session.timeSpent = timeSpent || session.timeSpent;
    session.status = 'submitted';

    // Calculate results
    const results = calculateResults(session);
    session.results = results;
    session.score = results.score;
    session.correctAnswers = results.correctAnswers;

    sessions[sessionIndex] = session;
    saveExamSessions(sessions);

    res.json({ 
      success: true, 
      sessionId,
      results
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// GET /api/v1/exam-sessions/:sessionId/results - Get results
router.get('/sessions/:sessionId/results', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;

    const sessions = loadExamSessions();
    const session = sessions.find(
      s => s.id === sessionId && s.userId === userId && s.status === 'submitted'
    );

    if (!session || !session.results) {
      return res.status(404).json({ error: 'Results not found' });
    }

    // Include detailed question results for review
    const questionResults = session.questions.map(question => ({
      id: question.id,
      number: question.number,
      subject: question.subject,
      statement: question.statement,
      alternatives: question.alternatives,
      correctAnswer: question.correctAnswer,
      userAnswer: session.answers[question.id],
      isCorrect: session.answers[question.id] === question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      year: question.year,
      institution: question.institution
    }));

    const fullResults = {
      id: session.id,
      examId: session.examId,
      examTitle: session.title,
      ...session.results,
      questions: questionResults,
      // Mock ranking data
      ranking: Math.floor(Math.random() * 2000) + 500,
      totalParticipants: Math.floor(Math.random() * 5000) + 5000
    };

    res.json(fullResults);
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// GET /api/v1/exam-sessions/:sessionId - Get session details
router.get('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;

    const sessions = loadExamSessions();
    const session = sessions.find(
      s => s.id === sessionId && s.userId === userId
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// GET /api/v1/exam-sessions - Get user's exam sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { status, examType } = req.query;

    const sessions = loadExamSessions();
    let userSessions = sessions.filter(s => s.userId === userId);

    if (status) {
      userSessions = userSessions.filter(s => s.status === status);
    }

    if (examType) {
      userSessions = userSessions.filter(s => s.examType === examType);
    }

    // Sort by most recent first
    userSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    res.json(userSessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;