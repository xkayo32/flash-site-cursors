import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Brain,
  Shield,
  Crosshair,
  BookOpen,
  Tag,
  Globe,
  Lock,
  Plus,
  X,
  Folder,
  FolderPlus,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category, CategoryType } from '@/services/categoryService';
import toast from 'react-hot-toast';

const difficulties = ['easy', 'medium', 'hard'];

export default function NewFlashcardDeck() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryLevels, setSelectedCategoryLevels] = useState<{[level: string]: string}>({});
  
  // Quick category creation modal
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [quickCategoryData, setQuickCategoryData] = useState({
    name: '',
    type: 'subject' as CategoryType,
    parent: '',
    description: ''
  });
  const [savingQuickCategory, setSavingQuickCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedCategories: [] as string[], // Array of selected category IDs
    difficulty: 'medium',
    isPublic: true,
    tags: '',
    estimatedCards: 50,
    objective: '',
    targetAudience: 'concursos',
    studyMethod: 'spaced_repetition',
    status: 'draft'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      } else if (response.categories) {
        setCategories(response.categories);
      } else {
        toast.error('Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.selectedCategories.includes(categoryId);
      let newSelectedCategories = [...prev.selectedCategories];

      if (isCurrentlySelected) {
        // Desmarcando: remover a categoria e todas suas filhas
        const categoriesToRemove = getAllChildrenIds(categoryId, categories);
        categoriesToRemove.push(categoryId);
        newSelectedCategories = newSelectedCategories.filter(id => !categoriesToRemove.includes(id));
      } else {
        // Marcando: primeiro GARANTIR que a categoria clicada está na lista
        if (!newSelectedCategories.includes(categoryId)) {
          newSelectedCategories.push(categoryId);
        }
        
        // Depois adicionar todos os pais necessários (sem duplicar)
        const parentsToAdd = getAllParentIds(categoryId, categories);
        parentsToAdd.forEach(parentId => {
          if (!newSelectedCategories.includes(parentId)) {
            newSelectedCategories.push(parentId);
          }
        });
      }
      
      return { ...prev, selectedCategories: newSelectedCategories };
    });
  };

  // Função auxiliar para encontrar todos os IDs dos filhos de uma categoria
  const getAllChildrenIds = (categoryId: string, categoriesList: Category[]): string[] => {
    const childrenIds: string[] = [];
    
    const findCategoryAndChildren = (cats: Category[]): void => {
      cats.forEach(cat => {
        if (cat.id === categoryId && cat.children) {
          // Encontrou a categoria, agora adicionar todos os filhos recursivamente
          const addAllChildren = (children: Category[]): void => {
            children.forEach(child => {
              childrenIds.push(child.id);
              if (child.children) {
                addAllChildren(child.children);
              }
            });
          };
          addAllChildren(cat.children);
        }
        if (cat.children) {
          findCategoryAndChildren(cat.children);
        }
      });
    };
    
    findCategoryAndChildren(categoriesList);
    return childrenIds;
  };

  // Função auxiliar para encontrar todos os IDs dos pais de uma categoria
  const getAllParentIds = (categoryId: string, categoriesList: Category[]): string[] => {
    const findCategoryPath = (cats: Category[], targetId: string, path: string[] = []): string[] | null => {
      for (const cat of cats) {
        const currentPath = [...path, cat.id];
        
        if (cat.id === targetId) {
          return currentPath.slice(0, -1); // Retorna o caminho sem o próprio ID
        }
        
        if (cat.children) {
          const found = findCategoryPath(cat.children, targetId, currentPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const path = findCategoryPath(categoriesList, categoryId);
    return path || [];
  };

  const handleCreateQuickCategory = async () => {
    if (!quickCategoryData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSavingQuickCategory(true);
    try {
      const response = await categoryService.createCategory({
        name: quickCategoryData.name,
        type: quickCategoryData.type,
        parent: quickCategoryData.parent || undefined,
        description: quickCategoryData.description || undefined
      });

      if (response.success) {
        toast.success('Categoria criada com sucesso!');
        setShowQuickCategoryModal(false);
        setQuickCategoryData({
          name: '',
          type: 'subject',
          parent: '',
          description: ''
        });
        // Reload categories to include the new one
        loadCategories();
      } else {
        toast.error(response.message || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Error creating quick category:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setSavingQuickCategory(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tagsList.includes(newTag.trim())) {
      setTagsList([...tagsList, newTag.trim().toUpperCase()]);
      setNewTag('');
      toast.success('MARCADOR TÁTICO ADICIONADO', {
        duration: 2000,
        icon: '🎯'
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
    toast.success('MARCADOR TÁTICO REMOVIDO', {
      duration: 2000,
      icon: '❌'
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = 'O objetivo é obrigatório';
    }

    if (formData.selectedCategories.length === 0) {
      newErrors.selectedCategories = 'Selecione pelo menos uma categoria';
    }

    if (formData.estimatedCards < 10) {
      newErrors.estimatedCards = 'O baralho deve ter pelo menos 10 cartões';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSelectedCategoryNames = () => {
    const names: string[] = [];
    
    const processCategories = (cats: Category[], parentPath: string = '') => {
      cats.forEach(cat => {
        if (formData.selectedCategories.includes(cat.id)) {
          const fullPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
          names.push(fullPath);
        }
        
        if (cat.children) {
          const currentPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
          processCategories(cat.children, currentPath);
        }
      });
    };
    
    processCategories(categories);
    return names;
  };

  const handleSave = (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('OPERAÇÃO FALHADA: Corrija os campos com erro', {
        icon: '🚨'
      });
      return;
    }

    setIsLoading(true);
    const action = isDraft ? 'salvando rascunho' : 'criando baralho';
    toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}...`, { id: 'save' });

    // Simular salvamento
    setTimeout(() => {
      const finalFormData = {
        ...formData,
        tags: tagsList.join(','),
        status: isDraft ? 'draft' : 'published'
      };
      
      toast.success(`OPERAÇÃO CONCLUÍDA: Arsenal ${isDraft ? 'salvo como rascunho' : 'criado'} com sucesso!`, { id: 'save' });
      setIsLoading(false);
      
      setTimeout(() => {
        navigate('/admin/flashcards');
      }, 1500);
    }, 2000);
  };

  const handlePreview = () => {
    toast.success('PREVIEW TÁTICO ATIVADO: Arsenal disponível para visualização', {
      duration: 3000,
      icon: '🎯'
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('OPERAÇÃO FALHADA: Configure campos obrigatórios', { icon: '🚨' });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      toast.success(`AVANÇANDO PARA FASE TÁTICA ${currentStep + 1}`, {
        duration: 2000,
        icon: '✅'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.success(`Voltando para etapa ${currentStep - 1}`, {
        duration: 2000,
        icon: '⬅️'
      });
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };

  const getTargetAudienceLabel = (audience: string) => {
    const labels = {
      concursos: 'CONCURSOS PÚBLICOS',
      operacional: 'TREINAMENTO OPERACIONAL',
      reciclagem: 'RECICLAGEM PROFISSIONAL',
      especializacao: 'ESPECIALIZAÇÃO'
    };
    return labels[audience as keyof typeof labels] || audience.toUpperCase();
  };

  const getStudyMethodLabel = (method: string) => {
    const labels = {
      spaced_repetition: 'REPETIÇÃO ESPAÇADA',
      active_recall: 'RECORDAÇÃO ATIVA',
      flashcards: 'FLASHCARDS TRADICIONAL',
      mixed: 'MÉTODO MISTO'
    };
    return labels[method as keyof typeof labels] || method.toUpperCase();
  };

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isSelected = formData.selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    
    // Verificar se foi selecionado automaticamente (porque um filho foi selecionado)
    const hasSelectedChildren = hasChildren && category.children?.some(child => 
      formData.selectedCategories.includes(child.id) ||
      (child.children && child.children.some(grandChild => formData.selectedCategories.includes(grandChild.id)))
    );
    const isAutoSelected = isSelected && hasSelectedChildren;

    return (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer relative
            ${isSelected 
              ? isAutoSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-sm'
                : 'bg-accent-500/20 border-accent-500 shadow-sm'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-accent-500/50'
            }
          `}
          onClick={() => handleCategoryToggle(category.id)}
        >
          {isAutoSelected && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Selecionado automaticamente"></div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCategoryToggle(category.id)}
              className="text-accent-500 focus:ring-accent-500 rounded"
            />
            {hasChildren ? (
              <Folder className={`w-4 h-4 ${isSelected ? 'text-accent-500' : 'text-gray-600 dark:text-gray-400'}`} />
            ) : (
              <Tag className={`w-4 h-4 ${isSelected ? 'text-accent-500' : 'text-gray-600 dark:text-gray-400'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {category.name}
              </span>
              {level === 0 && (
                <Badge variant="outline" className="text-xs font-police-body">
                  PRINCIPAL
                </Badge>
              )}
              {isAutoSelected && (
                <Badge className="text-xs font-police-body bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  AUTO
                </Badge>
              )}
            </div>
            {category.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        
        {hasChildren && (
          <div className="mt-2 space-y-1">
            {category.children!.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderQuickCategoryModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setShowQuickCategoryModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            NOVA CATEGORIA RÁPIDA
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={quickCategoryData.name}
              onChange={(e) => setQuickCategoryData({ ...quickCategoryData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
              placeholder="Ex: Direito Constitucional"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Tipo
            </label>
            <select
              value={quickCategoryData.type}
              onChange={(e) => setQuickCategoryData({ ...quickCategoryData, type: e.target.value as CategoryType })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
            >
              <option value="subject">Matéria Principal</option>
              <option value="topic">Assunto/Tópico</option>
            </select>
          </div>

          {quickCategoryData.type === 'topic' && (
            <div>
              <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Categoria Pai
              </label>
              <select
                value={quickCategoryData.parent}
                onChange={(e) => setQuickCategoryData({ ...quickCategoryData, parent: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
              >
                <option value="">Selecione uma categoria pai</option>
                {categories
                  .filter(cat => !cat.parent_id)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Descrição
            </label>
            <textarea
              value={quickCategoryData.description}
              onChange={(e) => setQuickCategoryData({ ...quickCategoryData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body"
              placeholder="Descrição opcional..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => setShowQuickCategoryModal(false)}
            disabled={savingQuickCategory}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateQuickCategory}
            disabled={savingQuickCategory || !quickCategoryData.name.trim()}
            className="bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold"
          >
            {savingQuickCategory ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Categoria
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/flashcards')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO ARSENAL INTEL
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                OPERAÇÃO DE CRIAÇÃO DE BARALHO TÁTICO
              </p>
            </div>
          </div>
        
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              onClick={handlePreview}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              PREVIEW TÁTICO
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              SALVAR RASCUNHO
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {isLoading ? 'PROCESSANDO...' : 'CONFIRMAR OPERAÇÃO'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl relative overflow-hidden">
          {/* Tactical stripes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-police-numbers font-bold text-sm transition-all duration-300 shadow-lg ${
                      step <= currentStep
                        ? 'bg-accent-500 text-black shadow-accent-500/30'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step <= currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <div className="ml-3">
                    <p className={`font-police-subtitle font-semibold uppercase tracking-wider text-xs ${
                      step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step === 1 && 'BRIEFING INICIAL'}
                      {step === 2 && 'CONFIG. TÁTICAS'}
                      {step === 3 && 'CONFIRMAÇÃO OPERACIONAL'}
                    </p>
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step < currentStep ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep === 1 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Target className="w-6 h-6 text-accent-500" />
                ETAPA 1: BRIEFING INICIAL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-500" />
                  IDENTIFICAÇÃO TÁTICA DO ARSENAL *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="EX: ARTIGOS DO CÓDIGO PENAL MILITAR"
                  className={`w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50 ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent-500" />
                  BRIEFING OPERACIONAL *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="DESCREVA O CONTEÚDO E OBJETIVOS TÁTICOS DO ARSENAL..."
                  className={`w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Categories Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-accent-500" />
                    CATEGORIAS TÁTICAS *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickCategoryModal(true)}
                    className="gap-2 font-police-body uppercase tracking-wider text-xs border-accent-500/30 hover:border-accent-500 transition-colors"
                  >
                    <FolderPlus className="w-3 h-3" />
                    NOVA CATEGORIA
                  </Button>
                </div>
                
                <div className={`border-2 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3 ${
                  errors.selectedCategories 
                    ? 'border-red-500' 
                    : 'border-accent-500/30 focus-within:border-accent-500'
                }`}>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
                      <span className="ml-2 font-police-body text-gray-600 dark:text-gray-400">
                        CARREGANDO CATEGORIAS...
                      </span>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-accent-500" />
                            <p className="text-xs font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              INSTRUÇÕES TÁTICAS
                            </p>
                          </div>
                          <div className="space-y-1 text-xs font-police-body text-gray-600 dark:text-gray-400">
                            <p>• <strong>Seleção Automática:</strong> Marcar uma subcategoria automaticamente marca a categoria pai</p>
                            <p>• <strong>Desmarcação Cascata:</strong> Desmarcar categoria pai remove todas as subcategorias</p>
                            <p>• <strong>Indicador AUTO:</strong> Badge azul mostra categorias selecionadas automaticamente</p>
                            <p>• <strong>Múltipla Seleção:</strong> Você pode selecionar várias categorias para organizar o deck</p>
                          </div>
                        </div>
                      </div>
                      
                      {categories.map(category => renderCategoryTree(category))}
                      
                      {formData.selectedCategories.length > 0 && (
                        <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-accent-500" />
                            <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                              CATEGORIAS SELECIONADAS ({formData.selectedCategories.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getSelectedCategoryNames().map((name, index) => (
                              <Badge key={index} className="bg-accent-500 text-black font-police-body font-semibold text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Folder className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-police-body text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        NENHUMA CATEGORIA ENCONTRADA
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowQuickCategoryModal(true)}
                        className="mt-3 gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider"
                      >
                        <FolderPlus className="w-4 h-4" />
                        CRIAR PRIMEIRA CATEGORIA
                      </Button>
                    </div>
                  )}
                </div>
                
                {errors.selectedCategories && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.selectedCategories}
                  </p>
                )}
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-accent-500" />
                  NÍVEL DE CLEARANCE *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-accent-500/30 focus:border-accent-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500/30 transition-all duration-300 hover:border-accent-500/50"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {getDifficultyLabel(difficulty)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  OBJETIVO DO BARALHO *
                </label>
                <textarea
                  rows={2}
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  placeholder="QUAL O OBJETIVO DE APRENDIZAGEM DESTE BARALHO?"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                    errors.objective ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.objective && (
                  <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.objective}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  PRÓXIMA ETAPA
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Shield className="w-6 h-6 text-accent-500" />
                ETAPA 2: CONFIGURAÇÕES TÁTICAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    PÚBLICO ALVO
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="concursos">CONCURSOS PÚBLICOS</option>
                    <option value="operacional">TREINAMENTO OPERACIONAL</option>
                    <option value="reciclagem">RECICLAGEM PROFISSIONAL</option>
                    <option value="especializacao">ESPECIALIZAÇÃO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    MÉTODO DE ESTUDO
                  </label>
                  <select
                    value={formData.studyMethod}
                    onChange={(e) => handleInputChange('studyMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="spaced_repetition">REPETIÇÃO ESPAÇADA</option>
                    <option value="active_recall">RECORDAÇÃO ATIVA</option>
                    <option value="flashcards">FLASHCARDS TRADICIONAL</option>
                    <option value="mixed">MÉTODO MISTO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    NÚMERO ESTIMADO DE CARTÕES *
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCards}
                    onChange={(e) => handleInputChange('estimatedCards', parseInt(e.target.value) || 0)}
                    min="10"
                    max="1000"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all ${
                      errors.estimatedCards ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.estimatedCards && (
                    <p className="mt-1 text-sm text-red-600 font-police-body flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.estimatedCards}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    VISIBILIDADE
                  </label>
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => handleInputChange('isPublic', true)}
                        className="text-accent-500 focus:ring-accent-500"
                      />
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        PÚBLICO
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => handleInputChange('isPublic', false)}
                        className="text-accent-500 focus:ring-accent-500"
                      />
                      <span className="font-police-body text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        PRIVADO
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  TAGS OPERACIONAIS
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="ADICIONAR TAG..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ADICIONAR
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tagsList.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                      NENHUMA TAG ADICIONADA
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  REVISÃO FINAL
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Crosshair className="w-6 h-6 text-accent-500" />
                ETAPA 3: CONFIRMAÇÃO OPERACIONAL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Deck Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <Brain className="w-6 h-6 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      {formData.title || 'TÍTULO NÃO INFORMADO'}
                    </h3>
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description || 'DESCRIÇÃO NÃO INFORMADA'}
                    </p>
                    <div className="space-y-4">
                      {/* Selected Categories */}
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">CATEGORIAS SELECIONADAS</p>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedCategoryNames().length > 0 ? (
                            getSelectedCategoryNames().map((name, index) => (
                              <Badge key={index} className="bg-accent-500 text-black font-police-body font-semibold">
                                {name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">NENHUMA CATEGORIA SELECIONADA</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">CARTÕES</p>
                          <p className="font-police-numbers text-gray-900 dark:text-white">{formData.estimatedCards}</p>
                        </div>
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">DIFICULDADE</p>
                          <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                            {getDifficultyLabel(formData.difficulty)}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">NÍVEIS SELECIONADOS</p>
                          <p className="font-police-numbers text-gray-900 dark:text-white">{formData.selectedCategories.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div>
                <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  OBJETIVO OPERACIONAL
                </h4>
                <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {formData.objective || 'OBJETIVO NÃO INFORMADO'}
                </p>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    CONFIGURAÇÕES
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Público Alvo:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{getTargetAudienceLabel(formData.targetAudience)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Método:</span>
                      <span className="font-police-body text-gray-900 dark:text-white uppercase">{getStudyMethodLabel(formData.studyMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Visibilidade:</span>
                      <div className="flex items-center gap-1">
                        {formData.isPublic ? (
                          <>
                            <Globe className="w-4 h-4 text-accent-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PÚBLICO</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="font-police-body text-gray-900 dark:text-white uppercase">PRIVADO</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    TAGS OPERACIONAIS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.length > 0 ? (
                      tagsList.map((tag, index) => (
                        <Badge key={index} variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-police-body">
                        NENHUMA TAG ADICIONADA
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    SALVAR RASCUNHO
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isLoading}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isLoading ? 'CRIANDO...' : 'CONFIRMAR E CRIAR'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Quick Category Modal */}
      <AnimatePresence>
        {showQuickCategoryModal && renderQuickCategoryModal()}
      </AnimatePresence>
    </div>
  );
}