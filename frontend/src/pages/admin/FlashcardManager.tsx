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
  Play,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Mock data para demonstração
const flashcardDecks = [
  {
    id: 1,
    title: 'ARTIGOS - CÓDIGO PENAL MILITAR',
    description: 'Memorização dos principais artigos do CPM para concursos policiais',
    category: 'DIREITO',
    subcategory: 'Penal Militar',
    totalCards: 150,
    completedCards: 87,
    isPublic: true,
    tags: ['CPM', 'ARTIGOS', 'MILITAR'],
    author: 'Major Silva',
    createdAt: '2024-01-15',
    lastReview: '2024-01-20',
    difficulty: 'medium',
    reviews: 234,
    rating: 4.8
  },
  {
    id: 2,
    title: 'SIGLAS E TERMINOLOGIAS TÁTICAS',
    description: 'Siglas operacionais e terminologias usadas em operações especiais',
    category: 'SEGURANÇA PÚBLICA',
    subcategory: 'Operações Táticas',
    totalCards: 200,
    completedCards: 145,
    isPublic: true,
    tags: ['SIGLAS', 'TÁTICO', 'OPERACIONAL'],
    author: 'Capitão Rodrigues',
    createdAt: '2024-01-10',
    lastReview: '2024-01-19',
    difficulty: 'easy',
    reviews: 456,
    rating: 4.9
  },
  {
    id: 3,
    title: 'CONSTITUIÇÃO FEDERAL - ARTIGOS FUNDAMENTAIS',
    description: 'Art. 1º ao 5º da CF/88 com foco em concursos',
    category: 'DIREITO',
    subcategory: 'Constitucional',
    totalCards: 80,
    completedCards: 80,
    isPublic: false,
    tags: ['CF88', 'CONSTITUCIONAL', 'FUNDAMENTAIS'],
    author: 'Tenente Costa',
    createdAt: '2024-01-08',
    lastReview: '2024-01-18',
    difficulty: 'hard',
    reviews: 123,
    rating: 4.7
  },
  {
    id: 4,
    title: 'PROCEDIMENTOS OPERACIONAIS PADRÃO',
    description: 'POPs essenciais para atuação policial',
    category: 'SEGURANÇA PÚBLICA',
    subcategory: 'Procedimentos',
    totalCards: 120,
    completedCards: 0,
    isPublic: true,
    tags: ['POP', 'PROCEDIMENTOS', 'OPERACIONAL'],
    author: 'Sargento Lima',
    createdAt: '2024-01-05',
    lastReview: null,
    difficulty: 'medium',
    reviews: 0,
    rating: 0
  }
];

// Categorias e subcategorias
const materias: { [key: string]: string[] } = {
  'DIREITO': ['Todas', 'Constitucional', 'Administrativo', 'Penal', 'Penal Militar', 'Processual'],
  'SEGURANÇA PÚBLICA': ['Todas', 'Operações Táticas', 'Procedimentos', 'Legislação Policial', 'Inteligência'],
  'CONHECIMENTOS GERAIS': ['Todas', 'História Militar', 'Geografia', 'Atualidades', 'Informática']
};

const categories = ['Todos', ...Object.keys(materias)];
const difficulties = ['Todos', 'easy', 'medium', 'hard'];

export default function FlashcardManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Todas');
  };

  const filteredDecks = flashcardDecks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || deck.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'Todas' || deck.subcategory === selectedSubcategory;
    const matchesDifficulty = selectedDifficulty === 'Todos' || deck.difficulty === selectedDifficulty;
    const matchesPublic = !showPublicOnly || deck.isPublic;
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesDifficulty && matchesPublic;
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

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleCreateDeck = () => {
    navigate('/admin/flashcards/new');
  };

  const handleEditDeck = (deckId: number) => {
    navigate(`/admin/flashcards/${deckId}/edit`);
  };

  const handleManageCards = (deckId: number) => {
    navigate(`/admin/flashcards/${deckId}/cards`);
  };

  const handleDeleteDeck = (deckId: number) => {
    if (confirm('Tem certeza que deseja arquivar este deck?')) {
      toast.success('Deck arquivado com sucesso', {
        duration: 3000,
        icon: '📦'
      });
    }
  };

  const handlePreviewDeck = (deckId: number) => {
    toast.success('Abrindo preview do deck...', {
      duration: 2000,
      icon: '👁️'
    });
  };

  const handlePlayDeck = (deckId: number) => {
    navigate(`/admin/flashcards/${deckId}/study`);
    toast.success('Iniciando estudo do deck...', {
      duration: 2000,
      icon: '🎯'
    });
  };

  const handleDuplicateDeck = (deckId: number) => {
    const originalDeck = flashcardDecks.find(d => d.id === deckId);
    toast.success(`Deck "${originalDeck?.title}" duplicado com sucesso`, {
      duration: 3000,
      icon: '📋'
    });
  };

  const handleSelectDeck = (id: number) => {
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
              CENTRAL TÁTICA - FLASHCARDS
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
            GESTÃO DE DECKS - COLEÇÕES ORGANIZADAS DE FLASHCARDS
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
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TOTAL DE DECKS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  CARTÕES ATIVOS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.reduce((acc, deck) => acc + deck.totalCards, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                <Crosshair className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  TAXA DE CONCLUSÃO
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {Math.round(
                    (flashcardDecks.reduce((acc, deck) => acc + deck.completedCards, 0) / 
                     flashcardDecks.reduce((acc, deck) => acc + deck.totalCards, 0)) * 100
                  )}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  REVISÕES TOTAIS
                </p>
                <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.reduce((acc, deck) => acc + deck.reviews, 0).toLocaleString()}
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
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCAR DECKS TÁTICOS..."
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
                  AÇÕES EM LOTE
                </Button>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <option>SELECIONE CATEGORIA</option>
                  ) : (
                    materias[selectedCategory]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory.toUpperCase()}</option>
                    ))
                  )}
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

                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPublicOnly}
                    onChange={(e) => setShowPublicOnly(e.target.checked)}
                    className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-police-body uppercase tracking-wider">
                    PÚBLICOS
                  </span>
                </label>
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
                      <span className="text-sm text-gray-900 dark:text-white font-police-body font-medium uppercase tracking-wider">
                        SELECIONAR TODOS ({selectedDecks.length})
                      </span>
                    </label>
                    
                    {selectedDecks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          TORNAR PÚBLICO
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          DUPLICAR SELECIONADOS
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          ARQUIVAR SELECIONADOS
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

      {/* Decks Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
      >
        {filteredDecks.map((deck) => 
          viewMode === 'grid' ? (
            <Card key={deck.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider line-clamp-2">
                    {deck.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mt-1 line-clamp-2">
                    {deck.description}
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
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    PROGRESSO
                  </span>
                  <span className="font-police-numbers font-semibold text-gray-900 dark:text-white">
                    {deck.completedCards}/{deck.totalCards} CARTÕES
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-accent-500 h-2 rounded-full transition-all" 
                    style={{ width: `${getCompletionPercentage(deck.completedCards, deck.totalCards)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-police-numbers">
                  {getCompletionPercentage(deck.completedCards, deck.totalCards)}% COMPLETO
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    REVISÕES
                  </p>
                  <p className="text-lg font-police-numbers font-bold text-gray-900 dark:text-white">
                    {deck.reviews}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    {deck.isPublic ? (
                      <Globe className="w-4 h-4 text-accent-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {deck.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                  <p className="uppercase tracking-wider">{deck.author}</p>
                  {deck.lastReview && (
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(deck.lastReview).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePlayDeck(deck.id)}
                    className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                    title="Estudar Deck"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePreviewDeck(deck.id)}
                    className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                    title="Preview do Deck"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleManageCards(deck.id)}
                    className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                    title="Gerenciar Cartões"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditDeck(deck.id)}
                    className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                    title="Editar Deck"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateDeck(deck.id)}
                    className="p-1.5 text-gray-600 hover:text-accent-500 dark:text-gray-400 dark:hover:text-accent-500 transition-colors"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
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
            <Card key={deck.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
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
                          <h3 className="text-lg font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {deck.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mt-1">
                            {deck.description}
                          </p>
                          
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
                            {deck.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {deck.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600">
                                +{deck.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => handlePlayDeck(deck.id)}
                            className="gap-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            ESTUDAR
                          </Button>
                          
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

      {/* Empty State */}
      {filteredDecks.length === 0 && (
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
    </div>
  );
}