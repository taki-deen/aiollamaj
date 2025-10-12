import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocale } from '../contexts/LocaleContext';

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

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocale();

  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/create') return 'create';
    if (path === '/reports') return 'reports';
    if (path === '/settings') return 'settings';
    if (path === '/admin') return 'admin';
    return 'create';
  };

  const handleNavigation = (view: string) => {
    setSidebarOpen(false);
    navigate(`/${view}`);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Don't show sidebar on landing, login, or register pages
  const showSidebar = user && !['/login', '/register', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <Header 
        user={user} 
        onLogout={handleLogout}
        showBurgerMenu={!!showSidebar}
        onBurgerMenuClick={() => setSidebarOpen(true)}
      />
      
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          currentView={getCurrentView()}
          onNavigate={handleNavigation}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section for authenticated users on main pages */}
        {user && ['/create', '/reports', '/settings', '/admin'].includes(location.pathname) && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {locale === 'ar' ? `مرحباً ${user.firstName}! 👋` : `Welcome ${user.firstName}! 👋`}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {locale === 'ar' 
                ? 'ابدأ بتحليل بياناتك وإنشاء تقارير ذكية في دقائق' 
                : 'Start analyzing your data and creating smart reports in minutes'}
            </p>
          </div>
        )}

        {children}
      </main>
    </div>
  );
};

export default Layout;

