import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ReportGenerator from './components/ReportGenerator';
import ReportDisplay from './components/ReportDisplay';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import UserReports from './components/UserReports';
import AdminDashboard from './components/AdminDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Report {
  _id: string;
  filename: string;
  status: string;
  generatedReport?: string;
  prompt?: string;
  createdAt: string;
  generatedAt?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function App() {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserReports, setShowUserReports] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

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
    setShowLogin(false);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentReport(null);
    setShowUserReports(false);
    setShowAdminDashboard(false);
  };

  const handleUploadNew = () => {
    setShowUserReports(false);
    setShowAdminDashboard(false);
    setCurrentReport(null);
  };

  const handleBackToMain = () => {
    setShowUserReports(false);
    setShowAdminDashboard(false);
    setCurrentReport(null);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">جاري التحميل...</div>
          </div>
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  if (showLogin) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  if (showRegister) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  if (showAdminDashboard && user && user.role === 'admin') {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <Header user={user} onLogout={handleLogout} />
          <AdminDashboard user={user} onBack={handleBackToMain} />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  if (showUserReports && user) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <Header user={user} onLogout={handleLogout} />
          <UserReports user={user} onUploadNew={handleUploadNew} />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
            <Header user={user} onLogout={handleLogout} />
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
                مولد التقارير الذكية
              </h1>
              <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                🚀 حول بياناتك إلى رؤى ذكية مع الذكاء الاصطناعي المتقدم
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">تحليل متقدم</h3>
                <p className="text-gray-600">تحليل ذكي للبيانات مع إحصائيات شاملة</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">ذكاء اصطناعي</h3>
                <p className="text-gray-600">تقارير مبنية على أحدث تقنيات AI</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">توصيات ذكية</h3>
                <p className="text-gray-600">نصائح وإرشادات مبنية على البيانات</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10">تسجيل الدخول</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-lg font-bold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10">إنشاء حساب جديد</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
          </div>
      </LocaleProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LocaleProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
          <Header user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setShowUserReports(false);
                setShowAdminDashboard(false);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                !showUserReports && !showAdminDashboard
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {locale === 'ar' ? 'إنشاء تقرير جديد' : 'Create New Report'}
              </span>
            </button>
            <button
              onClick={() => {
                setShowUserReports(true);
                setShowAdminDashboard(false);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                showUserReports && !showAdminDashboard
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {locale === 'ar' ? 'تقاريري' : 'My Reports'}
              </span>
            </button>
            {user && user.role === 'admin' && (
              <button
                onClick={() => {
                  setShowUserReports(false);
                  setShowAdminDashboard(true);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  showAdminDashboard
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Welcome Section */}
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
            {locale === 'ar' ? 'ابدأ بتحليل بياناتك وإنشاء تقارير ذكية في دقائق' : 'Start analyzing your data and creating smart reports in minutes'}
          </p>
        </div>

        {showUserReports ? (
          <UserReports user={user} onUploadNew={handleUploadNew} />
        ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Upload & Generate */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">رفع الملفات</h3>
              </div>
              <FileUpload 
                onUploadSuccess={(reportId) => {
                  fetchReport(reportId);
                }}
              />
            </div>
            
            {currentReport && currentReport.status === 'pending' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">توليد التقرير</h3>
                </div>
                <ReportGenerator 
                  reportId={currentReport._id}
                  onReportGenerated={(report) => {
                    setCurrentReport(report);
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Right Column - Report Display */}
          <div>
            {currentReport && currentReport.status === 'completed' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">التقرير المولد</h3>
                </div>
                <ReportDisplay 
                  report={currentReport}
                  onDownloadPDF={() => downloadPDF(currentReport._id)}
                />
              </div>
            )}
            
            {!currentReport && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">لا توجد تقارير بعد</h3>
                <p className="text-gray-500 text-lg">ارفع ملفاً وابدأ في إنشاء تقريرك الأول</p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );

  async function fetchReport(reportId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE}/reports/${reportId}`, { headers });
      
      if (response.data.success) {
        setCurrentReport(response.data.data.report);
      } else {
        console.error('Error fetching report:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }


  async function downloadPDF(reportId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE}/reports/${reportId}/download`, {
        responseType: 'blob',
        headers
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }
}

export default App;
