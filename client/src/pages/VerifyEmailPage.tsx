import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocale } from '../contexts/LocaleContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
        
        // الانتقال لصفحة تسجيل الدخول بعد 3 ثوان
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'فشل التحقق من البريد الإلكتروني');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {locale === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'ar' 
                  ? 'يرجى الانتظار بينما نتحقق من بريدك الإلكتروني' 
                  : 'Please wait while we verify your email'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                {locale === 'ar' ? '✅ تم التحقق بنجاح!' : '✅ Verified Successfully!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message || (locale === 'ar' ? 'تم تأكيد بريدك الإلكتروني' : 'Your email has been verified')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locale === 'ar' 
                  ? 'سيتم تحويلك لصفحة تسجيل الدخول...' 
                  : 'Redirecting to login page...'}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                {locale === 'ar' ? '❌ فشل التحقق' : '❌ Verification Failed'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

