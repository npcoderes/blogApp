import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks for API calls
export const fetchPublicPosts = createAsyncThunk(
  'posts/fetchPublicPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/public');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostTags = createAsyncThunk(
  'posts/fetchPostTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/tags');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const fetchAuthorPosts = createAsyncThunk(
  'posts/fetchAuthorPosts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.user_id;
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }
      const response = await api.get(`/posts/author/${userId}/all`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch author posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts/create', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const updatePostStatus = createAsyncThunk(
  'posts/updatePostStatus',
  async ({ postId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/posts/${postId}/status`, { status });
      return { postId, status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post status');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const togglePostLike = createAsyncThunk(
  'posts/togglePostLike',
  async ({ postId, likeType }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`, { likeType });
      return { postId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

const initialState = {
  // Public posts (for home page)
  publicPosts: [],
  publicPostsLoading: false,
  publicPostsError: null,

  // Author posts (for dashboard)
  authorPosts: [],
  authorPostsLoading: false,
  authorPostsError: null,

  // Current post (for viewing)
  currentPost: null,
  currentPostLoading: false,
  currentPostError: null,

  // Tags
  tags: [],
  tagsLoading: false,
  tagsError: null,

  // Filters
  selectedTag: '',
  searchQuery: '',
  selectedAuthor: '',

  // UI state
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  likeLoading: false,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedAuthor: (state, action) => {
      state.selectedAuthor = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.currentPostError = null;
    },
    clearErrors: (state) => {
      state.publicPostsError = null;
      state.authorPostsError = null;
      state.currentPostError = null;
      state.tagsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch public posts
    builder
      .addCase(fetchPublicPosts.pending, (state) => {
        state.publicPostsLoading = true;
        state.publicPostsError = null;
      })
      .addCase(fetchPublicPosts.fulfilled, (state, action) => {
        state.publicPostsLoading = false;
        state.publicPosts = action.payload;
      })
      .addCase(fetchPublicPosts.rejected, (state, action) => {
        state.publicPostsLoading = false;
        state.publicPostsError = action.payload;
      })

    // Fetch post tags
    builder
      .addCase(fetchPostTags.pending, (state) => {
        state.tagsLoading = true;
        state.tagsError = null;
      })
      .addCase(fetchPostTags.fulfilled, (state, action) => {
        state.tagsLoading = false;
        state.tags = action.payload;
      })
      .addCase(fetchPostTags.rejected, (state, action) => {
        state.tagsLoading = false;
        state.tagsError = action.payload;
      })

    // Fetch post by slug
    builder
      .addCase(fetchPostBySlug.pending, (state) => {
        state.currentPostLoading = true;
        state.currentPostError = null;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.currentPostLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.currentPostLoading = false;
        state.currentPostError = action.payload;
      })

    // Fetch author posts
    builder
      .addCase(fetchAuthorPosts.pending, (state) => {
        state.authorPostsLoading = true;
        state.authorPostsError = null;
      })
      .addCase(fetchAuthorPosts.fulfilled, (state, action) => {
        state.authorPostsLoading = false;
        state.authorPosts = action.payload;
      })
      .addCase(fetchAuthorPosts.rejected, (state, action) => {
        state.authorPostsLoading = false;
        state.authorPostsError = action.payload;
      })

    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        state.authorPosts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state) => {
        state.createLoading = false;
      })

    // Update post
    builder
      .addCase(updatePost.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.authorPosts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.authorPosts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state) => {
        state.updateLoading = false;
      })

    // Update post status
    builder
      .addCase(updatePostStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updatePostStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { postId, status } = action.payload;
        const index = state.authorPosts.findIndex(post => post.id === postId);
        if (index !== -1) {
          state.authorPosts[index].status = status;
        }
      })
      .addCase(updatePostStatus.rejected, (state) => {
        state.updateLoading = false;
      })

    // Delete post
    builder
      .addCase(deletePost.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.authorPosts = state.authorPosts.filter(post => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state) => {
        state.deleteLoading = false;
      })
      
      // Toggle post like
      .addCase(togglePostLike.pending, (state) => {
        state.likeLoading = true;
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        state.likeLoading = false;
        const { postId, likeCount, userLiked } = action.payload;
        
        // Update public posts
        const publicPost = state.publicPosts.find(post => post.id === postId || post.post_id === postId);
        if (publicPost) {
          publicPost.like_count = likeCount;
          publicPost.user_liked = userLiked;
        }
        
        // Update current post if it matches
        if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
          state.currentPost.like_count = likeCount;
          state.currentPost.user_liked = userLiked;
        }
        
        // Update author posts
        const authorPost = state.authorPosts.find(post => post.id === postId || post.post_id === postId);
        if (authorPost) {
          authorPost.like_count = likeCount;
          authorPost.user_liked = userLiked;
        }
      })
      .addCase(togglePostLike.rejected, (state) => {
        state.likeLoading = false;
      });
  },
});

export const { 
  setSelectedTag, 
  setSearchQuery, 
  setSelectedAuthor,
  clearCurrentPost, 
  clearErrors 
} = postsSlice.actions;

// Base selectors
const selectPostsState = (state) => state.posts;

// Memoized selectors
export const selectPublicPosts = createSelector(
  [selectPostsState],
  (postsState) => postsState.publicPosts
);

export const selectAuthorPosts = createSelector(
  [selectPostsState],
  (postsState) => postsState.authorPosts
);

export const selectCurrentPost = createSelector(
  [selectPostsState],
  (postsState) => postsState.currentPost
);

export const selectTags = createSelector(
  [selectPostsState],
  (postsState) => postsState.tags
);

export const selectSelectedTag = createSelector(
  [selectPostsState],
  (postsState) => postsState.selectedTag
);

export const selectSearchQuery = createSelector(
  [selectPostsState],
  (postsState) => postsState.searchQuery
);

export const selectSelectedAuthor = createSelector(
  [selectPostsState],
  (postsState) => postsState.selectedAuthor
);

export const selectUniqueAuthors = createSelector(
  [selectPublicPosts],
  (publicPosts) => {
    const authorsMap = new Map();
    
    publicPosts.forEach(post => {
      if (post.username && !authorsMap.has(post.username)) {
        authorsMap.set(post.username, {
          name: post.username,
          profile_picture: post.profile_picture,
          count: 1
        });
      } else if (post.username) {
        const author = authorsMap.get(post.username);
        author.count += 1;
      }
    });
    
    return Array.from(authorsMap.values()).sort((a, b) => b.count - a.count);
  }
);

export const selectFilteredPosts = createSelector(
  [selectPublicPosts, selectSelectedTag, selectSearchQuery, selectSelectedAuthor],
  (publicPosts, selectedTag, searchQuery, selectedAuthor) => {
    return publicPosts.filter(post => {
      const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAuthor = !selectedAuthor || 
        post.username?.toLowerCase().includes(selectedAuthor.toLowerCase());
      return matchesTag && matchesSearch && matchesAuthor;
    });
  }
);

export const selectPostsLoading = createSelector(
  [selectPostsState],
  (postsState) => ({
    publicPosts: postsState.publicPostsLoading,
    authorPosts: postsState.authorPostsLoading,
    currentPost: postsState.currentPostLoading,
    tags: postsState.tagsLoading,
    create: postsState.createLoading,
    update: postsState.updateLoading,
    delete: postsState.deleteLoading,
  })
);

export const selectPostsErrors = createSelector(
  [selectPostsState],
  (postsState) => ({
    publicPosts: postsState.publicPostsError,
    authorPosts: postsState.authorPostsError,
    currentPost: postsState.currentPostError,
    tags: postsState.tagsError,
  })
);

export default postsSlice.reducer;
