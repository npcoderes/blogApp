const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const Like = require("../models/like.model");

// Add comment to post
const createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const authorId = req.user.user_id;

    // Check if post exists
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // If it's a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.getCommentById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: "Parent comment not found",
        });
      }
    }

    const commentId = await Comment.createComment(
      content,
      authorId,
      postId,
      parentCommentId
    );
    const comment = await Comment.getCommentById(commentId);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create comment",
    });
  }
};

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if post exists
    const post = await Post.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const comments = await Comment.getPostCommentsWithReplies(postId, limit, offset);
    const total = await Comment.getPostCommentsCount(postId);

    res.json({
      success: true,
      data: comments, // Return comments directly with nested replies
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
    });
  }
};

// Get replies for a comment
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Check if comment exists
    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    const replies = await Comment.getCommentReplies(commentId, limit, offset);

    res.json({
      success: true,
      data: replies,
    });
  } catch (error) {
    console.error("Get comment replies error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comment replies",
    });
  }
};

// Like/Unlike comment
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user_id;

    // Check if comment exists
    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Toggle like
    const result = await Like.toggleLike(userId, "comment", commentId);
    const likeCount = await Like.getLikeCount("comment", commentId);

    res.json({
      success: true,
      message: result.action === "added" ? "Comment liked" : "Comment unliked",
      data: {
        liked: result.liked,
        likeCount: likeCount,
      },
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle comment like",
    });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.user_id;

    // Check if comment exists
    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Check if user is the author
    if (comment.author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this comment",
      });
    }

    const updatedComment = await Comment.updateComment(commentId, content);

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update comment",
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user_id;

    // Check if comment exists
    const comment = await Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Check if user is the author or admin
    if (comment.author_id !== userId && req.user.role_name !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this comment",
      });
    }

    await Comment.deleteComment(commentId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete comment",
    });
  }
};

// Get comments by user
const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const comments = await Comment.getCommentsByUser(userId, limit, offset);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Get user comments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user comments",
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  getCommentReplies,
  toggleCommentLike,
  updateComment,
  deleteComment,
  getUserComments,
};
