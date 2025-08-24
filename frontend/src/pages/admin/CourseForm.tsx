import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Play,
  Eye,
  EyeOff,
  Shield,
  Target,
  Award,
  Calendar,
  Clock,
  Users,
  Star,
  Settings,
  Info,
  Search,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourseImage } from '@/components/CourseImage';
import { courseService, type Course } from '@/services/courseService';
import { categoryService } from '@/services/categoryService';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  children?: Category[];
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons: LessonData[];
  isPublished: boolean;
  order: number;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live';
  duration: number;
  videoUrl?: string;
  content?: string;
  isPublished: boolean;
  isFree: boolean;
  order: number;
}

const difficultyOptions = [
  { value: 'INICIANTE', label: 'RECRUTA', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'INTERMEDIÁRIO', label: 'OPERADOR', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  { value: 'AVANÇADO', label: 'ESPECIALISTA', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
];

const levelOptions = [
  { value: 'OPERACIONAL', label: 'NÍVEL OPERACIONAL', icon: Shield },
  { value: 'TÁTICO', label: 'NÍVEL TÁTICO', icon: Target },
  { value: 'COMANDO', label: 'NÍVEL COMANDO', icon: Award }
];

const lessonTypes = [
  { value: 'video', label: 'Vídeo Aula', icon: Video, color: 'text-blue-600' },
  { value: 'text', label: 'Material Texto', icon: FileText, color: 'text-green-600' },
  { value: 'quiz', label: 'Quiz/Exercício', icon: HelpCircle, color: 'text-purple-600' },
  { value: 'assignment', label: 'Tarefa', icon: BookOpen, color: 'text-orange-600' },
  { value: 'live', label: 'Aula Ao Vivo', icon: Play, color: 'text-red-600' }
];

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    category: '',
    description: '',
    price: 0,
    duration: { months: 1, hours: 10 },
    difficulty: 'INICIANTE',
    level: 'OPERACIONAL',
    status: 'RASCUNHO',
    certification: false,
    requirements: [],
    objectives: [],
    tags: [],
    instructor: {
      name: '',
      avatar: '',
      rank: ''
    }
  });
  
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'materials' | 'access' | 'settings'>('basic');
  
  // Temporary inputs
  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');

  // Estados para categorias hierárquicas
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Carregar categorias
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // Funções para gerenciar hierarquia de categorias
  const findParentChain = (categoryId: string, cats: Category[] = categories): string[] => {
    const parentChain: string[] = [];
    
    const findParent = (id: string) => {
      for (const cat of cats) {
        if (cat.id === id && cat.parent_id) {
          parentChain.push(cat.parent_id);
          findParent(cat.parent_id);
          break;
        }
        if (cat.children) {
          const childCat = cat.children.find(c => c.id === id);
          if (childCat && cat.id) {
            parentChain.push(cat.id);
            findParent(cat.id);
            break;
          }
        }
      }
    };
    
    findParent(categoryId);
    return parentChain;
  };

  const findAllChildren = (categoryId: string, cats: Category[] = categories): string[] => {
    const childrenIds: string[] = [];
    
    const findChildren = (id: string) => {
      const category = findCategoryById(id, cats);
      if (category?.children) {
        category.children.forEach(child => {
          childrenIds.push(child.id);
          findChildren(child.id);
        });
      }
    };
    
    findChildren(categoryId);
    return childrenIds;
  };

  const findCategoryById = (id: string, cats: Category[] = categories): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(id, cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      
      if (isSelected) {
        // Desmarcar categoria e todos os filhos
        const childrenIds = findAllChildren(categoryId);
        const newSelection = prev.filter(id => id !== categoryId && !childrenIds.includes(id));
        
        // Atualizar formData.category para a primeira categoria selecionada ou vazio
        const selectedCategory = newSelection.length > 0 ? findCategoryById(newSelection[0])?.name || '' : '';
        setFormData(prev => ({ ...prev, category: selectedCategory }));
        
        return newSelection;
      } else {
        // Marcar categoria e todos os pais
        const parentChain = findParentChain(categoryId);
        const newSelection = [...new Set([...prev, categoryId, ...parentChain])];
        
        // Atualizar formData.category para a categoria principal selecionada
        const selectedCategory = findCategoryById(categoryId)?.name || '';
        setFormData(prev => ({ ...prev, category: selectedCategory }));
        
        return newSelection;
      }
    });
  };

  const handleExpandToggle = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filtered categories for search
  const filteredCategories = categorySearch
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.children && cat.children.some(child => 
          child.name.toLowerCase().includes(categorySearch.toLowerCase())
        ))
      )
    : categories;

  // Renderizar árvore de categorias
  const renderCategoryTree = (cats: Category[], level: number = 0): JSX.Element[] => {
    const filteredCats = cats;

    return filteredCats.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);
      const isSelected = selectedCategories.includes(category.id);
      const hasSelectedChildren = category.children?.some(child => 
        selectedCategories.includes(child.id)
      );

      return (
        <div key={category.id}>
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
              ${isSelected 
                ? 'bg-accent-500/20 text-accent-600 dark:text-accent-500 font-semibold' 
                : hasSelectedChildren
                  ? 'bg-accent-500/10 text-gray-700 dark:text-gray-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
            style={{ marginLeft: `${level * 20}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandToggle(category.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!hasChildren && (
              <div className="w-5" />
            )}
            
            <label className="flex items-center gap-2 flex-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCategoryToggle(category.id)}
                className="w-4 h-4 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
              />
              <span className="font-police-body uppercase tracking-wider text-sm">
                {category.name}
              </span>
            </label>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Load course data if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadCourse = async () => {
        try {
          setIsLoading(true);
          const result = await courseService.getCourse(id);
          
          if (result.success && result.data) {
            setFormData(result.data);
            setImagePreview(result.data.thumbnail);
            
            // Load modules for this course
            const modulesResult = await courseService.listModules(id);
            if (modulesResult.success && modulesResult.data) {
              const moduleData = modulesResult.data.map(module => ({
                id: module.id,
                title: module.title,
                description: module.description || '',
                isPublished: module.isPublished,
                order: module.orderIndex,
                lessons: []
              }));
              setModules(moduleData);
            }
          } else {
            toast.error('Erro ao carregar curso: ' + (result.message || 'Curso não encontrado'));
            navigate('/admin/courses');
          }
        } catch (error) {
          toast.error('Erro ao conectar com a API');
          navigate('/admin/courses');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadCourse();
    } else {
      setIsLoading(false);
    }
  }, [isEditing, id, navigate]);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('FORMATO DE IMAGEM NÃO AUTORIZADO: Use JPEG, PNG, GIF ou WebP', { icon: '🚨' });
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('IMAGEM EXCEDE LIMITE TÁTICO: Máximo 5MB', { icon: '🚨' });
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    fileInputRef.current?.click();
  };

  // Form handlers
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Course] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      handleInputChange('requirements', [...(formData.requirements || []), newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    handleInputChange('requirements', formData.requirements?.filter((_, i) => i !== index));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      handleInputChange('objectives', [...(formData.objectives || []), newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    handleInputChange('objectives', formData.objectives?.filter((_, i) => i !== index));  
  };

  const addTag = () => {
    if (newTag.trim()) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim().toUpperCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags?.filter((_, i) => i !== index));
  };

  // Module handlers
  const addModule = () => {
    const newModule: ModuleData = {
      id: Date.now().toString(),
      title: `Módulo ${modules.length + 1}`,
      description: '',
      lessons: [],
      isPublished: false,
      order: modules.length + 1
    };
    setModules(prev => [...prev, newModule]);
    setExpandedModule(newModule.id);
  };

  const updateModule = (moduleId: string, field: string, value: any) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, [field]: value } : module
    ));
  };

  const deleteModule = (moduleId: string) => {
    if (confirm('Tem certeza que deseja excluir este módulo?')) {
      setModules(prev => prev.filter(module => module.id !== moduleId));
      if (expandedModule === moduleId) {
        setExpandedModule(null);
      }
    }
  };

  // Lesson handlers
  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const newLesson: LessonData = {
        id: `${moduleId}-${Date.now()}`,
        title: `Aula ${module.lessons.length + 1}`,
        description: '',
        type: 'video',
        duration: 10,
        isPublished: false,
        isFree: false,
        order: module.lessons.length + 1
      };
      
      updateModule(moduleId, 'lessons', [...module.lessons, newLesson]);
    }
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const updatedLessons = module.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
      );
      updateModule(moduleId, 'lessons', updatedLessons);
    }
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        const updatedLessons = module.lessons.filter(lesson => lesson.id !== lessonId);
        updateModule(moduleId, 'lessons', updatedLessons);
      }
    }
  };

  // Save course
  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      toast.error('OPERAÇÃO FALHADA: Configure identificação e área operacional', { icon: '🚨' });
      return;
    }

    setIsLoading(true);
    
    try {
      const courseData = {
        title: formData.title,
        description: formData.description || '',
        category: formData.category,
        price: formData.price || 0,
        difficulty_level: formData.difficulty || 'beginner',
        duration_hours: formData.duration?.hours || 0,
        duration_months: formData.duration?.months || 0,
        requirements: formData.requirements || [],
        objectives: formData.objectives || [],
        target_audience: formData.targetAudience || '',
        certification_available: formData.certification || false,
        instructor_name: formData.instructor?.name || '',
        status: formData.status === 'PUBLICADO' ? 'published' : formData.status === 'ARQUIVADO' ? 'archived' : 'draft'
      };

      let result;
      if (isEditing && id) {
        result = await courseService.updateCourse(id, courseData);
      } else {
        result = await courseService.createCourse(courseData);
      }

      if (result.success) {
        // If there's an image to upload
        if (imageFile && result.data?.id) {
          const uploadResult = await courseService.uploadImage(result.data.id, imageFile);
          if (!uploadResult.success) {
            toast.error('Curso salvo, mas erro ao enviar imagem: ' + uploadResult.message);
          }
        }

        toast.success(
          isEditing 
            ? 'OPERAÇÃO CONCLUÍDA: Treinamento atualizado com sucesso!' 
            : 'OPERAÇÃO CONCLUÍDA: Treinamento criado com sucesso!', 
          { icon: '✅' }
        );
        navigate('/admin/courses');
      } else {
        toast.error('OPERAÇÃO FALHADA: ' + (result.message || 'Erro ao processar treinamento'), { icon: '🚨' });
      }
      
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('OPERAÇÃO FALHADA: Erro ao conectar com a API', { icon: '🚨' });
    } finally {
      setIsLoading(false);
    }
  };

  const getLessonTypeIcon = (type: string) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.icon : FileText;
  };

  const tabs = [
    { id: 'basic', label: 'INFORMAÇÕES BÁSICAS', icon: Info },
    { id: 'content', label: 'MÓDULOS & AULAS', icon: BookOpen },
    { id: 'materials', label: 'MATERIAIS DO CURSO', icon: FileText },
    { id: 'access', label: 'CONTROLE DE ACESSO', icon: Users },
    { id: 'settings', label: 'CONFIGURAÇÕES', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none z-0"
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
      
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden mb-6"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/courses')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-bold text-white font-police-title uppercase tracking-wider">
                {isEditing ? 'MODIFICAR OPERAÇÃO' : 'NOVA OPERAÇÃO TÁTICA'}
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                {isEditing ? 'Atualizar treinamento operacional' : 'Criar novo programa de treinamento'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2 font-police-body font-bold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black px-8 py-3 uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'PROCESSANDO...' : (isEditing ? 'CONFIRMAR ATUALIZAÇÃO' : 'CONFIRMAR OPERAÇÃO')}
          </Button>
        </div>
        
        {/* Tabs */}
        {/* Tactical Tabs */}
        <div className="flex space-x-1 bg-gray-900/50 backdrop-blur-sm p-1 rounded-lg border border-accent-500/20 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-police-subtitle font-semibold text-sm uppercase tracking-wider transition-all duration-300 relative',
                  activeTab === tab.id
                    ? 'bg-accent-500 text-black shadow-lg hover:shadow-xl'
                    : 'text-white hover:text-accent-500 hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* Tactical stripes */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
                
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
                  <CardTitle className="font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                    <Settings className="w-6 h-6 text-accent-500" />
                    CONFIGURAÇÕES OPERACIONAIS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-police-subtitle uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-500" />
                      IDENTIFICAÇÃO DA OPERAÇÃO *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50"
                      placeholder="Ex: TREINAMENTO COMPLETO POLÍCIA FEDERAL - AGENTE TÁTICO"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-police-subtitle uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent-500" />
                        ÁREA OPERACIONAL *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCategoryModalOpen(true)}
                        className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-left font-police-body transition-all flex items-center justify-between ${
                          selectedCategories.length > 0
                            ? 'border-accent-500 text-accent-600 dark:text-accent-500'
                            : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          {selectedCategories.length === 0
                            ? 'Selecione uma categoria'
                            : selectedCategories.length === 1
                              ? findCategoryById(selectedCategories[0])?.name || 'Categoria selecionada'
                              : `${selectedCategories.length} categorias selecionadas`
                          }
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Nível Operacional
                      </label>
                      <select
                        value={formData.level || 'OPERACIONAL'}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        {levelOptions.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                      Descrição da Missão
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      placeholder="Descreva os objetivos e conteúdo do treinamento..."
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Instructor */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider">Instrutor Responsável</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={formData.instructor?.name || ''}
                        onChange={(e) => handleInputChange('instructor.name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                        placeholder="Ex: Delegado Carlos Lima"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Patente/Cargo
                      </label>
                      <input
                        type="text"
                        value={formData.instructor?.rank || ''}
                        onChange={(e) => handleInputChange('instructor.rank', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                        placeholder="Ex: DELEGADO FEDERAL"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Side Panel */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider">Imagem da Missão</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <CourseImage
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 rounded-lg"
                          fallbackCategory={formData.category}
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-police-body uppercase tracking-wider">Nenhuma Imagem</p>
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      className="w-full gap-2 font-police-body"
                    >
                      <Upload className="w-4 h-4" />
                      {imagePreview ? 'ALTERAR IMAGEM' : 'ADICIONAR IMAGEM'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider">Configurações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        value={formData.price || 0}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Dificuldade
                      </label>
                      <select
                        value={formData.difficulty || 'INICIANTE'}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body text-xs"
                      >
                        {difficultyOptions.map(diff => (
                          <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Duração (h)
                      </label>
                      <input
                        type="number"
                        value={formData.duration?.hours || 0}
                        onChange={(e) => handleInputChange('duration.hours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Meses
                      </label>
                      <input
                        type="number"
                        value={formData.duration?.months || 0}
                        onChange={(e) => handleInputChange('duration.months', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.certification || false}
                        onChange={(e) => handleInputChange('certification', e.target.checked)}
                        className="rounded focus:ring-2 focus:ring-accent-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-police-body uppercase tracking-wider">
                        Emite Certificado
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Modules Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                  ESTRUTURA DO CURSO
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-police-body">
                  Organize o conteúdo em módulos e aulas
                </p>
              </div>
              <Button onClick={addModule} className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold">
                <Plus className="w-4 h-4" />
                ADICIONAR MÓDULO
              </Button>
            </div>
            
            {/* Modules List */}
            <div className="space-y-4">
              {modules.length === 0 ? (
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">
                      NENHUM MÓDULO CRIADO
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                      Comece criando o primeiro módulo do seu curso
                    </p>
                    <Button onClick={addModule} className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold">
                      <Plus className="w-4 h-4" />
                      CRIAR PRIMEIRO MÓDULO
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
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
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                                className="text-lg font-bold bg-transparent border-0 text-gray-900 dark:text-white font-police-subtitle uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-accent-500 rounded px-2 py-1"
                                placeholder="Título do Módulo"
                              />
                              {module.isPublished ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                  <Eye className="w-3 h-3 mr-1" />
                                  PUBLICADO
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  RASCUNHO
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-police-body">
                                Módulo {moduleIndex + 1} • {module.lessons.length} aula(s)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateModule(module.id, 'isPublished', !module.isPublished)}
                            className={cn(
                              "text-xs font-police-body",
                              module.isPublished ? "text-green-600 border-green-300" : "text-gray-600"
                            )}
                          >
                            {module.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addLesson(module.id)}
                            className="text-xs font-police-body"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteModule(module.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <textarea
                        value={module.description}
                        onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                        className="w-full mt-2 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400 font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="Descrição do módulo..."
                        rows={2}
                      />
                    </CardHeader>

                    {expandedModule === module.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CardContent className="pt-0">
                          {module.lessons.length > 0 ? (
                            <div className="space-y-3">
                              {module.lessons.map((lesson, lessonIndex) => {
                                const LessonIcon = getLessonTypeIcon(lesson.type);
                                const lessonType = lessonTypes.find(t => t.value === lesson.type);
                                
                                return (
                                  <div
                                    key={lesson.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800", lessonType?.color || 'text-gray-600')}>
                                          <LessonIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                              type="text"
                                              value={lesson.title}
                                              onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                              className="font-medium bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                                              placeholder="Título da aula"
                                            />
                                            <div className="flex items-center gap-2">
                                              <select
                                                value={lesson.type}
                                                onChange={(e) => updateLesson(module.id, lesson.id, 'type', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                                              >
                                                {lessonTypes.map(type => (
                                                  <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                              </select>
                                              <input
                                                type="number"
                                                value={lesson.duration}
                                                onChange={(e) => updateLesson(module.id, lesson.id, 'duration', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                                                placeholder="min"
                                              />
                                            </div>
                                          </div>
                                          
                                          <textarea
                                            value={lesson.description}
                                            onChange={(e) => updateLesson(module.id, lesson.id, 'description', e.target.value)}
                                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-600 dark:text-gray-400 font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                                            placeholder="Descrição da aula..."
                                            rows={2}
                                          />
                                          
                                          {lesson.type === 'video' && (
                                            <input
                                              type="url"
                                              value={lesson.videoUrl || ''}
                                              onChange={(e) => updateLesson(module.id, lesson.id, 'videoUrl', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                                              placeholder="URL do vídeo..."
                                            />
                                          )}
                                          
                                          <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={lesson.isPublished}
                                                onChange={(e) => updateLesson(module.id, lesson.id, 'isPublished', e.target.checked)}
                                                className="rounded focus:ring-2 focus:ring-accent-500"
                                              />
                                              <span className="text-sm font-police-body text-gray-700 dark:text-gray-300">Publicada</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={lesson.isFree}
                                                onChange={(e) => updateLesson(module.id, lesson.id, 'isFree', e.target.checked)}
                                                className="rounded focus:ring-2 focus:ring-accent-500"
                                              />
                                              <span className="text-sm font-police-body text-gray-700 dark:text-gray-300">Gratuita</span>
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteLesson(module.id, lesson.id)}
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
                            <div className="text-center py-8">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 mb-4 font-police-body">Nenhuma aula neste módulo</p>
                              <Button
                                size="sm"
                                onClick={() => addLesson(module.id)}
                                className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body"
                              >
                                <Plus className="w-3 h-3" />
                                ADICIONAR PRIMEIRA AULA
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div className="space-y-6">
            {/* Materials Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                MATERIAIS DO CURSO
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-police-body">
                Gerencie flashcards, questões, resumos e legislação específicos do curso
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Flashcards */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      FLASHCARDS
                    </CardTitle>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body">
                      <Plus className="w-3 h-3 mr-1" />
                      ADICIONAR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white font-police-subtitle text-sm">
                            EXEMPLO: CONSTITUIÇÃO FEDERAL
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            Artigos fundamentais sobre direitos e garantias individuais
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-accent-500/20 text-accent-700 dark:text-accent-300">
                              DIREITO CONSTITUCIONAL
                            </Badge>
                            <span className="text-xs text-gray-500 font-police-body">12 cards</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-police-body text-sm">Nenhum flashcard adicionado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Bank */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      QUESTÕES
                    </CardTitle>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body">
                      <Plus className="w-3 h-3 mr-1" />
                      ADICIONAR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white font-police-subtitle text-sm">
                            EXEMPLO: LEGISLAÇÃO PENAL
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            Questões sobre crimes contra a administração pública
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                              MÚLTIPLA ESCOLHA
                            </Badge>
                            <span className="text-xs text-gray-500 font-police-body">25 questões</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-police-body text-sm">Nenhuma questão adicionada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Summaries */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      RESUMOS INTERATIVOS
                    </CardTitle>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body">
                      <Plus className="w-3 h-3 mr-1" />
                      CRIAR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white font-police-subtitle text-sm">
                            EXEMPLO: PROCESSO PENAL
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            Resumo completo sobre inquérito policial e procedimentos
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              INTERATIVO
                            </Badge>
                            <span className="text-xs text-gray-500 font-police-body">15 páginas</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-police-body text-sm">Nenhum resumo criado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legislation */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      LEGISLAÇÃO
                    </CardTitle>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body">
                      <Plus className="w-3 h-3 mr-1" />
                      VINCULAR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white font-police-subtitle text-sm">
                            EXEMPLO: LEI 12.850/2013
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            Lei de organizações criminosas - texto atualizado
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              ATUALIZADA
                            </Badge>
                            <span className="text-xs text-gray-500 font-police-body">45 artigos</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-police-body text-sm">Nenhuma legislação vinculada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Materials Statistics */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">ESTATÍSTICAS DOS MATERIAIS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <BookOpen className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">12</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Flashcards</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">25</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Questões</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">8</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Resumos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">15</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Leis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="space-y-6">
            {/* Access Control Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                CONTROLE DE ACESSO
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-police-body">
                Gerencie quem pode acessar o curso, prazos e configurações de matrícula
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Access Settings */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    CONFIGURAÇÕES DE ACESSO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                      Tipo de Acesso
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body">
                      <option value="paid">CURSO PAGO</option>
                      <option value="free">CURSO GRATUITO</option>
                      <option value="subscription">APENAS ASSINANTES</option>
                      <option value="invite">CONVITE APENAS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                      Limite de Matrículas
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded focus:ring-2 focus:ring-accent-500"
                        />
                        <span className="text-sm font-police-body text-gray-700 dark:text-gray-300">Ilimitado</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Máximo de alunos"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        Data de Término
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded focus:ring-2 focus:ring-accent-500"
                      />
                      <span className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                        Permitir acesso após vencimento
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded focus:ring-2 focus:ring-accent-500"
                      />
                      <span className="text-sm font-police-body text-gray-700 dark:text-gray-300">
                        Matrícula automática por convite
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Enrolled Students */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      ALUNOS MATRICULADOS
                    </CardTitle>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body">
                      <Plus className="w-3 h-3 mr-1" />
                      CONVIDAR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white font-police-body text-sm">
                            João Silva
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                            Matriculado em 15/07/2025
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          ATIVO
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white font-police-body text-sm">
                            Maria Santos
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                            Matriculada em 20/07/2025
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                          PENDENTE
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-police-body text-sm">2 de ∞ vagas ocupadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access Statistics */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider">ESTATÍSTICAS DE ACESSO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">125</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Matriculados</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">89</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Ativos</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">15</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Pendentes</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Calendar className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white font-police-numbers">21</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase">Vencidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requirements */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">Pré-requisitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {formData.requirements?.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="flex-1 text-sm font-police-body">{req}</span>
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Ex: Ensino superior completo"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button size="sm" onClick={addRequirement} className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Objectives */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {formData.objectives?.map((obj, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="flex-1 text-sm font-police-body">{obj}</span>
                      <button
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Ex: Dominar legislação federal"
                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                  />
                  <Button size="sm" onClick={addObjective} className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Tags */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} className="bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-500/30">
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-2 text-accent-600 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex: CONCURSO, FEDERAL"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" onClick={addTag} className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Status */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">Status e Visibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                      Status
                    </label>
                    <select 
                      value={formData.status || 'RASCUNHO'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                    >
                      <option value="RASCUNHO">RASCUNHO</option>
                      <option value="PUBLICADO">PUBLICADO</option>
                      <option value="ARQUIVADO">ARQUIVADO</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Category Selection Modal */}
      {categoryModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setCategoryModalOpen(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-accent-500/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                  <Shield className="w-6 h-6 text-accent-500" />
                  CATEGORIAS OPERACIONAIS
                </h2>
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar categorias..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
              </div>

              {/* Categories Tree */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                {filteredCategories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-police-body">
                    Nenhuma categoria encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree(filteredCategories)}
                  </div>
                )}
              </div>

              {/* Selected Categories Summary */}
              {selectedCategories.length > 0 && (
                <div className="mt-6 p-4 bg-accent-500/10 rounded-lg border border-accent-500/30">
                  <p className="text-sm font-police-subtitle uppercase tracking-wider text-accent-700 dark:text-accent-300 mb-2">
                    Categorias Selecionadas ({selectedCategories.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = findCategoryById(categoryId);
                      return category ? (
                        <Badge 
                          key={categoryId}
                          className="bg-accent-500 text-white hover:bg-accent-600 font-police-body"
                        >
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                className="font-police-body"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setCategoryModalOpen(false);
                  // Update formData with selected categories
                  const selectedCategoryNames = selectedCategories.map(id => {
                    const cat = findCategoryById(id);
                    return cat?.name || '';
                  }).filter(Boolean);
                  handleInputChange('categories', selectedCategoryNames);
                }}
                className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body"
              >
                Confirmar Seleção
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}