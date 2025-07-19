import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

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
  instructor: string;
  category: string;
  progress: number;
  modules: Module[];
  currentLesson?: string;
}

// Dados mockados do curso
const mockCourseData: CourseData = {
  id: '1',
  title: 'Receita Federal - Auditor Fiscal',
  instructor: 'Prof. Ana Silva',
  category: 'Fiscal',
  progress: 45,
  currentLesson: '1-2',
  modules: [
    {
      id: '1',
      title: 'Direito Tributário',
      completed: false,
      totalDuration: '8h 30min',
      lessons: [
        {
          id: '1-1',
          title: 'Introdução ao Sistema Tributário Nacional',
          duration: '45min',
          durationSeconds: 2700,
          completed: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
          id: '1-2',
          title: 'Princípios Constitucionais Tributários',
          duration: '52min',
          durationSeconds: 3120,
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          description: 'Nesta aula vamos estudar os principais princípios que regem o sistema tributário brasileiro, estabelecidos na Constituição Federal.',
          resources: [
            {
              title: 'Resumo - Princípios Tributários',
              type: 'pdf',
              url: '#'
            },
            {
              title: 'Exercícios - Capítulo 1',
              type: 'exercise',
              url: '#'
            }
          ]
        },
        {
          id: '1-3',
          title: 'ICMS - Conceitos Básicos',
          duration: '38min',
          durationSeconds: 2280,
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
          id: '1-4',
          title: 'ICMS - Casos Práticos',
          duration: '41min',
          durationSeconds: 2460,
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
        }
      ]
    },
    {
      id: '2',
      title: 'Contabilidade Pública',
      completed: false,
      totalDuration: '6h 15min',
      lessons: [
        {
          id: '2-1',
          title: 'Princípios de Contabilidade Pública',
          duration: '35min',
          durationSeconds: 2100,
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
        },
        {
          id: '2-2',
          title: 'Orçamento Público',
          duration: '48min',
          durationSeconds: 2880,
          completed: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
        }
      ]
    }
  ]
};

export default function CourseLearningPage() {
  const { courseId } = useParams();
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
  const [currentLessonId, setCurrentLessonId] = useState(mockCourseData.currentLesson || '1-1');
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>(['1']);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const course = mockCourseData;
  
  // Encontrar a aula atual
  const currentLesson = course.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === currentLessonId);

  const currentModule = course.modules.find(module =>
    module.lessons.some(lesson => lesson.id === currentLessonId)
  );

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
      if (showShareMenu && !(event.target as Element).closest('.share-menu-container')) {
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

  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Auto-advance to next lesson
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

  const goToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const getPreviousLesson = () => {
    const allLessons = course.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    const allLessons = course.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const markLessonComplete = () => {
    if (currentLesson) {
      toast.success('Aula marcada como concluída!');
      // Aqui seria a lógica para salvar o progresso
    }
  };

  const getShareData = () => {
    const title = `${course.title} - ${currentLesson?.title}`;
    const text = `Estou estudando "${currentLesson?.title}" no curso "${course.title}" da StudyPro!`;
    const url = window.location.href;
    return { title, text, url };
  };

  const handleSharePlatform = async (platform: string) => {
    const { title, text, url } = getShareData();
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
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
      case 'instagram':
        // Instagram não permite compartilhamento direto via URL, então copiamos o link
        await copyToClipboard(url);
        toast.success('Link copiado! Cole no Instagram Stories ou feed.');
        setShowShareMenu(false);
        return;
      case 'copy':
        await copyToClipboard(url);
        toast.success('Link copiado para a área de transferência!');
        setShowShareMenu(false);
        return;
      case 'native':
        try {
          if (navigator.share && navigator.canShare({ title, text, url })) {
            await navigator.share({ title, text, url });
            toast.success('Compartilhado com sucesso!');
          } else {
            await copyToClipboard(url);
            toast.success('Link copiado para a área de transferência!');
          }
        } catch (error) {
          console.error('Erro ao compartilhar:', error);
        }
        setShowShareMenu(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success('Compartilhamento aberto em nova aba!');
    }
    
    setShowShareMenu(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback manual se clipboard falhar
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-courses">
              <Logo variant="icon" size="sm" className="text-white" />
            </Link>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold line-clamp-1">{course.title}</h1>
              <p className="text-sm text-gray-400">{course.instructor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-white hover:bg-gray-700"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="relative share-menu-container">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-gray-700"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
                <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showShareMenu && "rotate-180")} />
              </Button>

              {/* Menu de compartilhamento */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                    Compartilhar aula
                  </div>
                  
                  {/* Compartilhamento nativo */}
                  {'share' in navigator && (
                    <button
                      onClick={() => handleSharePlatform('native')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                      Compartilhamento do sistema
                    </button>
                  )}

                  {/* WhatsApp */}
                  <button
                    onClick={() => handleSharePlatform('whatsapp')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-green-500">
                      <WhatsAppIcon />
                    </div>
                    WhatsApp
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleSharePlatform('telegram')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-blue-500">
                      <TelegramIcon />
                    </div>
                    Telegram
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleSharePlatform('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-blue-600">
                      <FacebookIcon />
                    </div>
                    Facebook
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => handleSharePlatform('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-black">
                      <TwitterIcon />
                    </div>
                    X (Twitter)
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={() => handleSharePlatform('instagram')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-pink-500">
                      <InstagramIcon />
                    </div>
                    Instagram
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    {/* Copiar link */}
                    <button
                      onClick={() => handleSharePlatform('copy')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                      Copiar link
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/my-courses">
              <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-700 hover:text-white">
                Voltar aos cursos
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar com conteúdo do curso */}
        <div className={cn(
          "lg:w-80 bg-gray-800 border-r border-gray-700 transition-all duration-300",
          showSidebar ? "w-80" : "w-0 lg:w-80",
          "fixed lg:relative inset-y-0 left-0 z-40 overflow-hidden"
        )}>
          <div className="h-full overflow-y-auto">
            {/* Progresso do curso */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do curso</span>
                <span className="text-sm text-gray-400">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-accent-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            {/* Lista de módulos e aulas */}
            <div className="p-4">
              {course.modules.map((module) => (
                <div key={module.id} className="mb-4">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="text-sm text-gray-400">{module.totalDuration}</p>
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
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                            lesson.id === currentLessonId
                              ? "bg-accent-600 text-white"
                              : "hover:bg-gray-700"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : lesson.id === currentLessonId ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2">{lesson.title}</h4>
                            <p className="text-sm text-gray-400">{lesson.duration}</p>
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
              src={currentLesson?.videoUrl}
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
                              playbackRate === rate && "bg-accent-600"
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
          <div className="flex-1 bg-white text-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Cabeçalho da aula */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{currentModule?.title}</Badge>
                    <Badge variant="outline">Aula {currentLessonId}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentLesson?.duration}
                    </span>
                    <span>Professor: {course.instructor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={markLessonComplete}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como concluída
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Descrição da aula */}
              {currentLesson?.description && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Sobre esta aula</h3>
                    <p className="text-gray-700">{currentLesson.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recursos da aula */}
              {currentLesson?.resources && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Materiais de apoio
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
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
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Aula anterior
                  </Button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Button
                    onClick={() => goToLesson(nextLesson.id)}
                    className="gap-2"
                  >
                    Próxima aula
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Curso concluído!
                  </Button>
                )}
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
    </div>
  );
}