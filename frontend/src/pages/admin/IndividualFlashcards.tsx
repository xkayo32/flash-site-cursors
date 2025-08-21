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
  Copy,
  MoreVertical,
  Target,
  Shield,
  Users,
  Calendar,
  Tag,
  Star,
  Grid3X3,
  List,
  Play,
  BookOpen,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  X,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import FlashcardPreviewModal from '@/components/FlashcardPreviewModal';
import FlashcardStudyModal from '@/components/FlashcardStudyModal';
import { flashcardService, type Flashcard, type FlashcardStats } from '@/services/flashcardService';
import { categoryService, type Category } from '@/services/categoryService';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import { CategorySelector } from '@/components/CategorySelector';


// Constantes para filtros (podem ser movidas para API no futuro)
const difficulties = ['Todos', 'easy', 'medium', 'hard'];
const statuses = ['Todos', 'active', 'pending', 'archived'];
const cardTypes = ['Todos', 'basic', 'basic_reversed', 'multiple_choice', 'true_false', 'cloze', 'type_answer', 'image_occlusion'];

export default function IndividualFlashcards() {
  const navigate = useNavigate();
  
  // Hook dinâmico para categorias
  const {
    categories,
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    getCategoryOptions,
    getSubcategoryOptions,
    isLoadingCategories,
    isLoadingSubcategories
  } = useDynamicCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedAuthor, setSelectedAuthor] = useState('Todos');
  const [availableAuthors, setAvailableAuthors] = useState<{id: string, name: string}[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load flashcards from API
  useEffect(() => {
    loadFlashcards();
    loadStats();
    loadAuthors();
  }, [currentPage, selectedCategory, selectedSubcategory, selectedDifficulty, selectedStatus, selectedType, selectedAuthor, searchTerm]);

  const loadAuthors = async () => {
    try {
      const response = await flashcardService.getFilterOptions();
      if (response.success && response.data && response.data.authors) {
        setAvailableAuthors(response.data.authors);
      } else {
        // Fallback para array vazio se não houver autores
        setAvailableAuthors([]);
      }
    } catch (err) {
      console.error('Error loading authors:', err);
      setAvailableAuthors([]);
    }
  };

  const loadFlashcards = async () => {
    try {
      setIsLoading(true);
      const filters = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        category: selectedCategory !== 'Todos' ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'Todas' ? selectedSubcategory : undefined,
        difficulty: selectedDifficulty !== 'Todos' ? selectedDifficulty as any : undefined,
        type: selectedType !== 'Todos' ? selectedType as any : undefined,
        status: selectedStatus !== 'Todos' ? selectedStatus as any : undefined,
        author_id: selectedAuthor !== 'Todos' ? selectedAuthor : undefined
      };

      const response = await flashcardService.getFlashcards(filters);
      setFlashcards(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setError('Erro ao carregar flashcards. Tente novamente.');
      toast.error('Erro ao carregar flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsResponse = await flashcardService.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category); // Já resetará a subcategoria automaticamente
  };

  // Filtering is now done by API, so we use flashcards directly
  const filteredCards = flashcards;

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      easy: { label: 'FÁCIL', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      medium: { label: 'MÉDIO', color: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200' },
      hard: { label: 'DIFÍCIL', color: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900' }
    };
    
    const diffConfig = config[difficulty as keyof typeof config];
    return (
      <Badge className={`${diffConfig.color} font-police-body font-semibold uppercase tracking-wider`}>
        {diffConfig.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      basic: { label: 'BÁSICO', icon: BookOpen },
      basic_reversed: { label: 'INVERTIDO', icon: BookOpen },
      multiple_choice: { label: 'MÚLTIPLA', icon: Target },
      true_false: { label: 'V/F', icon: CheckCircle },
      cloze: { label: 'LACUNAS', icon: Edit },
      type_answer: { label: 'DIGITE', icon: Edit },
      image_occlusion: { label: 'IMAGEM', icon: Eye }
    };
    
    const typeConfig = config[type as keyof typeof config];
    const Icon = typeConfig.icon;
    
    return (
      <Badge variant="outline" className="font-police-body font-semibold uppercase tracking-wider border-gray-300 dark:border-gray-600">
        <Icon className="w-3 h-3 mr-1" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'RASCUNHO', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      published: { label: 'PUBLICADO', color: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' },
      archived: { label: 'ARQUIVADO', color: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    return (
      <Badge className={`${statusConfig.color} font-police-body font-semibold uppercase tracking-wider`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const handleCreateCard = () => {
    navigate('/admin/flashcards/cards/new');
  };

  const handleEditCard = async (cardId: string) => {
    navigate(`/admin/flashcards/cards/${cardId}/edit`);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Tem certeza que deseja excluir este flashcard?')) {
      try {
        await flashcardService.deleteFlashcard(cardId);
        toast.success('Flashcard excluído com sucesso', {
          duration: 3000,
          icon: '✅'
        });
        loadFlashcards();
      } catch (error) {
        toast.error('Erro ao excluir flashcard');
      }
    }
  };

  const handleDuplicateCard = async (cardId: string) => {
    const originalCard = flashcards.find(c => c.id === cardId);
    if (originalCard) {
      try {
        const duplicatedData = {
          ...originalCard,
          front: originalCard.front ? `${originalCard.front} (CÓPIA)` : originalCard.front,
          question: originalCard.question ? `${originalCard.question} (CÓPIA)` : originalCard.question,
          statement: originalCard.statement ? `${originalCard.statement} (CÓPIA)` : originalCard.statement,
          status: 'draft' as const
        };
        
        // Remove id and audit fields
        const { id, author_id, author_name, created_at, updated_at, times_studied, times_correct, correct_rate, ease_factor, interval, next_review, ...createData } = duplicatedData;
        
        await flashcardService.createFlashcard(createData as any);
        toast.success(`Flashcard duplicado com sucesso`, {
          duration: 3000,
          icon: '📋'
        });
        loadFlashcards();
      } catch (error) {
        toast.error('Erro ao duplicar flashcard');
      }
    }
  };

  const handleStudyCard = (cardId: string) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      setStudyCards([card]);
      setShowStudyModal(true);
    }
  };

  const handlePreviewCard = (cardId: string) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      setSelectedCard(card);
      setShowPreviewModal(true);
    }
  };

  const handleStudyComplete = async (results: any) => {
    console.log('Study session completed:', results);
    toast.success(`Sessão concluída! ${results.correct}/${results.totalCards} acertos (${results.accuracy}%)`, {
      duration: 4000,
      icon: '🎯'
    });
    
    // Reload to update stats
    loadFlashcards();
    loadStats();
  };

  const handleBulkStudy = () => {
    if (selectedCards.length > 0) {
      const cardsToStudy = flashcards.filter(card => selectedCards.includes(card.id));
      setStudyCards(cardsToStudy);
      setShowStudyModal(true);
      setSelectedCards([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedCards.length > 0) {
      for (const cardId of selectedCards) {
        await handleDuplicateCard(cardId);
      }
      setSelectedCards([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedCards.length > 0 && confirm(`Tem certeza que deseja arquivar ${selectedCards.length} flashcards?`)) {
      try {
        for (const cardId of selectedCards) {
          const card = flashcards.find(c => c.id === cardId);
          if (card) {
            await flashcardService.updateFlashcard(cardId, { status: 'archived' });
          }
        }
        toast.success(`${selectedCards.length} flashcards arquivados com sucesso`, {
          duration: 3000,
          icon: '📦'
        });
        setSelectedCards([]);
        setShowBulkActions(false);
        loadFlashcards();
      } catch (error) {
        toast.error('Erro ao arquivar flashcards');
      }
    }
  };

  const handleSelectCard = (id: string) => {
    setSelectedCards(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCards(
      selectedCards.length === filteredCards.length 
        ? [] 
        : filteredCards.map(c => c.id)
    );
  };

  const getCardPreview = (card: Flashcard) => {
    switch (card.type) {
      case 'basic':
      case 'basic_reversed':
        return card.front || '';
      case 'multiple_choice':
        return card.question || '';
      case 'true_false':
        return card.statement || '';
      case 'cloze':
        return card.text?.replace(/{{c\d+::(.*?)}}/g, '[$1]') || '';
      case 'type_answer':
        return card.question || '';
      case 'image_occlusion':
        return `Imagem com ${card.occlusionAreas?.length || 0} áreas de oclusão`;
      default:
        return 'Flashcard não definido';
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
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              ARSENAL INTEL INDIVIDUAL
            </h1>
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => navigate('/admin/flashcards')}
                className="px-3 py-1.5 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-police-body font-semibold uppercase tracking-wider text-sm transition-colors"
              >
                DECKS
              </button>
              <button
                className="px-3 py-1.5 rounded bg-accent-500 text-black font-police-body font-semibold uppercase tracking-wider text-sm transition-colors"
              >
                INDIVIDUAIS
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            COMANDO DE INTELIGÊNCIA - CARTÕES TÁTICOS AVANÇADOS PARA OPERAÇÕES
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent-500 text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Visualização em Grade"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-500 text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <Button 
            onClick={handleCreateCard} 
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            NOVO INTEL
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
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ARSENAL TOTAL
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  INTEL OPERACIONAL
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.published || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  OPERAÇÕES REALIZADAS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.totalStudies || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  PRECISÃO TÁTICA
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {Math.round(stats?.avgCorrectRate || 0)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ position: 'relative', zIndex: 2000 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative overflow-visible">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-6">
            {/* Filter Header with Active Count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  FILTROS AVANÇADOS
                </h3>
                {/* Active filters indicator */}
                {(searchTerm || selectedCategory !== 'Todos' || selectedSubcategory !== 'Todas' || selectedType !== 'Todos' || selectedDifficulty !== 'Todos' || selectedStatus !== 'Todos' || selectedAuthor !== 'Todos') && (
                  <Badge className="bg-accent-500/20 text-accent-600 dark:text-accent-400 border border-accent-500/30 font-police-body">
                    {[
                      searchTerm && 1,
                      selectedCategory !== 'Todos' && 1,
                      selectedSubcategory !== 'Todas' && 1,
                      selectedType !== 'Todos' && 1,
                      selectedDifficulty !== 'Todos' && 1,
                      selectedStatus !== 'Todos' && 1,
                      selectedAuthor !== 'Todos' && 1
                    ].filter(Boolean).reduce((a, b) => a + b, 0)} ATIVOS
                  </Badge>
                )}
              </div>
              {(searchTerm || selectedCategory !== 'Todos' || selectedSubcategory !== 'Todas' || selectedType !== 'Todos' || selectedDifficulty !== 'Todos' || selectedStatus !== 'Todos' || selectedAuthor !== 'Todos') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todos');
                    setSelectedSubcategory('Todas');
                    setSelectedType('Todos');
                    setSelectedDifficulty('Todos');
                    setSelectedStatus('Todos');
                    setSelectedAuthor('Todos');
                  }}
                  className="gap-2 text-gray-600 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 font-police-body uppercase tracking-wider text-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  LIMPAR FILTROS
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2 group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="BUSCAR NO ARSENAL INTEL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 relative" style={{ zIndex: 100 }}>
                {/* Categoria com CategorySelector */}
                <div className={`relative ${selectedCategory !== 'Todos' ? 'ring-2 ring-accent-500/30 rounded-lg' : ''}`} style={{ zIndex: 1000 }}>
                  <CategorySelector
                    categories={categories}
                    selectedValue={selectedCategory}
                    onChange={(value) => {
                      handleCategoryChange(value);
                    }}
                    disabled={isLoadingCategories}
                    isLoading={isLoadingCategories}
                    placeholder="TODAS AS CATEGORIAS"
                    label="CATEGORIA"
                    showAll={true}
                  />
                </div>


                <div className={`relative ${selectedType !== 'Todos' ? 'ring-2 ring-accent-500/30 rounded-lg' : ''}`}>
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Tipo
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="Todos">TODOS OS TIPOS</option>
                    {cardTypes.slice(1).map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`relative ${selectedDifficulty !== 'Todos' ? 'ring-2 ring-accent-500/30 rounded-lg' : ''}`}>
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Dificuldade
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'Todos' ? 'TODAS AS DIFICULDADES' : 
                         difficulty === 'easy' ? '🟢 FÁCIL' :
                         difficulty === 'medium' ? '🟡 MÉDIO' : 
                         difficulty === 'hard' ? '🔴 DIFÍCIL' : 
                         difficulty.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`relative ${selectedStatus !== 'Todos' ? 'ring-2 ring-accent-500/30 rounded-lg' : ''}`}>
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'Todos' ? 'TODOS OS STATUS' : 
                         status === 'published' ? '✅ PUBLICADO' :
                         status === 'draft' ? '📝 RASCUNHO' :
                         status === 'archived' ? '📦 ARQUIVADO' :
                         status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`relative ${selectedAuthor !== 'Todos' ? 'ring-2 ring-accent-500/30 rounded-lg' : ''}`}>
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Autor
                  </label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="Todos">TODOS OS AUTORES</option>
                    {availableAuthors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* Cards Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {filteredCards.map((card) => 
          viewMode === 'grid' ? (
            <Card key={card.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(card.type)}
                      {getDifficultyBadge(card.difficulty)}
                      {getStatusBadge(card.status)}
                    </div>
                    <p className="text-sm text-white font-police-body font-medium line-clamp-3">
                      {getCardPreview(card)}
                    </p>
                  </div>
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedCards.includes(card.id)}
                      onChange={() => handleSelectCard(card.id)}
                      className="ml-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Category */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {card.category}
                  </Badge>
                  {card.subcategory && (
                    <Badge variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                      {card.subcategory}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      OPERAÇÕES
                    </p>
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {card.times_studied}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ALVOS
                    </p>
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {card.times_correct}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      PRECISÃO
                    </p>
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {Math.round(card.correct_rate || 0)}%
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {card.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {card.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                      +{card.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                    <p className="uppercase tracking-wider">{card.author_name}</p>
                    {card.next_review && (
                      <p className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(card.next_review).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePreviewCard(card.id)}
                      className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStudyCard(card.id)}
                      className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                      title="Estudar"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditCard(card.id)}
                      className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateCard(card.id)}
                      className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Arquivar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* List View */
            <Card key={card.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
              {/* Corner accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {showBulkActions && (
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleSelectCard(card.id)}
                        className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeBadge(card.type)}
                              {getDifficultyBadge(card.difficulty)}
                              {getStatusBadge(card.status)}
                            </div>
                            <p className="text-sm text-white font-police-body font-medium">
                              {getCardPreview(card)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {card.category}
                            </Badge>
                            {card.subcategory && (
                              <Badge variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                {card.subcategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className="flex items-center gap-6">
                            {/* Stats */}
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                OPERAÇÕES
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {card.reviews}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                ALVOS
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {card.correctCount}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                PRECISÃO
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {card.reviews > 0 ? Math.round((card.correctCount / card.reviews) * 100) : 0}%
                              </p>
                            </div>
                            
                            {/* Next Review */}
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                PRÓXIMA MISSÃO
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-police-numbers text-gray-900 dark:text-white">
                                  {new Date(card.nextReview).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Author, Tags and Actions */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                            <span className="uppercase tracking-wider">{card.author_name}</span>
                            {card.next_review && (
                              <span className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(card.next_review).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {card.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {card.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                +{card.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewCard(card.id)}
                            className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            ANALISAR
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleStudyCard(card.id)}
                            className="gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            EXECUTAR
                          </Button>
                          
                          <button
                            onClick={() => handleEditCard(card.id)}
                            className="p-2 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* More Actions Dropdown */}
                          <div className="relative group">
                            <button className="p-2 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => handleDuplicateCard(card.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-police-body uppercase tracking-wider flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                REPLICAR
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-police-body uppercase tracking-wider flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                DESARMAR
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            NENHUM INTEL LOCALIZADO
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-police-body mb-6">
            Crie sua primeira peça de inteligência tática
          </p>
          <Button 
            onClick={handleCreateCard}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            CRIAR INTEL
          </Button>
        </motion.div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {showPreviewModal && selectedCard && (
          <FlashcardPreviewModal
            card={selectedCard}
            onClose={() => {
              setShowPreviewModal(false);
              setSelectedCard(null);
            }}
            onEdit={(cardId) => {
              setShowPreviewModal(false);
              setSelectedCard(null);
              handleEditCard(cardId);
            }}
            onDuplicate={(cardId) => {
              setShowPreviewModal(false);
              setSelectedCard(null);
              handleDuplicateCard(cardId);
            }}
            onStudy={(cardId) => {
              setShowPreviewModal(false);
              setSelectedCard(null);
              handleStudyCard(cardId);
            }}
            onDelete={(cardId) => {
              setShowPreviewModal(false);
              setSelectedCard(null);
              handleDeleteCard(cardId);
            }}
          />
        )}
        
        {showStudyModal && studyCards.length > 0 && (
          <FlashcardStudyModal
            cards={studyCards}
            onClose={() => {
              setShowStudyModal(false);
              setStudyCards([]);
            }}
            onComplete={handleStudyComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}