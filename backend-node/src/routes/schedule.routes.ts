import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Schedule data storage
const schedulePath = path.join(__dirname, '../../data/schedule.json');

// Ensure data directory exists
const dataDir = path.dirname(schedulePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Type definitions
export type TaskType = 'study' | 'practice' | 'review' | 'exam';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EventType = 'course' | 'lesson' | 'exam' | 'meeting' | 'deadline';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  subject?: string;
  course_id?: string;
  lesson_id?: string;
  exam_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  all_day: boolean;
  color?: string;
  course_id?: string;
  lesson_id?: string;
  exam_id?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration: number; // minutes
  subject: string;
  type: 'course' | 'lesson' | 'module' | 'questions' | 'simulation' | 'flashcards' | 'revision';
  course_id?: string;
  lesson_id?: string;
  module_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number; // 0-100
  score?: number; // for questions and simulations
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  study_hours_target: number;
  study_hours_completed: number;
  tasks_target: number;
  tasks_completed: number;
  questions_target: number;
  questions_completed: number;
  flashcards_target: number;
  flashcards_completed: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleData {
  tasks: Task[];
  events: CalendarEvent[];
  study_sessions: StudySession[];
  daily_goals: DailyGoal[];
}

// Default schedule data
const defaultScheduleData: ScheduleData = {
  tasks: [
    {
      id: 'task_1',
      user_id: '2', // Estudante
      title: 'REVISAR DIREITO CONSTITUCIONAL',
      description: 'Módulo 3 - Direitos Fundamentais',
      type: 'review',
      priority: 'high',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 120,
      subject: 'DIREITO CONSTITUCIONAL TÁTICO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task_2',
      user_id: '2',
      title: 'SIMULADO DIREITO PENAL',
      description: 'Crimes contra a Administração',
      type: 'practice',
      priority: 'medium',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      subject: 'DIREITO PENAL OPERACIONAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task_3',
      user_id: '2',
      title: 'QUESTÕES RACIOCÍNIO LÓGICO',
      description: 'Lógica Proposicional - 50 questões',
      type: 'practice',
      priority: 'high',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      time: '16:30',
      duration: 90,
      subject: 'RACIOCÍNIO LÓGICO TÁTICO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  events: [
    {
      id: 'event_1',
      user_id: '2',
      title: 'AULA AO VIVO - DIREITO ADMINISTRATIVO',
      description: 'Princípios da Administração Pública',
      type: 'lesson',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // amanhã
      start_time: '19:00',
      end_time: '21:00',
      all_day: false,
      color: '#10b981',
      course_id: 'course_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'event_2',
      user_id: '2',
      title: 'SIMULADO GERAL - PF AGENTE',
      description: 'Todas as disciplinas - 120 questões',
      type: 'exam',
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // próxima semana
      start_time: '08:00',
      end_time: '12:00',
      all_day: false,
      color: '#ef4444',
      exam_id: 'exam_1',
      location: 'Online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  study_sessions: [
    {
      id: 'session_1',
      user_id: '2',
      title: 'Direitos Fundamentais - Estudo Completo',
      description: 'Módulo 3 do curso de Direito Constitucional',
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '12:00',
      duration: 120,
      subject: 'DIREITO CONSTITUCIONAL TÁTICO',
      type: 'module',
      course_id: 'course_1',
      module_id: 'module_3',
      status: 'completed',
      progress: 100,
      notes: 'Revisão completa dos artigos 5º ao 17º da CF/88',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    },
    {
      id: 'session_2',
      user_id: '2',
      title: 'Simulado - Crimes contra a Administração',
      description: '30 questões de Direito Penal',
      date: new Date().toISOString().split('T')[0],
      start_time: '14:00',
      end_time: '14:45',
      duration: 45,
      subject: 'DIREITO PENAL OPERACIONAL',
      type: 'simulation',
      status: 'completed',
      progress: 100,
      score: 85,
      notes: '26 acertos em 30 questões. Revisar peculato.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }
  ],
  daily_goals: [
    {
      id: 'goal_today',
      user_id: '2',
      date: new Date().toISOString().split('T')[0],
      study_hours_target: 6,
      study_hours_completed: 4.5,
      tasks_target: 5,
      tasks_completed: 3,
      questions_target: 100,
      questions_completed: 75,
      flashcards_target: 50,
      flashcards_completed: 32,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'goal_yesterday',
      user_id: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      study_hours_target: 6,
      study_hours_completed: 6,
      tasks_target: 4,
      tasks_completed: 4,
      questions_target: 80,
      questions_completed: 80,
      flashcards_target: 40,
      flashcards_completed: 45,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

// Load or initialize schedule data
let scheduleData: ScheduleData = { tasks: [], events: [], study_sessions: [], daily_goals: [] };
if (fs.existsSync(schedulePath)) {
  try {
    scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));
  } catch {
    scheduleData = defaultScheduleData;
    fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
  }
} else {
  scheduleData = defaultScheduleData;
  fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
}

// Helper function to save data
function saveScheduleData(): void {
  fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
}

// Helper function to generate ID
function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

// Get user's tasks
router.get('/tasks', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const date = req.query.date as string;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const priority = req.query.priority as string;

    let userTasks = scheduleData.tasks.filter(task => task.user_id === userId);

    // Apply filters
    if (date) {
      userTasks = userTasks.filter(task => task.date === date);
    }
    if (status) {
      userTasks = userTasks.filter(task => task.status === status);
    }
    if (type) {
      userTasks = userTasks.filter(task => task.type === type);
    }
    if (priority) {
      userTasks = userTasks.filter(task => task.priority === priority);
    }

    // Sort by date and time
    userTasks.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateCompare;
    });

    res.json({
      success: true,
      data: userTasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tarefas'
    });
  }
});

// Create new task
router.post('/tasks', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const {
      title,
      description,
      type,
      priority,
      date,
      time,
      duration,
      subject,
      course_id,
      lesson_id,
      exam_id
    } = req.body;

    // Validate required fields
    if (!title || !type || !priority || !date || !time || !duration) {
      res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, type, priority, date, time, duration'
      });
      return;
    }

    // Create new task
    const newTask: Task = {
      id: generateId('task'),
      user_id: userId,
      title,
      description,
      type,
      priority,
      status: 'pending',
      date,
      time,
      duration: parseInt(duration),
      subject,
      course_id,
      lesson_id,
      exam_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    scheduleData.tasks.push(newTask);
    saveScheduleData();

    res.json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tarefa'
    });
  }
});

// Update task
router.put('/tasks/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const taskId = req.params.id;

    const taskIndex = scheduleData.tasks.findIndex(
      task => task.id === taskId && task.user_id === userId
    );

    if (taskIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    const existingTask = scheduleData.tasks[taskIndex];
    
    // Update task
    const updatedTask: Task = {
      ...existingTask,
      ...req.body,
      id: existingTask.id,
      user_id: existingTask.user_id,
      created_at: existingTask.created_at,
      updated_at: new Date().toISOString()
    };

    scheduleData.tasks[taskIndex] = updatedTask;
    saveScheduleData();

    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tarefa'
    });
  }
});

// Delete task
router.delete('/tasks/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const taskId = req.params.id;

    const taskIndex = scheduleData.tasks.findIndex(
      task => task.id === taskId && task.user_id === userId
    );

    if (taskIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    scheduleData.tasks.splice(taskIndex, 1);
    saveScheduleData();

    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir tarefa'
    });
  }
});

// Mark task as complete/incomplete
router.patch('/tasks/:id/complete', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const taskId = req.params.id;
    const { completed = true, notes } = req.body;

    const taskIndex = scheduleData.tasks.findIndex(
      task => task.id === taskId && task.user_id === userId
    );

    if (taskIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    const task = scheduleData.tasks[taskIndex];
    task.status = completed ? 'completed' : 'pending';
    task.updated_at = new Date().toISOString();
    
    if (completed) {
      task.completed_at = new Date().toISOString();
    } else {
      delete task.completed_at;
    }
    
    if (notes) {
      task.notes = notes;
    }

    scheduleData.tasks[taskIndex] = task;
    saveScheduleData();

    res.json({
      success: true,
      message: completed ? 'Tarefa marcada como concluída' : 'Tarefa marcada como pendente',
      data: task
    });
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status da tarefa'
    });
  }
});

// Get calendar events
router.get('/events', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    const type = req.query.type as string;

    let userEvents = scheduleData.events.filter(event => event.user_id === userId);

    // Apply filters
    if (start_date) {
      userEvents = userEvents.filter(event => event.date >= start_date);
    }
    if (end_date) {
      userEvents = userEvents.filter(event => event.date <= end_date);
    }
    if (type) {
      userEvents = userEvents.filter(event => event.type === type);
    }

    // Sort by date and start time
    userEvents.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.start_time.localeCompare(b.start_time);
      }
      return dateCompare;
    });

    res.json({
      success: true,
      data: userEvents
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar eventos'
    });
  }
});

// Get study sessions
router.get('/study-sessions', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const date = req.query.date as string;
    const status = req.query.status as string;
    const type = req.query.type as string;

    let userSessions = scheduleData.study_sessions.filter(session => session.user_id === userId);

    // Apply filters
    if (date) {
      userSessions = userSessions.filter(session => session.date === date);
    }
    if (status) {
      userSessions = userSessions.filter(session => session.status === status);
    }
    if (type) {
      userSessions = userSessions.filter(session => session.type === type);
    }

    // Sort by date and start time
    userSessions.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.start_time.localeCompare(b.start_time);
      }
      return dateCompare;
    });

    res.json({
      success: true,
      data: userSessions
    });
  } catch (error) {
    console.error('Error getting study sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar sessões de estudo'
    });
  }
});

// Get daily goals
router.get('/daily-goals', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const date = req.query.date as string;
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;

    let userGoals = scheduleData.daily_goals.filter(goal => goal.user_id === userId);

    // Apply filters
    if (date) {
      userGoals = userGoals.filter(goal => goal.date === date);
    }
    if (start_date) {
      userGoals = userGoals.filter(goal => goal.date >= start_date);
    }
    if (end_date) {
      userGoals = userGoals.filter(goal => goal.date <= end_date);
    }

    // Sort by date (most recent first)
    userGoals.sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      success: true,
      data: userGoals
    });
  } catch (error) {
    console.error('Error getting daily goals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar metas diárias'
    });
  }
});

// Update daily goal
router.put('/daily-goals/:date', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const date = req.params.date;

    let goalIndex = scheduleData.daily_goals.findIndex(
      goal => goal.user_id === userId && goal.date === date
    );

    let goal: DailyGoal;

    if (goalIndex === -1) {
      // Create new goal
      goal = {
        id: generateId('goal'),
        user_id: userId,
        date,
        study_hours_target: 0,
        study_hours_completed: 0,
        tasks_target: 0,
        tasks_completed: 0,
        questions_target: 0,
        questions_completed: 0,
        flashcards_target: 0,
        flashcards_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      scheduleData.daily_goals.push(goal);
      goalIndex = scheduleData.daily_goals.length - 1;
    } else {
      goal = scheduleData.daily_goals[goalIndex];
    }

    // Update goal
    const updatedGoal: DailyGoal = {
      ...goal,
      ...req.body,
      id: goal.id,
      user_id: goal.user_id,
      date: goal.date,
      created_at: goal.created_at,
      updated_at: new Date().toISOString()
    };

    scheduleData.daily_goals[goalIndex] = updatedGoal;
    saveScheduleData();

    res.json({
      success: true,
      message: 'Meta diária atualizada com sucesso',
      data: updatedGoal
    });
  } catch (error) {
    console.error('Error updating daily goal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar meta diária'
    });
  }
});

// Get schedule statistics
router.get('/stats', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id.toString();
    const date = req.query.date as string || new Date().toISOString().split('T')[0];

    // Get today's data
    const todayTasks = scheduleData.tasks.filter(
      task => task.user_id === userId && task.date === date
    );
    const todaySessions = scheduleData.study_sessions.filter(
      session => session.user_id === userId && session.date === date
    );
    const todayGoals = scheduleData.daily_goals.find(
      goal => goal.user_id === userId && goal.date === date
    );

    // Calculate statistics
    const tasksTotal = todayTasks.length;
    const tasksCompleted = todayTasks.filter(task => task.status === 'completed').length;
    const tasksPending = todayTasks.filter(task => task.status === 'pending').length;

    const studyTimeCompleted = todaySessions
      .filter(session => session.status === 'completed')
      .reduce((total, session) => total + session.duration, 0);

    const questionsAnswered = todaySessions
      .filter(session => session.type === 'questions' && session.status === 'completed')
      .length;

    const averageScore = todaySessions
      .filter(session => session.score !== undefined)
      .reduce((total, session, _, arr) => {
        return arr.length > 0 ? total + (session.score || 0) / arr.length : 0;
      }, 0);

    // Weekly statistics
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weeklyTasks = scheduleData.tasks.filter(
      task => task.user_id === userId && 
              task.date >= weekStartStr && 
              task.date <= weekEndStr
    );

    const weeklySessions = scheduleData.study_sessions.filter(
      session => session.user_id === userId && 
                 session.date >= weekStartStr && 
                 session.date <= weekEndStr
    );

    const weeklyStudyTime = weeklySessions
      .filter(session => session.status === 'completed')
      .reduce((total, session) => total + session.duration, 0);

    res.json({
      success: true,
      data: {
        today: {
          date,
          tasks: {
            total: tasksTotal,
            completed: tasksCompleted,
            pending: tasksPending,
            completion_rate: tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0
          },
          study_time: {
            completed_minutes: studyTimeCompleted,
            completed_hours: studyTimeCompleted / 60,
            target_hours: todayGoals?.study_hours_target || 0,
            completion_rate: todayGoals?.study_hours_target 
              ? (studyTimeCompleted / 60 / todayGoals.study_hours_target) * 100 
              : 0
          },
          questions_answered: questionsAnswered,
          average_score: Math.round(averageScore),
          goals: todayGoals
        },
        weekly: {
          week_start: weekStartStr,
          week_end: weekEndStr,
          tasks_total: weeklyTasks.length,
          tasks_completed: weeklyTasks.filter(task => task.status === 'completed').length,
          study_time_minutes: weeklyStudyTime,
          study_time_hours: weeklyStudyTime / 60,
          sessions_completed: weeklySessions.filter(session => session.status === 'completed').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting schedule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

export default router;