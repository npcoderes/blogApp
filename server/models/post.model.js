const { pool } = require("../config/db");

class Post {
  // Create posts table
  static async createPostTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
          post_id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          excerpt VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          featured_image VARCHAR(255),
          tags TEXT[], 
          author_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
          views INTEGER DEFAULT 0,
          slug VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create index for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
      `);
    } catch (error) {
      console.error("Error creating posts table:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Create a new post
  static async createPost(
    title,
    excerpt,
    content,
    featuredImage,
    tags,
    authorId,
    slug,
    status = "published"
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO posts (title, excerpt, content, featured_image, tags, author_id, slug, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING post_id`,
        [title, excerpt, content, featuredImage, tags, authorId, slug, status]
      );
      return result.rows[0].post_id;
    } catch (error) {
      console.error("Error creating post:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all posts with pagination
  static async getAllPosts(limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.post_id) as like_count
         FROM posts p 
         JOIN users u ON p.author_id = u.user_id 
         WHERE p.status = 'published'
         ORDER BY p.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get total count of published posts
  static async getTotalPostsCount() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT COUNT(*) FROM posts WHERE status = 'published'"
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting posts count:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get post by slug
  static async getPostBySlug(slug) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.post_id) as like_count
         FROM posts p 
         JOIN users u ON p.author_id = u.user_id 
         WHERE p.slug = $1 AND p.status = 'published'`,
        [slug]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching post by slug:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get post by ID
  static async getPostById(postId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, u.username, u.profile_picture
         FROM posts p 
         JOIN users u ON p.author_id = u.user_id 
         WHERE p.post_id = $1`,
        [postId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching post by ID:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update post views
  static async incrementViews(postId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE posts SET views = views + 1 WHERE post_id = $1 RETURNING views",
        [postId]
      );
      return result.rows[0]?.views;
    } catch (error) {
      console.error("Error incrementing views:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get posts by author
  static async getPostsByAuthor(authorId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.post_id) as like_count
         FROM posts p 
         JOIN users u ON p.author_id = u.user_id 
         WHERE p.author_id = $1 AND p.status = 'published'
         ORDER BY p.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [authorId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching posts by author:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get author's own posts including drafts (for dashboard)
  static async getAuthorPosts(authorId, limit = 10, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, u.username, u.profile_picture,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
         (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.post_id) as like_count
         FROM posts p 
         JOIN users u ON p.author_id = u.user_id 
         WHERE p.author_id = $1
         ORDER BY p.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [authorId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching author posts:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update post
  static async updatePost(
    postId,
    title,
    excerpt,
    content,
    featuredImage,
    tags,
    status
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE posts 
         SET title = $1, excerpt = $2, content = $3, featured_image = $4, tags = $5, status = $6, updated_at = CURRENT_TIMESTAMP
         WHERE post_id = $7 RETURNING *`,
        [title, excerpt, content, featuredImage, tags, status, postId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating post:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete post
  static async deletePost(postId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM posts WHERE post_id = $1 RETURNING *",
        [postId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting post:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update post status (publish/draft)
  static async updatePostStatus(postId, status) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE posts 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE post_id = $2 RETURNING *`,
        [status, postId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating post status:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all published posts for public viewing
  static async getPublishedPosts() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          p.post_id as id,
          p.title,
          p.excerpt,
          p.content,
          p.featured_image,
          p.tags,
          p.views,
          p.slug,
          p.created_at,
          p.updated_at,
          u.username,
          u.profile_picture,
          COALESCE(c.comment_count, 0) as comment_count,
          COALESCE(l.like_count, 0) as like_count
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.user_id
         LEFT JOIN (
           SELECT post_id, COUNT(*) as comment_count 
           FROM comments 
           GROUP BY post_id
         ) c ON p.post_id = c.post_id
         LEFT JOIN (
           SELECT target_id as post_id, COUNT(*) as like_count 
           FROM likes 
           WHERE target_type = 'post'
           GROUP BY target_id
         ) l ON p.post_id = l.post_id
         WHERE p.status = 'published'
         ORDER BY p.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting published posts:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all tags with post counts
  static async getAllTags() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          tag as name,
          COUNT(*) as count
         FROM (
           SELECT UNNEST(tags) as tag
           FROM posts
           WHERE status = 'published'
         ) as tag_list
         GROUP BY tag
         ORDER BY count DESC, tag ASC
         LIMIT 50`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting tags:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

Post.createPostTable(); 

module.exports = Post;
