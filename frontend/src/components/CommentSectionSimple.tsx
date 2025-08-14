import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Reply, Edit2, Trash2, Send, Filter } from 'lucide-react';
import { commentService, Comment, CreateCommentData } from '@/services/commentService';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  courseId: string;
  currentLessonId?: string;
}

export const CommentSectionSimple: React.FC<CommentSectionProps> = ({ courseId, currentLessonId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filterByLesson, setFilterByLesson] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentService.getComments(courseId, {
        lesson_id: filterByLesson ? currentLessonId : undefined,
        page: 1,
        limit: 10
      });

      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar relatórios operacionais');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [courseId, currentLessonId, filterByLesson]);

  const handleCreateComment = async (content: string) => {
    if (!content.trim()) {
      toast.error('Conteúdo do relatório obrigatório');
      return;
    }

    const commentData: CreateCommentData = {
      content: content.trim(),
      lesson_id: filterByLesson ? currentLessonId : undefined
    };

    const response = await commentService.createComment(courseId, commentData);
    
    if (response.success && response.data) {
      setComments(prev => [response.data!, ...prev]);
      setNewComment('');
      toast.success(response.message || 'Relatório operacional criado!');
    } else {
      toast.error(response.message || 'Erro ao criar relatório');
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

  return (
    <div className="space-y-6 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-yellow-500" />
          RELATÓRIOS OPERACIONAIS
        </h3>
        
        <button
          onClick={() => setFilterByLesson(!filterByLesson)}
          className={`px-4 py-2 rounded font-semibold uppercase tracking-wider transition-colors ${
            filterByLesson 
              ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
              : 'border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          <Filter className="w-4 h-4 mr-1 inline" />
          {filterByLesson ? 'Esta Missão' : 'Todo Curso'}
        </button>
      </div>

      {/* New Comment Form */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={`Digite seu relatório ${filterByLesson ? 'sobre esta missão' : 'sobre o curso'}...`}
          className="w-full p-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {newComment.length}/1000 caracteres
          </span>
          <button
            onClick={() => handleCreateComment(newComment)}
            disabled={!newComment.trim() || newComment.length > 1000}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Relatório
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Carregando relatórios...
            </p>
          </div>
        )}
        
        {!loading && comments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Nenhum Relatório Operacional
            </h4>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              Seja o primeiro agente a enviar um relatório {filterByLesson ? 'sobre esta missão' : 'sobre este curso'}.
            </p>
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                {commentService.getInitials(comment.user.name)}
              </div>
              
              {/* Comment Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {commentService.formatTimeAgo(comment.created_at)}
                  </span>
                  {comment.lesson_id && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded uppercase">
                      MISSÃO
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
                
                {/* Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {comment.likes}
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                    <Reply className="w-4 h-4" />
                    Responder
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  
                  <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};