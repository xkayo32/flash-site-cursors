import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { courseService } from '@/services/courseService';
import type { Course as CourseFromAPI } from '@/services/courseService';
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  Brain,
  Target,
  Zap,
  X,
  Grid,
  List,
  Shield,
  Crosshair,
  Activity,
  AlertTriangle,
  Command
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/student';

// Tipos
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  subcategory?: string;
  duration: string;
  students: number;
  rating: number;
  reviews?: number;
  price: number;
  originalPrice?: number;
  modules: number;
  questions?: number;
  lastUpdated: string;
  level: 'BÁSICO' | 'INTERMEDIÁRIO' | 'AVANÇADO';
  features: string[];
  image: string;
  badge?: {
    text: string;
    color: string;
  };
  progress?: number;
  enrolled?: boolean;
}

// Função para transformar dados da API em formato do componente
const transformCourseFromAPI = (course: CourseFromAPI): Course => {
  const difficultyMap: { [key: string]: 'BÁSICO' | 'INTERMEDIÁRIO' | 'AVANÇADO' } = {
    'beginner': 'BÁSICO',
    'intermediate': 'INTERMEDIÁRIO', 
    'advanced': 'AVANÇADO'
  };

  return {
    id: course.id,
    title: course.title.toUpperCase(),
    description: course.description,
    instructor: course.instructor?.name || 'Comandante Tático',
    category: course.category?.toUpperCase() || 'GERAL',
    subcategory: course.category?.toUpperCase(),
    duration: `${course.duration_hours || course.duration?.hours || 0}h`,
    students: course.stats?.enrollments || 0,
    rating: course.stats?.rating || 0,
    reviews: course.stats?.enrollments || 0,
    price: course.price || 0,
    originalPrice: undefined,
    modules: course.stats?.modules || 0,
    questions: course.stats?.lessons || 0,
    lastUpdated: new Date(course.updated_at || course.updatedAt).toISOString().split('T')[0],
    level: difficultyMap[course.difficulty_level || course.difficulty || ''] || 'BÁSICO',
    features: course.objectives?.slice(0, 4).map(obj => obj.toUpperCase()) || ['CONTEÚDO ATUALIZADO'],
    image: course.thumbnail || 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=250&fit=crop',
    badge: course.status === 'published' ? {
      text: 'ATIVA',
      color: 'bg-green-500'
    } : undefined,
    progress: undefined,
    enrolled: false // Will be updated based on actual enrollment status
  };
};

// Categorias disponíveis
const categories = [
  { value: 'all', label: 'TODAS AS OPERAÇÕES' },
  { value: 'POLÍCIA', label: 'POLÍCIA' },
  { value: 'FISCAL', label: 'FISCAL' },
  { value: 'TRIBUNAIS', label: 'TRIBUNAIS' },
  { value: 'BANCÁRIOS', label: 'BANCÁRIOS' },
  { value: 'CONTROLE', label: 'CONTROLE' },
  { value: 'PREVIDÊNCIA', label: 'PREVIDÊNCIA' }
];

// Níveis disponíveis
const levels = [
  { value: 'all', label: 'TODOS OS NÍVEIS' },
  { value: 'BÁSICO', label: 'BÁSICO' },
  { value: 'INTERMEDIÁRIO', label: 'INTERMEDIÁRIO' },
  { value: 'AVANÇADO', label: 'AVANÇADO' }
];

// Ordenação
const sortOptions = [
  { value: 'popular', label: 'MAIS PROCURADAS' },
  { value: 'rating', label: 'MELHOR AVALIADAS' },
  { value: 'newest', label: 'MAIS RECENTES' },
  { value: 'price-low', label: 'MENOR INVESTIMENTO' },
  { value: 'price-high', label: 'MAIOR INVESTIMENTO' }
];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyEnrolled, setShowOnlyEnrolled] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [enrollmentLoading, setEnrollmentLoading] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<string, number>>(new Map());

  // Carregar cursos da API
  useEffect(() => {
    const loadData = async () => {
      // Primeiro, verificar matrículas
      const enrollmentData = await checkEnrolledCourses();
      // Depois, carregar cursos com os dados de matrícula
      await loadCourses(enrollmentData);
    };
    loadData();
  }, []);

  // Verificar quais cursos o usuário já está matriculado e seu progresso
  const checkEnrolledCourses = async () => {
    try {
      const response = await courseService.getEnrolledCourses();
      if (response.success && response.data) {
        const enrolledIds = new Set(response.data.map((enrollment: any) => enrollment.course_id || enrollment.course?.id));
        const progressMap = new Map();
        
        // Mapear progresso de cada curso
        response.data.forEach((enrollment: any) => {
          const courseId = enrollment.course_id || enrollment.course?.id;
          if (courseId && enrollment.progress?.percentage !== undefined) {
            progressMap.set(courseId, enrollment.progress.percentage);
          }
        });
        
        setEnrolledCourses(enrolledIds);
        setCourseProgress(progressMap);
        
        // Retornar os dados para uso imediato
        return { enrolledIds, progressMap };
      }
    } catch (error) {
      console.error('Erro ao verificar matrículas:', error);
    }
    
    return { enrolledIds: new Set(), progressMap: new Map() };
  };

  const loadCourses = async (enrollmentData?: { enrolledIds: Set<string>, progressMap: Map<string, number> }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await courseService.listCourses({
        status: 'published',
        limit: 100
      });
      
      if (response.success && response.data) {
        // Use os dados passados ou os estados atuais
        const enrolledIds = enrollmentData?.enrolledIds || enrolledCourses;
        const progressMap = enrollmentData?.progressMap || courseProgress;
        
        const transformedCourses = response.data.map(course => {
          const transformed = transformCourseFromAPI(course);
          // Check if user is enrolled in this course
          const isEnrolled = enrolledIds.has(course.id);
          const progress = progressMap.get(course.id) || 0;
          
          transformed.enrolled = isEnrolled;
          transformed.progress = progress;
          
          // Log for debugging
          console.log(`Course ${course.title}: enrolled=${isEnrolled}, progress=${progress}%`);
          
          return transformed;
        });
        setCourses(transformedCourses);
        setTotalCourses(transformedCourses.length);
        
        console.log(`Total de cursos carregados: ${transformedCourses.length}`);
      } else {
        setError(response.message || 'Erro ao carregar cursos');
        setCourses([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      setError('Erro ao carregar cursos. Tente novamente.');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar e ordenar cursos
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filtrar por nível
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filtrar apenas matriculados
    if (showOnlyEnrolled) {
      filtered = filtered.filter(course => course.enrolled);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.students - a.students);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy, showOnlyEnrolled]);

  const CourseCard = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        {/* Imagem do curso */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          {course.badge && (
            <Badge className={cn("absolute top-4 left-4 font-police-body font-semibold uppercase tracking-wider", course.badge.color)}>
              {course.badge.text}
            </Badge>
          )}
          {course.enrolled && course.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2 text-white text-sm mb-1 font-police-body uppercase tracking-wider">
                <Play className="w-4 h-4" />
                <span>{course.progress}% CONCLUÍDO</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-accent-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Categoria e Nível */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs font-police-body font-semibold uppercase tracking-wider">
              {course.category}
            </Badge>
            <Badge variant="outline" className="text-xs font-police-body font-semibold uppercase tracking-wider">
              {course.level}
            </Badge>
          </div>

          {/* Título */}
          <h3 className="font-police-subtitle font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors uppercase tracking-wider">
            {course.title}
          </h3>

          {/* Descrição */}
          <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Instrutor */}
          <p className="text-xs font-police-body text-gray-500 dark:text-gray-500 mb-3 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span className="uppercase tracking-wider">{course.instructor}</span>
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Clock className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-police-numbers font-semibold text-gray-700 dark:text-gray-300">{course.duration}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <BookOpen className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-police-numbers font-semibold text-gray-700 dark:text-gray-300">{course.modules} mód</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Target className="w-4 h-4 text-gray-500 mb-1" />
              <span className="text-xs font-police-numbers font-semibold text-gray-700 dark:text-gray-300">{course.questions} aulas</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-police-body uppercase tracking-wider">
                {feature}
              </span>
            ))}
            {course.features.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                +{course.features.length - 2} MAIS
              </span>
            )}
          </div>

          {/* Spacer to push footer down */}
          <div className="flex-1" />
          
          {/* Preço e Ação - Footer fixo */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {course.originalPrice && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through font-police-numbers">
                  R$ {course.originalPrice}
                </span>
              )}
              <div className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                R$ {course.price}
              </div>
            </div>
            {course.enrolled ? (
              <Link to={`/courses/${course.id}`}>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-police-body font-semibold uppercase tracking-wider gap-2"
                >
                  CONTINUAR
                  <Play className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm"
                disabled={enrollmentLoading === course.id}
                onClick={() => handleEnrollment(course.id)}
                className="bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrollmentLoading === course.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    REGISTRANDO...
                  </>
                ) : (
                  'INICIAR OPERAÇÃO'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const CourseListItem = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="mb-4 hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <div className="flex items-stretch">
          {/* Imagem */}
          <div className="relative w-48 h-32">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.badge && (
              <Badge className={cn("absolute top-2 left-2 font-police-body font-semibold uppercase tracking-wider", course.badge.color)}>
                {course.badge.text}
              </Badge>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Categoria e Nível */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-police-body font-semibold uppercase tracking-wider">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-police-body font-semibold uppercase tracking-wider">
                    {course.level}
                  </Badge>
                  {course.enrolled && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800 text-xs font-police-body font-semibold uppercase tracking-wider">
                      EM OPERAÇÃO
                    </Badge>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className="font-police-subtitle font-bold text-lg text-gray-900 dark:text-white mb-1 uppercase tracking-wider">
                  {course.title}
                </h3>
                <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {course.description}
                </p>

                {/* Instrutor e Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span className="font-police-body uppercase tracking-wider">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1 font-police-numbers">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 font-police-numbers">
                    <BookOpen className="w-3 h-3" />
                    <span>{course.modules} módulos</span>
                  </div>
                  <div className="flex items-center gap-1 font-police-numbers">
                    <Target className="w-3 h-3" />
                    <span>{course.questions} aulas</span>
                  </div>
                </div>
              </div>

              {/* Preço e Ação */}
              <div className="text-right ml-6">
                {course.originalPrice && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through font-police-numbers">
                    R$ {course.originalPrice}
                  </span>
                )}
                <div className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white mb-2">
                  R$ {course.price}
                </div>
                {course.enrolled ? (
                  <Link to={`/courses/${course.id}`}>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-police-body font-semibold uppercase tracking-wider gap-2"
                    >
                      CONTINUAR
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm"
                    disabled={enrollmentLoading === course.id}
                    onClick={() => handleEnrollment(course.id)}
                    className="bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrollmentLoading === course.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                        REGISTRANDO...
                      </>
                    ) : (
                      'INICIAR OPERAÇÃO'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progresso se matriculado */}
            {course.enrolled && course.progress !== undefined && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">{course.progress}% CONCLUÍDO</span>
                  <span className="text-gray-500 dark:text-gray-500 font-police-numbers">{course.modules} MÓDULOS • {course.questions} EXERCÍCIOS</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Função removida - não permite pausar curso
  /* const handleUnenrollment = async (courseId: string) => {
    try {
      setEnrollmentLoading(courseId);
      
      // Update enrollment status to paused instead of complete unenrollment
      const response = await courseService.updateEnrollmentStatus(courseId, 'paused', 'Operação pausada pelo agente');
      
      if (response.success) {
        // Remove from enrolled courses but keep progress
        setEnrolledCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
        
        // Update courses list to reflect new status
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { ...course, enrolled: false }
              : course
          )
        );
        
        toast.success('OPERAÇÃO PAUSADA COM SUCESSO!', {
          description: 'Seu progresso foi mantido. Você pode retomar a qualquer momento.',
          icon: '⏸️',
          duration: 5000
        });
      } else {
        toast.error(response.message || 'ERRO AO PAUSAR OPERAÇÃO', {
          icon: '❌',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Erro ao pausar matrícula:', error);
      toast.error('FALHA CRÍTICA AO PAUSAR OPERAÇÃO', {
        description: 'Tente novamente em alguns instantes',
        icon: '⚠️',
        duration: 4000
      });
    } finally {
      setEnrollmentLoading(null);
    }
  }; */

  const handleEnrollment = async (courseId: string) => {
    try {
      setEnrollmentLoading(courseId);
      
      // Verificar se já está matriculado
      const statusCheck = await courseService.checkEnrollmentStatus(courseId);
      if (statusCheck.data?.enrolled) {
        toast.error('AGENTE JÁ REGISTRADO NESTA OPERAÇÃO!', {
          icon: '⚠️',
          duration: 4000
        });
        setEnrollmentLoading(null);
        return;
      }
      
      // Realizar matrícula
      const response = await courseService.enrollInCourse(courseId);
      
      if (response.success) {
        // Atualizar estado local
        setEnrolledCourses(prev => new Set([...prev, courseId]));
        
        // Atualizar contadores de matrícula no curso
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { ...course, students: course.students + 1, enrolled: true }
              : course
          )
        );
        
        // Toast de sucesso com detalhes
        toast.success(response.message || 'MATRÍCULA OPERACIONAL CONFIRMADA!', {
          icon: '🎯',
          duration: 5000
        });
        
        // Mostrar próximos passos se disponíveis
        if (response.data?.next_steps) {
          setTimeout(() => {
            toast.success('PRÓXIMOS PASSOS OPERACIONAIS:', {
              description: response.data.next_steps[0],
              icon: '📋',
              duration: 6000
            });
          }, 2000);
        }
      } else {
        // Tratar casos especiais
        if (response.data?.status === 'already_enrolled') {
          setEnrolledCourses(prev => new Set([...prev, courseId]));
          setCourses(prevCourses => 
            prevCourses.map(course => 
              course.id === courseId 
                ? { ...course, enrolled: true }
                : course
            )
          );
        }
        
        toast.error(response.message || 'ERRO NA OPERAÇÃO DE MATRÍCULA', {
          icon: '❌',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Erro ao realizar matrícula:', error);
      toast.error('FALHA CRÍTICA NO SISTEMA OPERACIONAL', {
        description: 'Tente novamente em alguns instantes',
        icon: '⚠️',
        duration: 4000
      });
    } finally {
      setEnrollmentLoading(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            OPERAÇÕES DISPONÍVEIS
          </h1>
          <Badge variant="secondary" className="text-lg px-4 py-2 font-police-numbers">
            <Shield className="w-5 h-5 mr-2" />
{totalCourses} OPERAÇÕES ATIVAS
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
          SELECIONE SUA MISSÃO IDEAL PARA PREPARAÇÃO TÁTICA E ACELERE SUA APROVAÇÃO
        </p>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="OPERAÇÕES ATIVAS"
            value={totalCourses}
            icon={Shield}
            color="blue"
            variant="tactical"
            size="sm"
          />
          <StatCard
            title="EM ANDAMENTO"
            value={enrolledCourses.size}
            icon={Activity}
            color="green"
            variant="tactical"
            size="sm"
          />
          <StatCard
            title="FILTRO ATIVO"
            value={filteredCourses.length}
            icon={Crosshair}
            color="orange"
            variant="tactical"
            size="sm"
          />
          <StatCard
            title="MODALIDADE"
            value={viewMode === 'grid' ? 'GRADE' : 'LISTA'}
            icon={viewMode === 'grid' ? Grid : List}
            color="purple"
            variant="tactical"
            size="sm"
          />
        </div>
      </motion.div>

      {/* Barra de busca e filtros */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="BUSCAR POR OPERAÇÃO, COMANDANTE OU PALAVRA-CHAVE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider"
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
            >
              <Filter className="w-4 h-4" />
              FILTROS
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </Button>

            {/* Modo de visualização */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nível */}
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  NÍVEL OPERACIONAL
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Cursos matriculados */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyEnrolled}
                    onChange={(e) => setShowOnlyEnrolled(e.target.checked)}
                    className="w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
                  />
                  <span className="text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    APENAS OPERAÇÕES EM ANDAMENTO
                  </span>
                </label>
              </div>

              {/* Limpar filtros */}
              <div className="flex items-end justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setShowOnlyEnrolled(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  LIMPAR FILTROS
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-accent-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">CARREGANDO OPERAÇÕES...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
            ERRO AO CARREGAR OPERAÇÕES
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body">
            {error}
          </p>
          <Button
            onClick={loadCourses}
            className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
          >
            TENTAR NOVAMENTE
          </Button>
        </div>
      ) : filteredCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <div>
            {filteredCourses.map((course, index) => (
              <CourseListItem key={course.id} course={course} index={index} />
            ))}
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
            NENHUMA OPERAÇÃO ENCONTRADA
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">
            TENTE AJUSTAR OS FILTROS OU FAZER UMA NOVA BUSCA TÁTICA
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLevel('all');
              setShowOnlyEnrolled(false);
              setSearchTerm('');
            }}
            className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500"
          >
            LIMPAR FILTROS
          </Button>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white text-center border border-gray-200 dark:border-gray-700"
      >
        <Command className="w-12 h-12 mx-auto mb-4 text-accent-500" />
        <h2 className="text-2xl font-police-title font-bold mb-2 uppercase tracking-wider">
          NÃO ENCONTROU A OPERAÇÃO QUE PROCURA?
        </h2>
        <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-2xl mx-auto font-police-body">
          ESTAMOS SEMPRE ADICIONANDO NOVAS OPERAÇÕES. ENTRE EM CONTATO E NOS DIGA QUAL CONCURSO VOCÊ ESTÁ SE PREPARANDO!
        </p>
        <Button 
          variant="secondary" 
          size="lg"
          className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
          onClick={() => {
            toast.success('FUNÇÃO EM DESENVOLVIMENTO', {
              description: 'Em breve você poderá sugerir novas operações!',
              icon: '🚧'
            });
          }}
        >
          SUGERIR NOVA OPERAÇÃO
        </Button>
      </motion.div>
    </div>
  );
}