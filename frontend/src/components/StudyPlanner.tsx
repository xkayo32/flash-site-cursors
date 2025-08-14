import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  BookOpen,
  Target,
  Zap,
  Settings,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Brain,
  Layers,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { courseService } from '@/services/courseService';
import { scheduleService } from '@/services/scheduleService';
import toast from 'react-hot-toast';

interface StudyPlan {
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  modules: {
    id: string;
    name: string;
    lessons: number;
    completed: number;
  }[];
  schedule: {
    startDate: string;
    endDate: string;
    daysPerWeek: number[];
    hoursPerDay: number;
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
    breakDays: string[];
  };
  estimatedCompletion: string;
  dailyGoal: number;
}

interface PlannerSettings {
  daysPerWeek: number[];
  hoursPerDay: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  studyMethod: 'intensive' | 'balanced' | 'relaxed';
  breakInterval: number; // minutos de pausa a cada X minutos
  includeWeekends: boolean;
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'D' },
  { id: 1, name: 'Segunda', short: 'S' },
  { id: 2, name: 'Terça', short: 'T' },
  { id: 3, name: 'Quarta', short: 'Q' },
  { id: 4, name: 'Quinta', short: 'Q' },
  { id: 5, name: 'Sexta', short: 'S' },
  { id: 6, name: 'Sábado', short: 'S' }
];

const TIME_SLOTS = {
  morning: { start: '06:00', end: '12:00', label: 'Manhã' },
  afternoon: { start: '12:00', end: '18:00', label: 'Tarde' },
  evening: { start: '18:00', end: '22:00', label: 'Noite' },
  night: { start: '22:00', end: '02:00', label: 'Madrugada' }
};

const STUDY_METHODS = {
  intensive: {
    name: 'INTENSIVO',
    description: '4-6 horas/dia, foco total',
    hoursPerDay: 5,
    daysPerWeek: [1, 2, 3, 4, 5, 6],
    breakInterval: 50
  },
  balanced: {
    name: 'EQUILIBRADO',
    description: '2-3 horas/dia, ritmo sustentável',
    hoursPerDay: 2.5,
    daysPerWeek: [1, 2, 3, 4, 5],
    breakInterval: 45
  },
  relaxed: {
    name: 'RELAXADO',
    description: '1-2 horas/dia, sem pressa',
    hoursPerDay: 1.5,
    daysPerWeek: [1, 3, 5],
    breakInterval: 30
  }
};

export default function StudyPlanner({ onClose }: { onClose?: () => void }) {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [settings, setSettings] = useState<PlannerSettings>({
    daysPerWeek: [1, 2, 3, 4, 5],
    hoursPerDay: 2,
    preferredTime: 'evening',
    studyMethod: 'balanced',
    breakInterval: 45,
    includeWeekends: false
  });
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'configure' | 'review'>('select');

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getEnrolledCourses();
      
      // Verificar se a resposta tem a estrutura correta
      if (response.success && response.data && Array.isArray(response.data)) {
        // Filtrar apenas cursos ativos (não concluídos)
        const activeCourses = response.data.filter((enrollment: any) => {
          const progress = enrollment.progress?.percentage || 0;
          return progress < 100; // Apenas cursos com menos de 100% de progresso
        });
        setCourses(activeCourses);
      } else {
        console.warn('No enrolled courses found or invalid response:', response);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: keyof typeof STUDY_METHODS) => {
    const methodConfig = STUDY_METHODS[method];
    setSettings({
      ...settings,
      studyMethod: method,
      hoursPerDay: methodConfig.hoursPerDay,
      daysPerWeek: methodConfig.daysPerWeek,
      breakInterval: methodConfig.breakInterval
    });
  };

  const calculateStudyPlan = () => {
    if (!selectedCourse) return;

    try {
      const totalLessons = selectedCourse.stats?.total_lessons || 30;
      const completedLessons = selectedCourse.progress?.completed_lessons || 0;
      const remainingLessons = Math.max(1, totalLessons - completedLessons); // Mínimo de 1 aula
      
      // Calcular tempo médio por aula (assumindo 45 min por aula)
      const minutesPerLesson = 45;
      const totalMinutesNeeded = remainingLessons * minutesPerLesson;
      const hoursNeeded = totalMinutesNeeded / 60;
      
      // Calcular dias necessários (mínimo de 1 semana)
      const hoursPerWeek = Math.max(1, settings.hoursPerDay * settings.daysPerWeek.length);
      const weeksNeeded = Math.max(1, Math.ceil(hoursNeeded / hoursPerWeek));
      
      // Calcular data de conclusão estimada com validação
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      // Garantir que a data é válida
      if (isNaN(startDate.getTime())) {
        throw new Error('Data de início inválida');
      }
      
      endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
      
      // Validar data final
      if (isNaN(endDate.getTime())) {
        throw new Error('Data de conclusão inválida');
      }

      const plan: StudyPlan = {
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        totalLessons,
        completedLessons,
        modules: selectedCourse.modules?.map((m: any) => ({
          id: m.id,
          name: m.title,
          lessons: m.lessons_count || 0,
          completed: m.completed_lessons || 0
        })) || [],
        schedule: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          daysPerWeek: settings.daysPerWeek,
          hoursPerDay: settings.hoursPerDay,
          preferredTime: settings.preferredTime,
          breakDays: []
        },
        estimatedCompletion: endDate.toISOString().split('T')[0],
        dailyGoal: Math.max(1, Math.ceil(remainingLessons / (weeksNeeded * settings.daysPerWeek.length)))
      };

      setStudyPlan(plan);
      setStep('review');
    } catch (error) {
      console.error('Erro ao calcular plano de estudos:', error);
      toast.error('Erro ao calcular plano. Tente novamente.');
    }
  };

  const generateTasks = async () => {
    if (!studyPlan) return;

    try {
      setLoading(true);
      const tasks = [];
      const startDate = new Date(studyPlan.schedule.startDate);
      const timeSlot = TIME_SLOTS[studyPlan.schedule.preferredTime];
      
      // ID único para este plano
      const studyPlanId = `plan_${Date.now()}_${studyPlan.courseId}`;
      
      let currentDate = new Date(startDate);
      let lessonIndex = 0;
      const totalLessonsToSchedule = studyPlan.totalLessons - studyPlan.completedLessons;

      while (lessonIndex < totalLessonsToSchedule) {
        // Verificar se é um dia de estudo
        if (studyPlan.schedule.daysPerWeek.includes(currentDate.getDay())) {
          // Criar tarefas para o dia
          const lessonsPerDay = studyPlan.dailyGoal;
          
          for (let i = 0; i < lessonsPerDay && lessonIndex < totalLessonsToSchedule; i++) {
            const moduleIndex = Math.floor(lessonIndex / (totalLessonsToSchedule / Math.max(1, studyPlan.modules.length)));
            const module = studyPlan.modules[moduleIndex] || studyPlan.modules[0] || { name: 'Módulo Geral' };
            const moduleName = module?.name || 'Módulo Geral';
            
            const task = {
              title: `${studyPlan.courseName || 'Curso'} - ${moduleName} - Aula ${lessonIndex + 1}`,
              description: `Estudar aula ${lessonIndex + 1} do módulo ${moduleName}`,
              type: 'study' as const,
              priority: 'medium' as const,
              date: currentDate.toISOString().split('T')[0],
              time: timeSlot.start,
              duration: 45,
              subject: studyPlan.courseName,
              course_id: studyPlan.courseId,
              study_plan_id: studyPlanId, // Identificador único do plano
              tags: ['plano-estudos', 'ia-generated']
            };
            
            tasks.push(task);
            lessonIndex++;
          }
        }
        
        // Avançar para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Criar as tarefas no backend
      for (const task of tasks) {
        await scheduleService.createTask(task);
      }

      toast.success(`${tasks.length} tarefas criadas com sucesso!`);
      
      // Resetar e fechar
      setStep('select');
      setSelectedCourse(null);
      setStudyPlan(null);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast.error('Erro ao criar tarefas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                PLANEJADOR DE ESTUDOS TÁTICO
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-police-body mt-1">
                Configure seu plano de estudos personalizado com IA
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {['select', 'configure', 'review'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-police-numbers font-bold",
                    step === s ? "bg-accent-500 text-black" : 
                    ['select', 'configure', 'review'].indexOf(step) > index ? "bg-green-500 text-white" :
                    "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  )}
                >
                  {['select', 'configure', 'review'].indexOf(step) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={cn(
                    "w-24 h-1 mx-2",
                    ['select', 'configure', 'review'].indexOf(step) > index ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Course */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider mb-4">
                  SELECIONE O CURSO PARA PLANEJAR
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedCourse(course)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          selectedCourse?.id === course.id
                            ? "border-accent-500 bg-accent-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-accent-500/50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white font-police-subtitle uppercase">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {course.instructor?.name || 'Instrutor'}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1">
                                <Layers className="h-4 w-4 text-gray-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {course.stats?.modules || 0} módulos
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {course.stats?.total_lessons || 0} aulas
                                </span>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {course.progress?.percentage || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-accent-500 h-full rounded-full transition-all"
                                  style={{ width: `${course.progress?.percentage || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {selectedCourse?.id === course.id && (
                            <CheckCircle className="h-5 w-5 text-accent-500 ml-3" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    CANCELAR
                  </Button>
                  <Button
                    onClick={() => setStep('configure')}
                    disabled={!selectedCourse}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body"
                  >
                    PRÓXIMO
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Configure */}
            {step === 'configure' && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                  CONFIGURE SEU PLANO DE ESTUDOS
                </h3>

                {/* Study Method Selection */}
                <div>
                  <label className="text-sm font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 block">
                    MÉTODO DE ESTUDO
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(STUDY_METHODS).map(([key, method]) => (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleMethodSelect(key as keyof typeof STUDY_METHODS)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          settings.studyMethod === key
                            ? "border-accent-500 bg-accent-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-accent-500/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white font-police-subtitle">
                            {method.name}
                          </h4>
                          {settings.studyMethod === key && (
                            <CheckCircle className="h-5 w-5 text-accent-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {method.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Days of Week */}
                <div>
                  <label className="text-sm font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 block">
                    DIAS DE ESTUDO
                  </label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => {
                          const newDays = settings.daysPerWeek.includes(day.id)
                            ? settings.daysPerWeek.filter(d => d !== day.id)
                            : [...settings.daysPerWeek, day.id];
                          setSettings({ ...settings, daysPerWeek: newDays });
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg font-bold transition-all",
                          settings.daysPerWeek.includes(day.id)
                            ? "bg-accent-500 text-black"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
                        )}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours per Day */}
                <div>
                  <label className="text-sm font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 block">
                    HORAS POR DIA: {settings.hoursPerDay}h
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={settings.hoursPerDay}
                    onChange={(e) => setSettings({ ...settings, hoursPerDay: parseFloat(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1h</span>
                    <span>8h</span>
                  </div>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="text-sm font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 block">
                    HORÁRIO PREFERIDO
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(TIME_SLOTS).map(([key, slot]) => (
                      <button
                        key={key}
                        onClick={() => setSettings({ ...settings, preferredTime: key as any })}
                        className={cn(
                          "px-4 py-2 rounded-lg font-police-body text-sm transition-all",
                          settings.preferredTime === key
                            ? "bg-accent-500 text-black"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                        )}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                  >
                    VOLTAR
                  </Button>
                  <Button
                    onClick={calculateStudyPlan}
                    className="bg-accent-500 hover:bg-accent-600 text-white font-police-body"
                  >
                    CALCULAR PLANO
                    <Brain className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && studyPlan && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider">
                  REVISÃO DO PLANO DE ESTUDOS
                </h3>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold font-police-title uppercase">
                        {studyPlan.courseName}
                      </h4>
                      <p className="text-gray-300 text-sm mt-1">
                        Plano personalizado com IA
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-accent-500" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Aulas Restantes</p>
                      <p className="text-2xl font-bold font-police-numbers">
                        {studyPlan.totalLessons - studyPlan.completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Dias de Estudo</p>
                      <p className="text-2xl font-bold font-police-numbers">
                        {studyPlan.schedule.daysPerWeek.length}/semana
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Horas/Dia</p>
                      <p className="text-2xl font-bold font-police-numbers">
                        {studyPlan.schedule.hoursPerDay}h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Conclusão</p>
                      <p className="text-2xl font-bold font-police-numbers">
                        {new Date(studyPlan.estimatedCompletion).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-3 font-police-subtitle uppercase">
                    DETALHES DO CRONOGRAMA
                  </h5>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Início:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {new Date(studyPlan.schedule.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Término Estimado:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {new Date(studyPlan.estimatedCompletion).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Meta Diária:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {studyPlan.dailyGoal} aulas/dia
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Horário:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {TIME_SLOTS[studyPlan.schedule.preferredTime].label} ({TIME_SLOTS[studyPlan.schedule.preferredTime].start})
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                        RECOMENDAÇÕES DA IA
                      </h5>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Reserve 10 minutos antes de cada sessão para revisão</li>
                        <li>• Faça pausas de 15 minutos a cada hora de estudo</li>
                        <li>• Revise as aulas anteriores no início de cada semana</li>
                        <li>• Mantenha um caderno de anotações para pontos importantes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('configure')}
                  >
                    VOLTAR
                  </Button>
                  <Button
                    onClick={generateTasks}
                    disabled={loading}
                    className="bg-accent-500 hover:bg-accent-600 text-white font-police-body"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        CRIANDO...
                      </>
                    ) : (
                      <>
                        CRIAR PLANO
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}