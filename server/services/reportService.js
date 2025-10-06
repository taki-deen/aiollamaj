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
    // Check if API key is properly configured
    if (!process.env.HF_TOKEN || process.env.HF_TOKEN === 'your_huggingface_token_here') {
      console.log('No valid API key found, using fallback analysis...');
      return generateFallbackReport(data, prompt);
    }

    const dataString = JSON.stringify(data, null, 2);
    const fullPrompt = `Based on the following data: ${dataString}\n\nPlease analyze this data and ${prompt}. Provide insights, patterns, and recommendations.`;

    // Using Hugging Face Router API with Kimi model (Better performance)
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'moonshotai/Kimi-K2-Instruct-0905',
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text from Hugging Face Router response
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Fallback to a simple analysis if API fails
    if (error.response?.status === 503 || error.response?.status === 429 || error.response?.status === 401) {
      console.log('API error, using fallback analysis...');
      return generateFallbackReport(data, prompt);
    }
    
    // Always fallback on any error
    console.log('Using fallback analysis due to error...');
    return generateFallbackReport(data, prompt);
  }
};

// Fallback function when AI API is unavailable
const generateFallbackReport = (data, prompt) => {
  const dataLength = data.length;
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  
  // Calculate detailed statistics
  const statistics = columns.map(col => {
    const values = data.map(row => row[col]).filter(val => val !== '');
    const numericValues = values.filter(val => !isNaN(parseFloat(val)));
    
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + parseFloat(b), 0);
      const avg = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const sorted = numericValues.sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      return {
        column: col,
        type: 'numeric',
        count: numericValues.length,
        average: avg.toFixed(2),
        median: median.toFixed(2),
        min: min,
        max: max,
        range: (max - min).toFixed(2)
      };
    } else {
      const uniqueValues = [...new Set(values)];
      const valueCounts = {};
      values.forEach(val => valueCounts[val] = (valueCounts[val] || 0) + 1);
      const mostCommon = Object.keys(valueCounts).reduce((a, b) => valueCounts[a] > valueCounts[b] ? a : b);
      
      return {
        column: col,
        type: 'text',
        count: values.length,
        unique: uniqueValues.length,
        mostCommon: mostCommon,
        frequency: valueCounts[mostCommon]
      };
    }
  });

  // Generate insights based on data
  const numericColumns = statistics.filter(s => s.type === 'numeric');
  const textColumns = statistics.filter(s => s.type === 'text');
  
  let insights = [];
  
  if (numericColumns.length > 0) {
    insights.push(`📊 **Numeric Analysis**: Found ${numericColumns.length} numeric columns with detailed statistics`);
    
    numericColumns.forEach(stat => {
      if (parseFloat(stat.range) > 0) {
        insights.push(`- **${stat.column}**: Range ${stat.range} (${stat.min} to ${stat.max}), Average: ${stat.average}`);
      }
    });
  }
  
  if (textColumns.length > 0) {
    insights.push(`📝 **Text Analysis**: Found ${textColumns.length} text columns with categorization`);
    
    textColumns.forEach(stat => {
      insights.push(`- **${stat.column}**: ${stat.unique} unique values, most common: "${stat.mostCommon}" (${stat.frequency} times)`);
    });
  }
  
  // Data quality insights
  const missingData = columns.map(col => {
    const missing = data.filter(row => !row[col] || row[col] === '').length;
    return { column: col, missing: missing, percentage: ((missing / dataLength) * 100).toFixed(1) };
  }).filter(item => item.missing > 0);
  
  if (missingData.length > 0) {
    insights.push(`⚠️ **Data Quality**: Found missing values in ${missingData.length} columns`);
    missingData.forEach(item => {
      insights.push(`- **${item.column}**: ${item.missing} missing values (${item.percentage}%)`);
    });
  }
  
  return `
# 📈 Data Analysis Report

## 📋 Summary
- **Total Records**: ${dataLength}
- **Columns**: ${columns.join(', ')}
- **Analysis Request**: ${prompt}
- **Report Type**: Statistical Analysis (AI API not available)

## 📊 Detailed Statistics

${statistics.map(stat => {
  if (stat.type === 'numeric') {
    return `### ${stat.column} (Numeric)
- **Count**: ${stat.count} values
- **Average**: ${stat.average}
- **Median**: ${stat.median}
- **Range**: ${stat.min} to ${stat.max} (${stat.range})
- **Data Quality**: ${stat.count === dataLength ? 'Complete' : `${dataLength - stat.count} missing values`}`;
  } else {
    return `### ${stat.column} (Text)
- **Count**: ${stat.count} values
- **Unique Values**: ${stat.unique}
- **Most Common**: "${stat.mostCommon}" (${stat.frequency} times)
- **Data Quality**: ${stat.count === dataLength ? 'Complete' : `${dataLength - stat.count} missing values`}`;
  }
}).join('\n\n')}

## 🔍 Key Insights

${insights.map(insight => `- ${insight}`).join('\n')}

## 💡 Recommendations

1. **Data Validation**: ${missingData.length > 0 ? 'Address missing values in the identified columns' : 'Data appears complete - good quality!'}
2. **Statistical Analysis**: ${numericColumns.length > 0 ? 'Consider correlation analysis between numeric variables' : 'No numeric data for statistical analysis'}
3. **Categorization**: ${textColumns.length > 0 ? 'Group similar text values for better insights' : 'No text data for categorization'}
4. **Visualization**: Create charts and graphs to visualize patterns
5. **Advanced Analysis**: ${numericColumns.length >= 2 ? 'Consider regression analysis for relationships' : 'Need more numeric variables for advanced analysis'}

---
*Note: This is an automated statistical analysis. For advanced AI-powered insights, please configure a valid API key in the environment variables.*
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
