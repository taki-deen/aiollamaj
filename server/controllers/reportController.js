const Report = require('../models/Report');
const { processFile, generateReport, generatePDF } = require('../services/reportService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { checkReportOwnership, checkAdminAccess, findReportById } = require('../utils/reportHelper');

// Upload file and create report
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
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
    
    sendSuccess(res, {
      reportId: report._id,
      filename: report.filename,
      recordCount: fileData.length
    }, 'File uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    sendError(res, 'Upload failed', 500, error);
  }
};

// Generate AI report
const generateAReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prompt, language } = req.body;

    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user?._id);

    const aiResponse = await generateReport(report.data, prompt, language || 'ar');
    
    report.generatedReport = aiResponse;
    report.prompt = prompt;
    report.language = language || 'ar';
    report.status = 'completed';
    report.generatedAt = new Date();
    
    await report.save();
    
    sendSuccess(res, {
      report: {
        _id: report._id,
        filename: report.filename,
        prompt: report.prompt,
        generatedReport: report.generatedReport,
        status: report.status,
        generatedAt: report.generatedAt,
        createdAt: report.createdAt
      }
    }, 'Report generated successfully');
  } catch (error) {
    console.error('Generate report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Report generation failed', statusCode, error);
  }
};

// Get all reports (with user filtering if authenticated)
const getAllReports = async (req, res) => {
  try {
    const query = {};
    
    if (req.user) {
      query.userId = req.user._id;
    }
    
    const reports = await Report.find(query)
      .select('-data')
      .sort({ createdAt: -1 });
    
    sendSuccess(res, { reports, count: reports.length });
  } catch (error) {
    console.error('Get reports error:', error);
    sendError(res, 'Failed to get reports', 500, error);
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user?._id);
    
    sendSuccess(res, { report });
  } catch (error) {
    console.error('Get report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to get report', statusCode, error);
  }
};

// Download report as PDF
const downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await findReportById(reportId);
    
    // التحقق من الملكية فقط إذا كان المستخدم مسجل دخول
    if (req.user) {
      checkReportOwnership(report, req.user._id);
    } else if (!report.isPublic) {
      // إذا التقرير خاص ولا يوجد مستخدم، منع التحميل
      return sendError(res, 'Authentication required', 401);
    }

    if (!report.generatedReport) {
      return sendError(res, 'Report not generated yet', 400);
    }

    const pdfBuffer = await generatePDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}_report.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to download report', statusCode, error);
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user?._id);

    await Report.findByIdAndDelete(reportId);
    sendSuccess(res, {}, 'Report deleted successfully');
  } catch (error) {
    console.error('Delete report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to delete report', statusCode, error);
  }
};

// Get all reports for admin with user details
const getAllReportsForAdmin = async (req, res) => {
  try {
    checkAdminAccess(req.user);

    const reports = await Report.find({})
      .populate('userId', 'username email firstName lastName role createdAt lastLogin avatarUrl')
      .sort({ createdAt: -1 });

    sendSuccess(res, { reports });
  } catch (error) {
    console.error('Fetch all reports for admin error:', error);
    const statusCode = error.message.includes('Admin access') ? 403 : 500;
    sendError(res, error.message || 'Failed to fetch all reports', statusCode, error);
  }
};

// Delete any report by admin
const deleteReportByAdmin = async (req, res) => {
  try {
    checkAdminAccess(req.user);
    const { reportId } = req.params;
    await findReportById(reportId);
    await Report.findByIdAndDelete(reportId);
    
    sendSuccess(res, {}, 'Report deleted successfully');
  } catch (error) {
    console.error('Delete report by admin error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Admin access') ? 403 : 500;
    sendError(res, error.message || 'Failed to delete report', statusCode, error);
  }
};

module.exports = {
  uploadFile,
  generateAReport,
  getAllReports,
  getReport,
  downloadReport,
  deleteReport,
  getAllReportsForAdmin,
  deleteReportByAdmin
};
