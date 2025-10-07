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
    console.log('\n=== Generating Report ===');
    console.log('User Prompt:', prompt);
    console.log('Data Records:', data.length);
    
    const apiKey = process.env.GROQ_API_KEY || process.env.HF_TOKEN;
    
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'your_huggingface_token_here') {
      console.log('No valid API key found, using fallback analysis...');
      return generateFallbackReport(data, prompt);
    }

    const dataSample = data.slice(0, 30);
    const dataString = JSON.stringify(dataSample, null, 2);
    
    const userPrompt = prompt && prompt.trim() 
      ? prompt.trim() 
      : 'Provide comprehensive insights and analysis';
    
    console.log('Processed Prompt:', userPrompt);
    
    const fullPrompt = `You are a professional data analyst. I need you to focus SPECIFICALLY on the user's request below.

CRITICAL REQUIREMENT: You MUST provide your entire response in BOTH Arabic and English. Start with Arabic, then provide the same content in English.

User's Specific Request:
"${userPrompt}"

Dataset Information:
- Total Records: ${data.length}
- Sample (first ${dataSample.length} records):
${dataString}

Instructions:
1. READ the user's request carefully
2. Focus your analysis on answering their SPECIFIC question or request
3. Use the dataset to support your analysis
4. Provide detailed, relevant insights based on what they asked
5. Include data-driven evidence from the dataset

FORMAT REQUIREMENTS (MANDATORY):
First, write the COMPLETE analysis in Arabic (العربية):
- Use clear Arabic sections and headers
- Include bullet points for readability
- Provide specific numbers and statistics
- Give direct answers to the user's request

Then, write the EXACT SAME analysis in English:
- Use clear English sections and headers
- Include bullet points for readability
- Provide specific numbers and statistics
- Give direct answers to the user's request

Example Structure:
---
# [Title in Arabic]
## [Section 1 in Arabic]
- [Point 1 in Arabic]
- [Point 2 in Arabic]

## [Section 2 in Arabic]
...

---
# [Title in English]
## [Section 1 in English]
- [Point 1 in English]
- [Point 2 in English]

## [Section 2 in English]
...

Remember: Your response must be UNIQUE, SPECIFIC to the user's request, and provided in BOTH languages.`;

    let response;
    
    if (process.env.GROQ_API_KEY) {
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert bilingual data analyst fluent in both Arabic and English. Your job is to: 1) Carefully read and understand the user\'s specific request, 2) Provide a detailed, customized analysis that directly addresses what they asked for, 3) ALWAYS provide your COMPLETE response in BOTH Arabic and English languages. Start with Arabic, then provide the same content in English. Each request is unique - never give generic responses. The bilingual requirement is MANDATORY - never skip either language.'
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
    } else {
      response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 1500,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
    }

    if (response.data) {
      if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      } else if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text;
      } else {
        throw new Error('Invalid response from AI service');
      }
    } else {
      throw new Error('Empty response from AI service');
    }
  } catch (error) {
    console.error('AI generation error:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Error:', error.response.data);
    }
    
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
# 📈 تقرير تحليل البيانات / Data Analysis Report

---
## النسخة العربية

### 📋 الملخص
- **إجمالي السجلات**: ${dataLength}
- **الأعمدة**: ${columns.join(', ')}
- **طلب التحليل**: ${prompt}
- **نوع التقرير**: تحليل إحصائي (AI API غير متاح)

### 📊 الإحصائيات التفصيلية

${statistics.map(stat => {
  if (stat.type === 'numeric') {
    return `#### ${stat.column} (رقمي)
- **العدد**: ${stat.count} قيمة
- **المتوسط**: ${stat.average}
- **الوسيط**: ${stat.median}
- **المدى**: من ${stat.min} إلى ${stat.max} (${stat.range})
- **جودة البيانات**: ${stat.count === dataLength ? 'كاملة' : `${dataLength - stat.count} قيمة مفقودة`}`;
  } else {
    return `#### ${stat.column} (نصي)
- **العدد**: ${stat.count} قيمة
- **القيم الفريدة**: ${stat.unique}
- **الأكثر شيوعاً**: "${stat.mostCommon}" (${stat.frequency} مرة)
- **جودة البيانات**: ${stat.count === dataLength ? 'كاملة' : `${dataLength - stat.count} قيمة مفقودة`}`;
  }
}).join('\n\n')}

### 🔍 الرؤى الأساسية

${insights.map(insight => `- ${insight}`).join('\n')}

### 💡 التوصيات

1. **التحقق من البيانات**: ${missingData.length > 0 ? 'معالجة القيم المفقودة في الأعمدة المحددة' : 'البيانات كاملة - جودة جيدة!'}
2. **التحليل الإحصائي**: ${numericColumns.length > 0 ? 'النظر في تحليل الارتباط بين المتغيرات الرقمية' : 'لا توجد بيانات رقمية للتحليل الإحصائي'}
3. **التصنيف**: ${textColumns.length > 0 ? 'تجميع القيم النصية المتشابهة للحصول على رؤى أفضل' : 'لا توجد بيانات نصية للتصنيف'}
4. **التصور البياني**: إنشاء مخططات ورسوم بيانية لتصور الأنماط
5. **التحليل المتقدم**: ${numericColumns.length >= 2 ? 'النظر في تحليل الانحدار للعلاقات' : 'الحاجة إلى المزيد من المتغيرات الرقمية للتحليل المتقدم'}

---
## English Version

### 📋 Summary
- **Total Records**: ${dataLength}
- **Columns**: ${columns.join(', ')}
- **Analysis Request**: ${prompt}
- **Report Type**: Statistical Analysis (AI API not available)

### 📊 Detailed Statistics

${statistics.map(stat => {
  if (stat.type === 'numeric') {
    return `#### ${stat.column} (Numeric)
- **Count**: ${stat.count} values
- **Average**: ${stat.average}
- **Median**: ${stat.median}
- **Range**: ${stat.min} to ${stat.max} (${stat.range})
- **Data Quality**: ${stat.count === dataLength ? 'Complete' : `${dataLength - stat.count} missing values`}`;
  } else {
    return `#### ${stat.column} (Text)
- **Count**: ${stat.count} values
- **Unique Values**: ${stat.unique}
- **Most Common**: "${stat.mostCommon}" (${stat.frequency} times)
- **Data Quality**: ${stat.count === dataLength ? 'Complete' : `${dataLength - stat.count} missing values`}`;
  }
}).join('\n\n')}

### 🔍 Key Insights

${insights.map(insight => `- ${insight}`).join('\n')}

### 💡 Recommendations

1. **Data Validation**: ${missingData.length > 0 ? 'Address missing values in the identified columns' : 'Data appears complete - good quality!'}
2. **Statistical Analysis**: ${numericColumns.length > 0 ? 'Consider correlation analysis between numeric variables' : 'No numeric data for statistical analysis'}
3. **Categorization**: ${textColumns.length > 0 ? 'Group similar text values for better insights' : 'No text data for categorization'}
4. **Visualization**: Create charts and graphs to visualize patterns
5. **Advanced Analysis**: ${numericColumns.length >= 2 ? 'Consider regression analysis for relationships' : 'Need more numeric variables for advanced analysis'}

---
*ملاحظة: هذا تحليل إحصائي آلي. للحصول على رؤى متقدمة مدعومة بالذكاء الاصطناعي، يرجى تكوين مفتاح API صالح في متغيرات البيئة.*
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
