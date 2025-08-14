import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseProgressService, type CourseProgress, type ModuleProgress } from '@/services/courseProgressService';
import { courseService } from '@/services/courseService';
import { CommentSectionSimple } from '@/components/CommentSectionSimple';
import toast from 'react-hot-toast';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  Lock,
  BookOpen,
  FileText,
  Download,
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  Menu,
  X,
  Monitor,
  Smartphone,
  RotateCcw,
  Share2,
  Copy,
  Send,
  Mail,
  AlertTriangle,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import { cn } from '@/utils/cn';

// Ícones customizados das redes sociais
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Tipos
interface Lesson {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number;
  completed: boolean;
  videoUrl: string;
  description?: string;
  resources?: Array<{
    title: string;
    type: 'pdf' | 'link' | 'exercise';
    url: string;
  }>;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
  totalDuration: string;
}

interface CourseData {
  id: string;
  title: string;
  instructor: string | { id: string; name: string; avatar?: string };
  category: string;
  progress: number;
  modules: Module[];
  currentLesson?: string;
}

// ===================== COURSE LEARNING PAGE =====================


export default function CourseLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Estados da interface
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareButtonPosition, setShareButtonPosition] = useState({ top: 0, left: 0 });
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  // Estados dos dados reais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  
  // Derivar dados das aulas
  const currentLesson = courseProgress && currentLessonId ? 
    courseProgress.modules
      .flatMap(module => module.lessons)
      .find(lesson => lesson.id === currentLessonId) : null;

  const currentModule = courseProgress && currentLessonId ?
    courseProgress.modules.find(module =>
      module.lessons.some(lesson => lesson.id === currentLessonId)
    ) : null;

  // ===================== CARREGAMENTO DOS DADOS =====================
  
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) {
        setError('ID do curso não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar matrícula
        const enrollment = await courseProgressService.getEnrollmentStatus(courseId);
        setEnrollmentStatus(enrollment);

        if (!enrollment.enrolled) {
          setError('Você não está matriculado neste curso');
          setLoading(false);
          return;
        }

        // Carregar dados do curso
        const [courseData, progressData] = await Promise.all([
          courseService.getCourse(courseId),
          courseProgressService.getCourseProgress(courseId)
        ]);

        setCourse(courseData.data);
        setCourseProgress(progressData);

        // Definir aula atual
        if (progressData) {
          const currentId = progressData.current_lesson_id || 
            progressData.modules[0]?.lessons[0]?.id;
          setCurrentLessonId(currentId);

          // Expandir módulos iniciais
          const moduleIds = progressData.modules.map(m => m.id);
          setExpandedModules(moduleIds);
        }

      } catch (err: any) {
        console.error('Erro ao carregar dados do curso:', err);
        setError(err.message || 'Erro ao carregar curso');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // ===================== PROGRESSO DA AULA =====================

  // Calcular progresso total do curso
  const calculateTotalProgress = () => {
    if (!courseProgress?.modules) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    courseProgress.modules.forEach(module => {
      totalLessons += module.lessons.length;
      module.lessons.forEach(lesson => {
        if (lesson.progress?.completed || lesson.progress?.watched_percentage >= 90) {
          completedLessons++;
        }
      });
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Verificar se deve mostrar botão "MISSÃO COMPLETA"
  const shouldShowCompleteButton = () => {
    if (!courseProgress?.modules || !currentLessonId) return false;
    
    // Listar todas as aulas do curso em ordem
    const allLessons = courseProgress.modules
      .sort((a, b) => a.order_index - b.order_index)
      .flatMap(module => 
        module.lessons.sort((a, b) => a.order_index - b.order_index)
      );
    
    if (allLessons.length === 0) return false;
    
    // Verificar se está na última aula
    const lastLesson = allLessons[allLessons.length - 1];
    const isLastLesson = currentLessonId === lastLesson.id;
    
    if (!isLastLesson) return false;
    
    // Verificar se a aula atual está concluída
    const currentLesson = allLessons.find(l => l.id === currentLessonId);
    const isCurrentLessonCompleted = currentLesson?.progress?.completed || 
                                   currentLesson?.progress?.watched_percentage >= 90;
    
    if (isCurrentLessonCompleted) return false; // Se já está completa, não mostrar botão
    
    // Verificar se todas as aulas anteriores estão concluídas
    const previousLessons = allLessons.slice(0, -1); // Todas exceto a última
    const allPreviousCompleted = previousLessons.every(lesson => 
      lesson.progress?.completed || lesson.progress?.watched_percentage >= 90
    );
    
    return allPreviousCompleted;
  };

  // Carregegar progresso específico da aula atual
  useEffect(() => {
    const loadLessonProgress = async () => {
      if (!courseId || !currentLessonId) return;

      try {
        const progress = await courseProgressService.getLessonProgress(courseId, currentLessonId);
        if (progress && progress.current_time > 0) {
          setCurrentTime(progress.current_time);
          
          // Se há progresso salvo e o vídeo está carregado, posicionar o vídeo
          if (videoRef.current && progress.current_time > 0) {
            videoRef.current.currentTime = progress.current_time;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar progresso da aula:', error);
      }
    };

    loadLessonProgress();
  }, [courseId, currentLessonId]);

  // Salvar progresso automaticamente
  useEffect(() => {
    if (!courseId || !currentLessonId || !duration || duration <= 0) return;

    const watchedPercentage = courseProgressService.calculateWatchedPercentage(currentTime, duration);
    
    // Salvar progresso a cada 5% assistido ou a cada 30 segundos
    if (watchedPercentage % 5 === 0 || currentTime % 30 === 0) {
      courseProgressService.saveProgressDebounced(
        courseId,
        currentLessonId,
        currentTime,
        duration,
        2000 // 2 segundos de delay
      );
    }
  }, [courseId, currentLessonId, currentTime, duration]);

  // ===================== PLAYER DE VÍDEO =====================

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentLessonId]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar se clicou no botão de compartilhar ou dentro do menu
      if (showShareMenu && 
          shareButtonRef.current && 
          !shareButtonRef.current.contains(target) &&
          !target.closest('.share-dropdown-menu')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = async () => {
    setIsPlaying(false);
    
    // Marcar aula como completa
    if (courseId && currentLessonId) {
      await courseProgressService.updateLessonProgress(courseId, currentLessonId, {
        currentTime: duration,
        duration: duration,
        completed: true,
        watchedPercentage: 100
      });
      
      // Atualizar progresso local
      const updatedProgress = await courseProgressService.getCourseProgress(courseId);
      setCourseProgress(updatedProgress);
    }
    
    // Auto-advance to next lesson
    const currentModule = courseProgress?.modules.find(m => 
      m.lessons.some(l => l.id === currentLessonId)
    );
    
    if (currentModule) {
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
      
      // Tentar próxima aula no mesmo módulo
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        const nextLesson = currentModule.lessons[currentLessonIndex + 1];
        setCurrentLessonId(nextLesson.id);
        toast.success('🎯 Avançando para próxima missão!', { duration: 2000 });
      } else {
        // Tentar próximo módulo
        const currentModuleIndex = courseProgress?.modules.findIndex(m => m.id === currentModule.id) || 0;
        if (currentModuleIndex < (courseProgress?.modules.length || 0) - 1) {
          const nextModule = courseProgress?.modules[currentModuleIndex + 1];
          if (nextModule && nextModule.lessons.length > 0) {
            setCurrentLessonId(nextModule.lessons[0].id);
            toast.success('🎯 Avançando para próximo módulo!', { duration: 2000 });
          } else {
            toast.success('🏆 OPERAÇÃO COMPLETA! Todas as missões foram concluídas!', { duration: 5000 });
          }
        } else {
          toast.success('🏆 OPERAÇÃO COMPLETA! Todas as missões foram concluídas!', { duration: 5000 });
        }
      }
    }
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setTimeout(() => {
        setCurrentLessonId(nextLesson.id);
        toast.success('Próxima aula carregada automaticamente!');
      }, 2000);
    }
  };

  const handleSeek = (seekTime: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      if (isMuted) {
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // ===================== NAVEGAÇÃO ENTRE AULAS =====================

  const goToLesson = async (lessonId: string) => {
    if (!courseId) return;

    try {
      // Salvar progresso final da aula atual antes de trocar
      if (currentLessonId) {
        const watchedPercentage = courseProgressService.calculateWatchedPercentage(currentTime, duration);
        
        // Se está avançando para próxima aula, marcar atual como completa
        const currentModule = courseProgress?.modules.find(m => 
          m.lessons.some(l => l.id === currentLessonId)
        );
        const targetModule = courseProgress?.modules.find(m => 
          m.lessons.some(l => l.id === lessonId)
        );
        
        let isAdvancing = false;
        
        if (currentModule && targetModule) {
          const currentModuleIndex = courseProgress?.modules.findIndex(m => m.id === currentModule.id) || 0;
          const targetModuleIndex = courseProgress?.modules.findIndex(m => m.id === targetModule.id) || 0;
          
          if (targetModuleIndex > currentModuleIndex) {
            // Avançando para próximo módulo
            isAdvancing = true;
          } else if (targetModuleIndex === currentModuleIndex) {
            // Mesmo módulo, verificar se está avançando
            const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
            const nextLessonIndex = currentModule.lessons.findIndex(l => l.id === lessonId);
            isAdvancing = nextLessonIndex > currentLessonIndex;
          }
        }
        
        if (isAdvancing) {
          // Marcar aula atual como completa
          await courseProgressService.updateLessonProgress(courseId, currentLessonId, {
            currentTime: duration || 0,
            duration: duration || 0,
            watchedPercentage: 100,
            completed: true
          });
          
          // Chamar API para marcar como completa no backend também
          await courseService.markLessonComplete(courseId, currentLessonId);
          
          // Atualizar o progresso local imediatamente
          if (courseProgress) {
            const updatedModules = courseProgress.modules.map(module => ({
              ...module,
              lessons: module.lessons.map(lesson => 
                lesson.id === currentLessonId 
                  ? { ...lesson, progress: { ...lesson.progress, completed: true, watched_percentage: 100 } }
                  : lesson
              )
            }));
            setCourseProgress({ ...courseProgress, modules: updatedModules });
          }
          
          toast.success('✅ Missão anterior marcada como concluída!', { duration: 2000 });
        } else {
          // Apenas salvar progresso sem marcar como completa
          await courseProgressService.updateLessonProgress(courseId, currentLessonId, {
            currentTime,
            duration,
            watchedPercentage,
            completed: watchedPercentage >= 90
          });
        }
      }

      // Trocar para nova aula
      setCurrentLessonId(lessonId);
      setCurrentTime(0);
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }

      // Recarregar progresso do curso para garantir sincronização
      const updatedProgress = await courseProgressService.getCourseProgress(courseId);
      if (updatedProgress) {
        setCourseProgress(updatedProgress);
      }

      toast.success('📚 Nova missão carregada!', {
        duration: 2000,
        icon: '🎯'
      });

    } catch (error) {
      console.error('Erro ao trocar de aula:', error);
      toast.error('Erro ao carregar nova aula');
    }
  };

  const getPreviousLesson = () => {
    if (!courseProgress) return null;
    
    const allLessons = courseProgress.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    if (!courseProgress) return null;
    
    const allLessons = courseProgress.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !courseId || !currentLessonId) {
      toast.error('Dados da aula não disponíveis');
      return;
    }

    try {
      const watchedPercentage = courseProgressService.calculateWatchedPercentage(currentTime, duration);
      
      await courseProgressService.updateLessonProgress(courseId, currentLessonId, {
        currentTime,
        duration,
        watchedPercentage,
        completed: true
      });

      // Recarregar progresso do curso
      const updatedProgress = await courseProgressService.getCourseProgress(courseId);
      setCourseProgress(updatedProgress);

      toast.success('🎯 MISSÃO CONCLUÍDA! Objetivo eliminado com sucesso.', {
        duration: 3000,
        icon: '✅'
      });

      // Avançar para próxima aula automaticamente se houver
      const next = getNextLesson();
      if (next) {
        setTimeout(() => {
          goToLesson(next.id);
        }, 2000);
      }

    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      toast.error('Erro ao concluir aula');
    }
  };

  const getShareData = () => {
    const title = `🎯 OPERAÇÃO TÁTICA: ${course.title} - ${currentLesson?.title}`;
    const text = `🔥 Estou em uma missão de estudos! 
📚 Curso: "${course.title}"
🎯 Aula atual: "${currentLesson?.title}"
⚡ Sistema de treinamento tático da StudyPro

Junte-se à operação e domine os concursos! 💪`;
    const url = window.location.href;
    return { title, text, url };
  };

  const handleSharePlatform = async (platform: string) => {
    console.log('🚀 handleSharePlatform chamado para:', platform);
    
    const { title, text, url } = getShareData();
    console.log('📝 Dados de compartilhamento:', { title, text, url });
    
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        console.log('📱 WhatsApp URL:', shareUrl);
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram não permite compartilhamento direto via URL, então copiamos o link
        await copyToClipboard(url);
        toast.success('📸 LINK COPIADO! Cole no Instagram Stories ou feed para compartilhar sua jornada de estudos.', {
          icon: '💗',
          duration: 4000
        });
        break;
      case 'copy':
        await copyToClipboard(url);
        toast.success('🔗 LINK COPIADO! Cole onde quiser compartilhar esta operação.', {
          icon: '📋',
          duration: 3000
        });
        break;
      case 'native':
        try {
          if (navigator.share && navigator.canShare({ title, text, url })) {
            await navigator.share({ title, text, url });
            toast.success('📤 COMPARTILHADO COM SUCESSO! Sua operação foi divulgada.', { 
              icon: '✅',
              duration: 3000
            });
          } else {
            await copyToClipboard(url);
            toast.success('🔗 LINK COPIADO! Compartilhamento nativo não disponível.', {
              icon: '📋',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Erro ao compartilhar:', error);
          await copyToClipboard(url);
          toast.error('❌ Erro no compartilhamento nativo. Link copiado como alternativa.', {
            icon: '📋',
            duration: 4000
          });
        }
        setShowShareMenu(false);
        return;
    }

    if (shareUrl) {
      console.log('🔗 Tentando abrir URL:', shareUrl);
      try {
        const newWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
        console.log('🪟 Window.open resultado:', newWindow);
        
        // Toast específico para cada plataforma
        let message = '';
        let icon = '';
        
        switch (platform) {
          case 'whatsapp':
            message = '📱 WHATSAPP aberto! Compartilhe com seus contatos.';
            icon = '💚';
            break;
          case 'telegram':
            message = '✈️ TELEGRAM aberto! Envie para seus grupos de estudo.';
            icon = '🔵';
            break;
          case 'facebook':
            message = '📘 FACEBOOK aberto! Compartilhe no seu feed.';
            icon = '🔵';
            break;
          case 'twitter':
            message = '🐦 TWITTER/X aberto! Tuíte sobre sua jornada de estudos.';
            icon = '⚫';
            break;
          case 'linkedin':
            message = '💼 LINKEDIN aberto! Compartilhe profissionalmente.';
            icon = '🔵';
            break;
          case 'email':
            message = '📧 EMAIL aberto! Envie para quem quiser estudar junto.';
            icon = '✉️';
            break;
          default:
            message = '🚀 Compartilhamento aberto em nova aba!';
            icon = '📤';
        }
        
        toast.success(message, { icon, duration: 4000 });
      } catch (error) {
        console.error('Erro ao abrir compartilhamento:', error);
        toast.error('❌ Erro ao abrir compartilhamento. Tente novamente.');
      }
    }
    
    setShowShareMenu(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erro na API clipboard:', error);
      try {
        // Fallback manual se clipboard falhar
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand falhou');
        }
      } catch (fallbackError) {
        console.error('Erro no fallback de cópia:', fallbackError);
        toast.error('❌ Não foi possível copiar o link. Copie manualmente da barra de endereços.', {
          duration: 5000
        });
        throw fallbackError;
      }
    }
  };

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  // ===================== STATES DE CARREGAMENTO =====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
            CARREGANDO OPERAÇÃO
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
            Preparando sua missão de estudos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="text-red-500">
            <AlertTriangle className="w-20 h-20 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
            OPERAÇÃO INDISPONÍVEL
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-police-body">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/my-courses">
              <Button className="bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider">
                VOLTAR AOS CURSOS
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="font-police-body uppercase tracking-wider"
            >
              TENTAR NOVAMENTE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !courseProgress || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-6 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-accent-500/20 max-w-md">
          {/* Ícone de aviso */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
              DADOS INDISPONÍVEIS
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              Não foi possível carregar os dados do curso
            </p>
          </div>

          {/* Botões de navegação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/my-courses')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-police-body font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Meus Cursos
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Painel do Aluno
            </button>
          </div>

          {/* Botão de tentar novamente */}
          <button
            onClick={() => window.location.reload()}
            className="text-accent-500 hover:text-accent-600 font-police-body uppercase tracking-wider text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#14242f] to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 border-b border-accent-500/20 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-courses">
              <StudyProLogo variant="icon" size="sm" className="text-white" />
            </Link>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold line-clamp-1 font-police-title uppercase tracking-wider">{course.title}</h1>
              <p className="text-sm text-gray-400 font-police-subtitle uppercase tracking-wider">COMANDANTE: {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'Desconhecido'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-white hover:bg-white/10 border border-accent-500/30"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="relative share-menu-container z-50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 border border-accent-500/30 font-police-body uppercase tracking-wider"
                ref={shareButtonRef}
                onClick={() => {
                  if (!showShareMenu && shareButtonRef.current) {
                    const rect = shareButtonRef.current.getBoundingClientRect();
                    setShareButtonPosition({
                      top: rect.bottom + window.scrollY + 8,
                      left: rect.right - 224 + window.scrollX // 224px = w-56
                    });
                  }
                  setShowShareMenu(!showShareMenu);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                COMPARTILHAR INTEL
                <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showShareMenu && "rotate-180")} />
              </Button>
            </div>
            <Link to="/my-courses">
              <Button variant="outline" size="sm" className="text-white border-accent-500/30 hover:bg-white/10 hover:text-accent-500 font-police-body uppercase tracking-wider">
                RETORNAR À BASE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar com conteúdo do curso */}
        <div className={cn(
          "lg:w-80 bg-gray-800/90 backdrop-blur-sm border-r border-accent-500/20 transition-all duration-300",
          showSidebar ? "w-80" : "w-0 lg:w-80",
          "fixed lg:relative inset-y-0 left-0 z-40 overflow-hidden"
        )}>
          <div className="h-full overflow-y-auto">
            {/* Progresso do curso */}
            <div className="p-4 border-b border-accent-500/20 relative">
              {/* Tactical corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium font-police-body uppercase tracking-wider text-accent-500">PROGRESSO DA OPERAÇÃO</span>
                <span className="text-sm text-accent-400 font-police-numbers font-bold">{calculateTotalProgress()}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 border border-accent-500/20">
                <div
                  className="bg-gradient-to-r from-accent-500 to-accent-600 h-full rounded-full transition-all duration-500 shadow-lg shadow-accent-500/20"
                  style={{ width: `${calculateTotalProgress()}%` }}
                />
              </div>
              
              {/* Tactical stripe */}
              <div className="absolute left-0 top-4 w-1 h-16 bg-accent-500/30" />
            </div>

            {/* Lista de módulos e aulas */}
            <div className="p-4">
              {courseProgress.modules.map((module) => (
                <div key={module.id} className="mb-4">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-700/70 border border-accent-500/20 rounded-lg hover:bg-gray-600/70 hover:border-accent-500/40 transition-all duration-300 relative group"
                  >
                    {/* Tactical corner accent */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent-500/30 group-hover:border-accent-500/60 transition-colors" />
                    
                    <div className="text-left">
                      <h3 className="font-medium font-police-subtitle uppercase tracking-wider text-white group-hover:text-accent-400 transition-colors">{module.title}</h3>
                      <p className="text-sm text-gray-400 font-police-body">
                        {module.completed_lessons}/{module.total_lessons} MISSÕES • {module.completion_percentage}% CONCLUÍDO
                      </p>
                    </div>
                    {expandedModules.includes(module.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {expandedModules.includes(module.id) && (
                    <div className="mt-2 space-y-1">
                      {module.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => goToLesson(lesson.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300 relative group border",
                            lesson.id === currentLessonId
                              ? "bg-accent-500 text-black border-accent-600 shadow-lg shadow-accent-500/30"
                              : "hover:bg-gray-700/50 border-gray-600/50 hover:border-accent-500/30"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {lesson.progress?.completed || lesson.progress?.watched_percentage >= 90 ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : lesson.id === currentLessonId ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : lesson.progress?.watched_percentage > 0 ? (
                              <div className="w-5 h-5 border-2 border-accent-500 rounded-full flex items-center justify-center bg-accent-500/20">
                                <span className="text-xs text-accent-500">{Math.round(lesson.progress.watched_percentage)}%</span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2 font-police-body group-hover:text-accent-400 transition-colors">{lesson.title}</h4>
                            <p className="text-sm text-gray-400 font-police-numbers">
                              {lesson.duration_minutes}min 
                              {lesson.progress?.watched_percentage > 0 && 
                                ` • ${Math.round(lesson.progress.watched_percentage)}% assistido`
                              }
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área principal do player */}
        <div className="flex-1 flex flex-col">
          {/* Player de vídeo */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={currentLesson?.video_url}
              className="w-full aspect-video"
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Controles do vídeo */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              {/* Barra de progresso */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Controles principais */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => previousLesson && goToLesson(previousLesson.id)}
                    disabled={!previousLesson}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => nextLesson && goToLesson(nextLesson.id)}
                    disabled={!nextLesson}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Controles secundários */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                    
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 min-w-32">
                        <div className="text-sm font-medium mb-2">Velocidade</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={cn(
                              "block w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-700",
                              playbackRate === rate && "bg-accent-500"
                            )}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da aula */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
            <div className="max-w-4xl mx-auto">
              {/* Cabeçalho da aula */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-gray-800 text-accent-500 border-accent-500/20 font-police-subtitle uppercase tracking-wider">{currentModule?.title}</Badge>
                    <Badge variant="outline" className="border-accent-500/30 text-accent-600 dark:text-accent-400 font-police-body uppercase tracking-wider">MISSÃO {currentLessonId}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">{currentLesson?.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-accent-500" />
                      DURAÇÃO: {currentLesson?.duration}
                    </span>
                    <span className="font-police-body uppercase tracking-wider">COMANDANTE: {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'Desconhecido'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {shouldShowCompleteButton() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={markLessonComplete}
                      className="bg-accent-500 hover:bg-accent-600 text-black dark:text-black border-accent-600 font-police-body font-semibold uppercase tracking-wider"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      MISSÃO COMPLETA
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-accent-500 hover:bg-white/10">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Descrição da aula */}
              {currentLesson?.description && (
                <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
                  <CardContent className="p-4 relative">
                    {/* Tactical corner accent */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
                    
                    <h3 className="font-semibold mb-2 font-police-subtitle uppercase tracking-wider text-accent-500 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      BRIEFING DA MISSÃO
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 font-police-body">{currentLesson.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recursos da aula */}
              {currentLesson?.resources && (
                <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
                  <CardContent className="p-4 relative">
                    {/* Tactical corner accent */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
                    
                    <h3 className="font-semibold mb-4 flex items-center gap-2 font-police-subtitle uppercase tracking-wider text-accent-500">
                      <FileText className="w-5 h-5" />
                      ARSENAL DE APOIO
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-accent-500/30 transition-all duration-300 relative group"
                        >
                          {/* Tactical stripe */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500/30 group-hover:bg-accent-500 transition-colors" />
                          
                          <Download className="w-5 h-5 text-accent-500 ml-2" />
                          <div>
                            <p className="font-medium font-police-body text-gray-900 dark:text-white group-hover:text-accent-500 transition-colors">{resource.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize font-police-body">{resource.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navegação entre aulas */}
              <div className="flex items-center justify-between">
                {previousLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(previousLesson.id)}
                    className="gap-2 border-accent-500/30 text-accent-600 dark:text-accent-400 hover:bg-white/10 hover:border-accent-500/60 font-police-body uppercase tracking-wider"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    MISSÃO ANTERIOR
                  </Button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Button
                    onClick={() => goToLesson(nextLesson.id)}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:bg-accent-500 dark:hover:bg-accent-600 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider"
                  >
                    PRÓXIMA MISSÃO
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    disabled 
                    className="font-police-body font-semibold uppercase tracking-wider border-green-500/30 text-green-600 dark:text-green-400"
                  >
                    OPERAÇÃO FINALIZADA!
                  </Button>
                )}
              </div>

              {/* Seção de Comentários */}
              <div className="mt-8">
                <CommentSectionSimple 
                  courseId={courseId!} 
                  currentLessonId={currentLessonId || undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile quando sidebar está aberta */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Portal para o dropdown de compartilhamento */}
      {showShareMenu && createPortal(
        <div 
          className="share-dropdown-menu fixed w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2"
          style={{ 
            zIndex: 999999, 
            top: shareButtonPosition.top, 
            left: shareButtonPosition.left,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            Compartilhar aula
          </div>
          
          {/* Compartilhamento nativo */}
          {'share' in navigator && (
            <button
              onClick={() => handleSharePlatform('native')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              Compartilhamento do sistema
            </button>
          )}

          {/* WhatsApp */}
          <button
            onClick={() => handleSharePlatform('whatsapp')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-green-500">
              <WhatsAppIcon />
            </div>
            WhatsApp
          </button>

          {/* Telegram */}
          <button
            onClick={() => handleSharePlatform('telegram')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-blue-500">
              <TelegramIcon />
            </div>
            Telegram
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleSharePlatform('facebook')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-blue-500">
              <FacebookIcon />
            </div>
            Facebook
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleSharePlatform('twitter')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-blue-400">
              <TwitterIcon />
            </div>
            Twitter
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleSharePlatform('linkedin')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-blue-600">
              <LinkedInIcon />
            </div>
            LinkedIn
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          
          {/* Email */}
          <button
            onClick={() => handleSharePlatform('email')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Mail className="w-4 h-4 text-gray-500" />
            Email
          </button>

          {/* Copiar link */}
          <button
            onClick={() => handleSharePlatform('copy')}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-500" />
            Copiar link
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}