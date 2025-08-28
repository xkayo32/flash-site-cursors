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
  ChevronDown,
  Play,
  AlertTriangle,
  AlertCircle,
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
  Settings,
  Filter,
  Folder,
  FolderOpen,
  Tag,
  X,
  Upload,
  Download,
  FileJson,
  Package,
  Layers,
  Image as ImageIcon,
  EyeOff,
  HelpCircle,
  Type,
  MousePointer,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { StudyProLogo } from '@/components/ui/StudyProLogo';
import { StatCard } from '@/components/student';
import flashcardService, { Flashcard as APIFlashcard, FlashcardType, type CreateFlashcardData } from '@/services/flashcardService';
import flashcardDeckService from '@/services/flashcardDeckService';
import { categoryService, Category } from '@/services/categoryService';
import { useAuthStore } from '@/store/authStore';
import AnkiImportExport from '@/components/AnkiImportExport';
import ImageOcclusionEditor from '@/components/ImageOcclusionEditor';
import ClozeEditor from '@/components/ClozeEditor';
import FlashcardPreviewModal from '@/components/FlashcardPreviewModal';

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
  category?: string;
  flashcard_ids?: string[];
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
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'study' | 'create' | 'create-card' | 'manage' | 'stats'>('overview');
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
  const [flashcardVisibility, setFlashcardVisibility] = useState<'my' | 'all'>('all'); // Padrão: ver todos os flashcards
  const [deckVisibility, setDeckVisibility] = useState<'my' | 'all'>('all'); // Padrão: ver todos os decks
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<FlashcardDeck | null>(null);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now()
  });
  
  // Estados para o sistema de categorias hierárquico
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Estado para preview de flashcard
  const [previewCard, setPreviewCard] = useState<Flashcard | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newDeckTopic, setNewDeckTopic] = useState(''); // Novo: Tópico
  const [newDeckSubtopic, setNewDeckSubtopic] = useState(''); // Novo: Subtópico
  const [newDeckLevel, setNewDeckLevel] = useState('medium'); // Novo: Nível
  
  // Estados para criação de flashcard individual
  const [newCardType, setNewCardType] = useState<'basic' | 'basic_inverted' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer'>('basic');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardSubject, setNewCardSubject] = useState('');
  const [newCardTags, setNewCardTags] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [newCardExplanation, setNewCardExplanation] = useState('');
  const [newCardHint, setNewCardHint] = useState('');
  const [newCardFoundation, setNewCardFoundation] = useState(''); // Novo: Embasamento
  const [newCardLearnMore, setNewCardLearnMore] = useState(''); // Novo: Saiba Mais
  const [newCardExtraFields, setNewCardExtraFields] = useState(''); // Novo: Campos Extras
  const [newCardSelectedDeck, setNewCardSelectedDeck] = useState(''); // Novo: Deck selecionado
  const [showDeckSelector, setShowDeckSelector] = useState(false);

  // Estados para o sistema completo de flashcards (igual ao admin)
  const [flashcardType, setFlashcardType] = useState<FlashcardType>('basic');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Estados específicos por tipo de flashcard
  const [basicFront, setBasicFront] = useState('');
  const [basicBack, setBasicBack] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [reverseCard, setReverseCard] = useState(false);
  
  // Cloze (lacunas)
  const [clozeText, setClozeText] = useState('');
  const [clozeHint, setClozeHint] = useState('');
  
  // Multiple Choice
  const [mcQuestion, setMcQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [mcCorrect, setMcCorrect] = useState(0);
  const [mcExplanation, setMcExplanation] = useState('');
  
  // True/False
  const [tfStatement, setTfStatement] = useState('');
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [tfExplanation, setTfExplanation] = useState('');
  
  // Type Answer
  const [typeQuestion, setTypeQuestion] = useState('');
  const [typeAnswer, setTypeAnswer] = useState('');
  const [typeHint, setTypeHint] = useState('');
  
  // Image Occlusion
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [occlusionAreas, setOcclusionAreas] = useState<Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    answer: string;
    shape: 'rectangle' | 'circle';
  }>>([]);
  
  // Metadados
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPublic, setIsPublic] = useState(false);

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
        let decks = result.decks || [];
        
        // Se o filtro é "my", filtra apenas os decks do usuário
        if (deckVisibility === 'my' && user?.id) {
          decks = decks.filter(deck => deck.user_id === user.id);
        }
        
        setUserDecks(decks);
      }
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
      setUserDecks([]);
    }
  };
  
  // Carregar categorias para o filtro
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categories = await categoryService.getCategoryHierarchy();
      if (Array.isArray(categories)) {
        setCategories(categories);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadFlashcards = async () => {
    try {
      setLoadingState('loading');
      setErrorMessage(null);
      
      const filters: any = {
        page: 1,
        limit: 100, // Carregar muitos para demonstração
        search: searchTerm || undefined,
        category: filterSubject === 'all' ? undefined : filterSubject,
        type: filterType === 'all' ? undefined : filterType
      };
      
      // Se o filtro é "my", adiciona author_id do usuário
      if (flashcardVisibility === 'my' && user?.id) {
        filters.author_id = user.id;
      }
      
      const response = await flashcardService.getFlashcards(filters);
      
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
    loadCategories();
  }, []);

  // useEffect para recarregar quando filtros mudam
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadFlashcards();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategories, filterType, flashcardVisibility]);
  
  // Recarregar decks quando visibilidade mudar
  useEffect(() => {
    loadDecks();
  }, [deckVisibility]);

  // Atalhos de teclado Anki-style para interface de estudo
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Só ativa se estivermos em modo de estudo e a resposta está visível
      if (!studySession || !showAnswer) return;
      
      // Evita conflito com inputs de texto
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(event.key) {
        case '1':
          event.preventDefault();
          handleAnswer('again');
          break;
        case '2':
          event.preventDefault();
          handleAnswer('hard');
          break;
        case '3':
          event.preventDefault();
          handleAnswer('good');
          break;
        case '4':
          event.preventDefault();
          handleAnswer('easy');
          break;
        case ' ': // Espaço para mostrar resposta
          if (!showAnswer) {
            event.preventDefault();
            setShowAnswer(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [studySession, showAnswer, currentCard]);

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

  // Funções para gerenciar decks
  const handleUpdateDeck = async () => {
    if (!editingDeck) return;
    
    try {
      const result = await flashcardDeckService.updateDeck(editingDeck.id, {
        name: editingDeck.name,
        description: editingDeck.description,
        subject: editingDeck.subject,
        difficulty: editingDeck.difficulty
      });
      
      if (result.success) {
        toast.success('Arsenal atualizado com sucesso!');
        setEditingDeck(null);
        loadDecks();
      } else {
        toast.error('Erro ao atualizar arsenal');
      }
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
      toast.error('Erro ao atualizar arsenal');
    }
  };

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return;
    
    try {
      const result = await flashcardDeckService.deleteDeck(deckToDelete.id);
      
      if (result.success) {
        toast.success('Arsenal excluído com sucesso!');
        setDeckToDelete(null);
        loadDecks();
      } else {
        toast.error('Erro ao excluir arsenal');
      }
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      toast.error('Erro ao excluir arsenal');
    }
  };

  // Funções para o sistema completo de criação de flashcards (igual ao admin)
  const resetFlashcardForm = () => {
    setFlashcardType('basic');
    setPreviewMode(false);
    setShowAnswer(false);
    
    // Reset basic
    setBasicFront('');
    setBasicBack('');
    setExtraInfo('');
    setReverseCard(false);
    
    // Reset cloze
    setClozeText('');
    setClozeHint('');
    
    // Reset multiple choice
    setMcQuestion('');
    setMcOptions(['', '', '', '']);
    setMcCorrect(0);
    setMcExplanation('');
    
    // Reset true/false
    setTfStatement('');
    setTfAnswer(null);
    setTfExplanation('');
    
    // Reset type answer
    setTypeQuestion('');
    setTypeAnswer('');
    setTypeHint('');
    
    // Reset image occlusion
    setImageFile(null);
    setImageUrl('');
    setOcclusionAreas([]);
    
    // Reset metadata
    setSelectedCategory('');
    setSelectedSubcategory('');
    setTags([]);
    setDifficulty('medium');
    setIsPublic(false);
  };

  const validateFlashcard = (): boolean => {
    switch (flashcardType) {
      case 'basic':
        if (!basicFront.trim() || !basicBack.trim()) {
          toast.error('Preencha a frente e o verso do cartão');
          return false;
        }
        break;
      case 'basic_inverted':
        if (!basicFront.trim() || !basicBack.trim()) {
          toast.error('Preencha a frente e o verso do cartão');
          return false;
        }
        break;
      case 'cloze':
        if (!clozeText.trim() || !clozeText.includes('{{c1::')) {
          toast.error('O texto deve conter pelo menos uma lacuna {{c1::...}}');
          return false;
        }
        break;
      case 'multiple_choice':
        if (!mcQuestion.trim() || mcOptions.some(opt => !opt.trim())) {
          toast.error('Preencha a pergunta e todas as opções');
          return false;
        }
        break;
      case 'true_false':
        if (!tfStatement.trim() || tfAnswer === null) {
          toast.error('Preencha a afirmação e selecione a resposta');
          return false;
        }
        break;
      case 'type_answer':
        if (!typeQuestion.trim() || !typeAnswer.trim()) {
          toast.error('Preencha a pergunta e a resposta');
          return false;
        }
        break;
      case 'image_occlusion':
        if (!imageFile && !imageUrl) {
          toast.error('Selecione uma imagem');
          return false;
        }
        if (occlusionAreas.length === 0) {
          toast.error('Crie pelo menos uma área de oclusão');
          return false;
        }
        break;
      default:
        return false;
    }

    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return false;
    }

    return true;
  };

  const saveFlashcard = async () => {
    if (!validateFlashcard()) return;

    try {
      const flashcardData: CreateFlashcardData = {
        type: flashcardType,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        tags,
        difficulty,
        status: 'active' as any,
        
        // Campos específicos por tipo
        front: flashcardType === 'basic' || flashcardType === 'basic_inverted' ? basicFront : undefined,
        back: flashcardType === 'basic' || flashcardType === 'basic_inverted' ? basicBack : undefined,
        
        text: flashcardType === 'cloze' ? clozeText : undefined,
        
        question: flashcardType === 'multiple_choice' ? mcQuestion : 
                 flashcardType === 'type_answer' ? typeQuestion : undefined,
        
        options: flashcardType === 'multiple_choice' ? mcOptions : undefined,
        correct: flashcardType === 'multiple_choice' ? mcCorrect : undefined,
        explanation: flashcardType === 'multiple_choice' ? mcExplanation :
                    flashcardType === 'true_false' ? tfExplanation : undefined,
                    
        statement: flashcardType === 'true_false' ? tfStatement : undefined,
        answer: flashcardType === 'true_false' ? tfAnswer :
               flashcardType === 'type_answer' ? typeAnswer : undefined,
               
        hint: flashcardType === 'cloze' ? clozeHint :
             flashcardType === 'type_answer' ? typeHint : undefined,
             
        image: imageUrl || undefined,
        occlusionAreas: flashcardType === 'image_occlusion' ? occlusionAreas : undefined
      };

      const result = await flashcardService.createFlashcard(flashcardData);
      
      if (result.success) {
        toast.success('Cartão tático criado com sucesso!');
        resetFlashcardForm();
        loadFlashcards(); // Recarregar lista
      } else {
        toast.error('Erro ao criar cartão tático');
      }
    } catch (error) {
      console.error('Erro ao salvar flashcard:', error);
      toast.error('Erro ao salvar cartão tático');
    }
  };

  const loadExampleData = () => {
    switch (flashcardType) {
      case 'basic':
        setBasicFront('Qual é a capital do Brasil?');
        setBasicBack('Brasília');
        setExtraInfo('Brasília foi inaugurada em 21 de abril de 1960.');
        break;
      case 'basic_inverted':
        setBasicFront('Quem foi o primeiro presidente do Brasil?');
        setBasicBack('Deodoro da Fonseca');
        setExtraInfo('Governou de 1889 a 1891.');
        setReverseCard(true);
        break;
      case 'cloze':
        setClozeText('A {{c1::Constituição}} de {{c2::1988}} é a lei fundamental do Brasil.');
        setClozeHint('Lei suprema do país');
        break;
      case 'multiple_choice':
        setMcQuestion('Qual é o maior estado do Brasil?');
        setMcOptions(['São Paulo', 'Amazonas', 'Minas Gerais', 'Bahia']);
        setMcCorrect(1);
        setMcExplanation('O Amazonas possui 1.559.167 km², sendo o maior estado brasileiro.');
        break;
      case 'true_false':
        setTfStatement('O Brasil possui 26 estados e 1 distrito federal.');
        setTfAnswer(true);
        setTfExplanation('Correto. São 26 estados mais o Distrito Federal.');
        break;
      case 'type_answer':
        setTypeQuestion('Digite o nome do primeiro imperador do Brasil:');
        setTypeAnswer('Dom Pedro I');
        setTypeHint('Proclamou a independência em 1822');
        break;
    }
    
    setSelectedCategory('Geografia');
    setTags(['concurso', 'brasil']);
    setDifficulty('medium');
  };
  
  // Funções para gerenciar categorias hierárquicas
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Função para encontrar todos os pais de uma categoria
  const findParentChain = (categoryId: string, cats: Category[] = categories): string[] => {
    const parentChain: string[] = [];
    
    const findParent = (cats: Category[], targetId: string): Category | null => {
      for (const cat of cats) {
        if (cat.children) {
          for (const child of cat.children) {
            if (child.id === targetId) {
              return cat;
            }
            const found = findParent(cat.children, targetId);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    let currentId = categoryId;
    while (currentId) {
      const parent = findParent(cats, currentId);
      if (parent) {
        parentChain.push(parent.id);
        currentId = parent.id;
      } else {
        break;
      }
    }
    
    return parentChain;
  };
  
  // Função para encontrar todos os filhos de uma categoria
  const findAllChildren = (categoryId: string, cats: Category[] = categories): string[] => {
    const children: string[] = [];
    
    const addChildren = (cats: Category[]) => {
      cats.forEach(cat => {
        if (cat.id === categoryId && cat.children) {
          cat.children.forEach(child => {
            children.push(child.id);
            addChildren(cat.children!);
          });
        } else if (cat.children) {
          addChildren(cat.children);
        }
      });
    };
    
    addChildren(cats);
    return children;
  };
  
  // Handle category toggle com seleção de pais
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      let newSelectedCategories = [...prev];
      
      if (prev.includes(categoryId)) {
        // Desmarcando: remover a categoria e todos os filhos
        const allChildren = findAllChildren(categoryId);
        newSelectedCategories = newSelectedCategories.filter(id => 
          id !== categoryId && !allChildren.includes(id)
        );
      } else {
        // Marcando: adicionar a categoria e todos os pais
        const parentChain = findParentChain(categoryId);
        const toAdd = [categoryId, ...parentChain];
        
        toAdd.forEach(id => {
          if (!newSelectedCategories.includes(id)) {
            newSelectedCategories.push(id);
          }
        });
      }
      
      return newSelectedCategories;
    });
  };
  
  // Obter nomes das categorias selecionadas
  const getSelectedCategoryNames = () => {
    const findCategoryById = (id: string, cats: Category[] = categories): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategoryById(id, cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return selectedCategories
      .map(id => findCategoryById(id))
      .filter(Boolean)
      .map(cat => cat!.name);
  };
  
  // Renderizar árvore de categorias
  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    
    const isMainCategory = level === 0;
    const indentClass = level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4' : '';
    
    return (
      <div key={category.id} className={`${indentClass} ${level > 0 ? 'mt-2' : ''}`}>
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700",
            isSelected && "bg-accent-50 dark:bg-accent-900/20 border-accent-500",
            isMainCategory && "border-2 font-bold shadow-md",
            !isMainCategory && "border ml-0"
          )}
          onClick={() => toggleCategorySelection(category.id)}
        >
          {/* Category content should be here */}
          <span className="font-medium">{category.name}</span>
          {hasChildren && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpansion(category.id);
              }}
              className="ml-auto"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        
        {/* Children categories */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children?.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Main component return starts here  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-police-body">
      {/* Header and other content */}
      <AnimatePresence mode="wait">
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
                {/* Escolher Deck */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    ESCOLHER DECK (OPCIONAL)
                  </label>
                  <select 
                    value={newCardSelectedDeck}
                    onChange={(e) => setNewCardSelectedDeck(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                  >
                    <option value="">SEM DECK (CARTÃO AVULSO)</option>
                    {userDecks.filter(d => deckVisibility === 'all' || d.user_id === user?.id).map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name} ({deck.flashcard_ids?.length || 0} cards)
                      </option>
                    ))}
                  </select>
                </div>

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

                {/* Campo Embasamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    EMBASAMENTO TEÓRICO
                  </label>
                  <textarea
                    placeholder="BASE LEGAL, DOUTRINA OU JURISPRUDÊNCIA QUE FUNDAMENTA A RESPOSTA..."
                    value={newCardFoundation}
                    onChange={(e) => setNewCardFoundation(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Campo Saiba Mais */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    SAIBA MAIS
                  </label>
                  <textarea
                    placeholder="INFORMAÇÕES COMPLEMENTARES, LINKS, REFERÊNCIAS PARA APROFUNDAMENTO..."
                    value={newCardLearnMore}
                    onChange={(e) => setNewCardLearnMore(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Campos Extras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    CAMPOS EXTRAS (OPCIONAL)
                  </label>
                  <textarea
                    placeholder="INFORMAÇÕES ADICIONAIS, OBSERVAÇÕES, MNEMÔNICOS..."
                    value={newCardExtraFields}
                    onChange={(e) => setNewCardExtraFields(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
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
                          {newCardFoundation && (
                            <>
                              <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 mt-4">EMBASAMENTO:</h5>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body text-sm">{newCardFoundation}</p>
                            </>
                          )}
                          {newCardLearnMore && (
                            <>
                              <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 mt-4">SAIBA MAIS:</h5>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body text-sm">{newCardLearnMore}</p>
                            </>
                          )}
                          {newCardExtraFields && (
                            <>
                              <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 mt-4">INFORMAÇÕES EXTRAS:</h5>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body text-sm">{newCardExtraFields}</p>
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

      {/* Modal de seleção de categorias */}
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    FILTRAR POR CATEGORIAS TÁTICAS
                  </h2>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="mt-4 p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                        {selectedCategories.length} CATEGORIAS SELECIONADAS
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCategories([])}
                        className="text-xs font-police-body uppercase tracking-wider hover:text-red-500"
                      >
                        LIMPAR TODAS
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedCategoryNames().map((name, index) => (
                        <Badge key={index} className="bg-accent-500 text-black font-police-body">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-500 mr-3" />
                    <span className="font-police-body text-gray-600 dark:text-gray-400">
                      Carregando categorias...
                    </span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-police-body text-gray-500 dark:text-gray-400">
                      Nenhuma categoria disponível
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map(category => renderCategoryTree(category))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 font-police-body uppercase tracking-wider"
                  >
                    CANCELAR
                  </Button>
                  <Button
                    onClick={() => {
                      // Aplicar filtro e fechar modal
                      loadFlashcards();
                      setShowCategoryModal(false);
                    }}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 dark:bg-gray-100 dark:hover:bg-accent-650 text-black dark:text-black hover:text-black dark:hover:text-white font-police-body uppercase tracking-wider"
                  >
                    APLICAR FILTROS
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal de Preview do Flashcard */}
      {previewCard && (
        <FlashcardPreviewModal
          flashcard={previewCard}
          isOpen={!!previewCard}
          onClose={() => setPreviewCard(null)}
          onEdit={() => navigate(`/student/flashcards/${previewCard.id}/edit`)}
          onStudy={() => {
            setStudyCards([previewCard]);
            setCurrentCardIndex(0);
            setStudySession({
              deckId: previewCard.id,
              startedAt: new Date().toISOString(),
              cardsStudied: 0,
              averageTime: 0,
              accuracy: 0,
              isActive: true
            });
            setShowAnswer(false);
            setActiveTab('study');
            setPreviewCard(null);
          }}
        />
      )}
    </div>
  );
}