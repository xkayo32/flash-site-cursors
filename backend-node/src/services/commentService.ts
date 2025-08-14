import { query, transaction } from '../database/connection';

export interface Comment {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id?: number;
  parent_id?: number;
  content: string;
  likes_count: number;
  replies_count: number;
  is_instructor_reply: boolean;
  is_pinned: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  edited_at?: string;
}

export interface CommentWithUser extends Comment {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  user_liked?: boolean;
}

export class CommentService {
  
  // Buscar comentários com filtros
  async getComments(params: {
    course_id: number;
    lesson_id?: number;
    user_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ comments: CommentWithUser[]; total: number }> {
    const { course_id, lesson_id, user_id, page = 1, limit = 20 } = params;
    
    let whereClause = 'WHERE c.course_id = $1 AND c.status = $2';
    let queryParams: any[] = [course_id, 'active'];
    let paramIndex = 3;
    
    if (lesson_id !== undefined) {
      if (lesson_id === null) {
        whereClause += ' AND c.lesson_id IS NULL';
      } else {
        whereClause += ` AND c.lesson_id = $${paramIndex}`;
        queryParams.push(lesson_id);
        paramIndex++;
      }
    }
    
    const offset = (page - 1) * limit;
    
    // Query principal com joins
    const commentsQuery = `
      SELECT 
        c.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.profile_picture as user_avatar,
        ${user_id ? `EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $${paramIndex}) as user_liked` : 'false as user_liked'}
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex + (user_id ? 1 : 0)} OFFSET $${paramIndex + (user_id ? 2 : 1)}
    `;
    
    if (user_id) {
      queryParams.push(user_id);
    }
    queryParams.push(limit, offset);
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments c
      ${whereClause}
    `;
    
    const [commentsResult, countResult] = await Promise.all([
      query(commentsQuery, queryParams.slice(0, user_id ? -2 : -2).concat(queryParams.slice(-2))),
      query(countQuery, queryParams.slice(0, user_id ? -3 : -2))
    ]);
    
    const comments: CommentWithUser[] = commentsResult.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      course_id: row.course_id,
      lesson_id: row.lesson_id,
      parent_id: row.parent_id,
      content: row.content,
      likes_count: row.likes_count,
      replies_count: row.replies_count,
      is_instructor_reply: row.is_instructor_reply,
      is_pinned: row.is_pinned,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      edited_at: row.edited_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        avatar: row.user_avatar
      },
      user_liked: row.user_liked
    }));
    
    return {
      comments,
      total: parseInt(countResult.rows[0].total)
    };
  }
  
  // Criar novo comentário
  async createComment(data: {
    user_id: number;
    course_id: number;
    lesson_id?: number;
    parent_id?: number;
    content: string;
    is_instructor_reply?: boolean;
  }): Promise<Comment> {
    const { user_id, course_id, lesson_id, parent_id, content, is_instructor_reply = false } = data;
    
    const insertQuery = `
      INSERT INTO comments (user_id, course_id, lesson_id, parent_id, content, is_instructor_reply)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await query(insertQuery, [
      user_id,
      course_id,
      lesson_id || null,
      parent_id || null,
      content,
      is_instructor_reply
    ]);
    
    return result.rows[0];
  }
  
  // Atualizar comentário
  async updateComment(commentId: number, userId: number, content: string): Promise<Comment> {
    const updateQuery = `
      UPDATE comments 
      SET content = $1, edited_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await query(updateQuery, [content, commentId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Comentário não encontrado ou sem permissão');
    }
    
    return result.rows[0];
  }
  
  // Excluir comentário
  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    return await transaction(async (client) => {
      // Verificar se o comentário existe e pertence ao usuário
      const checkResult = await client.query(
        'SELECT id FROM comments WHERE id = $1 AND user_id = $2',
        [commentId, userId]
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Comentário não encontrado ou sem permissão');
      }
      
      // Excluir likes do comentário
      await client.query('DELETE FROM comment_likes WHERE comment_id = $1', [commentId]);
      
      // Excluir respostas (comentários filhos)
      await client.query('DELETE FROM comments WHERE parent_id = $1', [commentId]);
      
      // Excluir o comentário principal
      await client.query('DELETE FROM comments WHERE id = $1', [commentId]);
      
      return true;
    });
  }
  
  // Like/Unlike comentário
  async toggleLike(commentId: number, userId: number): Promise<{ liked: boolean; likes_count: number }> {
    return await transaction(async (client) => {
      // Verificar se já curtiu
      const existingLike = await client.query(
        'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );
      
      let liked: boolean;
      
      if (existingLike.rows.length > 0) {
        // Remover like
        await client.query(
          'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
          [commentId, userId]
        );
        liked = false;
      } else {
        // Adicionar like
        await client.query(
          'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
          [commentId, userId]
        );
        liked = true;
      }
      
      // Buscar contagem atualizada
      const countResult = await client.query(
        'SELECT likes_count FROM comments WHERE id = $1',
        [commentId]
      );
      
      return {
        liked,
        likes_count: countResult.rows[0].likes_count
      };
    });
  }
  
  // Verificar se usuário está matriculado no curso
  async checkUserEnrollment(userId: number, courseId: number): Promise<boolean> {
    const result = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status IN ($3, $4, $5)',
      [userId, courseId, 'active', 'paused', 'completed']
    );
    
    return result.rows.length > 0;
  }
  
  // Verificar se aula existe
  async checkLessonExists(lessonId: number): Promise<boolean> {
    const result = await query('SELECT id FROM lessons WHERE id = $1', [lessonId]);
    return result.rows.length > 0;
  }
  
  // Verificar se comentário pai existe
  async checkParentCommentExists(parentId: number): Promise<boolean> {
    const result = await query('SELECT id FROM comments WHERE id = $1', [parentId]);
    return result.rows.length > 0;
  }
}

export const commentService = new CommentService();