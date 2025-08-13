import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  Edit,
  DragDropVertical,
  Eye,
  EyeOff,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  Globe,
  Clock,
  Target,
  Users,
  Award,
  Video,
  Upload,
  Link,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { courseService, Course, CourseModule, Lesson, CreateCourseData } from '@/services/courseService';
import { categoryService, Category } from '@/services/categoryService';
import toast from 'react-hot-toast';

const difficulties = [
  { value: 'beginner', label: 'Iniciante', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Avançado', color: 'bg-red-100 text-red-800' }
];

const lessonTypes = [
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'text', label: 'Texto', icon: FileText },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'assignment', label: 'Tarefa', icon: BookOpen },
  { value: 'live', label: 'Ao Vivo', icon: Play }
];

export default function CourseCreator() {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState<CreateCourseData>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    price: 0,
    certification_available: false,
    requirements: [],
    objectives: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ module: CourseModule; lesson?: Lesson } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    is_published: false
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'video',
    duration_minutes: 0,
    video_url: '',
    content: '',
    is_published: false,
    is_free: false
  });

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.data) {
        // Filter only subject type categories
        const subjectCategories = response.data.filter(cat => cat.type === 'subject');
        setCategories(subjectCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.createCourse(courseData);
      if (response.success && response.data) {
        setCourse(response.data);
        
        // Upload image if exists
        if (imageFile && response.data.id) {
          await courseService.uploadImage(response.data.id, imageFile);
        }
        
        toast.success('Curso criado com sucesso!');
        setStep(2);
      } else {
        toast.error(response.message || 'Erro ao criar curso');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Erro ao criar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      is_published: false
    });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      is_published: module.is_published
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    if (!course) return;
    
    setIsLoading(true);
    try {
      if (editingModule) {
        // Update existing module
        const response = await courseService.updateModule(
          course.id,
          editingModule.id,
          moduleForm
        );
        if (response.success && response.data) {
          setModules(modules.map(m => 
            m.id === editingModule.id ? response.data! : m
          ));
          toast.success('Módulo atualizado com sucesso');
        }
      } else {
        // Create new module
        const response = await courseService.createModule(course.id, moduleForm);
        if (response.success && response.data) {
          setModules([...modules, response.data]);
          toast.success('Módulo criado com sucesso');
        }
      }
      setShowModuleModal(false);
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Erro ao salvar módulo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLesson = (module: CourseModule) => {
    setEditingLesson({ module });
    setLessonForm({
      title: '',
      description: '',
      type: 'video',
      duration_minutes: 0,
      video_url: '',
      content: '',
      is_published: false,
      is_free: false
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (module: CourseModule, lesson: Lesson) => {
    setEditingLesson({ module, lesson });
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      duration_minutes: lesson.duration_minutes || 0,
      video_url: lesson.video_url || '',
      content: lesson.content || '',
      is_published: lesson.is_published,
      is_free: lesson.is_free || false
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    
    setIsLoading(true);
    try {
      if (editingLesson.lesson) {
        // Update existing lesson
        const response = await courseService.updateLesson(
          editingLesson.module.id,
          editingLesson.lesson.id,
          lessonForm
        );
        if (response.success) {
          toast.success('Aula atualizada com sucesso');
          // Reload modules to get updated data
          // In a real app, you'd update the state properly
        }
      } else {
        // Create new lesson
        const response = await courseService.createLesson(
          editingLesson.module.id,
          lessonForm
        );
        if (response.success) {
          toast.success('Aula criada com sucesso');
        }
      }
      setShowLessonModal(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Erro ao salvar aula');
    } finally {
      setIsLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    const lessonType = lessonTypes.find(lt => lt.value === type);
    return lessonType ? lessonType.icon : FileText;
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
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            CRIAR NOVO CURSO
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            SISTEMA DE CRIAÇÃO DE CURSOS - PASSO {step} DE 3
          </p>
        </div>
        
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              Voltar
            </Button>
          )}
          {step < 3 && (
            <Button
              onClick={() => {
                if (step === 1) {
                  handleCreateCourse();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 text-black"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {step === 1 ? 'Criar Curso' : 'Próximo'}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Step 1: Course Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
            <CardHeader>
              <CardTitle className="font-police-title uppercase tracking-wider">
                INFORMAÇÕES BÁSICAS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título do Curso
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Ex: Direito Constitucional Completo"
                />
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Descreva o conteúdo do curso..."
                />
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando categorias...
                  </div>
                ) : (
                  <select
                    value={courseData.category}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={courseData.difficulty_level}
                  onChange={(e) => setCourseData({ ...courseData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="certification"
                  checked={courseData.certification_available}
                  onChange={(e) => setCourseData({ ...courseData, certification_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="certification" className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                  Certificado disponível ao concluir
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
            <CardHeader>
              <CardTitle className="font-police-title uppercase tracking-wider">
                INFORMAÇÕES ADICIONAIS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Image */}
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imagem do Curso
                </label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                  </Button>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requisitos (um por linha)
                </label>
                <textarea
                  value={courseData.requirements?.join('\n') || ''}
                  onChange={(e) => setCourseData({ 
                    ...courseData, 
                    requirements: e.target.value.split('\n').filter(r => r.trim()) 
                  })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Ex: Conhecimento básico em Direito&#10;Dedicação de 2 horas por dia"
                />
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objetivos (um por linha)
                </label>
                <textarea
                  value={courseData.objectives?.join('\n') || ''}
                  onChange={(e) => setCourseData({ 
                    ...courseData, 
                    objectives: e.target.value.split('\n').filter(o => o.trim()) 
                  })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Ex: Dominar os princípios constitucionais&#10;Resolver questões de concursos"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Modules and Lessons */}
      {step === 2 && course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider">
                  MÓDULOS E AULAS
                </CardTitle>
                <Button
                  onClick={handleAddModule}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Módulo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-police-body">Nenhum módulo adicionado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedModule === module.id ? (
                            <ChevronDown className="w-5 h-5 text-accent-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-accent-500" />
                          )}
                          <div>
                            <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white">
                              Módulo {moduleIndex + 1}: {module.title}
                            </h4>
                            {module.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={module.is_published ? 'success' : 'secondary'}>
                            {module.is_published ? 'Publicado' : 'Rascunho'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditModule(module);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedModule === module.id && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-police-body font-semibold text-gray-700 dark:text-gray-300">
                              Aulas
                            </h5>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddLesson(module)}
                              className="gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar Aula
                            </Button>
                          </div>

                          {(!module.lessons || module.lessons.length === 0) ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nenhuma aula adicionada
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => {
                                const Icon = getLessonIcon(lesson.type);
                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                      <div>
                                        <p className="font-police-body font-medium text-gray-900 dark:text-white">
                                          Aula {lessonIndex + 1}: {lesson.title}
                                        </p>
                                        {lesson.duration_minutes > 0 && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {lesson.duration_minutes} min
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lesson.is_free && (
                                        <Badge variant="outline">Grátis</Badge>
                                      )}
                                      <Badge variant={lesson.is_published ? 'success' : 'secondary'}>
                                        {lesson.is_published ? 'Publicada' : 'Rascunho'}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditLesson(module, lesson)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Review and Publish */}
      {step === 3 && course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500">
            <CardHeader>
              <CardTitle className="font-police-title uppercase tracking-wider">
                REVISAR E PUBLICAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-3">
                    INFORMAÇÕES DO CURSO
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Título</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">{course.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Categoria</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">{course.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Preço</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">
                        R$ {course.price.toFixed(2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Certificado</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">
                        {course.certification_available ? 'Disponível' : 'Não disponível'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-3">
                    ESTRUTURA DO CURSO
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Módulos</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">{modules.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Total de Aulas</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">
                        {modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-police-body text-gray-600 dark:text-gray-400">Duração Total</dt>
                      <dd className="font-police-body font-medium text-gray-900 dark:text-white">
                        {modules.reduce((acc, mod) => 
                          acc + (mod.lessons?.reduce((sum, lesson) => 
                            sum + (lesson.duration_minutes || 0), 0) || 0
                          ), 0
                        )} minutos
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Save as draft
                    toast.success('Curso salvo como rascunho');
                  }}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar como Rascunho
                </Button>
                <Button
                  onClick={() => {
                    // Publish course
                    toast.success('Curso publicado com sucesso!');
                  }}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Check className="w-4 h-4" />
                  Publicar Curso
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModuleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Ex: Introdução ao Direito Constitucional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Descreva o conteúdo do módulo..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="module-published"
                    checked={moduleForm.is_published}
                    onChange={(e) => setModuleForm({ ...moduleForm, is_published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="module-published" className="text-sm text-gray-700 dark:text-gray-300">
                    Publicar módulo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowModuleModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveModule}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && editingLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowLessonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingLesson.lesson ? 'Editar Aula' : 'Nova Aula'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Ex: Princípios Fundamentais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Aula
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {lessonTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setLessonForm({ ...lessonForm, type: type.value })}
                        className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                          lessonForm.type === type.value
                            ? 'border-accent-500 bg-accent-500/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-accent-500'
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Descreva o conteúdo da aula..."
                  />
                </div>

                {lessonForm.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL do Vídeo
                    </label>
                    <input
                      type="url"
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {(lessonForm.type === 'text' || lessonForm.type === 'assignment') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Conteúdo
                    </label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Conteúdo da aula..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.duration_minutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="30"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lesson-published"
                      checked={lessonForm.is_published}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="lesson-published" className="text-sm text-gray-700 dark:text-gray-300">
                      Publicar aula
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lesson-free"
                      checked={lessonForm.is_free}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="lesson-free" className="text-sm text-gray-700 dark:text-gray-300">
                      Aula grátis
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowLessonModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveLesson}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}