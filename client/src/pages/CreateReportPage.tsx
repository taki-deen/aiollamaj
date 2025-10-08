import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ReportGenerator from '../components/ReportGenerator';
import ReportDisplay from '../components/ReportDisplay';
import { useLocale } from '../contexts/LocaleContext';

interface Report {
  _id: string;
  filename: string;
  status: string;
  generatedReport?: string;
  prompt?: string;
  createdAt: string;
  generatedAt?: string;
}

const CreateReportPage: React.FC = () => {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const { t } = useLocale();

  const handleUploadSuccess = (reportId: string) => {
    // Fetch the report details or create a minimal report object
    setCurrentReport({
      _id: reportId,
      filename: '',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  const handleReportGenerated = (updatedReport: Report) => {
    setCurrentReport(updatedReport);
  };

  const handleDownloadPDF = async () => {
    if (!currentReport?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE}/reports/${currentReport._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${currentReport._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error:', errorText);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleEmailPDF = async () => {
    if (!currentReport?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE}/reports/${currentReport._id}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('✅ تم إرسال التقرير إلى بريدك الإلكتروني!');
      } else {
        const errorData = await response.json();
        alert('❌ فشل الإرسال: ' + (errorData.message || 'حدث خطأ'));
      }
    } catch (error) {
      console.error('Error emailing PDF:', error);
      alert('❌ فشل الإرسال');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left Column - Upload & Generate */}
      <div className="space-y-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t('uploadFiles')}</h3>
          </div>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {currentReport && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t('generateReport')}</h3>
            </div>
            <ReportGenerator
              reportId={currentReport._id}
              onReportGenerated={handleReportGenerated}
            />
          </div>
        )}
      </div>

      {/* Right Column - Report Display */}
      <div>
        {currentReport?.generatedReport ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 sticky top-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t('reportTitle')}</h3>
            </div>
            <ReportDisplay report={currentReport} onDownloadPDF={handleDownloadPDF} onEmailPDF={handleEmailPDF} />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">{t('noReportsYet')}</h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg">{t('uploadFileAndStart')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReportPage;

