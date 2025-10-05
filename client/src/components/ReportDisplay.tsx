import React from 'react';

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
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onDownloadPDF }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-semibold">Generated Report</h2>
        <button
          onClick={onDownloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">File:</h3>
          <p className="text-gray-900">{report.filename}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Analysis Prompt:</h3>
          <p className="text-gray-900">{report.prompt || 'No prompt provided'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Generated Report:</h3>
          <div className="text-gray-900 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {report.generatedReport || 'No report generated'}
          </div>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Created: {new Date(report.createdAt).toLocaleString()}</p>
          {report.generatedAt && (
            <p>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
