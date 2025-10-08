import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLocale } from '../contexts/LocaleContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLocale();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 دقائق = 600 ثانية
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // الحصول على userId و email من state
  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
    }
  }, [userId, email, navigate]);

  // Timer للعد التنازلي
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // أرقام فقط

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // آخر رقم فقط
    setOtp(newOtp);

    // الانتقال للحقل التالي تلقائياً
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace للرجوع للحقل السابق
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // التركيز على آخر حقل تم ملؤه
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError(locale === 'ar' ? 'يرجى إدخال الكود كاملاً' : 'Please enter the complete code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/auth/verify-otp`, {
        userId,
        otp: otpCode
      });

      // حفظ الـ token والمستخدم
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // الانتقال للصفحة الرئيسية
      navigate('/create');
      window.location.reload(); // لتحديث حالة المستخدم
      
    } catch (err: any) {
      setError(err.response?.data?.message || (locale === 'ar' ? 'كود غير صحيح' : 'Invalid code'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/auth/resend-otp`, { userId });
      setTimer(600); // إعادة تعيين المؤقت
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إعادة الإرسال');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {locale === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Verify Your Email'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {locale === 'ar' 
                ? 'أدخل الكود المكون من 6 أرقام المرسل إلى' 
                : 'Enter the 6-digit code sent to'}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {email}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className={`text-sm ${timer < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {locale === 'ar' ? 'ينتهي الكود خلال:' : 'Code expires in:'}{' '}
                <span className="font-bold">{formatTime(timer)}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading 
                ? (locale === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                : (locale === 'ar' ? 'تأكيد' : 'Verify')
              }
            </button>

            {/* Resend Button */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {locale === 'ar' ? 'لم تستلم الكود؟' : "Didn't receive the code?"}
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || timer > 540} // يمكن إعادة الإرسال بعد دقيقة
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending 
                  ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : (locale === 'ar' ? 'إعادة إرسال الكود' : 'Resend Code')
                }
              </button>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {locale === 'ar' ? 'العودة للتسجيل' : 'Back to Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;

