import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Calendar,
  Building2,
  BookOpen,
  Filter,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  Brain,
  Star,
  Hash,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category, CategoryType } from '@/services/categoryService';
import toast from 'react-hot-toast';

export default function CategoryManager() {
  const [activeTab, setActiveTab] = useState<CategoryType>('subject');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'subject' as CategoryType,
    parent: '',
    description: ''
  });

  // Load categories on mount and tab change
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategoriesByType();
  }, [activeTab, categories, searchTerm]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message || 'Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const filterCategoriesByType = () => {
    let filtered = categories;

    // Filter by type
    if (activeTab === 'subject' || activeTab === 'topic') {
      filtered = categories.filter(cat => cat.type === 'subject');
    } else {
      filtered = categories.filter(cat => cat.type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filterCategoriesRecursive(filtered, searchTerm);
    }

    setFilteredCategories(filtered);
  };

  const filterCategoriesRecursive = (cats: Category[], term: string): Category[] => {
    return cats.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(term.toLowerCase()) ||
                           cat.description?.toLowerCase().includes(term.toLowerCase());
      
      if (cat.children) {
        const filteredChildren = filterCategoriesRecursive(cat.children, term);
        return matchesSearch || filteredChildren.length > 0;
      }
      
      return matchesSearch;
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      type: activeTab,
      parent: '',
      description: ''
    });
    setIsEditing(true);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      parent: category.parent || '',
      description: category.description || ''
    });
    setIsEditing(true);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    try {
      const response = await categoryService.deleteCategory(category.id);
      if (response.success) {
        toast.success('Categoria excluída com sucesso');
        loadCategories();
      } else {
        toast.error(response.message || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSaving(true);
    try {
      let response;
      
      if (selectedCategory) {
        // Update existing category
        response = await categoryService.updateCategory(selectedCategory.id, {
          name: formData.name,
          type: formData.type,
          description: formData.description
        });
      } else {
        // Create new category
        response = await categoryService.createCategory({
          name: formData.name,
          type: formData.type,
          parent: formData.parent || undefined,
          description: formData.description || undefined
        });
      }

      if (response.success) {
        toast.success(selectedCategory ? 'Categoria atualizada com sucesso' : 'Categoria criada com sucesso');
        setShowCategoryModal(false);
        loadCategories();
      } else {
        toast.error(response.message || 'Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: CategoryType) => {
    switch (type) {
      case 'subject':
        return BookOpen;
      case 'topic':
        return Tag;
      case 'exam_board':
        return Building2;
      case 'year':
        return Calendar;
    }
  };

  const getCategoryTypeName = (type: CategoryType) => {
    switch (type) {
      case 'subject':
        return 'ÁREAS TÁTICAS';
      case 'topic':
        return 'ESPECIALIZAÇÕES';
      case 'exam_board':
        return 'INSTITUIÇÕES';
      case 'year':
        return 'PERÍODOS';
    }
  };

  const calculateStats = () => {
    const subjects = categories.filter(c => c.type === 'subject');
    const topics = subjects.reduce((acc, cat) => 
      acc + (cat.children?.length || 0) + 
      (cat.children?.reduce((sum, child) => sum + (child.children?.length || 0), 0) || 0), 0
    );
    const examBoards = categories.filter(c => c.type === 'exam_board').length;
    const years = categories.filter(c => c.type === 'year').length;

    return { subjects: subjects.length, topics, examBoards, years };
  };

  const stats = calculateStats();

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const Icon = getIcon(category.type);

    return (
      <div key={category.id}>
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className={`group hover:bg-accent-500/10 dark:hover:bg-gray-800 rounded-lg transition-colors ${
            level > 0 ? 'ml-8' : ''
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-accent-500/20 dark:hover:bg-gray-700 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-accent-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-accent-500" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  level === 0 
                    ? 'bg-accent-500/20 dark:bg-accent-500/10' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    level === 0 
                      ? 'text-accent-500 dark:text-accent-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {category.name}
                  </h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-primary-700 dark:text-gray-300 font-police-numbers">
                    {category.contentCount.questions}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-primary-700 dark:text-gray-300 font-police-numbers">
                    {category.contentCount.flashcards}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-primary-700 dark:text-gray-300 font-police-numbers">
                    {category.contentCount.summaries}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-primary-700 dark:text-gray-300 font-police-numbers">
                    {category.contentCount.courses}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                  className="text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </motion.div>
        )}
      </div>
    );
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
            CATEGORIAS TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            COMANDO DE ORGANIZAÇÃO - ESTRUTURAÇÃO ESTRATÉGICA DE CONTEÚDO
          </p>
        </div>
        
        <Button 
          onClick={handleCreateCategory} 
          disabled={loading}
          className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          NOVA CATEGORIA TÁTICA
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ÁREAS DE ATUAÇÃO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.subjects}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ESPECIALIZAÇÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.topics}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  INSTITUIÇÕES
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.examBoards}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  PERÍODOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.years}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {(['subject', 'topic', 'exam_board', 'year'] as CategoryType[]).map((type) => {
                  const Icon = getIcon(type);
                  return (
                    <Button
                      key={type}
                      variant={activeTab === type ? 'default' : 'outline'}
                      onClick={() => setActiveTab(type)}
                      disabled={loading}
                      className={`gap-2 whitespace-nowrap font-police-body font-semibold uppercase tracking-wider transition-colors ${
                        activeTab === type 
                          ? 'bg-accent-500 hover:bg-accent-600 text-black' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {getCategoryTypeName(type)}
                    </Button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR CATEGORIAS TÁTICAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeTab === 'subject' || activeTab === 'topic' ? (
                  filteredCategories.map(category => renderCategoryTree(category))
                ) : (
                  filteredCategories.map(category => (
                    <div key={category.id} className="group hover:bg-accent-500/10 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent-500/20 dark:bg-accent-500/10">
                            {React.createElement(getIcon(category.type), {
                              className: "w-5 h-5 text-accent-500 dark:text-accent-400"
                            })}
                          </div>
                          
                          <div>
                            <h4 className="font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              {category.name}
                            </h4>
                            {category.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                                {category.contentCount.questions}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                                {category.contentCount.flashcards}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                                {category.contentCount.summaries}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4 text-green-600" />
                              <span className="text-gray-900 dark:text-white font-police-numbers font-bold">
                                {category.contentCount.courses}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && filteredCategories.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-police-body uppercase tracking-wider">
                      Nenhuma categoria encontrada
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    placeholder="Ex: Direito Constitucional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CategoryType })}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                  >
                    <option value="subject">Matéria</option>
                    <option value="topic">Assunto</option>
                    <option value="exam_board">Banca</option>
                    <option value="year">Ano</option>
                  </select>
                </div>

                {(formData.type === 'topic') && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                      Categoria Pai
                    </label>
                    <select
                      value={formData.parent}
                      onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    >
                      <option value="">Nenhuma (categoria principal)</option>
                      {categories
                        .filter(c => c.type === 'subject')
                        .map(cat => (
                          <optgroup key={cat.id} label={cat.name}>
                            <option value={cat.id}>{cat.name}</option>
                            {cat.children?.map(child => (
                              <option key={child.id} value={child.id}>
                                &nbsp;&nbsp;{child.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-primary-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-primary-900 dark:text-white"
                    placeholder="Breve descrição da categoria..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryModal(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  className="gap-2"
                  onClick={handleSaveCategory}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}