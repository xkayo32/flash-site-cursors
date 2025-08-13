import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Shield,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  Lock,
  Star,
  Calendar,
  Clock,
  Upload,
  EyeOff,
  Grid3X3,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourseImage } from '@/components/CourseImage';
import { mockCourses, courseCategories, courseStatuses, filterCourses, type MockCourse } from '@/data/mockCourses';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';


export default function CourseEditor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [courses, setCourses] = useState<MockCourse[]>(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCourses = filterCourses(courses, searchTerm, selectedCategory, selectedStatus);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PUBLICADO': { 
        label: 'PUBLICADO', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600',
        icon: CheckCircle
      },
      'RASCUNHO': { 
        label: 'RASCUNHO', 
        color: 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-400 dark:border-gray-700',
        icon: Edit
      },
      'ARQUIVADO': { 
        label: 'ARQUIVADO', 
        color: 'bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-500 border-2 border-gray-400 dark:border-gray-700 opacity-75',
        icon: Lock
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['RASCUNHO'];
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
  
  const getLevelBadge = (level: string) => {
    const levelConfig = {
      'OPERACIONAL': { 
        label: 'OPERACIONAL', 
        color: 'bg-accent-500/20 text-accent-500 dark:text-accent-400 border-2 border-accent-500/50',
        icon: Shield
      },
      'TÁTICO': { 
        label: 'TÁTICO', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-400',
        icon: Target
      },
      'COMANDO': { 
        label: 'COMANDO', 
        color: 'bg-gray-900 dark:bg-accent-500/20 text-white dark:text-accent-400 border-2 border-gray-700 dark:border-accent-500/50',
        icon: Award
      }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig['OPERACIONAL'];
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

  const handleCreateCourse = () => {
    navigate('/admin/courses/new');
  };

  const handleEditCourse = (courseId: number) => {
    navigate(`/admin/courses/edit/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/admin/courses/${courseId}`);
  };
  
  const handleDeleteCourse = (course: MockCourse) => {
    if (confirm(`Tem certeza que deseja excluir o curso "${course.title}"?`)) {
      // Simulação de exclusão
      setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
      toast.success(`Curso "${course.title}" excluído com sucesso!`);
    }
  };

  const handleDuplicateCourse = (course: MockCourse) => {
    const newCourse: MockCourse = {
      ...course,
      id: Math.max(...courses.map(c => c.id)) + 1,
      title: `${course.title} (CÓPIA)`,
      status: 'RASCUNHO',
      stats: {
        ...course.stats,
        enrollments: 0,
        rating: 0,
        completion: 0,
        views: 0
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setCourses(prevCourses => [newCourse, ...prevCourses]);
    toast.success(`Curso duplicado como "${newCourse.title}"!`);
  };

  const renderListView = () => (
    <div className="space-y-3">
      {filteredCourses.map((course) => (
        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-accent-500/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <CourseImage
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                  fallbackCategory={course.category}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider truncate">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-police-body truncate">
                        {course.instructor.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(course.status)}
                    {getLevelBadge(course.level)}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-police-body">{course.duration.hours}h</span>
                  <span className="font-police-body">{course.stats.modules} módulos</span>
                  <span className="font-police-body">{course.stats.enrollments.toLocaleString('pt-BR')} recrutas</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent-500 fill-current" />
                    <span className="font-police-numbers">
                      {course.stats.rating > 0 ? course.stats.rating : '--'}
                    </span>
                  </div>
                  <Badge className="bg-gray-900/80 text-white border-0 font-police-numbers">
                    R$ {course.price.toLocaleString('pt-BR')}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-police-body font-semibold uppercase tracking-wider text-xs h-8"
                  onClick={() => handleViewCourse(course.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  VER
                </Button>
                <Button
                  size="sm"
                  className="font-police-body font-semibold uppercase tracking-wider text-xs bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black h-8"
                  onClick={() => handleEditCourse(course.id)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  EDITAR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300 h-8 px-2"
                  onClick={() => handleDeleteCourse(course)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full relative">
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
            EDITOR DE OPERAÇÕES TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider mt-2">
            COMANDO CENTRAL - CONFIGURAÇÃO DE MISSÕES E TREINAMENTOS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2 font-police-body"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2 font-police-body"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={handleCreateCourse} 
            className="gap-2 font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
          >
            <Plus className="w-4 h-4" />
            NOVA OPERAÇÃO
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">
                    TOTAL DE CURSOS
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {courses.length}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <BookOpen className="w-5 h-5 text-gray-700 dark:text-accent-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-gray-600" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    PUBLICADOS
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {courses.filter(c => c.status === 'PUBLICADO').length}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Shield className="w-5 h-5 text-gray-700 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-gray-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">
                    RASCUNHOS
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-police-numbers">
                    {courses.filter(c => c.status === 'RASCUNHO').length}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Edit className="w-5 h-5 text-gray-700 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR MISSÕES..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:text-gray-500 placeholder:uppercase placeholder:tracking-wider"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
              >
                {courseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
              >
                {courseStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                CARREGANDO MISSÕES...
              </p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-ultra-wide">
                NENHUMA MISSÃO ENCONTRADA
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-police-body">
                Ajuste os filtros ou crie uma nova missão de treinamento
              </p>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          renderListView()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-500/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                <CourseImage
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  fallbackCategory={course.category}
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(course.status)}
                </div>
                <div className="absolute top-2 left-2">
                  {getLevelBadge(course.level)}
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-gray-900/80 text-white border-0 font-police-numbers text-xs">
                    R$ {course.price.toLocaleString('pt-BR')}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-police-body truncate">
                        {course.instructor.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-police-body truncate">
                        {course.instructor.rank}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                    {course.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">DURAÇÃO</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.duration.hours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">MÓDULOS</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.stats.modules}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">RECRUTAS</span>
                    <span className="font-bold text-gray-900 dark:text-white font-police-numbers">
                      {course.stats.enrollments.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-police-body">RATING</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-accent-500 fill-current" />
                      <span className="font-bold text-gray-900 dark:text-white font-police-numbers">
                        {course.stats.rating > 0 ? course.stats.rating : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-police-body font-semibold uppercase tracking-wider text-xs h-8"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    VER
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 font-police-body font-semibold uppercase tracking-wider text-xs bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black h-8"
                    onClick={() => handleEditCourse(course.id)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    EDITAR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300 h-8 px-2"
                    onClick={() => handleDeleteCourse(course)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}