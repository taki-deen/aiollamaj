require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-reports');

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const Report = require('./models/Report');
const { processFile, generateReport, generatePDF } = require('./services/reportService');

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = await processFile(req.file.path);
    
    const report = new Report({
      filename: req.file.originalname,
      filePath: req.file.path,
      data: fileData,
      status: 'pending'
    });
    
    await report.save();
    res.json({ reportId: report._id, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/generate-report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prompt } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const aiResponse = await generateReport(report.data, prompt);
    
    report.generatedReport = aiResponse;
    report.prompt = prompt;
    report.status = 'completed';
    report.generatedAt = new Date();
    
    await report.save();
    
    res.json({ report: report });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get('/api/reports/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Fetch report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

app.get('/api/download-pdf/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report || !report.generatedReport) {
      return res.status(404).json({ error: 'Report not found or not generated' });
    }

    const pdfBuffer = await generatePDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
