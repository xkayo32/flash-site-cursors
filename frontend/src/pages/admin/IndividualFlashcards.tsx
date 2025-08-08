import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import FlashcardPreviewModal from '@/components/FlashcardPreviewModal';
import FlashcardStudyModal from '@/components/FlashcardStudyModal';

// Mock data para flashcards individuais (será gerenciado via estado)
const initialFlashcards = [
  {
    id: 1,
    type: 'basic',
    front: 'Art. 121 do Código Penal',
    back: 'Matar alguém: Pena - reclusão, de seis a vinte anos.',
    category: 'DIREITO',
    subcategory: 'Penal',
    tags: ['CP', 'HOMICÍDIO', 'ARTIGO'],
    difficulty: 'medium',
    author: 'Major Silva',
    createdAt: '2024-01-20',
    lastReview: '2024-01-22',
    reviews: 15,
    correctCount: 12,
    nextReview: '2024-01-25',
    status: 'active'
  },
  {
    id: 2,
    type: 'multiple_choice',
    question: 'Qual o prazo para oferecimento de denúncia com réu preso?',
    options: ['3 dias', '5 dias', '10 dias', '15 dias'],
    correct: 1,
    explanation: 'Art. 46 do CPP - 5 dias quando o réu estiver preso.',
    category: 'DIREITO',
    subcategory: 'Processual Penal',
    tags: ['CPP', 'DENÚNCIA', 'PRAZO'],
    difficulty: 'hard',
    author: 'Capitão Costa',
    createdAt: '2024-01-18',
    lastReview: '2024-01-21',
    reviews: 8,
    correctCount: 6,
    nextReview: '2024-01-24',
    status: 'active'
  },
  {
    id: 3,
    type: 'true_false',
    statement: 'A prisão em flagrante pode ser realizada por qualquer pessoa.',
    answer: true,
    explanation: 'Art. 301 do CPP - Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito.',
    category: 'DIREITO',
    subcategory: 'Processual Penal',
    tags: ['CPP', 'FLAGRANTE', 'PRISÃO'],
    difficulty: 'easy',
    author: 'Tenente Oliveira',
    createdAt: '2024-01-16',
    lastReview: null,
    reviews: 0,
    correctCount: 0,
    nextReview: '2024-01-23',
    status: 'pending'
  },
  {
    id: 4,
    type: 'image_occlusion',
    image: '/api/placeholder/800/600',
    occlusionAreas: [
      { id: 'area-1', x: 100, y: 50, width: 150, height: 40, answer: 'Coronel', shape: 'rectangle' },
      { id: 'area-2', x: 100, y: 120, width: 150, height: 40, answer: 'Tenente-Coronel', shape: 'rectangle' }
    ],
    extra: 'Hierarquia Militar - Oficiais Superiores',
    category: 'SEGURANÇA PÚBLICA',
    subcategory: 'Hierarquia',
    tags: ['HIERARQUIA', 'MILITAR', 'OFICIAIS'],
    difficulty: 'medium',
    author: 'Major Santos',
    createdAt: '2024-01-22',
    lastReview: '2024-01-23',
    reviews: 3,
    correctCount: 3,
    nextReview: '2024-01-26',
    status: 'active'
  },
  {
    id: 5,
    type: 'cloze',
    text: 'Art. 155 CP - Subtrair, para si ou para outrem, coisa {{c1::alheia}} {{c2::móvel}}: Pena - reclusão, de {{c3::um a quatro anos}}, e multa.',
    extra: 'Crime de Furto - Código Penal',
    category: 'DIREITO',
    subcategory: 'Penal',
    tags: ['CP', 'FURTO', 'PATRIMÔNIO'],
    difficulty: 'medium',
    author: 'Delegado Lima',
    createdAt: '2024-01-19',
    lastReview: '2024-01-20',
    reviews: 12,
    correctCount: 9,
    nextReview: '2024-01-25',
    status: 'active'
  }
];

// Categorias e filtros
const materias: { [key: string]: string[] } = {
  'DIREITO': ['Todas', 'Constitucional', 'Administrativo', 'Penal', 'Processual Penal', 'Processual Civil'],
  'SEGURANÇA PÚBLICA': ['Todas', 'Operações Táticas', 'Procedimentos', 'Hierarquia', 'Legislação Policial'],
  'CONHECIMENTOS GERAIS': ['Todas', 'História', 'Geografia', 'Atualidades', 'Informática']
};

const categories = ['Todos', ...Object.keys(materias)];
const difficulties = ['Todos', 'easy', 'medium', 'hard'];
const statuses = ['Todos', 'active', 'pending', 'archived'];
const cardTypes = ['Todos', 'basic', 'basic_reversed', 'multiple_choice', 'true_false', 'cloze', 'type_answer', 'image_occlusion'];

export default function IndividualFlashcards() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState(initialFlashcards);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Todas');
  };

  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.front?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.statement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || card.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'Todas' || card.subcategory === selectedSubcategory;
    const matchesDifficulty = selectedDifficulty === 'Todos' || card.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'Todos' || card.status === selectedStatus;
    const matchesType = selectedType === 'Todos' || card.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesDifficulty && matchesStatus && matchesType;
  });

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
      active: { label: 'ATIVO', color: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300' },
      pending: { label: 'PENDENTE', color: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      archived: { label: 'ARQUIVADO', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    };
    
    const statusConfig = config[status as keyof typeof config];
    return (
      <Badge className={`${statusConfig.color} font-police-body font-semibold uppercase tracking-wider`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const handleCreateCard = () => {
    navigate('/admin/flashcards/cards/new');
  };

  const handleEditCard = (cardId: number) => {
    // Implementar edição inline ou modal
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      const newFront = prompt('Editar pergunta:', card.front || card.question || card.statement || card.text);
      if (newFront !== null) {
        const newBack = prompt('Editar resposta:', card.back || card.answer?.toString() || 'Nova resposta');
        if (newBack !== null) {
          setFlashcards(flashcards.map(c => 
            c.id === cardId 
              ? { ...c, front: newFront, back: newBack, question: newFront, answer: newBack }
              : c
          ));
          toast.success('Flashcard atualizado com sucesso!', {
            duration: 3000,
            icon: '✏️'
          });
        }
      }
    }
  };

  const handleDeleteCard = (cardId: number) => {
    if (confirm('Tem certeza que deseja arquivar este flashcard?')) {
      setFlashcards(flashcards.map(card => 
        card.id === cardId ? { ...card, status: 'archived' } : card
      ));
      toast.success('Flashcard arquivado com sucesso', {
        duration: 3000,
        icon: '📦'
      });
    }
  };

  const handleDuplicateCard = (cardId: number) => {
    const originalCard = flashcards.find(c => c.id === cardId);
    if (originalCard) {
      const duplicatedCard = {
        ...originalCard,
        id: Math.max(...flashcards.map(c => c.id)) + 1,
        front: originalCard.front ? `${originalCard.front} (CÓPIA)` : originalCard.front,
        question: originalCard.question ? `${originalCard.question} (CÓPIA)` : originalCard.question,
        statement: originalCard.statement ? `${originalCard.statement} (CÓPIA)` : originalCard.statement,
        createdAt: new Date().toISOString().split('T')[0],
        lastReview: null,
        reviews: 0,
        correctCount: 0,
        status: 'pending',
        nextReview: new Date(Date.now() + 86400000).toISOString().split('T')[0]
      };
      
      setFlashcards([...flashcards, duplicatedCard]);
      toast.success(`Flashcard "${getCardPreview(originalCard).substring(0, 30)}..." duplicado com sucesso`, {
        duration: 3000,
        icon: '📋'
      });
    }
  };

  const handleStudyCard = (cardId: number) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      setStudyCards([card]);
      setShowStudyModal(true);
    }
  };

  const handlePreviewCard = (cardId: number) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      setSelectedCard(card);
      setShowPreviewModal(true);
    }
  };

  const handleStudyComplete = (results: any) => {
    console.log('Study session completed:', results);
    toast.success(`Sessão concluída! ${results.correct}/${results.totalCards} acertos (${results.accuracy}%)`, {
      duration: 4000,
      icon: '🎯'
    });
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

  const handleBulkDuplicate = () => {
    if (selectedCards.length > 0) {
      selectedCards.forEach(cardId => handleDuplicateCard(cardId));
      setSelectedCards([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkArchive = () => {
    if (selectedCards.length > 0 && confirm(`Tem certeza que deseja arquivar ${selectedCards.length} flashcards?`)) {
      setFlashcards(flashcards.map(card => 
        selectedCards.includes(card.id) ? { ...card, status: 'archived' } : card
      ));
      toast.success(`${selectedCards.length} flashcards arquivados com sucesso`, {
        duration: 3000,
        icon: '📦'
      });
      setSelectedCards([]);
      setShowBulkActions(false);
    }
  };

  const handleSelectCard = (id: number) => {
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

  const getCardPreview = (card: any) => {
    switch (card.type) {
      case 'basic':
      case 'basic_reversed':
        return card.front;
      case 'multiple_choice':
        return card.question;
      case 'true_false':
        return card.statement;
      case 'cloze':
        return card.text.replace(/{{c\d+::(.*?)}}/g, '[$1]');
      case 'type_answer':
        return card.question;
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
                  {flashcards.length}
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
                  {flashcards.filter(c => c.status === 'active').length}
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
                  {flashcards.reduce((acc, card) => acc + card.reviews, 0)}
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
                  {Math.round(
                    (flashcards.reduce((acc, card) => acc + card.correctCount, 0) / 
                     flashcards.reduce((acc, card) => acc + card.reviews, 0)) * 100
                  ) || 0}%
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
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR NO ARSENAL INTEL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  OPERAÇÕES EM GRUPO
                </Button>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={selectedCategory === 'Todos'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedCategory === 'Todos' ? (
                    <option>SUBCATEGORIA</option>
                  ) : (
                    materias[selectedCategory]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory.toUpperCase()}</option>
                    ))
                  )}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  <option value="Todos">TIPO</option>
                  {cardTypes.slice(1).map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'Todos' ? 'DIFICULDADE' : difficulty.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'Todos' ? 'STATUS' : status.toUpperCase()}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todos');
                    setSelectedSubcategory('Todas');
                    setSelectedType('Todos');
                    setSelectedDifficulty('Todos');
                    setSelectedStatus('Todos');
                  }}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  LIMPAR
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
                        checked={selectedCards.length === filteredCards.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white font-police-body font-medium uppercase tracking-wider">
                        SELECIONAR ARSENAL ({selectedCards.length})
                      </span>
                    </label>
                    
                    {selectedCards.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkStudy}
                          className="gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          EXECUTAR MISSÃO
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkDuplicate}
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          REPLICAR
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleBulkArchive}
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          DESARMAR
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cards Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
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
                      {card.reviews}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ALVOS
                    </p>
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {card.correctCount}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      PRECISÃO
                    </p>
                    <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                      {card.reviews > 0 ? Math.round((card.correctCount / card.reviews) * 100) : 0}%
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
                    <p className="uppercase tracking-wider">{card.author}</p>
                    {card.lastReview && (
                      <p className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(card.lastReview).toLocaleDateString('pt-BR')}
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
                            <span className="uppercase tracking-wider">{card.author}</span>
                            {card.lastReview && (
                              <span className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(card.lastReview).toLocaleDateString('pt-BR')}
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

      {/* Empty State */}
      {filteredCards.length === 0 && (
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