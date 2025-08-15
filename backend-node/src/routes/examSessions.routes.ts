import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Interfaces
interface ExamSession {
  id: string;
  examId: string;
  examType: 'mock' | 'previous';
  userId: string;
  title: string;
  questions: Question[];
  answers: Record<string, string>;
  flaggedQuestions: string[];
  startedAt: string;
  submittedAt?: string;
  duration: number;
  timeSpent: number;
  score?: number;
  correctAnswers?: number;
  totalQuestions: number;
  status: 'active' | 'submitted' | 'expired';
  results?: any;
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

// File paths
const sessionsPath = path.join(__dirname, '../../data/exam-sessions.json');
const previousExamsPath = path.join(__dirname, '../../data/previousexams.json');
const mockExamsPath = path.join(__dirname, '../../data/mockexams.json');
const questionsPath = path.join(__dirname, '../../data/questions.json');

// Helper functions
async function readSessions(): Promise<ExamSession[]> {
  try {
    const data = await fs.readFile(sessionsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

async function saveSessions(sessions: ExamSession[]): Promise<void> {
  await fs.writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
}

async function getQuestions(questionIds: string[]): Promise<Question[]> {
  try {
    const data = await fs.readFile(questionsPath, 'utf-8');
    const allQuestions = JSON.parse(data);
    
    // Map questions from the data
    const questions: Question[] = [];
    let questionNumber = 1;
    
    for (const qId of questionIds) {
      const question = allQuestions.find((q: any) => q.id === qId);
      if (question) {
        // Transform to exam format
        const alternatives: Alternative[] = question.options ? 
          question.options.map((opt: string, idx: number) => ({
            id: `alt-${qId}-${idx}`,
            letter: String.fromCharCode(65 + idx),
            text: opt
          })) : [];
        
        questions.push({
          id: question.id,
          number: questionNumber++,
          subject: question.subject || question.category || 'Geral',
          statement: question.title || question.question,
          alternatives,
          correctAnswer: alternatives[question.correct_answer || 0]?.id || '',
          explanation: question.explanation || '',
          difficulty: question.difficulty === 'hard' ? 'SARGENTO' : 
                     question.difficulty === 'medium' ? 'CABO' : 'RECRUTA',
          year: question.year,
          institution: question.institution
        });
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error reading questions:', error);
    return [];
  }
}

// Routes

// Start a new exam session
router.post('/:examType/:examId/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { examType, examId } = req.params;
    const userId = (req as any).userId;
    
    if (!['mock', 'previous'].includes(examType)) {
      return res.status(400).json({ error: 'Invalid exam type' });
    }
    
    // Get exam details
    let exam: any;
    let examTitle: string;
    let questionIds: string[] = [];
    
    if (examType === 'previous') {
      const previousExamsData = await fs.readFile(previousExamsPath, 'utf-8');
      const previousExams = JSON.parse(previousExamsData);
      exam = previousExams.find((e: any) => e.id === examId);
      
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      
      examTitle = `${exam.organization} - ${exam.position} ${exam.year}`;
      questionIds = exam.question_ids || [];
      
      // If no specific questions, generate random ones
      if (questionIds.length === 0) {
        const allQuestionsData = await fs.readFile(questionsPath, 'utf-8');
        const allQuestions = JSON.parse(allQuestionsData);
        
        // Filter questions by criteria if available
        let filteredQuestions = allQuestions;
        if (exam.subjects && exam.subjects.length > 0) {
          filteredQuestions = allQuestions.filter((q: any) => 
            exam.subjects.includes(q.subject) || exam.subjects.includes(q.category)
          );
        }
        
        // Shuffle and take required number
        const totalQuestions = exam.total_questions || 50;
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        questionIds = shuffled.slice(0, Math.min(totalQuestions, shuffled.length)).map((q: any) => q.id);
      }
    } else {
      // Mock exam
      const mockExamsData = await fs.readFile(mockExamsPath, 'utf-8');
      const mockExams = JSON.parse(mockExamsData);
      exam = mockExams.find((e: any) => e.id === examId);
      
      if (!exam) {
        return res.status(404).json({ error: 'Mock exam not found' });
      }
      
      examTitle = exam.title;
      questionIds = exam.question_ids || [];
      
      // Generate questions if needed
      if (questionIds.length === 0) {
        const allQuestionsData = await fs.readFile(questionsPath, 'utf-8');
        const allQuestions = JSON.parse(allQuestionsData);
        
        // Apply filters from mock exam config
        let filteredQuestions = allQuestions;
        if (exam.category) {
          filteredQuestions = filteredQuestions.filter((q: any) => 
            q.category === exam.category || q.subject === exam.category
          );
        }
        if (exam.difficulty) {
          filteredQuestions = filteredQuestions.filter((q: any) => 
            q.difficulty === exam.difficulty
          );
        }
        
        // Shuffle and take required number
        const totalQuestions = exam.total_questions || 30;
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        questionIds = shuffled.slice(0, totalQuestions).map((q: any) => q.id);
      }
    }
    
    // Get questions
    const questions = await getQuestions(questionIds);
    
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions available for this exam' });
    }
    
    // Create new session
    const newSession: ExamSession = {
      id: uuidv4(),
      examId,
      examType: examType as 'mock' | 'previous',
      userId,
      title: examTitle,
      questions,
      answers: {},
      flaggedQuestions: [],
      startedAt: new Date().toISOString(),
      duration: exam.duration || 180, // Default 3 hours, but test exam has 10 minutes
      timeSpent: 0,
      totalQuestions: questions.length,
      status: 'active'
    };
    
    // Save session
    const sessions = await readSessions();
    sessions.push(newSession);
    await saveSessions(sessions);
    
    res.json(newSession);
  } catch (error: any) {
    console.error('Error starting exam session:', error);
    res.status(500).json({ error: 'Failed to start exam session' });
  }
});

// Get exam session
router.get('/sessions/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;
    
    const sessions = await readSessions();
    const session = sessions.find(s => s.id === sessionId && s.userId === userId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error: any) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Get user's exam sessions
router.get('/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status, examType } = req.query;
    
    let sessions = await readSessions();
    
    // Filter by user
    sessions = sessions.filter(s => s.userId === userId);
    
    // Apply filters
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    if (examType) {
      sessions = sessions.filter(s => s.examType === examType);
    }
    
    res.json(sessions);
  } catch (error: any) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Save answer
router.put('/sessions/:sessionId/answers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionId, alternativeId, flagged } = req.body;
    const userId = (req as any).userId;
    
    const sessions = await readSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId && s.userId === userId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessions[sessionIndex];
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }
    
    // Update answer
    if (alternativeId !== undefined) {
      session.answers[questionId] = alternativeId;
    }
    
    // Update flag
    if (flagged !== undefined) {
      if (flagged && !session.flaggedQuestions.includes(questionId)) {
        session.flaggedQuestions.push(questionId);
      } else if (!flagged) {
        session.flaggedQuestions = session.flaggedQuestions.filter(id => id !== questionId);
      }
    }
    
    sessions[sessionIndex] = session;
    await saveSessions(sessions);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// Update time spent
router.put('/sessions/:sessionId/time', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body;
    const userId = (req as any).userId;
    
    const sessions = await readSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId && s.userId === userId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    sessions[sessionIndex].timeSpent = timeSpent;
    await saveSessions(sessions);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating time:', error);
    res.status(500).json({ error: 'Failed to update time' });
  }
});

// Submit exam
router.post('/sessions/:sessionId/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body;
    const userId = (req as any).userId;
    
    const sessions = await readSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId && s.userId === userId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessions[sessionIndex];
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    for (const question of session.questions) {
      const userAnswer = session.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    const score = Math.round((correctAnswers / session.totalQuestions) * 100);
    
    // Update session
    session.status = 'submitted';
    session.submittedAt = new Date().toISOString();
    session.timeSpent = timeSpent;
    session.score = score;
    session.correctAnswers = correctAnswers;
    
    // Generate results
    const results = {
      id: session.id,
      examId: session.examId,
      examTitle: session.title,
      score,
      correctAnswers,
      totalQuestions: session.totalQuestions,
      timeSpent,
      completedAt: session.submittedAt,
      questions: session.questions.map(q => ({
        ...q,
        userAnswer: session.answers[q.id],
        isCorrect: session.answers[q.id] === q.correctAnswer
      }))
    };
    
    session.results = results;
    sessions[sessionIndex] = session;
    await saveSessions(sessions);
    
    res.json({ sessionId: session.id, results });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// Get exam results
router.get('/sessions/:sessionId/results', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;
    
    const sessions = await readSessions();
    const session = sessions.find(s => s.id === sessionId && s.userId === userId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status !== 'submitted') {
      return res.status(400).json({ error: 'Exam not submitted yet' });
    }
    
    res.json(session.results);
  } catch (error: any) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;