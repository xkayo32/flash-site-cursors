import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  BookOpen,
  Brain,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  TrendingUp,
  User,
  FileText,
  Video,
  Layers,
  Star,
  Check,
  X,
  Edit,
  CalendarDays,
  Filter,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Activity,
  Timer,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { scheduleService, Task, ScheduleStats, StudySession, DailyGoal } from '@/services/scheduleService';
import { courseService } from '@/services/courseService';
import StudyPlanner from '@/components/StudyPlanner';
import toast from 'react-hot-toast';

// Tipos locais
interface StudyRecord {
  id: string;
  timestamp: string;
  subject: string;
  title: string;
  type: 'course' | 'lesson' | 'module' | 'questions' | 'simulation' | 'flashcards' | 'revision';
  duration: number; // em minutos
  progress?: number;
  score?: number; // para questões e simulados
  courseId?: string;
  lessonId?: string;
  icon?: string;
  completed?: boolean;
  details?: {
    questionsAnswered?: number;
    correctAnswers?: number;
    topicsReviewed?: string[];
  };
}

interface DailyStudyLog {
  date: string;
  records: StudyRecord[];
  totalMinutes: number;
  achievements: {
    coursesCompleted: number;
    lessonsWatched: number;
    questionsAnswered: number;
    averageScore: number;
  };
}


// Interface para dados reais do progresso
interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson?: string;
  estimatedTime: number;
  modules?: {
    id: string;
    title: string;
    lessonsCount: number;
    completedLessons: number;
  }[];
}

// Interface para estatísticas gerais
interface OverallStats {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  averageProgress: number;
  hoursStudied: number;
  tasksToday: number;
  tasksCompleted: number;
}



export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState<StudyRecord | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    averageProgress: 0,
    hoursStudied: 0,
    tasksToday: 0,
    tasksCompleted: 0
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '60',
    type: 'study' as 'study' | 'practice' | 'review' | 'exam',
    priority: 'medium' as 'high' | 'medium' | 'low',
    subject: ''
  });
  
  // API State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da API na montagem
  useEffect(() => {
    loadScheduleData();
  }, [selectedDate]);
  
  useEffect(() => {
    loadCoursesProgress();
  }, [scheduleStats]); // Recarregar progress quando stats mudam

  const loadCoursesProgress = async () => {
    try {
      const response = await courseService.getEnrolledCourses();
      
      // Verificar se a resposta tem a estrutura correta
      if (!response.success || !response.data || !Array.isArray(response.data)) {
        console.warn('No enrolled courses found or invalid response:', response);
        setCoursesProgress([]);
        setOverallStats({
          totalCourses: 0,
          activeCourses: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          averageProgress: 0,
          hoursStudied: scheduleStats?.weekly.study_time_hours || 0,
          tasksToday: scheduleStats?.today.tasks.total || 0,
          tasksCompleted: scheduleStats?.today.tasks.completed || 0
        });
        return;
      }
      
      const courses = response.data;
      const progress = courses.map((enrollment: any, index: number) => ({
        id: enrollment.course_id || enrollment.course?.id || `course-${index}`,
        title: enrollment.course?.title || enrollment.title,
        progress: enrollment.progress?.percentage || 0,
        totalLessons: enrollment.course?.stats?.lessons || enrollment.course?.duration_hours || 40, // Fallback para duração
        completedLessons: enrollment.progress?.completed_lessons?.length || 0,
        nextLesson: enrollment.progress?.next_lesson,
        estimatedTime: (enrollment.course?.duration_hours || 40) * 60, // Converter horas para minutos
        modules: enrollment.course?.modules?.map((m: any, moduleIndex: number) => ({
          id: m.id || `module-${index}-${moduleIndex}`,
          title: m.title,
          lessonsCount: m.lessons_count || 0,
          completedLessons: m.completed_lessons || 0
        })) || []
      }));
      setCoursesProgress(progress);
      
      // Calcular estatísticas gerais
      const stats: OverallStats = {
        totalCourses: courses.length,
        activeCourses: courses.filter((e: any) => e.status === 'active').length,
        completedCourses: courses.filter((e: any) => e.status === 'completed').length,
        totalLessons: progress.reduce((sum, c) => sum + c.totalLessons, 0),
        completedLessons: progress.reduce((sum, c) => sum + c.completedLessons, 0),
        averageProgress: courses.length > 0 ? 
          progress.reduce((sum, c) => sum + c.progress, 0) / courses.length : 0,
        hoursStudied: scheduleStats?.weekly.study_time_hours || 0,
        tasksToday: scheduleStats?.today.tasks.total || 0,
        tasksCompleted: scheduleStats?.today.tasks.completed || 0
      };
      setOverallStats(stats);
      
      // DESABILITADO TEMPORARIAMENTE: Parar criação de tarefas automáticas duplicadas
      // Se houver aulas concluídas recentemente, marcar automaticamente no cronograma
      // if (courses.length > 0) {
      //   markRecentCompletedLessons(courses);
      // }
    } catch (error) {
      console.error('Error loading courses progress:', error);
      setCoursesProgress([]);
      setOverallStats({
        totalCourses: 0,
        activeCourses: 0,
        completedCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        averageProgress: 0,
        hoursStudied: scheduleStats?.weekly.study_time_hours || 0,
        tasksToday: scheduleStats?.today.tasks.total || 0,
        tasksCompleted: scheduleStats?.today.tasks.completed || 0
      });
    }
  };

  // Função para marcar automaticamente aulas concluídas no cronograma
  // Calcular distribuição tática real baseada nas atividades do usuário
  const calculateTacticalDistribution = () => {
    if (!tasks.length) return [];
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const total = completedTasks.length;
    
    if (total === 0) return [];
    
    // Contar tarefas por tipo
    const distribution = {
      'BRIEFINGS': 0,      // Tarefas de estudo/aulas
      'INTELIGÊNCIA': 0,   // Tarefas de pesquisa/leitura  
      'TREINAMENTO': 0,    // Exercícios/práticas/simulados
      'RECONHECIMENTO': 0  // Revisões
    };
    
    completedTasks.forEach(task => {
      switch (task.type) {
        case 'study':
        case 'lesson':
          distribution['BRIEFINGS']++;
          break;
        case 'research':
        case 'reading':
          distribution['INTELIGÊNCIA']++;
          break;
        case 'practice':
        case 'exercise':
        case 'simulation':
          distribution['TREINAMENTO']++;
          break;
        case 'review':
        case 'revision':
          distribution['RECONHECIMENTO']++;
          break;
        default:
          // Classificar por palavras-chave no título/descrição
          const content = `${task.title} ${task.description}`.toLowerCase();
          if (content.includes('estudo') || content.includes('aula') || content.includes('módulo')) {
            distribution['BRIEFINGS']++;
          } else if (content.includes('exercício') || content.includes('simulado') || content.includes('questão')) {
            distribution['TREINAMENTO']++;
          } else if (content.includes('revisão') || content.includes('revisar')) {
            distribution['RECONHECIMENTO']++;
          } else {
            distribution['INTELIGÊNCIA']++;
          }
          break;
      }
    });
    
    // Converter para percentuais
    return [
      { 
        type: 'BRIEFINGS', 
        percent: Math.round((distribution['BRIEFINGS'] / total) * 100), 
        color: 'bg-blue-500',
        count: distribution['BRIEFINGS']
      },
      { 
        type: 'INTELIGÊNCIA', 
        percent: Math.round((distribution['INTELIGÊNCIA'] / total) * 100), 
        color: 'bg-green-500',
        count: distribution['INTELIGÊNCIA'] 
      },
      { 
        type: 'TREINAMENTO', 
        percent: Math.round((distribution['TREINAMENTO'] / total) * 100), 
        color: 'bg-purple-500',
        count: distribution['TREINAMENTO']
      },
      { 
        type: 'RECONHECIMENTO', 
        percent: Math.round((distribution['RECONHECIMENTO'] / total) * 100), 
        color: 'bg-accent-500',
        count: distribution['RECONHECIMENTO']
      }
    ].filter(item => item.count > 0); // Mostrar apenas tipos com atividades
  };

  // Função para alternar conclusão de tarefas
  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updatedTask = await scheduleService.updateTask(taskId, { status: newStatus });
      
      // Atualizar estado local
      setTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const markRecentCompletedLessons = async (enrollments: any[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Para cada enrollment, verificar se houve progresso recente
      for (const enrollment of enrollments) {
        if (enrollment.progress?.last_accessed && enrollment.progress?.completed_lessons?.length > 0) {
          const lastAccessedDate = new Date(enrollment.progress.last_accessed).toISOString().split('T')[0];
          
          // Se teve atividade hoje ou ontem, criar/atualizar tarefa automaticamente
          if (lastAccessedDate === today || lastAccessedDate === yesterdayStr) {
            const courseTitle = enrollment.course?.title || 'Curso';
            const completedCount = enrollment.progress.completed_lessons.length;
            const taskTitle = `${courseTitle} - ${completedCount} aula(s) concluída(s)`;
            
            // Verificar se já existe uma tarefa para este curso no dia (via API para garantir)
            const existingTasksAPI = await scheduleService.getTasksForDate(lastAccessedDate);
            const existingTasks = existingTasksAPI.filter((t: any) => 
              t.course_id === enrollment.course_id && 
              t.date === lastAccessedDate &&
              t.title.includes(courseTitle)
            );
            
            // Se não existe, criar uma tarefa marcada como concluída
            if (existingTasks.length === 0 && completedCount > 0) {
              try {
                const taskData = {
                  title: taskTitle,
                  description: `Progresso registrado automaticamente`,
                  date: lastAccessedDate,
                  time: '20:00', // Horário padrão
                  duration: completedCount * 45, // 45min por aula
                  type: 'study' as const,
                  priority: 'medium' as const,
                  subject: courseTitle,
                  course_id: enrollment.course_id
                };
                
                const createdTask = await scheduleService.createTask(taskData);
                
                // Marcar imediatamente como concluída
                await scheduleService.completeTask(createdTask.id, true, 'Progresso do curso registrado automaticamente');
                
                // Atualizar lista local de tarefas
                const completedTask = { ...createdTask, status: 'completed' as const };
                setTasks(prev => [...prev, completedTask]);
                
                console.log(`Auto-created completed task for: ${taskTitle}`);
              } catch (err) {
                console.warn('Error auto-creating task:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error marking completed lessons:', error);
    }
  };

  // Função para corrigir títulos undefined
  const fixUndefinedTitles = (tasksList: Task[]): Task[] => {
    return tasksList.map(task => {
      if (task.title.includes('undefined')) {
        // Corrigir título quebrado
        const correctedTitle = task.title.replace('undefined', task.subject || 'Curso');
        return { ...task, title: correctedTitle };
      }
      return task;
    });
  };

  // Função para limpar tarefas duplicadas
  const removeDuplicateTasks = (tasksList: Task[]): Task[] => {
    const uniqueTasks = new Map();
    
    tasksList.forEach(task => {
      // Criar chave única baseada em conteúdo relevante (não apenas ID)
      const key = `${task.course_id || 'no-course'}_${task.date}_${task.title.replace(/\d+\s*aula\(s\)\s*concluída\(s\)/, 'X aulas concluídas')}`;
      
      // Manter apenas a primeira ocorrência ou a mais recente
      if (!uniqueTasks.has(key) || new Date(task.created_at) > new Date(uniqueTasks.get(key).created_at)) {
        uniqueTasks.set(key, task);
      }
    });
    
    return Array.from(uniqueTasks.values());
  };

  const loadScheduleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Carregar dados do cronograma
      const [tasksData, sessionsData, statsData, goalsData] = await Promise.all([
        scheduleService.getTasksForDate(dateStr),
        scheduleService.getStudySessionsForDate(dateStr),
        scheduleService.getStats(dateStr),
        scheduleService.getTodayGoal()
      ]);

      // Corrigir títulos undefined e limpar tarefas duplicadas
      const tasksWithFixedTitles = fixUndefinedTitles(tasksData);
      const uniqueTasks = removeDuplicateTasks(tasksWithFixedTitles);
      setTasks(uniqueTasks);
      setStudySessions(sessionsData);
      setScheduleStats(statsData);
      setDailyGoal(goalsData);
      
      // Após carregar dados do cronograma, carregar progress dos cursos se ainda não foi carregado
      if (coursesProgress.length === 0) {
        await loadCoursesProgress();
      }
    } catch (err) {
      console.error('Error loading schedule data:', err);
      setError('Erro ao carregar dados do cronograma');
    } finally {
      setLoading(false);
    }
  };

  // Generate study history from API sessions
  const generateStudyHistory = (): DailyStudyLog[] => {
    // Agrupar sessões por data
    const sessionsByDate: { [date: string]: StudySession[] } = {};
    
    studySessions.forEach(session => {
      if (!sessionsByDate[session.date]) {
        sessionsByDate[session.date] = [];
      }
      sessionsByDate[session.date].push(session);
    });

    // Converter para formato DailyStudyLog
    return Object.entries(sessionsByDate).map(([date, sessions]) => {
      const records: StudyRecord[] = sessions.map(session => ({
        id: session.id,
        timestamp: session.created_at,
        subject: session.subject || 'Sem matéria',
        title: session.title,
        type: session.type,
        duration: session.duration,
        progress: session.progress,
        score: session.score,
        courseId: session.course_id,
        lessonId: session.lesson_id,
        completed: session.status === 'completed',
        details: session.notes ? {
          topicsReviewed: [session.notes]
        } : undefined
      }));

      const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
      const questionsRecords = records.filter(r => r.type === 'questions');
      
      return {
        date,
        records,
        totalMinutes,
        achievements: {
          coursesCompleted: records.filter(r => r.type === 'course' && r.completed).length,
          lessonsWatched: records.filter(r => r.type === 'lesson').length,
          questionsAnswered: questionsRecords.length,
          averageScore: questionsRecords.length > 0 
            ? questionsRecords.reduce((sum, r) => sum + (r.score || 0), 0) / questionsRecords.length
            : 0
        }
      };
    }).sort((a, b) => b.date.localeCompare(a.date)); // Ordenar por data decrescente
  };

  // Generate study history from sessions
  const studyHistory = generateStudyHistory();

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const days = [];
    
    // Adicionar dias do mês anterior para completar a semana
    const startDay = start.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - i - 1);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Adicionar dias do mês atual
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({ 
        date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i),
        isCurrentMonth: true 
      });
    }
    
    // Adicionar dias do próximo mês para completar a semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(end);
      date.setDate(date.getDate() + i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  // Obter tarefas do dia
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Combinar tarefas do cronograma com sessões de estudo
    const scheduledTasks = studyHistory
      .find(d => d.date === dateStr)
      ?.records || [];
    
    const userTasks = tasks
      .filter(task => task.date === dateStr)
      .map(task => ({
        id: task.id,
        startTime: task.time,
        endTime: '', // Calcular baseado na duração se necessário
        subject: task.title,
        topic: task.description || '',
        type: 'revision' as StudyRecord['type'],
        duration: task.duration,
        priority: task.priority,
        completed: task.status === 'completed'
      }));
    
    return [...scheduledTasks, ...userTasks];
  };

  // Marcar tarefa como concluída
  const toggleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const completed = task.status !== 'completed';
      const updatedTask = await scheduleService.completeTask(taskId, completed);
      
      // Atualizar estado local
      setTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));

      // Recarregar estatísticas se a tarefa foi marcada como concluída
      if (completed) {
        const statsData = await scheduleService.getStats();
        setScheduleStats(statsData);
      }
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError('Erro ao atualizar tarefa');
    }
  };

  const getRecordIcon = (type: StudyRecord['type']) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'lesson': return Video;
      case 'module': return Layers;
      case 'questions': return Brain;
      case 'simulation': return Target;
      case 'flashcards': return Star;
      case 'revision': return RotateCcw;
      default: return FileText;
    }
  };

  const getRecordColor = (type: StudyRecord['type']) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'lesson': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'module': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'questions': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'simulation': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'flashcards': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
      case 'revision': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const StudyRecordCard = ({ record }: { record: StudyRecord }) => {
    const Icon = getRecordIcon(record.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl rounded-lg relative overflow-hidden"
      >
        {/* Tactical stripe */}
        <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                getRecordColor(record.type)
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-police-body text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {new Date(record.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <h4 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white">
                  {record.title}
                </h4>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-2">
            {record.subject}
          </p>
          
          {record.progress && record.progress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                  PROGRESSO
                </span>
                <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                  {record.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-accent-500 h-full rounded-full transition-all"
                  style={{ width: `${record.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {record.score && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                  TAXA DE ACERTO
                </span>
                <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                  {record.score}%
                </span>
              </div>
              {record.details && record.details.questionsAnswered && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                  {record.details.correctAnswers}/{record.details.questionsAnswered} questões corretas
                </p>
              )}
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className="font-police-subtitle tracking-wider border-2 border-current text-accent-500"
            >
              {record.type.toUpperCase()}
            </Badge>
            <span className="text-xs font-police-numbers font-bold text-gray-600 dark:text-gray-400">
              {record.duration} MIN
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(250, 204, 21, 0.05) 35px,
            rgba(250, 204, 21, 0.05) 70px
          )`
        }}
      />
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-police-body">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
            <span className="font-police-body uppercase tracking-wider">Carregando cronograma...</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            DIÁRIO DE OPERAÇÕES TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            HISTÓRICO COMPLETO DE SUAS MISSÕES DE ESTUDO E CONQUISTAS
          </p>
          </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-police-body uppercase tracking-wider transition-all",
                viewMode === 'calendar' 
                  ? "bg-accent-500 text-black" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <CalendarDays className="w-4 h-4 inline mr-2" />
              CALENDÁRIO
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-police-body uppercase tracking-wider transition-all",
                viewMode === 'list' 
                  ? "bg-accent-500 text-black" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              LISTA
            </button>
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
            className="px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors text-sm"
          >
            <option value="all">TODAS AS TAREFAS</option>
            <option value="pending">PENDENTES</option>
            <option value="completed">CONCLUÍDAS</option>
          </select>
          
          <Button 
            variant="outline"
            className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            onClick={() => setShowPlanner(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            PLANEJAR CURSO
          </Button>
        </div>
      </motion.div>

      {/* Progresso dos Cursos e Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">CENTRAL DE COMANDO</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-police-body tracking-wider">
                  {overallStats.activeCourses} OPERAÇÕES ATIVAS • {overallStats.completedCourses} CONCLUÍDAS
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {overallStats.averageProgress >= 75 ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : overallStats.averageProgress >= 50 ? (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  ) : overallStats.averageProgress >= 25 ? (
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  <span className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {Math.round(overallStats.averageProgress)}%
                  </span>
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                  EFICIÊNCIA OPERACIONAL
                </div>
              </div>
            </div>
            
            {/* Progresso Visual */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-police-body text-gray-600 dark:text-gray-400">PROGRESSO GERAL</span>
                <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                  {overallStats.completedLessons} de {overallStats.totalLessons} missões
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent-500 to-accent-400 h-full rounded-full transition-all duration-1000 relative"
                  style={{ width: `${(overallStats.completedLessons / Math.max(overallStats.totalLessons, 1)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {overallStats.totalCourses}
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">OPERAÇÕES TOTAIS</div>
                <div className="text-xs text-gray-500 mt-1">
                  {overallStats.activeCourses} ativas
                </div>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xl font-bold font-police-numbers">
                  <span className={cn(
                    overallStats.completedLessons >= overallStats.totalLessons * 0.7 ? "text-green-600 dark:text-green-400" :
                    overallStats.completedLessons >= overallStats.totalLessons * 0.3 ? "text-yellow-600 dark:text-yellow-400" :
                    "text-red-600 dark:text-red-400"
                  )}>
                    {overallStats.completedLessons}
                  </span>
                  <span className="text-gray-500">/{overallStats.totalLessons}</span>
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">MISSÕES COMPLETAS</div>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {scheduleStats ? scheduleStats.today.study_time.completed_hours.toFixed(1) : '0.0'}h
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">TREINO HOJE</div>
                <div className="text-xs text-gray-500 mt-1">
                  {scheduleStats ? scheduleStats.weekly.study_time_hours.toFixed(1) : '0'}h esta semana
                </div>
              </div>
              <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xl font-bold font-police-numbers">
                  <span className="text-accent-500">
                    {scheduleStats ? scheduleStats.today.tasks.completed : '0'}
                  </span>
                  <span className="text-gray-500">/{scheduleStats ? scheduleStats.today.tasks.total : '0'}</span>
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">TAREFAS HOJE</div>
                <div className="text-xs text-gray-500 mt-1">
                  {scheduleStats ? Math.round(scheduleStats.today.tasks.completion_rate * 10) / 10 : 0}% taxa
                </div>
              </div>
            </div>
            
            {/* Status Operacional */}
            <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {overallStats.averageProgress >= 75 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-police-body text-green-700 dark:text-green-400 uppercase tracking-wider font-bold">
                      STATUS: OPERACIONAL ÓTIMO
                    </span>
                  </>
                ) : overallStats.averageProgress >= 50 ? (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-police-body text-yellow-700 dark:text-yellow-400 uppercase tracking-wider font-bold">
                      STATUS: OPERACIONAL BOM
                    </span>
                  </>
                ) : overallStats.averageProgress >= 25 ? (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-police-body text-orange-700 dark:text-orange-400 uppercase tracking-wider font-bold">
                      STATUS: REQUER ATENÇÃO
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-police-body text-red-700 dark:text-red-400 uppercase tracking-wider font-bold">
                      STATUS: AÇÃO IMEDIATA NECESSÁRIA
                    </span>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase">
                  ÚLTIMA ATUALIZAÇÃO: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navegação de Data */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:text-accent-500"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:text-accent-500"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="font-police-body uppercase tracking-wider"
            onClick={() => setSelectedDate(new Date())}
          >
            HOJE
          </Button>
        </div>
      </div>

      {/* Área Principal - Calendário ou Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'calendar' ? (
            /* Modo Calendário */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
                      <div key={day} className="text-center">
                        <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Dias do calendário */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => {
                      const dayTasks = getTasksForDate(day.date);
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      const completedTasks = dayTasks.filter(t => t.completed).length;
                      const totalTasks = dayTasks.length;
                      
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all",
                            day.isCurrentMonth 
                              ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50",
                            isToday && "border-accent-500 border-2",
                            dayTasks.length > 0 && "hover:border-accent-500"
                          )}
                          onClick={() => {
                            setSelectedDate(day.date);
                            if (dayTasks.length > 0) {
                              setViewMode('list');
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-sm font-police-numbers font-bold",
                              isToday ? "text-accent-500" : "text-gray-900 dark:text-white"
                            )}>
                              {day.date.getDate()}
                            </span>
                            {dayTasks.length > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-police-numbers"
                              >
                                {completedTasks}/{totalTasks}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Mini indicadores de tarefas */}
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  "h-1.5 rounded-full",
                                  task.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                                )}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayTasks.length - 3}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Legenda */}
                  <div className="mt-6 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        CONCLUÍDA
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                      <span className="font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        PENDENTE
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Modo Lista */
            <div className="space-y-4">
              {tasks
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .filter(task => {
                  if (filter === 'all') return true;
                  if (filter === 'completed') return task.status === 'completed';
                  return task.status === 'pending'; // pending
                })
                .map((task, index) => (
                  <motion.div
                    key={`${task.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer",
                          task.status === 'completed'
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300 dark:border-gray-600"
                        )}
                        onClick={() => toggleTaskCompletion(task.id)}
                        >
                          {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white font-police-subtitle">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">
                          {task.time}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                          {new Date(task.date).toLocaleDateString('pt-BR', { 
                            day: '2-digit',
                            month: 'short' 
                          }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges de status */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.subject || 'Tarefa Geral'}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        )}
                      >
                        {task.priority === 'high' ? 'ALTA' : 
                         task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'} PRIORIDADE
                      </Badge>
                      {task.duration && (
                        <Badge variant="outline" className="text-xs">
                          {task.duration}min
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              
              {/* Botão adicionar tarefa */}
              <button 
                onClick={() => setShowNewTaskModal(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-accent-500 hover:text-accent-500 transition-all duration-300 flex items-center justify-center gap-2 font-police-body uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                ADICIONAR NOVA MISSÃO
              </button>
            </div>
          )}
        </div>

        {/* Coluna Lateral - Estatísticas e Progresso Tático */}
        <div className="space-y-6">
          {/* Estatísticas de Estudo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 dark:border-accent-500/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-accent-500" />
                  ESTATÍSTICAS OPERACIONAIS
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      HORAS SEMANA
                    </span>
                    <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                      {scheduleStats ? scheduleStats.weekly.study_time_hours.toFixed(1) : '0'}H
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      TAREFAS HOJE
                    </span>
                    <span className="font-police-numbers font-bold text-accent-500">
                      {scheduleStats ? scheduleStats.today.tasks.completed : '0'}/{scheduleStats ? scheduleStats.today.tasks.total : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      QUESTÕES HOJE
                    </span>
                    <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                      {scheduleStats ? scheduleStats.today.questions_answered : '0'}
                    </span>
                  </div>
                </div>
              
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      DISTRIBUIÇÃO TÁTICA
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tasks.filter(t => t.status === 'completed').length} MISSÕES CONCLUÍDAS
                    </span>
                  </div>
                  <div className="space-y-3">
                    {calculateTacticalDistribution().length > 0 ? (
                      calculateTacticalDistribution().map((item) => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300">
                              {item.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.count}
                              </span>
                              <span className="text-xs font-police-numbers font-bold text-gray-900 dark:text-white">
                                {item.percent}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={cn("h-full rounded-full transition-all", item.color)}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                          NENHUMA MISSÃO CONCLUÍDA
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Complete tarefas para ver a distribuição tática
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progresso por Curso */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 dark:border-accent-500/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Layers className="w-5 h-5 text-accent-500" />
                  PROGRESSO POR CURSO
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {coursesProgress.slice(0, 5).map((course, index) => (
                  <div key={`${course.id}-${index}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                          {course.completedLessons}/{course.totalLessons} AULAS • {Math.round(course.estimatedTime / 60)}H TOTAL
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "font-police-numbers font-bold",
                          course.progress >= 50 ? "text-green-700 dark:text-green-400" :
                          course.progress >= 30 ? "text-yellow-700 dark:text-yellow-400" :
                          "text-red-700 dark:text-red-400"
                        )}
                      >
                        {Math.round(course.progress)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          course.progress >= 50 ? "bg-green-500" :
                          course.progress >= 30 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                {coursesProgress.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                      NENHUM CURSO MATRICULADO
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 font-police-body uppercase tracking-wider hover:text-accent-500"
                      onClick={() => window.location.href = '/student/courses'}
                    >
                      EXPLORAR CURSOS
                    </Button>
                  </div>
                )}
                
                {coursesProgress.length > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 font-police-body uppercase tracking-wider hover:text-accent-500"
                    onClick={() => window.location.href = '/student/courses'}
                  >
                    VER TODOS OS CURSOS ({coursesProgress.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recomendações da IA Militar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-2 border-accent-500/50 relative overflow-hidden">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 dark:border-accent-500/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent-500" />
                  INTELIGÊNCIA TÁTICA IA
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">
                        INTENSIFICAR RACIOCÍNIO LÓGICO
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                        PROGRESSO ABAIXO DO ESPERADO. +30MIN DIÁRIOS RECOMENDADOS.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">
                        EXCELENTE EM COMUNICAÇÃO TÁTICA
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                        CONTINUE ASSIM. FOQUE EM QUESTÕES AVANÇADAS.
                      </p>
                    </div>
                  </div>
                </div>
              
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">
                        HORA DA SIMULAÇÃO TÁTICA!
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                        TREINAMENTO INTENSO NESTA SEMANA. TESTE SUAS HABILIDADES.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Tactical Command Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-white relative overflow-hidden border border-accent-500/20"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(250, 204, 21, 0.1) 20px,
              rgba(250, 204, 21, 0.1) 40px
            )`
          }} />
        </div>
        
        {/* Corner tactical accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-accent-500/30"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent-500/30"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent-500/30"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent-500/30"></div>
        
        <div className="relative z-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-accent-500 mr-2" />
                <span className="text-3xl font-bold font-police-numbers text-accent-500">
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
              <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                MISSÕES CONCLUÍDAS
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-8 h-8 text-accent-500 mr-2" />
                <span className="text-3xl font-bold font-police-numbers text-accent-500">
                  {Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(1, tasks.length)) * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                EFICIÊNCIA TÁTICA
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-8 h-8 text-accent-500 mr-2" />
                <span className="text-3xl font-bold font-police-numbers text-accent-500">
                  {tasks.filter(t => t.status === 'pending').length}
                </span>
              </div>
              <p className="text-sm text-gray-300 font-police-body uppercase tracking-wider">
                OPERAÇÕES ATIVAS
              </p>
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-8 bg-accent-500 mr-3"></div>
              <Calendar className="w-10 h-10 text-accent-500 mr-3" />
              <div className="w-2 h-8 bg-accent-500"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-police-title uppercase tracking-wider">
              CENTRO DE COMANDO TÁTICO
            </h2>
            
            <p className="text-gray-300 mb-2 max-w-3xl mx-auto font-police-body tracking-wider">
              MONITORE SEU PROGRESSO E MANTENHA O FOCO NOS OBJETIVOS
            </p>
            
            <div className="w-24 h-1 bg-accent-500 mx-auto"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setShowPlanner(true)}
              className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black hover:text-white dark:hover:text-white font-police-body font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl min-w-[200px]"
            >
              <Trophy className="w-5 h-5 mr-2" />
              CRIAR PLANO TÁTICO
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const today = new Date().toLocaleDateString('pt-BR');
                const completedToday = tasks.filter(t => {
                  if (!t.completed_at) return false;
                  const completedDate = new Date(t.completed_at).toLocaleDateString('pt-BR');
                  return completedDate === today;
                });
                
                toast.success(`📊 RELATÓRIO TÁTICO\n\n✅ ${completedToday.length} missões concluídas hoje\n⏳ ${tasks.filter(t => t.status === 'pending').length} operações pendentes\n🎯 ${Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(1, tasks.length)) * 100)}% eficiência geral`, {
                  duration: 8000,
                  style: {
                    background: '#14242f',
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-line'
                  }
                });
              }}
              className="border-accent-500/50 hover:border-accent-500 text-white hover:bg-accent-500/10 font-police-body font-semibold uppercase tracking-wider transition-all duration-300 min-w-[200px]"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              RELATÓRIO TÁTICO
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 font-police-body uppercase">STATUS OPERACIONAL:</span>
              <span className="text-sm font-bold text-accent-500 font-police-numbers">
                {tasks.filter(t => t.status === 'completed').length}/{tasks.length} CONCLUÍDAS
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(1, tasks.length)) * 100)}%` 
                }}
                transition={{ duration: 1, delay: 0.8 }}
                className="bg-gradient-to-r from-accent-500 to-yellow-400 h-full rounded-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Study Planner Modal */}
      {showPlanner && (
        <StudyPlanner onClose={() => {
          setShowPlanner(false);
          loadScheduleData();
          loadCoursesProgress();
        }} />
      )}

      {/* Modal de Nova Tarefa */}
      <AnimatePresence>
        {showNewTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNewTaskModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border-2 border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
                  NOVA MISSÃO TÁTICA
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTaskModal(false)}
                  className="hover:text-accent-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    TÍTULO DA MISSÃO
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    placeholder="DIGITE O TÍTULO..."
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    BRIEFING DA MISSÃO
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500 resize-none"
                    rows={3}
                    placeholder="Digite a descrição..."
                  />
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      DATA
                    </label>
                    <input
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      HORÁRIO
                    </label>
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    />
                  </div>
                </div>

                {/* Tipo e Prioridade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      TIPO DE OPERAÇÃO
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    >
                      <option value="study">ESTUDO TÁTICO</option>
                      <option value="practice">PRÁTICA OPERACIONAL</option>
                      <option value="review">REVISÃO ESTRATÉGICA</option>
                      <option value="exam">SIMULAÇÃO DE COMBATE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      NÍVEL DE PRIORIDADE
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    >
                      <option value="high">CRÍTICA</option>
                      <option value="medium">PADRÃO</option>
                      <option value="low">BAIXA</option>
                    </select>
                  </div>
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    DURAÇÃO (MINUTOS)
                  </label>
                  <input
                    type="number"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                    min="15"
                    step="15"
                  />
                </div>

                {/* Curso/Matéria */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    CURSO / MATÉRIA
                  </label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                  >
                    <option value="">SELECIONE O CURSO...</option>
                    {coursesProgress.map((course, index) => (
                      <option key={`${course.id}-option-${index}`} value={course.title}>
                        {course.title}
                      </option>
                    ))}
                    <option value="REVISÃO GERAL">REVISÃO GERAL</option>
                    <option value="SIMULAÇÃO">SIMULAÇÃO</option>
                    <option value="QUESTÕES">QUESTÕES</option>
                  </select>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const taskData = {
                        title: newTask.title,
                        description: newTask.description,
                        date: newTask.date,
                        time: newTask.time,
                        duration: parseInt(newTask.duration),
                        type: newTask.type,
                        priority: newTask.priority,
                        subject: newTask.subject
                      };

                      const createdTask = await scheduleService.createTask(taskData);
                      
                      // Atualizar estado local
                      setTasks(prev => [...prev, createdTask]);
                      
                      // Recarregar estatísticas
                      const statsData = await scheduleService.getStats();
                      setScheduleStats(statsData);
                      
                      // Resetar o formulário
                      setNewTask({
                        title: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        time: '09:00',
                        duration: '60',
                        type: 'study',
                        priority: 'medium',
                        subject: ''
                      });
                      
                      setShowNewTaskModal(false);
                    } catch (err) {
                      console.error('Error creating task:', err);
                      setError('Erro ao criar tarefa');
                    }
                  }}
                  disabled={!newTask.title || !newTask.subject}
                  className="flex-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  CRIAR MISSÃO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}