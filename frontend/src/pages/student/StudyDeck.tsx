import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Target,
  Brain,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Filter,
  MoreVertical,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Tag,
  RefreshCw,
  Clock,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import ImageOcclusionPreview from '@/components/ImageOcclusionPreview';
import { flashcardService, type Flashcard, type CreateFlashcardData } from '@/services/flashcardService';
import { flashcardDeckService } from '@/services/flashcardDeckService';
import { StudyProLogo } from '@/components/ui/StudyProLogo';

// Interface para o deck
interface DeckInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  totalCards: number;
  difficulty: string;
}

export default function StudyDeck() {
  const navigate = useNavigate();
  const { id, deckId } = useParams();
  const actualDeckId = id || deckId; // Suporta ambos os nomes de parâmetro
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deckInfo, setDeckInfo] = useState<DeckInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Estado para o modo de estudo
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [studyResults, setStudyResults] = useState<{ [key: string]: 'easy' | 'good' | 'hard' | 'again' }>({});
  const [startTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    totalAnswered: 0,
    easy: 0,
    good: 0,
    hard: 0,
    again: 0
  });
  
  const [showImageOcclusionEditor, setShowImageOcclusionEditor] = useState(false);
  
  // Carregar flashcards ao montar o componente
  useEffect(() => {
    loadDeckAndCards();
  }, [actualDeckId]);

  const loadDeckAndCards = async () => {
    if (!actualDeckId) {
      setError('ID do deck não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Carregar informações do deck real
      const deckResponse = await flashcardDeckService.getDeck(actualDeckId);
      if (!deckResponse.success) {
        throw new Error('Deck não encontrado');
      }
      
      const deck = deckResponse.data;
      const realDeckInfo: DeckInfo = {
        id: deck.id,
        title: deck.name,
        description: deck.description || '',
        category: deck.category,
        subcategory: '', // Pode adicionar se necessário
        totalCards: 0,
        difficulty: 'medium'
      };
      
      // Se o deck tem flashcard_ids específicos, carregar apenas esses
      if (deck.flashcard_ids && deck.flashcard_ids.length > 0) {
        // Carregar todos os flashcards e filtrar pelos IDs do deck
        const allCardsResponse = await flashcardService.getFlashcards({ limit: 1000 });
        if (allCardsResponse.success && allCardsResponse.data) {
          const deckCards = allCardsResponse.data.filter(card => 
            deck.flashcard_ids.includes(card.id)
          );
          setCards(deckCards);
          realDeckInfo.totalCards = deckCards.length;
        }
      } else {
        // Se não tem IDs específicos, filtrar por categoria
        const response = await flashcardService.getFlashcards({
          limit: 100,
          category: deck.category
        });
        
        if (response.success && response.data) {
          setCards(response.data);
          realDeckInfo.totalCards = response.data.length;
        } else {
          setCards([]);
        }
      }
      
      setDeckInfo(realDeckInfo);
    } catch (err) {
      console.error('Erro ao carregar deck e flashcards:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
      toast.error('Erro ao carregar flashcards', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  const [newCard, setNewCard] = useState({
    type: 'basic',
    front: '',
    back: '',
    difficulty: 'medium',
    tags: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    statement: '',
    answer: true,
    text: '',
    extra: '',
    hint: '',
    image: '',
    occlusionAreas: []
  });

  const cardTypes = [
    { value: 'basic', label: 'BÁSICO (FRENTE/VERSO)', description: 'Cartão tradicional com pergunta e resposta' },
    { value: 'basic_reversed', label: 'BÁSICO INVERTIDO', description: 'Gera automaticamente cartão inverso' },
    { value: 'cloze', label: 'LACUNAS (CLOZE)', description: 'Texto com lacunas para preencher' },
    { value: 'multiple_choice', label: 'MÚLTIPLA ESCOLHA', description: 'Questão com alternativas' },
    { value: 'true_false', label: 'VERDADEIRO/FALSO', description: 'Afirmação para avaliar' },
    { value: 'type_answer', label: 'DIGITE A RESPOSTA', description: 'Requer digitação da resposta' },
    { value: 'image_occlusion', label: 'OCLUSÃO DE IMAGEM', description: 'Imagem com áreas ocultas' }
  ];

  const filteredCards = cards.filter(card => {
    const searchContent = [
      card.front,
      card.back,
      card.question,
      card.statement,
      card.text,
      card.extra,
      ...(card.options || []),
      ...(card.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-200',
      hard: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL' };
    return labels[difficulty as keyof typeof labels];
  };

  const handleSaveNewCard = async () => {
    // Validação baseada no tipo de cartão
    if (newCard.type === 'basic' || newCard.type === 'basic_reversed') {
      if (!newCard.front.trim() || !newCard.back.trim()) {
        toast.error('Preencha frente e verso do cartão', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'cloze') {
      if (!newCard.text.trim()) {
        toast.error('Preencha o texto com lacunas', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'multiple_choice') {
      if (!newCard.question.trim() || newCard.options.some(o => !o.trim())) {
        toast.error('Preencha a pergunta e todas as alternativas', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'true_false') {
      if (!newCard.statement.trim()) {
        toast.error('Preencha a afirmação', { icon: '⚠️' });
        return;
      }
    } else if (newCard.type === 'type_answer') {
      if (!newCard.question.trim() || !newCard.answer) {
        toast.error('Preencha a pergunta e a resposta', { icon: '⚠️' });
        return;
      }
    }

    try {
      // Preparar dados para criar o flashcard
      const cardData: CreateFlashcardData = {
        type: newCard.type as any,
        front: newCard.front,
        back: newCard.back,
        text: newCard.text,
        question: newCard.question,
        options: newCard.options.filter(o => o.trim()),
        correct: newCard.correct,
        explanation: newCard.explanation,
        statement: newCard.statement,
        answer: newCard.answer,
        hint: newCard.hint,
        extra: newCard.extra,
        difficulty: newCard.difficulty as any,
        tags: newCard.tags ? newCard.tags.split(',').map(t => t.trim()) : [],
        category: deckInfo?.category || 'GERAL',
        subcategory: deckInfo?.subcategory || 'Geral',
        status: 'published'
      };

      const response = await flashcardService.createFlashcard(cardData);
      
      if (response.success && response.data) {
        setCards([...cards, response.data]);
        toast.success('Cartão adicionado com sucesso!', { icon: '✅' });
        setShowNewCardForm(false);
        
        // Reset form
        setNewCard({
          type: 'basic',
          front: '',
          back: '',
          difficulty: 'medium',
          tags: '',
          question: '',
          options: ['', '', '', ''],
          correct: 0,
          explanation: '',
          statement: '',
          answer: true,
          text: '',
          extra: '',
          hint: '',
          image: '',
          occlusionAreas: []
        });
      } else {
        toast.error('Erro ao criar cartão', { icon: '❌' });
      }
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      toast.error('Erro ao salvar cartão', { icon: '❌' });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const response = await flashcardService.deleteFlashcard(cardId);
      
      if (response.success) {
        setCards(cards.filter(c => c.id !== cardId));
        toast.success('Cartão removido com sucesso!', { icon: '🗑️' });
      } else {
        toast.error('Erro ao remover cartão', { icon: '❌' });
      }
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      toast.error('Erro ao deletar cartão', { icon: '❌' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCards.length === 0) {
      toast.error('Selecione cartões para excluir', { icon: '⚠️' });
      return;
    }

    try {
      // Deletar cartões selecionados um por um
      // Em produção, seria melhor ter um endpoint de bulk delete
      for (const cardId of selectedCards) {
        await flashcardService.deleteFlashcard(cardId);
      }
      
      setCards(cards.filter(c => !selectedCards.includes(c.id)));
      setSelectedCards([]);
      setShowBulkActions(false);
      toast.success(`${selectedCards.length} cartões removidos!`, { icon: '🗑️' });
    } catch (error) {
      console.error('Erro ao deletar cartões:', error);
      toast.error('Erro ao deletar cartões', { icon: '❌' });
    }
  };

  const handleDuplicateCard = async (card: Flashcard) => {
    try {
      const cardData: CreateFlashcardData = {
        type: card.type,
        front: card.front ? `${card.front} (Cópia)` : undefined,
        back: card.back,
        text: card.text,
        question: card.question,
        options: card.options,
        correct: card.correct,
        explanation: card.explanation,
        statement: card.statement,
        answer: card.answer,
        hint: card.hint,
        extra: card.extra,
        difficulty: card.difficulty,
        tags: card.tags,
        category: card.category || 'GERAL',
        subcategory: card.subcategory || 'Geral',
        status: 'published'
      };

      const response = await flashcardService.createFlashcard(cardData);
      
      if (response.success && response.data) {
        setCards([...cards, response.data]);
        toast.success('Cartão duplicado com sucesso!', { icon: '📋' });
      } else {
        toast.error('Erro ao duplicar cartão', { icon: '❌' });
      }
    } catch (error) {
      console.error('Erro ao duplicar cartão:', error);
      toast.error('Erro ao duplicar cartão', { icon: '❌' });
    }
  };

  const getCardTypeIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      basic: <BookOpen className="w-4 h-4" />,
      basic_reversed: <BookOpen className="w-4 h-4" />,
      cloze: <Edit className="w-4 h-4" />,
      multiple_choice: <CheckCircle className="w-4 h-4" />,
      true_false: <AlertCircle className="w-4 h-4" />,
      type_answer: <Edit className="w-4 h-4" />,
      image_occlusion: <ImageIcon className="w-4 h-4" />
    };
    return icons[type] || <BookOpen className="w-4 h-4" />;
  };

  const getCardTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      basic: 'BÁSICO',
      basic_reversed: 'BÁSICO INVERTIDO',
      cloze: 'LACUNAS',
      multiple_choice: 'MÚLTIPLA ESCOLHA',
      true_false: 'V/F',
      type_answer: 'DIGITE',
      image_occlusion: 'IMAGEM'
    };
    return labels[type] || type.toUpperCase();
  };

  // Função para lidar com resposta do usuário
  const handleAnswer = (quality: 'easy' | 'good' | 'hard' | 'again') => {
    const currentCard = filteredCards[currentCardIndex];
    if (!currentCard) return;
    
    // Registrar resultado
    setStudyResults(prev => ({ ...prev, [currentCard.id]: quality }));
    
    // Atualizar estatísticas
    setSessionStats(prev => ({
      ...prev,
      totalAnswered: prev.totalAnswered + 1,
      [quality]: prev[quality] + 1
    }));
    
    // Registrar no backend
    const isCorrect = quality === 'easy' || quality === 'good';
    const qualityMap = { easy: 5, good: 3, hard: 1, again: 0 };
    flashcardService.recordStudySession(currentCard.id, isCorrect, qualityMap[quality]);
    
    // Avançar para próximo cartão
    setTimeout(() => {
      if (currentCardIndex < filteredCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Fim da sessão
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);
        toast.success(
          `Sessão concluída! ${sessionStats.totalAnswered + 1} cartões estudados em ${Math.floor(duration / 60)}min`,
          { icon: '🎯' }
        );
        navigate(`/student/decks/${actualDeckId}`);
      }
    }, 500);
  };
  
  const renderCardContent = (card: Flashcard) => {
    switch (card.type) {
      case 'basic':
      case 'basic_reversed':
        return (
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-sm font-police-subtitle text-gray-400 uppercase tracking-wider mb-4">
                {showAnswer ? '🎯 RESPOSTA' : '❓ PERGUNTA'}
              </h3>
              <div className="p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-accent-500/20">
                <p className="text-2xl text-white font-police-body leading-relaxed">
                  {showAnswer ? card.back : card.front}
                </p>
              </div>
            </div>
            {showAnswer && card.extra && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 font-police-body">
                  💡 {card.extra}
                </p>
              </div>
            )}
          </div>
        );
        
      case 'cloze':
        return (
          <div className="text-center">
            <h3 className="text-sm font-police-subtitle text-gray-400 uppercase tracking-wider mb-4">
              COMPLETE AS LACUNAS
            </h3>
            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-accent-500/20">
              <p className="text-xl text-white font-police-body leading-relaxed whitespace-pre-line">
                {showAnswer 
                  ? card.text?.replace(/{{c\d+::(.*?)}}/g, (_, p1) => `[${p1}]`) || ''
                  : card.text?.replace(/{{c\d+::(.*?)}}/g, '________') || ''
                }
              </p>
            </div>
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="text-center">
            <h3 className="text-sm font-police-subtitle text-gray-400 uppercase tracking-wider mb-4">
              MÚLTIPLA ESCOLHA
            </h3>
            <div className="p-6 bg-black/30 backdrop-blur-sm rounded-lg border border-accent-500/20 mb-4">
              <p className="text-xl text-white font-police-body mb-6">
                {card.question}
              </p>
              <div className="space-y-3 text-left">
                {card.options?.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      showAnswer && idx === card.correct
                        ? 'bg-green-500/20 border-green-500 text-green-300'
                        : 'bg-black/20 border-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="font-police-body">
                      {String.fromCharCode(65 + idx)}) {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 font-police-body text-sm">
                  📝 EXPLICAÇÃO: {card.explanation}
                </p>
              </div>
            )}
          </div>
        );
        
      case 'true_false':
        return (
          <div className="text-center">
            <h3 className="text-sm font-police-subtitle text-gray-400 uppercase tracking-wider mb-4">
              VERDADEIRO OU FALSO
            </h3>
            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-accent-500/20 mb-4">
              <p className="text-xl text-white font-police-body mb-6">
                {card.statement}
              </p>
              {showAnswer && (
                <div className={`p-4 rounded-lg ${
                  card.answer
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                    : 'bg-red-500/20 border-2 border-red-500 text-red-300'
                }`}>
                  <p className="text-2xl font-police-body font-bold uppercase">
                    {card.answer ? '✅ VERDADEIRO' : '❌ FALSO'}
                  </p>
                </div>
              )}
            </div>
            {showAnswer && card.explanation && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 font-police-body text-sm">
                  📝 EXPLICAÇÃO: {card.explanation}
                </p>
              </div>
            )}
          </div>
        );
        
      case 'type_answer':
        return (
          <div className="text-center">
            <h3 className="text-sm font-police-subtitle text-gray-400 uppercase tracking-wider mb-4">
              DIGITE A RESPOSTA
            </h3>
            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-accent-500/20 mb-4">
              <p className="text-xl text-white font-police-body mb-6">
                {card.question}
              </p>
              {card.hint && !showAnswer && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                  <p className="text-yellow-300 font-police-body text-sm">
                    💡 DICA: {card.hint}
                  </p>
                </div>
              )}
              {showAnswer && (
                <div className="p-4 bg-green-500/20 border-2 border-green-500 rounded-lg">
                  <p className="text-green-300 font-police-body font-bold text-lg">
                    RESPOSTA: {card.answer}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'image_occlusion':
        return (
          <ImageOcclusionPreview
            imageUrl={card.image}
            occlusionAreas={card.occlusionAreas}
            extra={card.extra}
          />
        );
        
      default:
        return (
          <div className="text-center">
            <p className="text-gray-400 font-police-body">
              Tipo de cartão não suportado: {card.type}
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">CARREGANDO ARSENAL TÁTICO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={() => navigate('/student/flashcards')} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Renderização principal - Modo de Estudo ou Gerenciamento
  if (filteredCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider mb-4">
            ARSENAL VAZIO
          </p>
          <Button onClick={() => navigate(`/student/decks/${actualDeckId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLTAR AO DECK
          </Button>
        </div>
      </div>
    );
  }
  
  const currentCard = filteredCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / filteredCards.length) * 100;
  
  if (isStudyMode && currentCard) {
    // Interface de Estudo Real
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#14242f] to-gray-900 flex flex-col">
        {/* Header Compacto */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-accent-500/30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => navigate(`/student/decks/${actualDeckId}`)}
                variant="ghost"
                className="text-white hover:text-accent-500 font-police-body uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                SAIR DO ESTUDO
              </Button>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-accent-500 text-black font-police-body">
                  {currentCardIndex + 1}/{filteredCards.length}
                </Badge>
                <Button
                  onClick={() => setIsStudyMode(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-accent-500"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  VER LISTA
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-500 to-accent-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
        
        {/* Main Study Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            {/* Logo e Informações do Deck */}
            <div className="text-center mb-8">
              <StudyProLogo className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-2xl font-police-title text-white uppercase tracking-wider mb-2">
                {deckInfo?.title || 'ARSENAL TÁTICO'}
              </h2>
              <p className="text-gray-400 font-police-subtitle uppercase tracking-wider">
                {deckInfo?.category || 'OPERAÇÃO ESPECIAL'}
              </p>
            </div>
            
            {/* Card Container */}
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-md border border-accent-500/30 rounded-xl shadow-2xl p-8"
            >
              {/* Card Type Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-accent-500 text-black font-police-body uppercase">
                    {getCardTypeLabel(currentCard.type)}
                  </Badge>
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>
                    {getDifficultyLabel(currentCard.difficulty)}
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="ghost"
                  className="text-white hover:text-accent-500"
                >
                  {showAnswer ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
              
              {/* Card Content */}
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="w-full">
                  {renderCardContent(currentCard)}
                </div>
              </div>
              
              {/* Action Buttons */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 border-t border-gray-700 pt-6"
                >
                  <p className="text-center text-gray-400 font-police-subtitle uppercase tracking-wider mb-4">
                    AVALIAÇÃO DE DIFICULDADE
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <Button
                      onClick={() => handleAnswer('again')}
                      className="bg-red-500 hover:bg-red-600 text-white font-police-body uppercase tracking-wider"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      REPETIR
                    </Button>
                    <Button
                      onClick={() => handleAnswer('hard')}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-police-body uppercase tracking-wider"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      DIFÍCIL
                    </Button>
                    <Button
                      onClick={() => handleAnswer('good')}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-police-body uppercase tracking-wider"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      BOM
                    </Button>
                    <Button
                      onClick={() => handleAnswer('easy')}
                      className="bg-green-500 hover:bg-green-600 text-white font-police-body uppercase tracking-wider"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      FÁCIL
                    </Button>
                  </div>
                  <div className="mt-4 flex justify-center gap-2 text-xs text-gray-500">
                    <span>1 - Repetir</span>
                    <span>2 - Difícil</span>
                    <span>3 - Bom</span>
                    <span>4 - Fácil</span>
                    <span>Espaço - Mostrar resposta</span>
                  </div>
                </motion.div>
              )}
              
              {!showAnswer && (
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                    className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider px-8"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    MOSTRAR RESPOSTA
                  </Button>
                </div>
              )}
            </motion.div>
            
            {/* Stats Footer */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl font-police-numbers font-bold text-red-500">{sessionStats.again}</p>
                <p className="text-xs text-gray-400 font-police-subtitle uppercase">Repetições</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl font-police-numbers font-bold text-orange-500">{sessionStats.hard}</p>
                <p className="text-xs text-gray-400 font-police-subtitle uppercase">Difíceis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl font-police-numbers font-bold text-blue-500">{sessionStats.good}</p>
                <p className="text-xs text-gray-400 font-police-subtitle uppercase">Bons</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl font-police-numbers font-bold text-green-500">{sessionStats.easy}</p>
                <p className="text-xs text-gray-400 font-police-subtitle uppercase">Fáceis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Interface de Lista (quando não está em modo de estudo)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/student/flashcards')}
                variant="ghost"
                className="hover:bg-white/10 text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                RETORNAR À BASE
              </Button>
              <div>
                <h1 className="text-2xl font-police-title uppercase tracking-wider">
                  🎯 {deckInfo?.title || 'LISTA DE CARTÕES'}
                </h1>
                <p className="text-sm opacity-75 mt-1 font-police-subtitle uppercase tracking-wider">
                  {deckInfo?.description || 'VISUALIZAÇÃO DO ARSENAL'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/10 text-white">
                <Target className="w-4 h-4 mr-1" />
                {filteredCards.length} CARTÕES
              </Badge>
              <Button
                onClick={() => setIsStudyMode(true)}
                className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
              >
                <Brain className="w-5 h-5 mr-2" />
                INICIAR ESTUDO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cartões..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">TODAS DIFICULDADES</option>
                  <option value="easy">FÁCIL</option>
                  <option value="medium">MÉDIO</option>
                  <option value="hard">DIFÍCIL</option>
                </select>
              </div>
              <div className="flex gap-2">
                {showBulkActions && (
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    disabled={selectedCards.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    EXCLUIR ({selectedCards.length})
                  </Button>
                )}
                <Button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  variant="outline"
                >
                  {showBulkActions ? 'CANCELAR' : 'SELECIONAR'}
                </Button>
                <Button
                  onClick={() => setShowNewCardForm(true)}
                  className="bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  NOVO CARTÃO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards List */}
        <div className="space-y-4">
          {filteredCards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Nenhum cartão encontrado' : 'Nenhum cartão no deck ainda'}
                </p>
                <Button
                  onClick={() => setShowNewCardForm(true)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADICIONAR PRIMEIRO CARTÃO
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        {showBulkActions && (
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCards([...selectedCards, card.id]);
                              } else {
                                setSelectedCards(selectedCards.filter(id => id !== card.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        )}
                        {getCardTypeIcon(card.type)}
                        <Badge variant="outline">{getCardTypeLabel(card.type)}</Badge>
                        <Badge className={getDifficultyColor(card.difficulty)}>
                          {getDifficultyLabel(card.difficulty)}
                        </Badge>
                        {card.tags?.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {renderCardContent(card)}
                      
                      {card.explanation && showAnswer && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Explicação:</strong> {card.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => setShowAnswer(!showAnswer)}
                        variant="ghost"
                        size="sm"
                      >
                        {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleDuplicateCard(card)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingCard(card.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCard(card.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* New Card Modal */}
      <AnimatePresence>
        {showNewCardForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewCardForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-police-title uppercase tracking-wider">
                    NOVO CARTÃO
                  </h2>
                  <Button
                    onClick={() => setShowNewCardForm(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Cartão</label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {cardTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campos dinâmicos baseados no tipo */}
                {(newCard.type === 'basic' || newCard.type === 'basic_reversed') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Frente</label>
                      <textarea
                        value={newCard.front}
                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Verso</label>
                      <textarea
                        value={newCard.back}
                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {newCard.type === 'cloze' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Texto com Lacunas (use {'{{c1::texto}}'} para criar lacunas)
                    </label>
                    <textarea
                      value={newCard.text}
                      onChange={(e) => setNewCard({ ...newCard, text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={4}
                    />
                  </div>
                )}

                {newCard.type === 'multiple_choice' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pergunta</label>
                      <textarea
                        value={newCard.question}
                        onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={2}
                      />
                    </div>
                    {newCard.options.map((option, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium mb-2">
                          Alternativa {String.fromCharCode(65 + idx)}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newCard.options];
                              newOptions[idx] = e.target.value;
                              setNewCard({ ...newCard, options: newOptions });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input
                            type="radio"
                            name="correct"
                            checked={newCard.correct === idx}
                            onChange={() => setNewCard({ ...newCard, correct: idx })}
                            className="w-4 h-4 mt-3"
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {newCard.type === 'true_false' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Afirmação</label>
                      <textarea
                        value={newCard.statement}
                        onChange={(e) => setNewCard({ ...newCard, statement: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Resposta</label>
                      <select
                        value={newCard.answer.toString()}
                        onChange={(e) => setNewCard({ ...newCard, answer: e.target.value === 'true' })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="true">VERDADEIRO</option>
                        <option value="false">FALSO</option>
                      </select>
                    </div>
                  </>
                )}

                {newCard.type === 'type_answer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pergunta</label>
                      <textarea
                        value={newCard.question}
                        onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Resposta</label>
                      <input
                        type="text"
                        value={newCard.answer as string}
                        onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Dica (opcional)</label>
                      <input
                        type="text"
                        value={newCard.hint}
                        onChange={(e) => setNewCard({ ...newCard, hint: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Dificuldade</label>
                  <select
                    value={newCard.difficulty}
                    onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">FÁCIL</option>
                    <option value="medium">MÉDIO</option>
                    <option value="hard">DIFÍCIL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={newCard.tags}
                    onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ex: CPM, Art. 9º, Crime Militar"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <Button
                  onClick={() => setShowNewCardForm(false)}
                  variant="outline"
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={handleSaveNewCard}
                  className="bg-accent-500 hover:bg-accent-600 text-black"
                >
                  <Save className="w-4 h-4 mr-2" />
                  SALVAR CARTÃO
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}