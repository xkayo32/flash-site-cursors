import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Users,
  Clock,
  Star,
  BookOpen,
  DollarSign,
  Calendar,
  Shield,
  Target,
  Award,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Video,
  Lock,
  Unlock,
  BarChart,
  TrendingUp,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourseImage } from '@/components/CourseImage';
import { courseService, type Course, type CourseModule } from '@/services/courseService';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'stats'>('overview');

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do curso
      const courseResult = await courseService.getCourse(id!);
      if (courseResult.success && courseResult.data) {
        setCourse(courseResult.data);
      } else {
        toast.error('Erro ao carregar curso');
        navigate('/admin/courses');
        return;
      }

      // Carregar módulos
      const modulesResult = await courseService.listModules(id!);
      if (modulesResult.success && modulesResult.data) {
        setModules(modulesResult.data);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Erro ao carregar dados do curso');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'published': { 
        label: 'PUBLICADO', 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-600',
        icon: CheckCircle
      },
      'draft': { 
        label: 'RASCUNHO', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-300 dark:border-yellow-600',
        icon: Edit
      },
      'archived': { 
        label: 'ARQUIVADO', 
        color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600',
        icon: Lock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['draft'];
    const Icon = config.icon;
    
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1 flex items-center gap-1',
        config.color
      )}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    const visibilityConfig = {
      'public': { 
        label: 'PÚBLICO', 
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        icon: Eye
      },
      'private': { 
        label: 'PRIVADO', 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        icon: Lock
      },
      'unlisted': { 
        label: 'NÃO LISTADO', 
        color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
        icon: EyeOff
      }
    };
    
    const config = visibilityConfig[visibility as keyof typeof visibilityConfig] || visibilityConfig['public'];
    const Icon = config.icon;
    
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1 flex items-center gap-1',
        config.color
      )}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const levelConfig = {
      'beginner': { 
        label: 'OPERACIONAL', 
        color: 'bg-accent-500/20 text-accent-500 dark:text-accent-400 border-2 border-accent-500/50',
        icon: Shield
      },
      'intermediate': { 
        label: 'TÁTICO', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-400',
        icon: Target
      },
      'advanced': { 
        label: 'COMANDO', 
        color: 'bg-gray-900 dark:bg-accent-500/20 text-white dark:text-accent-400 border-2 border-gray-700 dark:border-accent-500/50',
        icon: Award
      }
    };
    
    const config = levelConfig[difficulty as keyof typeof levelConfig] || levelConfig['beginner'];
    const Icon = config.icon;
    
    return (
      <Badge className={cn(
        'font-police-subtitle font-semibold text-xs uppercase tracking-wider px-3 py-1 flex items-center gap-1',
        config.color
      )}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
            CARREGANDO OPERAÇÃO...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
            OPERAÇÃO NÃO ENCONTRADA
          </h3>
          <Button 
            onClick={() => navigate('/admin/courses')} 
            className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
          >
            VOLTAR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/courses')}
            className="font-police-body"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLTAR
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
              {course.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(course.status)}
              {getVisibilityBadge(course.visibility)}
              {getDifficultyBadge(course.difficulty)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate(`/admin/courses/edit/${course.id}`)} 
            className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
          >
            <Edit className="w-4 h-4" />
            EDITAR OPERAÇÃO
          </Button>
        </div>
      </motion.div>

      {/* Course Header Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3">
              <div className="relative h-64 lg:h-full bg-gray-200 dark:bg-gray-700">
                <CourseImage
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  fallbackCategory={course.category}
                />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-gray-900/80 text-white border-0 font-police-numbers text-lg px-3 py-1">
                    R$ {course.price?.toLocaleString('pt-BR') || '0'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3 p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    CATEGORIA
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white font-police-body uppercase">
                    {course.category}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    INSTRUTOR
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border border-accent-500/30">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-police-subtitle uppercase">
                        {course.instructor.name?.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') || 'IN'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-police-body uppercase truncate">
                      {course.instructor.name || 'INSTRUTOR'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    DURAÇÃO
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white font-police-numbers">
                    {course.duration?.hours || 0}h
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    IDIOMA
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white font-police-body uppercase">
                    {course.language || 'PORTUGUÊS'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400 mb-2">
                  DESCRIÇÃO DA OPERAÇÃO
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-police-body">
                  {course.description || 'Sem descrição disponível.'}
                </p>
              </div>

              {course.targetAudience && (
                <div className="mb-6">
                  <h3 className="text-sm font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400 mb-2">
                    PÚBLICO-ALVO
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-police-body">
                    {course.targetAudience}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="font-police-body uppercase tracking-wider"
          >
            <Info className="w-4 h-4 mr-2" />
            VISÃO GERAL
          </Button>
          <Button
            variant={activeTab === 'modules' ? 'default' : 'outline'}
            onClick={() => setActiveTab('modules')}
            className="font-police-body uppercase tracking-wider"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            MÓDULOS ({modules.length})
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="font-police-body uppercase tracking-wider"
          >
            <BarChart className="w-4 h-4 mr-2" />
            ESTATÍSTICAS
          </Button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Objetivos */}
            {course.objectives && course.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-ultra-wide text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent-500" />
                    OBJETIVOS DA MISSÃO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-police-body">
                          {objective}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requisitos */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-ultra-wide text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent-500" />
                    REQUISITOS OPERACIONAIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-police-body">
                          {requirement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-ultra-wide text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent-500" />
                  INFORMAÇÕES TÁTICAS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">
                      Certificado Disponível
                    </span>
                    <Badge className={course.certificationAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {course.certificationAvailable ? 'SIM' : 'NÃO'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">
                      Criado em
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-police-numbers">
                      {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">
                      Atualizado em
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-police-numbers">
                      {new Date(course.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {course.publishedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">
                        Publicado em
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white font-police-numbers">
                        {new Date(course.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-4">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase">
                    NENHUM MÓDULO CADASTRADO
                  </p>
                  <Button
                    onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                    className="mt-4 font-police-body uppercase tracking-wider"
                  >
                    ADICIONAR MÓDULOS
                  </Button>
                </CardContent>
              </Card>
            ) : (
              modules.map((module, index) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-accent-500 font-police-numbers">
                            {index + 1}
                          </span>
                        </div>
                        <CardTitle className="font-police-subtitle uppercase tracking-wider">
                          {module.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="font-police-numbers">
                          {module.stats?.lessons || 0} AULAS
                        </Badge>
                        {module.isPublished ? (
                          <Badge className="bg-green-100 text-green-700">
                            <Unlock className="w-3 h-3 mr-1" />
                            PUBLICADO
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            <Lock className="w-3 h-3 mr-1" />
                            RASCUNHO
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {module.description && (
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                        {module.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                      MATRÍCULAS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.stats?.enrollments?.toLocaleString('pt-BR') || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                      AVALIAÇÃO
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-accent-500 fill-current" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                        {course.stats?.rating && course.stats.rating > 0 ? course.stats.rating : '--'}
                      </p>
                    </div>
                  </div>
                  <Star className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                      MÓDULOS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.stats?.modules || modules.length}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                      AULAS
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.stats?.lessons || 0}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}