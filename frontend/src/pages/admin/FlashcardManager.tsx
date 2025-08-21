import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { flashcardService, Flashcard, FlashcardStats } from '@/services/flashcardService';
import { flashcardDeckService, FlashcardDeck } from '@/services/flashcardDeckService';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import { CategorySelector } from '@/components/CategorySelector';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  Crosshair,
  Target,
  Shield,
  BookOpen,
  Users,
  Calendar,
  Tag,
  Lock,
  Globe,
  Star,
  Grid3X3,
  List,
  Settings,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Interface estendida para adicionar propriedades de exibição
interface FlashcardDisplay extends Flashcard {
  title: string;
  description: string;
  completedCards?: number;
  totalCards?: number;
  reviews?: number;
  rating?: number;
  isPublic?: boolean;
  author?: string;
  lastReview?: string;
}

export default function FlashcardManager() {
  const navigate = useNavigate();
  
  // Hook dinâmico para categorias
  const {
    categories,
    subcategories,
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
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State para dados da API
  const [flashcards, setFlashcards] = useState<FlashcardDisplay[]>([]);
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State para modal de preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDeckForPreview, setSelectedDeckForPreview] = useState<any>(null);

  const loadDecks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading decks with filters:', {
        search: searchTerm,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        showPublicOnly
      });
      
      // Carregar decks da API
      const response = await flashcardDeckService.getDecks({
        search: searchTerm || undefined,
        category: selectedCategory !== 'Todos' ? selectedCategory : undefined
      });
      
      console.log('Decks API Response:', response);
      console.log('Data received:', response.decks?.length || 0, 'decks');
      
      // Mapear os decks para o formato de exibição
      const mappedDecks: FlashcardDisplay[] = (response.decks || []).map(deck => ({
        id: deck.id,
        title: deck.name,
        description: deck.description || 'Sem descrição',
        category: deck.category,
        subcategory: '',
        difficulty: 'medium' as any,
        completedCards: 0,
        totalCards: Array.isArray(deck.flashcard_ids) ? deck.flashcard_ids.length : 0,
        reviews: 0,
        rating: '0',
        isPublic: deck.is_public || false,
        author: 'Admin',
        lastReview: deck.updated_at || deck.created_at,
        status: 'published' as any,
        type: 'basic' as any,
        tags: [],
        front: deck.name,
        back: deck.description,
        times_studied: 0,
        times_correct: 0,
        correct_rate: 0,
        created_at: deck.created_at,
        updated_at: deck.updated_at
      }));
      
      setFlashcards(mappedDecks);
    } catch (err: any) {
      console.error('Erro ao carregar decks:', err);
      setError('Erro ao carregar decks');
      toast.error('Erro ao carregar decks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await flashcardService.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadDecks();
  }, [searchTerm, selectedCategory, selectedDifficulty, showPublicOnly]);

  const filteredDecks = flashcards;

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

  const getCompletionPercentage = (completed: number | undefined, total: number | undefined) => {
    if (!total || total === 0) return 0;
    if (!completed) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleCreateDeck = () => {
    navigate('/admin/flashcards/new');
  };

  const handleEditDeck = (deckId: string) => {
    navigate(`/admin/flashcards/${deckId}/edit`);
  };

  const handleManageCards = (deckId: string) => {
    navigate(`/admin/flashcards/${deckId}/cards`);
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm('Tem certeza que deseja excluir este deck?')) {
      try {
        await flashcardDeckService.deleteDeck(deckId);
        toast.success('Deck excluído com sucesso', {
          duration: 3000,
          icon: '🗑️'
        });
        loadDecks();
      } catch (err: any) {
        console.error('Erro ao excluir deck:', err);
        toast.error('Erro ao excluir deck');
      }
    }
  };

  const handlePreviewDeck = async (deckId: string) => {
    try {
      const response = await flashcardDeckService.getDeck(deckId);
      if (response.success) {
        setSelectedDeckForPreview(response.data);
        setPreviewModalOpen(true);
      }
    } catch (err: any) {
      console.error('Erro ao carregar preview do deck:', err);
      toast.error('Erro ao abrir preview do deck');
    }
  };


  const handleDuplicateDeck = async (deckId: string) => {
    try {
      const response = await flashcardDeckService.getDeck(deckId);
      if (response.success) {
        const originalDeck = response.data;
        const duplicatedDeck = {
          name: `${originalDeck.name} (Cópia)`,
          description: originalDeck.description,
          category: originalDeck.category,
          flashcard_ids: [...originalDeck.flashcard_ids],
          is_public: false
        };
        
        const createResponse = await flashcardDeckService.createDeck(duplicatedDeck);
        if (createResponse.success) {
          toast.success(`Deck "${originalDeck.name}" duplicado com sucesso`, {
            duration: 3000,
            icon: '📋'
          });
          loadDecks();
        }
      }
    } catch (err: any) {
      console.error('Erro ao duplicar deck:', err);
      toast.error('Erro ao duplicar deck');
    }
  };

  const handleSelectDeck = (id: string) => {
    setSelectedDecks(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedDecks(
      selectedDecks.length === filteredDecks.length 
        ? [] 
        : filteredDecks.map(d => d.id)
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
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              GESTÃO DO ARSENAL INTEL
            </h1>
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                className="px-3 py-1.5 rounded bg-accent-500 text-black font-police-body font-semibold uppercase tracking-wider text-sm transition-colors"
              >
                DECKS
              </button>
              <button
                onClick={() => navigate('/admin/flashcards/cards')}
                className="px-3 py-1.5 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-police-body font-semibold uppercase tracking-wider text-sm transition-colors"
              >
                INDIVIDUAIS
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
            COMANDO TÁTICO - GESTÃO CENTRAL DO ARSENAL DE INTELIGÊNCIA
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
            onClick={() => navigate('/admin/flashcards/cards/new')}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            NOVO FLASHCARD
          </Button>
          
          <Button 
            onClick={handleCreateDeck}
            variant="outline" 
            className="gap-2 font-police-body font-semibold uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
          >
            <Target className="w-4 h-4" />
            NOVO DECK
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TOTAL DE DECKS
                </p>
                <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {flashcards.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  CARTÕES ATIVOS
                </p>
                <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.published || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TAXA DE CONCLUSÃO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.avgCorrectRate ? Math.round(stats.avgCorrectRate) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  REVISÕES TOTAIS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats?.totalStudies?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
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
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-visible relative">
          {/* Tactical stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
          <CardContent className="p-6 relative">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="BUSCAR DECKS POR NOME OU DESCRIÇÃO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative" style={{ zIndex: 100 }}>
                {/* Categoria - Mantendo como está */}
                <CategorySelector
                  categories={categories}
                  selectedValue={selectedCategory}
                  onChange={(value) => {
                    console.log('FlashcardManager - CategorySelector onChange:', value, typeof value);
                    setSelectedCategory(value);
                  }}
                  disabled={isLoadingCategories}
                  isLoading={isLoadingCategories}
                  placeholder="TODAS AS CATEGORIAS"
                  label="CATEGORIA"
                  showAll={true}
                />

                {/* Dificuldade */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Dificuldade
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Todos">TODAS AS DIFICULDADES</option>
                    <option value="easy">🟢 FÁCIL</option>
                    <option value="medium">🟡 MÉDIO</option>
                    <option value="hard">🔴 DIFÍCIL</option>
                  </select>
                </div>

                {/* Status Público/Privado */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-gray-800 text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider z-10">
                    Visibilidade
                  </label>
                  <select
                    value={showPublicOnly ? 'public' : 'all'}
                    onChange={(e) => setShowPublicOnly(e.target.value === 'public')}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">📊 TODOS OS DECKS</option>
                    <option value="public">🌐 APENAS PÚBLICOS</option>
                    <option value="private">🔒 APENAS PRIVADOS</option>
                  </select>
                </div>

                {/* Botão de Ações em Lote */}
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className={`gap-2 font-police-body uppercase tracking-wider border-2 transition-all ${
                    showBulkActions 
                      ? 'border-accent-500 bg-accent-500/10 text-accent-600 dark:text-accent-400' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500'
                  }`}
                >
                  {showBulkActions ? (
                    <>
                      <X className="w-4 h-4" />
                      FECHAR SELEÇÃO
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      AÇÕES EM LOTE
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDecks.length === filteredDecks.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                      <span className="text-sm font-police-body font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        SELECIONAR TODOS
                      </span>
                      {selectedDecks.length > 0 && (
                        <Badge className="bg-accent-500 text-black font-police-numbers">
                          {selectedDecks.length}/{filteredDecks.length}
                        </Badge>
                      )}
                    </label>
                    
                    <div className="flex items-center gap-3">
                      {selectedDecks.length > 0 && (
                        <span className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {selectedDecks.length} SELECIONADOS:
                        </span>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-police-body uppercase tracking-wider border-2 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                          disabled={selectedDecks.length === 0}
                        >
                          <Copy className="w-4 h-4" />
                          DUPLICAR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-police-body uppercase tracking-wider border-2 hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
                          disabled={selectedDecks.length === 0}
                        >
                          <Globe className="w-4 h-4" />
                          PUBLICAR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-police-body uppercase tracking-wider border-2 hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                          disabled={selectedDecks.length === 0}
                        >
                          <Trash2 className="w-4 h-4" />
                          EXCLUIR
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-12"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              Carregando flashcards...
            </p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            ERRO AO CARREGAR
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-police-body mb-6">
            {error}
          </p>
          <Button 
            onClick={loadDecks}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            TENTAR NOVAMENTE
          </Button>
        </motion.div>
      )}

      {/* Decks Grid/List */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}
        >
          {filteredDecks.map((deck) => 
          viewMode === 'grid' ? (
            <Card key={deck.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Tactical stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
              
              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider line-clamp-2 group-hover:text-accent-500 transition-colors">
                      {deck.title || 'Sem título'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mt-1 line-clamp-2">
                      {deck.description || 'Sem descrição'}
                    </p>
                  </div>
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedDecks.includes(deck.id)}
                      onChange={() => handleSelectDeck(deck.id)}
                      className="ml-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Badge className="font-police-body font-semibold uppercase tracking-wider bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/30">
                    {deck.category}
                  </Badge>
                  {deck.subcategory && (
                    <Badge variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                      {deck.subcategory}
                    </Badge>
                  )}
                  {getDifficultyBadge(deck.difficulty)}
                </div>
              </CardHeader>

            <CardContent className="space-y-4 p-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    PROGRESSO
                  </span>
                  <span className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                    {deck.completedCards || 0}/{deck.totalCards || 1} CARTÕES
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-accent-500 h-2 rounded-full transition-all" 
                    style={{ width: `${getCompletionPercentage(deck.completedCards, deck.totalCards)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-numbers">
                  {deck.totalCards ? getCompletionPercentage(deck.completedCards, deck.totalCards) : 0}% COMPLETO
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    REVISÕES
                  </p>
                  <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                    {deck.reviews || 0}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    AVALIAÇÃO
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-accent-500 fill-current" />
                    <span className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {deck.rating || '0'}
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    {deck.isPublic ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {(deck.tags || []).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                  <p className="uppercase tracking-wider">{deck.author || 'SISTEMA'}</p>
                  {deck.lastReview && (
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(deck.lastReview).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePreviewDeck(deck.id)}
                    className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                    title="Preview do Deck"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleManageCards(deck.id)}
                    className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                    title="Gerenciar Cartões"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditDeck(deck.id)}
                    className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                    title="Editar Deck"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateDeck(deck.id)}
                    className="p-2 text-gray-600 hover:text-accent-500 hover:bg-accent-500/10 dark:text-gray-400 dark:hover:text-accent-500 rounded-lg transition-all"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
            <Card key={deck.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Tactical stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {showBulkActions && (
                      <input
                        type="checkbox"
                        checked={selectedDecks.includes(deck.id)}
                        onChange={() => handleSelectDeck(deck.id)}
                        className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black p-3 rounded-lg mb-2">
                            <h3 className="text-lg font-police-subtitle font-bold text-white uppercase tracking-wider">
                              {deck.title || 'Sem título'}
                            </h3>
                            <p className="text-sm text-gray-300 font-police-body mt-1">
                              {deck.description || 'Sem descrição'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="font-police-body font-semibold uppercase tracking-wider bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {deck.category}
                            </Badge>
                            {deck.subcategory && (
                              <Badge variant="outline" className="font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                {deck.subcategory}
                              </Badge>
                            )}
                            {getDifficultyBadge(deck.difficulty)}
                          </div>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className="flex items-center gap-6">
                            {/* Progress */}
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                                PROGRESSO
                              </p>
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-accent-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${getCompletionPercentage(deck.completedCards, deck.totalCards)}%` }}
                                />
                              </div>
                              <p className="text-xs font-police-numbers text-gray-900 dark:text-white">
                                {getCompletionPercentage(deck.completedCards, deck.totalCards)}%
                              </p>
                            </div>
                            
                            {/* Stats */}
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                CARTÕES
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {deck.totalCards}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                REVISÕES
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {deck.reviews}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                AVALIAÇÃO
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-accent-500 fill-current" />
                                <span className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                  {deck.rating || '-'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status */}
                            <div className="text-center">
                              <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                STATUS
                              </p>
                              <div className="flex items-center justify-center mt-1">
                                {deck.isPublic ? (
                                  <Globe className="w-5 h-5 text-accent-500" title="Público" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-500" title="Privado" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Author and Date */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                            <span className="uppercase tracking-wider">{deck.author}</span>
                            {deck.lastReview && (
                              <span className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(deck.lastReview).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {(deck.tags || []).slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {deck.tags && deck.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                +{deck.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          
                          <button
                            onClick={() => handlePreviewDeck(deck.id)}
                            className="p-2 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Preview do Deck"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleManageCards(deck.id)}
                            className="p-2 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Gerenciar Cartões"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditDeck(deck.id)}
                            className="p-2 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                            title="Editar Deck"
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
                                onClick={() => handleDuplicateDeck(deck.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-police-body uppercase tracking-wider flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                DUPLICAR
                              </button>
                              <button
                                onClick={() => handleDeleteDeck(deck.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-police-body uppercase tracking-wider flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                ARQUIVAR
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
      {!loading && !error && filteredDecks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Crosshair className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
            NENHUM DECK ENCONTRADO
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-police-body mb-6">
            Crie seu primeiro deck de flashcards táticos
          </p>
          <Button 
            onClick={handleCreateDeck}
            className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            CRIAR DECK
          </Button>
        </motion.div>
      )}
      
      {/* Modal de Preview do Deck */}
      {previewModalOpen && selectedDeckForPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  PREVIEW DO DECK
                </h2>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">
                    {selectedDeckForPreview.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-police-body">
                    {selectedDeckForPreview.description || 'Sem descrição'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase">
                      CATEGORIA
                    </p>
                    <p className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                      {selectedDeckForPreview.category}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400 uppercase">
                      CARTÕES
                    </p>
                    <p className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                      {selectedDeckForPreview.flashcard_ids?.length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end mt-6">
                  <Button
                    onClick={() => {
                      setPreviewModalOpen(false);
                      handleManageCards(selectedDeckForPreview.id);
                    }}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    GERENCIAR CARTÕES
                  </Button>
                  <Button
                    onClick={() => {
                      setPreviewModalOpen(false);
                      handleEditDeck(selectedDeckForPreview.id);
                    }}
                    variant="outline"
                    className="font-police-body font-semibold uppercase tracking-wider"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    EDITAR DECK
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}