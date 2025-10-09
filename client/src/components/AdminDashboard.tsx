import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import UserManagement from './UserManagement';
import AIChatAdmin from './AIChatAdmin';
import { getStatusColor, getStatusText, formatDate } from '../utils/reportHelpers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

interface Report {
  _id: string;
  filename: string;
  status: string;
  generatedReport?: string;
  prompt?: string;
  createdAt: string;
  generatedAt?: string;
  isPublic: boolean;
  userId?: User;
}

interface AdminDashboardProps {
  user: any;
  onBack: () => void;
}

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  iconColor: string;
}> = ({ icon, label, value, bgColor, iconColor }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg">
    <div className="flex items-center">
      <div className={`p-2 sm:p-3 rounded-full ${bgColor}`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRatings, setShowRatings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterPublic, setFilterPublic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'ai-chat' | 'settings'>('reports');
  const { theme } = useTheme();
  const { locale, t } = useLocale();
  
  const API_ROOT = API_BASE.replace('/api', '');

  useEffect(() => {
    fetchAllReports();
    fetchRatingsSettings();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/reports/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReports(response.data.data.reports);
      }
    } catch (err) {
      setError(locale === 'ar' ? 'فشل في تحميل التقارير' : 'Failed to load reports');
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const deleteReportConfirm = async (reportId: string, filename: string) => {
    const confirmMessage = locale === 'ar' 
      ? `هل أنت متأكد من حذف التقرير "${filename}"؟` 
      : `Are you sure you want to delete "${filename}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/reports/admin/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReports(reports.filter(r => r._id !== reportId));
      
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'فشل حذف التقرير' : 'Failed to delete report'));
      console.error('Delete error:', err);
    }
  };

  const fetchRatingsSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/reports/settings/ratings`);
      setShowRatings(response.data.data.showRatings);
    } catch (error) {
      console.error('Error fetching ratings settings:', error);
    }
  };

  const handleToggleRatings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem('token');
      const newValue = !showRatings;
      
      await axios.put(
        `${API_BASE}/reports/settings/ratings`,
        { showRatings: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowRatings(newValue);
      alert(locale === 'ar' 
        ? `✅ تم ${newValue ? 'إظهار' : 'إخفاء'} التقييمات بنجاح`
        : `✅ Ratings ${newValue ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
    } finally {
      setSavingSettings(false);
    }
  };


  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesUser = filterUser === 'all' || (report.userId && report.userId._id === filterUser);
    const matchesPublic = filterPublic === 'all' || 
      (filterPublic === 'public' && report.isPublic) ||
      (filterPublic === 'private' && !report.isPublic);
    const matchesSearch = searchTerm === '' || 
      report.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.prompt && report.prompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.userId && (
        report.userId.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userId.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userId.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userId.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    return matchesStatus && matchesUser && matchesPublic && matchesSearch;
  });

  // Get unique users for filter
  const uniqueUsers = Array.from(
    new Map(
      reports
        .filter(r => r.userId)
        .map(r => [r.userId!._id, r.userId!])
    ).values()
  );

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    processing: reports.filter(r => r.status === 'processing').length,
    error: reports.filter(r => r.status === 'error').length,
    public: reports.filter(r => r.isPublic).length,
    users: Array.from(new Set(reports.map(r => r.userId?._id).filter(Boolean))).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'ar' ? 'جاري تحميل التقارير...' : 'Loading reports...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('adminDashboard')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'ar' 
                  ? `مرحباً ${user.firstName}، إدارة جميع التقارير والمستخدمين` 
                  : `Welcome ${user.firstName}, manage all reports and users`
                }
              </p>
            </div>
            <button
              onClick={onBack}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('back')}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">{t('reportsTab')}</span>
                <span className="sm:hidden">{locale === 'ar' ? 'تقارير' : 'Reports'}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span className="hidden sm:inline">{t('usersTab')}</span>
                <span className="sm:hidden">{locale === 'ar' ? 'مستخدمين' : 'Users'}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'ai-chat'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden sm:inline">{locale === 'ar' ? 'محادثة AI' : 'AI Chat'}</span>
                <span className="sm:hidden">{locale === 'ar' ? 'AI' : 'AI'}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                <span className="sm:hidden">{locale === 'ar' ? 'إعدادات' : 'Settings'}</span>
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <UserManagement user={user} onBack={onBack} />
        ) : activeTab === 'ai-chat' ? (
          <AIChatAdmin user={user} />
        ) : activeTab === 'settings' ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {locale === 'ar' ? '⚙️ إعدادات النظام' : '⚙️ System Settings'}
            </h2>

            {/* Ratings Settings */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {locale === 'ar' ? 'إظهار/إخفاء التقييمات' : 'Show/Hide Ratings'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {locale === 'ar' 
                        ? 'تحكم في إظهار أو إخفاء نظام التقييمات في المدونة والتقارير العامة'
                        : 'Control the visibility of the rating system on blog and public reports'
                      }
                    </p>
                  </div>
                  <button
                    onClick={handleToggleRatings}
                    disabled={savingSettings}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      showRatings 
                        ? 'bg-green-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    } ${savingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        showRatings ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-lg font-medium ${
                    showRatings 
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  }`}>
                    {showRatings 
                      ? (locale === 'ar' ? '✅ التقييمات مفعّلة' : '✅ Ratings Enabled')
                      : (locale === 'ar' ? '❌ التقييمات معطّلة' : '❌ Ratings Disabled')
                    }
                  </div>
                  {savingSettings && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">
                      {locale === 'ar' ? 'ملاحظة:' : 'Note:'}
                    </p>
                    <p>
                      {locale === 'ar' 
                        ? 'عند إخفاء التقييمات، لن يتمكن المستخدمون من رؤية أو إضافة تقييمات جديدة. التقييمات الموجودة ستبقى محفوظة.'
                        : 'When ratings are hidden, users will not be able to see or add new ratings. Existing ratings will remain saved.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label={locale === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}
            value={stats.total}
            bgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            label={locale === 'ar' ? 'مكتملة' : 'Completed'}
            value={stats.completed}
            bgColor="bg-green-100 dark:bg-green-900"
            iconColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label={locale === 'ar' ? 'قيد المعالجة' : 'Processing'}
            value={stats.processing}
            bgColor="bg-yellow-100 dark:bg-yellow-900"
            iconColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label={locale === 'ar' ? 'أخطاء' : 'Errors'}
            value={stats.error}
            bgColor="bg-red-100 dark:bg-red-900"
            iconColor="text-red-600 dark:text-red-400"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label={locale === 'ar' ? 'عامة' : 'Public'}
            value={stats.public}
            bgColor="bg-purple-100 dark:bg-purple-900"
            iconColor="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
            label={t('usersTab')}
            value={stats.users}
            bgColor="bg-indigo-100 dark:bg-indigo-900"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? 'البحث' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث في التقارير...' : 'Search reports...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="processing">{locale === 'ar' ? 'قيد المعالجة' : 'Processing'}</option>
                <option value="error">{locale === 'ar' ? 'خطأ' : 'Error'}</option>
                <option value="pending">{locale === 'ar' ? 'في الانتظار' : 'Pending'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? 'المستخدم' : 'User'}
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">{locale === 'ar' ? 'جميع المستخدمين' : 'All Users'}</option>
                {uniqueUsers.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? 'الخصوصية' : 'Privacy'}
              </label>
              <select
                value={filterPublic}
                onChange={(e) => setFilterPublic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">{locale === 'ar' ? 'الكل' : 'All'}</option>
                <option value="public">{locale === 'ar' ? 'عام' : 'Public'}</option>
                <option value="private">{locale === 'ar' ? 'خاص' : 'Private'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {locale === 'ar' ? 'لا توجد تقارير' : 'No reports found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'ar' 
                ? 'لا توجد تقارير تطابق معايير البحث' 
                : 'No reports match the search criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-all">
                          {report.filename}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status, locale)}
                          </span>
                          {report.isPublic && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {locale === 'ar' ? 'عام' : 'Public'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* User Info with Avatar */}
                      {report.userId && (() => {
                        const userId = report.userId;
                        return (
                          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                              {userId.avatarUrl && userId.avatarUrl.trim() !== '' ? (
                                <img 
                                  src={`${API_ROOT}${userId.avatarUrl}`} 
                                  alt={`${userId.firstName} ${userId.lastName}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const initials = document.createElement('span');
                                      initials.className = 'text-white text-base font-bold';
                                      initials.textContent = `${userId.firstName.charAt(0)}${userId.lastName.charAt(0)}`;
                                      parent.appendChild(initials);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-white text-base font-bold">
                                  {userId.firstName.charAt(0)}{userId.lastName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {userId.firstName} {userId.lastName}
                                </p>
                                {userId.role === 'admin' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    {locale === 'ar' ? 'مدير' : 'Admin'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                @{userId.username} • {userId.email}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <p>
                          <span className="font-medium">
                            {locale === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                          </span> {formatDate(report.createdAt, locale)}
                        </p>
                        {report.generatedAt && (
                          <p>
                            <span className="font-medium">
                              {locale === 'ar' ? 'تاريخ التوليد:' : 'Generated:'}
                            </span> {formatDate(report.generatedAt, locale)}
                          </p>
                        )}
                        {report.prompt && (
                          <p className="mt-2">
                            <span className="font-medium">
                              {locale === 'ar' ? 'الطلب:' : 'Prompt:'}
                            </span> {report.prompt}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                      {report.generatedReport && (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200"
                          title={locale === 'ar' ? 'عرض' : 'View'}
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      
                      {report.status === 'completed' && (
                        <button
                          onClick={() => downloadPDF(report._id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                          title={locale === 'ar' ? 'تحميل' : 'Download'}
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteReportConfirm(report._id, report.filename)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                        title={locale === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedReport.filename}
                  </h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: selectedReport.generatedReport?.replace(/\n/g, '<br>') || '' 
                  }} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                >
                  {locale === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => downloadPDF(selectedReport._id)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  {locale === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
