const { pool } = require("../config/db");

class User {
  static async createUserAndRoleTable() {
    const client = await pool.connect();
    try {
      await client.query(`
                CREATE TABLE IF NOT EXISTS roles (
                    role_id SERIAL PRIMARY KEY,
                    role_name VARCHAR(100) NOT NULL
                );
            `);

      await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    password VARCHAR(100) NOT NULL,
                    user_email VARCHAR(100) NOT NULL UNIQUE,
                    profile_picture VARCHAR(255),
                    bio TEXT,
                    phone VARCHAR(20),
                    location VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    role_id INTEGER REFERENCES roles(role_id)
                );
            `);
    } catch (error) {
      console.error("Error creating user and role table:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async createRole(roleName) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id",
        [roleName]
      );
      return result.rows[0].role_id;
    } catch (error) {
      console.error("Error creating role:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async registerUser(
    username,
    password,
    userEmail,
    profilePicture,
    roleId
  ) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (username, password, user_email, profile_picture, role_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
        [username, password, userEmail, profilePicture, roleId]
      );
      return result.rows[0].user_id;
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
  static async getUserByEmail(userEmail) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM users WHERE user_email = $1",
        [userEmail]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching user by email:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
  static async getUserById(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM users WHERE user_id = $1",
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching user by ID:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static updateProfilePicture(userId, profilePicture) {
    return new Promise(async (resolve, reject) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE users SET profile_picture = $1 WHERE user_id = $2 RETURNING *",
          [profilePicture, userId]
        );
        resolve(result.rows[0]);
      } catch (error) {
        console.error("Error updating profile picture:", error.message);
        reject(error);
      } finally {
        client.release();
      }
    });
  }
  
  static async updateUser(userId, updateData) {
    const client = await pool.connect();
    try {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error("No fields to update");
      }
      
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const query = `UPDATE users SET ${setClause} WHERE user_id = $${fields.length + 1} RETURNING *`;
      
      const result = await client.query(query, [...values, userId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteUser(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllUsers() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          u.user_id,
          u.username,
          u.user_email,
          u.profile_picture,
          u.bio,
          u.phone,
          u.location,
          u.created_at,
          r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error("Error fetching all users:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateUserRole(userId, newRole) {
    const client = await pool.connect();
    try {
      const roleResult = await client.query(
        "SELECT role_id FROM roles WHERE role_name = $1",
        [newRole]
      );
      
      if (roleResult.rows.length === 0) {
        throw new Error(`Role ${newRole} does not exist`);
      }
      
      const roleId = roleResult.rows[0].role_id;
      
      const result = await client.query(
        `UPDATE users 
         SET role_id = $1 
         WHERE user_id = $2 
         RETURNING user_id, username, user_email, role_id`,
        [roleId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }
      
      const userWithRole = await client.query(`
        SELECT 
          u.user_id,
          u.username,
          u.user_email,
          u.profile_picture,
          u.bio,
          u.phone,
          u.location,
          u.created_at,
          r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
      `, [userId]);
      
      return userWithRole.rows[0];
    } catch (error) {
      console.error("Error updating user role:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllPostsWithAuthors() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          p.post_id,
          p.title,
          p.content,
          p.excerpt,
          p.slug,
          p.featured_image,
          p.tags,
          p.status,
          p.created_at,
          p.updated_at,
          p.author_id,
          u.user_id,
          u.username as author_name,
          u.user_email as author_email,
          u.profile_picture as author_avatar
        FROM posts p
        JOIN users u ON p.author_id = u.user_id
        ORDER BY p.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error("Error fetching all posts with authors:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}


module.exports = User;