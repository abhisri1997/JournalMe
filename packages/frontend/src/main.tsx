import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import { ThemeProvider } from "./theme";
import { NotificationProvider } from "./contexts/NotificationContext";
import { FollowRequestProvider } from "./contexts/FollowRequestContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <FollowRequestProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path='/' element={<App />} />
              <Route
                path='/journal'
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/create-post'
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/post/:postId'
                element={
                  <ProtectedRoute>
                    <PostDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/edit-profile'
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/settings'
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/community'
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
            </Routes>
          </BrowserRouter>
        </FollowRequestProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
