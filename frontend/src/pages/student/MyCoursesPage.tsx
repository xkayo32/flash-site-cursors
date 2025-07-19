import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  CheckCircle,
  Award,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  BookOpen,
  FileText,
  Brain,
  Target,
  BarChart3,
  Download,
  Star,
  ChevronRight,
  Grid,
  List,
  SortAsc,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  nextLesson: {
    id: string;
    title: string;
    duration: string;
  };
  certificate: {
    available: boolean;
    earnedAt?: string;
  };
  category: string;
  duration: string;
  expiresAt?: string;
}

// Dados mockados dos cursos matriculados
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: '1',
    title: 'Receita Federal - Auditor Fiscal',
    instructor: 'Prof. Ana Silva',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    progress: 45,
    totalLessons: 240,
    completedLessons: 108,
    lastAccessed: '2024-01-18',
    nextLesson: {
      id: '109',
      title: 'Direito Tributário - ICMS parte 2',
      duration: '45min'
    },
    certificate: {
      available: false
    },
    category: 'Fiscal',
    duration: '220h',
    expiresAt: '2024-12-31'
  },
  {
    id: '2',
    title: 'TCU - Auditor Federal de Controle',
    instructor: 'Prof. Paulo Santos',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    progress: 78,
    totalLessons: 180,
    completedLessons: 140,
    lastAccessed: '2024-01-17',
    nextLesson: {
      id: '141',
      title: 'Controle Externo - Fiscalização',
      duration: '30min'
    },
    certificate: {
      available: false
    },
    category: 'Controle',
    duration: '200h'
  },
  {
    id: '3',
    title: 'Português para Concursos',
    instructor: 'Prof. Maria Oliveira',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
    progress: 100,
    totalLessons: 60,
    completedLessons: 60,
    lastAccessed: '2024-01-15',
    nextLesson: {
      id: '',
      title: 'Curso concluído!',
      duration: ''
    },
    certificate: {
      available: true,
      earnedAt: '2024-01-15'
    },
    category: 'Base',
    duration: '40h'
  },
  {
    id: '4',
    title: 'Raciocínio Lógico - Nível Avançado',
    instructor: 'Prof. João Costa',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
    progress: 25,
    totalLessons: 80,
    completedLessons: 20,
    lastAccessed: '2024-01-10',
    nextLesson: {
      id: '21',
      title: 'Lógica Proposicional - Tabela Verdade',
      duration: '35min'
    },
    certificate: {
      available: false
    },
    category: 'Base',
    duration: '60h'
  }
];

// Estatísticas gerais
const learningStats = {
  totalHours: 124,
  currentStreak: 5,
  bestStreak: 15,
  coursesCompleted: 1,
  coursesInProgress: 3,
  averageProgress: 62,
  certificatesEarned: 1
};

export default function MyCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('lastAccessed');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpirationAlert, setShowExpirationAlert] = useState(true);

  // Filtrar e ordenar cursos
  const filteredCourses = mockEnrolledCourses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastAccessed':
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const categories = ['all', ...new Set(mockEnrolledCourses.map(c => c.category))];

  // Cursos próximos do vencimento (30 dias)
  const expiringCourses = mockEnrolledCourses.filter(course => {
    if (!course.expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(course.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const CourseCard = ({ course }: { course: EnrolledCourse }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "h-full hover:shadow-xl transition-all duration-300 overflow-hidden",
        course.progress === 100 && "ring-2 ring-green-500"
      )}>
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay com progresso */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white mb-2">
                <span className="text-sm font-medium">
                  {course.progress}% concluído
                </span>
                <span className="text-sm">
                  {course.completedLessons}/{course.totalLessons} aulas
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    course.progress === 100 ? "bg-green-500" : "bg-accent-500"
                  )}
                />
              </div>
            </div>
          </div>
          {/* Badge de conclusão */}
          {course.progress === 100 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Concluído
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Categoria e duração */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {course.category}
            </Badge>
            <span className="text-xs text-primary-500">
              <Clock className="w-3 h-3 inline mr-1" />
              {course.duration}
            </span>
          </div>

          {/* Título e instrutor */}
          <h3 className="font-bold text-lg text-primary-900 mb-1 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-primary-600 mb-4">{course.instructor}</p>

          {/* Próxima aula ou certificado */}
          {course.progress === 100 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Certificado disponível
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                  <Download className="w-4 h-4 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-primary-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-primary-600 mb-1">Próxima aula:</p>
              <p className="text-sm font-medium text-primary-900 line-clamp-1">
                {course.nextLesson.title}
              </p>
              <p className="text-xs text-primary-500 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {course.nextLesson.duration}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary-500">
              Acessado {new Date(course.lastAccessed).toLocaleDateString('pt-BR')}
            </span>
            <Link to={`/course/${course.id}/learn`}>
              <Button size="sm" className="gap-1">
                {course.progress === 100 ? 'Revisar' : 'Continuar'}
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Data de expiração se houver */}
          {course.expiresAt && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Acesso até {new Date(course.expiresAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const CourseListItem = ({ course }: { course: EnrolledCourse }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 overflow-hidden hover:shadow-lg transition-all">
        <div className="flex items-center p-4">
          {/* Thumbnail */}
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-32 h-20 object-cover rounded-lg mr-4"
          />

          {/* Informações do curso */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-primary-900 mb-1">{course.title}</h3>
                <p className="text-sm text-primary-600 mb-2">{course.instructor}</p>
                <div className="flex items-center gap-4 text-sm text-primary-500">
                  <span>{course.category}</span>
                  <span>{course.duration}</span>
                  <span>Acessado {new Date(course.lastAccessed).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Link to={`/course/${course.id}/learn`}>
                <Button size="sm">
                  {course.progress === 100 ? 'Revisar' : 'Continuar'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Barra de progresso */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{course.progress}% concluído</span>
                <span className="text-primary-500">
                  {course.completedLessons}/{course.totalLessons} aulas
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    course.progress === 100 ? "bg-green-500" : "bg-accent-500"
                  )}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6">
      {/* Alerta de cursos próximos do vencimento */}
      {showExpirationAlert && expiringCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-4">
            <Calendar className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Atenção: {expiringCourses.length} {expiringCourses.length === 1 ? 'curso expira' : 'cursos expiram'} em breve!
                  </h3>
                  <div className="space-y-2">
                    {expiringCourses.map(course => {
                      const daysLeft = Math.ceil(
                        (new Date(course.expiresAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={course.id} className="flex items-center justify-between text-sm">
                          <Link 
                            to={`/course/${course.id}/learn`}
                            className="text-amber-700 hover:text-amber-900 hover:underline font-medium"
                          >
                            {course.title}
                          </Link>
                          <span className="text-amber-600 font-medium">
                            {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setShowExpirationAlert(false)}
                  className="text-amber-600 hover:text-amber-700 p-1"
                  aria-label="Fechar alerta"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header com estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary-900 mb-6">Meus Cursos</h1>
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Horas estudadas</p>
                  <p className="text-2xl font-bold text-primary-900">{learningStats.totalHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-primary-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Sequência atual</p>
                  <p className="text-2xl font-bold text-primary-900">{learningStats.currentStreak} dias</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Cursos concluídos</p>
                  <p className="text-2xl font-bold text-primary-900">{learningStats.coursesCompleted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Progresso médio</p>
                  <p className="text-2xl font-bold text-primary-900">{learningStats.averageProgress}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filtro por categoria */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="lastAccessed">Último acesso</option>
              <option value="progress">Progresso</option>
              <option value="title">Nome do curso</option>
            </select>
          </div>

          {/* Modo de visualização */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Lista de cursos */}
      {filteredCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div>
            {filteredCourses.map((course) => (
              <CourseListItem key={course.id} course={course} />
            ))}
          </div>
        )
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-primary-600 mb-6">
            Tente ajustar os filtros ou explore nosso catálogo
          </p>
          <Link to="/courses">
            <Button>
              Explorar novos cursos
            </Button>
          </Link>
        </Card>
      )}


      {/* Sugestão de novos cursos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-primary-50 rounded-lg p-6 text-center"
      >
        <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary-900 mb-2">
          Continue evoluindo!
        </h3>
        <p className="text-primary-600 mb-4">
          Explore novos cursos para complementar sua preparação
        </p>
        <Link to="/courses">
          <Button variant="outline">
            Ver catálogo completo
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}