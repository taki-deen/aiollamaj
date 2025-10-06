const XLSX = require('xlsx');
const fs = require('fs-extra');
const axios = require('axios');
const PDFDocument = require('pdfkit');

// ===== File Processing =====
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
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, idx) => row[h] = values[idx] || '');
      data.push(row);
    }
  }
  return data;
};

// ===== Gemini Analysis - الحل النهائي =====
const generateReport = async (data, prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('No valid Gemini API key found, using fallback analysis...');
      return generateFallbackReport(data, prompt);
    }

    // تحديد كمية البيانات لتجنب تجاوز الحدود
    const sampleData = data.slice(0, 50);
    const dataString = JSON.stringify(sampleData, null, 2);
    
    const fullPrompt = `Based on the following data: ${dataString}\n\nPlease analyze this data and ${prompt}. Provide insights, patterns, and recommendations in Arabic.`;

    // الحل: استخدام النموذج الصحيح - gemini-1.0-pro
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // استخراج النص بالطريقة الصحيحة
    if (response.data && response.data.candidates && response.data.candidates[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.log('Unexpected response format:', JSON.stringify(response.data, null, 2));
      return generateFallbackReport(data, prompt);
    }

  } catch (error) {
    console.error('Gemini API error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // إذا فشل gemini-1.0-pro، جرب gemini-pro
    if (error.response?.status === 404) {
      console.log('Trying gemini-pro as fallback...');
      return generateReportWithGeminiPro(data, prompt);
    }
    
    return generateFallbackReport(data, prompt);
  }
};

// ===== بديل إذا فشل النموذج الأول =====
const generateReportWithGeminiPro = async (data, prompt) => {
  try {
    const sampleData = data.slice(0, 50);
    const dataString = JSON.stringify(sampleData, null, 2);
    
    const fullPrompt = `Based on the following data: ${dataString}\n\nPlease analyze this data and ${prompt}. Provide insights, patterns, and recommendations in Arabic.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      return generateFallbackReport(data, prompt);
    }

  } catch (error) {
    console.error('Gemini Pro API error:', error.message);
    return generateFallbackReport(data, prompt);
  }
};

// ===== Fallback Report =====
const generateFallbackReport = (data, prompt) => {
  const dataLength = data.length;
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const statistics = columns.map(col => {
    const values = data.map(row => row[col]).filter(v => v != null && v !== '');
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));

    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a,b)=>a+b,0);
      const avg = sum/numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const sorted = numericValues.slice().sort((a,b)=>a-b);
      const mid = Math.floor(sorted.length/2);
      const median = sorted.length%2===0 ? (sorted[mid-1]+sorted[mid])/2 : sorted[mid];
      return { 
        column: col, 
        type: 'numeric', 
        count: numericValues.length, 
        average: avg.toFixed(2), 
        median: median.toFixed(2), 
        min, 
        max, 
        range: (max-min).toFixed(2) 
      };
    } else {
      const uniqueValues = [...new Set(values)];
      const valueCounts = {};
      values.forEach(v=>valueCounts[v]=(valueCounts[v]||0)+1);
      const mostCommon = Object.keys(valueCounts).reduce((a,b)=>valueCounts[a]>valueCounts[b]?a:b);
      return { 
        column: col, 
        type: 'text', 
        count: values.length, 
        unique: uniqueValues.length, 
        mostCommon, 
        frequency: valueCounts[mostCommon] 
      };
    }
  });

  const numericColumns = statistics.filter(s=>s.type==='numeric');
  const textColumns = statistics.filter(s=>s.type==='text');

  let insights = [];
  if(numericColumns.length>0) insights.push(`📊 الأعمدة الرقمية: ${numericColumns.length}`);
  if(textColumns.length>0) insights.push(`📝 الأعمدة النصية: ${textColumns.length}`);
  if(dataLength > 0) insights.push(`📋 إجمالي السجلات: ${dataLength}`);

  return `
# تقرير تحليل البيانات
- إجمالي السجلات: ${dataLength}
- الأعمدة: ${columns.join(', ')}
- طلب التحليل: ${prompt}

## الإحصائيات
${statistics.map(stat=>{
  if(stat.type==='numeric'){
    return `### ${stat.column} (رقمي)
- العدد: ${stat.count}
- المتوسط: ${stat.average}
- الوسيط: ${stat.median}
- المدى: من ${stat.min} إلى ${stat.max}`;
  } else {
    return `### ${stat.column} (نصي)
- العدد: ${stat.count}
- القيم الفريدة: ${stat.unique}
- الأكثر تكراراً: "${stat.mostCommon}" (${stat.frequency} مرة)`;
  }
}).join('\n\n')}

## الملاحظات
${insights.map(i=>`- ${i}`).join('\n')}

*ملاحظة: تم استخدام التحليل البديل بسبب عدم توفر مفتاح Gemini API أو وجود خطأ فيه.*
`;
};

// ===== Generate PDF =====
const generatePDF = async (report) => {
  return new Promise((resolve,reject)=>{
    try{
      const doc = new PDFDocument();
      const chunks = [];
      doc.on('data',chunk=>chunks.push(chunk));
      doc.on('end',()=>resolve(Buffer.concat(chunks)));
      doc.on('error',reject);

      doc.fontSize(20).text('التقرير المُولد بالذكاء الاصطناعي',{align:'center'});
      doc.moveDown();
      if(report.prompt){
        doc.fontSize(14).text('الطلب:',{underline:true});
        doc.fontSize(12).text(report.prompt);
        doc.moveDown();
      }
      doc.fontSize(14).text('التحليل:',{underline:true});
      doc.fontSize(12).text(report.generatedReport||'لا يتوفر تحليل',{width:500,align:'right'});
      doc.end();
    }catch(err){ reject(err); }
  });
};

module.exports = { processFile, generateReport, generatePDF };