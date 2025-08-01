import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", userData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.data);
        return {
          token: response.data.data,
          message: response.data.message,
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        return {
          message: response.data.message,
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }

      // Get user profile
      const profileResponse = await api.get("/user/profile");
      if (!profileResponse.data.success) {
        return rejectWithValue("Failed to fetch profile");
      }

      const userData = profileResponse.data.data;
      let userRole = "reader";

      // Check if user is admin
      try {
        const adminResponse = await api.get("/user/check-admin");
        if (adminResponse.data.success && adminResponse.data.isAdmin) {
          userRole = "admin";
        }
      } catch (adminError) {
        // Not admin, continue to check author
      }

      // Check if user is author (only if not admin)
      if (userRole === "reader") {
        try {
          const authorResponse = await api.get("/user/check-author");
          if (authorResponse.data.success && authorResponse.data.isAuthor) {
            userRole = "author";
          }
        } catch (authorError) {
          // Not author, remain as reader
        }
      }

      return {
        user: userData,
        role: userRole,
        token: token
      };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(error.response?.data?.error || "Authentication failed");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        return response.data.user;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Profile update failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    userRole: 'reader', // 'reader', 'author', 'admin'
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem("token"),
    isInitialized: false, // Add this to track if auth is initialized
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.userRole = 'reader';
      state.isAuthenticated = false;
      state.isInitialized = false;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.userRole = action.payload.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.userRole = 'reader';
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setUser, setUserRole, setInitialized } = authSlice.actions;
export default authSlice.reducer;
