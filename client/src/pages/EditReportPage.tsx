import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Save, RefreshCw, ArrowLeft, Loader } from 'lucide-react';

interface Report {
  _id: string;
  filename: string;
  prompt: string;
  language: string;
  isPublic: boolean;
  generatedReport: string;
  status: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

const EditReportPage: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { reportId } = useParams<{ reportId: string }>();
  const { locale } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const reportData = response.data.success ? response.data.data : response.data;
      setReport(reportData);
      setEditedContent(reportData.generatedReport || '');
      setIsPublic(reportData.isPublic ?? true);
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل تحميل التقرير' : 'Failed to load report'));
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;

    if (!editedContent.trim()) {
      alert(locale === 'ar' ? 'لا يمكن حفظ تقرير فارغ' : 'Cannot save empty report');
      return;
    }

    try {
      setSaving(true);
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_BASE}/reports/${reportId}`,
        { 
          generatedReport: editedContent,
          isPublic 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(locale === 'ar' ? '✅ تم حفظ التعديلات' : '✅ Changes saved successfully');
      navigate('/reports');
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل حفظ التعديلات' : 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header user={user} onLogout={handleLogout} />
      
      {user && (
        <>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
            currentView="reports"
            onNavigate={handleNavigation}
          />
          
          <button
            onClick={() => setSidebarOpen(true)}
            className={`fixed top-20 ${locale === 'ar' ? 'right-4' : 'left-4'} z-30 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/reports')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {locale === 'ar' ? 'العودة إلى تقاريري' : 'Back to My Reports'}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {locale === 'ar' ? 'تعديل التقرير' : 'Edit Report'}
          </h1>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold">{locale === 'ar' ? 'الملف:' : 'File:'}</span>
              <span>{report.filename}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? '📝 محتوى التقرير' : '📝 Report Content'}
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={20}
                className={`w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
                placeholder={locale === 'ar' ? 'عدّل محتوى التقرير هنا...' : 'Edit report content here...'}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {locale === 'ar' 
                    ? 'يمكنك تعديل النص بحرية - يدعم Markdown'
                    : 'You can freely edit the text - Markdown supported'
                  }
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {editedContent.length} {locale === 'ar' ? 'حرف' : 'characters'}
                </span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {locale === 'ar' ? '🌍 تقرير عام' : '🌍 Public Report'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {locale === 'ar' 
                      ? 'سيظهر التقرير في المدونة ويمكن لأي شخص مشاهدته'
                      : 'Report will appear in blog and be visible to everyone'
                    }
                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/reports')}
                disabled={saving}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReportPage;

