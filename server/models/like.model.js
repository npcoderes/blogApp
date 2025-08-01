const { pool } = require("../config/db");

class Like {
  // Create likes table
  static async createLikeTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS likes (
          like_id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
          target_id INTEGER NOT NULL,
          like_type VARCHAR(10) DEFAULT 'like' CHECK (like_type IN ('like', 'dislike')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, target_type, target_id)
        );
      `);
      
    
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
      `);
      
    } catch (error) {
      console.error("Error creating likes table:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Add a like
  static async addLike(userId, targetType, targetId, likeType = 'like') {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO likes (user_id, target_type, target_id, like_type)
         VALUES ($1, $2, $3, $4) RETURNING like_id`,
        [userId, targetType, targetId, likeType]
      );
      return result.rows[0].like_id;
    } catch (error) {
      console.error("Error adding like:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Remove a like
  static async removeLike(userId, targetType, targetId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM likes 
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3 
         RETURNING *`,
        [userId, targetType, targetId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error removing like:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Check if user has liked a target
  static async checkUserLike(userId, targetType, targetId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM likes 
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
        [userId, targetType, targetId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error checking user like:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get like count for a target
  static async getLikeCount(targetType, targetId, likeType = 'like') {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) FROM likes 
         WHERE target_type = $1 AND target_id = $2 AND like_type = $3`,
        [targetType, targetId, likeType]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting like count:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all likes for a target with user details
  static async getTargetLikes(targetType, targetId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT l.*, u.username, u.profile_picture
         FROM likes l 
         JOIN users u ON l.user_id = u.user_id 
         WHERE l.target_type = $1 AND l.target_id = $2
         ORDER BY l.created_at DESC 
         LIMIT $3 OFFSET $4`,
        [targetType, targetId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching target likes:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all likes by a user
  static async getUserLikes(userId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT l.*, 
         CASE 
           WHEN l.target_type = 'post' THEN p.title
           WHEN l.target_type = 'comment' THEN c.content
         END as target_title
         FROM likes l 
         LEFT JOIN posts p ON l.target_type = 'post' AND l.target_id = p.post_id
         LEFT JOIN comments c ON l.target_type = 'comment' AND l.target_id = c.comment_id
         WHERE l.user_id = $1
         ORDER BY l.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching user likes:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async toggleLike(userId, targetType, targetId, likeType = 'like') {
    const client = await pool.connect();
    try {
      // Check if like exists
      const existingLike = await this.checkUserLike(userId, targetType, targetId);
      
      if (existingLike) {
        // Remove like
        await this.removeLike(userId, targetType, targetId);
        return { action: 'removed', liked: false };
      } else {
        // Add like
        await this.addLike(userId, targetType, targetId, likeType);
        return { action: 'added', liked: true };
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get like statistics for a user's content
  static async getUserContentLikeStats(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
         (SELECT COUNT(*) FROM likes l JOIN posts p ON l.target_id = p.post_id 
          WHERE l.target_type = 'post' AND p.author_id = $1) as post_likes,
         (SELECT COUNT(*) FROM likes l JOIN comments c ON l.target_id = c.comment_id 
          WHERE l.target_type = 'comment' AND c.author_id = $1) as comment_likes`,
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error getting user content like stats:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

Like.createLikeTable(); 

module.exports = Like;
