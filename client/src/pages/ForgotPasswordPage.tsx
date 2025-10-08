import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocale } from '../contexts/LocaleContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setSuccess(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'ar' 
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين' 
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">
                {locale === 'ar' ? '✅ تم الإرسال!' : '✅ Email Sent!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {locale === 'ar' 
                  ? 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور' 
                  : 'Check your email for the password reset link'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : (locale === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link')
                }
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

