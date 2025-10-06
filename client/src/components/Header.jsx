import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';

const Header = ({ user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLocale();
  const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api','');
  return (
    <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/20 sticky top-0 z-50 dark:bg-slate-900/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                  {t('welcome')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('welcomeMessage')}</p>
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2 mr-2">
            <button onClick={toggleLocale} className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-slate-100 to-white text-slate-700 hover:shadow dark:from-slate-800 dark:to-slate-900 dark:text-slate-200">
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-slate-100 to-white text-slate-700 hover:shadow dark:from-slate-800 dark:to-slate-900 dark:text-slate-200">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={`${apiRoot}${user.avatarUrl}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {t('welcomeComma')} {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role === 'admin' ? t('admin') : t('user')}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('logout')}</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium dark:text-slate-300">{t('welcomeMessage')}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
