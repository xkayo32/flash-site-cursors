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
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

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

  const handleShare = async () => {
    const shareData = {
      title: `${course.title} - ${currentLesson?.title}`,
      text: `Estou estudando "${currentLesson?.title}" no curso "${course.title}" da StudyPro!`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } else {
        // Fallback para copiar URL
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      // Fallback manual se clipboard falhar
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiado para a área de transferência!');
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-gray-700"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
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