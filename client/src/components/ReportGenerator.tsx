import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ReportGeneratorProps {
  reportId: string;
  onReportGenerated: (report: any) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ reportId, onReportGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_BASE}/reports/generate/${reportId}`, {
        prompt: prompt.trim()
      }, { headers });

      if (response.data.success) {
        onReportGenerated(response.data.data.report);
      } else {
        setError(response.data.message || 'Report generation failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Report generation failed. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Generate Report</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe the type of analysis you want:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Analyze sales trends, identify patterns, provide insights on customer behavior..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generating ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator;
