const XLSX = require('xlsx');
const fs = require('fs-extra');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const processFile = async (filePath) => {
  try {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      const csvContent = await fs.readFile(filePath, 'utf-8');
      return parseCSV(csvContent);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};

const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(value => value.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
};

const generateReport = async (data, prompt) => {
  try {
    const dataString = JSON.stringify(data, null, 2);
    const fullPrompt = `Based on the following data: ${dataString}\n\nPlease analyze this data and ${prompt}. Provide insights, patterns, and recommendations.`;

    const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
      model: 'llama2',
      prompt: fullPrompt,
      stream: false
    });

    return response.data.response;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate AI report');
  }
};

const generatePDF = async (report) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('AI Generated Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).text(`File: ${report.filename}`, { underline: true });
      doc.moveDown();
      
      if (report.prompt) {
        doc.fontSize(14).text('Prompt:', { underline: true });
        doc.fontSize(12).text(report.prompt);
        doc.moveDown();
      }

      doc.fontSize(14).text('Analysis:', { underline: true });
      doc.fontSize(12).text(report.generatedReport, {
        width: 500,
        align: 'justify'
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  processFile,
  generateReport,
  generatePDF
};
