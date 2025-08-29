import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Brain,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  Grid,
  List,
  Package,
  Target,
  ChevronRight,
  Folder,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { flashcardService, Flashcard, FlashcardFilters } from '@/services/flashcardService';
import { flashcardDeckService, FlashcardDeck } from '@/services/flashcardDeckService';
import FlashcardPreviewModal from '@/components/FlashcardPreviewModal';
import FlashcardStudyModal from '@/components/FlashcardStudyModal';
import AnkiImportExport from '@/components/AnkiImportExport';
import toast from 'react-hot-toast';

export default function MyFlashcards() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'cards' | 'decks' | 'import'>('cards');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [myDecks, setMyDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FlashcardFilters>({
    author_id: user?.id,
    page: 1,
    limit: 100 // Aumentar para mostrar mais flashcards por página
  });
  
  // Modals
  const [previewCard, setPreviewCard] = useState<Flashcard | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{deckId: string, deckName: string} | null>(null);
  const [deleteFlashcardConfirm, setDeleteFlashcardConfirm] = useState<{id: string, front: string} | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalCards: 0,
    totalDecks: 0,
    studiedToday: 0,
    dueForReview: 0,
    masteryRate: 0
  });

  // Carregar contagem total de flashcards via stats API
  const updateTotalStats = async () => {
    try {
      const statsResponse = await flashcardService.getStats({ author_id: user?.id });
      
      if (statsResponse.success && statsResponse.data) {
        // Converter strings para números
        const totalCards = parseInt(statsResponse.data.total) || 0;
        
        setStats(prev => ({ 
          ...prev, 
          totalCards,
          studiedToday: 0, // Por enquanto 0, pode ser implementado depois
          dueForReview: parseInt(statsResponse.data.published) || 0,
          masteryRate: parseFloat(statsResponse.data.avg_correct_rate) || 0
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar stats:', error);
    }
  };

  // Carregar flashcards do usuário
  const loadMyFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcards({
        ...filters,
        author_id: user?.id
      });
      
      if (response.success) {
        setFlashcards(response.data);
        // Sempre atualizar total após carregar
        await updateTotalStats();
      }
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
      toast.error('Erro ao carregar seus flashcards');
    } finally {
      setLoading(false);
    }
  };

  // Carregar decks do usuário
  const loadMyDecks = async () => {
    try {
      // Passar user.id como string para garantir consistência
      const userIdString = user?.id?.toString() || '';
      const decks = await flashcardDeckService.getUserDecks(userIdString);
      setMyDecks(decks);
      setStats(prev => ({ ...prev, totalDecks: decks.length }));
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    }
  };

  // Excluir flashcard - abrir modal
  const handleDeleteFlashcard = async (id: string) => {
    const flashcard = flashcards.find(f => f.id === id);
    if (flashcard) {
      const frontText = flashcard.front || flashcard.text || flashcard.question || 'este flashcard';
      setDeleteFlashcardConfirm({ 
        id, 
        front: frontText.length > 100 ? frontText.substring(0, 100) + '...' : frontText 
      });
    }
  };

  // Confirmar exclusão de flashcard
  const confirmDeleteFlashcard = async () => {
    if (!deleteFlashcardConfirm) return;
    
    try {
      await flashcardService.deleteFlashcard(deleteFlashcardConfirm.id);
      toast.success('Flashcard excluído com sucesso');
      
      // Atualizar lista imediatamente
      setFlashcards(prev => prev.filter(f => f.id !== deleteFlashcardConfirm.id));
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalCards: Math.max(0, prev.totalCards - 1)
      }));
      
      setDeleteFlashcardConfirm(null);
    } catch (error) {
      toast.error('Erro ao excluir flashcard');
    }
  };

  // Excluir deck
  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    setDeleteConfirm({ deckId, deckName });
  };

  // Confirmar exclusão
  const confirmDeleteDeck = async () => {
    if (!deleteConfirm) return;
    
    try {
      await flashcardDeckService.deleteDeck(deleteConfirm.deckId);
      toast.success('Arsenal deletado com sucesso!');
      
      // Atualizar a lista de decks imediatamente
      setMyDecks(prevDecks => prevDecks.filter(deck => deck.id !== deleteConfirm.deckId));
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalDecks: prev.totalDecks - 1
      }));
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao deletar deck:', error);
      toast.error('Erro ao deletar o arsenal');
    }
  };

  // Alternar visibilidade
  const handleToggleVisibility = async (flashcard: Flashcard) => {
    try {
      const newStatus = flashcard.status === 'published' ? 'draft' : 'published';
      await flashcardService.updateFlashcard(flashcard.id, { status: newStatus });
      toast.success(`Flashcard ${newStatus === 'published' ? 'publicado' : 'ocultado'}`);
      loadMyFlashcards();
    } catch (error) {
      toast.error('Erro ao atualizar visibilidade');
    }
  };

  // Estudar flashcards selecionados
  const startStudySession = (cards: Flashcard[]) => {
    if (cards.length === 0) {
      toast.error('Selecione flashcards para estudar');
      return;
    }
    setStudyCards(cards);
    setShowStudyModal(true);
  };

  useEffect(() => {
    loadMyFlashcards();
    loadMyDecks();
  }, [filters.page, user?.id]);

  return (
    <div className="p-6 space-y-6">
      {/* Header Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white mb-2">
              MEU ARSENAL PESSOAL
            </h1>
            <p className="text-gray-300 font-police-subtitle uppercase tracking-wider">
              OPERADOR: {user?.name} | CLEARANCE: ESTUDANTE
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/student/flashcards/new')}
              className="gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
            >
              <Plus className="w-5 h-5" />
              CRIAR FLASHCARD
            </Button>
            <Button
              onClick={() => navigate('/student/decks/new')}
              variant="outline"
              className="gap-2 text-white border-white/20 hover:bg-white/10 font-police-subtitle uppercase tracking-wider"
            >
              <Package className="w-5 h-5" />
              CRIAR DECK
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 uppercase">Total Cards</p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.totalCards}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 uppercase">Meus Decks</p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.totalDecks}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 uppercase">Estudados Hoje</p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.studiedToday}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 uppercase">Para Revisar</p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.dueForReview}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-police-body text-gray-500 dark:text-gray-400 uppercase">Taxa Domínio</p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {stats.masteryRate}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'cards' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('cards')}
                className="font-police-subtitle uppercase tracking-wider"
              >
                <Brain className="w-4 h-4 mr-2" />
                MEUS FLASHCARDS
              </Button>
              <Button
                variant={activeTab === 'decks' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('decks')}
                className="font-police-subtitle uppercase tracking-wider"
              >
                <Package className="w-4 h-4 mr-2" />
                MEUS DECKS
              </Button>
              <Button
                variant={activeTab === 'import' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('import')}
                className="font-police-subtitle uppercase tracking-wider"
              >
                <Upload className="w-4 h-4 mr-2" />
                IMPORTAR/EXPORTAR
              </Button>
            </div>
            
            {activeTab === 'cards' && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Tab: Meus Flashcards */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar flashcards..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
                >
                  <option value="">Todas dificuldades</option>
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="">Todos status</option>
                  <option value="published">Público</option>
                  <option value="draft">Privado</option>
                  <option value="archived">Arquivado</option>
                </select>
                
                <Button
                  onClick={loadMyFlashcards}
                  variant="outline"
                  className="font-police-body uppercase tracking-wider"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  APLICAR
                </Button>
              </div>
              
              {/* Lista de Flashcards */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                    Carregando arsenal...
                  </p>
                </div>
              ) : flashcards.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Nenhum flashcard criado
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-police-body mb-6">
                    Comece criando seu primeiro flashcard
                  </p>
                  <Button
                    onClick={() => navigate('/student/flashcards/new')}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    CRIAR PRIMEIRO FLASHCARD
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {flashcards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={
                          card.difficulty === 'easy' ? 'success' : 
                          card.difficulty === 'hard' ? 'destructive' : 'warning'
                        }>
                          {card.difficulty}
                        </Badge>
                        <div className="flex gap-1">
                          {card.status === 'published' ? (
                            <Globe className="w-4 h-4 text-green-500" title="Público" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" title="Privado" />
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {card.front || card.question || 'Sem título'}
                      </h4>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-3 line-clamp-2">
                        {card.back || card.answer || 'Sem resposta'}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-500 font-police-body">
                          {card.category}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewCard(card)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/student/flashcards/${card.id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleVisibility(card)}
                          className="flex-1"
                        >
                          {card.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFlashcard(card.id)}
                          className="flex-1 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {flashcards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={
                            card.difficulty === 'easy' ? 'success' : 
                            card.difficulty === 'hard' ? 'destructive' : 'warning'
                          }>
                            {card.difficulty}
                          </Badge>
                          <Badge variant="outline">{card.type}</Badge>
                          {card.status === 'published' ? (
                            <Globe className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-1">
                          {card.front || card.question || 'Sem título'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          {card.category} • Criado em {new Date(card.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewCard(card)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/student/flashcards/${card.id}/edit`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteFlashcard(card.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Ações em lote */}
              {flashcards.length > 0 && (
                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    onClick={() => startStudySession(flashcards)}
                    className="bg-green-600 hover:bg-green-700 text-white font-police-subtitle uppercase tracking-wider"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    ESTUDAR TODOS ({flashcards.length})
                  </Button>
                </div>
              )}

              {/* Paginação */}
              {stats.totalCards > filters.limit && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                    Mostrando {flashcards.length} de {stats.totalCards} flashcards
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="font-police-body"
                    >
                      Anterior
                    </Button>
                    <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 font-police-numbers">
                      Página {filters.page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={flashcards.length < filters.limit}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="font-police-body"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Tab: Meus Decks */}
          {activeTab === 'decks' && (
            <div className="space-y-4">
              {myDecks.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Nenhum deck criado
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-police-body mb-6">
                    Organize seus flashcards em decks temáticos
                  </p>
                  <Button
                    onClick={() => navigate('/student/decks/new')}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    CRIAR PRIMEIRO DECK
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => navigate('/student/decks/new')}
                      className="bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      CRIAR NOVO DECK
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myDecks.map((deck) => (
                    <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Package className="w-8 h-8 text-accent-500" />
                          <Badge variant="outline">
                            {deck.flashcard_ids.length} cards
                          </Badge>
                        </div>
                        
                        <h3 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2">
                          {deck.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-4">
                          {deck.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4">
                          <span className="font-police-body">{deck.subject}</span>
                          <span className="font-police-numbers">
                            {new Date(deck.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/student/decks/${deck.id}`)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/student/decks/${deck.id}/edit`)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDeck(deck.id, deck.name)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Tab: Importar/Exportar */}
          {activeTab === 'import' && (
            <AnkiImportExport
              flashcards={flashcards}
              deckName="Meus Flashcards"
              saveToBackend={true}
              onImport={async (importedCards) => {
                // Cards já foram salvos no backend pelo componente
                // Recarregar a lista e atualizar stats
                await Promise.all([
                  loadMyFlashcards(),
                  loadMyDecks() // Atualizar decks também caso tenha sido criado
                ]);
                toast.success('Flashcards e estatísticas atualizados!');
              }}
              onExport={() => {
                toast.success('Flashcards exportados com sucesso!');
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewCard && (
        <FlashcardPreviewModal
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onEdit={() => navigate(`/student/flashcards/${previewCard.id}/edit`)}
          onStudy={() => startStudySession([previewCard])}
        />
      )}
      
      {/* Study Modal */}
      {showStudyModal && studyCards.length > 0 && (
        <FlashcardStudyModal
          cards={studyCards}
          onClose={() => {
            setShowStudyModal(false);
            setStudyCards([]);
            loadMyFlashcards(); // Recarregar para atualizar estatísticas
          }}
        />
      )}

      {/* Delete Deck Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white">
                CONFIRMAR EXCLUSÃO DE ARSENAL
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 font-police-body">
              Tem certeza que deseja deletar o arsenal <strong>"{deleteConfirm.deckName}"</strong>?
              <br />
              <span className="text-sm text-red-500 mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
                className="font-police-body"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteDeck}
                className="bg-red-500 hover:bg-red-600 text-white font-police-body"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Arsenal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Flashcard Confirmation Modal */}
      {deleteFlashcardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-police-title font-bold text-gray-900 dark:text-white">
                CONFIRMAR EXCLUSÃO DE FLASHCARD
              </h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-police-body break-words">
                {deleteFlashcardConfirm.front}
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 font-police-body">
              Tem certeza que deseja excluir este flashcard?
              <br />
              <span className="text-sm text-yellow-600 dark:text-yellow-500 mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteFlashcardConfirm(null)}
                className="font-police-body"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteFlashcard}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-police-body"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Flashcard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}