import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import legislationService, { LegislationDocument } from '@/services/legislationService';
import { categoryService, type Category } from '@/services/categoryService';
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
  Folder,
  FolderOpen,
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
interface LocalLegislation extends LegislationDocument {
  isFavorite?: boolean;
  lastViewed?: string;
  readingProgress?: number;
  relatedExams?: string[];
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [chapterComments, setChapterComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [currentArticleId, setCurrentArticleId] = useState<string>('');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [statsData, setStatsData] = useState({
    viewedLaws: 0,
    favorites: 0,
    updates: 0,
    articlesRead: 0
  });
  
  // Estados dos filtros dinâmicos
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<string[]>(['Todos']);
  const [statuses] = useState<string[]>(['Todos', 'Vigente', 'Revogada', 'Alterada']);
  
  // Estados para o sistema hierárquico de categorias
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Carregar categorias da API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  // Funções para gerenciamento hierárquico de categorias
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

  const findParentChain = (categoryId: string): string[] => {
    const parentChain: string[] = [];
    
    const findParent = (id: string) => {
      for (const cat of categories) {
        if (cat.id === id && cat.parent_id) {
          parentChain.push(cat.parent_id);
          findParent(cat.parent_id);
          break;
        }
        if (cat.children) {
          const childCat = cat.children.find(c => c.id === id);
          if (childCat && cat.id) {
            parentChain.push(cat.id);
            findParent(cat.id);
            break;
          }
        }
      }
    };
    
    findParent(categoryId);
    return parentChain;
  };

  const findAllChildren = (categoryId: string, cats: Category[] = categories): string[] => {
    const childrenIds: string[] = [];
    
    const findChildren = (id: string) => {
      const category = findCategoryById(id, cats);
      if (category?.children) {
        category.children.forEach(child => {
          childrenIds.push(child.id);
          findChildren(child.id);
        });
      }
    };
    
    findChildren(categoryId);
    return childrenIds;
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      
      if (isSelected) {
        // Desmarcar categoria e todos os filhos
        const childrenToRemove = findAllChildren(categoryId);
        return prev.filter(id => id !== categoryId && !childrenToRemove.includes(id));
      } else {
        // Marcar categoria e todos os pais
        const parentsToAdd = findParentChain(categoryId);
        return [...new Set([...prev, categoryId, ...parentsToAdd])];
      }
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filtered categories for search
  const filteredCategories = categorySearch
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.children && cat.children.some(child => 
          child.name.toLowerCase().includes(categorySearch.toLowerCase())
        ))
      )
    : categories;

  // Renderizar árvore de categorias
  const renderCategoryTree = (cats: Category[], level: number = 0): JSX.Element[] => {
    return cats.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);
      const isSelected = selectedCategories.includes(category.id);
      const hasSelectedChildren = category.children?.some(child => 
        selectedCategories.includes(child.id)
      );

      return (
        <div key={category.id}>
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
              ${isSelected 
                ? 'bg-accent-500/20 text-accent-600 dark:text-accent-500 font-semibold' 
                : hasSelectedChildren
                  ? 'bg-accent-500/10 text-accent-600 dark:text-accent-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryExpansion(category.id);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            
            <div className="flex items-center gap-2 flex-1" onClick={() => handleCategoryToggle(category.id)}>
              {hasChildren ? (
                isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
              ) : (
                <div className="w-4" />
              )}
              
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4 text-accent-500 rounded border-gray-300 dark:border-gray-600 focus:ring-accent-500"
                onClick={(e) => e.stopPropagation()}
              />
              
              <span className="font-police-body uppercase tracking-wider text-sm">
                {category.name}
              </span>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Carregar dados das legislações
  const loadLegislations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        limit: 50,
        offset: 0
      };
      
      // Filtrar por categorias selecionadas
      if (selectedCategories.length > 0) {
        // Por enquanto, enviar a primeira categoria selecionada como subject_area
        // Idealmente, a API deveria suportar múltiplas categorias
        const firstCategory = findCategoryById(selectedCategories[0]);
        if (firstCategory) {
          params.subject_area = firstCategory.name;
        }
      }
      
      if (selectedType !== 'Todos') {
        params.type = selectedType.toLowerCase();
      }
      
      if (selectedStatus !== 'Todos') {
        params.status = selectedStatus === 'Vigente' ? 'active' : 
                       selectedStatus === 'Revogada' ? 'revoked' : 'superseded';
      }
      
      if (searchTerm.trim()) {
        const searchResult = await legislationService.search({
          q: searchTerm,
          limit: 50,
          ...params
        });
        
        const mapped = searchResult.results.map(leg => ({
          ...leg,
          isFavorite: false,
          relatedExams: [] // Will be populated from API if available
        }));
        
        setLegislations(mapped);
        setTotalLegislations(searchResult.total);
      } else {
        const response = await legislationService.getAll(params);
        
        const mapped = response.legislation.map(leg => ({
          ...leg,
          isFavorite: false,
          relatedExams: [] // Will be populated from API if available
        }));
        
        setLegislations(mapped);
        setTotalLegislations(response.pagination.total);
      }
    } catch (err) {
      console.error('Erro ao carregar legislações:', err);
      setError('Erro ao carregar legislações. Tente novamente.');
      toast.error('Erro ao carregar legislações');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar categorias e tipos
  const loadFilters = async () => {
    try {
      const [typesData, subjectsData] = await Promise.all([
        legislationService.getTypes(),
        legislationService.getSubjects()
      ]);
      
      const typeNames = ['Todos', ...Array.from(new Set(typesData.map(t => legislationService.getTypeDisplayName(t.type))))];
      const subjectNames = ['Todos', ...Array.from(new Set(subjectsData.map(s => s.subject)))];
      
      setTypes(typeNames);
      setCategories(subjectNames);
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
    }
  };
  
  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const bookmarks = await legislationService.getBookmarks();
      setStatsData(prev => ({
        ...prev,
        favorites: bookmarks.length,
        viewedLaws: legislations.length,
        updates: 5, // Mock value - can be calculated from real data
        articlesRead: bookmarks.reduce((acc, b) => acc + (b.article_id ? 1 : 0), 0)
      }));
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };
  
  // Debounced search
  const debouncedSearch = (term: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      loadLegislations();
    }, 500);
    
    setSearchDebounceTimer(timer);
  };
  
  // Efeitos
  useEffect(() => {
    loadFilters();
  }, []);
  
  useEffect(() => {
    loadLegislations();
  }, [selectedCategories, selectedType, selectedStatus]);
  
  useEffect(() => {
    if (searchTerm === '') {
      loadLegislations();
    } else {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm]);
  
  useEffect(() => {
    if (legislations.length > 0) {
      loadStats();
    }
  }, [legislations]);
  
  // Filtrar legislações (agora apenas para busca local rápida)
  const filteredLegislations = legislations;

  // Toggle favorito
  const toggleFavorite = async (legislationId: string) => {
    try {
      const current = legislations.find(l => l.id === legislationId);
      if (current?.isFavorite) {
        await legislationService.removeBookmark(legislationId);
        toast.success('Removido dos favoritos');
      } else {
        await legislationService.addBookmark(legislationId);
        toast.success('Adicionado aos favoritos');
      }
      
      setLegislations(prev => prev.map(l => 
        l.id === legislationId 
          ? { ...l, isFavorite: !l.isFavorite }
          : l
      ));
    } catch (err) {
      console.error('Erro ao alterar favorito:', err);
      toast.error('Erro ao alterar favorito');
    }
  };

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
  const LegislationCard = ({ legislation }: { legislation: LocalLegislation }) => (
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
                <Badge variant="secondary">{legislationService.getTypeDisplayName(legislation.type)}</Badge>
                <Badge 
                  className={legislationService.getStatusColor(legislation.status)}
                >
                  {legislationService.getStatusDisplayName(legislation.status)}
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg text-primary-900 mb-1">
                {legislation.title}
              </h3>
              
              <p className="text-sm text-primary-600 mb-2">
                {legislationService.formatLegislationNumber(legislation)}
              </p>
            </div>
            
            <button
              onClick={() => toggleFavorite(legislation.id)}
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
            {legislation.summary || legislation.description}
          </p>

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1 text-primary-600">
              <FileText className="w-4 h-4" />
              <span>{legislation.articles?.length || 0} artigos</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Calendar className="w-4 h-4" />
              <span>{legislation.year}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Eye className="w-4 h-4" />
              <span>{legislation.statistics?.views?.toLocaleString() || 0} views</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Clock className="w-4 h-4" />
              <span>Atualizada</span>
            </div>
          </div>

          {/* Keywords como tags */}
          {legislation.keywords && legislation.keywords.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-primary-600 mb-1">Palavras-chave:</p>
              <div className="flex flex-wrap gap-1">
                {legislation.keywords.slice(0, 3).map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {legislation.keywords.length > 3 && (
                  <span className="text-xs text-primary-500">
                    +{legislation.keywords.length - 3}
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
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-primary-500">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              Atualizada: {legislationService.formatDate(legislation.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Visualização de leitura
  const ReadingView = ({ legislation }: { legislation: LocalLegislation }) => (
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
                <Badge variant="secondary">{legislationService.getTypeDisplayName(legislation.type)}</Badge>
                <Badge>{legislation.subject_area}</Badge>
                <Badge 
                  className={legislationService.getStatusColor(legislation.status)}
                >
                  {legislationService.getStatusDisplayName(legislation.status)}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                {legislation.title}
              </h1>
              
              <p className="text-primary-600 mb-2">
                {legislationService.formatLegislationNumber(legislation)}
              </p>
              
              <p className="text-primary-600 mb-4">
                {legislation.summary || legislation.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-primary-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Publicada em {legislationService.formatDate(legislation.publication_date)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {legislation.articles?.length || 0} artigos
                </span>
                <span className="flex items-center gap-1">
                  <History className="w-4 h-4" />
                  Atualizada em {legislationService.formatDate(legislation.updated_at)}
                </span>
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
      {legislation.status === 'revoked' && (
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

      {/* Artigos */}
      <div className="space-y-4">
        {legislation.articles && legislation.articles.length > 0 ? (
          legislation.articles.map((article) => (
            <Card key={article.id}>
            <CardContent className="p-6">
              <div className="border-l-4 border-accent-500 pl-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white font-police-title">
                    {article.number}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyArticle(article.number, article.content)}
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
                
                {article.title && (
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {article.title}
                  </h4>
                )}
                
                <div 
                  className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed cursor-text select-text"
                  onMouseUp={(e) => handleTextSelection(e, article.id)}
                >
                  {article.content}
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

                {/* Parágrafos */}
                {article.paragraphs && article.paragraphs.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {article.paragraphs.map((paragraph) => (
                      <div key={paragraph.id} className="ml-4">
                        <p className="text-primary-700 font-medium mb-1">
                          {paragraph.number}
                        </p>
                        <p className="text-primary-700 italic mb-2">
                          {paragraph.content}
                        </p>
                        
                        {/* Itens do parágrafo */}
                        {paragraph.items && paragraph.items.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {paragraph.items.map((item) => (
                              <div key={item.id} className="text-primary-700">
                                <span className="font-medium">{item.number}</span> {item.content}
                                
                                {/* Subitens */}
                                {item.subitems && item.subitems.length > 0 && (
                                  <div className="ml-4 mt-1 space-y-1">
                                    {item.subitems.map((subitem) => (
                                      <p key={subitem.id} className="text-primary-600">
                                        <span className="font-medium">{subitem.number}</span> {subitem.content}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Comentários do artigo */}
                {article.comments && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                      📝 Comentários:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {article.comments}
                    </p>
                  </div>
                )}
                
                {/* Jurisprudência */}
                {article.jurisprudence && article.jurisprudence.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-1">
                      ⚖️ Jurisprudência relacionada:
                    </p>
                    {article.jurisprudence.map((jur, idx) => (
                      <p key={idx} className="text-sm text-purple-800 dark:text-purple-300">
                        • {jur}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">
              Artigos não disponíveis
            </h3>
            <p className="text-primary-600 mb-6">
              O conteúdo desta legislação ainda não foi carregado.
            </p>
          </Card>
        )}
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
                  {totalLegislations} legislações
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
                      <p className="text-2xl font-bold text-primary-900">{statsData.viewedLaws}</p>
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
                      <p className="text-2xl font-bold text-primary-900">{statsData.favorites}</p>
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
                      <p className="text-2xl font-bold text-primary-900">{statsData.updates}</p>
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
                      <p className="text-2xl font-bold text-primary-900">{statsData.articlesRead}</p>
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
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className={`px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-left font-police-body transition-all flex items-center justify-between gap-2 ${
                    selectedCategories.length > 0
                      ? 'border-accent-500 text-accent-600 dark:text-accent-500'
                      : 'border-primary-200 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {selectedCategories.length === 0
                      ? 'TODAS AS ÁREAS'
                      : selectedCategories.length === 1
                        ? findCategoryById(selectedCategories[0])?.name.toUpperCase() || 'ÁREA'
                        : `${selectedCategories.length} ÁREAS`
                    }
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {types.map((type, index) => (
                    <option key={`type-${index}-${type}`} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statuses.map((status, index) => (
                    <option key={`status-${index}-${status}`} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Erro ao carregar legislações
              </h3>
              <p className="text-red-600 mb-6">
                {error}
              </p>
              <Button onClick={loadLegislations}>
                Tentar novamente
              </Button>
            </Card>
          ) : filteredLegislations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLegislations.map((legislation) => (
                  <LegislationCard key={legislation.id} legislation={legislation} />
                ))}
              </div>
              
              {/* Paginação info */}
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
                <p className="font-police-body">
                  Mostrando {legislations.length} de {totalLegislations} legislações
                </p>
              </div>
            </>
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

      {/* Modal de Seleção de Categorias */}
      {categoryModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setCategoryModalOpen(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-accent-500/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-police-title uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-3">
                  <Scale className="w-6 h-6 text-accent-500" />
                  ÁREAS JURÍDICAS
                </h2>
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar áreas jurídicas..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
              </div>

              {/* Categories Tree */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                {filteredCategories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-police-body">
                    Nenhuma área jurídica encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {renderCategoryTree(filteredCategories)}
                  </div>
                )}
              </div>

              {/* Selected Categories Summary */}
              {selectedCategories.length > 0 && (
                <div className="mt-6 p-4 bg-accent-500/10 rounded-lg border border-accent-500/30">
                  <p className="text-sm font-police-subtitle uppercase tracking-wider text-accent-700 dark:text-accent-300 mb-2">
                    Áreas Selecionadas ({selectedCategories.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = findCategoryById(categoryId);
                      return category ? (
                        <Badge 
                          key={categoryId}
                          className="bg-accent-500 text-white hover:bg-accent-600 font-police-body"
                        >
                          {category.name.toUpperCase()}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategories([]);
                  setCategorySearch('');
                }}
                className="font-police-body uppercase tracking-wider"
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                className="font-police-body uppercase tracking-wider"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setCategoryModalOpen(false)}
                className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body uppercase tracking-wider"
              >
                Confirmar Seleção
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}