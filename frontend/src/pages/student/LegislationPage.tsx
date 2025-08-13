import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { legislationService, Legislation } from '@/services/legislationService';
import toast from 'react-hot-toast';
import {
  Scale,
  Search,
  Filter,
  BookOpen,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Tag,
  Layers,
  AlertCircle,
  CheckCircle,
  History,
  ExternalLink,
  Copy,
  Check,
  Highlighter,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Reply,
  User,
  Shield,
  Star,
  Palette,
  X,
  Target,
  Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos de estado local
interface LocalLegislation extends Legislation {
  isFavorite?: boolean;
  lastViewed?: string;
  readingProgress?: number;
  category: string;
  date: string;
  status: 'ATIVO' | 'REVOGADO' | 'ALTERADO';
  summary: string;
  articles: number;
  lastUpdate?: string;
  relatedExams: string[];
  tags: string[];
  views: number;
  isFavorite?: boolean;
  chapters?: Chapter[];
}

interface Chapter {
  id: string;
  number: string;
  title: string;
  articles: Article[];
}

interface Article {
  id: string;
  number: string;
  text: string;
  paragraphs?: string[];
  items?: string[];
  notes?: string[];
  lastUpdate?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'instructor' | 'admin';
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  replies?: Comment[];
  isReplyTo?: string;
}

interface Highlight {
  id: string;
  articleId: string;
  userId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  startIndex: number;
  endIndex: number;
  note?: string;
  timestamp: string;
}

// Dados mockados
const categories = ['Todos', 'Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Direito Civil', 'Direito do Trabalho'];
const types = ['Todos', 'Lei', 'Decreto', 'Medida Provisória', 'Constituição', 'Código', 'Estatuto'];
const statuses = ['Todos', 'Vigente', 'Revogada', 'Alterada'];

// Dados mockados da Constituição
const mockLegislationData = [
  {
    id: '1',
    number: 'I',
    title: 'Dos Princípios Fundamentais',
    articles: [
      {
        id: '1',
        number: '1º',
        text: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',
        items: [
          'I - a soberania;',
          'II - a cidadania;',
          'III - a dignidade da pessoa humana;',
          'IV - os valores sociais do trabalho e da livre iniciativa;',
          'V - o pluralismo político.'
        ],
        paragraphs: [
          'Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.'
        ]
      },
      {
        id: '2',
        number: '2º',
        text: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
      }
    ]
  },
  {
    id: '2',
    number: 'II',
    title: 'Dos Direitos e Garantias Fundamentais',
    articles: [
      {
        id: '5',
        number: '5º',
        text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
        items: [
          'I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;',
          'II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;',
          'III - ninguém será submetido a tortura nem a tratamento desumano ou degradante;'
        ],
        notes: [
          'Este artigo é conhecido como o princípio da isonomia ou igualdade.',
          'Os direitos fundamentais são cláusulas pétreas.'
        ]
      }
    ]
  }
];

// Comentários mockados por capítulo
const mockChapterComments: { [key: string]: Comment[] } = {
  '1': [
    {
      id: '1',
      userId: 'user1',
      userName: 'AGENTE MIRANDA',
      userRole: 'student',
      content: 'Os fundamentos do Estado Democrático de Direito são essenciais para compreender a estrutura constitucional. A soberania e cidadania aparecem frequentemente em provas.',
      timestamp: '2024-01-20T10:30:00Z',
      likes: 15,
      dislikes: 1,
      isLiked: true,
      replies: [
        {
          id: '1-1',
          userId: 'instructor1',
          userName: 'COMANDANTE ALVES',
          userRole: 'instructor',
          content: 'Excelente observação! Recomendo focar também na dignidade da pessoa humana, que é o princípio mais cobrado.',
          timestamp: '2024-01-20T11:00:00Z',
          likes: 8,
          dislikes: 0,
          isReplyTo: '1'
        }
      ]
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'SOLDADO COSTA',
      userRole: 'student',
      content: 'Alguém poderia explicar melhor a diferença entre soberania interna e externa? Sempre confundo esses conceitos.',
      timestamp: '2024-01-19T15:45:00Z',
      likes: 5,
      dislikes: 0
    }
  ],
  '2': [
    {
      id: '3',
      userId: 'admin1',
      userName: 'COMANDO TÁTICO',
      userRole: 'admin',
      content: 'Este capítulo é FUNDAMENTAL para todas as operações de concurso. Os direitos fundamentais são cláusulas pétreas e aparecem em 80% das provas.',
      timestamp: '2024-01-18T09:20:00Z',
      likes: 23,
      dislikes: 0,
      replies: [
        {
          id: '3-1',
          userId: 'user3',
          userName: 'CABO SILVA',
          userRole: 'student',
          content: 'Obrigado pelo destaque! Vou focar mais neste capítulo nos meus estudos.',
          timestamp: '2024-01-18T10:15:00Z',
          likes: 3,
          dislikes: 0,
          isReplyTo: '3'
        }
      ]
    }
  ]
};

// Destaques mockados
const mockHighlights: Highlight[] = [
  {
    id: '1',
    articleId: '1',
    userId: 'current-user',
    text: 'Estado Democrático de Direito',
    color: 'yellow',
    startIndex: 56,
    endIndex: 82,
    note: 'Conceito fundamental - cai muito em prova',
    timestamp: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    articleId: '1',
    userId: 'current-user',
    text: 'dignidade da pessoa humana',
    color: 'green',
    startIndex: 200,
    endIndex: 226,
    note: 'Princípio mais importante',
    timestamp: '2024-01-20T14:35:00Z'
  }
];

const highlightColors = [
  { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-900/30' },
  { name: 'Verde', value: 'green', class: 'bg-green-200 dark:bg-green-900/30' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-200 dark:bg-blue-900/30' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-200 dark:bg-pink-900/30' },
  { name: 'Roxo', value: 'purple', class: 'bg-purple-200 dark:bg-purple-900/30' }
];

export default function LegislationPage() {
  const [legislations, setLegislations] = useState<LocalLegislation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLegislations, setTotalLegislations] = useState(0);
  const [selectedLegislation, setSelectedLegislation] = useState<LocalLegislation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(mockHighlights);
  const [chapterComments, setChapterComments] = useState<{ [key: string]: Comment[] }>(mockChapterComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [currentArticleId, setCurrentArticleId] = useState<string>('');

  // Filtrar legislações
  const filteredLegislations = legislations.filter(legislation => {
    const matchesSearch = legislation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || legislation.category === selectedCategory;
    const matchesType = selectedType === 'Todos' || legislation.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || legislation.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Toggle capítulo expandido
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Copiar artigo
  const copyArticle = (articleNumber: string, articleText: string) => {
    const fullText = `Art. ${articleNumber} - ${articleText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedArticle(articleNumber);
    setTimeout(() => setCopiedArticle(null), 2000);
  };

  // Selecionar texto para destacar
  const handleTextSelection = (event: React.MouseEvent, articleId: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(selectedText);
      setCurrentArticleId(articleId);
      setHighlightPosition({
        x: rect.right + window.scrollX,
        y: rect.top + window.scrollY
      });
      setShowHighlightMenu(true);
    }
  };

  // Adicionar destaque
  const addHighlight = (color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple', note?: string) => {
    if (selectedText && currentArticleId) {
      const highlight: Highlight = {
        id: Date.now().toString(),
        articleId: currentArticleId,
        userId: 'current-user',
        text: selectedText,
        color,
        startIndex: 0, // Simplificado para demo
        endIndex: selectedText.length,
        note,
        timestamp: new Date().toISOString()
      };
      
      setHighlights([...highlights, highlight]);
      setShowHighlightMenu(false);
      setSelectedText('');
    }
  };

  // Remover destaque
  const removeHighlight = (highlightId: string) => {
    setHighlights(highlights.filter(h => h.id !== highlightId));
  };

  // Adicionar comentário ao capítulo
  const addChapterComment = (chapterId: string) => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'AGENTE OPERACIONAL',
      userRole: 'student',
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    };
    
    setChapterComments(prev => ({
      ...prev,
      [chapterId]: [comment, ...(prev[chapterId] || [])]
    }));
    setNewComment('');
  };

  // Adicionar resposta ao comentário
  const addReply = (chapterId: string, parentId: string) => {
    if (!replyText.trim()) return;
    
    const reply: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'AGENTE OPERACIONAL',
      userRole: 'student',
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isReplyTo: parentId
    };
    
    setChapterComments(prev => ({
      ...prev,
      [chapterId]: prev[chapterId]?.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      }) || []
    }));
    
    setReplyText('');
    setReplyingTo(null);
  };

  // Toggle like/dislike
  const toggleReaction = (chapterId: string, commentId: string, type: 'like' | 'dislike', isReply = false, parentId?: string) => {
    setChapterComments(prev => ({
      ...prev,
      [chapterId]: prev[chapterId]?.map(comment => {
        if (isReply && parentId && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => {
              if (reply.id === commentId) {
                if (type === 'like') {
                  return {
                    ...reply,
                    isLiked: !reply.isLiked,
                    isDisliked: false,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes
                  };
                } else {
                  return {
                    ...reply,
                    isDisliked: !reply.isDisliked,
                    isLiked: false,
                    dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes
                  };
                }
              }
              return reply;
            })
          };
        } else if (comment.id === commentId) {
          if (type === 'like') {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              isDisliked: false,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes
            };
          } else {
            return {
              ...comment,
              isDisliked: !comment.isDisliked,
              isLiked: false,
              dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes
            };
          }
        }
        return comment;
      }) || []
    }));
  };

  // Formatar tempo
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora';
  };

  // Card de legislação
  const LegislationCard = ({ legislation }: { legislation: Legislation }) => (
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
                <Badge variant="secondary">{legislation.type}</Badge>
                <Badge 
                  className={cn(
                    legislation.status === 'Vigente' && "bg-green-100 text-green-700",
                    legislation.status === 'Revogada' && "bg-red-100 text-red-700",
                    legislation.status === 'Alterada' && "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {legislation.status}
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg text-primary-900 mb-1">
                {legislation.title}
              </h3>
              
              <p className="text-sm text-primary-600 mb-2">
                {legislation.number}
              </p>
            </div>
            
            <button
              onClick={() => {
                // Toggle favorite
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Bookmark 
                className={cn(
                  "w-5 h-5",
                  legislation.isFavorite ? "fill-primary-600 text-primary-600" : "text-gray-400"
                )}
              />
            </button>
          </div>

          {/* Resumo */}
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {legislation.summary}
          </p>

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1 text-primary-600">
              <FileText className="w-4 h-4" />
              <span>{legislation.articles} artigos</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(legislation.date).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Eye className="w-4 h-4" />
              <span>{legislation.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Clock className="w-4 h-4" />
              <span>Atualizada</span>
            </div>
          </div>

          {/* Concursos relacionados */}
          {legislation.relatedExams.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-primary-600 mb-1">Relevante para:</p>
              <div className="flex flex-wrap gap-1">
                {legislation.relatedExams.slice(0, 3).map((exam, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {exam}
                  </Badge>
                ))}
                {legislation.relatedExams.length > 3 && (
                  <span className="text-xs text-primary-500">
                    +{legislation.relatedExams.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2"
              onClick={() => {
                setSelectedLegislation(legislation);
                setViewMode('reading');
              }}
            >
              <BookOpen className="w-4 h-4" />
              Ler
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Última atualização */}
          {legislation.lastUpdate && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-primary-500">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" />
                Última atualização: {new Date(legislation.lastUpdate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Visualização de leitura
  const ReadingView = ({ legislation }: { legislation: Legislation }) => (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className="mb-4 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{legislation.type}</Badge>
                <Badge>{legislation.category}</Badge>
                <Badge 
                  className={cn(
                    legislation.status === 'Vigente' && "bg-green-100 text-green-700",
                    legislation.status === 'Revogada' && "bg-red-100 text-red-700",
                    legislation.status === 'Alterada' && "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {legislation.status}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                {legislation.title}
              </h1>
              
              <p className="text-primary-600 mb-2">
                {legislation.number}
              </p>
              
              <p className="text-primary-600 mb-4">
                {legislation.summary}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-primary-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Publicada em {new Date(legislation.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {legislation.articles} artigos
                </span>
                {legislation.lastUpdate && (
                  <span className="flex items-center gap-1">
                    <History className="w-4 h-4" />
                    Atualizada em {new Date(legislation.lastUpdate).toLocaleDateString('pt-BR')}
                  </span>
                )}
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
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso para legislação revogada */}
      {legislation.status === 'Revogada' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">
                Esta legislação foi revogada e não está mais em vigor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capítulos e artigos */}
      <div className="space-y-4">
        {exampleChapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary-900">
                  Capítulo {chapter.number} - {chapter.title}
                </h2>
                {expandedChapters.includes(chapter.id) ? (
                  <ChevronUp className="w-5 h-5 text-primary-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary-600" />
                )}
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {expandedChapters.includes(chapter.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="space-y-6 pt-0">
                    {chapter.articles.map((article) => (
                      <div key={article.id} className="border-l-4 border-accent-500 pl-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white font-police-title">
                            Art. {article.number}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyArticle(article.number, article.text)}
                              className="gap-1 font-police-body"
                            >
                              {copiedArticle === article.number ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  COPIADO
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  COPIAR
                                </>
                              )}
                            </Button>
                            <Badge className="bg-accent-500/20 text-accent-600 border-accent-500/50 font-police-body">
                              <Highlighter className="w-3 h-3 mr-1" />
                              {highlights.filter(h => h.articleId === article.id).length} DESTAQUES
                            </Badge>
                          </div>
                        </div>
                        
                        <div 
                          className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed cursor-text select-text"
                          onMouseUp={(e) => handleTextSelection(e, article.id)}
                        >
                          {article.text}
                        </div>
                        
                        {/* Destaques existentes */}
                        {highlights.filter(h => h.articleId === article.id).length > 0 && (
                          <div className="mb-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-police-body uppercase">
                              SEUS DESTAQUES:
                            </p>
                            {highlights.filter(h => h.articleId === article.id).map(highlight => (
                              <div key={highlight.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-4 h-4 rounded",
                                    highlight.color === 'yellow' && 'bg-yellow-400',
                                    highlight.color === 'green' && 'bg-green-400',
                                    highlight.color === 'blue' && 'bg-blue-400',
                                    highlight.color === 'pink' && 'bg-pink-400',
                                    highlight.color === 'purple' && 'bg-purple-400'
                                  )} />
                                  <span className="text-sm text-gray-700 dark:text-gray-300 font-police-body">"{highlight.text}"</span>
                                  {highlight.note && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">- {highlight.note}</span>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeHighlight(highlight.id)}
                                  className="p-1 h-6 w-6"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {article.items && (
                          <div className="ml-4 space-y-1 mb-3">
                            {article.items.map((item, idx) => (
                              <p key={idx} className="text-primary-700">
                                {item}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.paragraphs && (
                          <div className="space-y-2 mb-3">
                            {article.paragraphs.map((paragraph, idx) => (
                              <p key={idx} className="text-primary-700 italic">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.notes && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              📝 Notas de estudo:
                            </p>
                            {article.notes.map((note, idx) => (
                              <p key={idx} className="text-sm text-blue-800">
                                • {note}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.lastUpdate && (
                          <p className="text-xs text-primary-500 mt-2">
                            Artigo alterado em {new Date(article.lastUpdate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {/* Seção de comentários do capítulo */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-accent-500" />
                            DISCUSSÃO TÁTICA - CAPÍTULO {chapter.number}
                            <Badge className="bg-accent-500/20 text-accent-600 border-accent-500/50 font-police-body">
                              {chapterComments[chapter.id]?.length || 0} COMENTÁRIOS
                            </Badge>
                          </h4>
                        </div>
                        
                        {/* Formulário para novo comentário */}
                        <div className="mb-6">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="COMPARTILHE SUA ANÁLISE SOBRE ESTE CAPÍTULO..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-police-body"
                                rows={3}
                              />
                              <div className="flex justify-end mt-2">
                                <Button
                                  onClick={() => addChapterComment(chapter.id)}
                                  disabled={!newComment.trim()}
                                  size="sm"
                                  className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  ENVIAR COMENTÁRIO
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de comentários */}
                        <div className="space-y-4">
                          {chapterComments[chapter.id]?.length > 0 ? (
                            chapterComments[chapter.id].map((comment) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-police-title",
                                    comment.userRole === 'admin' && "bg-red-600",
                                    comment.userRole === 'instructor' && "bg-blue-600", 
                                    comment.userRole === 'student' && "bg-gray-700"
                                  )}>
                                    {comment.userRole === 'admin' && <Shield className="w-5 h-5" />}
                                    {comment.userRole === 'instructor' && <Star className="w-5 h-5" />}
                                    {comment.userRole === 'student' && <User className="w-5 h-5" />}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900 dark:text-white font-police-body">
                                        {comment.userName}
                                      </span>
                                      <Badge 
                                        className={cn(
                                          "text-xs font-police-body",
                                          comment.userRole === 'admin' && "bg-red-100 text-red-700 border-red-500",
                                          comment.userRole === 'instructor' && "bg-blue-100 text-blue-700 border-blue-500",
                                          comment.userRole === 'student' && "bg-gray-100 text-gray-700 border-gray-500"
                                        )}
                                      >
                                        {comment.userRole === 'admin' && 'COMANDO'}
                                        {comment.userRole === 'instructor' && 'INSTRUTOR'}
                                        {comment.userRole === 'student' && 'AGENTE'}
                                      </Badge>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTime(comment.timestamp)}
                                      </span>
                                    </div>
                                    
                                    <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                                      {comment.content}
                                    </p>
                                    
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => toggleReaction(chapter.id, comment.id, 'like')}
                                        className={cn(
                                          "flex items-center gap-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                                          comment.isLiked ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-gray-600 dark:text-gray-400"
                                        )}
                                      >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="font-police-numbers">{comment.likes}</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => toggleReaction(chapter.id, comment.id, 'dislike')}
                                        className={cn(
                                          "flex items-center gap-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                                          comment.isDisliked ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-gray-600 dark:text-gray-400"
                                        )}
                                      >
                                        <ThumbsDown className="w-4 h-4" />
                                        <span className="font-police-numbers">{comment.dislikes}</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors font-police-body"
                                      >
                                        <Reply className="w-4 h-4" />
                                        RESPONDER
                                      </button>
                                    </div>
                                    
                                    {/* Form de resposta */}
                                    {replyingTo === comment.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="flex gap-3">
                                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <textarea
                                              value={replyText}
                                              onChange={(e) => setReplyText(e.target.value)}
                                              placeholder="DIGITE SUA RESPOSTA..."
                                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-police-body"
                                              rows={2}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setReplyingTo(null);
                                                  setReplyText('');
                                                }}
                                                className="font-police-body uppercase"
                                              >
                                                CANCELAR
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() => addReply(chapter.id, comment.id)}
                                                disabled={!replyText.trim()}
                                                className="font-police-body uppercase bg-accent-500 hover:bg-accent-600 text-black"
                                              >
                                                <Send className="w-4 h-4 mr-1" />
                                                RESPONDER
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                    
                                    {/* Respostas */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-4 space-y-3">
                                        {comment.replies.map(reply => (
                                          <div key={reply.id} className="ml-8 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-l-accent-500">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs",
                                                reply.userRole === 'admin' && "bg-red-600",
                                                reply.userRole === 'instructor' && "bg-blue-600", 
                                                reply.userRole === 'student' && "bg-gray-600"
                                              )}>
                                                {reply.userRole === 'admin' && <Shield className="w-3 h-3" />}
                                                {reply.userRole === 'instructor' && <Star className="w-3 h-3" />}
                                                {reply.userRole === 'student' && <User className="w-3 h-3" />}
                                              </div>
                                              <span className="font-medium text-gray-900 dark:text-white text-sm font-police-body">
                                                {reply.userName}
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTime(reply.timestamp)}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                              {reply.content}
                                            </p>
                                            <div className="flex items-center gap-3">
                                              <button
                                                onClick={() => toggleReaction(chapter.id, reply.id, 'like', true, comment.id)}
                                                className={cn(
                                                  "flex items-center gap-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                                                  reply.isLiked ? "text-green-600" : "text-gray-500 dark:text-gray-400"
                                                )}
                                              >
                                                <ThumbsUp className="w-3 h-3" />
                                                <span className="font-police-numbers">{reply.likes}</span>
                                              </button>
                                              <button
                                                onClick={() => toggleReaction(chapter.id, reply.id, 'dislike', true, comment.id)}
                                                className={cn(
                                                  "flex items-center gap-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                                                  reply.isDisliked ? "text-red-600" : "text-gray-500 dark:text-gray-400"
                                                )}
                                              >
                                                <ThumbsDown className="w-3 h-3" />
                                                <span className="font-police-numbers">{reply.dislikes}</span>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-police-title">
                                NENHUMA DISCUSSÃO INICIADA
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body">
                                Seja o primeiro a comentar sobre este capítulo
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Navegação entre capítulos */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" disabled>
          <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
          Capítulo anterior
        </Button>
        <span className="text-sm text-primary-600">
          Capítulo 1 de 10
        </span>
        <Button variant="outline">
          Próximo capítulo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {viewMode === 'list' ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">ARSENAL JURÍDICO</h1>
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  ARSENAL DE LEIS E REGULAMENTOS PARA OPERAÇÕES TÁTICAS
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Scale className="w-5 h-5 mr-2" />
                  {legislations.length} legislações
                </Badge>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Leis consultadas</p>
                      <p className="text-2xl font-bold text-primary-900">23</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Favoritas</p>
                      <p className="text-2xl font-bold text-primary-900">8</p>
                    </div>
                    <Bookmark className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Atualizações</p>
                      <p className="text-2xl font-bold text-primary-900">5</p>
                    </div>
                    <History className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Artigos lidos</p>
                      <p className="text-2xl font-bold text-primary-900">342</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-500" />
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
                    placeholder="BUSCAR NO ARSENAL JURÍDICO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Grid de legislações */}
          {filteredLegislations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLegislations.map((legislation) => (
                <LegislationCard key={legislation.id} legislation={legislation} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Scale className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Nenhuma legislação encontrada
              </h3>
              <p className="text-primary-600 mb-6">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedType('Todos');
                setSelectedStatus('Todos');
              }}>
                Limpar filtros
              </Button>
            </Card>
          )}
        </>
      ) : (
        selectedLegislation && <ReadingView legislation={selectedLegislation} />
      )}

      {/* Menu de destacar texto */}
      {showHighlightMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
          style={{
            left: `${highlightPosition.x}px`,
            top: `${highlightPosition.y}px`,
          }}
          onMouseLeave={() => setShowHighlightMenu(false)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Highlighter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white font-police-body">
              DESTACAR TEXTO
            </span>
            <button
              onClick={() => setShowHighlightMenu(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1 mb-3">
            {highlightColors.map(color => (
              <button
                key={color.value}
                onClick={() => addHighlight(color.value as any)}
                className={cn(
                  "w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 transition-colors",
                  color.class
                )}
                title={color.name}
              />
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <button
              onClick={() => {
                const note = prompt('Adicionar nota (opcional):');
                addHighlight('yellow', note || undefined);
              }}
              className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-police-body"
            >
              + ADICIONAR NOTA
            </button>
          </div>
        </div>
      )}

      {/* Call to Action */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-8 text-white text-center overflow-hidden border border-gray-700 relative"
        >
          {/* Padrão tático de fundo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
            }} />
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-500/20 rounded-full flex items-center justify-center">
              <Crosshair className="w-8 h-8 text-accent-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-wider">
              INTELIGÊNCIA JURÍDICA ATUALIZADA
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body uppercase">
              ACESSE O ARSENAL JURÍDICO MAIS COMPLETO COM ATUALIZAÇÕES EM TEMPO REAL
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                size="lg"
                className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black"
              >
                <Target className="w-5 h-5 mr-2" />
                MAIS CONSULTADAS
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 font-police-body uppercase tracking-wider"
              >
                <Crosshair className="w-5 h-5 mr-2" />
                ATUALIZAÇÕES TÁTICAS
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}