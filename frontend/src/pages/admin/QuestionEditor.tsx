import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  Download,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Copy,
  BookOpen,
  Tag,
  Calendar,
  User,
  BarChart3,
  Target,
  Crosshair,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { questionService, type Question, type QuestionFilters } from '../../services/questionService';
import { categoryService, type Category } from '@/services/categoryService';
import toast from 'react-hot-toast';

const difficulties = ['Todos', 'easy', 'medium', 'hard'];
const statuses = ['Todos', 'published', 'draft', 'archived'];
const questionTypes = ['Todos', 'multiple_choice', 'true_false', 'fill_blank', 'essay'];

export default function QuestionEditor() {
  const navigate = useNavigate();
  
  // API data states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter options from API
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [examBoards, setExamBoards] = useState<string[]>([]);
  
  // Estados para o sistema de categorias hierárquicas
  const [categoriesHierarchy, setCategoriesHierarchy] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [selectedTopic, setSelectedTopic] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedExamBoard, setSelectedExamBoard] = useState('Todos');
  
  // UI states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await questionService.getFilterOptions();
        if (response.success) {
          const { subjects: apiSubjects, topics: apiTopics, examBoards: apiExamBoards } = response.data;
          setSubjects(['Todos', ...apiSubjects]);
          setTopics(['Todos', ...apiTopics]);
          setExamBoards(['Todos', ...apiExamBoards]);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
        toast.error('Erro ao carregar opções de filtro');
      }
    };

    loadFilterOptions();
    loadCategoriesHierarchy();
  }, []);
  
  const loadCategoriesHierarchy = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategoryHierarchy();
      console.log('🎯 Categories hierarchy loaded:', response);
      setCategoriesHierarchy(response);
    } catch (err) {
      console.error('Error loading categories hierarchy:', err);
      setCategoriesHierarchy([]);
    } finally {
      setLoadingCategories(false);
    }
  };
  
  // Funções para gerenciar categorias hierárquicas
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const findParentChain = (categoryId: string, cats: Category[] = categoriesHierarchy): string[] => {
    const parentChain: string[] = [];
    
    const findParentRecursive = (id: string, catList: Category[]): boolean => {
      for (const cat of catList) {
        if (cat.id === id) {
          return true;
        }
        if (cat.children && cat.children.length > 0) {
          if (findParentRecursive(id, cat.children)) {
            parentChain.unshift(cat.id);
            return true;
          }
        }
      }
      return false;
    };
    
    findParentRecursive(categoryId, cats);
    return parentChain;
  };
  
  const findAllChildren = (categoryId: string, cats: Category[] = categoriesHierarchy): string[] => {
    const childrenIds: string[] = [];
    
    const findChildrenRecursive = (id: string, catList: Category[]) => {
      for (const cat of catList) {
        if (cat.id === id) {
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => {
              childrenIds.push(child.id);
              findChildrenRecursive(child.id, catList);
            });
          }
          return;
        }
        if (cat.children && cat.children.length > 0) {
          findChildrenRecursive(id, cat.children);
        }
      }
    };
    
    findChildrenRecursive(categoryId, cats);
    return childrenIds;
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      
      if (isSelected) {
        // Desmarcar categoria e todos os filhos
        const childrenIds = findAllChildren(categoryId);
        return prev.filter(id => id !== categoryId && !childrenIds.includes(id));
      } else {
        // Marcar categoria e todos os pais
        const parentChain = findParentChain(categoryId);
        return [...new Set([...prev, categoryId, ...parentChain])];
      }
    });
  };
  
  const getSelectedCategoryNames = (): string => {
    if (selectedCategories.length === 0) return 'TODAS AS MATÉRIAS';
    if (selectedCategories.length === 1) {
      const findCategoryName = (id: string, cats: Category[]): string => {
        for (const cat of cats) {
          if (cat.id === id) return cat.name;
          if (cat.children) {
            const found = findCategoryName(id, cat.children);
            if (found) return found;
          }
        }
        return '';
      };
      return findCategoryName(selectedCategories[0], categoriesHierarchy) || 'MATÉRIA';
    }
    return `${selectedCategories.length} MATÉRIAS`;
  };
  
  const renderCategoryTree = (cats: Category[], level = 0): JSX.Element[] => {
    const filteredCats = categorySearchTerm
      ? cats.filter(cat => 
          cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          (cat.children && cat.children.some(child => 
            child.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
          ))
        )
      : cats;
    
    return filteredCats.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);
      const isSelected = selectedCategories.includes(category.id);
      const childrenSelected = category.children?.some(child => 
        selectedCategories.includes(child.id)
      ) || false;
      
      return (
        <div key={category.id} className="select-none">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isSelected ? 'bg-accent-500/20 hover:bg-accent-500/30 dark:bg-accent-500/20 dark:hover:bg-accent-500/30' : ''
            } ${childrenSelected && !isSelected ? 'bg-accent-500/10' : ''}`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryExpansion(category.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            
            {!hasChildren && (
              <div className="w-5" />
            )}
            
            <div className="flex items-center gap-2 flex-1" onClick={() => handleCategoryToggle(category.id)}>
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-accent-500" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-500" />
                )
              ) : (
                <Tag className="w-4 h-4 text-gray-400" />
              )}
              
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // Controlled by onClick above
                className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                onClick={(e) => e.stopPropagation()}
              />
              
              <span className={`font-police-body text-sm ${
                isSelected ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {category.name}
              </span>
              
              {category.contentCount && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  ({Object.values(category.contentCount).reduce((a, b) => a + b, 0)})
                </span>
              )}
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Load questions with current filters
  const loadQuestions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filters: QuestionFilters = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        subject: selectedSubject !== 'Todos' ? selectedSubject : undefined,
        topic: selectedTopic !== 'Todos' ? selectedTopic : undefined,
        difficulty: selectedDifficulty !== 'Todos' ? selectedDifficulty as any : undefined,
        type: selectedType !== 'Todos' ? selectedType as any : undefined,
        status: selectedStatus !== 'Todos' ? selectedStatus as any : undefined,
        exam_board: selectedExamBoard !== 'Todos' ? selectedExamBoard : undefined
      };

      const response = await questionService.getQuestions(filters);
      
      if (response.success) {
        setQuestions(response.data);
        setTotalQuestions(response.pagination.total);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
      } else {
        throw new Error('Falha ao carregar questões');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Erro ao carregar questões');
      toast.error('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  // Load questions when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadQuestions(1);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSubject, selectedTopic, selectedDifficulty, selectedStatus, selectedType, selectedExamBoard]);

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'FÁCIL',
      medium: 'MÉDIO',
      hard: 'DIFÍCIL'
    };
    return labels[difficulty as keyof typeof labels] || difficulty.toUpperCase();
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      easy: { label: 'FÁCIL', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      medium: { label: 'MÉDIO', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      hard: { label: 'DIFÍCIL', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
    return (
      <Badge className={`${config.color} font-police-body font-semibold uppercase tracking-wider`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'PUBLICADA', color: 'bg-accent-500 text-black dark:bg-accent-600 dark:text-black', icon: CheckCircle },
      draft: { label: 'RASCUNHO', color: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300', icon: Edit },
      archived: { label: 'ARQUIVADA', color: 'bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-300', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 font-police-body font-semibold uppercase tracking-wider`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      multiple_choice: { label: 'MÚLTIPLA ESCOLHA', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      true_false: { label: 'VERDADEIRO/FALSO', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      fill_blank: { label: 'COMPLETAR LACUNAS', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      essay: { label: 'DISSERTATIVA', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge className={`${config.color} font-police-body font-semibold uppercase tracking-wider`}>
        {config.label}
      </Badge>
    );
  };

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(
      selectedQuestions.length === questions.length 
        ? [] 
        : questions.map(q => q.id)
    );
  };

  const handleViewQuestion = (question: Question) => {
    navigate(`/admin/questions/view/${question.id}`);
  };

  const handleQuickView = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditing(false);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    navigate(`/admin/questions/edit/${question.id}`);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('CONFIRMAR EXCLUSÃO: Tem certeza que deseja excluir esta questão?')) {
      return;
    }
    
    try {
      const response = await questionService.deleteQuestion(id);
      if (response.success) {
        toast.success('OPERAÇÃO CONCLUÍDA: Questão excluída com sucesso!');
        loadQuestions(currentPage);
      } else {
        throw new Error(response.message || 'Erro ao excluir questão');
      }
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast.error(`OPERAÇÃO FALHADA: ${error.message || 'Erro ao excluir questão'}`);
    }
  };

  const handleDuplicateQuestion = (question: Question) => {
    // Navigate to new question page with prefilled data
    navigate('/admin/questions/new', { 
      state: { 
        duplicateFrom: {
          title: `${question.title} (CÓPIA)`,
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          type: question.type,
          options: question.options,
          correct_answer: question.correct_answer,
          correct_boolean: question.correct_boolean,
          expected_answer: question.expected_answer,
          explanation: question.explanation,
          exam_board: question.exam_board,
          exam_year: question.exam_year,
          reference: question.reference,
          tags: question.tags
        }
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadQuestions(page);
  };

  const handleRefresh = () => {
    loadQuestions(currentPage);
    toast.success('Lista atualizada!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('Todos');
    setSelectedTopic('Todos');
    setSelectedDifficulty('Todos');
    setSelectedStatus('Todos');
    setSelectedType('Todos');
    setSelectedExamBoard('Todos');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-6 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="border-l-4 border-l-accent-500 pl-6">
            <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
              COMANDO DE QUESTÕES
            </h1>
            <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
              CENTRO DE OPERAÇÕES TÁTICAS - GESTÃO DE ARSENAL
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-500" />
                <span className="text-gray-300 font-police-body uppercase tracking-wider">
                  {totalQuestions} ALVOS CADASTRADOS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-500" />
                <span className="text-gray-300 font-police-body uppercase tracking-wider">
                  PÁGINA {currentPage} DE {totalPages}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              disabled={loading}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              ATUALIZAR
            </Button>
            <Button
              onClick={() => navigate('/admin/questions/new')}
              className="gap-2 font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black hover:text-black transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              NOVO ALVO
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
          <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
            <Filter className="w-5 h-5 text-accent-500" />
            FILTROS TÁTICOS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="BUSCAR POR TÍTULO, MATÉRIA OU TÓPICO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              onClick={() => setShowCategoryModal(true)}
              variant="outline"
              className="justify-between font-police-body font-medium uppercase tracking-wider transition-all duration-300 border border-gray-300 dark:border-gray-600 hover:border-accent-500 hover:text-accent-500 dark:hover:border-accent-500 px-3 py-2 h-auto"
            >
              <span className="truncate">{getSelectedCategoryNames()}</span>
              <Filter className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              <option value="Todos">TODOS OS TIPOS</option>
              <option value="multiple_choice">MÚLTIPLA ESCOLHA</option>
              <option value="true_false">VERDADEIRO/FALSO</option>
              <option value="fill_blank">COMPLETAR LACUNAS</option>
              <option value="essay">DISSERTATIVA</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'Todos' ? 'TODAS DIFICULDADES' : getDifficultyLabel(difficulty)}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'Todos' ? 'TODOS STATUS' : status.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={selectedExamBoard}
              onChange={(e) => setSelectedExamBoard(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              {examBoards.map(board => (
                <option key={board} value={board}>
                  {board.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="gap-2 font-police-body uppercase tracking-wider"
            >
              <X className="w-4 h-4" />
              LIMPAR FILTROS
            </Button>
            
            {selectedQuestions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                  {selectedQuestions.length} SELECIONADAS
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="font-police-body uppercase tracking-wider"
                >
                  AÇÕES EM LOTE
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-500" />
            <span className="font-police-body uppercase tracking-wider text-gray-600 dark:text-gray-400">
              CARREGANDO ARSENAL TÁTICO...
            </span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center border-red-300 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="font-police-body uppercase tracking-wider text-red-600 dark:text-red-400">
              OPERAÇÃO FALHADA
            </span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-police-body">{error}</p>
          <Button
            onClick={() => loadQuestions(currentPage)}
            className="mt-4 font-police-body uppercase tracking-wider"
            variant="outline"
          >
            TENTAR NOVAMENTE
          </Button>
        </Card>
      )}

      {/* Questions List */}
      {!loading && !error && (
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Brain className="w-5 h-5 text-accent-500" />
                ARSENAL DE QUESTÕES
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuestions.length === questions.length && questions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase">
                  SELECIONAR TODAS
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {questions.length === 0 ? (
              <div className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-police-subtitle text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  NENHUM ALVO LOCALIZADO
                </h3>
                <p className="text-gray-500 dark:text-gray-500 font-police-body">
                  Ajuste os filtros ou crie uma nova questão.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleSelectQuestion(question.id)}
                        className="mt-2 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-base font-police-subtitle font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {question.title}
                          </h3>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleViewQuestion(question)}
                              className="gap-1 font-police-body uppercase tracking-wider hover:bg-accent-500/10 hover:text-accent-500"
                            >
                              <Eye className="w-4 h-4" />
                              VER
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditQuestion(question)}
                              className="gap-1 font-police-body uppercase tracking-wider hover:bg-blue-500/10 hover:text-blue-500"
                            >
                              <Edit className="w-4 h-4" />
                              EDITAR
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicateQuestion(question)}
                              className="gap-1 font-police-body uppercase tracking-wider hover:bg-green-500/10 hover:text-green-500"
                            >
                              <Copy className="w-4 h-4" />
                              DUPLICAR
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="gap-1 font-police-body uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                              EXCLUIR
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(question.status)}
                          {getDifficultyBadge(question.difficulty)}
                          {getTypeBadge(question.type)}
                          
                          <Badge variant="outline" className="font-police-body uppercase tracking-wider">
                            {question.subject}
                          </Badge>
                          
                          {question.topic && (
                            <Badge variant="outline" className="font-police-body uppercase tracking-wider text-xs">
                              {question.topic}
                            </Badge>
                          )}
                          
                          {question.exam_board && (
                            <Badge variant="outline" className="font-police-body uppercase tracking-wider text-xs">
                              {question.exam_board}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 font-police-body">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {question.author_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(question.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {question.times_answered || 0} respostas ({(question.correct_rate || 0).toFixed(1)}% acerto)
                          </div>
                          {question.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {question.tags.slice(0, 2).join(', ')}
                              {question.tags.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalQuestions)} de {totalQuestions} questões
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="font-police-body uppercase tracking-wider"
            >
              ANTERIOR
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="font-police-body"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="font-police-body uppercase tracking-wider"
            >
              PRÓXIMA
            </Button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && selectedQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {isEditing ? 'EDITAR QUESTÃO' : 'DETALHES DA QUESTÃO'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-police-body">
                    ID: {selectedQuestion.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Question Title */}
                <div>
                  <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    ENUNCIADO DA QUESTÃO
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedQuestion.title}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-gray-900 dark:text-white font-police-body whitespace-pre-wrap">
                        {selectedQuestion.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Question Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      MATÉRIA
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedQuestion.subject}
                        onChange={(e) => setSelectedQuestion({...selectedQuestion, subject: e.target.value})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="font-police-body text-gray-900 dark:text-white">{selectedQuestion.subject}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      TÓPICO
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedQuestion.topic}
                        onChange={(e) => setSelectedQuestion({...selectedQuestion, topic: e.target.value})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="font-police-body text-gray-900 dark:text-white">{selectedQuestion.topic}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      DIFICULDADE
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedQuestion.difficulty}
                        onChange={(e) => setSelectedQuestion({...selectedQuestion, difficulty: e.target.value as any})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        <option value="easy">FÁCIL</option>
                        <option value="medium">MÉDIO</option>
                        <option value="hard">DIFÍCIL</option>
                      </select>
                    ) : (
                      <div className="p-2">
                        {getDifficultyBadge(selectedQuestion.difficulty)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Options (if multiple choice) */}
                {selectedQuestion.type === 'multiple_choice' && selectedQuestion.options && (
                  <div>
                    <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      OPÇÕES DE RESPOSTA
                    </label>
                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            index === selectedQuestion.correct_answer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-police-numbers font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...selectedQuestion.options!];
                                    newOptions[index] = e.target.value;
                                    setSelectedQuestion({...selectedQuestion, options: newOptions});
                                  }}
                                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                                />
                                <button
                                  onClick={() => setSelectedQuestion({...selectedQuestion, correct_answer: index})}
                                  className={`px-3 py-1 text-xs rounded font-police-body uppercase tracking-wider ${
                                    index === selectedQuestion.correct_answer
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-400'
                                  }`}
                                >
                                  {index === selectedQuestion.correct_answer ? 'CORRETA' : 'MARCAR'}
                                </button>
                              </div>
                            ) : (
                              <span className="font-police-body text-gray-900 dark:text-white">
                                {option}
                              </span>
                            )}
                            {!isEditing && index === selectedQuestion.correct_answer && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-police-subtitle font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    EXPLICAÇÃO
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedQuestion.explanation || ''}
                      onChange={(e) => setSelectedQuestion({...selectedQuestion, explanation: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      rows={4}
                      placeholder="Adicione uma explicação para a resposta..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-gray-900 dark:text-white font-police-body whitespace-pre-wrap">
                        {selectedQuestion.explanation || 'Nenhuma explicação disponível'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={async () => {
                            if (!selectedQuestion) return;
                            
                            try {
                              const response = await questionService.updateQuestion(selectedQuestion.id, {
                                title: selectedQuestion.title,
                                type: selectedQuestion.type,
                                subject: selectedQuestion.subject,
                                topic: selectedQuestion.topic,
                                difficulty: selectedQuestion.difficulty,
                                explanation: selectedQuestion.explanation,
                                options: selectedQuestion.options,
                                correct_answer: selectedQuestion.correct_answer,
                                correct_boolean: selectedQuestion.correct_boolean,
                                expected_answer: selectedQuestion.expected_answer,
                                exam_board: selectedQuestion.exam_board,
                                exam_year: selectedQuestion.exam_year,
                                reference: selectedQuestion.reference,
                                tags: selectedQuestion.tags
                              });
                              
                              if (response.success) {
                                toast.success('OPERAÇÃO CONCLUÍDA: Questão atualizada com sucesso!');
                                setShowQuestionModal(false);
                                setIsEditing(false);
                                // Reload questions to show updated data
                                loadQuestions(currentPage);
                              } else {
                                throw new Error(response.message || 'Erro ao atualizar questão');
                              }
                            } catch (error: any) {
                              console.error('Error updating question:', error);
                              toast.error(`OPERAÇÃO FALHADA: ${error.message || 'Erro ao atualizar questão'}`);
                            }
                          }}
                          className="gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                        >
                          <Save className="w-4 h-4" />
                          SALVAR ALTERAÇÕES
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="font-police-body uppercase tracking-wider"
                        >
                          CANCELAR EDIÇÃO
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-police-body uppercase tracking-wider"
                      >
                        <Edit className="w-4 h-4" />
                        EDITAR QUESTÃO
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowQuestionModal(false)}
                    className="font-police-body uppercase tracking-wider"
                  >
                    FECHAR
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Category Selection Modal */}
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
              className="rounded-lg p-6 max-w-2xl w-full border-2 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  SELECIONAR MATÉRIAS OPERACIONAIS
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar matérias operacionais..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg transition-all duration-300 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none"
                />
              </div>
              
              {/* Category Tree */}
              <div className="flex-1 overflow-y-auto border rounded-lg border-gray-200 dark:border-gray-700 p-2">
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
                    <span className="ml-2 font-police-body text-sm text-gray-600 dark:text-gray-400">
                      CARREGANDO BANCO DE QUESTÕES...
                    </span>
                  </div>
                ) : categoriesHierarchy.length > 0 ? (
                  <div className="space-y-2">
                    {renderCategoryTree(categoriesHierarchy)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-police-body text-sm">
                      NENHUMA MATÉRIA OPERACIONAL DISPONÍVEL
                    </p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                  <Target className="w-4 h-4 inline mr-1" />
                  {selectedCategories.length} MATÉRIA(S) SELECIONADA(S)
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories([]);
                      setCategorySearchTerm('');
                    }}
                    className="font-police-body font-medium uppercase tracking-wider transition-all duration-300 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-500 hover:text-gray-500"
                  >
                    <X className="w-4 h-4 mr-1" />
                    LIMPAR
                  </Button>
                  <Button
                    onClick={() => setShowCategoryModal(false)}
                    className="font-police-body font-semibold transition-all duration-300 uppercase tracking-wider shadow-lg bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    APLICAR FILTROS
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}