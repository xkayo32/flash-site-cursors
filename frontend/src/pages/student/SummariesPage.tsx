import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  BookOpen,
  Brain,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Play,
  Plus,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface Summary {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  author: string;
  readingTime: number; // em minutos
  difficulty: 'RECRUTA' | 'CABO' | 'SARGENTO';
  tags: string[];
  stats: {
    views: number;
    rating: number;
    flashcards: number;
    questions: number;
  };
  lastUpdated: string;
  progress?: number;
  isFavorite?: boolean;
  content?: {
    sections: SummarySection[];
  };
}

interface SummarySection {
  id: string;
  title: string;
  content: string;
  embeddedItems?: EmbeddedItem[];
}

interface EmbeddedItem {
  id: string;
  type: 'flashcard' | 'question';
  position: number; // posição no texto
  data: any; // dados do flashcard ou questão
}

// Dados mockados
const mockSummaries: Summary[] = [
  {
    id: '1',
    title: 'Direitos Fundamentais - Teoria Geral e Classificação',
    description: 'Resumo completo sobre a teoria geral dos direitos fundamentais, suas gerações, características e aplicabilidade.',
    subject: 'DIREITO CONSTITUCIONAL TÁTICO',
    topic: 'Direitos e Garantias Fundamentais',
    author: 'Prof. Carlos Mendez',
    readingTime: 25,
    difficulty: 'CABO',
    tags: ['CF/88', 'Direitos Fundamentais', 'Gerações de Direitos'],
    stats: {
      views: 3456,
      rating: 4.8,
      flashcards: 15,
      questions: 12
    },
    lastUpdated: '2024-01-15',
    progress: 65,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Crimes contra a Administração Pública',
    description: 'Análise detalhada dos crimes funcionais, incluindo corrupção, peculato, concussão e prevaricação.',
    subject: 'DIREITO PENAL OPERACIONAL',
    topic: 'Parte Especial',
    author: 'Prof. Ana Silva',
    readingTime: 30,
    difficulty: 'SARGENTO',
    tags: ['Código Penal', 'Crimes Funcionais', 'Administração Pública'],
    stats: {
      views: 2890,
      rating: 4.9,
      flashcards: 20,
      questions: 18
    },
    lastUpdated: '2024-01-18',
    progress: 30
  },
  {
    id: '3',
    title: 'Princípios da Administração Pública - LIMPE',
    description: 'Estudo aprofundado dos princípios constitucionais da administração pública com exemplos práticos.',
    subject: 'DIREITO ADMINISTRATIVO',
    topic: 'Princípios Administrativos',
    author: 'Prof. Roberto Lima',
    readingTime: 20,
    difficulty: 'RECRUTA',
    tags: ['LIMPE', 'Art. 37 CF', 'Princípios'],
    stats: {
      views: 5123,
      rating: 4.7,
      flashcards: 10,
      questions: 8
    },
    lastUpdated: '2024-01-20',
    progress: 100,
    isFavorite: true
  },
  {
    id: '4',
    title: 'Segurança da Informação - Conceitos e Práticas',
    description: 'Resumo sobre os pilares da segurança da informação, criptografia, protocolos e melhores práticas.',
    subject: 'Informática',
    topic: 'Segurança',
    author: 'Prof. Tech Masters',
    readingTime: 35,
    difficulty: 'CABO',
    tags: ['Criptografia', 'Protocolos', 'Firewall', 'VPN'],
    stats: {
      views: 1876,
      rating: 4.6,
      flashcards: 25,
      questions: 15
    },
    lastUpdated: '2024-01-12'
  },
  {
    id: '5',
    title: 'Concordância Verbal e Nominal - Regras e Exceções',
    description: 'Guia completo sobre concordância verbal e nominal com casos especiais e pegadinhas de concursos.',
    subject: 'Português',
    topic: 'Gramática',
    author: 'Prof. Maria Santos',
    readingTime: 40,
    difficulty: 'CABO',
    tags: ['Concordância', 'Gramática', 'Sintaxe'],
    stats: {
      views: 4321,
      rating: 4.8,
      flashcards: 30,
      questions: 22
    },
    lastUpdated: '2024-01-19'
  }
];

// Conteúdo de exemplo para um resumo
const exampleContent: SummarySection[] = [
  {
    id: '1',
    title: 'Introdução aos Direitos Fundamentais',
    content: `Os direitos fundamentais são prerrogativas básicas que garantem a dignidade da pessoa humana e limitam o poder estatal. 
    
    São características dos direitos fundamentais:
    • Universalidade: aplicam-se a todos
    • Inalienabilidade: não podem ser vendidos
    • Imprescritibilidade: não se perdem com o tempo
    • Irrenunciabilidade: não se pode abrir mão deles`,
    embeddedItems: [
      {
        id: 'f1',
        type: 'flashcard',
        position: 1,
        data: {
          front: 'O que são direitos fundamentais?',
          back: 'Prerrogativas básicas que garantem a dignidade humana e limitam o poder estatal.'
        }
      }
    ]
  },
  {
    id: '2',
    title: 'Gerações dos Direitos Fundamentais',
    content: `A doutrina classifica os direitos fundamentais em gerações:

    1ª Geração - Liberdade: Direitos civis e políticos
    2ª Geração - Igualdade: Direitos sociais, econômicos e culturais
    3ª Geração - Fraternidade: Direitos difusos e coletivos`,
    embeddedItems: [
      {
        id: 'q1',
        type: 'question',
        position: 2,
        data: {
          question: 'Qual geração de direitos fundamentais está relacionada aos direitos sociais?',
          options: ['1ª Geração', '2ª Geração', '3ª Geração', '4ª Geração'],
          correct: 1
        }
      }
    ]
  }
];

const subjects = ['Todos', 'Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Informática', 'Português'];
const difficulties = ['Todos', 'Básico', 'Intermediário', 'Avançado'];

export default function SummariesPage() {
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'reading'>('grid');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showFlashcardAnswers, setShowFlashcardAnswers] = useState<{ [key: string]: boolean }>({});

  // Filtrar resumos
  const filteredSummaries = mockSummaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'Todos' || summary.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'Todos' || summary.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  // Toggle seção expandida
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Toggle resposta do flashcard
  const toggleFlashcardAnswer = (flashcardId: string) => {
    setShowFlashcardAnswers(prev => ({
      ...prev,
      [flashcardId]: !prev[flashcardId]
    }));
  };

  // Card de resumo
  const SummaryCard = ({ summary }: { summary: Summary }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{summary.subject}</Badge>
                <Badge 
                  className={cn(
                    summary.difficulty === 'Básico' && "bg-green-100 text-green-700",
                    summary.difficulty === 'Intermediário' && "bg-yellow-100 text-yellow-700",
                    summary.difficulty === 'Avançado' && "bg-red-100 text-red-700"
                  )}
                >
                  {summary.difficulty}
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg text-primary-900 mb-2 line-clamp-2">
                {summary.title}
              </h3>
            </div>
            
            <button
              onClick={() => {
                // Toggle favorite
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Star 
                className={cn(
                  "w-5 h-5",
                  summary.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                )}
              />
            </button>
          </div>

          {/* Descrição */}
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {summary.description}
          </p>

          {/* Metadados */}
          <div className="flex items-center gap-4 text-sm text-primary-600 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {summary.readingTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {summary.stats.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              {summary.stats.rating}
            </span>
          </div>

          {/* Conteúdo embutido */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-700">
                <Brain className="w-4 h-4" />
                <span className="font-semibold">{summary.stats.flashcards}</span>
              </div>
              <p className="text-xs text-blue-600">Flashcards</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-700">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{summary.stats.questions}</span>
              </div>
              <p className="text-xs text-purple-600">Questões</p>
            </div>
          </div>

          {/* Progresso */}
          {summary.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary-600">Progresso</span>
                <span className="font-medium text-primary-900">{summary.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    summary.progress === 100 ? "bg-green-500" :
                    summary.progress >= 50 ? "bg-blue-500" :
                    "bg-yellow-500"
                  )}
                  style={{ width: `${summary.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2"
              onClick={() => {
                setSelectedSummary(summary);
                setViewMode('reading');
              }}
            >
              <BookOpen className="w-4 h-4" />
              {summary.progress ? 'Continuar' : 'Começar'}
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Autor e data */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-primary-500">
            <span>{summary.author}</span>
            <span>Atualizado em {new Date(summary.lastUpdated).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Componente de leitura
  const ReadingView = ({ summary }: { summary: Summary }) => (
    <div className="max-w-4xl mx-auto">
      {/* Header do resumo */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className="mb-4 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{summary.subject}</Badge>
                <Badge>{summary.topic}</Badge>
                <Badge 
                  className={cn(
                    summary.difficulty === 'Básico' && "bg-green-100 text-green-700",
                    summary.difficulty === 'Intermediário' && "bg-yellow-100 text-yellow-700",
                    summary.difficulty === 'Avançado' && "bg-red-100 text-red-700"
                  )}
                >
                  {summary.difficulty}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                {summary.title}
              </h1>
              
              <p className="text-primary-600 mb-4">
                {summary.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-primary-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {summary.readingTime} min de leitura
                </span>
                <span>{summary.author}</span>
                <span>Atualizado em {new Date(summary.lastUpdated).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do resumo */}
      <div className="space-y-6">
        {exampleContent.map((section) => (
          <Card key={section.id}>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary-900">
                  {section.title}
                </h2>
                {expandedSections.includes(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-primary-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary-600" />
                )}
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0">
                    <div className="prose prose-primary max-w-none">
                      <p className="whitespace-pre-line mb-4">
                        {section.content}
                      </p>
                      
                      {/* Items embutidos */}
                      {section.embeddedItems?.map((item) => (
                        <div key={item.id} className="my-4">
                          {item.type === 'flashcard' ? (
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Brain className="w-5 h-5 text-blue-600 mt-1" />
                                  <div className="flex-1">
                                    <p className="font-medium text-blue-900 mb-2">
                                      Flashcard
                                    </p>
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-sm font-medium text-blue-700 mb-1">Pergunta:</p>
                                        <p className="text-blue-800">
                                          {item.data.front}
                                        </p>
                                      </div>
                                      
                                      <AnimatePresence>
                                        {showFlashcardAnswers[item.id] && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-blue-200 pt-3"
                                          >
                                            <p className="text-sm font-medium text-blue-700 mb-1">Resposta:</p>
                                            <p className="text-blue-800 bg-white/50 p-3 rounded">
                                              {item.data.back}
                                            </p>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                      
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => toggleFlashcardAnswer(item.id)}
                                      >
                                        {showFlashcardAnswers[item.id] ? (
                                          <>
                                            <EyeOff className="w-4 h-4 mr-1" />
                                            Ocultar resposta
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver resposta
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="bg-purple-50 border-purple-200">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <FileText className="w-5 h-5 text-purple-600 mt-1" />
                                  <div className="flex-1">
                                    <p className="font-medium text-purple-900 mb-2">
                                      Questão
                                    </p>
                                    <p className="text-purple-800 mb-3">
                                      {item.data.question}
                                    </p>
                                    <div className="space-y-2">
                                      {item.data.options.map((option: string, idx: number) => (
                                        <button
                                          key={idx}
                                          className="w-full text-left p-2 rounded bg-white hover:bg-purple-100 transition-colors text-sm"
                                        >
                                          {String.fromCharCode(65 + idx)}) {option}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Barra de progresso fixa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-primary-600">
              Progresso: <span className="font-medium text-primary-900">65%</span>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Marcar como concluído
            </Button>
            <Button size="sm" className="gap-2">
              Próxima seção
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {viewMode === 'grid' ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2 font-police-title uppercase tracking-wider">BRIEFINGS TÁTICOS</h1>
                <p className="text-primary-600">
                  CONTEÚXTO DIDÁTICO COM FLASHCARDS E QUESTÕES INCORPORADOS
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <FileText className="w-5 h-5 mr-2" />
                  {mockSummaries.length} resumos
                </Badge>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Resumos lidos</p>
                      <p className="text-2xl font-bold text-primary-900">12</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Em progresso</p>
                      <p className="text-2xl font-bold text-primary-900">3</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Tempo de leitura</p>
                      <p className="text-2xl font-bold text-primary-900">18h</p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Itens resolvidos</p>
                      <p className="text-2xl font-bold text-primary-900">234</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra de busca e filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Buscar resumos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Grid de resumos */}
          {filteredSummaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Nenhum resumo encontrado
              </h3>
              <p className="text-primary-600 mb-6">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedSubject('Todos');
                setSelectedDifficulty('Todos');
              }}>
                Limpar filtros
              </Button>
            </Card>
          )}
        </>
      ) : (
        selectedSummary && <ReadingView summary={selectedSummary} />
      )}

      {/* Call to Action */}
      {viewMode === 'grid' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <Zap className="w-12 h-12 mx-auto mb-4 text-accent-400" />
          <h2 className="text-2xl font-bold mb-2">
            Aprenda de forma interativa!
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Nossos resumos combinam teoria com prática através de flashcards e questões incorporadas
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" size="lg">
              <Target className="w-5 h-5 mr-2" />
              Ver Mais Populares
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary-700"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Meu Progresso
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}