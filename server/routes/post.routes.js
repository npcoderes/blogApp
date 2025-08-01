const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPostsByAuthor,
    getAuthorPosts,
    getPostBySlug,
    toggleLike,
    updatePost,
    updatePostStatus,
    deletePost,
    getPublicPosts,
    getTags
} = require('../controllers/post.controller');
const {
    createComment,
    getPostComments,
    getCommentReplies,
    toggleCommentLike,
    updateComment,
    deleteComment,
    getUserComments

} = require('../controllers/comment.controller');
const {authenticateToken} = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/create', authenticateToken, upload.single('featuredImage'), createPost);
router.get('/', getAllPosts);
router.get('/public', getPublicPosts);
router.get('/tags', getTags);
router.get('/author/:authorId', getPostsByAuthor);
router.get('/author/:authorId/all', authenticateToken, getAuthorPosts);
router.get('/:slug', getPostBySlug);
router.put('/:postId', authenticateToken, upload.single('featuredImage'), updatePost);
router.patch('/:postId/status', authenticateToken, updatePostStatus);
router.delete('/:postId', authenticateToken, deletePost);
router.post('/:postId/like', authenticateToken, toggleLike);

router.post('/comments', authenticateToken, createComment);
router.get('/:postId/comments', authenticateToken, getPostComments);
router.get('/comments/:commentId/replies', authenticateToken, getCommentReplies);
router.put('/comments/:commentId', authenticateToken, updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);
router.post('/comments/:commentId/like', authenticateToken, toggleCommentLike);
router.get('/user/:userId/comments', authenticateToken, getUserComments);

module.exports = router;
