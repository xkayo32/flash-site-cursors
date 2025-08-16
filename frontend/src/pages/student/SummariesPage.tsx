import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summaryService, Summary } from '@/services/summaryService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
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
  BarChart3,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  User,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { StatCard } from '@/components/student';

// Tipos de estado local
interface LocalSummary extends Summary {
  progress?: number;
  isFavorite?: boolean;
  stats?: {
    views: number;
    rating: number;
    flashcards: number;
    questions: number;
  };
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

// Dados das matérias
const subjects = ['Todos', 'Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Informática', 'Português'];
const difficulties = ['Todos', 'Básico', 'Intermediário', 'Avançado'];

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<LocalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSummaries, setTotalSummaries] = useState(0);
  const [selectedSummary, setSelectedSummary] = useState<LocalSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [viewMode, setViewMode] = useState<'grid' | 'reading'>('grid');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showFlashcardAnswers, setShowFlashcardAnswers] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Carregamento inicial dos resumos
  useEffect(() => {
    loadSummaries();
  }, [searchTerm, selectedSubject, selectedDifficulty]);

  // Atualizar progresso quando seções expandidas mudarem
  useEffect(() => {
    if (selectedSummary) {
      const progress = calculateProgress(selectedSummary);
      setReadingProgress(progress);
    }
  }, [expandedSections, selectedSummary]);

  const loadSummaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {
        q: searchTerm || undefined,
        subject: selectedSubject !== 'Todos' ? selectedSubject : undefined,
        difficulty: selectedDifficulty !== 'Todos' ? selectedDifficulty.toLowerCase() : undefined,
        status: 'published' as const,
        visibility: 'public' as const,
        limit: 20,
        page: 1
      };
      
      // Admin usa getAll(), estudante usa getAvailable()
      const response = user?.role === 'admin' 
        ? await summaryService.getAll(filters)
        : await summaryService.getAvailable(filters);
      
      // Now response will always have summaries array from the service
      const summariesData = response.summaries || [];
      
      const localSummaries: LocalSummary[] = summariesData.map(s => ({
        ...s,
        progress: Math.floor(Math.random() * 100), // Progress simulado
        isFavorite: Math.random() > 0.7, // Favoritos simulados
        stats: {
          views: s.statistics?.views || Math.floor(Math.random() * 5000) + 100,
          rating: s.statistics?.average_rating || Math.round((Math.random() * 2 + 3) * 10) / 10,
          flashcards: Math.floor(Math.random() * 30) + 5,
          questions: Math.floor(Math.random() * 25) + 3
        }
      }));
      
      setSummaries(localSummaries);
      setTotalSummaries(response.total || localSummaries.length);
    } catch (err) {
      console.error('Erro ao carregar resumos:', err);
      setError('Erro ao carregar resumos. Tente novamente.');
      toast.error('ERRO AO CARREGAR ARSENAL TÁTICO!', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  // As questões já vêm filtradas da API
  const filteredSummaries = summaries;

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

  // Adicionar comentário
  const addComment = () => {
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
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  // Adicionar resposta
  const addReply = (parentId: string) => {
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
    
    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));
    
    setReplyText('');
    setReplyingTo(null);
  };

  // Toggle like/dislike
  const toggleReaction = (commentId: string, type: 'like' | 'dislike', isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
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
        }
        return comment;
      }));
    } else {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
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
      }));
    }
  };

  // Função para formatar tempo
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

  // Calcular progresso baseado nas seções expandidas
  const calculateProgress = (summary: LocalSummary) => {
    if (!summary.sections || summary.sections.length === 0) return 0;
    const expandedCount = expandedSections.length;
    const totalSections = summary.sections.length;
    return Math.round((expandedCount / totalSections) * 100);
  };

  // Navegação para próxima seção
  const goToNextSection = (summary: LocalSummary) => {
    if (!summary.sections || summary.sections.length === 0) return;
    
    // Encontrar primeira seção não expandida
    const nextSection = summary.sections.find(section => !expandedSections.includes(section.id));
    
    if (nextSection) {
      // Expandir a próxima seção
      setExpandedSections(prev => [...prev, nextSection.id]);
      
      // Scroll suave até a seção
      setTimeout(() => {
        const element = document.querySelector(`[data-section-id="${nextSection.id}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      toast.success(`Seção "${nextSection.title}" aberta!`);
    } else {
      // Todas as seções já foram expandidas
      toast.success('Todas as seções foram lidas!');
      setIsCompleted(true);
    }
  };

  // Marcar como concluído
  const markAsCompleted = (summary: LocalSummary) => {
    setIsCompleted(true);
    
    // Expandir todas as seções se ainda não estiverem
    if (summary.sections) {
      const allSectionIds = summary.sections.map(section => section.id);
      setExpandedSections(allSectionIds);
    }
    
    toast.success('🎯 MISSÃO CONCLUÍDA! Briefing tático finalizado com sucesso.');
    
    // Opcional: Salvar progresso na API
    // summaryService.markAsCompleted(summary.id);
  };

  // Componente de comentário
  const CommentComponent = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800",
        isReply && "ml-8 mt-3 border-l-4 border-l-accent-500"
      )}
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
              onClick={() => toggleReaction(comment.id, 'like', isReply, parentId)}
              className={cn(
                "flex items-center gap-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                comment.isLiked ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-gray-600 dark:text-gray-400"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="font-police-numbers">{comment.likes}</span>
            </button>
            
            <button
              onClick={() => toggleReaction(comment.id, 'dislike', isReply, parentId)}
              className={cn(
                "flex items-center gap-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors",
                comment.isDisliked ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-gray-600 dark:text-gray-400"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="font-police-numbers">{comment.dislikes}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors font-police-body"
              >
                <Reply className="w-4 h-4" />
                RESPONDER
              </button>
            )}
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
                    rows={3}
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
                      onClick={() => addReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="font-police-body uppercase bg-accent-500 hover:bg-accent-600 text-black dark:text-black"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      RESPONDER
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Respostas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
          ))}
        </div>
      )}
    </motion.div>
  );

  // Seção de comentários
  const CommentsSection = () => (
    <Card className="mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-accent-500" />
            DISCUSSÃO TÁTICA ({comments.length})
          </h3>
          <div className="flex items-center gap-3">
            <Badge className="bg-accent-500/20 text-accent-600 border-accent-500/50 font-police-body">
              ÁREA DE INTERCÂMBIO
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="font-police-body uppercase tracking-wider border-accent-500/30 text-accent-600 hover:bg-accent-500/10"
            >
              {showComments ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  OCULTAR
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  MOSTRAR
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="p-6">
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
                placeholder="COMPARTILHE SUA ANÁLISE OU DÚVIDA SOBRE ESTE BRIEFING..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-police-body"
                rows={4}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                  Mantenha um ambiente respeitoso e construtivo
                </p>
                <Button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="font-police-body uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-black dark:text-black"
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
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentComponent key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-police-title">
                NENHUMA DISCUSSÃO INICIADA
              </h4>
              <p className="text-gray-600 dark:text-gray-400 font-police-body">
                Seja o primeiro a compartilhar sua opinião sobre este briefing tático
              </p>
            </div>
          )}
        </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );

  // Card de resumo
  const SummaryCard = ({ summary }: { summary: Summary }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
        {/* Tactical stripe */}
        <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
        
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-police-body uppercase tracking-wider">{summary.subject}</Badge>
                <Badge 
                  className={cn(
                    "font-police-body uppercase tracking-wider",
                    summary.difficulty === 'basic' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                    summary.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                    summary.difficulty === 'advanced' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  )}
                >
                  {summary.difficulty === 'basic' ? 'BÁSICO' : 
                   summary.difficulty === 'intermediate' ? 'INTERMEDIÁRIO' : 
                   summary.difficulty === 'advanced' ? 'AVANÇADO' : 
                   summary.difficulty.toUpperCase()}
                </Badge>
              </div>
              
              <h3 className="font-police-title font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 uppercase tracking-wider">
                {summary.title}
              </h3>
            </div>
            
            <button
              onClick={() => {
                // Toggle favorite
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Star 
                className={cn(
                  "w-5 h-5",
                  summary.isFavorite ? "fill-accent-500 text-accent-500" : "text-gray-400 dark:text-gray-600"
                )}
              />
            </button>
          </div>

          {/* Descrição */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-police-body">
            {summary.content.substring(0, 150)}...
          </p>

          {/* Metadados */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span className="font-police-numbers">{summary.estimated_reading_time}</span> MIN
            </span>
            <span className="flex items-center gap-1 font-police-body uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span className="font-police-numbers">{summary.stats.views.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-accent-500" />
              <span className="font-police-numbers">{summary.stats.rating}</span>
            </span>
          </div>

          {/* Conteúdo embutido */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-400">
                <Brain className="w-4 h-4" />
                <span className="font-police-numbers font-semibold">{summary.stats.flashcards}</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-500 font-police-body uppercase tracking-wider">INTEL CARDS</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center gap-1 text-purple-700 dark:text-purple-400">
                <FileText className="w-4 h-4" />
                <span className="font-police-numbers font-semibold">{summary.stats.questions}</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-500 font-police-body uppercase tracking-wider">QUESTÕES</p>
            </div>
          </div>

          {/* Progresso */}
          {summary.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">PROGRESSO</span>
                <span className="font-police-numbers font-medium text-gray-900 dark:text-white">{summary.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    summary.progress === 100 ? "bg-green-500" :
                    summary.progress >= 50 ? "bg-accent-500" :
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
              className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
              onClick={() => {
                setSelectedSummary(summary);
                setViewMode('reading');
              }}
            >
              <BookOpen className="w-4 h-4" />
              {summary.progress ? 'CONTINUAR' : 'INICIAR'}
            </Button>
            <Button variant="outline" size="sm" className="p-2 border-gray-300 dark:border-gray-600">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2 border-gray-300 dark:border-gray-600">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Autor e data */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
            <span>{summary.created_by}</span>
            <span>{new Date(summary.updated_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Componente de leitura
  const ReadingView = ({ summary }: { summary: Summary }) => (
    <div className="max-w-4xl mx-auto pb-24">
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
                    summary.difficulty === 'basic' && "bg-green-100 text-green-700",
                    summary.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700",
                    summary.difficulty === 'advanced' && "bg-red-100 text-red-700"
                  )}
                >
                  {summary.difficulty === 'basic' ? 'BÁSICO' : 
                   summary.difficulty === 'intermediate' ? 'INTERMEDIÁRIO' : 
                   summary.difficulty === 'advanced' ? 'AVANÇADO' : 
                   summary.difficulty.toUpperCase()}
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
                  {summary.estimated_reading_time} min de leitura
                </span>
                <span>{summary.created_by}</span>
                <span>Atualizado em {new Date(summary.updated_at).toLocaleDateString('pt-BR')}</span>
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
        {(summary.sections || []).map((section) => (
          <Card key={section.id} data-section-id={section.id}>
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
                      {(section as any).embeddedItems?.map((item: any, index: number) => (
                        <div key={item.id || `item-${index}`} className="my-4">
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
                                        {showFlashcardAnswers[item.id || `item-${index}`] && (
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
                                        onClick={() => toggleFlashcardAnswer(item.id || `item-${index}`)}
                                      >
                                        {showFlashcardAnswers[item.id || `item-${index}`] ? (
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

      {/* Seção de comentários */}
      <CommentsSection />

      {/* Barra de progresso fixa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto">
          {/* Layout responsivo */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                PROGRESSO: <span className="font-medium text-gray-900 dark:text-white font-police-numbers">{readingProgress}%</span>
              </div>
              <div className="w-32 lg:w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-green-500" : "bg-accent-500"
                  )} 
                  style={{ width: `${readingProgress}%` }} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAsCompleted(summary)}
                disabled={isCompleted}
                className={cn(
                  "font-police-body uppercase text-xs lg:text-sm",
                  isCompleted ? "bg-green-100 text-green-700 border-green-300" : ""
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    CONCLUÍDO
                  </>
                ) : (
                  'MARCAR CONCLUÍDO'
                )}
              </Button>
              <Button 
                size="sm" 
                onClick={() => goToNextSection(summary)}
                disabled={readingProgress === 100}
                className="gap-2 font-police-body uppercase bg-accent-500 hover:bg-accent-600 text-black dark:text-black text-xs lg:text-sm disabled:opacity-50"
              >
                {readingProgress === 100 ? 'MISSÃO COMPLETA' : 'PRÓXIMA SEÇÃO'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              CARREGANDO BRIEFINGS TÁTICOS...
            </p>
          </div>
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-2 border-red-200 dark:border-red-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2 font-police-title uppercase">
            ERRO NA OPERAÇÃO
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6 font-police-body">
            {error}
          </p>
          <Button 
            onClick={loadSummaries} 
            className="bg-accent-500 hover:bg-accent-600 text-black dark:text-black font-police-body uppercase tracking-wider"
          >
            TENTAR NOVAMENTE
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-police-title font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-ultra-wide">BRIEFINGS TÁTICOS</h1>
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  SISTEMA DE INTELIGÊNCIA COM FLASHCARDS E QUESTÕES INCORPORADOS
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2 font-police-subtitle tracking-wider border-2 border-current">
                  <FileText className="w-5 h-5 mr-2 text-accent-500" />
                  <span className="font-police-numbers">{totalSummaries}</span> BRIEFINGS
                </Badge>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="BRIEFINGS LIDOS"
                value={12}
                icon={BookOpen}
                color="blue"
                variant="tactical"
                size="sm"
              />
              
              <StatCard
                title="EM PROGRESSO"
                value={3}
                icon={TrendingUp}
                color="orange"
                variant="tactical"
                size="sm"
              />
              
              <StatCard
                title="TEMPO OPERACIONAL"
                value="18h"
                icon={Clock}
                color="purple"
                variant="tactical"
                size="sm"
              />
              
              <StatCard
                title="ITENS CONCLUÍDOS"
                value={234}
                icon={CheckCircle}
                color="green"
                variant="tactical"
                size="sm"
              />
            </div>

            {/* Barra de busca e filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="BUSCAR BRIEFINGS TÁTICOS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body uppercase tracking-wider"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 font-police-body uppercase tracking-wider border-2"
                >
                  <Filter className="w-4 h-4" />
                  FILTROS
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
            <Card className="p-12 text-center border-2 border-gray-200 dark:border-gray-800">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-police-title font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
                NENHUM BRIEFING TÁTICO ENCONTRADO
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body uppercase tracking-wider">
                AJUSTE OS FILTROS OU REALIZE NOVA BUSCA DE INTELIGÊNCIA
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('Todos');
                  setSelectedDifficulty('Todos');
                }}
                className="font-police-body uppercase tracking-wider border-2"
              >
                LIMPAR FILTROS
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
          className="mt-12 bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 rounded-2xl p-8 text-white text-center border-2 border-accent-500/30"
        >
          <Zap className="w-12 h-12 mx-auto mb-4 text-accent-500" />
          <h2 className="text-2xl font-police-title font-bold mb-2 uppercase tracking-wider">
            SISTEMA DE APRENDIZADO TÁTICO!
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body uppercase tracking-wider">
            BRIEFINGS COMBINAM TEORIA COM PRÁTICA ATRAVÉS DE FLASHCARDS E QUESTÕES INCORPORADAS
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-accent-500 hover:bg-accent-600 text-black font-police-body font-semibold uppercase tracking-wider"
            >
              <Target className="w-5 h-5 mr-2" />
              VER MAIS POPULARES
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-gray-900 font-police-body font-semibold uppercase tracking-wider"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              MEU PROGRESSO
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}