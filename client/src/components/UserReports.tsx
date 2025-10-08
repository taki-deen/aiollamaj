import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import { getStatusColor, getStatusText, formatDate } from '../utils/reportHelpers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Report {
  _id: string;
  filename: string;
  status: string;
  generatedReport?: string;
  prompt?: string;
  createdAt: string;
  generatedAt?: string;
  isPublic: boolean;
}

interface UserReportsProps {
  user: any;
  onUploadNew: () => void;
}

const UserReports: React.FC<UserReportsProps> = ({ user, onUploadNew }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { theme } = useTheme();
  const { locale, t } = useLocale();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/reports`, {
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

  const togglePublicStatus = async (reportId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE}/reports/${reportId}/toggle-public`,
        { isPublic: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setReports(reports.map(r => 
          r._id === reportId ? { ...r, isPublic: !currentStatus } : r
        ));
        
        const message = !currentStatus
          ? (locale === 'ar' ? '✅ التقرير أصبح عاماً وسيظهر في المدونة' : '✅ Report is now public and will appear in the blog')
          : (locale === 'ar' ? '🔒 التقرير أصبح خاصاً' : '🔒 Report is now private');
        
        alert(message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'فشل تغيير حالة التقرير' : 'Failed to change report status'));
      console.error('Toggle public error:', err);
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
      await axios.delete(`${API_BASE}/reports/${reportId}`, {
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
                {locale === 'ar' ? 'تقاريري' : 'My Reports'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'ar' 
                  ? `مرحباً ${user.firstName}، يمكنك هنا عرض وإدارة جميع تقاريرك` 
                  : `Welcome ${user.firstName}, manage all your reports here`
                }
              </p>
            </div>
            <button
              onClick={onUploadNew}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {locale === 'ar' ? 'رفع تقرير جديد' : 'Upload New Report'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {locale === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {locale === 'ar' ? 'مكتملة' : 'Completed'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {locale === 'ar' ? 'قيد المعالجة' : 'Processing'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reports.filter(r => r.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {locale === 'ar' ? 'عامة' : 'Public'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reports.filter(r => r.isPublic).length}
                </p>
              </div>
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

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {locale === 'ar' ? 'لا توجد تقارير بعد' : 'No reports yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {locale === 'ar' 
                ? 'ابدأ بإنشاء تقريرك الأول لرؤية البيانات هنا' 
                : 'Start by creating your first report to see data here'
              }
            </p>
            <button
              onClick={onUploadNew}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {locale === 'ar' ? 'إنشاء تقرير جديد' : 'Create First Report'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-all mb-2 sm:mb-0">
                          {report.filename}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status, locale)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.isPublic 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {report.isPublic 
                              ? (locale === 'ar' ? '🌍 عام' : '🌍 Public')
                              : (locale === 'ar' ? '🔒 خاص' : '🔒 Private')
                            }
                          </span>
                        </div>
                      </div>
                      
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
                    
                    <div className="flex space-x-2 ml-4">
                      {report.generatedReport && (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      
                      {report.status === 'completed' && (
                        <>
                          <button
                            onClick={() => downloadPDF(report._id)}
                            className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                            title={locale === 'ar' ? 'تحميل' : 'Download'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => togglePublicStatus(report._id, report.isPublic)}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                              report.isPublic
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                            }`}
                            title={report.isPublic 
                              ? (locale === 'ar' ? 'جعله خاصاً' : 'Make Private')
                              : (locale === 'ar' ? 'جعله عاماً' : 'Make Public')
                            }
                          >
                            {report.isPublic ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => deleteReportConfirm(report._id, report.filename)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                        title={locale === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
};

export default UserReports;
