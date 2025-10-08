import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { FileText, Calendar, User, Eye, Download, Search, Filter, Globe } from 'lucide-react';

interface Report {
  _id: string;
  filename: string;
  generatedReport: string;
  createdAt: string;
  generatedAt: string;
  language: string;
  userId: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  prompt: string;
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

const BlogPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ar' | 'en'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    fetchPublicReports();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, selectedLanguage, sortBy]);

  const fetchPublicReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/public');
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching public reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${report.userId.firstName} ${report.userId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(report => report.language === selectedLanguage);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.generatedAt || a.createdAt).getTime();
      const dateB = new Date(b.generatedAt || b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredReports(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === 'ar'
      ? date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getExcerpt = (content: string, maxLength: number = 200) => {
    const cleanText = content.replace(/[#*`]/g, '').trim();
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText;
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/blog/${reportId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleNavigation = (view: string) => {
    setSidebarOpen(false);
    navigate(`/${view}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} />
      
      {/* Sidebar for logged-in users */}
      {user && (
        <>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
            currentView="blog"
            onNavigate={handleNavigation}
          />
          
          {/* Burger Menu Button */}
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              {locale === 'ar' ? '📊 مدونة التقارير' : '📊 Reports Blog'}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8">
              {locale === 'ar'
                ? 'اكتشف تقارير احترافية مولدة بالذكاء الاصطناعي'
                : 'Discover professional AI-generated reports'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-blue-100">
                <FileText className="w-5 h-5" />
                <span>{filteredReports.length} {locale === 'ar' ? 'تقرير' : 'Reports'}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Globe className="w-5 h-5" />
                <span>{locale === 'ar' ? 'متاح للجميع' : 'Public Access'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'ابحث عن تقرير...' : 'Search reports...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
              />
            </div>

            {/* Language Filter */}
            <div className="relative">
              <Filter className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'all' | 'ar' | 'en')}
                className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
              >
                <option value="all">{locale === 'ar' ? 'جميع اللغات' : 'All Languages'}</option>
                <option value="ar">{locale === 'ar' ? 'العربية' : 'Arabic'}</option>
                <option value="en">{locale === 'ar' ? 'الإنجليزية' : 'English'}</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">{locale === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</option>
                <option value="oldest">{locale === 'ar' ? 'الأقدم أولاً' : 'Oldest First'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {locale === 'ar' ? 'لا توجد تقارير' : 'No Reports Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? 'جرب تغيير معايير البحث' : 'Try changing your search criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
                onClick={() => handleViewReport(report._id)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-100 transition-colors">
                        {report.filename}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-100 text-sm">
                        <Globe className="w-4 h-4" />
                        <span>{report.language === 'ar' ? 'العربية' : 'English'}</span>
                      </div>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                    {getExcerpt(report.generatedReport)}
                  </p>

                  {/* Prompt */}
                  {report.prompt && (
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {locale === 'ar' ? 'الطلب:' : 'Prompt:'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                        {report.prompt}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>
                        {report.userId.firstName} {report.userId.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(report.generatedAt || report.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report._id);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      {locale === 'ar' ? 'عرض' : 'View'}
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await axios.get(
                            `http://localhost:5000/api/reports/${report._id}/download`,
                            { responseType: 'blob' }
                          );
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${report.filename}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (error) {
                          console.error('Download failed:', error);
                        }
                      }}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {locale === 'ar' ? 'جاهز لإنشاء تقريرك الخاص؟' : 'Ready to Create Your Own Report?'}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {locale === 'ar'
                ? 'انضم إلينا الآن وابدأ في توليد تقارير احترافية بالذكاء الاصطناعي'
                : 'Join us now and start generating professional AI-powered reports'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                {locale === 'ar' ? '🚀 ابدأ مجاناً' : '🚀 Get Started Free'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;

