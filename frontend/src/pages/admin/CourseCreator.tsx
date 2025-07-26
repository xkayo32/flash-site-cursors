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
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { courseService, Course, CourseModule, Lesson, CreateCourseData } from '@/services/courseService';
import toast from 'react-hot-toast';

const categories = [
  'Direito Constitucional',
  'Direito Administrativo', 
  'Direito Penal',
  'Direito Civil',
  'Informática',
  'Português',
  'Matemática',
  'Conhecimentos Gerais'
];

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

  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato de imagem não permitido. Use: JPEG, PNG, GIF, WebP ou SVG');
        e.target.value = ''; // Reset input
        return;
      }
      
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Imagem muito grande. Tamanho máximo: 5MB');
        e.target.value = ''; // Reset input
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo de imagem');
        console.error('FileReader error');
      };
      reader.readAsDataURL(file);
    } else {
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
    }
  };

  // Step 1: Basic Course Info
  const handleCourseSubmit = async () => {
    if (!courseData.title || !courseData.category) {
      toast.error('Título e categoria são obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create course without image
      const response = await courseService.createCourse(courseData);
      if (response.success && response.data) {
        const createdCourse = response.data as Course;
        
        // Step 2: Upload image if selected
        if (imageFile && createdCourse.id) {
          const formData = new FormData();
          formData.append('thumbnail', imageFile);
          
          const uploadResponse = await courseService.uploadCourseImage(createdCourse.id, formData);
          if (uploadResponse.success) {
            // Update course object with new image URL
            if (uploadResponse.data?.image_url) {
              // Construct full URL if needed
              const imageUrl = uploadResponse.data.image_url.startsWith('http') 
                ? uploadResponse.data.image_url 
                : `${import.meta.env.VITE_API_URL || 'http://localhost:8180'}${uploadResponse.data.image_url}`;
              createdCourse.thumbnail = imageUrl;
            }
          } else {
            toast.error('Curso criado, mas erro ao enviar imagem');
          }
        }
        
        setCourse(createdCourse);
        setStep(2);
        toast.success('Curso criado com sucesso! Agora adicione seções e aulas.');
      } else {
        toast.error(response.message || 'Erro ao criar curso');
      }
    } catch (error) {
      toast.error('Erro ao criar curso');
    } finally {
      setIsLoading(false);
    }
  };

  // Load modules when course is available
  useEffect(() => {
    if (course?.id) {
      loadModules();
    }
  }, [course?.id]);

  const loadModules = async () => {
    if (!course?.id) return;

    try {
      const response = await courseService.listModules(course.id);
      if (response.success && response.data) {
        setModules(response.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar módulos');
    }
  };

  // Module operations
  const handleCreateModule = async () => {
    if (!course?.id || !moduleForm.title) {
      toast.error('Título do módulo é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseService.createModule(course.id, moduleForm);
      if (response.success) {
        toast.success('Módulo criado com sucesso');
        setShowModuleModal(false);
        setModuleForm({ title: '', description: '', is_published: false });
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao criar módulo');
      }
    } catch (error) {
      toast.error('Erro ao criar módulo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!course?.id || !editingModule || !moduleForm.title) {
      toast.error('Título do módulo é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseService.updateModule(course.id, editingModule.id, moduleForm);
      if (response.success) {
        toast.success('Módulo atualizado com sucesso');
        setShowModuleModal(false);
        setEditingModule(null);
        setModuleForm({ title: '', description: '', is_published: false });
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao atualizar módulo');
      }
    } catch (error) {
      toast.error('Erro ao atualizar módulo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!course?.id || !confirm('Tem certeza que deseja excluir este módulo?')) return;

    try {
      const response = await courseService.deleteModule(course.id, moduleId);
      if (response.success) {
        toast.success('Módulo excluído com sucesso');
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao excluir módulo');
      }
    } catch (error) {
      toast.error('Erro ao excluir módulo');
    }
  };

  // Lesson operations
  const handleCreateLesson = async () => {
    if (!editingLesson?.module || !lessonForm.title) {
      toast.error('Título da aula é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseService.createLesson(editingLesson.module.id, lessonForm);
      if (response.success) {
        toast.success('Aula criada com sucesso');
        setShowLessonModal(false);
        setEditingLesson(null);
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
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao criar aula');
      }
    } catch (error) {
      toast.error('Erro ao criar aula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson?.module || !editingLesson?.lesson || !lessonForm.title) {
      toast.error('Título da aula é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseService.updateLesson(
        editingLesson.module.id,
        editingLesson.lesson.id,
        lessonForm
      );
      if (response.success) {
        toast.success('Aula atualizada com sucesso');
        setShowLessonModal(false);
        setEditingLesson(null);
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
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao atualizar aula');
      }
    } catch (error) {
      toast.error('Erro ao atualizar aula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (module: CourseModule, lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      const response = await courseService.deleteLesson(module.id, lessonId);
      if (response.success) {
        toast.success('Aula excluída com sucesso');
        loadModules();
      } else {
        toast.error(response.message || 'Erro ao excluir aula');
      }
    } catch (error) {
      toast.error('Erro ao excluir aula');
    }
  };

  const openModuleModal = (module?: CourseModule) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description || '',
        is_published: module.isPublished
      });
    } else {
      setEditingModule(null);
      setModuleForm({ title: '', description: '', is_published: false });
    }
    setShowModuleModal(true);
  };

  const openLessonModal = (module: CourseModule, lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson({ module, lesson });
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type,
        duration_minutes: lesson.duration || 0,
        video_url: lesson.videoUrl || '',
        content: lesson.content || '',
        is_published: lesson.isPublished,
        is_free: lesson.isFree
      });
    } else {
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
    }
    setShowLessonModal(true);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourseData({
        ...courseData,
        requirements: [...(courseData.requirements || []), newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setCourseData({
      ...courseData,
      requirements: courseData.requirements?.filter((_, i) => i !== index)
    });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourseData({
        ...courseData,
        objectives: [...(courseData.objectives || []), newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setCourseData({
      ...courseData,
      objectives: courseData.objectives?.filter((_, i) => i !== index)
    });
  };

  const getLessonTypeIcon = (type: string) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.icon : FileText;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff ? { label: diff.label, color: diff.color } : { label: 'Iniciante', color: 'bg-green-100 text-green-800' };
  };

  if (step === 1) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
              Criar Novo Curso
            </h1>
            <p className="text-primary-600 dark:text-gray-300">
              Configure as informações básicas do seu curso
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título do Curso *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    placeholder="Ex: Direito Constitucional Completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.category}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dificuldade
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.difficulty_level}
                    onChange={(e) => setCourseData({ ...courseData, difficulty_level: e.target.value })}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.price}
                    onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duração (horas)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.duration_hours || ''}
                    onChange={(e) => setCourseData({ ...courseData, duration_hours: parseInt(e.target.value) || undefined })}
                    placeholder="Ex: 20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    placeholder="Descreva o que os alunos vão aprender neste curso..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Público-alvo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={courseData.target_audience}
                    onChange={(e) => setCourseData({ ...courseData, target_audience: e.target.value })}
                    placeholder="Ex: Estudantes para concursos públicos"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagem do Curso
                  </label>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <div className="space-y-4">
                    {/* Image preview */}
                    {imagePreview ? (
                      <div className="relative w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                        <Upload className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={triggerFileInput}
                    >
                      <Upload className="w-4 h-4" />
                      Escolher Imagem
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={courseData.certification_available}
                      onChange={(e) => setCourseData({ ...courseData, certification_available: e.target.checked })}
                      className="rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Emite certificado de conclusão
                    </span>
                  </label>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pré-requisitos
                </label>
                <div className="space-y-2">
                  {courseData.requirements?.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="flex-1 text-sm">{req}</span>
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Ex: Conhecimento básico em direito"
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button size="sm" onClick={addRequirement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objetivos de Aprendizagem
                </label>
                <div className="space-y-2">
                  {courseData.objectives?.map((obj, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="flex-1 text-sm">{obj}</span>
                      <button
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Ex: Compreender os fundamentos da Constituição"
                      onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                    />
                    <Button size="sm" onClick={addObjective}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleCourseSubmit} 
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Criando...' : 'Criar Curso e Continuar'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
              {course?.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getDifficultyBadge(course?.difficulty || 'beginner').color}>
                {getDifficultyBadge(course?.difficulty || 'beginner').label}
              </Badge>
              <span className="text-sm text-gray-500">
                {modules.length} módulo(s) • {modules.reduce((total, mod) => total + (mod.stats?.lessons || 0), 0)} aula(s)
              </span>
            </div>
          </div>
          <Button 
            onClick={() => openModuleModal()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Seção
          </Button>
        </div>

        {/* Course Structure */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma seção criada ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Organize seu curso em seções e adicione aulas para cada uma delas.
                </p>
                <Button onClick={() => openModuleModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Seção
                </Button>
              </CardContent>
            </Card>
          ) : (
            modules.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      {expandedModule === module.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary-900 dark:text-white">
                          Seção {moduleIndex + 1}: {module.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {module.stats.lessons} aula(s)
                          </span>
                          {module.stats.duration && (
                            <span className="text-sm text-gray-500">
                              {module.stats.duration} min
                            </span>
                          )}
                          {module.isPublished ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Eye className="w-3 h-3 mr-1" />
                              Publicado
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Rascunho
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModuleModal(module)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLessonModal(module)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {module.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-8">
                      {module.description}
                    </p>
                  )}
                </CardHeader>

                <AnimatePresence>
                  {expandedModule === module.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <CardContent className="pt-0">
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2 ml-8">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const LessonIcon = getLessonTypeIcon(lesson.type);
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <LessonIcon className="w-4 h-4 text-gray-500" />
                                    <div>
                                      <h4 className="font-medium text-primary-900 dark:text-white">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h4>
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{lessonTypes.find(t => t.value === lesson.type)?.label}</span>
                                        {lesson.duration && <span>{lesson.duration} min</span>}
                                        {lesson.isFree && <span className="text-green-600">Gratuita</span>}
                                        {lesson.isPublished ? (
                                          <span className="text-green-600">Publicada</span>
                                        ) : (
                                          <span className="text-gray-500">Rascunho</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openLessonModal(module, lesson)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteLesson(module, lesson.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="ml-8 p-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma aula nesta seção</p>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => openLessonModal(module)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Aula
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))
          )}
        </div>

        {/* Module Modal */}
        <AnimatePresence>
          {showModuleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowModuleModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900 dark:text-white">
                    {editingModule ? 'Editar Seção' : 'Nova Seção'}
                  </h2>
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      placeholder="Ex: Introdução ao Direito Constitucional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      placeholder="Descreva o conteúdo desta seção..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={moduleForm.is_published}
                        onChange={(e) => setModuleForm({ ...moduleForm, is_published: e.target.checked })}
                        className="rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publicar seção
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModuleModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={editingModule ? handleUpdateModule : handleCreateModule}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : editingModule ? 'Atualizar' : 'Criar'}
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
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowLessonModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900 dark:text-white">
                    {editingLesson.lesson ? 'Editar Aula' : 'Nova Aula'}
                  </h2>
                  <button
                    onClick={() => setShowLessonModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Ex: Conceitos fundamentais"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={lessonForm.type}
                        onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                      >
                        {lessonTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duração (minutos)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={lessonForm.duration_minutes}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 15"
                      />
                    </div>

                    {lessonForm.type === 'video' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          URL do Vídeo
                        </label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          value={lessonForm.video_url}
                          onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      placeholder="Descreva o conteúdo desta aula..."
                    />
                  </div>

                  {lessonForm.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conteúdo
                      </label>
                      <textarea
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                        placeholder="Digite o conteúdo da aula..."
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lessonForm.is_free}
                        onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                        className="rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Aula gratuita
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lessonForm.is_published}
                        onChange={(e) => setLessonForm({ ...lessonForm, is_published: e.target.checked })}
                        className="rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publicar aula
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowLessonModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={editingLesson.lesson ? handleUpdateLesson : handleCreateLesson}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : editingLesson.lesson ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}