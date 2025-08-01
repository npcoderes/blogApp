import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignupReader from "./pages/SignupReader";
import SignupAuthor from "./pages/SignupAuthor";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import PostManagement from "./pages/PostManagement";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import MyPosts from "./pages/MyPosts";
import ViewPost from "./pages/ViewPost";
import PublicPostView from "./pages/PublicPostView";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />

        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup-reader" element={<SignupReader />} />
        <Route path="/signup-author" element={<SignupAuthor />} />
        <Route
          path="/post/:slug"
          element={
            <ProtectedRoute requiredRole="reader">
              <PublicPostView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute requiredRole="reader">
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute requiredRole="reader">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-post"
            element={
              <ProtectedRoute requiredRole="author">
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-posts"
            element={
              <ProtectedRoute requiredRole="author">
                <MyPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="view-post/:slug"
            element={
              <ProtectedRoute requiredRole="author">
                <ViewPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-post"
            element={
              <ProtectedRoute requiredRole="author">
                <EditPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="user-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="post-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <PostManagement />
              </ProtectedRoute>
            }
          />
        </Route>

  

        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="reader">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      </AuthProvider>
    </Router>
  );
}

export default App;
