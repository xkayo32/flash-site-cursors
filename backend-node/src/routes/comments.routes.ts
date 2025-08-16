import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';

const router = Router();

// Path to comments data file
const COMMENTS_DATA_PATH = path.join(__dirname, '../../data/comments.json');

// Helper function to read comments data
const readCommentsData = () => {
  try {
    if (!fs.existsSync(COMMENTS_DATA_PATH)) {
      const initialData = {
        comments: [],
        replies: []
      };
      fs.writeFileSync(COMMENTS_DATA_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(COMMENTS_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading comments data:', error);
    return { comments: [], replies: [] };
  }
};

// Helper function to write comments data
const writeCommentsData = (data: any) => {
  try {
    fs.writeFileSync(COMMENTS_DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing comments data:', error);
    return false;
  }
};

// Get all comments with filters
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      entity_type, 
      entity_id, 
      status = 'approved',
      page = 1, 
      limit = 20,
      sort = 'recent'
    } = req.query;

    const data = readCommentsData();
    let comments = data.comments || [];

    // Filter by entity if provided
    if (entity_type) {
      comments = comments.filter((c: any) => c.entity_type === entity_type);
    }
    if (entity_id) {
      comments = comments.filter((c: any) => c.entity_id === entity_id);
    }

    // Filter by status
    if (status && status !== 'all') {
      comments = comments.filter((c: any) => c.status === status);
    }

    // Sort
    if (sort === 'recent') {
      comments.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === 'popular') {
      comments.sort((a: any, b: any) => b.likes - a.likes);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedComments = comments.slice(startIndex, endIndex);

    // Add replies to each comment
    const commentsWithReplies = paginatedComments.map((comment: any) => ({
      ...comment,
      replies: data.replies.filter((r: any) => r.comment_id === comment.id),
      replies_count: data.replies.filter((r: any) => r.comment_id === comment.id).length
    }));

    res.json({
      success: true,
      data: commentsWithReplies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: comments.length,
        total_pages: Math.ceil(comments.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar comentários' });
  }
});

// Get comment by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = readCommentsData();
    
    const comment = data.comments.find((c: any) => c.id === id);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    // Add replies
    const replies = data.replies.filter((r: any) => r.comment_id === id);

    res.json({
      success: true,
      data: {
        ...comment,
        replies,
        replies_count: replies.length
      }
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar comentário' });
  }
});

// Create new comment
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { entity_type, entity_id, content, rating } = req.body;
    const user = (req as any).user;

    if (!entity_type || !entity_id || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados incompletos' 
      });
    }

    const data = readCommentsData();
    
    const newComment = {
      id: `comment_${Date.now()}`,
      user_id: user.id,
      user_name: user.name || user.email,
      user_avatar: user.avatar || null,
      entity_type,
      entity_id,
      content,
      rating: rating || null,
      status: 'approved', // Auto-approve for now
      likes: 0,
      dislikes: 0,
      reported: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.comments.push(newComment);

    if (writeCommentsData(data)) {
      res.status(201).json({
        success: true,
        data: newComment,
        message: 'Comentário criado com sucesso'
      });
    } else {
      throw new Error('Failed to save comment');
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar comentário' });
  }
});

// Update comment
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    const user = (req as any).user;

    const data = readCommentsData();
    const commentIndex = data.comments.findIndex((c: any) => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    const comment = data.comments[commentIndex];

    // Check permission (user can edit own comment, admin can edit any)
    if (comment.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    // Update fields
    if (content) comment.content = content;
    if (status && user.role === 'admin') comment.status = status;
    comment.updated_at = new Date().toISOString();

    data.comments[commentIndex] = comment;

    if (writeCommentsData(data)) {
      res.json({
        success: true,
        data: comment,
        message: 'Comentário atualizado'
      });
    } else {
      throw new Error('Failed to update comment');
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar comentário' });
  }
});

// Delete comment
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const data = readCommentsData();
    const commentIndex = data.comments.findIndex((c: any) => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    const comment = data.comments[commentIndex];

    // Check permission
    if (comment.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    // Remove comment and its replies
    data.comments.splice(commentIndex, 1);
    data.replies = data.replies.filter((r: any) => r.comment_id !== id);

    if (writeCommentsData(data)) {
      res.json({
        success: true,
        message: 'Comentário removido'
      });
    } else {
      throw new Error('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover comentário' });
  }
});

// Like/Dislike comment
router.post('/:id/react', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body; // 'like' or 'dislike'

    if (!['like', 'dislike'].includes(reaction)) {
      return res.status(400).json({ success: false, message: 'Reação inválida' });
    }

    const data = readCommentsData();
    const commentIndex = data.comments.findIndex((c: any) => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    if (reaction === 'like') {
      data.comments[commentIndex].likes++;
    } else {
      data.comments[commentIndex].dislikes++;
    }

    if (writeCommentsData(data)) {
      res.json({
        success: true,
        data: data.comments[commentIndex],
        message: 'Reação registrada'
      });
    } else {
      throw new Error('Failed to save reaction');
    }
  } catch (error) {
    console.error('Error reacting to comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao reagir' });
  }
});

// Report comment
router.post('/:id/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const data = readCommentsData();
    const commentIndex = data.comments.findIndex((c: any) => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    data.comments[commentIndex].reported = true;
    data.comments[commentIndex].report_reason = reason;
    data.comments[commentIndex].status = 'pending'; // Set to pending for review

    if (writeCommentsData(data)) {
      res.json({
        success: true,
        message: 'Comentário reportado para análise'
      });
    } else {
      throw new Error('Failed to report comment');
    }
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({ success: false, message: 'Erro ao reportar comentário' });
  }
});

// Create reply to comment
router.post('/:id/reply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = (req as any).user;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Conteúdo da resposta é obrigatório' 
      });
    }

    const data = readCommentsData();
    
    // Check if parent comment exists
    const parentComment = data.comments.find((c: any) => c.id === id);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
    }

    const newReply = {
      id: `reply_${Date.now()}`,
      comment_id: id,
      user_id: user.id,
      user_name: user.name || user.email,
      user_avatar: user.avatar || null,
      content,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.replies.push(newReply);

    if (writeCommentsData(data)) {
      res.status(201).json({
        success: true,
        data: newReply,
        message: 'Resposta criada com sucesso'
      });
    } else {
      throw new Error('Failed to save reply');
    }
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar resposta' });
  }
});

// Get statistics
router.get('/stats/overview', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = readCommentsData();
    
    const stats = {
      total_comments: data.comments.length,
      total_replies: data.replies.length,
      approved_comments: data.comments.filter((c: any) => c.status === 'approved').length,
      pending_comments: data.comments.filter((c: any) => c.status === 'pending').length,
      reported_comments: data.comments.filter((c: any) => c.reported).length,
      average_rating: data.comments
        .filter((c: any) => c.rating)
        .reduce((acc: number, c: any, i: number, arr: any[]) => {
          acc += c.rating;
          if (i === arr.length - 1) return acc / arr.length;
          return acc;
        }, 0) || 0,
      recent_comments: data.comments
        .sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
  }
});

export default router;