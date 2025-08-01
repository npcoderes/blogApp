const { pool } = require("../config/db");

class Comment {
  // Create comments table
  static async createCommentTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS comments (
          comment_id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          author_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
          parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
          is_edited BOOLEAN DEFAULT FALSE,
          edited_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
      `);
      
    } catch (error) {
      console.error("Error creating comments table:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Create a new comment
  static async createComment(content, authorId, postId, parentCommentId = null) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO comments (content, author_id, post_id, parent_comment_id)
         VALUES ($1, $2, $3, $4) RETURNING comment_id`,
        [content, authorId, postId, parentCommentId]
      );
      return result.rows[0].comment_id;
    } catch (error) {
      console.error("Error creating comment:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comments for a post with nested replies
  static async getPostCommentsWithReplies(postId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      // First get top-level comments
      const topLevelResult = await client.query(
        `SELECT c.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.comment_id) as reply_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = c.comment_id) as like_count
         FROM comments c 
         JOIN users u ON c.author_id = u.user_id 
         WHERE c.post_id = $1 AND c.parent_comment_id IS NULL
         ORDER BY c.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      );

      const topLevelComments = topLevelResult.rows;

      // For each top-level comment, get its replies
      for (const comment of topLevelComments) {
        const repliesResult = await client.query(
          `SELECT c.*, u.username, u.profile_picture,
           (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = c.comment_id) as like_count
           FROM comments c 
           JOIN users u ON c.author_id = u.user_id 
           WHERE c.parent_comment_id = $1
           ORDER BY c.created_at ASC`,
          [comment.comment_id]
        );
        comment.replies = repliesResult.rows;
      }

      return topLevelComments;
    } catch (error) {
      console.error("Error fetching post comments with replies:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comments for a post (top-level comments only)
  static async getPostComments(postId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.comment_id) as reply_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = c.comment_id) as like_count
         FROM comments c 
         JOIN users u ON c.author_id = u.user_id 
         WHERE c.post_id = $1 AND c.parent_comment_id IS NULL
         ORDER BY c.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching post comments:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get replies for a comment
  static async getCommentReplies(commentId, limit = 5, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'comment' AND target_id = c.comment_id) as like_count
         FROM comments c 
         JOIN users u ON c.author_id = u.user_id 
         WHERE c.parent_comment_id = $1
         ORDER BY c.created_at ASC 
         LIMIT $2 OFFSET $3`,
        [commentId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching comment replies:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get total comments count for a post
  static async getPostCommentsCount(postId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COUNT(*) FROM comments WHERE post_id = $1",
        [postId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting comments count:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comment by ID
  static async getCommentById(commentId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, u.username, u.profile_picture
         FROM comments c 
         JOIN users u ON c.author_id = u.user_id 
         WHERE c.comment_id = $1`,
        [commentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching comment by ID:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update comment
  static async updateComment(commentId, content) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE comments 
         SET content = $1, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE comment_id = $2 RETURNING *`,
        [content, commentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating comment:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete comment
  static async deleteComment(commentId) {
    const client = await pool.connect();
    try {
      // First delete all replies to this comment
      await client.query(
        "DELETE FROM comments WHERE parent_comment_id = $1",
        [commentId]
      );
      
      // Then delete the comment itself
      const result = await client.query(
        "DELETE FROM comments WHERE comment_id = $1 RETURNING *",
        [commentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comments by user
  static async getCommentsByUser(userId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, u.username, u.profile_picture, p.title as post_title, p.slug as post_slug
         FROM comments c 
         JOIN users u ON c.author_id = u.user_id 
         JOIN posts p ON c.post_id = p.post_id
         WHERE c.author_id = $1
         ORDER BY c.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching comments by user:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

Comment.createCommentTable(); 

module.exports = Comment;
