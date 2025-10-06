import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ReportGenerator from './components/ReportGenerator';
import ReportDisplay from './components/ReportDisplay';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';

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

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function App() {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentReport(null);
    setReports([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              مرحباً بك في مولد التقارير الذكية
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              قم بتحليل بياناتك وإنشاء تقارير ذكية باستخدام الذكاء الاصطناعي
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
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
      </main>
    </div>
  );

  async function fetchReport(reportId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE}/reports/${reportId}`, { headers });
      
      if (response.data.success) {
        setCurrentReport(response.data.data.report);
      } else {
        console.error('Error fetching report:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }


  async function downloadPDF(reportId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE}/reports/${reportId}/download`, {
        responseType: 'blob',
        headers
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
