import React, { useState, useEffect } from 'react';
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
  FolderPlus,
  Tag,
  Calendar,
  Building2,
  BookOpen,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  Brain,
  Star,
  Layers,
  GitBranch,
  ArrowRight,
  Hash,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category, CategoryType } from '@/services/categoryService';
import toast from 'react-hot-toast';

interface CategoryFormData {
  name: string;
  type: 'parent' | 'child';
  parent_id: string;
  description: string;
  icon?: string;
  color?: string;
}

export default function CategoryManagerImproved() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'parent',
    parent_id: '',
    description: '',
    icon: '',
    color: '#14242f'
  });

  // View options
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('tree');
  const [showStats, setShowStats] = useState(true);

  // Icon options for categories
  const iconOptions = [
    { value: 'book', icon: BookOpen, label: 'Livro' },
    { value: 'brain', icon: Brain, label: 'Cérebro' },
    { value: 'tag', icon: Tag, label: 'Tag' },
    { value: 'folder', icon: Folder, label: 'Pasta' },
    { value: 'star', icon: Star, label: 'Estrela' },
    { value: 'users', icon: Users, label: 'Usuários' },
    { value: 'file', icon: FileText, label: 'Arquivo' },
    { value: 'hash', icon: Hash, label: 'Hash' }
  ];

  // Color presets for categories
  const colorPresets = [
    '#14242f', // Military base
    '#facc15', // Tactical yellow
    '#ef4444', // Red
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#6b7280'  // Gray
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.listCategories();
      console.log('Categories response:', response);
      
      if (response.success && response.categories) {
        // Categories already come organized from API
        setCategories(response.categories);
      } else if (response.categories) {
        // Direct categories array
        setCategories(response.categories);
      } else {
        toast.error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const organizeCategories = (cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];
    
    // First pass: create map
    cats.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });
    
    // Second pass: build hierarchy
    cats.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });
    
    return rootCategories;
  };

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }
    
    const filtered = filterCategoriesRecursive(categories, searchTerm.toLowerCase());
    setFilteredCategories(filtered);
  };

  const filterCategoriesRecursive = (cats: Category[], term: string): Category[] => {
    return cats.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(term) ||
                           cat.description?.toLowerCase().includes(term);
      
      if (cat.children && cat.children.length > 0) {
        const filteredChildren = filterCategoriesRecursive(cat.children, term);
        if (filteredChildren.length > 0) {
          cat.children = filteredChildren;
          return true;
        }
      }
      
      return matchesSearch;
    });
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCreateCategory = (parent?: Category) => {
    setSelectedParent(parent || null);
    setFormData({
      name: '',
      type: parent ? 'child' : 'parent',
      parent_id: parent?.id || '',
      description: '',
      icon: '',
      color: '#14242f'
    });
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.parent_id ? 'child' : 'parent',
      parent_id: category.parent_id || '',
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#14242f'
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.children && category.children.length > 0) {
      toast.error('Não é possível excluir categoria com subcategorias');
      return;
    }

    const hasContent = (category.contentCount?.questions || 0) +
                      (category.contentCount?.flashcards || 0) +
                      (category.contentCount?.summaries || 0) +
                      (category.contentCount?.courses || 0) > 0;

    if (hasContent) {
      toast.error('Não é possível excluir categoria com conteúdo');
      return;
    }

    if (!confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) {
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
    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const categoryData = {
        name: formData.name,
        type: formData.parent_id ? 'topic' : 'subject' as CategoryType,
        parent: formData.parent_id || undefined,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined
      };

      let response;
      if (selectedCategory) {
        // Update existing
        response = await categoryService.updateCategory(selectedCategory.id, categoryData);
      } else {
        // Create new
        response = await categoryService.createCategory(categoryData);
      }

      if (response.success) {
        toast.success(selectedCategory ? 'Categoria atualizada' : 'Categoria criada com sucesso');
        setShowCreateModal(false);
        setShowEditModal(false);
        // Reset form
        setFormData({
          name: '',
          type: 'parent',
          parent_id: '',
          description: '',
          icon: '',
          color: '#14242f'
        });
        setSelectedParent(null);
        setSelectedCategory(null);
        // Reload categories
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

  const getIconComponent = (iconName?: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option ? option.icon : Folder;
  };

  const getTotalContent = (category: Category): number => {
    const content = category.contentCount || { questions: 0, flashcards: 0, summaries: 0, courses: 0 };
    return content.questions + content.flashcards + content.summaries + content.courses;
  };

  const renderCategoryTree = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const Icon = getIconComponent(category.icon);
    const totalContent = getTotalContent(category);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        className="mb-2"
      >
        <div
          className={`
            group relative flex items-center justify-between p-4 rounded-xl
            bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60
            hover:border-accent-500/40 hover:shadow-lg hover:shadow-accent-500/10 
            hover:-translate-y-0.5 transition-all duration-300
            ${level > 0 ? 'ml-8' : ''}
            ${hasChildren ? 'border-l-4 border-l-accent-500/50' : ''}
          `}
          style={{
            borderLeftColor: hasChildren ? `${category.color || '#14242f'}80` : undefined
          }}
        >
          {/* Left side - Category info */}
          <div className="flex items-center gap-3 flex-1">
            {/* Expand/Collapse button */}
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            {/* Icon with improved styling and better contrast */}
            <div 
              className="relative p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
              style={{ 
                backgroundColor: hasChildren 
                  ? `${category.color || '#14242f'}15` 
                  : `${category.color || '#14242f'}10`,
                borderColor: `${category.color || '#14242f'}30`
              }}
            >
              {hasChildren ? (
                <FolderOpen 
                  className="w-6 h-6 drop-shadow-lg" 
                  style={{ 
                    color: category.color && category.color !== '#14242f' 
                      ? category.color 
                      : '#facc15', // Use tactical yellow for better contrast
                    filter: 'brightness(0.8) saturate(1.2)' // Enhance visibility
                  }}
                />
              ) : (
                <Icon 
                  className="w-6 h-6 drop-shadow-lg" 
                  style={{ 
                    color: category.color && category.color !== '#14242f' 
                      ? category.color 
                      : '#facc15', // Use tactical yellow for better contrast
                    filter: 'brightness(0.8) saturate(1.2)' // Enhance visibility
                  }}
                />
              )}
              {hasChildren && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: category.color || '#14242f' }}
                >
                  <span className="text-white text-[10px]">{category.children?.length}</span>
                </div>
              )}
            </div>

            {/* Name and description */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-police-body font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                {level === 0 && (
                  <Badge variant="outline" className="text-xs">
                    PRINCIPAL
                  </Badge>
                )}
                {hasChildren && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({category.children?.length} subcategorias)
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Stats and actions */}
          <div className="flex items-center gap-4">
            {/* Content stats */}
            {showStats && totalContent > 0 && (
              <div className="flex items-center gap-3 text-xs">
                {category.contentCount?.questions > 0 && (
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-purple-600" />
                    <span className="font-police-numbers">{category.contentCount.questions}</span>
                  </div>
                )}
                {category.contentCount?.flashcards > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-600" />
                    <span className="font-police-numbers">{category.contentCount.flashcards}</span>
                  </div>
                )}
                {category.contentCount?.summaries > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span className="font-police-numbers">{category.contentCount.summaries}</span>
                  </div>
                )}
                {category.contentCount?.courses > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-green-600" />
                    <span className="font-police-numbers">{category.contentCount.courses}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateCategory(category)}
                  className="relative h-8 w-8 p-0 text-gray-600 hover:text-accent-500 dark:text-gray-400 hover:bg-accent-500/10 rounded-lg transition-all duration-200"
                  title="Adicionar subcategoria"
                >
                  <FolderPlus className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                  className="relative h-8 w-8 p-0 text-gray-600 hover:text-blue-600 dark:text-gray-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  title="Editar categoria"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                  className="relative h-8 w-8 p-0 text-gray-600 hover:text-red-600 dark:text-gray-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderCreateEditModal = () => {
    const isEdit = showEditModal && selectedCategory;
    const modalTitle = isEdit 
      ? 'Editar Categoria' 
      : selectedParent 
        ? `Nova Subcategoria em "${selectedParent.name}"`
        : 'Nova Categoria Principal';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                {modalTitle}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Name field */}
            <div>
              <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Nome da Categoria *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                placeholder="Ex: Direito Constitucional"
                autoFocus
              />
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                placeholder="Descreva o conteúdo desta categoria..."
              />
            </div>

            {/* Icon and Color selection */}
            <div className="grid grid-cols-2 gap-6">
              {/* Icon selection */}
              <div>
                <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map(option => {
                    const IconComponent = option.icon;
                    const isSelected = formData.icon === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.value })}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-accent-500 bg-accent-500/10' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-accent-500/50'
                          }
                        `}
                        title={option.label}
                      >
                        <IconComponent className="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`
                        h-10 rounded-lg border-2 transition-all duration-200
                        ${formData.color === color 
                          ? 'border-gray-900 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Parent category info */}
            {selectedParent && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <GitBranch className="w-4 h-4" />
                  <span>Esta categoria será criada como subcategoria de:</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Folder className="w-5 h-5 text-accent-500" />
                  <span className="font-police-body font-semibold text-gray-900 dark:text-white">
                    {selectedParent.name}
                  </span>
                </div>
              </div>
            )}

            {/* Parent category selection (for new categories) */}
            {!selectedParent && !isEdit && (
              <div>
                <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Categoria Pai (Opcional)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      parent_id: e.target.value,
                      type: e.target.value ? 'child' : 'parent'
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                >
                  <option value="">Nenhuma (criar categoria principal)</option>
                  {categories.filter(cat => !cat.parent_id).map(cat => (
                    <React.Fragment key={cat.id}>
                      <option value={cat.id}>{cat.name}</option>
                      {cat.children?.map(child => (
                        <option key={child.id} value={child.id}>
                          └─ {child.name}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Deixe vazio para criar uma categoria principal ou selecione uma categoria existente para criar uma subcategoria
                </p>
              </div>
            )}

            {/* Type indicator */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {formData.type === 'parent' 
                  ? 'Esta será uma categoria principal que pode conter subcategorias'
                  : formData.parent_id 
                    ? `Esta será uma subcategoria de "${categories.find(c => c.id === formData.parent_id)?.name || 'categoria selecionada'}"`
                    : 'Esta será uma subcategoria aninhada'
                }
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={saving || !formData.name.trim()}
              className="bg-accent-500 hover:bg-accent-600 text-black"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Atualizar' : 'Criar Categoria'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            GERENCIADOR DE CATEGORIAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            Organize seu conteúdo em categorias hierárquicas
          </p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => handleCreateCategory()}
            disabled={loading}
            className="relative gap-3 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black font-police-body font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
          >
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Icon with container */}
            <div className="relative flex items-center justify-center w-8 h-8 bg-black/10 rounded-lg">
              <FolderPlus className="w-5 h-5" />
            </div>
            
            {/* Text */}
            <span className="relative z-10">
              NOVA CATEGORIA PRINCIPAL
            </span>
            
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-black/20" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and view options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar categorias..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
            </div>

            {/* View options */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className="gap-1"
              >
                <GitBranch className="w-4 h-4" />
                Árvore
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-1"
              >
                <Layers className="w-4 h-4" />
                Grade
              </Button>
              <Button
                variant={showStats ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="gap-1"
              >
                {showStats ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Stats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories tree */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-2">
              {filteredCategories.map(category => renderCategoryTree(category))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-police-body font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria criada'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Tente ajustar sua busca' 
                  : 'Comece criando uma categoria principal para organizar seu conteúdo'}
              </p>
              {!searchTerm && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleCreateCategory()}
                    className="relative gap-3 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-black font-police-body font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden"
                  >
                    {/* Background pattern */}
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
                        backgroundSize: '15px 15px'
                      }}
                    />
                    
                    <div className="relative flex items-center justify-center w-8 h-8 bg-black/10 rounded-lg">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    
                    <span className="relative z-10">
                      Criar Primeira Categoria
                    </span>
                    
                    <div className="absolute top-0 right-0 w-1 h-full bg-black/20" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && renderCreateEditModal()}
      </AnimatePresence>
    </div>
  );
}