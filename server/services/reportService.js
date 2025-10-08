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
    
    const fullPrompt = `You are a professional data analyst and SEO content writer. Create an SEO-optimized report.

CRITICAL LANGUAGE REQUIREMENT: ${languageInstruction}

User's Specific Request:
"${userPrompt}"

Dataset Information:
- Total Records: ${data.length}
- Sample (first ${dataSample.length} records):
${dataString}

SEO & CONTENT REQUIREMENTS:
${language === 'ar' ? `
1. العنوان الرئيسي (H1): عنوان جذاب وواضح يلخص التقرير
2. مقدمة قوية: 2-3 جمل تشرح موضوع التحليل
3. أقسام منظمة بعناوين فرعية (H2, H3)
4. استخدم جداول markdown للبيانات المقارنة
5. أضف نقاط رئيسية بـ bullet points
6. اختم بملخص تنفيذي واضح

هيكل التقرير المطلوب:
# [عنوان جذاب وواضح]

## نظرة عامة
[مقدمة قوية تشرح الموضوع]

## الإحصائيات الرئيسية
| المؤشر | القيمة | النسبة |
|--------|--------|--------|
| ... | ... | ... |

## التحليل التفصيلي
### [قسم فرعي 1]
- نقطة مهمة مع أرقام
- نقطة أخرى

### [قسم فرعي 2]
- تفاصيل إضافية

## الرؤى والتوصيات
- توصية 1 (محددة وقابلة للتنفيذ)
- توصية 2

## الخلاصة
[ملخص تنفيذي شامل]

ملاحظات:
- استخدم **نص عريض** للأرقام المهمة
- أضف جداول للمقارنات
- اجعل العناوين واضحة ومحددة
- ركز على الإجابة المباشرة لطلب المستخدم
` : `
1. Main Title (H1): Compelling and clear title summarizing the report
2. Strong Introduction: 2-3 sentences explaining the analysis topic
3. Well-organized sections with subheadings (H2, H3)
4. Use markdown tables for comparative data
5. Add key points with bullet points
6. End with clear executive summary

Required Report Structure:
# [Compelling Clear Title]

## Overview
[Strong introduction explaining the topic]

## Key Statistics
| Metric | Value | Percentage |
|--------|-------|------------|
| ... | ... | ... |

## Detailed Analysis
### [Subsection 1]
- Important point with numbers
- Another point

### [Subsection 2]
- Additional details

## Insights & Recommendations
- Recommendation 1 (specific and actionable)
- Recommendation 2

## Conclusion
[Comprehensive executive summary]

Notes:
- Use **bold text** for important numbers
- Add tables for comparisons
- Make headings clear and specific
- Focus on direct answers to user's request
`}

Remember: Write ONLY in ${language === 'ar' ? 'Arabic' : 'English'}. Create SEO-friendly, well-structured content.`;

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
                ? 'أنت محلل بيانات محترف وكاتب محتوى SEO. مهمتك: 1) إنشاء تقارير منظمة بعناوين واضحة (H1, H2, H3)، 2) استخدام جداول markdown للبيانات، 3) إضافة نقاط رئيسية مع أرقام دقيقة، 4) كتابة محتوى صديق لمحركات البحث، 5) تنسيق احترافي مع **نص عريض** للأرقام المهمة. اكتب بالعربية فقط.'
                : 'You are a professional data analyst and SEO content writer. Your tasks: 1) Create well-organized reports with clear headings (H1, H2, H3), 2) Use markdown tables for data, 3) Add key points with accurate numbers, 4) Write SEO-friendly content, 5) Professional formatting with **bold text** for important numbers. Write in English only.'
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
  
  // إنشاء التقرير بلغة واحدة فقط مع تحسينات SEO
  if (language === 'ar') {
  return `
# 📈 تحليل شامل للبيانات: ${prompt || 'تقرير احترافي'}

## نظرة عامة
تم تحليل مجموعة بيانات شاملة تحتوي على **${dataLength} سجل** عبر **${columns.length} عمود** مختلف. هذا التقرير يقدم رؤى إحصائية متقدمة وتوصيات عملية بناءً على البيانات المتاحة.

## الإحصائيات الرئيسية

| البيان | القيمة |
|--------|--------|
| إجمالي السجلات | **${dataLength}** |
| عدد الأعمدة | **${columns.length}** |
| الأعمدة الرقمية | **${numericColumns.length}** |
| الأعمدة النصية | **${textColumns.length}** |
| جودة البيانات | ${missingData.length === 0 ? '✅ ممتازة (100%)' : `⚠️ ${missingData.length} عمود به قيم مفقودة`} |

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

## 🔍 الرؤى والتحليلات الرئيسية

${insights.map(insight => insight).join('\n')}

## 📌 النقاط المهمة

${numericColumns.slice(0, 3).map((stat, i) => `
${i + 1}. **${stat.column}**: تتراوح القيم من **${stat.min}** إلى **${stat.max}** بمتوسط **${stat.average}**
`).join('')}

## 💡 التوصيات الاستراتيجية

| التوصية | الأولوية | التأثير المتوقع |
|---------|----------|------------------|
| ${missingData.length > 0 ? 'معالجة القيم المفقودة' : 'الحفاظ على جودة البيانات'} | 🔴 عالية | تحسين دقة التحليل |
| ${numericColumns.length > 0 ? 'تحليل الارتباطات' : 'إضافة مؤشرات رقمية'} | 🟡 متوسطة | رؤى أعمق |
| إنشاء لوحات معلومات تفاعلية | 🟢 منخفضة | تحسين العرض |

### توصيات مفصلة:

1. **تحسين جودة البيانات**
   - ${missingData.length > 0 ? `معالجة **${missingData.length}** عمود يحتوي على قيم مفقودة` : 'البيانات كاملة - استمر في نفس المعايير'}
   - التحقق من صحة البيانات المدخلة
   - توحيد التنسيقات

2. **التحليل المتقدم**
   - ${numericColumns.length >= 2 ? 'تحليل العلاقات بين المتغيرات الرقمية' : 'إضافة المزيد من المؤشرات الرقمية'}
   - ${textColumns.length > 0 ? 'تصنيف وتجميع البيانات النصية' : 'إضافة بيانات وصفية'}

3. **التصور والعرض**
   - إنشاء رسوم بيانية تفاعلية
   - لوحات معلومات في الوقت الفعلي
   - تقارير دورية آلية

## 📊 الخلاصة التنفيذية

تم تحليل **${dataLength} سجل** بنجاح عبر **${columns.length} عمود** مختلف. البيانات ${missingData.length === 0 ? 'كاملة وجاهزة للتحليل المتقدم' : `تحتاج لمعالجة ${missingData.length} عمود قبل التحليل المتقدم`}. ${numericColumns.length > 0 ? `تم رصد ${numericColumns.length} مؤشر رقمي رئيسي` : 'ينصح بإضافة مؤشرات رقمية'}.

---

**📝 ملاحظة**: هذا تقرير إحصائي مبني على البيانات المتاحة. للحصول على تحليل أعمق بالذكاء الاصطناعي، تأكد من تكوين GROQ API key.`;
  } else {
    // English version with SEO optimization
    return `
# 📈 Comprehensive Data Analysis: ${prompt || 'Professional Report'}

## Overview
Analyzed a comprehensive dataset containing **${dataLength} records** across **${columns.length} different columns**. This report provides advanced statistical insights and practical recommendations based on available data.

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Records | **${dataLength}** |
| Number of Columns | **${columns.length}** |
| Numeric Columns | **${numericColumns.length}** |
| Text Columns | **${textColumns.length}** |
| Data Quality | ${missingData.length === 0 ? '✅ Excellent (100%)' : `⚠️ ${missingData.length} columns with missing values`} |

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

## 🔍 Key Insights & Analysis

${insights.map(insight => insight).join('\n')}

## 📌 Important Highlights

${numericColumns.slice(0, 3).map((stat, i) => `
${i + 1}. **${stat.column}**: Values range from **${stat.min}** to **${stat.max}** with average **${stat.average}**
`).join('')}

## 💡 Strategic Recommendations

| Recommendation | Priority | Expected Impact |
|---------------|----------|-----------------|
| ${missingData.length > 0 ? 'Address Missing Values' : 'Maintain Data Quality'} | 🔴 High | Improve Analysis Accuracy |
| ${numericColumns.length > 0 ? 'Correlation Analysis' : 'Add Numeric Metrics'} | 🟡 Medium | Deeper Insights |
| Create Interactive Dashboards | 🟢 Low | Better Visualization |

### Detailed Recommendations:

1. **Improve Data Quality**
   - ${missingData.length > 0 ? `Address **${missingData.length}** columns with missing values` : 'Data complete - maintain current standards'}
   - Validate input data
   - Standardize formats

2. **Advanced Analysis**
   - ${numericColumns.length >= 2 ? 'Analyze relationships between numeric variables' : 'Add more numeric indicators'}
   - ${textColumns.length > 0 ? 'Classify and group text data' : 'Add descriptive data'}

3. **Visualization & Presentation**
   - Create interactive charts
   - Real-time dashboards
   - Automated periodic reports

## 📊 Executive Summary

Successfully analyzed **${dataLength} records** across **${columns.length} different columns**. Data is ${missingData.length === 0 ? 'complete and ready for advanced analysis' : `requires processing of ${missingData.length} columns before advanced analysis`}. ${numericColumns.length > 0 ? `Identified ${numericColumns.length} key numeric indicators` : 'Recommend adding numeric metrics'}.

---

**📝 Note**: This is a statistical report based on available data. For deeper AI-powered analysis, ensure GROQ API key is configured.`;
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
