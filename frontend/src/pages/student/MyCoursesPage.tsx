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
  X,
  Shield,
  Command,
  Activity,
  Crosshair,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

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

// Dados mockados das operações em andamento
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: '1',
    title: 'OPERAÇÃO RECEITA FEDERAL - AUDITOR FISCAL',
    instructor: 'COMANDANTE ANA SILVA',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    progress: 45,
    totalLessons: 240,
    completedLessons: 108,
    lastAccessed: '2024-01-18',
    nextLesson: {
      id: '109',
      title: 'BRIEFING TRIBUTÁRIO - ICMS PARTE 2',
      duration: '45min'
    },
    certificate: {
      available: false
    },
    category: 'FISCAL',
    duration: '220H TÁTICAS',
    expiresAt: '2024-12-31'
  },
  {
    id: '2',
    title: 'OPERAÇÃO TCU - AUDITOR FEDERAL DE CONTROLE',
    instructor: 'COMANDANTE PAULO SANTOS',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    progress: 78,
    totalLessons: 180,
    completedLessons: 140,
    lastAccessed: '2024-01-17',
    nextLesson: {
      id: '141',
      title: 'MISSÃO CONTROLE EXTERNO - FISCALIZAÇÃO',
      duration: '30min'
    },
    certificate: {
      available: false
    },
    category: 'CONTROLE',
    duration: '200H ESPECIALIZADAS'
  },
  {
    id: '3',
    title: 'OPERAÇÃO COMUNICAÇÃO TÁTICA - PORTUGUÊS',
    instructor: 'COMANDANTE MARIA OLIVEIRA',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
    progress: 100,
    totalLessons: 60,
    completedLessons: 60,
    lastAccessed: '2024-01-15',
    nextLesson: {
      id: '',
      title: 'MISSÃO CONCLUÍDA!',
      duration: ''
    },
    certificate: {
      available: true,
      earnedAt: '2024-01-15'
    },
    category: 'BASE',
    duration: '40H TÁTICAS'
  },
  {
    id: '4',
    title: 'OPERAÇÃO INTELIGÊNCIA - RACIOCÍNIO AVANÇADO',
    instructor: 'COMANDANTE JOÃO COSTA',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
    progress: 25,
    totalLessons: 80,
    completedLessons: 20,
    lastAccessed: '2024-01-10',
    nextLesson: {
      id: '21',
      title: 'ANÁLISE PROPOSICIONAL - TABELA VERDADE',
      duration: '35min'
    },
    certificate: {
      available: false
    },
    category: 'BASE',
    duration: '60H ESPECIALIZADAS'
  }
];

// Estatísticas operacionais
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

  // Operações próximas do prazo limite (30 dias)
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
        "h-full hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700",
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
                <span className="text-sm font-medium font-police-body uppercase tracking-wider">
                  {course.progress}% EXECUTADO
                </span>
                <span className="text-sm font-police-numbers">
                  {course.completedLessons}/{course.totalLessons} BRIEFINGS
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          </div>
          {/* Badge de conclusão */}
          {course.progress === 100 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gray-900 text-white border-0 font-police-body font-semibold uppercase tracking-wider">
                <CheckCircle className="w-3 h-3 mr-1" />
                MISSÃO COMPLETA
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Categoria e duração */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs font-police-body font-semibold uppercase tracking-wider">
              {course.category}
            </Badge>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-police-numbers">
              <Clock className="w-3 h-3 inline mr-1" />
              {course.duration}
            </span>
          </div>

          {/* Título e comandante */}
          <h3 className="font-police-subtitle font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 uppercase tracking-wider">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">{course.instructor}</p>

          {/* Próximo briefing ou condecoração */}
          {course.progress === 100 ? (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-police-body uppercase tracking-wider">
                    CONDECORAÇÃO DISPONÍVEL
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 font-police-body uppercase tracking-wider"
                  onClick={() => {
                    // TODO: Implementar download real do certificado
                    toast.success('CONDECORAÇÃO BAIXADA COM SUCESSO!', { 
                      icon: '🏆',
                      description: 'Verifique sua pasta de downloads'
                    });
                    // Simulação de download
                    const link = document.createElement('a');
                    link.href = '#';
                    link.download = `certificado-${course.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                    // link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  BAIXAR
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-police-body uppercase tracking-wider">PRÓXIMO BRIEFING:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 font-police-subtitle uppercase tracking-wider">
                {course.nextLesson.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-numbers">
                <Clock className="w-3 h-3 inline mr-1" />
                {course.nextLesson.duration}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500 font-police-body uppercase tracking-wider">
              ACESSO {new Date(course.lastAccessed).toLocaleDateString('pt-BR')}
            </span>
            <Link to={`/student/courses/${course.id}/learn`}>
              <Button 
                size="sm" 
                className="gap-1 bg-gray-900 hover:bg-gray-800 text-white font-police-body font-semibold uppercase tracking-wider"
              >
                {course.progress === 100 ? 'REVISAR' : 'CONTINUAR'}
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Data de expiração se houver */}
          {course.expiresAt && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-police-body uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                PRAZO LIMITE {new Date(course.expiresAt).toLocaleDateString('pt-BR')}
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
      <Card className="mb-4 overflow-hidden hover:shadow-lg transition-all bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
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
                <h3 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-police-body uppercase tracking-wider">{course.instructor}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span className="font-police-body uppercase tracking-wider">{course.category}</span>
                  <span className="font-police-numbers">{course.duration}</span>
                  <span className="font-police-body uppercase tracking-wider">ACESSO {new Date(course.lastAccessed).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Link to={`/student/courses/${course.id}/learn`}>
                <Button 
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-police-body font-semibold uppercase tracking-wider"
                >
                  {course.progress === 100 ? 'REVISAR' : 'CONTINUAR'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Barra de progresso */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-900 dark:text-white font-police-body uppercase tracking-wider">{course.progress}% EXECUTADO</span>
                <span className="text-gray-500 dark:text-gray-500 font-police-numbers">
                  {course.completedLessons}/{course.totalLessons} BRIEFINGS
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gray-900 dark:bg-gray-100"
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
      {/* Alerta de operações próximas do prazo limite */}
      {showExpirationAlert && expiringCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 font-police-subtitle uppercase tracking-wider">
                    ALERTA: {expiringCourses.length} {expiringCourses.length === 1 ? 'OPERAÇÃO PRÓXIMA' : 'OPERAÇÕES PRÓXIMAS'} DO PRAZO LIMITE!
                  </h3>
                  <div className="space-y-2">
                    {expiringCourses.map(course => {
                      const daysLeft = Math.ceil(
                        (new Date(course.expiresAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={course.id} className="flex items-center justify-between text-sm">
                          <Link 
                            to={`/student/courses/${course.id}/learn`}
                            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline font-medium font-police-body uppercase tracking-wider"
                          >
                            {course.title}
                          </Link>
                          <span className="text-gray-600 dark:text-gray-400 font-medium font-police-numbers">
                            {daysLeft} {daysLeft === 1 ? 'DIA' : 'DIAS'} RESTANTES
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setShowExpirationAlert(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">MINHAS OPERAÇÕES</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2 font-police-numbers">
            <Shield className="w-5 h-5 mr-2" />
            {mockEnrolledCourses.length} EM ANDAMENTO
          </Badge>
        </div>
        
        {/* Cards de estatísticas operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">HORAS OPERACIONAIS</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">{learningStats.totalHours}H</p>
                </div>
                <Clock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">SEQUÊNCIA ATIVA</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">{learningStats.currentStreak} DIAS</p>
                </div>
                <Activity className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">MISSÕES COMPLETAS</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">{learningStats.coursesCompleted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">EFICIÊNCIA MÉDIA</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">{learningStats.averageProgress}%</p>
                </div>
                <Crosshair className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="BUSCAR OPERAÇÕES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider"
              />
            </div>

            {/* Filtro por categoria */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
            >
              <option value="all">TODAS AS CATEGORIAS</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
            >
              <option value="lastAccessed">ÚLTIMO ACESSO</option>
              <option value="progress">PROGRESSO</option>
              <option value="title">NOME DA OPERAÇÃO</option>
            </select>
          </div>

          {/* Modo de visualização */}
          <div className="flex items-center gap-2">
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
      </motion.div>

      {/* Lista de operações */}
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
        <Card className="p-12 text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <Command className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider">
            NENHUMA OPERAÇÃO ENCONTRADA
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body uppercase tracking-wider">
            AJUSTE OS FILTROS OU EXPLORE NOVAS OPERAÇÕES DISPONÍVEIS
          </p>
          <Link to="/student/courses">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white font-police-body font-semibold uppercase tracking-wider">
              EXPLORAR OPERAÇÕES
            </Button>
          </Link>
        </Card>
      )}


      {/* Sugestão de novas operações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white text-center border border-gray-200 dark:border-gray-700"
      >
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-police-title font-semibold text-white mb-2 uppercase tracking-wider">
          CONTINUE EXPANDINDO SEU ARSENAL!
        </h3>
        <p className="text-gray-300 dark:text-gray-400 mb-4 font-police-body">
          EXPLORE NOVAS OPERAÇÕES PARA COMPLEMENTAR SUA PREPARAÇÃO TÁTICA
        </p>
        <Link to="/student/courses">
          <Button 
            variant="secondary"
            className="bg-white hover:bg-gray-100 text-black font-police-body font-semibold uppercase tracking-wider"
          >
            VER OPERAÇÕES DISPONÍVEIS
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}