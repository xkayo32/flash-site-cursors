import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summaryService, Summary } from '@/services/summaryService';
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
  const [viewMode, setViewMode] = useState<'grid' | 'reading'>('grid');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showFlashcardAnswers, setShowFlashcardAnswers] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Carregamento inicial dos resumos
  useEffect(() => {
    loadSummaries();
  }, [searchTerm, selectedSubject, selectedDifficulty]);

  const loadSummaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {
        search: searchTerm || undefined,
        subject: selectedSubject !== 'Todos' ? selectedSubject : undefined,
        difficulty: selectedDifficulty !== 'Todos' ? selectedDifficulty.toLowerCase() : undefined,
        status: 'published' as const,
        visibility: 'public' as const,
        limit: 20,
        offset: 0
      };
      
      const response = await summaryService.list(filters);
      
      const localSummaries: LocalSummary[] = response.summaries.map(s => ({
        ...s,
        progress: Math.floor(Math.random() * 100), // Progress simulado
        isFavorite: Math.random() > 0.7, // Favoritos simulados
        stats: {
          views: Math.floor(Math.random() * 5000) + 100,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
          flashcards: Math.floor(Math.random() * 30) + 5,
          questions: Math.floor(Math.random() * 25) + 3
        }
      }));
      
      setSummaries(localSummaries);
      setTotalSummaries(response.total);
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
          <Badge className="bg-accent-500/20 text-accent-600 border-accent-500/50 font-police-body">
            ÁREA DE INTERCÂMBIO
          </Badge>
        </div>
      </CardHeader>
      
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
      <Card className="h-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{summary.subject}</Badge>
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
            {summary.content.substring(0, 150)}...
          </p>

          {/* Metadados */}
          <div className="flex items-center gap-4 text-sm text-primary-600 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {summary.estimated_reading_time} min
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
            <span>{summary.created_by}</span>
            <span>Atualizado em {new Date(summary.updated_at).toLocaleDateString('pt-BR')}</span>
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

      {/* Seção de comentários */}
      <CommentsSection />

      {/* Barra de progresso fixa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
              PROGRESSO: <span className="font-medium text-gray-900 dark:text-white font-police-numbers">65%</span>
            </div>
            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-accent-500 h-full rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="font-police-body uppercase">
              MARCAR CONCLUÍDO
            </Button>
            <Button size="sm" className="gap-2 font-police-body uppercase bg-accent-500 hover:bg-accent-600 text-black">
              PRÓXIMA SEÇÃO
              <ChevronRight className="w-4 h-4" />
            </Button>
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
            className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-police-title uppercase tracking-wider">BRIEFINGS TÁTICOS</h1>
                <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                  CONTEÚDO DIDÁTICO COM FLASHCARDS E QUESTÕES INCORPORADOS
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <FileText className="w-5 h-5 mr-2" />
                  {totalSummaries} resumos
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