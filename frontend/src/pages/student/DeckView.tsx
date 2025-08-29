import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Play,
  Package,
  Brain,
  Target,
  Shield,
  CheckCircle,
  Plus,
  Trash2,
  Eye,
  Layers,
  Hash,
  Calendar,
  Award,
  TrendingUp,
  RefreshCw,
  Zap,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { flashcardDeckService } from '@/services/flashcardDeckService';
import { flashcardService } from '@/services/flashcardService';
import toast from 'react-hot-toast';
import AnkiImportExport from '@/components/AnkiImportExport';

export default function DeckView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    studied: 0,
    mastered: 0,
    needReview: 0,
    averageAccuracy: 0
  });

  useEffect(() => {
    if (id) {
      loadDeck();
      loadDeckFlashcards();
    }
  }, [id]);

  const loadDeck = async () => {
    try {
      const result = await flashcardDeckService.getDeck(id!);
      if (result.success && result.data) {
        setDeck(result.data);
      } else {
        toast.error('Deck não encontrado');
        navigate('/student/flashcards');
      }
    } catch (error) {
      console.error('Erro ao carregar deck:', error);
      toast.error('Erro ao carregar deck');
      navigate('/student/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const loadDeckFlashcards = async () => {
    try {
      const result = await flashcardService.getFlashcardsByDeck(id!);
      if (result.success && result.data) {
        setFlashcards(result.data);
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    }
  };

  const calculateStats = (cards: any[]) => {
    const totalCards = cards.length;
    const studied = cards.filter(c => c.times_studied > 0).length;
    const mastered = cards.filter(c => c.correct_rate >= 80 && c.times_studied >= 5).length;
    const needReview = cards.filter(c => {
      if (!c.next_review) return false;
      const reviewDate = new Date(c.next_review);
      return reviewDate <= new Date();
    }).length;
    
    const totalAccuracy = cards.reduce((sum, card) => {
      return sum + (card.correct_rate || 0);
    }, 0);
    const averageAccuracy = totalCards > 0 ? totalAccuracy / totalCards : 0;

    setStats({
      totalCards,
      studied,
      mastered,
      needReview,
      averageAccuracy
    });
  };

  const handleStartStudy = () => {
    if (flashcards.length === 0) {
      toast.error('Este arsenal não possui flashcards');
      return;
    }
    navigate(`/student/decks/${id}/study`);
  };

  const handleAddFlashcards = () => {
    navigate(`/student/flashcards/new?deck=${id}`);
  };

  const handleEditDeck = () => {
    navigate(`/student/decks/${id}/edit`);
  };

  const handleDeleteDeck = async () => {
    if (!id) return;
    
    // Confirmar exclusão
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o arsenal "${deck?.name}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await flashcardDeckService.deleteDeck(id);
      toast.success('Arsenal deletado com sucesso!');
      navigate('/my-flashcards'); // Voltar para a lista de decks
    } catch (error) {
      console.error('Erro ao deletar deck:', error);
      toast.error('Erro ao deletar o arsenal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 animate-pulse text-accent-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
            Carregando arsenal...
          </p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 border-b-4 border-accent-500"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/student/flashcards')}
                className="gap-2 text-white hover:text-accent-500 font-police-body uppercase tracking-wider"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
              
              <div className="border-l-4 border-accent-500 pl-4">
                <h1 className="text-3xl font-police-title font-bold uppercase tracking-wider text-white">
                  {deck.name}
                </h1>
                <p className="text-gray-300 font-police-subtitle mt-1">
                  {deck.description || 'Arsenal Tático'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStartStudy}
                className="gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
              >
                <Play className="w-5 h-5" />
                ESTUDAR ARSENAL
              </Button>
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="gap-2 text-white border-white/20 hover:bg-white/10 font-police-body uppercase tracking-wider"
              >
                <Upload className="w-5 h-5" />
                IMPORTAR
              </Button>
              <Button
                onClick={handleEditDeck}
                variant="outline"
                className="gap-2 text-white border-white/20 hover:bg-white/10 font-police-body uppercase tracking-wider"
              >
                <Edit className="w-5 h-5" />
                EDITAR
              </Button>
              <Button
                onClick={handleDeleteDeck}
                variant="outline"
                className="gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-400 font-police-body uppercase tracking-wider"
              >
                <Trash2 className="w-5 h-5" />
                DELETAR
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Total Cards
                    </p>
                    <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                      {stats.totalCards}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Estudados
                    </p>
                    <p className="text-2xl font-police-numbers font-bold text-blue-600">
                      {stats.studied}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Dominados
                    </p>
                    <p className="text-2xl font-police-numbers font-bold text-green-600">
                      {stats.mastered}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Revisar
                    </p>
                    <p className="text-2xl font-police-numbers font-bold text-orange-600">
                      {stats.needReview}
                    </p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-police-subtitle text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Precisão
                    </p>
                    <p className="text-2xl font-police-numbers font-bold text-purple-600">
                      {stats.averageAccuracy.toFixed(0)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Flashcards List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-3">
                  <Layers className="w-6 h-6 text-accent-500" />
                  FLASHCARDS DO ARSENAL ({flashcards.length})
                </CardTitle>
                <Button
                  onClick={handleAddFlashcards}
                  size="sm"
                  className="gap-2 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  ADICIONAR
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {flashcards.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider mb-4">
                    ARSENAL VAZIO
                  </p>
                  <Button
                    onClick={handleAddFlashcards}
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ADICIONAR PRIMEIRO FLASHCARD
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {flashcards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-accent-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-police-body">
                              {card.type}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={`font-police-body ${
                                card.difficulty === 'easy' ? 'text-green-600 border-green-600' :
                                card.difficulty === 'medium' ? 'text-yellow-600 border-yellow-600' :
                                'text-red-600 border-red-600'
                              }`}
                            >
                              {card.difficulty}
                            </Badge>
                            {card.times_studied > 0 && (
                              <Badge variant="outline" className="font-police-body">
                                📊 {card.correct_rate}% precisão
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-900 dark:text-white font-police-body">
                            {card.front || card.question || card.statement || card.text || 'Flashcard'}
                          </p>
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {card.tags.map((tag: string, idx: number) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-police-body uppercase"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {card.times_studied > 0 && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-police-subtitle uppercase">
                                Estudado
                              </p>
                              <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                                {card.times_studied}x
                              </p>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-police-title tracking-wider text-gray-900 dark:text-white">
                  IMPORTAR FLASHCARDS PARA O ARSENAL
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <AnkiImportExport
                flashcards={flashcards}
                deckName={deck?.name || "Arsenal"}
                onImport={async (imported) => {
                  try {
                    // Salvar os flashcards importados no backend
                    const savedCards = [];
                    for (const card of imported) {
                      const savedCard = await flashcardService.createFlashcard(card);
                      savedCards.push(savedCard);
                    }
                    
                    // Adicionar os IDs dos novos flashcards ao deck
                    if (deck && id) {
                      const updatedDeck = {
                        ...deck,
                        flashcard_ids: [
                          ...(deck.flashcard_ids || []),
                          ...savedCards.map(c => c.id)
                        ]
                      };
                      await flashcardDeckService.updateDeck(id, updatedDeck);
                      setDeck(updatedDeck);
                    }
                    
                    // Recarregar os flashcards do deck
                    loadDeckFlashcards();
                    
                    toast.success(`${imported.length} flashcards importados com sucesso!`);
                    setShowImportModal(false);
                  } catch (error) {
                    console.error('Erro ao importar flashcards:', error);
                    toast.error('Erro ao importar flashcards');
                  }
                }}
                showExport={false}
                showImport={true}
                saveToBackend={false}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}