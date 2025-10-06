const Report = require('../models/Report');
const { processFile, generateReport, generatePDF } = require('../services/reportService');

// Upload file and create report
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const fileData = await processFile(req.file.path);
    
    const report = new Report({
      filename: req.file.originalname,
      filePath: req.file.path,
      data: fileData,
      status: 'pending',
      userId: req.user ? req.user._id : null
    });
    
    await report.save();
    
    res.json({ 
      success: true,
      message: 'File uploaded successfully',
      data: {
        reportId: report._id,
        filename: report.filename,
        recordCount: fileData.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

// Generate AI report
const generateAReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prompt } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    // Check if user owns this report (if authenticated)
    if (req.user && report.userId && !report.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only generate reports for your own files.'
      });
    }

    const aiResponse = await generateReport(report.data, prompt);
    
    report.generatedReport = aiResponse;
    report.prompt = prompt;
    report.status = 'completed';
    report.generatedAt = new Date();
    
    await report.save();
    
    res.json({ 
      success: true,
      message: 'Report generated successfully',
      data: {
        report: {
          _id: report._id,
          filename: report.filename,
          prompt: report.prompt,
          generatedReport: report.generatedReport,
          status: report.status,
          generatedAt: report.generatedAt,
          createdAt: report.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Report generation failed',
      error: error.message
    });
  }
};

// Get all reports (with user filtering if authenticated)
const getAllReports = async (req, res) => {
  try {
    const query = {};
    
    // If user is authenticated, only show their reports
    if (req.user) {
      query.userId = req.user._id;
    }
    
    const reports = await Report.find(query)
      .select('-data') // Exclude data field for performance
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        reports,
        count: reports.length
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns this report (if authenticated)
    if (req.user && report.userId && !report.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reports.'
      });
    }
    
    res.json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report',
      error: error.message
    });
  }
};

// Download report as PDF
const downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns this report (if authenticated)
    if (req.user && report.userId && !report.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only download your own reports.'
      });
    }

    if (!report.generatedReport) {
      return res.status(400).json({
        success: false,
        message: 'Report not generated yet'
      });
    }

    const pdfBuffer = await generatePDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}_report.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
      error: error.message
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns this report (if authenticated)
    if (req.user && report.userId && !report.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own reports.'
      });
    }

    await Report.findByIdAndDelete(reportId);
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Get all reports for admin with user details
const getAllReportsForAdmin = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const reports = await Report.find({})
      .populate('userId', 'username email firstName lastName role createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { reports: reports } 
    });
  } catch (error) {
    console.error('Fetch all reports for admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch all reports' 
    });
  }
};

module.exports = {
  uploadFile,
  generateAReport,
  getAllReports,
  getReport,
  downloadReport,
  deleteReport,
  getAllReportsForAdmin
};
