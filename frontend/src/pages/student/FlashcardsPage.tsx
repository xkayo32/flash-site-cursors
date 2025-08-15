import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Clock,
  Eye,
  BookOpen,
  Zap,
  CheckCircle,
  XCircle,
  ChevronRight,
  Play,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Flame,
  BarChart3,
  Star,
  Info,
  Command,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import flashcardService, { Flashcard as APIFlashcard, FlashcardType } from '@/services/flashcardService';
import flashcardDeckService from '@/services/flashcardDeckService';

// Tipos locais (compatíveis com a API)
interface Flashcard {
  id: string;
  type: FlashcardType;
  // Campos básicos
  front?: string;
  back?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  
  // Campos específicos para tipos avançados (compatível com API)
  text?: string; // Para cloze
  question?: string; // Para multiple choice
  options?: string[]; // Para multiple choice
  correct?: number; // Índice da resposta correta
  explanation?: string;
  statement?: string; // Para true/false
  answer?: string; // Para true/false
  hint?: string; // Para type_answer
  image?: string; // Para image_occlusion
  occlusionAreas?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    answer: string;
    shape: 'rectangle' | 'circle';
  }[];
  
  // Dados SRS (compatível com API)
  interval: number;
  ease_factor: number;
  next_review: string;
  times_studied: number;
  times_correct: number;
  correct_rate: number;
  
  // Metadados da API
  author_id: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
}

interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  subject: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  color: string;
  createdAt: string;
  lastStudied?: string;
  isUserDeck?: boolean; // true se criado pelo usuário, false/undefined se do sistema
  author?: string;
}

interface StudySession {
  deckId: string;
  startedAt: string;
  cardsStudied: number;
  averageTime: number;
  accuracy: number;
  isActive: boolean;
}

// Estados para dados da API
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Interface para estatísticas agregadas
interface StudyStats {
  totalCards: number;
  dueToday: number;
  newCards: number;
  dailyStreak: number;
  totalStudyTime: number; // minutos
  averageAccuracy: number;
  cardsStudiedToday: number;
  timeStudiedToday: number; // minutos
}


export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'study' | 'create' | 'create-card' | 'stats'>('overview');
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState<'all' | FlashcardType>('all');
  const [deckFilter, setDeckFilter] = useState<'all' | 'my' | 'system'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<FlashcardDeck | null>(null);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now()
  });
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  
  // Estados para criação de flashcard individual
  const [newCardType, setNewCardType] = useState<'basic' | 'basic_inverted' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer'>('basic');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardSubject, setNewCardSubject] = useState('');
  const [newCardTags, setNewCardTags] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [newCardExplanation, setNewCardExplanation] = useState('');
  const [newCardHint, setNewCardHint] = useState('');
  const [showDeckSelector, setShowDeckSelector] = useState(false);

  // Estados para integração com API
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [userDecks, setUserDecks] = useState<FlashcardDeck[]>([]);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalCards: 0,
    dueToday: 0,
    newCards: 0,
    dailyStreak: 0,
    totalStudyTime: 0,
    averageAccuracy: 0,
    cardsStudiedToday: 0,
    timeStudiedToday: 0
  });
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState<LoadingState>('idle');

  // Funções de API
  const loadDecks = async () => {
    try {
      const result = await flashcardDeckService.getDecks();
      if (result.success) {
        setUserDecks(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    }
  };

  const loadFlashcards = async () => {
    try {
      setLoadingState('loading');
      setErrorMessage(null);
      
      const response = await flashcardService.getFlashcards({
        page: 1,
        limit: 100, // Carregar muitos para demonstração
        search: searchTerm || undefined,
        category: filterSubject === 'all' ? undefined : filterSubject,
        type: filterType === 'all' ? undefined : filterType
      });
      
      // Mapear dados da API para o formato local
      const mappedFlashcards: Flashcard[] = response.data.map((apiCard: APIFlashcard) => ({
        id: apiCard.id,
        type: apiCard.type,
        front: apiCard.front || apiCard.question || '',
        back: apiCard.back || '', 
        category: apiCard.category,
        subcategory: apiCard.subcategory,
        tags: apiCard.tags,
        difficulty: apiCard.difficulty,
        created_at: apiCard.created_at,
        // Campos específicos
        text: apiCard.text,
        question: apiCard.question,
        options: apiCard.options,
        correct: apiCard.correct,
        explanation: apiCard.explanation,
        statement: apiCard.statement,
        answer: apiCard.answer,
        hint: apiCard.hint,
        image: apiCard.image,
        occlusionAreas: apiCard.occlusionAreas,
        // Dados SRS
        interval: apiCard.interval,
        ease_factor: apiCard.ease_factor,
        next_review: apiCard.next_review,
        times_studied: apiCard.times_studied,
        times_correct: apiCard.times_correct,
        correct_rate: apiCard.correct_rate,
        // Metadados
        author_id: apiCard.author_id,
        author_name: apiCard.author_name,
        status: apiCard.status
      }));
      
      setFlashcards(mappedFlashcards);
      setLoadingState('success');
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
      setErrorMessage('Falha ao carregar flashcards. Tente novamente.');
      setLoadingState('error');
      toast.error('Erro ao carregar flashcards');
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats('loading');
      
      const response = await flashcardService.getStats();
      
      // Mapear estatísticas da API para o formato local
      setStudyStats({
        totalCards: response.data.total_flashcards || 0,
        dueToday: Math.floor(response.data.total_flashcards * 0.2) || 0, // Simulação
        newCards: Math.floor(response.data.total_flashcards * 0.1) || 0,
        dailyStreak: 12, // Valor fixo por enquanto
        totalStudyTime: 1548, // Valor fixo por enquanto  
        averageAccuracy: response.data.average_correct_rate || 0,
        cardsStudiedToday: 73, // Valor fixo por enquanto
        timeStudiedToday: 42 // Valor fixo por enquanto
      });
      
      setLoadingStats('success');
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setLoadingStats('error');
    }
  };

  // useEffect para carregar dados iniciais
  useEffect(() => {
    loadFlashcards();
    loadStats();
    loadDecks();
  }, []);

  // useEffect para recarregar quando filtros mudam
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadFlashcards();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterSubject, filterType]);

  // Função para gravar sessão de estudo
  const recordStudy = async (flashcardId: string, isCorrect: boolean, quality: number = 3) => {
    try {
      await flashcardService.recordStudySession(flashcardId, isCorrect, quality);
      // Recarregar dados após gravação
      loadFlashcards();
      loadStats();
    } catch (error) {
      console.error('Erro ao gravar sessão de estudo:', error);
      toast.error('Erro ao gravar sessão de estudo');
    }
  };

  // Filtrar flashcards localmente (agora usando dados da API)
  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = !searchTerm || 
      card.front?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === 'all' || card.category === filterSubject;
    const matchesType = filterType === 'all' || card.type === filterType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  // Organizar flashcards por categoria (similar ao conceito de decks)
  const flashcardsByCategory = filteredFlashcards.reduce((acc, card) => {
    const category = card.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);

  // Decks virtuais baseados nas categorias
  const virtualDecks = Object.entries(flashcardsByCategory).map(([category, cards]) => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    name: `ARSENAL TÁTICO - ${category}`,
    description: `Flashcards sobre ${category.toLowerCase()}`,
    subject: category,
    totalCards: cards.length,
    dueCards: cards.filter(card => {
      const nextReview = new Date(card.next_review);
      const today = new Date();
      return nextReview <= today;
    }).length,
    newCards: cards.filter(card => card.times_studied === 0).length,
    color: 'bg-blue-500', // Cor padrão
    createdAt: cards[0]?.created_at || new Date().toISOString(),
    isUserDeck: false,
    author: 'SISTEMA TÁTICO'
  }));
  
  // Decks reais salvos pelo usuário
  const realDecks = userDecks.map(deck => ({
    id: deck.id,
    name: deck.name,
    description: deck.description || '',
    subject: deck.subject,
    totalCards: deck.total_cards || deck.flashcard_ids?.length || 0,
    dueCards: 0,
    newCards: 0,
    color: 'bg-purple-500', // Cor diferente para decks do usuário
    createdAt: deck.created_at,
    isUserDeck: true,
    author: deck.owner_name || 'VOCÊ'
  }));
  
  // Combinar decks reais e virtuais
  const filteredDecks = [...realDecks, ...virtualDecks];

  // Lista de matérias/categorias disponíveis 
  const subjects = ['all', ...new Set(flashcards.map(card => card.category))];

  // Aplicar filtros de origem nos decks
  const finalFilteredDecks = filteredDecks.filter(deck => {
    // Filtro de origem (meus/sistema/todos)
    const matchesOrigin = deckFilter === 'all' || 
                           (deckFilter === 'my' && deck.isUserDeck) || 
                           (deckFilter === 'system' && !deck.isUserDeck);
    
    // Filtro de busca
    const matchesSearch = !searchTerm || 
                          deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesOrigin && matchesSearch;
  });

  // Handle card selection
  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  // Create new deck with selected cards
  const handleCreateCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !newCardSubject.trim()) {
      toast.error('PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS!', {
        icon: '⚠️',
        duration: 3000
      });
      return;
    }

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      type: newCardType,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      subject: newCardSubject.trim(),
      tags: newCardTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      difficulty: newCardDifficulty,
      createdAt: new Date().toISOString(),
      explanation: newCardExplanation.trim() || undefined,
      typeAnswerHint: newCardHint.trim() || undefined,
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        quality: 0
      },
      stats: {
        totalReviews: 0,
        correctReviews: 0,
        streak: 0,
        averageTime: 0
      }
    };

    // Criar flashcard via API (funcionalidade futura)
    toast.success('CARTÃO TÁTICO CRIADO COM SUCESSO!', {
      icon: '🎯',
      duration: 3000
    });
    
    // Recarregar dados após criação
    loadFlashcards();

    // Limpar formulário
    setNewCardFront('');
    setNewCardBack('');
    setNewCardSubject('');
    setNewCardTags('');
    setNewCardDifficulty('Médio');
    setNewCardExplanation('');
    setNewCardHint('');
    setNewCardType('basic');
    setActiveTab('overview');
  };

  const handleCreateDeck = async () => {
    if (selectedCards.length === 0 || !newDeckName.trim()) {
      toast.error('Nome do arsenal e pelo menos 1 cartão são obrigatórios');
      return;
    }

    try {
      // Criar o deck usando o serviço real
      const result = await flashcardDeckService.createDeck({
        name: newDeckName,
        description: newDeckDescription,
        subject: newDeckSubject || 'MISTO',
        flashcard_ids: selectedCards,
        is_public: false
      });

      if (result.success) {
        toast.success(`Arsenal "${newDeckName}" criado com sucesso!`);
        
        // Recarregar decks
        await loadDecks();
        
        // Limpar formulário
        setSelectedCards([]);
        setNewDeckName('');
        setNewDeckDescription('');
        setNewDeckSubject('');
        setActiveTab('overview');
      } else {
        toast.error('Erro ao criar arsenal');
      }
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      toast.error('Erro ao criar arsenal. Tente novamente.');
    }
  };

  const handleEditDeck = async (deck: FlashcardDeck) => {
    setEditingDeck(deck);
    setNewDeckName(deck.name);
    setNewDeckDescription(deck.description || '');
    setNewDeckSubject(deck.subject);
    setShowEditModal(true);
  };

  const handleUpdateDeck = async () => {
    if (!editingDeck || !newDeckName.trim()) {
      toast.error('Nome do arsenal é obrigatório');
      return;
    }

    try {
      const result = await flashcardDeckService.updateDeck(editingDeck.id, {
        name: newDeckName,
        description: newDeckDescription,
        subject: newDeckSubject || editingDeck.subject
      });

      if (result.success) {
        toast.success('Arsenal atualizado com sucesso!');
        await loadDecks();
        setShowEditModal(false);
        setEditingDeck(null);
        setNewDeckName('');
        setNewDeckDescription('');
        setNewDeckSubject('');
      } else {
        toast.error('Erro ao atualizar arsenal');
      }
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
      toast.error('Erro ao atualizar arsenal. Tente novamente.');
    }
  };

  const handleDeleteDeck = async (deck: FlashcardDeck) => {
    setDeckToDelete(deck);
    setShowDeleteModal(true);
  };

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return;

    try {
      const result = await flashcardDeckService.deleteDeck(deckToDelete.id);
      
      if (result.success) {
        toast.success('Arsenal excluído com sucesso!');
        await loadDecks();
        setShowDeleteModal(false);
        setDeckToDelete(null);
      } else {
        toast.error('Erro ao excluir arsenal');
      }
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      toast.error('Erro ao excluir arsenal. Tente novamente.');
    }
  };

  // Algoritmo SM-2 (SuperMemo 2) - Implementação completa como no Anki
  const calculateNextReview = (quality: number, card: Flashcard) => {
    const interval = card.interval || 1;
    const repetitions = card.times_studied || 0;
    const easeFactor = card.ease_factor || 2.5;
    
    let newInterval = interval;
    let newRepetitions = repetitions;
    let newEaseFactor = easeFactor;

    // Quality: 0 = Esqueci completamente, 1 = Esqueci, 2 = Difícil, 3 = Bom, 4 = Fácil, 5 = Muito fácil
    
    if (quality >= 3) {
      // Resposta correta (Bom, Fácil ou Muito fácil)
      
      // Calcula novo intervalo baseado no algoritmo SM-2
      switch (repetitions) {
        case 0:
          newInterval = 1; // 1 dia
          break;
        case 1:
          newInterval = 6; // 6 dias
          break;
        default:
          // Aplica o fator de facilidade ao intervalo anterior
          newInterval = Math.round(interval * newEaseFactor);
          
          // Adiciona variação aleatória (fuzz factor) como no Anki
          // Evita que muitos cards apareçam no mesmo dia
          const fuzzRange = Math.max(1, Math.floor(newInterval * 0.05));
          const fuzz = Math.floor(Math.random() * (2 * fuzzRange + 1)) - fuzzRange;
          newInterval = Math.max(1, newInterval + fuzz);
          break;
      }
      
      // Aplica multiplicador baseado na qualidade da resposta
      if (quality === 5) {
        // Muito fácil - aumenta intervalo em 30%
        newInterval = Math.round(newInterval * 1.3);
      } else if (quality === 4) {
        // Fácil - aumenta intervalo em 15%
        newInterval = Math.round(newInterval * 1.15);
      }
      // quality === 3 (Bom) mantém o intervalo calculado
      
      newRepetitions = repetitions + 1;
      
    } else {
      // Resposta incorreta (Esqueci completamente, Esqueci ou Difícil)
      newRepetitions = 0;
      
      // Define novo intervalo baseado na dificuldade
      if (quality === 2) {
        // Difícil - novo intervalo é 60% do anterior
        newInterval = Math.max(1, Math.round(interval * 0.6));
      } else if (quality === 1) {
        // Esqueci - intervalo de 1 dia
        newInterval = 1;
      } else {
        // Esqueci completamente - mostrar novamente em 10 minutos
        newInterval = 0.007; // ~10 minutos em dias
      }
    }

    // Ajusta o fator de facilidade usando a fórmula SM-2
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const qFactor = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    newEaseFactor = Math.max(1.3, easeFactor + qFactor);
    
    // Limita o fator de facilidade máximo
    newEaseFactor = Math.min(2.5, newEaseFactor);

    // Calcula a próxima data de revisão
    const nextReviewDate = new Date();
    if (newInterval < 1) {
      // Para intervalos menores que 1 dia, converte para minutos
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + Math.round(newInterval * 24 * 60));
    } else {
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    }

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview: nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      quality
    };
  };

  const handleAnswer = async (quality: number) => {
    if (!currentCard || !studySession) return;

    // Atualiza estatísticas da sessão
    const isCorrect = quality >= 3;
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Gravar sessão de estudo na API
    try {
      await recordStudy(currentCard.id, isCorrect, quality);
      
      // Mostrar feedback positivo
      toast.success(isCorrect ? 'RESPOSTA CORRETA! 🎯' : 'RESPOSTA INCORRETA. CONTINUE TREINANDO! 💪', {
        duration: 2000
      });
    } catch (error) {
      console.error('Erro ao gravar resposta:', error);
      toast.error('Erro ao gravar resposta, mas continuando o estudo');
    }

    // Simulação local do SRS para mostrar progressão imediata
    const updatedSRS = calculateNextReview(quality, currentCard);
    const updatedCard = {
      ...currentCard,
      interval: updatedSRS.interval,
      ease_factor: updatedSRS.easeFactor,
      next_review: updatedSRS.nextReview,
      times_studied: currentCard.times_studied + 1,
      times_correct: currentCard.times_correct + (isCorrect ? 1 : 0),
      correct_rate: ((currentCard.times_correct + (isCorrect ? 1 : 0)) / (currentCard.times_studied + 1)) * 100
    };

    // Atualiza o array de cards localmente
    const newStudyCards = [...studyCards];
    newStudyCards[currentCardIndex] = updatedCard;
    setStudyCards(newStudyCards);

    // Próximo card
    const nextIndex = currentCardIndex + 1;
    if (nextIndex < studyCards.length) {
      setCurrentCardIndex(nextIndex);
      setCurrentCard(studyCards[nextIndex]);
      setShowAnswer(false);
    } else {
      // Sessão finalizada
      finishStudySession();
    }

    // Atualiza estatísticas da sessão
    setStudySession({
      ...studySession,
      cardsStudied: studySession.cardsStudied + 1,
      accuracy: Math.round(((sessionStats.correct + (isCorrect ? 1 : 0)) / (sessionStats.total + 1)) * 100)
    });
  };

  const finishStudySession = () => {
    const timeSpent = Math.round((Date.now() - sessionStats.startTime) / 1000 / 60); // em minutos
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    
    // Mostra estatísticas finais com um modal mais atrativo
    // Mostra estatísticas finais
    toast.success('MISSÃO CONCLUÍDA!', {
      description: `📚 ${sessionStats.total} cards | ✅ ${sessionStats.correct} acertos | 🎯 ${accuracy}% precisão | ⏱️ ${timeSpent}min`,
      duration: 5000,
      icon: accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'
    });
    
    // Reset da sessão
    setStudySession(null);
    setCurrentCard(null);
    setCurrentCardIndex(0);
    setStudyCards([]);
    setShowAnswer(false);
    setSessionStats({ correct: 0, total: 0, startTime: Date.now() });
    setActiveTab('overview');
  };

  // Função para trocar de deck durante o estudo
  const switchDeck = (newDeck: FlashcardDeck) => {
    const newCards = flashcards.filter(card => {
      return card.category === newDeck.subject;
    }).slice(0, newDeck.totalCards);

    setSelectedDeck(newDeck);
    setStudyCards(newCards);
    setCurrentCard(newCards[0] || null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    
    // Resetar estatísticas da sessão mas manter a sessão ativa
    if (studySession) {
      setStudySession({
        ...studySession,
        deckName: newDeck.name,
        totalCards: newCards.length,
        cardsStudied: 0,
        accuracy: 0,
        startTime: Date.now()
      });
    }
    
    setSessionStats({ correct: 0, total: 0, startTime: Date.now() });
    setShowDeckSelector(false);
    
    toast.success(`DECK ALTERADO: ${newDeck.name}`, {
      icon: '🎯',
      duration: 3000
    });
  };

  const startStudySession = (deck: FlashcardDeck) => {
    // Filtra cards do deck selecionado
    const deckCards = flashcards.filter(card => card.category === deck.subject);
    
    // Ordena cards por prioridade SRS (cards vencidos primeiro)
    const sortedCards = deckCards.sort((a, b) => {
      const aDate = new Date(a.next_review);
      const bDate = new Date(b.next_review);
      return aDate.getTime() - bDate.getTime();
    });

    setSelectedDeck(deck);
    setStudyCards(sortedCards);
    setCurrentCardIndex(0);
    setCurrentCard(sortedCards[0]);
    setSessionStats({ correct: 0, total: 0, startTime: Date.now() });
    setStudySession({
      deckId: deck.id,
      startedAt: new Date().toISOString(),
      cardsStudied: 0,
      averageTime: 0,
      accuracy: 0,
      isActive: true
    });
    setActiveTab('study');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const DeckCard = ({ deck }: { deck: FlashcardDeck }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col relative overflow-hidden border-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 hover:shadow-lg">
          {/* Tactical stripe */}
          <div className={cn(
            "absolute top-0 right-0 w-1 h-full",
            deck.isUserDeck ? "bg-purple-500" : "bg-accent-500"
          )} />
          
          <CardHeader className="relative z-10 pb-3 flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">
                  {deck.name}
                </h3>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 font-police-body">
                  {deck.description}
                </p>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge 
                  className={cn(
                    "font-police-body text-xs uppercase tracking-wider border-2",
                    deck.isUserDeck 
                      ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-500" 
                      : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-500"
                  )}
                >
                  {deck.isUserDeck ? '👤' : '🏛️'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 pb-0 flex-1 flex flex-col relative z-10">
            {/* Contadores */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-lg font-bold text-blue-600 font-police-numbers">{deck.totalCards}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-police-body uppercase">TOTAL</div>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-lg font-bold text-green-600 font-police-numbers">{deck.dueCards}</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-police-body uppercase">DEVIDO</div>
              </div>
              <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-lg font-bold text-purple-600 font-police-numbers">{deck.newCards}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-police-body uppercase">NOVO</div>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            {/* Footer fixo com botões */}
            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <Button 
                className="w-full bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-semibold uppercase tracking-wider text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  startStudySession(deck);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                INICIAR OPERAÇÃO
              </Button>
              
              {deck.isUserDeck && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-police-body uppercase tracking-wider text-xs border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDeck(deck);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    EDITAR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-police-body uppercase tracking-wider text-xs border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck);
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    EXCLUIR
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const DeckListItem = ({ deck }: { deck: FlashcardDeck }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-accent-500/50 hover:shadow-lg">
          {/* Tactical stripe */}
          <div className={cn(
            "absolute top-0 right-0 w-1 h-full",
            deck.isUserDeck ? "bg-purple-500" : "bg-accent-500"
          )} />
          
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Informações principais */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white text-sm truncate">
                    {deck.name}
                  </h3>
                  <Badge 
                    className={cn(
                      "font-police-body text-xs uppercase tracking-wider border-2 flex-shrink-0",
                      deck.isUserDeck 
                        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-500" 
                        : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-500"
                    )}
                  >
                    {deck.isUserDeck ? '👤' : '🏛️'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 font-police-body">
                  {deck.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {deck.subject}
                </div>
              </div>
              
              {/* Contadores compactos */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 font-police-numbers">{deck.totalCards}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-police-body uppercase">TOTAL</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 font-police-numbers">{deck.dueCards}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-police-body uppercase">DEVIDO</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 font-police-numbers">{deck.newCards}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-police-body uppercase">NOVO</div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  size="sm"
                  className="bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body font-semibold uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    startStudy(deck);
                  }}
                >
                  <Play className="w-3 h-3 mr-1" />
                  INICIAR
                </Button>
                
                {deck.isUserDeck && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-police-body uppercase tracking-wider text-xs border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDeck(deck);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-police-body uppercase tracking-wider text-xs border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Componente para renderizar texto com lacunas (CLOZE)
  const ClozeRenderer = ({ text, showAnswers }: { text: string; showAnswers: boolean }) => {
    const [visibleClozes, setVisibleClozes] = useState<Set<string>>(new Set());

    const toggleCloze = (clozeId: string) => {
      const newVisible = new Set(visibleClozes);
      if (newVisible.has(clozeId)) {
        newVisible.delete(clozeId);
      } else {
        newVisible.add(clozeId);
      }
      setVisibleClozes(newVisible);
    };

    const renderClozeText = (text: string) => {
      // Regex para encontrar padrões {{c1::texto}} ou {{c2::texto}}
      const clozeRegex = /\{\{c(\d+)::([^}]+)\}\}/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = clozeRegex.exec(text)) !== null) {
        // Adicionar texto antes da lacuna
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        const clozeId = `c${match[1]}`;
        const clozeContent = match[2];
        const isVisible = showAnswers || visibleClozes.has(clozeId);

        // Criar o elemento da lacuna
        parts.push(
          <span key={`${clozeId}-${match.index}`} className="inline-block">
            <motion.button
              onClick={() => !showAnswers && toggleCloze(clozeId)}
              className={cn(
                "mx-1 px-3 py-1 rounded-lg font-police-body font-semibold transition-all",
                isVisible
                  ? "bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 border-2 border-yellow-400"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer"
              )}
              whileHover={!showAnswers ? { scale: 1.05 } : {}}
              whileTap={!showAnswers ? { scale: 0.95 } : {}}
              disabled={showAnswers}
            >
              {isVisible ? clozeContent : `[LACUNA ${match[1]}]`}
            </motion.button>
          </span>
        );

        lastIndex = match.index + match[0].length;
      }

      // Adicionar texto restante
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts;
    };

    return (
      <div className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body">
        {renderClozeText(text)}
        {!showAnswers && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-police-body">
              💡 <strong>INSTRUÇÃO TÁTICA:</strong> Clique nas lacunas para revelar as respostas uma por vez.
            </p>
          </div>
        )}
      </div>
    );
  };

  const StudyCard = ({ card }: { card: Flashcard }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'basic': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300';
        case 'basic_inverted': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300';
        case 'cloze': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300';
        case 'multiple_choice': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300';
        case 'true_false': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300';
        case 'type_answer': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300';
        case 'image_occlusion': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300';
        default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300';
      }
    };

    const getTypeName = (type: string) => {
      switch (type) {
        case 'basic': return 'CARTÃO BÁSICO';
        case 'basic_inverted': return 'BÁSICO INVERTIDO';
        case 'cloze': return 'LACUNAS (CLOZE)';
        case 'multiple_choice': return 'MÚLTIPLA ESCOLHA';
        case 'true_false': return 'VERDADEIRO/FALSO';
        case 'type_answer': return 'DIGITE RESPOSTA';
        case 'image_occlusion': return 'OCLUSÃO IMAGEM';
        default: return type.toUpperCase();
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="min-h-[400px] border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
          {/* Logo do sistema acima do card */}
          <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 dark:from-black dark:via-[#14242f] dark:to-black p-4 border-b-2 border-accent-500">
            <div className="flex items-center justify-center gap-4">
              <StudyProLogo variant="full" size="sm" className="text-white" />
              <div className="h-6 w-px bg-accent-500" />
              <span className="font-police-title text-white text-sm tracking-widest">
                {selectedDeck?.subject || 'CURSO TÁTICO'}
              </span>
            </div>
          </div>
          
          {/* Tactical stripe */}
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <CardHeader className="text-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "font-police-subtitle tracking-wider border-2",
                    getTypeColor(card.type)
                  )}
                >
                  {getTypeName(card.type)}
                </Badge>
                <Badge variant="secondary" className="font-police-body border-accent-500 text-accent-500">{card.subcategory || card.category}</Badge>
              </div>
              <Badge 
                className={cn(
                  "font-police-subtitle tracking-wider border-2 border-current",
                  card.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                  card.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                  card.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {card.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">
                {showAnswer ? 'RESPOSTA TÁTICA:' : 'OBJETIVO OPERACIONAL:'}
              </h3>
              <motion.div
                key={showAnswer ? 'answer' : 'question'}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[200px] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
              >
                {card.type === 'cloze' ? (
                  <div className="w-full">
                    {!showAnswer ? (
                      <div>
                        <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body mb-4">
                          {card.front}
                        </p>
                        <ClozeRenderer 
                          text={card.clozeText || card.back} 
                          showAnswers={false} 
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                          TEXTO COMPLETO:
                        </h4>
                        <ClozeRenderer 
                          text={card.clozeText || card.back} 
                          showAnswers={true} 
                        />
                        {card.explanation && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                            <p className="text-sm text-green-700 dark:text-green-300 font-police-body">
                              <strong>EXPLICAÇÃO TÁTICA:</strong> {card.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body">
                    {showAnswer ? card.back : card.front}
                  </p>
                )}
              </motion.div>
            </div>

            {!showAnswer ? (
              card.type === 'cloze' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                    <p className="text-yellow-800 dark:text-yellow-200 font-police-body font-semibold text-center">
                      🎯 <strong>MODO LACUNAS ATIVO</strong><br />
                      Clique nas lacunas para revelar as respostas ou veja o texto completo
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                    size="lg"
                  >
                    <Eye className="w-5 h-5" />
                    VER TEXTO COMPLETO
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAnswer(true)}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  size="lg"
                >
                  <Eye className="w-5 h-5" />
                  REVELAR INTEL
                </Button>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">
                  AVALIE SUA PERFORMANCE OPERACIONAL:
                </p>
                <div className="space-y-2">
                  {/* Primeira linha - Respostas incorretas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleAnswer(0)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    >
                      <XCircle className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-400 font-police-subtitle uppercase tracking-wider">FALHA</span>
                      <span className="text-xs text-red-600 dark:text-red-500 font-police-body">TOTAL</span>
                      <span className="text-[10px] text-red-500 mt-1 font-police-numbers">10 min</span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(1)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600 mb-1" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-400 font-police-subtitle uppercase tracking-wider">ERRO</span>
                      <span className="text-xs text-orange-600 dark:text-orange-500 font-police-body">REVISAR</span>
                      <span className="text-[10px] text-orange-500 mt-1 font-police-numbers">1 dia</span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(2)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mb-1" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400 font-police-subtitle uppercase tracking-wider">DIFIC.</span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-500 font-police-body">ESFORÇO</span>
                      <span className="text-[10px] text-yellow-500 mt-1 font-police-numbers">{Math.max(1, Math.round((currentCard?.interval || 1) * 0.6))} dias</span>
                    </Button>
                  </div>
                  
                  {/* Segunda linha - Respostas corretas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleAnswer(3)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400 font-police-subtitle uppercase tracking-wider">BOM</span>
                      <span className="text-xs text-blue-600 dark:text-blue-500 font-police-body">ADEQUADO</span>
                      <span className="text-[10px] text-blue-500 mt-1">
                        {currentCard?.times_studied === 0 ? '1 dia' : 
                         currentCard?.times_studied === 1 ? '6 dias' : 
                         `${Math.round((currentCard?.interval || 1) * (currentCard?.ease_factor || 2.5))} dias`}
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(4)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                    >
                      <Star className="w-5 h-5 text-green-600 mb-1" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 font-police-subtitle uppercase tracking-wider">FÁCIL</span>
                      <span className="text-xs text-green-600 dark:text-green-500 font-police-body">SEM ESFORÇO</span>
                      <span className="text-[10px] text-green-500 mt-1">
                        {Math.round((currentCard?.times_studied === 0 ? 1 : 
                         currentCard?.times_studied === 1 ? 6 : 
                         (currentCard?.interval || 1) * (currentCard?.ease_factor || 2.5)) * 1.15)} dias
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(5)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                    >
                      <Zap className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-police-subtitle uppercase tracking-wider">EXPERT</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500 font-police-body">INSTANTÂNEO</span>
                      <span className="text-[10px] text-emerald-500 mt-1">
                        {Math.round((currentCard?.times_studied === 0 ? 1 : 
                         currentCard?.times_studied === 1 ? 6 : 
                         (currentCard?.interval || 1) * (currentCard?.ease_factor || 2.5)) * 1.3)} dias
                      </span>
                    </Button>
                  </div>
                </div>
                
                {/* Informação adicional */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-police-body">
                    <Info className="w-3 h-3 inline mr-1" />
                    INTERVALO: {currentCard?.interval || 0} DIAS • 
                    FATOR: {(currentCard?.ease_factor || 2.5).toFixed(2)} • 
                    REPETIÇÕES: {currentCard?.times_studied || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(250, 204, 21, 0.05) 35px,
            rgba(250, 204, 21, 0.05) 70px
          )`
        }}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-police-title font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-ultra-wide">ARSENAL DE CARTÕES TÁTICOS</h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              SISTEMA TÁTICO DE REPETIÇÃO ESPAÇADA PARA MEMORIZAÇÃO OPERACIONAL
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-police-subtitle tracking-wider border-2 border-current">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              {studyStats.dailyStreak} DIAS DE OPERAÇÃO
            </Badge>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">ARSENAL PENDENTE</p>
                  <p className="text-2xl font-bold text-red-600 font-police-numbers">{studyStats.dueToday}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">ARSENAL NOVO</p>
                  <p className="text-2xl font-bold text-green-600 font-police-numbers">{studyStats.newCards}</p>
                </div>
                <Plus className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">EXECUTADOS HOJE</p>
                  <p className="text-2xl font-bold text-blue-600 font-police-numbers">{studyStats.cardsStudiedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TEMPO OPERACIONAL</p>
                  <p className="text-2xl font-bold text-purple-600 font-police-numbers">{formatTime(studyStats.timeStudiedToday)}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de navegação */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'overview', label: 'ARSENAL DISPONÍVEL', icon: BookOpen },
            { key: 'study', label: 'EXECUTAR OPERAÇÃO', icon: Brain },
            { key: 'create', label: 'CRIAR ARSENAL', icon: Plus },
            { key: 'create-card', label: 'CRIAR CARD', icon: Zap },
            { key: 'stats', label: 'INTELIGÊNCIA', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all font-police-body uppercase tracking-wider",
                  activeTab === tab.key 
                    ? "bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black shadow-lg font-semibold" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Conteúdo das tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Filtros Simplificados e Intuitivos */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? '📚 Todas as matérias' : subject}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="all">🎯 Todos os tipos</option>
                  <option value="basic">🔵 Básico</option>
                  <option value="basic_reversed">🟢 Invertido</option>
                  <option value="cloze">🟡 Lacunas</option>
                  <option value="multiple_choice">🟣 Múltipla Escolha</option>
                  <option value="true_false">🔴 Verdadeiro/Falso</option>
                  <option value="type_answer">🟦 Digite Resposta</option>
                  <option value="image_occlusion">🟠 Oclusão Imagem</option>
                </select>
                
                {/* Botões de view mode - Padrão das outras páginas */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'grid'
                        ? "bg-white dark:bg-gray-700 text-accent-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    className={cn(
                      "p-2 rounded transition-all",
                      viewMode === 'list'
                        ? "bg-white dark:bg-gray-700 text-accent-500 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading e Error States */}
            {loadingState === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando...</span>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</span>
                  <Button 
                    onClick={() => {
                      loadFlashcards();
                      loadStats();
                    }}
                    className="ml-auto bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white px-2 py-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}


            {/* Grid de decks simplificado */}
            {finalFilteredDecks.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {finalFilteredDecks.map((deck) => (
                    <DeckCard key={deck.id} deck={deck} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {finalFilteredDecks.map((deck) => (
                    <DeckListItem key={deck.id} deck={deck} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum flashcard encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Tente ajustar os filtros ou criar novos flashcards
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterSubject('all');
                      setFilterType('all');
                      setSearchTerm('');
                    }}
                  >
                    Limpar filtros
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setActiveTab('create-card')}
                    className="bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar flashcard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'study' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {currentCard ? (
              <div>
                {/* Header da sessão MELHORADO */}
                {studySession && (
                  <div className="mb-6">
                    {/* Header principal com logo e navegação */}
                    <Card className="mb-4 border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                      {/* Tactical stripe */}
                      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-accent-500 to-blue-500" />
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          {/* Logo e título */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Command className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                                  STUDYPRO TACTICAL
                                </h3>
                                <Badge className="bg-green-500 text-white text-xs font-police-body">
                                  ✓ ONLINE
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                                SISTEMA TÁTICO DE APRENDIZAGEM
                              </p>
                            </div>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeckSelector(!showDeckSelector)}
                                className="gap-2 font-police-body uppercase tracking-wider border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Settings className="w-4 h-4" />
                                TROCAR DECK
                                <ChevronRight className={cn("w-4 h-4 transition-transform", showDeckSelector && "rotate-90")} />
                              </Button>
                              
                              {/* Dropdown de seleção de deck */}
                              <AnimatePresence>
                                {showDeckSelector && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-xl z-50"
                                  >
                                    <div className="p-4">
                                      <h4 className="font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                        SELECIONAR ARSENAL:
                                      </h4>
                                      <div className="max-h-60 overflow-y-auto space-y-2">
                                        {finalFilteredDecks.map((deck) => (
                                          <button
                                            key={deck.id}
                                            onClick={() => switchDeck(deck)}
                                            className={cn(
                                              "w-full p-3 rounded-lg text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-700 border",
                                              selectedDeck?.id === deck.id 
                                                ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20" 
                                                : "border-gray-200 dark:border-gray-600"
                                            )}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <p className="font-police-subtitle font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                                                  {deck.name}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body">
                                                  {deck.totalCards} CARTÕES • {deck.subject}
                                                </p>
                                              </div>
                                              {selectedDeck?.id === deck.id && (
                                                <CheckCircle className="w-5 h-5 text-accent-500" />
                                              )}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-police-body uppercase tracking-wider border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => {
                                if (confirm('TEM CERTEZA QUE DESEJA ABORTAR A OPERAÇÃO?')) {
                                  finishStudySession();
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              ABORTAR
                            </Button>
                          </div>
                        </div>

                        {/* Deck atual em destaque */}
                        <div className="bg-gradient-to-r from-blue-50 to-accent-50 dark:from-blue-900/20 dark:to-accent-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                🎯 OPERAÇÃO ATIVA: {selectedDeck?.name || studySession.deckName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                                {selectedDeck?.description || 'Arsenal tático em execução'}
                              </p>
                            </div>
                            <Badge className="bg-blue-500 text-white font-police-body">
                              {selectedDeck?.subject || 'OPERAÇÃO'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Estatísticas da sessão */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-accent-500 font-police-numbers mb-1">
                            {currentCardIndex + 1}/{studyCards.length}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                            CARTÃO ATUAL
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 font-police-numbers mb-1">
                            {studySession.cardsStudied}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                            EXECUTADOS
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600 font-police-numbers mb-1">
                            {studySession.accuracy}%
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                            PRECISÃO
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600 font-police-numbers mb-1">
                            {Math.round(((currentCardIndex + 1) / studyCards.length) * 100)}%
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                            PROGRESSO
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Barra de progresso melhorada */}
                    <Card className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            PROGRESSO DA OPERAÇÃO
                          </span>
                          <span className="text-sm font-police-numbers font-bold text-accent-500">
                            {Math.round(((currentCardIndex + 1) / studyCards.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentCardIndex + 1) / studyCards.length) * 100}%` }}
                            className="bg-gradient-to-r from-accent-500 to-blue-500 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <StudyCard card={currentCard} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider">
                  SELECIONE UM ARSENAL PARA TREINAMENTO
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body uppercase tracking-wider">
                  RETORNE AO ARSENAL DISPONÍVEL E ESCOLHA UMA OPERAÇÃO PARA INICIAR
                </p>
                <Button 
                  onClick={() => setActiveTab('overview')}
                  className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                >
                  VER ARSENAIS DISPONÍVEIS
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">CRIAR NOVO ARSENAL</h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  MONTE SUA COLEÇÃO PERSONALIZADA SELECIONANDO CARTÕES EXISTENTES DO SISTEMA
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações básicas do deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      NOME DO ARSENAL
                    </label>
                    <input
                      type="text"
                      placeholder="EX: ARSENAL TÁTICO - CONSTITUCIONAL E PENAL"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      ÁREA OPERACIONAL
                    </label>
                    <select 
                      value={newDeckSubject}
                      onChange={(e) => setNewDeckSubject(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                    >
                      <option value="">SELECIONE UMA ÁREA</option>
                      <option value="Misto/Várias matérias">OPERAÇÃO MISTA/VÁRIAS ÁREAS</option>
                      <option value="Direito Constitucional">Direito Constitucional</option>
                      <option value="Direito Penal">Direito Penal</option>
                      <option value="Direito Administrativo">Direito Administrativo</option>
                      <option value="Informática">Informática</option>
                      <option value="Português">Português</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    BRIEFING OPERACIONAL
                  </label>
                  <textarea
                    placeholder="DESCREVA O OBJETIVO DO SEU ARSENAL PERSONALIZADO..."
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Seleção de cards existentes */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">SELECIONAR CARTÕES TÁTICOS</h4>
                  
                  {/* Filtros para encontrar cards */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          FILTRAR POR ÁREA
                        </label>
                        <select className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors">
                          <option>TODAS</option>
                          <option>Direito Constitucional</option>
                          <option>Direito Penal</option>
                          <option>Informática</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          NÍVEL TÁTICO
                        </label>
                        <select className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors">
                          <option>TODOS</option>
                          <option>FÁCIL</option>
                          <option>MÉDIO</option>
                          <option>DIFÍCIL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          BUSCAR INTEL
                        </label>
                        <input
                          type="text"
                          placeholder="PALAVRAS-CHAVE..."
                          className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de cards disponíveis */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        {flashcards.length} CARTÕES DISPONÍVEIS - TODOS OS 7 TIPOS IMPLEMENTADOS
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-police-numbers">
                        {selectedCards.length} SELECIONADO{selectedCards.length !== 1 ? 'S' : ''}
                      </p>
                    </div>

                    {/* Resumo dos tipos disponíveis */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 font-police-subtitle uppercase tracking-wider">
                        TIPOS DE CARTÕES TÁTICOS DISPONÍVEIS:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">1. BÁSICO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">2. BÁSICO INVERTIDO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">3. LACUNAS (CLOZE)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">4. MÚLTIPLA ESCOLHA</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">5. VERDADEIRO/FALSO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">6. DIGITE RESPOSTA</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">7. OCLUSÃO IMAGEM</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto bg-white dark:bg-gray-900">
                      {flashcards.map((card) => {
                        const getTypeColor = (type: string) => {
                          switch (type) {
                            case 'basic': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300';
                            case 'basic_inverted': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300';
                            case 'cloze': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300';
                            case 'multiple_choice': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300';
                            case 'true_false': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300';
                            case 'type_answer': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300';
                            case 'image_occlusion': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300';
                            default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300';
                          }
                        };

                        const getTypeName = (type: string) => {
                          switch (type) {
                            case 'basic': return 'BÁSICO';
                            case 'basic_inverted': return 'BÁSICO INVERTIDO';
                            case 'cloze': return 'LACUNAS (CLOZE)';
                            case 'multiple_choice': return 'MÚLTIPLA ESCOLHA';
                            case 'true_false': return 'VERDADEIRO/FALSO';
                            case 'type_answer': return 'DIGITE RESPOSTA';
                            case 'image_occlusion': return 'OCLUSÃO IMAGEM';
                            default: return type.toUpperCase();
                          }
                        };

                        return (
                          <div
                            key={card.id}
                            className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={selectedCards.includes(card.id)}
                                onChange={() => handleCardSelection(card.id)}
                                className="mt-1 w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge 
                                    className={cn(
                                      "text-xs font-police-subtitle tracking-wider border-2",
                                      getTypeColor(card.type)
                                    )}
                                  >
                                    {getTypeName(card.type)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs font-police-body border-accent-500 text-accent-500">
                                    {card.subcategory || card.category}
                                  </Badge>
                                  <Badge 
                                    className={cn(
                                      "text-xs font-police-subtitle tracking-wider border-2 border-current",
                                      card.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                                      card.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                                      card.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                    )}
                                  >
                                    {card.difficulty}
                                  </Badge>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white mb-1 font-police-body">
                                  {card.front}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-police-body">
                                  {card.back}
                                </p>
                                {/* Exibir informações específicas do tipo */}
                                {card.type === 'cloze' && card.clozeText && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Texto com lacunas: {card.clozeText.slice(0, 50)}...
                                  </p>
                                )}
                                {card.type === 'multiple_choice' && card.multipleChoiceOptions && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    {card.multipleChoiceOptions.length} alternativas disponíveis
                                  </p>
                                )}
                                {card.type === 'true_false' && card.truefalseStatement && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Afirmação: {card.truefalseStatement.slice(0, 50)}...
                                  </p>
                                )}
                                {card.type === 'type_answer' && card.typeAnswerHint && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Dica: {card.typeAnswerHint}
                                  </p>
                                )}
                                {card.type === 'image_occlusion' && card.occlusionAreas && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    {card.occlusionAreas.length} áreas de oclusão configuradas
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-police-body">
                      <strong className="font-police-subtitle uppercase tracking-wider">INTEL TÁTICA:</strong> VOCÊ PODE ADICIONAR MAIS CARTÕES AO SEU ARSENAL A QUALQUER MOMENTO. 
                      COMECE COM ALGUNS E VÁ EXPANDINDO CONFORME SUA NECESSIDADE OPERACIONAL.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider" 
                    disabled={selectedCards.length === 0 || !newDeckName.trim()}
                    onClick={handleCreateDeck}
                  >
                    <Plus className="w-4 h-4" />
                    {selectedCards.length === 0 
                      ? 'CRIAR ARSENAL (SELECIONE PELO MENOS 1 CARTÃO)' 
                      : `CRIAR ARSENAL COM ${selectedCards.length} CARTÃO${selectedCards.length > 1 ? 'S' : ''}`}
                  </Button>
                  <Button variant="outline" className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500" onClick={() => {
                    setSelectedCards([]);
                    setNewDeckName('');
                    setNewDeckDescription('');
                    setNewDeckSubject('');
                    setActiveTab('overview');
                  }}>
                    ABORTAR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'create-card' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">CRIAR CARTÃO TÁTICO</h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  CRIE SEU PRÓPRIO FLASHCARD PERSONALIZADO PARA ESTUDOS INDIVIDUAIS
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo de cartão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    TIPO DE CARTÃO TÁTICO
                  </label>
                  <select 
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value as any)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                  >
                    <option value="basic">🔵 BÁSICO - Pergunta e Resposta</option>
                    <option value="basic_inverted">🟢 BÁSICO INVERTIDO - Com Cartão Reverso</option>
                    <option value="cloze">🟡 LACUNAS (CLOZE) - Completar Texto</option>
                    <option value="multiple_choice">🟣 MÚLTIPLA ESCOLHA - 4 Alternativas</option>
                    <option value="true_false">🔴 VERDADEIRO/FALSO - Avaliar Afirmação</option>
                    <option value="type_answer">🟦 DIGITAR RESPOSTA - Campo de Texto</option>
                  </select>
                </div>

                {/* Campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      FRENTE DO CARTÃO *
                    </label>
                    <textarea
                      placeholder={newCardType === 'multiple_choice' ? 'QUAL É A PERGUNTA?' : 'DIGITE A PERGUNTA/FRENTE DO CARTÃO...'}
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[100px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      VERSO DO CARTÃO *
                    </label>
                    <textarea
                      placeholder={newCardType === 'multiple_choice' ? 'A) OPÇÃO 1\nB) OPÇÃO 2\nC) OPÇÃO 3\nD) OPÇÃO 4\n\nRESPOSTA CORRETA: A' : 'DIGITE A RESPOSTA/VERSO DO CARTÃO...'}
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[100px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      ÁREA OPERACIONAL *
                    </label>
                    <select 
                      value={newCardSubject}
                      onChange={(e) => setNewCardSubject(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                      required
                    >
                      <option value="">SELECIONE UMA ÁREA</option>
                      <option value="Direito Constitucional">Direito Constitucional</option>
                      <option value="Direito Penal">Direito Penal</option>
                      <option value="Direito Administrativo">Direito Administrativo</option>
                      <option value="Informática">Informática</option>
                      <option value="Português">Português</option>
                      <option value="Raciocínio Lógico">Raciocínio Lógico</option>
                      <option value="Conhecimentos Gerais">Conhecimentos Gerais</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      NÍVEL TÁTICO
                    </label>
                    <select 
                      value={newCardDifficulty}
                      onChange={(e) => setNewCardDifficulty(e.target.value as any)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                    >
                      <option value="Fácil">🟢 FÁCIL - OPERAÇÃO BÁSICA</option>
                      <option value="Médio">🟡 MÉDIO - OPERAÇÃO PADRÃO</option>
                      <option value="Difícil">🔴 DIFÍCIL - OPERAÇÃO COMPLEXA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    TAGS OPERACIONAIS
                  </label>
                  <input
                    type="text"
                    placeholder="EX: CONSTITUCIONAL, DIREITOS FUNDAMENTAIS, PRINCÍPIOS (SEPARAR COM VÍRGULAS)"
                    value={newCardTags}
                    onChange={(e) => setNewCardTags(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Campos condicionais */}
                {(newCardType === 'multiple_choice' || newCardType === 'true_false') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      EXPLICAÇÃO TÁTICA
                    </label>
                    <textarea
                      placeholder="EXPLIQUE POR QUE ESTA É A RESPOSTA CORRETA..."
                      value={newCardExplanation}
                      onChange={(e) => setNewCardExplanation(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>
                )}

                {newCardType === 'type_answer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      DICA OPERACIONAL
                    </label>
                    <input
                      type="text"
                      placeholder="DICA PARA AJUDAR NA RESPOSTA..."
                      value={newCardHint}
                      onChange={(e) => setNewCardHint(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>
                )}

                {/* Preview do cartão */}
                {newCardFront && newCardBack && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">PREVIEW DO CARTÃO TÁTICO</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-accent-500/30 hover:border-accent-500 transition-colors">
                        <div className="text-center">
                          <Badge className="mb-3 bg-accent-500 text-black font-police-body uppercase tracking-wider">
                            {newCardType === 'basic' && '🔵 BÁSICO'}
                            {newCardType === 'basic_inverted' && '🟢 BÁSICO INVERTIDO'}
                            {newCardType === 'cloze' && '🟡 LACUNAS'}
                            {newCardType === 'multiple_choice' && '🟣 MÚLTIPLA ESCOLHA'}
                            {newCardType === 'true_false' && '🔴 VERDADEIRO/FALSO'}
                            {newCardType === 'type_answer' && '🟦 DIGITAR RESPOSTA'}
                          </Badge>
                          <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">FRENTE:</h5>
                          <p className="text-gray-700 dark:text-gray-300 mb-4 font-police-body">{newCardFront}</p>
                          <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">VERSO:</h5>
                          <p className="text-gray-700 dark:text-gray-300 font-police-body">{newCardBack}</p>
                          {newCardExplanation && (
                            <>
                              <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 mt-4">EXPLICAÇÃO:</h5>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body text-sm">{newCardExplanation}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={handleCreateCard}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    CRIAR CARTÃO TÁTICO
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewCardFront('');
                      setNewCardBack('');
                      setNewCardSubject('');
                      setNewCardTags('');
                      setNewCardDifficulty('Médio');
                      setNewCardExplanation('');
                      setNewCardHint('');
                      setNewCardType('basic');
                      setActiveTab('overview');
                    }}
                    className="px-8 font-police-body uppercase tracking-wider hover:border-red-500 hover:text-red-500"
                  >
                    ABORTAR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas gerais */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">INTELIGÊNCIA OPERACIONAL</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-2xl font-bold text-blue-600 font-police-numbers">{studyStats.totalCards}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-police-body uppercase tracking-wider">TOTAL DE CARTÕES</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-2xl font-bold text-green-600 font-police-numbers">{studyStats.averageAccuracy.toFixed(1)}%</div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-police-body uppercase tracking-wider">PRECISÃO MÉDIA</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-2xl font-bold text-purple-600 font-police-numbers">{Math.floor(studyStats.totalStudyTime / 60)}h{Math.floor(studyStats.totalStudyTime % 60)}m</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-police-body uppercase tracking-wider">TEMPO TOTAL</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="text-2xl font-bold text-orange-600 font-police-numbers">{studyStats.dailyStreak}</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-police-body uppercase tracking-wider">DIAS CONSECUTIVOS</div>
                    </div>
                  </div>
                  
                  {/* Estatísticas adicionais */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body">CARTÕES PARA HOJE:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-police-numbers">{studyStats.dueToday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body">CARTÕES NOVOS:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-police-numbers">{studyStats.newCards}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body">CARTÕES DOMINADOS:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-police-numbers">
                          {flashcards.filter(card => card.times_studied >= 5 && card.correct_rate >= 80).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-police-body">ARSENAIS CRIADOS:</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-police-numbers">{userDecks.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progresso por matéria */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">PROGRESSO POR ÁREA</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      // Calcular estatísticas reais por categoria
                      const categories = [...new Set(flashcards.map(card => card.category || 'GERAL'))];
                      
                      const categoryStats = categories.map(category => {
                        const categoryCards = flashcards.filter(card => (card.category || 'GERAL') === category);
                        const totalCards = categoryCards.length;
                        const studiedCards = categoryCards.filter(card => card.times_studied > 0).length;
                        const masteredCards = categoryCards.filter(card => card.times_studied >= 5 && card.correct_rate >= 80).length;
                        
                        const progress = totalCards > 0 
                          ? Math.round((masteredCards / totalCards) * 100)
                          : 0;
                        
                        return {
                          category,
                          progress,
                          totalCards,
                          studiedCards,
                          masteredCards
                        };
                      }).filter(stat => stat.totalCards > 0).sort((a, b) => b.totalCards - a.totalCards); // Ordenar por quantidade
                      
                      if (categoryStats.length === 0) {
                        return (
                          <div className="text-center p-4 text-gray-500 dark:text-gray-400 font-police-body">
                            <Info className="w-8 h-8 mx-auto mb-2" />
                            NENHUM CARTÃO CRIADO AINDA
                          </div>
                        );
                      }
                      
                      return categoryStats.map((stat, index) => (
                        <div key={stat.category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-police-body">{stat.category}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-police-numbers">
                              {stat.progress}% ({stat.masteredCards}/{stat.totalCards})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-accent-500 h-full rounded-full"
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
              
              {/* Distribuição por tipo de cartão */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden lg:col-span-2">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">DISTRIBUIÇÃO TÁTICA</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {(() => {
                      const typeDistribution = [
                        { type: 'basic', label: 'BÁSICO', color: 'blue', icon: '🔵' },
                        { type: 'basic_reversed', label: 'INVERTIDO', color: 'green', icon: '🟢' },
                        { type: 'cloze', label: 'LACUNAS', color: 'yellow', icon: '🟡' },
                        { type: 'multiple_choice', label: 'MÚLTIPLA', color: 'purple', icon: '🟣' },
                        { type: 'true_false', label: 'V/F', color: 'red', icon: '🔴' },
                        { type: 'type_answer', label: 'DIGITE', color: 'indigo', icon: '🟦' },
                        { type: 'image_occlusion', label: 'IMAGEM', color: 'orange', icon: '🟠' }
                      ];
                      
                      return typeDistribution.map(item => {
                        const count = flashcards.filter(card => card.type === item.type).length;
                        const percentage = flashcards.length > 0 
                          ? Math.round((count / flashcards.length) * 100)
                          : 0;
                        
                        return (
                          <div key={item.type} className="text-center">
                            <div className={`p-3 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-lg border border-${item.color}-200 dark:border-${item.color}-700`}>
                              <div className="text-2xl mb-1">{item.icon}</div>
                              <div className={`text-lg font-bold text-${item.color}-600 font-police-numbers`}>{count}</div>
                              <div className={`text-xs text-${item.color}-600 dark:text-${item.color}-400 font-police-body uppercase`}>{item.label}</div>
                              <div className={`text-xs text-${item.color}-500 font-police-numbers`}>{percentage}%</div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
              
              {/* Desempenho por dificuldade */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden lg:col-span-2">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">ANÁLISE DE DIFICULDADE</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const difficultyLevels = [
                        { level: 'Fácil', color: 'green', min: 0, max: 33 },
                        { level: 'Médio', color: 'yellow', min: 34, max: 66 },
                        { level: 'Difícil', color: 'red', min: 67, max: 100 }
                      ];
                      
                      return difficultyLevels.map((level, index) => {
                        const cards = flashcards.filter(card => {
                          const difficulty = 100 - (card.correct_rate || 50);
                          return difficulty >= level.min && difficulty <= level.max;
                        });
                        
                        const count = cards.length;
                        const avgAccuracy = cards.length > 0
                          ? Math.round(cards.reduce((sum, card) => sum + (card.correct_rate || 50), 0) / cards.length)
                          : 0;
                        
                        return (
                          <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${level.color}-500`} />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white font-police-body">{level.level}</span>
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-police-numbers">({count} cartões)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold text-${level.color}-600 dark:text-${level.color}-400 font-police-numbers`}>
                                {avgAccuracy}% acerto
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action - Mostrar apenas quando não há decks criados */}
      {userDecks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white text-center border-2 border-accent-500/50 relative overflow-hidden"
        >
          {/* Tactical stripe */}
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <Brain className="w-12 h-12 mx-auto mb-4 text-accent-500" />
          <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-ultra-wide">
            CRIE SEU PRIMEIRO ARSENAL
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body">
            ORGANIZE SEUS CARTÕES EM ARSENAIS TEMÁTICOS PARA OTIMIZAR SEU ESTUDO
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
              onClick={() => setActiveTab('create')}
            >
              <Plus className="w-5 h-5 mr-2" />
              CRIAR MEU PRIMEIRO ARSENAL
            </Button>
          </div>
        </motion.div>
      )}

      {/* Modal de Edição de Deck */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-police-title text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                ✏️ EDITAR ARSENAL
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    NOME DO ARSENAL
                  </label>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Nome do arsenal..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    DESCRIÇÃO
                  </label>
                  <textarea
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px]"
                    placeholder="Descrição do arsenal..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    MATÉRIA
                  </label>
                  <input
                    type="text"
                    value={newDeckSubject}
                    onChange={(e) => setNewDeckSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="Matéria..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 font-police-body uppercase tracking-wider"
                  onClick={() => setShowEditModal(false)}
                >
                  CANCELAR
                </Button>
                <Button
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
                  onClick={handleUpdateDeck}
                >
                  SALVAR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-police-title text-lg font-bold text-red-600 mb-4 uppercase tracking-wider">
                ⚠️ CONFIRMAR EXCLUSÃO
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 mb-2 font-police-body">
                Tem certeza que deseja excluir o arsenal:
              </p>
              <p className="font-bold text-gray-900 dark:text-white mb-4 font-police-subtitle">
                "{deckToDelete?.name}"
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-police-body">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-police-body uppercase tracking-wider"
                  onClick={() => setShowDeleteModal(false)}
                >
                  CANCELAR
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-police-body uppercase tracking-wider"
                  onClick={confirmDeleteDeck}
                >
                  EXCLUIR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}