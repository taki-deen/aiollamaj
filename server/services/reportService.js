const XLSX = require('xlsx');
const fs = require('fs-extra');
const axios = require('axios');
const htmlPdf = require('html-pdf-node');

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

const generateReport = async (data, prompt, language = 'ar') => {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.HF_TOKEN;
    
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'your_huggingface_token_here') {
      return generateFallbackReport(data, prompt, language);
    }

    const dataSample = data.slice(0, 30);
    const dataString = JSON.stringify(dataSample, null, 2);
    
    const userPrompt = prompt?.trim() || (language === 'ar' ? 'قدم رؤى وتحليل شامل' : 'Provide comprehensive insights and analysis');
    
    // تحديد اللغة المطلوبة
    const languageInstruction = language === 'ar' 
      ? 'You MUST write your ENTIRE response in Arabic (العربية) ONLY. Do not include English translation.'
      : 'You MUST write your ENTIRE response in English ONLY. Do not include Arabic translation.';
    
    const fullPrompt = `You are a professional data analyst. I need you to focus SPECIFICALLY on the user's request below.

CRITICAL LANGUAGE REQUIREMENT: ${languageInstruction}

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

FORMAT REQUIREMENTS:
${language === 'ar' ? `
- Write in Arabic (العربية) ONLY
- Use clear Arabic sections with # and ##
- Include bullet points (-)
- Provide specific numbers and statistics
- Give direct answers to the user's request
- Use professional Arabic terminology

Example:
# تحليل البيانات
## النتائج الرئيسية
- النقطة الأولى
- النقطة الثانية

## التوصيات
- توصية 1
- توصية 2
` : `
- Write in English ONLY
- Use clear sections with # and ##
- Include bullet points (-)
- Provide specific numbers and statistics
- Give direct answers to the user's request
- Use professional terminology

Example:
# Data Analysis
## Key Findings
- First point
- Second point

## Recommendations
- Recommendation 1
- Recommendation 2
`}

Remember: Your response must be UNIQUE and SPECIFIC to the user's request in ${language === 'ar' ? 'Arabic' : 'English'} only.`;

    let response;
    
    if (process.env.GROQ_API_KEY) {
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
        messages: [
            {
              role: 'system',
              content: language === 'ar' 
                ? 'أنت محلل بيانات محترف. مهمتك: 1) قراءة وفهم طلب المستخدم بعناية، 2) تقديم تحليل مفصل ومخصص يجيب مباشرة على ما طلبه، 3) يجب أن تكون ردودك دائماً فريدة ومحددة - لا تعطي ردوداً عامة. اكتب بالعربية فقط.'
                : 'You are a professional data analyst. Your tasks: 1) Carefully read and understand the user\'s specific request, 2) Provide a detailed, customized analysis that directly addresses what they asked for, 3) Your responses must always be unique and specific - never give generic responses. Write in English only.'
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
    return generateFallbackReport(data, prompt);
  }
};

// Fallback function when AI API is unavailable
const generateFallbackReport = (data, prompt, language = 'ar') => {
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
  
  // إنشاء التقرير بلغة واحدة فقط
  if (language === 'ar') {
  return `
# 📈 تقرير تحليل البيانات

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
*ملاحظة: هذا تحليل إحصائي آلي. للحصول على رؤى متقدمة مدعومة بالذكاء الاصطناعي، يرجى تكوين مفتاح API صالح في متغيرات البيئة.*
`;
  } else {
    // English version
    return `
# 📈 Data Analysis Report

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
*Note: This is an automated statistical analysis. For advanced AI-powered insights, please configure a valid API key in the environment variables.*
`;
  }
};

const generatePDF = async (report) => {
  try {
    const date = new Date(report.generatedAt || report.createdAt);
    const reportLanguage = report.language || 'ar';
    
    // دالة لتحويل Markdown إلى HTML
    const convertMarkdown = (text) => {
      return text
        .replace(/#{6}\s(.+)/g, '<h6>$1</h6>')
        .replace(/#{5}\s(.+)/g, '<h5>$1</h5>')
        .replace(/#{4}\s(.+)/g, '<h4>$1</h4>')
        .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
    };
    
    // تحويل المحتوى
    const htmlContent = convertMarkdown(report.generatedReport);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', 'Segoe UI', 'Tahoma', sans-serif;
      padding: 40px;
      background: white;
      color: #333;
      line-height: 1.8;
      direction: ${reportLanguage === 'ar' ? 'rtl' : 'ltr'};
      text-align: ${reportLanguage === 'ar' ? 'right' : 'left'};
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      color: #6B7280;
      font-size: 18px;
    }
    .meta {
      background: #F3F4F6;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
      ${reportLanguage === 'ar' ? 'border-right: 4px solid #4F46E5;' : 'border-left: 4px solid #4F46E5;'}
    }
    .meta p {
      margin: 5px 0;
      font-size: 13px;
      color: #374151;
    }
    .meta strong {
      color: #1F2937;
    }
    .content {
      padding: 20px 0;
    }
    h1 {
      color: #1F2937;
      font-size: 22px;
      margin: 25px 0 15px 0;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 8px;
    }
    h2 {
      color: #374151;
      font-size: 18px;
      margin: 20px 0 12px 0;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 5px;
    }
    h3 {
      color: #4B5563;
      font-size: 16px;
      margin: 15px 0 10px 0;
    }
    h4, h5, h6 {
      color: #6B7280;
      font-size: 14px;
      margin: 12px 0 8px 0;
    }
    p {
      margin: 10px 0;
      font-size: 12px;
    }
    /* القوائم */
    ul {
      margin: ${reportLanguage === 'ar' ? '10px 30px 10px 0' : '10px 0 10px 30px'};
      ${reportLanguage === 'ar' ? 'padding-right: 20px;' : 'padding-left: 20px;'}
      list-style-position: inside;
    }
    li {
      margin: 5px 0;
      font-size: 12px;
    }
    strong {
      color: #1F2937;
      font-weight: 600;
    }
    em {
      font-style: italic;
      color: #4B5563;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      color: #6B7280;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${reportLanguage === 'ar' ? 'تقرير تحليل البيانات' : 'Data Analysis Report'}</h1>
    <div class="subtitle">${reportLanguage === 'ar' ? 'رؤى مدعومة بالذكاء الاصطناعي' : 'AI-Powered Insights'}</div>
  </div>
  
  <div class="meta">
    <p><strong>${reportLanguage === 'ar' ? 'الملف:' : 'File:'}</strong> ${report.filename}</p>
    ${report.prompt ? `<p><strong>${reportLanguage === 'ar' ? 'الطلب:' : 'Request:'}</strong> ${report.prompt}</p>` : ''}
    <p><strong>${reportLanguage === 'ar' ? 'تاريخ التوليد:' : 'Generated:'}</strong> ${date.toLocaleString(reportLanguage === 'ar' ? 'ar-SA' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
  </div>
  
  <div class="content">
    ${htmlContent}
  </div>
  
  <div class="footer">
    <p>${reportLanguage === 'ar' 
      ? 'مدعوم بنظام توليد التقارير الذكي' 
      : 'Powered by AI Report Generator System'}</p>
    <p>${reportLanguage === 'ar' 
      ? 'مولد بواسطة Groq Llama 3.3 70B' 
      : 'Generated with Groq Llama 3.3 70B'}</p>
  </div>
</body>
</html>`;

    const options = { 
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    };

    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
    
    } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
    }
};

module.exports = {
  processFile,
  generateReport,
  generatePDF
};
