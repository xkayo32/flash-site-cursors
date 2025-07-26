import { useState, useRef, useEffect } from 'react';
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
import { getDefaultCourseThumbnail } from '@/utils/defaultImages';
import { CourseImage } from '@/components/ui/CourseImage';
import { courseService } from '@/services/courseService';
import toast from 'react-hot-toast';

const categories = ['Todos', 'Polícia', 'Receita', 'Tribunais', 'Bancários', 'Educação'];
const statuses = ['Todos', 'published', 'draft', 'archived'];

export default function CourseEditor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // API data state
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Load courses from API
  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.listCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        console.error('Failed to load courses:', response.message);
        toast.error('Erro ao carregar cursos');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const instructorName = course.instructor?.name || '';
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructorName.toLowerCase().includes(searchTerm.toLowerCase());
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
    // Reset image state
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setShowCourseModal(true);
    setActiveTab('details');
    // Reset image state
    setImageFile(null);
    setImagePreview(null);
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(false);
    setShowCourseModal(true);
    setActiveTab('details');
    // Reset image state
    setImageFile(null);
    setImagePreview(null);
  };

  // Image upload handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato de imagem não permitido. Use: JPEG, PNG, GIF, WebP ou SVG');
        e.target.value = '';
        return;
      }
      
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Imagem muito grande. Tamanho máximo: 5MB');
        e.target.value = '';
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
    }
  };


  const handleSaveCourse = async () => {
    
    if (!selectedCourse) {
      toast.error('Nenhum curso selecionado');
      return;
    }

    // Frontend validation before submission
    const titleInput = document.querySelector('#course-title') as HTMLInputElement;
    const categorySelect = document.querySelector('#course-category') as HTMLSelectElement;
    
    if (!titleInput?.value?.trim()) {
      toast.error('O título do curso é obrigatório');
      return;
    }
    
    if (!categorySelect?.value?.trim()) {
      toast.error('A categoria do curso é obrigatória');
      return;
    }

    setIsLoading(true);
    
    try {
      let updateData: any = {};
      
      // If this is a new course creation, collect form data
      if (!selectedCourse.id) {
        // Get form data from the modal form fields
        const titleInput = document.querySelector('#course-title') as HTMLInputElement;
        const categorySelect = document.querySelector('#course-category') as HTMLSelectElement;
        const instructorInput = document.querySelector('#course-instructor') as HTMLInputElement;
        const priceInput = document.querySelector('#course-price') as HTMLInputElement;
        const durationInput = document.querySelector('#course-duration') as HTMLInputElement;
        const totalHoursInput = document.querySelector('#course-total-hours') as HTMLInputElement;
        const descriptionTextarea = document.querySelector('#course-description') as HTMLTextAreaElement;
        
        updateData = {
          title: titleInput?.value || '',
          category: categorySelect?.value || '',
          instructor: instructorInput?.value || '',
          price: priceInput?.value ? parseFloat(priceInput.value) : 0,
          duration: durationInput?.value || '',
          duration_hours: totalHoursInput?.value ? parseInt(totalHoursInput.value) : 0,
          description: descriptionTextarea?.value || '',
        };


        // For new courses, use createCourse
        let createData: any;
        if (imageFile) {
          const formData = new FormData();
          Object.keys(updateData).forEach(key => {
            const value = updateData[key];
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          formData.append('thumbnail', imageFile);
          createData = formData;
        } else {
          createData = updateData;
        }

        const response = await courseService.createCourse(createData);
        
        if (response.success) {
          toast.success('Curso criado com sucesso!');
          await loadCourses(); // Reload courses from API
          setShowCourseModal(false);
          setIsEditing(false);
          setImageFile(null);
          setImagePreview(null);
        } else {
          
          // Show specific validation errors if available
          if (response.validation_errors && Array.isArray(response.validation_errors)) {
            response.validation_errors.forEach((error: string) => {
              toast.error(error);
            });
          } else if (response.raw_response) {
            // Show server error details if JSON parsing failed
            toast.error('Erro no servidor. Verifique os logs para detalhes.');
            console.error('Server returned invalid JSON:', response.raw_response);
          } else {
            // Show general error message
            const errorMessage = response.message || 'Erro ao criar curso';
            toast.error(errorMessage);
          }
        }
      } else {
        
        // Step 1: Update course data first
        const titleInput = document.querySelector('#course-title') as HTMLInputElement;
        const categorySelect = document.querySelector('#course-category') as HTMLSelectElement;
        const instructorInput = document.querySelector('#course-instructor') as HTMLInputElement;
        const priceInput = document.querySelector('#course-price') as HTMLInputElement;
        const durationInput = document.querySelector('#course-duration') as HTMLInputElement;
        const totalHoursInput = document.querySelector('#course-total-hours') as HTMLInputElement;
        const descriptionTextarea = document.querySelector('#course-description') as HTMLTextAreaElement;
        
        updateData = {
          title: titleInput?.value || selectedCourse.title,
          category: categorySelect?.value || selectedCourse.category,
          instructor: instructorInput?.value || selectedCourse.instructor?.name || selectedCourse.instructor,
          price: priceInput?.value ? parseFloat(priceInput.value) : selectedCourse.price,
          duration: durationInput?.value || (selectedCourse.duration?.months ? `${selectedCourse.duration.months} meses` : selectedCourse.duration),
          duration_hours: totalHoursInput?.value ? parseInt(totalHoursInput.value) : (selectedCourse.duration?.hours || selectedCourse.totalHours),
          description: descriptionTextarea?.value || selectedCourse.description,
        };


        // Prepare update data - if there's an image, use FormData
        let requestData: any;
        if (imageFile) {
          const formData = new FormData();
          
          // Add all update fields to FormData
          Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          
          // Add the image file
          formData.append('thumbnail', imageFile);
          requestData = formData;
        } else {
          requestData = updateData;
        }

        // Update course data first
        const updateResponse = await courseService.updateCourse(selectedCourse.id, updateData);
        
        if (!updateResponse.success) {
          
          // Show specific validation errors if available
          if (updateResponse.validation_errors && Array.isArray(updateResponse.validation_errors)) {
            updateResponse.validation_errors.forEach((error: string) => {
              toast.error(error);
            });
          } else if (updateResponse.raw_response) {
            toast.error('Erro no servidor. Verifique os logs para detalhes.');
            console.error('Server returned invalid JSON:', updateResponse.raw_response);
          } else {
            const errorMessage = updateResponse.message || 'Erro ao atualizar curso';
            toast.error(errorMessage);
          }
          return; // Exit early if course update fails
        }

        // Step 3: Upload image if selected
        if (imageFile && updateResponse.success) {
          const imageFormData = new FormData();
          imageFormData.append('thumbnail', imageFile);
          
          const imageUploadResponse = await courseService.uploadCourseImage(selectedCourse.id, imageFormData);
          
          if (!imageUploadResponse.success) {
            toast.error('Curso atualizado, mas erro ao enviar imagem');
          }
        }
        
        // Step 4: Success - course updated
        toast.success('Curso atualizado com sucesso!');
        await loadCourses(); // Reload courses from API
        setShowCourseModal(false);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
      }
      
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Erro ao salvar curso');
    } finally {
      setIsLoading(false);
    }
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
                  {loadingCourses ? '...' : courses.length}
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
                  {loadingCourses ? '...' : courses.filter(c => c.status === 'published').length}
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
                  {loadingCourses ? '...' : courses.reduce((acc, course) => acc + (course.stats?.enrollments || 0), 0)}
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
                  {loadingCourses ? '...' : `R$ ${(courses.reduce((acc, course) => acc + ((course.price || 0) * (course.stats?.enrollments || 0)), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
        {loadingCourses ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-primary-600 dark:text-gray-400">Carregando cursos...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-primary-600 dark:text-gray-400">Nenhum curso encontrado</p>
            </div>
          </div>
        ) : (
          filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              <CourseImage
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                fallbackCategory={course.category}
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
                  {course.instructor?.name || 'Instrutor não informado'} • {course.category}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Duração</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.duration?.months || 0} meses ({course.duration?.hours || 0}h)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Módulos/Aulas</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.stats?.modules || 0} / {course.stats?.lessons || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 dark:text-gray-400">Alunos</span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {course.stats?.enrollments || 0}
                  </span>
                </div>
                {(course.stats?.rating || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-600 dark:text-gray-400">Avaliação</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-primary-900 dark:text-white">
                        {course.stats?.rating || 0}
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
          ))
        )}
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
                          id="course-title"
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
                          id="course-category"
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
                          id="course-instructor"
                          type="text"
                          defaultValue={selectedCourse?.instructor?.name || selectedCourse?.instructor || ''}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Preço (R$)
                        </label>
                        <input
                          id="course-price"
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
                          id="course-duration"
                          type="text"
                          defaultValue={selectedCourse?.duration?.months ? `${selectedCourse.duration.months} meses` : selectedCourse?.duration || ''}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-primary-900 dark:text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-2">
                          Carga Horária Total
                        </label>
                        <input
                          id="course-total-hours"
                          type="number"
                          defaultValue={selectedCourse?.duration?.hours || selectedCourse?.totalHours || ''}
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
                        id="course-description"
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
                      
                      {/* Instructions */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {!imageFile ? 
                          "Clique em 'Escolher Imagem' para selecionar um arquivo e depois clique em 'Salvar Alterações'" : 
                          "✅ Imagem selecionada! Clique em 'Salvar Alterações' para salvar o curso com a nova imagem"
                        }
                      </p>
                      
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
                        ) : selectedCourse?.thumbnail ? (
                          <CourseImage
                            src={selectedCourse.thumbnail}
                            alt={selectedCourse.title}
                            className="w-32 h-20 object-cover rounded-lg"
                            fallbackCategory={selectedCourse.category}
                          />
                        ) : (
                          <div className="w-32 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                            <Upload className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Upload button */}
                        {isEditing && (
                          <div className="space-y-3">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={triggerFileInput}
                            >
                              <Upload className="w-4 h-4" />
                              {imageFile ? 'Escolher Outra Imagem' : 'Escolher Imagem'}
                            </Button>
                            
                            {/* Selected file indicator */}
                            {imageFile && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  ✅ Arquivo selecionado: <span className="font-medium">{imageFile.name}</span>
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  A imagem será enviada quando você clicar em "Salvar Alterações"
                                </p>
                              </div>
                            )}
                          </div>
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

                    {(selectedCourse?.modules || []).map((module) => (
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
                                {module.lessons?.length || 0} aulas
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
                            {(module.lessons || []).map((lesson) => (
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
                            {selectedCourse?.resources?.videos || 0}
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
                            {selectedCourse?.resources?.questions || 0}
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
                            {selectedCourse?.resources?.flashcards || 0}
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
                            {selectedCourse?.resources?.summaries || 0}
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
                            {selectedCourse?.resources?.laws || 0}
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
                  <Button 
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveCourse();
                    }}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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