import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ReportGenerator from './components/ReportGenerator';
import ReportDisplay from './components/ReportDisplay';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Report {
  _id: string;
  filename: string;
  status: string;
  generatedReport?: string;
  prompt?: string;
  createdAt: string;
  generatedAt?: string;
}

function App() {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          AI Report Generator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUpload 
              onUploadSuccess={(reportId) => {
                fetchReport(reportId);
              }}
            />
            
            {currentReport && currentReport.status === 'pending' && (
              <ReportGenerator 
                reportId={currentReport._id}
                onReportGenerated={(report) => {
                  setCurrentReport(report);
                }}
              />
            )}
          </div>
          
          <div>
            {currentReport && currentReport.status === 'completed' && (
              <ReportDisplay 
                report={currentReport}
                onDownloadPDF={() => downloadPDF(currentReport._id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  async function fetchReport(reportId: string) {
    try {
      const response = await axios.get(`${API_BASE}/reports/${reportId}`);
      setCurrentReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }


  async function downloadPDF(reportId: string) {
    try {
      const response = await axios.get(`${API_BASE}/download-pdf/${reportId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }
}

export default App;
