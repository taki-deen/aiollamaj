import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLocale } from '../contexts/LocaleContext';
import { generateReportSchema, getExcerpt } from '../utils/seo';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Calendar,
  User,
  Download,
  Share2,
  FileText,
  Globe,
  Copy,
  Check
} from 'lucide-react';

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

const BlogPostPage: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { reportId } = useParams<{ reportId: string }>();
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id: string) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE}/reports/${id}`);
      const reportData = response.data.success ? response.data.data : response.data;
      
      if (!reportData.userId) {
        reportData.userId = {
          firstName: locale === 'ar' ? 'مستخدم' : 'User',
          lastName: locale === 'ar' ? 'مجهول' : 'Unknown',
          avatarUrl: null
        };
      }
      
      setReport(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert(locale === 'ar' ? 'فشل تحميل التقرير' : 'Failed to load report');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
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
      alert(locale === 'ar' ? 'فشل تحميل PDF' : 'Failed to download PDF');
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(report.generatedReport);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopying(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareData = {
      title: report.filename,
      text: report.prompt || 'Check out this AI-generated report',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return locale === 'ar'
      ? date.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Helmet>
        <title>{report.filename} - {locale === 'ar' ? 'مدونة التقارير' : 'Reports Blog'}</title>
        <meta name="description" content={getExcerpt(report.generatedReport)} />
        <meta name="keywords" content={`${report.filename}, ${report.prompt || ''}, ${locale === 'ar' ? 'تقرير ذكاء اصطناعي, تحليل بيانات' : 'AI report, data analysis'}`} />
        <meta name="author" content={`${report.userId?.firstName || ''} ${report.userId?.lastName || ''}`} />
        
        <meta property="og:title" content={report.filename} />
        <meta property="og:description" content={getExcerpt(report.generatedReport)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${report._id}`} />
        <meta property="og:image" content={report.userId?.avatarUrl ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.userId.avatarUrl}` : `${window.location.origin}/logo512.png`} />
        <meta property="article:published_time" content={report.generatedAt || report.createdAt} />
        <meta property="article:author" content={`${report.userId?.firstName || ''} ${report.userId?.lastName || ''}`} />
        <meta property="article:tag" content={report.language === 'ar' ? 'عربي' : 'English'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={report.filename} />
        <meta name="twitter:description" content={getExcerpt(report.generatedReport)} />
        <meta name="twitter:image" content={report.userId?.avatarUrl ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.userId.avatarUrl}` : `${window.location.origin}/logo512.png`} />
        
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/blog/${report._id}`} />
        
        <script type="application/ld+json">
          {JSON.stringify(generateReportSchema(report))}
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
      
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">
                {locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={locale === 'ar' ? 'مشاركة' : 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={locale === 'ar' ? 'نسخ' : 'Copy'}
              >
                {copying ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {locale === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 p-8 sm:p-12 text-white">
            <div className="flex items-start gap-4 mb-6">
              <FileText className="w-12 h-12 text-blue-200 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {report.filename}
                </h1>
                {report.prompt && (
                  <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
                    <p className="text-sm text-blue-100 mb-1">
                      {locale === 'ar' ? '📋 الطلب المرسل للذكاء الاصطناعي:' : '📋 AI Prompt:'}
                    </p>
                    <p className="text-white font-medium">{report.prompt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-6">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              {/* Author */}
              {report.userId && (
                <div className="flex items-center gap-3">
                  {report.userId.avatarUrl ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.userId.avatarUrl}`}
                      alt={`${report.userId.firstName} ${report.userId.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-200 dark:border-blue-700">
                      {getInitials(report.userId.firstName || 'U', report.userId.lastName || 'U')}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {report.userId.firstName} {report.userId.lastName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {locale === 'ar' ? 'الكاتب' : 'Author'}
                    </p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.generatedAt || report.createdAt)}</span>
              </div>

              {/* Language */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{report.language === 'ar' ? 'العربية' : 'English'}</span>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className={`prose prose-lg max-w-none p-8 sm:p-12 ${
            report.language === 'ar'
              ? 'prose-rtl text-right'
              : 'prose-ltr text-left'
          } dark:prose-invert`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white border-b-4 border-blue-500 pb-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className={`text-3xl font-semibold mb-4 mt-8 text-gray-800 dark:text-gray-100 ${
                    report.language === 'ar' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'
                  } border-blue-500`} {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-700 dark:text-gray-200" {...props} />
                ),
                h4: ({ ...props }) => (
                  <h4 className="text-xl font-semibold mb-2 mt-4 text-gray-700 dark:text-gray-200" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className={`mb-4 ${report.language === 'ar' ? 'mr-6' : 'ml-6'} space-y-2`} {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className={`mb-4 ${report.language === 'ar' ? 'mr-6' : 'ml-6'} space-y-2`} {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="text-gray-700 dark:text-gray-300" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-blue-600 dark:text-blue-400" {...props} />
                ),
                em: ({ ...props }) => (
                  <em className="italic text-gray-600 dark:text-gray-400" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote className={`${
                    report.language === 'ar' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'
                  } border-blue-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg italic my-4`} {...props} />
                ),
                code: ({ ...props }) => (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400" {...props} />
                ),
                pre: ({ ...props }) => (
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
                ),
                th: ({ ...props }) => (
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
                ),
                a: ({ ...props }) => (
                  <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
                ),
                hr: ({ ...props }) => (
                  <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
                )
              }}
            >
              {report.generatedReport}
            </ReactMarkdown>
          </div>
        </article>

        {/* CTA Section */}
        {!user ? (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-2xl shadow-xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {locale === 'ar' ? 'أعجبك هذا التقرير؟' : 'Like This Report?'}
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              {locale === 'ar'
                ? 'انضم إلينا وابدأ في إنشاء تقاريرك الخاصة بالذكاء الاصطناعي'
                : 'Join us and start creating your own AI-powered reports'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                {locale === 'ar' ? '🚀 ابدأ الآن مجاناً' : '🚀 Get Started Free'}
              </button>
              <button
                onClick={() => navigate('/blog')}
                className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {locale === 'ar' ? 'تصفح المزيد من التقارير' : 'Browse More Reports'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-2xl shadow-xl p-8 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {locale === 'ar' ? 'جاهز لإنشاء تقريرك الخاص؟' : 'Ready to Create Your Own Report?'}
            </h2>
            <p className="text-emerald-100 mb-6 text-lg">
              {locale === 'ar'
                ? 'ابدأ الآن في توليد تقاريرك الاحترافية بالذكاء الاصطناعي'
                : 'Start now generating your professional AI-powered reports'}
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-white hover:bg-gray-100 text-emerald-600 font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {locale === 'ar' ? '➕ إنشاء تقرير جديد' : '➕ Create New Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;

