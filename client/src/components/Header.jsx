import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Report Generator
            </h1>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                مرحباً، {user.firstName} {user.lastName}
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              نظام إدارة التقارير الذكية
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
