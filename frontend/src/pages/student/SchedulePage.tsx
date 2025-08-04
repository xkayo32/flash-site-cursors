import { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
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

interface ExamInfo {
  name: string;
  date: string;
  daysLeft: number;
  totalTopics: number;
  completedTopics: number;
  subjects: {
    name: string;
    weight: number;
    progress: number;
    hoursNeeded: number;
  }[];
}

interface Task {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: 'study' | 'practice' | 'review' | 'exam';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  time: string;
  duration: number;
}

// Dados mockados
const examInfo: ExamInfo = {
  name: 'OPERAÇÃO PF - AGENTE TÁTICO',
  date: '2024-05-15',
  daysLeft: 117,
  totalTopics: 156,
  completedTopics: 42,
  subjects: [
    { name: 'DIREITO CONSTITUCIONAL TÁTICO', weight: 20, progress: 35, hoursNeeded: 120 },
    { name: 'DIREITO PENAL OPERACIONAL', weight: 15, progress: 28, hoursNeeded: 90 },
    { name: 'DIREITO ADMINISTRATIVO', weight: 15, progress: 22, hoursNeeded: 90 },
    { name: 'INTELIGÊNCIA DIGITAL', weight: 10, progress: 45, hoursNeeded: 60 },
    { name: 'COMUNICAÇÃO TÁTICA', weight: 10, progress: 55, hoursNeeded: 60 },
    { name: 'RACIOCÍNIO LÓGICO TÁTICO', weight: 10, progress: 18, hoursNeeded: 60 },
    { name: 'CONTABILIDADE OPERACIONAL', weight: 10, progress: 15, hoursNeeded: 60 },
    { name: 'ECONOMIA ESTRATÉGICA', weight: 10, progress: 12, hoursNeeded: 60 }
  ]
};

// Dados mockados do histórico de estudos
const studyHistory: DailyStudyLog[] = [
  {
    date: new Date().toISOString().split('T')[0],
    records: [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        subject: 'DIREITO CONSTITUCIONAL TÁTICO',
        title: 'Módulo 3 - Direitos Fundamentais Completo',
        type: 'module',
        duration: 120,
        progress: 100,
        courseId: 'const-001'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        subject: 'DIREITO PENAL OPERACIONAL',
        title: 'Simulado - Crimes contra a Administração',
        type: 'simulation',
        duration: 45,
        score: 85,
        details: {
          questionsAnswered: 30,
          correctAnswers: 26
        }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        subject: 'INTELIGÊNCIA DIGITAL',
        title: 'Aula 15 - Segurança da Informação',
        type: 'lesson',
        duration: 45,
        progress: 100,
        courseId: 'info-001',
        lessonId: 'info-001-15'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        subject: 'RACIOCÍNIO LÓGICO TÁTICO',
        title: 'Questões - Lógica Proposicional',
        type: 'questions',
        duration: 30,
        score: 78,
        details: {
          questionsAnswered: 25,
          correctAnswers: 20
        }
      }
    ],
    totalMinutes: 240,
    achievements: {
      coursesCompleted: 0,
      lessonsWatched: 1,
      questionsAnswered: 55,
      averageScore: 82
    }
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // ontem
    records: [
      {
        id: '5',
        timestamp: new Date(Date.now() - 86400000 - 3600000).toISOString(),
        subject: 'DIREITO ADMINISTRATIVO',
        title: 'Curso Completo - Princípios da Administração',
        type: 'course',
        duration: 180,
        progress: 100,
        courseId: 'admin-001'
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 86400000 - 7200000).toISOString(),
        subject: 'CONTABILIDADE OPERACIONAL',
        title: 'Revisão - Balanço Patrimonial',
        type: 'revision',
        duration: 60
      }
    ],
    totalMinutes: 240,
    achievements: {
      coursesCompleted: 1,
      lessonsWatched: 0,
      questionsAnswered: 0,
      averageScore: 0
    }
  }
];

// Estatísticas de estudo baseadas no histórico real
const studyStats = {
  totalHours: 142,
  weeklyTotal: 1680, // minutos na semana
  todayTotal: 240, // minutos hoje
  streak: 15,
  questionsTotal: 1250,
  averageScore: 82,
  completedModules: 24,
  completedLessons: 156,
  strongSubjects: ['DIREITO CONSTITUCIONAL TÁTICO', 'INTELIGÊNCIA DIGITAL'],
  weakSubjects: ['RACIOCÍNIO LÓGICO TÁTICO', 'ECONOMIA ESTRATÉGICA'],
  averageDaily: 4.5
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState<StudyRecord | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
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
  const [tasks, setTasks] = useState<Task[]>([]);

  const getBlockIcon = (type: 'video' | 'reading' | 'practice' | 'review' | 'exam') => {
    switch (type) {
      case 'video': return Video;
      case 'reading': return FileText;
      case 'practice': return Brain;
      case 'review': return BookOpen;
      case 'exam': return Trophy;
    }
  };

  const getBlockColor = (type: 'video' | 'reading' | 'practice' | 'review' | 'exam') => {
    switch (type) {
      case 'video': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'reading': return 'bg-green-100 border-green-300 text-green-700';
      case 'practice': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'review': return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'exam': return 'bg-red-100 border-red-300 text-red-700';
    }
  };

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
    // Combinar tarefas do cronograma com tarefas criadas pelo usuário
    const scheduledTasks = studyHistory
      .find(d => new Date(d.date).toDateString() === date.toDateString())
      ?.records || [];
    
    const userTasks = tasks
      .filter(task => new Date(task.date).toDateString() === date.toDateString())
      .map(task => ({
        id: task.id,
        startTime: task.time,
        endTime: '', // Calcular baseado na duração se necessário
        subject: task.title,
        topic: task.description || '',
        type: 'revision' as StudyRecord['type'],
        duration: task.duration,
        priority: task.priority,
        completed: task.completed
      }));
    
    return [...scheduledTasks, ...userTasks];
  };

  // Marcar tarefa como concluída
  const toggleTaskComplete = (taskId: string) => {
    // Atualizar tarefas do usuário
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    // Aqui será integrado com o backend futuramente
    console.log('Marcar tarefa como concluída:', taskId);
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
          
          <div className="mt-4 flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={cn(
                "font-police-subtitle tracking-wider border-2 border-current",
                block.priority === 'high' && "text-red-700 dark:text-red-400",
                block.priority === 'medium' && "text-yellow-700 dark:text-yellow-400",
                block.priority === 'low' && "text-green-700 dark:text-green-400"
              )}
            >
              {block.priority === 'high' ? 'CRÍTICA' : block.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
            </Badge>
            <span className="text-xs font-police-numbers font-bold text-gray-600 dark:text-gray-400">
              {block.duration} MIN
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
          >
            <Download className="w-4 h-4 mr-2" />
            EXPORTAR RELATÓRIO
          </Button>
        </div>
      </motion.div>

      {/* Informações do Concurso */}
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
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Target className="w-5 h-5 text-gray-700 dark:text-accent-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">{examInfo.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-police-body tracking-wider">
                  DATA DA OPERAÇÃO: {new Date(examInfo.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white font-police-numbers">{examInfo.daysLeft}</div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">DIAS PARA MISSÃO</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {Math.round((examInfo.completedTopics / examInfo.totalTopics) * 100)}%
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">PROGRESSO GERAL</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {examInfo.completedTopics}/{examInfo.totalTopics}
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">ALVOS NEUTRALIZADOS</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                  {studyStats.todayTotal / 60}h
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">MÉDIA DIÁRIA</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-accent-500 font-police-numbers">
                  {studyStats.streak}
                </div>
                <div className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">SEQUÊNCIA ATIVA</div>
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
                            {tasks.length > 0 && (
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
                            {tasks.slice(0, 3).map((task, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  "h-1.5 rounded-full",
                                  task.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                                )}
                              />
                            ))}
                            {tasks.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{tasks.length - 3}
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
            <div className="space-y-6">
              {studyHistory
                .filter(day => {
                  if (filter === 'all') return true;
                  // No diário todos os registros são de atividades já realizadas
                  return filter === 'completed';
                })
                .map((day) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
                      <CardHeader className="border-b-2 border-gray-200 dark:border-accent-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                              {new Date(day.date).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              }).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body tracking-wider">
                              {day.completedHours}/{day.totalHours}H EXECUTADAS
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">
                              {Math.round((day.completedHours / day.totalHours) * 100)}%
                            </div>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-accent-500 h-full rounded-full transition-all"
                                style={{ width: `${(day.completedHours / day.totalHours) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4">
                        {(day.records || [])
                          .map((record) => (
                            <div key={record.id} className="relative">
                              <StudyRecordCard record={record} />
                              {/* Botão de marcar como concluído */}
                              <button
                                onClick={() => toggleTaskComplete(record.id)}
                                className={cn(
                                  "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                  "bg-green-500 border-green-500"
                                )}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        
                        <button className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-accent-500 hover:text-accent-500 transition-all duration-300 flex items-center justify-center gap-2 font-police-body uppercase tracking-wider">
                          <Plus className="w-4 h-4" />
                          ADICIONAR TAREFA
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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
                      HORAS PLANEJADAS
                    </span>
                    <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                      {studyStats.totalHours}H
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      MÓDULOS COMPLETOS
                    </span>
                    <span className="font-police-numbers font-bold text-accent-500">
                      {studyStats.completedModules}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      MÉDIA DE ACERTO
                    </span>
                    <span className="font-police-numbers font-bold text-gray-900 dark:text-white">
                      {studyStats.averageScore}%
                    </span>
                  </div>
                </div>
              
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                      DISTRIBUIÇÃO TÁTICA
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { type: 'BRIEFINGS', percent: 35, color: 'bg-blue-500' },
                      { type: 'INTELIGÊNCIA', percent: 25, color: 'bg-green-500' },
                      { type: 'TREINAMENTO', percent: 30, color: 'bg-purple-500' },
                      { type: 'RECONHECIMENTO', percent: 10, color: 'bg-accent-500' }
                    ].map((item) => (
                      <div key={item.type} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {item.type}
                          </span>
                          <span className="text-xs font-police-numbers font-bold text-gray-900 dark:text-white">
                            {item.percent}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={cn("h-full rounded-full transition-all", item.color)}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progresso por Disciplina Tática */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-gray-200 dark:border-accent-500/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Layers className="w-5 h-5 text-accent-500" />
                  PROGRESSO POR DISCIPLINA
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {examInfo.subjects.slice(0, 5).map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-police-body uppercase tracking-wider text-gray-900 dark:text-white">
                          {subject.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                          {subject.hoursNeeded}H • PESO: {subject.weight}%
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "font-police-numbers font-bold",
                          subject.progress >= 50 ? "text-green-700 dark:text-green-400" :
                          subject.progress >= 30 ? "text-yellow-700 dark:text-yellow-400" :
                          "text-red-700 dark:text-red-400"
                        )}
                      >
                        {subject.progress}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          subject.progress >= 50 ? "bg-green-500" :
                          subject.progress >= 30 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4 font-police-body uppercase tracking-wider hover:text-accent-500"
                >
                  VER TODAS AS DISCIPLINAS
                </Button>
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

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-white text-center relative overflow-hidden"
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
        
        <div className="relative z-10">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-accent-500" />
          <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-wider">
MANTENHA O FOCO E A DISCIPLINA MILITAR!
        </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body tracking-wider">
              SEU PLANO TÁTICO É ATUALIZADO DIARIAMENTE PELA IA PARA MAXIMIZAR SUAS CHANCES DE SUCESSO
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider"
              >
                <Trophy className="w-5 h-5 mr-2" />
                VER METAS DA SEMANA
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-300 text-white hover:bg-white hover:text-gray-900 font-police-body font-semibold uppercase tracking-wider"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                RELATÓRIO DETALHADO
              </Button>
            </div>
        </div>
      </motion.div>

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

                {/* Matéria */}
                <div>
                  <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    ÁREA OPERACIONAL
                  </label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors focus:outline-none focus:border-accent-500"
                  >
                    <option value="">SELECIONE A ÁREA...</option>
                    {examInfo.subjects.map((subject) => (
                      <option key={subject.name} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
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
                  onClick={() => {
                    // Aqui você adicionaria a lógica para salvar a tarefa
                    console.log('Nova tarefa:', newTask);
                    
                    // Adicionar tarefa ao estado de tarefas
                    setTasks([...tasks, {
                      id: (tasks.length + 1).toString(),
                      date: newTask.date,
                      title: newTask.title,
                      description: newTask.description,
                      type: newTask.type,
                      priority: newTask.priority,
                      completed: false,
                      time: newTask.time,
                      duration: parseInt(newTask.duration)
                    }]);
                    
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