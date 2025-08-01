import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchPostComments = createAsyncThunk(
  'comments/fetchPostComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data.data; // Now returns comments directly with nested replies
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ content, postId, parentCommentId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts/comments', {
        content,
        postId,
        parentCommentId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/comments/${commentId}`, { content });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete comment');
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  'comments/toggleCommentLike',
  async ({ commentId, likeType }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/comments/${commentId}/like`, { 
        like_type: likeType 
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle like');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    loading: {
      fetch: false,
      create: false,
      update: false,
      delete: false,
      like: false
    },
    errors: {
      fetch: null,
      create: null,
      update: null,
      delete: null,
      like: null
    }
  },
  reducers: {
    clearCommentErrors: (state) => {
      state.errors = {
        fetch: null,
        create: null,
        update: null,
        delete: null,
        like: null
      };
    },
    addReply: (state, action) => {
      const { parentCommentId, reply } = action.payload;
      const parentComment = state.comments.find(c => c.comment_id === parentCommentId);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(reply);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchPostComments.pending, (state) => {
        state.loading.fetch = true;
        state.errors.fetch = null;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.comments = action.payload;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.loading.fetch = false;
        state.errors.fetch = action.payload;
      })
      
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading.create = false;
        const newComment = action.payload;
        
        if (newComment.parent_comment_id) {
          // It's a reply
          const parentComment = state.comments.find(c => c.comment_id === newComment.parent_comment_id);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(newComment);
          }
        } else {
          // It's a top-level comment
          state.comments.unshift(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      })
      
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading.update = false;
        const updatedComment = action.payload;
        
        // Find and update comment in state
        const updateCommentInArray = (comments) => {
          const index = comments.findIndex(c => c.comment_id === updatedComment.comment_id);
          if (index !== -1) {
            comments[index] = { ...comments[index], ...updatedComment };
            return true;
          }
          return false;
        };
        
        // Try to update in main comments
        if (!updateCommentInArray(state.comments)) {
          // Try to update in replies
          state.comments.forEach(comment => {
            if (comment.replies) {
              updateCommentInArray(comment.replies);
            }
          });
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      })
      
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading.delete = false;
        const commentId = action.payload;
        
        // Remove from main comments
        state.comments = state.comments.filter(c => c.comment_id !== commentId);
        
        // Remove from replies
        state.comments.forEach(comment => {
          if (comment.replies) {
            comment.replies = comment.replies.filter(r => r.comment_id !== commentId);
          }
        });
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
      })
      
      // Toggle comment like
      .addCase(toggleCommentLike.pending, (state) => {
        state.loading.like = true;
        state.errors.like = null;
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        state.loading.like = false;
        const response = action.payload;
        const { liked, likeCount } = response;
        
        // We need to get the comment ID from the action meta
        const commentId = action.meta.arg.commentId;
        
        // Update like info in state
        const updateLikeInArray = (comments) => {
          const comment = comments.find(c => c.comment_id === commentId);
          if (comment) {
            comment.like_count = likeCount;
            comment.user_liked = liked;
            return true;
          }
          return false;
        };
        
        // Try to update in main comments
        if (!updateLikeInArray(state.comments)) {
          // Try to update in replies
          state.comments.forEach(comment => {
            if (comment.replies) {
              updateLikeInArray(comment.replies);
            }
          });
        }
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        state.loading.like = false;
        state.errors.like = action.payload;
      });
  }
});

export const { clearCommentErrors, addReply } = commentsSlice.actions;

// Memoized selectors
const selectCommentsState = (state) => state.comments;

export const selectComments = createSelector(
  [selectCommentsState],
  (commentsState) => commentsState.comments
);

export const selectCommentsLoading = createSelector(
  [selectCommentsState],
  (commentsState) => commentsState.loading
);

export const selectCommentsErrors = createSelector(
  [selectCommentsState],
  (commentsState) => commentsState.errors
);

export default commentsSlice.reducer;
