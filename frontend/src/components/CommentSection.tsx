import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { MessageSquare, ThumbsUp, Reply, Edit2, Trash2, Send, Filter } from 'lucide-react';
import { commentService, Comment, CreateCommentData } from '@/services/commentService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  courseId: string;
  currentLessonId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ courseId, currentLessonId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filterByLesson, setFilterByLesson] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const response = await commentService.getComments(courseId, {
        lesson_id: filterByLesson ? currentLessonId : undefined,
        page: pageNum,
        limit: 10
      });

      if (response.success && response.data) {
        if (append) {
          setComments(prev => [...prev, ...response.data!]);
        } else {
          setComments(response.data);
        }
        
        if (response.pagination) {
          setHasMore(pageNum < response.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar relatórios operacionais');
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [courseId, currentLessonId, filterByLesson]);

  const handleCreateComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('Conteúdo do relatório obrigatório');
      return;
    }

    const commentData: CreateCommentData = {
      content: content.trim(),
      lesson_id: filterByLesson ? currentLessonId : undefined,
      parent_id: parentId
    };

    const response = await commentService.createComment(courseId, commentData);
    
    if (response.success && response.data) {
      if (parentId) {
        // Update replies count for parent comment
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies_count: comment.replies_count + 1 }
            : comment
        ));
        setReplyContent('');
        setReplyingTo(null);
      } else {
        // Add new comment to the beginning
        setComments(prev => [response.data!, ...prev]);
        setNewComment('');
      }
      
      toast.success(response.message || 'Relatório operacional criado!');
    } else {
      toast.error(response.message || 'Erro ao criar relatório');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    const response = await commentService.updateComment(courseId, commentId, { content });
    
    if (response.success && response.data) {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, updated_at: response.data!.updated_at }
          : comment
      ));
      setEditingComment(null);
      setEditContent('');
      toast.success('Relatório atualizado!');
    } else {
      toast.error(response.message || 'Erro ao atualizar relatório');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Confirma remoção do relatório operacional?')) return;
    
    const response = await commentService.deleteComment(courseId, commentId);
    
    if (response.success) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Relatório removido com sucesso!');
    } else {
      toast.error(response.message || 'Erro ao remover relatório');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const response = await commentService.likeComment(courseId, commentId);
    
    if (response.success && response.data) {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: response.data!.likes }
          : comment
      ));
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-black font-police-body font-bold text-sm">
              {commentService.getInitials(comment.user.name)}
            </div>
            
            {/* Comment Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-police-body font-semibold text-gray-900 dark:text-white">
                  {comment.user.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-police-numbers">
                  {commentService.formatTimeAgo(comment.created_at)}
                </span>
                {comment.lesson_id && (
                  <span className="px-2 py-1 bg-accent-500/20 text-accent-600 dark:text-accent-400 text-xs rounded font-police-body uppercase">
                    MISSÃO
                  </span>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-police-body resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id, editContent)}
                      className="bg-accent-500 hover:bg-accent-600 text-black font-police-body"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 font-police-body whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className="h-auto p-1 text-gray-600 dark:text-gray-400 hover:text-accent-500"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {comment.likes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyContent('');
                  }}
                  className="h-auto p-1 text-gray-600 dark:text-gray-400 hover:text-accent-500"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Responder
                </Button>
                
                {/* Edit/Delete for own comments */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="h-auto p-1 text-gray-600 dark:text-gray-400 hover:text-accent-500"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-auto p-1 text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Reply Form */}
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-police-body resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateComment(replyContent, comment.id)}
                      className="bg-accent-500 hover:bg-accent-600 text-black font-police-body"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          <MessageSquare className="w-6 h-6 inline mr-2 text-accent-500" />
          RELATÓRIOS OPERACIONAIS
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filterByLesson ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterByLesson(!filterByLesson)}
            className={`font-police-body uppercase tracking-wider ${
              filterByLesson 
                ? 'bg-accent-500 hover:bg-accent-600 text-black' 
                : 'border-accent-500 text-accent-500 hover:bg-accent-500/10'
            }`}
          >
            <Filter className="w-4 h-4 mr-1" />
            {filterByLesson ? 'Esta Missão' : 'Todo Curso'}
          </Button>
        </div>
      </div>

      {/* New Comment Form */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Digite seu relatório ${filterByLesson ? 'sobre esta missão' : 'sobre o curso'}...`}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-police-body resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-police-numbers">
                {newComment.length}/1000 caracteres
              </span>
              <Button
                onClick={() => handleCreateComment(newComment)}
                disabled={!newComment.trim() || newComment.length > 1000}
                className="bg-accent-500 hover:bg-accent-600 text-black font-police-body uppercase tracking-wider"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-police-body">
              Carregando relatórios...
            </p>
          </div>
        )}
        
        {hasMore && !loading && comments.length > 0 && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              variant="outline"
              className="border-accent-500 text-accent-500 hover:bg-accent-500/10 font-police-body uppercase tracking-wider"
            >
              Carregar Mais Relatórios
            </Button>
          </div>
        )}
        
        {!loading && comments.length === 0 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-police-subtitle font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Nenhum Relatório Operacional
              </h4>
              <p className="text-gray-500 dark:text-gray-500 font-police-body mt-2">
                Seja o primeiro agente a enviar um relatório {filterByLesson ? 'sobre esta missão' : 'sobre este curso'}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};