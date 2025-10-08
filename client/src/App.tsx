import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateReportPage from './pages/CreateReportPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <ThemeProvider>
        <LocaleProvider>
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
            <div className="text-lg dark:text-white">Loading...</div>
          </div>
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LocaleProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <Layout user={user} onLogout={handleLogout}>
              {user ? <Navigate to="/create" replace /> : <LandingPage />}
            </Layout>
          } />
          
          <Route path="/login" element={
            user ? <Navigate to="/create" replace /> : <LoginPage onLogin={handleLogin} />
          } />
          
          <Route path="/register" element={
            user ? <Navigate to="/create" replace /> : <RegisterPage onRegister={handleRegister} />
          } />

          {/* Email Verification & Password Reset Routes */}
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/create" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <CreateReportPage />
              </Layout>
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="/reports" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <ReportsPage user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="/settings" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <SettingsPage user={user} onUserUpdate={handleUserUpdate} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="/admin" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <AdminPage user={user} />
              </Layout>
            ) : <Navigate to="/login" replace />
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
