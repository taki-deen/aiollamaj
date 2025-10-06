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

    // Using Hugging Face Inference API (Free tier: 30k requests/month)
    // Using a better model for text generation
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/microsoft/DialoGPT-large`,
      {
        inputs: fullPrompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text from Hugging Face response
    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text;
    } else {
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Fallback to a simple analysis if API fails
    if (error.response?.status === 503) {
      return generateFallbackReport(data, prompt);
    }
    
    throw new Error('Failed to generate AI report');
  }
};

// Fallback function when AI API is unavailable
const generateFallbackReport = (data, prompt) => {
  const dataLength = data.length;
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  
  return `
# Data Analysis Report

## Summary
- Total records: ${dataLength}
- Columns: ${columns.join(', ')}
- Analysis request: ${prompt}

## Basic Statistics
${columns.map(col => {
  const values = data.map(row => row[col]).filter(val => val !== '');
  const numericValues = values.filter(val => !isNaN(parseFloat(val)));
  
  if (numericValues.length > 0) {
    const sum = numericValues.reduce((a, b) => a + parseFloat(b), 0);
    const avg = sum / numericValues.length;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    
    return `- ${col}: Average ${avg.toFixed(2)}, Min ${min}, Max ${max}`;
  } else {
    const uniqueValues = [...new Set(values)];
    return `- ${col}: ${uniqueValues.length} unique values`;
  }
}).join('\n')}

## Recommendations
Based on the data structure, consider:
1. Data validation for missing values
2. Statistical analysis for numeric columns
3. Categorization for text columns
4. Data visualization for better insights

*Note: This is a basic analysis. For advanced AI insights, please check API availability.*
  `;
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
