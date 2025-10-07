import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, currentView, onNavigate }) => {
  const { locale, t } = useLocale();

  const menuItems = [
    {
      id: 'create',
      label: locale === 'ar' ? 'إنشاء تقرير جديد' : 'Create New Report',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'reports',
      label: locale === 'ar' ? 'تقاريري' : 'My Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'settings',
      label: locale === 'ar' ? 'الإعدادات' : 'Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  if (user && user.role === 'admin') {
    menuItems.push({
      id: 'admin',
      label: locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-red-500 to-orange-600'
    });
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} h-full w-80 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : locale === 'ar' ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{locale === 'ar' ? 'القائمة' : 'Menu'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {user?.avatarUrl ? (
              <img
                src={`http://localhost:5000${user.avatarUrl}`}
                alt={user.firstName}
                className="w-16 h-16 rounded-full border-4 border-white/30 object-cover shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                  if (fallbackDiv) {
                    fallbackDiv.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div 
              className={`fallback-avatar w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg ${user?.avatarUrl ? 'hidden' : ''}`}
            >
              <span className="text-3xl font-bold">
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-indigo-100">{user?.email}</p>
              <p className="text-xs text-indigo-200 mt-1">
                {user?.role === 'admin' ? '👑 ' + (locale === 'ar' ? 'مدير' : 'Admin') : '👤 ' + (locale === 'ar' ? 'مستخدم' : 'User')}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <div className={`${currentView === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.icon}
              </div>
              <span className="font-medium text-lg">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{locale === 'ar' ? 'مدعوم بـ AI' : 'Powered by AI'}</p>
            <p className="text-xs mt-1">Groq Llama 3.3 70B</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

