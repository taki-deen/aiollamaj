import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, locale } = useLocale();

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            {t('welcome')}
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            🚀 {t('welcomeMessage')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              {locale === 'ar' ? 'تحليل متقدم' : 'Advanced Analysis'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? 'تحليل ذكي للبيانات مع إحصائيات شاملة' : 'Smart data analysis with comprehensive statistics'}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              {locale === 'ar' ? 'ذكاء اصطناعي' : 'Artificial Intelligence'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? 'تقارير مبنية على أحدث تقنيات AI' : 'Reports built on the latest AI technologies'}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              {locale === 'ar' ? 'توصيات ذكية' : 'Smart Recommendations'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {locale === 'ar' ? 'نصائح وإرشادات مبنية على البيانات' : 'Data-driven tips and guidance'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <button
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <span className="relative z-10">{t('login')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-lg font-bold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <span className="relative z-10">{t('register')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Blog CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ar' ? '📚 اكتشف تقارير احترافية' : '📚 Discover Professional Reports'}
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              {locale === 'ar'
                ? 'تصفح مئات التقارير المولدة بالذكاء الاصطناعي من مستخدمين آخرين'
                : 'Browse hundreds of AI-generated reports from other users'}
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {locale === 'ar' ? '🚀 تصفح المدونة' : '🚀 Browse Blog'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

