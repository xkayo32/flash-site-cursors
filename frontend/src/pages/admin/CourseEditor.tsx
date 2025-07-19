import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Video,
  FileText,
  Brain,
  Star,
  MoreVertical,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Link2,
  Folder,
  ChevronRight,
  Image,
  File,
  DollarSign,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data
const courses = [
  {
    id: 1,
    title: 'Polícia Federal - Agente',
    slug: 'policia-federal-agente',
    category: 'Polícia',
    instructor: 'Prof. Dr. Carlos Lima',
    status: 'published',
    visibility: 'public',
    price: 199.90,
    duration: '6 meses',
    totalHours: 320,
    enrollments: 1234,
    rating: 4.8,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    modules: 12,
    lessons: 148,
    resources: {
      videos: 148,
      questions: 3500,
      flashcards: 1200,
      summaries: 45,
      laws: 23
    },
    description: 'Curso completo para o concurso da Polícia Federal - Agente',
    thumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    id: 2,
    title: 'Receita Federal - Auditor',
    slug: 'receita-federal-auditor',
    category: 'Receita',
    instructor: 'Prof. Ana Santos',
    status: 'draft',
    visibility: 'private',
    price: 299.90,
    duration: '8 meses',
    totalHours: 450,
    enrollments: 0,
    rating: 0,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14',
    modules: 18,
    lessons: 220,
    resources: {
      videos: 220,
      questions: 5000,
      flashcards: 1800,
      summaries: 60,
      laws: 35
    },
    description: 'Preparação completa para Auditor da Receita Federal',
    thumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    id: 3,
    title: 'TRT/TRF - Analista Judiciário',
    slug: 'trt-trf-analista',
    category: 'Tribunais',
    instructor: 'Prof. Maria Oliveira',
    status: 'published',
    visibility: 'public',
    price: 149.90,
    duration: '4 meses',
    totalHours: 180,
    enrollments: 856,
    rating: 4.6,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-13',
    modules: 8,
    lessons: 96,
    resources: {
      videos: 96,
      questions: 2000,
      flashcards: 800,
      summaries: 30,
      laws: 15
    },
    description: 'Curso focado em concursos para Tribunais',
    thumbnail: 'https://via.placeholder.com/300x200'
  }
];

const categories = ['Todos', 'Polícia', 'Receita', 'Tribunais', 'Bancários', 'Educação'];
const statuses = ['Todos', 'published', 'draft', 'archived'];

// Mock modules for course
const courseModules = [
  {
    id: 1,
    title: 'Módulo 1 - Direito Constitucional',
    order: 1,
    lessons: [
      { id: 1, title: 'Introdução ao Direito Constitucional', duration: '45:00', type: 'video' },
      { id: 2, title: 'Princípios Fundamentais', duration: '60:00', type: 'video' },
      { id: 3, title: 'Questões - Princípios', duration: '30:00', type: 'questions' }
    ]
  },
  {
    id: 2,
    title: 'Módulo 2 - Direito Administrativo',
    order: 2,
    lessons: [
      { id: 4, title: 'Conceitos Básicos', duration: '50:00', type: 'video' },
      { id: 5, title: 'Atos Administrativos', duration: '55:00', type: 'video' },
      { id: 6, title: 'Flashcards - Atos', duration: '20:00', type: 'flashcards' }
    ]
  }
];

export default function CourseEditor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || course.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      archived: { label: 'Arquivado', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsEditing(true);
    setShowCourseModal(true);
    setActiveTab('details');
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setShowCourseModal(true);
    setActiveTab('details');
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(false);
    setShowCourseModal(true);
    setActiveTab('details');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Editor de Cursos
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Crie e gerencie cursos completos com módulos e aulas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button onClick={handleCreateCourse} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Curso
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Cursos
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {courses.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Cursos Ativos
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Total de Alunos
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  {courses.reduce((acc, course) => acc + course.enrollments, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                  Receita Total
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                  R$ {(courses.reduce((acc, course) => acc + (course.price * course.enrollments), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(course.status)}
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-primary-600 dark:text-gray-400">
                  {course.instructor} • {course.category}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Duração</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.duration} ({course.totalHours}h)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Módulos/Aulas</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.modules} / {course.lessons}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Alunos</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.enrollments}
                  </span>
                </div>
                {course.rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-600 dark:text-gray-400">Avaliação</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-primary-900 dark:text-white">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewCourse(course)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditCourse(course)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCourseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {isEditing ? (selectedCourse ? 'Editar Curso' : 'Criar Novo Curso') : 'Detalhes do Curso'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCourseModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {['details', 'modules', 'resources', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab === 'details' && 'Detalhes'}
                    {tab === 'modules' && 'Módulos'}
                    {tab === 'resources' && 'Recursos'}
                    {tab === 'settings' && 'Configurações'}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Título do Curso
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedCourse?.title}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Categoria
                        </label>
                        <select
                          defaultValue={selectedCourse?.category}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          {categories.filter(c => c !== 'Todos').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Instrutor
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedCourse?.instructor}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Preço (R$)
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCourse?.price}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Duração
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedCourse?.duration}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Carga Horária Total
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedCourse?.totalHours}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        rows={4}
                        defaultValue={selectedCourse?.description}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        Imagem de Capa
                      </label>
                      <div className="flex items-center gap-4">
                        {selectedCourse?.thumbnail && (
                          <img
                            src={selectedCourse.thumbnail}
                            alt="Thumbnail"
                            className="w-32 h-20 object-cover rounded-lg"
                          />
                        )}
                        {isEditing && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Escolher Imagem
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'modules' && (
                  <div className="space-y-4">
                    {isEditing && (
                      <div className="flex justify-end mb-4">
                        <Button size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Módulo
                        </Button>
                      </div>
                    )}

                    {courseModules.map((module) => (
                      <Card key={module.id}>
                        <CardHeader className="cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                              <h4 className="font-semibold text-primary-900 dark:text-white">
                                {module.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {module.lessons.length} aulas
                              </Badge>
                              {isEditing && (
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                                  {lesson.type === 'questions' && <Brain className="w-4 h-4 text-purple-600" />}
                                  {lesson.type === 'flashcards' && <Star className="w-4 h-4 text-yellow-600" />}
                                  <span className="text-sm text-primary-900 dark:text-white">
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-primary-600 dark:text-gray-400">
                                    {lesson.duration}
                                  </span>
                                  {isEditing && (
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Video className="w-8 h-8 text-blue-600" />
                          <span className="text-2xl font-bold text-primary-900 dark:text-white">
                            {selectedCourse?.resources.videos || 0}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Vídeos</p>
                        {isEditing && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Gerenciar
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Brain className="w-8 h-8 text-purple-600" />
                          <span className="text-2xl font-bold text-primary-900 dark:text-white">
                            {selectedCourse?.resources.questions || 0}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Questões</p>
                        {isEditing && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Gerenciar
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Star className="w-8 h-8 text-yellow-600" />
                          <span className="text-2xl font-bold text-primary-900 dark:text-white">
                            {selectedCourse?.resources.flashcards || 0}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Flashcards</p>
                        {isEditing && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Gerenciar
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <FileText className="w-8 h-8 text-green-600" />
                          <span className="text-2xl font-bold text-primary-900 dark:text-white">
                            {selectedCourse?.resources.summaries || 0}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Resumos</p>
                        {isEditing && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Gerenciar
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <FileText className="w-8 h-8 text-red-600" />
                          <span className="text-2xl font-bold text-primary-900 dark:text-white">
                            {selectedCourse?.resources.laws || 0}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 dark:text-gray-400">Legislação</p>
                        {isEditing && (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Gerenciar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Status do Curso
                        </label>
                        <select
                          defaultValue={selectedCourse?.status}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="published">Publicado</option>
                          <option value="draft">Rascunho</option>
                          <option value="archived">Arquivado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Visibilidade
                        </label>
                        <select
                          defaultValue={selectedCourse?.visibility}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="public">Público</option>
                          <option value="private">Privado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                        URL do Curso (Slug)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary-600 dark:text-gray-400">
                          studypro.com/curso/
                        </span>
                        <input
                          type="text"
                          defaultValue={selectedCourse?.slug}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowCourseModal(false)}
                >
                  Cancelar
                </Button>
                {isEditing ? (
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Curso
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}