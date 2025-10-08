import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

interface ReportDisplayProps {
  report: {
    _id: string;
    filename: string;
    generatedReport?: string;
    prompt?: string;
    createdAt: string;
    generatedAt?: string;
  };
  onDownloadPDF: () => void;
  onEmailPDF?: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onDownloadPDF, onEmailPDF }) => {
  const { t, locale } = useLocale();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{t('reportTitle')}</h3>
          <p className="text-sm text-gray-500">
            {t('createdOn')} {new Date(report.generatedAt || report.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onDownloadPDF}
            className="group relative px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('downloadPDF')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          {onEmailPDF && (
            <button
              onClick={onEmailPDF}
              className="group relative px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {locale === 'ar' ? 'إرسال بالإيميل' : 'Email PDF'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('uploadFile')}</h4>
          </div>
          <p className="text-blue-700 dark:text-blue-300 font-medium">{report.filename}</p>
        </div>

        {report.prompt && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">{t('prompt')}</h4>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300">{report.prompt}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('reportTitle')}</h4>
          </div>
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 leading-relaxed max-h-96 overflow-y-auto">
              {report.generatedReport || t('noReportGenerated')}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('createdLabel')} {new Date(report.createdAt).toLocaleDateString('en-US')}</span>
          </div>
          {report.generatedAt && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{t('generatedLabel')} {new Date(report.generatedAt).toLocaleDateString('en-US')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;