const User = require('./models/user.modal');
const Post = require('./models/post.model');
const Comment = require('./models/comment.model');
const Like = require('./models/like.model');

async function initializeTables() {
  try {
    console.log('Initializing database tables...');
    
    // Create tables in order (respecting foreign key dependencies)
    await User.createUserAndRoleTable();
    console.log('✓ Users and Roles tables created');
    
    await Post.createPostTable();
    console.log('✓ Posts table created');
    
    await Comment.createCommentTable();
    console.log('✓ Comments table created');
    
    await Like.createLikeTable();
    console.log('✓ Likes table created');
    
    console.log('All tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initializeTables();
}

module.exports = { initializeTables };
