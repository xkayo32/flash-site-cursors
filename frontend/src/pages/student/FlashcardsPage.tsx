import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  tags: string[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  createdAt: string;
  srsData: {
    interval: number; // dias até próxima revisão
    repetitions: number; // número de repetições
    easeFactor: number; // fator de facilidade (1.3 - 2.5)
    nextReview: string; // data da próxima revisão
    lastReviewed?: string;
    quality?: number; // última qualidade da resposta (0-5)
  };
  stats: {
    totalReviews: number;
    correctReviews: number;
    streak: number;
    averageTime: number; // em segundos
  };
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
}

interface StudySession {
  deckId: string;
  startedAt: string;
  cardsStudied: number;
  averageTime: number;
  accuracy: number;
  isActive: boolean;
}

// Dados mockados
const mockDecks: FlashcardDeck[] = [
  {
    id: '1',
    name: 'Direito Constitucional - Direitos Fundamentais',
    description: 'Flashcards sobre os direitos e garantias fundamentais da CF/88',
    subject: 'Direito Constitucional',
    totalCards: 156,
    dueCards: 23,
    newCards: 12,
    color: 'bg-blue-500',
    createdAt: '2024-01-10',
    lastStudied: '2024-01-18'
  },
  {
    id: '2',
    name: 'Direito Penal - Crimes contra a Administração',
    description: 'Conceitos e tipificações dos crimes contra a administração pública',
    subject: 'Direito Penal',
    totalCards: 89,
    dueCards: 15,
    newCards: 8,
    color: 'bg-red-500',
    createdAt: '2024-01-08',
    lastStudied: '2024-01-17'
  },
  {
    id: '3',
    name: 'Informática - Segurança da Informação',
    description: 'Conceitos fundamentais de segurança da informação',
    subject: 'Informática',
    totalCards: 67,
    dueCards: 31,
    newCards: 5,
    color: 'bg-green-500',
    createdAt: '2024-01-05',
    lastStudied: '2024-01-16'
  },
  {
    id: '4',
    name: 'Português - Concordância Verbal',
    description: 'Regras de concordância verbal e casos especiais',
    subject: 'Português',
    totalCards: 45,
    dueCards: 8,
    newCards: 18,
    color: 'bg-purple-500',
    createdAt: '2024-01-12'
  }
];

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'O que são direitos fundamentais de primeira geração?',
    back: 'São os direitos civis e políticos, também chamados de direitos de liberdade. Incluem direito à vida, liberdade, propriedade, liberdade de expressão, direito ao voto, etc. Surgiram no século XVIII com as revoluções liberais.',
    subject: 'Direito Constitucional',
    tags: ['direitos fundamentais', 'gerações de direitos', 'liberdades'],
    difficulty: 'Médio',
    createdAt: '2024-01-10',
    srsData: {
      interval: 3,
      repetitions: 2,
      easeFactor: 2.2,
      nextReview: '2024-01-21',
      lastReviewed: '2024-01-18',
      quality: 4
    },
    stats: {
      totalReviews: 5,
      correctReviews: 4,
      streak: 2,
      averageTime: 12
    }
  },
  {
    id: '2',
    front: 'Defina o crime de corrupção passiva.',
    back: 'Art. 317 do CP - Solicitar ou receber, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida, ou aceitar promessa de tal vantagem. Pena: reclusão de 2 a 12 anos e multa.',
    subject: 'Direito Penal',
    tags: ['corrupção passiva', 'crimes contra administração'],
    difficulty: 'Difícil',
    createdAt: '2024-01-08',
    srsData: {
      interval: 1,
      repetitions: 1,
      easeFactor: 1.8,
      nextReview: '2024-01-19',
      lastReviewed: '2024-01-18',
      quality: 2
    },
    stats: {
      totalReviews: 3,
      correctReviews: 1,
      streak: 0,
      averageTime: 18
    }
  }
];

// Estatísticas gerais
const studyStats = {
  totalCards: 357,
  dueToday: 77,
  newCards: 43,
  dailyStreak: 12,
  totalStudyTime: 1240, // minutos
  averageAccuracy: 78.5,
  cardsStudiedToday: 45,
  timeStudiedToday: 32 // minutos
};

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'study' | 'create' | 'stats'>('overview');
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  // Filtrar decks
  const filteredDecks = mockDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || deck.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['all', ...new Set(mockDecks.map(deck => deck.subject))];

  // Algoritmo SRS (Simplified)
  const calculateNextReview = (quality: number, card: Flashcard) => {
    const { interval, repetitions, easeFactor } = card.srsData;
    
    let newInterval = interval;
    let newRepetitions = repetitions;
    let newEaseFactor = easeFactor;

    if (quality >= 3) {
      // Resposta correta
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      newRepetitions = repetitions + 1;
    } else {
      // Resposta incorreta - reinicia
      newRepetitions = 0;
      newInterval = 1;
    }

    // Ajusta o fator de facilidade
    newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview: nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      quality
    };
  };

  const handleAnswer = (quality: number) => {
    if (!currentCard) return;

    // Simula atualização do card com SRS
    const updatedSRS = calculateNextReview(quality, currentCard);
    console.log('Card updated with SRS:', updatedSRS);

    // Próximo card (aqui você buscaria o próximo card do deck)
    setShowAnswer(false);
    setCurrentCard(null);
    
    // Atualiza estatísticas da sessão
    if (studySession) {
      setStudySession({
        ...studySession,
        cardsStudied: studySession.cardsStudied + 1
      });
    }
  };

  const startStudySession = (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setStudySession({
      deckId: deck.id,
      startedAt: new Date().toISOString(),
      cardsStudied: 0,
      averageTime: 0,
      accuracy: 0,
      isActive: true
    });
    setCurrentCard(mockFlashcards[0]); // Simula carregamento do primeiro card
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

  const DeckCard = ({ deck }: { deck: FlashcardDeck }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", deck.color)}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <Badge variant="secondary">{deck.subject}</Badge>
          </div>

          <h3 className="font-bold text-lg text-primary-900 mb-2 line-clamp-2">
            {deck.name}
          </h3>
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {deck.description}
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-primary-900">{deck.totalCards}</div>
              <div className="text-primary-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{deck.dueCards}</div>
              <div className="text-primary-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{deck.newCards}</div>
              <div className="text-primary-600">Novos</div>
            </div>
          </div>

          {/* Data do último estudo */}
          {deck.lastStudied && (
            <p className="text-xs text-primary-500 mb-4">
              Último estudo: {new Date(deck.lastStudied).toLocaleDateString('pt-BR')}
            </p>
          )}

          {/* Botão de estudo */}
          <Button
            onClick={() => startStudySession(deck)}
            className="w-full gap-2"
            disabled={deck.dueCards === 0 && deck.newCards === 0}
          >
            <Play className="w-4 h-4" />
            {deck.dueCards > 0 ? `Estudar (${deck.dueCards + deck.newCards})` : 'Sem cards pendentes'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StudyCard = ({ card }: { card: Flashcard }) => (
    <div className="max-w-2xl mx-auto">
      <Card className="min-h-[400px]">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{card.subject}</Badge>
            <Badge 
              className={cn(
                card.difficulty === 'Fácil' && "bg-green-100 text-green-700",
                card.difficulty === 'Médio' && "bg-yellow-100 text-yellow-700",
                card.difficulty === 'Difícil' && "bg-red-100 text-red-700"
              )}
            >
              {card.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">
                {showAnswer ? 'Resposta:' : 'Pergunta:'}
              </h3>
              <motion.div
                key={showAnswer ? 'answer' : 'question'}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 min-h-[200px] flex items-center justify-center"
              >
                <p className="text-lg leading-relaxed">
                  {showAnswer ? card.back : card.front}
                </p>
              </motion.div>
            </div>

            {!showAnswer ? (
              <Button 
                onClick={() => setShowAnswer(true)}
                className="gap-2"
                size="lg"
              >
                <Eye className="w-5 h-5" />
                Mostrar Resposta
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Como foi sua resposta?
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleAnswer(1)}
                    variant="outline"
                    className="flex-col h-auto p-3 border-red-200 hover:border-red-300"
                  >
                    <XCircle className="w-6 h-6 text-red-500 mb-1" />
                    <span className="text-sm">Errei</span>
                  </Button>
                  <Button
                    onClick={() => handleAnswer(2)}
                    variant="outline"
                    className="flex-col h-auto p-3 border-orange-200 hover:border-orange-300"
                  >
                    <AlertTriangle className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-sm">Difícil</span>
                  </Button>
                  <Button
                    onClick={() => handleAnswer(4)}
                    variant="outline"
                    className="flex-col h-auto p-3 border-blue-200 hover:border-blue-300"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-sm">Bom</span>
                  </Button>
                  <Button
                    onClick={() => handleAnswer(5)}
                    variant="outline"
                    className="flex-col h-auto p-3 border-green-200 hover:border-green-300"
                  >
                    <Star className="w-6 h-6 text-green-500 mb-1" />
                    <span className="text-sm">Fácil</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Flashcards</h1>
            <p className="text-primary-600">
              Sistema de repetição espaçada para memorização eficiente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              {studyStats.dailyStreak} dias seguidos
            </Badge>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Cards pendentes hoje</p>
                  <p className="text-2xl font-bold text-red-600">{studyStats.dueToday}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Cards novos</p>
                  <p className="text-2xl font-bold text-green-600">{studyStats.newCards}</p>
                </div>
                <Plus className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Estudados hoje</p>
                  <p className="text-2xl font-bold text-blue-600">{studyStats.cardsStudiedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Tempo hoje</p>
                  <p className="text-2xl font-bold text-purple-600">{formatTime(studyStats.timeStudiedToday)}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de navegação */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'overview', label: 'Visão Geral', icon: BookOpen },
            { key: 'study', label: 'Estudar', icon: Brain },
            { key: 'create', label: 'Criar', icon: Plus },
            { key: 'stats', label: 'Estatísticas', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  activeTab === tab.key 
                    ? "bg-primary-600 text-white shadow-lg" 
                    : "bg-white text-primary-600 hover:bg-primary-50"
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
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="text"
                      placeholder="Buscar decks de flashcards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject === 'all' ? 'Todas as matérias' : subject}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Deck
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid de decks */}
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDecks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Nenhum deck encontrado
                </h3>
                <p className="text-primary-600 mb-6">
                  Crie seu primeiro deck de flashcards para começar a estudar
                </p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar primeiro deck
                </Button>
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
                {/* Header da sessão */}
                {studySession && (
                  <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-primary-900">
                          {selectedDeck?.name}
                        </h3>
                        <p className="text-sm text-primary-600">
                          Cards estudados: {studySession.cardsStudied}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab('overview');
                          setStudySession(null);
                          setCurrentCard(null);
                          setShowAnswer(false);
                        }}
                      >
                        Encerrar sessão
                      </Button>
                    </div>
                  </div>
                )}

                <StudyCard card={currentCard} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  Selecione um deck para estudar
                </h3>
                <p className="text-primary-600 mb-6">
                  Volte para a visão geral e escolha um deck para começar
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  Ver decks disponíveis
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
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-primary-900">Criar Novo Flashcard</h3>
                <p className="text-primary-600">
                  Adicione um novo flashcard ao seu deck de estudos
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Frente do Card
                  </label>
                  <textarea
                    placeholder="Digite a pergunta ou conceito..."
                    className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Verso do Card
                  </label>
                  <textarea
                    placeholder="Digite a resposta ou explicação..."
                    className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Matéria
                    </label>
                    <select className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Direito Constitucional</option>
                      <option>Direito Penal</option>
                      <option>Informática</option>
                      <option>Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Dificuldade
                    </label>
                    <select className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Fácil</option>
                      <option>Médio</option>
                      <option>Difícil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: direitos fundamentais, liberdades, CF88"
                    className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Flashcard
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Visualizar
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
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-primary-900">Estatísticas Gerais</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{studyStats.totalCards}</div>
                      <div className="text-sm text-blue-600">Total de Cards</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{studyStats.averageAccuracy}%</div>
                      <div className="text-sm text-green-600">Precisão Média</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formatTime(studyStats.totalStudyTime)}</div>
                      <div className="text-sm text-purple-600">Tempo Total</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{studyStats.dailyStreak}</div>
                      <div className="text-sm text-orange-600">Dias Consecutivos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progresso por matéria */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-primary-900">Progresso por Matéria</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.slice(1).map((subject, index) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{subject}</span>
                          <span className="text-sm text-gray-500">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.floor(Math.random() * 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-primary-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Brain className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2">
          Maximize sua memória com SRS
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          O sistema de repetição espaçada otimiza seu tempo de estudo, mostrando os cards no momento ideal para fixação
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" size="lg" onClick={() => setActiveTab('create')}>
            Criar Flashcards
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-700">
            Saiba mais sobre SRS
          </Button>
        </div>
      </motion.div>
    </div>
  );
}