const Post = require('../models/post.model');
const Like = require('../models/like.model');
const cloudinary = require('../config/cloudinary');

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + Date.now();
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, excerpt, content, tags, status = 'published' } = req.body;
    const authorId = req.user.user_id;

    // Handle image upload to Cloudinary
    let featuredImage = null;
    if (req.file) {
      try {
        // Convert buffer to base64 for Cloudinary upload
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        const result = await cloudinary.uploader.upload(fileStr, {
          folder: 'blog-posts',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        });
      }
    }

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Generate slug
    const slug = generateSlug(title);

    const postId = await Post.createPost(
      title,
      excerpt,
      content,
      featuredImage,
      processedTags,
      authorId,
      slug,
      status
    );

    // Get the created post with author details
    const post = await Post.getPostById(postId);

    res.status(201).json({
      success: true,
      message: `Post ${status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
};

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await Post.getAllPosts(limit, offset);
    const total = await Post.getTotalPostsCount();

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

// Get single post by slug
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await Post.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Increment view count
    await Post.incrementViews(post.post_id);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
};

// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;

    // Check if post exists
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Toggle like
    const result = await Like.toggleLike(userId, 'post', postId);
    const likeCount = await Like.getLikeCount('post', postId);

    res.json({
      success: true,
      message: result.action === 'added' ? 'Post liked' : 'Post unliked',
      data: { 
        liked: result.liked, 
        likeCount: likeCount 
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like'
    });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await Post.getPostsByAuthor(authorId, limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get posts by author error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts by author'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, excerpt, content, tags, status } = req.body;
    const userId = req.user.user_id;

    // Check if post exists and user is the author
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    // Handle image upload if new image is provided
    let featuredImage = post.featured_image;
    if (req.file) {
      try {
        // Convert buffer to base64 for Cloudinary upload
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        const result = await cloudinary.uploader.upload(fileStr, {
          folder: 'blog-posts',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        });
      }
    }

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const updatedPost = await Post.updatePost(
      postId,
      title,
      excerpt,
      content,
      featuredImage,
      processedTags,
      status || post.status
    );

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;

    // Check if post exists and user is the author
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author_id !== userId && req.user.role_name !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await Post.deletePost(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};

// Get author's own posts including drafts
const getAuthorPosts = async (req, res) => {
  try {
    const { authorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if user is requesting their own posts
    if (req.user.user_id !== parseInt(authorId)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view these posts'
      });
    }

    const posts = await Post.getAuthorPosts(authorId, limit, offset);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get author posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch author posts'
    });
  }
};

// Update post status (publish/unpublish)
const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;
    const userId = req.user.user_id;

    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be draft, published, or archived'
      });
    }

    // Check if post exists and user is the author
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author_id !== userId && req.user.role_name !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.updatePostStatus(postId, status);

    res.json({
      success: true,
      message: `Post ${status === 'published' ? 'published' : status === 'draft' ? 'moved to draft' : 'archived'} successfully`,
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post status'
    });
  }
};

// Get all published posts for public viewing
const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.getPublishedPosts();
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get public posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

// Get all tags with post counts
const getTags = async (req, res) => {
  try {
    const tags = await Post.getAllTags();
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostBySlug,
  toggleLike,
  getPostsByAuthor,
  getAuthorPosts,
  updatePost,
  updatePostStatus,
  deletePost,
  getPublicPosts,
  getTags
};
