import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLocale } from '../contexts/LocaleContext';
import { generateBlogSchema } from '../utils/seo';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RatingStars from '../components/RatingStars';
import { FileText, Calendar, User, Eye, Download, Search, Filter, Globe, MessageCircle } from 'lucide-react';

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
  averageRating: number;
  totalRatings: number;
  ratings: Array<{
    userId: string;
    rating: number;
  }>;
  commentsCount: number;
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
  const [searchIn, setSearchIn] = useState<'all' | 'title' | 'content' | 'author'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'ar' | 'en'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical' | 'rating' | 'comments'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRatings, setShowRatings] = useState(true);
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
    fetchRatingsSettings();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, searchIn, selectedLanguage, sortBy, sortOrder]);

  const fetchPublicReports = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE}/reports/public`);
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching public reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingsSettings = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE}/reports/settings/ratings`);
      setShowRatings(response.data.data.showRatings);
    } catch (error) {
      console.error('Error fetching ratings settings:', error);
    }
  };

  const handleRate = async (reportId: string, rating: number) => {
    if (!user) {
      alert(locale === 'ar' ? 'يجب تسجيل الدخول للتقييم' : 'Please login to rate');
      navigate('/login');
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE}/reports/${reportId}/rating`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReports(reports.map(r => 
          r._id === reportId 
            ? { 
                ...r, 
                averageRating: response.data.data.averageRating,
                totalRatings: response.data.data.totalRatings,
                ratings: [...(r.ratings || []), { userId: user._id, rating }]
              }
            : r
        ));
        
        const message = locale === 'ar' ? '✅ تم التقييم بنجاح' : '✅ Rating added successfully';
        alert(message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل التقييم' : 'Rating failed'));
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      filtered = filtered.filter(report => {
        switch (searchIn) {
          case 'title':
            return report.filename.toLowerCase().includes(searchLower);
          
          case 'content':
            return report.generatedReport?.toLowerCase().includes(searchLower);
          
          case 'author':
            return `${report.userId.firstName} ${report.userId.lastName}`.toLowerCase().includes(searchLower);
          
          case 'all':
          default:
            return (
              report.filename.toLowerCase().includes(searchLower) ||
              report.prompt?.toLowerCase().includes(searchLower) ||
              report.generatedReport?.toLowerCase().includes(searchLower) ||
              `${report.userId.firstName} ${report.userId.lastName}`.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(report => report.language === selectedLanguage);
    }

    // Sorting logic
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
          const dateA = new Date(a.generatedAt || a.createdAt).getTime();
          const dateB = new Date(b.generatedAt || b.createdAt).getTime();
          comparison = dateB - dateA;
          break;
        
        case 'alphabetical':
          comparison = a.filename.localeCompare(b.filename);
          break;
        
        case 'popular':
          comparison = (b.generatedReport?.length || 0) - (a.generatedReport?.length || 0);
          break;
        
        case 'rating':
          if ((b.averageRating || 0) !== (a.averageRating || 0)) {
            comparison = (b.averageRating || 0) - (a.averageRating || 0);
          } else {
            comparison = (b.totalRatings || 0) - (a.totalRatings || 0);
          }
          break;
        
        case 'comments':
          comparison = (b.commentsCount || 0) - (a.commentsCount || 0);
          break;
        
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
      <Helmet>
        <title>{locale === 'ar' ? 'مدونة التقارير - تقارير احترافية بالذكاء الاصطناعي' : 'Reports Blog - Professional AI-Generated Reports'}</title>
        <meta name="description" content={locale === 'ar' 
          ? `اكتشف ${filteredReports.length} تقرير احترافي مولد بالذكاء الاصطناعي. تحليلات متقدمة للبيانات، رؤى ذكية، وتقارير شاملة في مختلف المجالات.`
          : `Discover ${filteredReports.length} professional AI-generated reports. Advanced data analytics, smart insights, and comprehensive reports across various domains.`
        } />
        <meta name="keywords" content={locale === 'ar'
          ? 'تقارير ذكاء اصطناعي, تحليل بيانات, تقارير احترافية, AI Reports, مدونة التقارير, تحليلات متقدمة'
          : 'AI reports, data analysis, professional reports, AI analytics, reports blog, advanced analytics'
        } />
        
        <meta property="og:title" content={locale === 'ar' ? 'مدونة التقارير - AI Reports' : 'Reports Blog - AI Reports'} />
        <meta property="og:description" content={locale === 'ar'
          ? 'تصفح مئات التقارير الاحترافية المولدة بالذكاء الاصطناعي في مختلف المجالات'
          : 'Browse hundreds of professional AI-generated reports across various domains'
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        <meta property="og:image" content={`${window.location.origin}/logo512.png`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={locale === 'ar' ? 'مدونة التقارير' : 'Reports Blog'} />
        <meta name="twitter:description" content={locale === 'ar'
          ? 'تقارير احترافية مولدة بالذكاء الاصطناعي'
          : 'Professional AI-generated reports'
        } />
        
        <meta name="robots" content="index, follow" />
        <meta name="author" content="AI Reports" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        
        <script type="application/ld+json">
          {JSON.stringify(generateBlogSchema(filteredReports.length))}
        </script>
      </Helmet>
      
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
          {/* Search Section with Advanced Options */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1 relative">
                <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'ابحث في التقارير...' : 'Search in reports...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all`}
                />
              </div>
              
              {/* Search Scope Selector */}
              <select
                value={searchIn}
                onChange={(e) => setSearchIn(e.target.value as 'all' | 'title' | 'content' | 'author')}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer transition-all hover:border-blue-400"
              >
                <option value="all">
                  {locale === 'ar' ? '🔍 البحث في كل شيء' : '🔍 Search Everything'}
                </option>
                <option value="title">
                  {locale === 'ar' ? '📄 العنوان فقط' : '📄 Title Only'}
                </option>
                <option value="content">
                  {locale === 'ar' ? '📝 المحتوى فقط' : '📝 Content Only'}
                </option>
                <option value="author">
                  {locale === 'ar' ? '👤 الكاتب فقط' : '👤 Author Only'}
                </option>
              </select>
            </div>
            
            {/* Search Info */}
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`px-3 py-1 rounded-full ${
                  filteredReports.length > 0 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                  {locale === 'ar' 
                    ? `${filteredReports.length} نتيجة` 
                    : `${filteredReports.length} result${filteredReports.length !== 1 ? 's' : ''}`
                  }
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {locale === 'ar' ? 'للبحث عن:' : 'for:'}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  "{searchTerm}"
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {locale === 'ar' ? 'في' : 'in'}
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {searchIn === 'all' && (locale === 'ar' ? 'كل المحتوى' : 'all content')}
                  {searchIn === 'title' && (locale === 'ar' ? 'العناوين' : 'titles')}
                  {searchIn === 'content' && (locale === 'ar' ? 'المحتوى' : 'content')}
                  {searchIn === 'author' && (locale === 'ar' ? 'الكتّاب' : 'authors')}
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Other Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Language Filter */}
              <div className="relative">
                <Globe className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'all' | 'ar' | 'en')}
                  className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer transition-all hover:border-blue-400`}
                >
                  <option value="all">{locale === 'ar' ? '🌐 جميع اللغات' : '🌐 All Languages'}</option>
                  <option value="ar">{locale === 'ar' ? '🇸🇦 العربية' : '🇸🇦 Arabic'}</option>
                  <option value="en">{locale === 'ar' ? '🇺🇸 الإنجليزية' : '🇺🇸 English'}</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <svg 
                  className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'alphabetical' | 'rating' | 'comments')}
                  className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer transition-all hover:border-blue-400`}
              >
                <option value="newest">
                  {locale === 'ar' ? '📅 التاريخ' : '📅 Date'}
                </option>
                <option value="rating">
                  {locale === 'ar' ? '⭐ الأعلى تقييماً' : '⭐ Highest Rated'}
                </option>
                <option value="comments">
                  {locale === 'ar' ? '💬 الأكثر تعليقاً' : '💬 Most Commented'}
                </option>
                <option value="popular">
                  {locale === 'ar' ? '📊 الأكثر شمولاً' : '📊 Most Comprehensive'}
                </option>
                <option value="alphabetical">
                  {locale === 'ar' ? '🔤 ترتيب أبجدي' : '🔤 Alphabetical'}
                </option>
              </select>
              </div>
            </div>
            
            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              title={sortOrder === 'desc' 
                ? (locale === 'ar' ? 'تنازلي (من الأكبر للأصغر)' : 'Descending (High to Low)')
                : (locale === 'ar' ? 'تصاعدي (من الأصغر للأكبر)' : 'Ascending (Low to High)')
              }
            >
              {sortOrder === 'desc' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              )}
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={locale === 'ar' ? 'عرض شبكي' : 'Grid View'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={locale === 'ar' ? 'عرض قائمة' : 'List View'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'flex flex-col gap-6'
          }>
            {filteredReports.map((report) => (
              <article
                key={report._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'transform hover:-translate-y-2' 
                    : 'flex flex-row hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleViewReport(report._id)}
                itemScope
                itemType="https://schema.org/Article"
              >
                {/* Card Body */}
                <div className="p-6">
                  {/* Author Section with Avatar - في الأول */}
                  <div className="flex items-center gap-4 mb-6">
                    {report.userId?.avatarUrl ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.userId.avatarUrl}`}
                        alt={`${report.userId.firstName} ${report.userId.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-3 border-blue-500 dark:border-blue-400 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl border-3 border-blue-400 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
                        {getInitials(report.userId?.firstName || 'U', report.userId?.lastName || 'U')}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-gray-900 dark:text-white" itemProp="author" itemScope itemType="https://schema.org/Person">
                          <span itemProp="name">{report.userId?.firstName} {report.userId?.lastName}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <time itemProp="datePublished" dateTime={report.generatedAt || report.createdAt}>
                          {formatDate(report.generatedAt || report.createdAt)}
                        </time>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {report.language === 'ar' ? '🇸🇦 عربي' : '🇺🇸 English'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Report Title - مخفي اسم الملف، نعرض من المحتوى */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2" itemProp="headline">
                    {report.prompt || report.filename.replace(/\.(csv|xlsx|xls)$/i, '')}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed" itemProp="description">
                    {getExcerpt(report.generatedReport)}
                  </p>
                  <meta itemProp="url" content={`${window.location.origin}/blog/${report._id}`} />
                  <meta itemProp="image" content={report.userId?.avatarUrl ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.userId.avatarUrl}` : `${window.location.origin}/logo512.png`} />

                  {/* Rating & Comments Count - على نفس المستوى */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {showRatings && (
                        <RatingStars
                          reportId={report._id}
                          averageRating={report.averageRating || 0}
                          totalRatings={report.totalRatings || 0}
                          readonly={true}
                          showCount={true}
                          size="md"
                        />
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">
                          {report.commentsCount || 0} {locale === 'ar' ? 'تعليق' : 'comment'}
                          {(report.commentsCount || 0) !== 1 && locale !== 'ar' && 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* تم إزالة قسم Prompt لأنه أصبح العنوان */}

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
                          const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                          const response = await axios.get(
                            `${API_BASE}/reports/${report._id}/download`,
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
              </article>
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

