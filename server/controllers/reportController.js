const Report = require('../models/Report');
const Settings = require('../models/Settings');
const { processFile, generateReport, generatePDF } = require('../services/reportService');
const { sendReportByEmail } = require('../services/emailService');
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
    const { prompt, language, isPublic } = req.body;

    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user?._id);

    const aiResponse = await generateReport(report.data, prompt, language || 'ar');
    
    report.generatedReport = aiResponse;
    report.prompt = prompt;
    report.language = language || 'ar';
    report.isPublic = isPublic !== undefined ? isPublic : true;
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

// Get all public reports (for blog page)
const getPublicReports = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    
    const reports = await Report.find({ 
      isPublic: true,
      status: 'completed',
      generatedReport: { $exists: true, $ne: '' }
    })
      .select('-data')
      .populate('userId', 'firstName lastName avatarUrl')
      .sort({ generatedAt: -1 })
      .limit(100)
      .lean();
    
    const reportsWithCounts = await Promise.all(
      reports.map(async (report) => {
        const commentsCount = await Comment.countDocuments({ 
          reportId: report._id,
          isApproved: true 
        });
        return { ...report, commentsCount };
      })
    );
    
    sendSuccess(res, reportsWithCounts);
  } catch (error) {
    console.error('Get public reports error:', error);
    sendError(res, 'Failed to get public reports', 500, error);
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await findReportById(reportId, true);
    
    if (req.user) {
      checkReportOwnership(report, req.user._id);
    } else if (!report.isPublic) {
      return sendError(res, 'This report is private', 403);
    }
    
    sendSuccess(res, report);
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

// إرسال التقرير بالبريد الإلكتروني
const emailReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user._id);
    
    if (!report.generatedReport) {
      return sendError(res, 'Report not generated yet', 400);
    }
    
    // توليد PDF
    const pdfBuffer = await generatePDF(report);
    
    // إرسال بالبريد
    await sendReportByEmail(req.user, report, pdfBuffer);
    
    sendSuccess(res, null, 'تم إرسال التقرير إلى بريدك الإلكتروني');
    
  } catch (error) {
    console.error('Email report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to email report', statusCode, error);
  }
};

// تغيير حالة التقرير من خاص إلى عام والعكس
const togglePublicStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { isPublic } = req.body;
    
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user._id);
    
    report.isPublic = isPublic;
    await report.save();
    
    const message = isPublic
      ? 'Report is now public and will appear in the blog'
      : 'Report is now private';
    
    sendSuccess(res, { isPublic: report.isPublic }, message);
    
  } catch (error) {
    console.error('Toggle public status error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to toggle public status', statusCode, error);
  }
};

const addRating = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return sendError(res, 'Report not found', 404);
    }

    if (!report.isPublic) {
      return sendError(res, 'Cannot rate private reports', 403);
    }

    const existingRatingIndex = report.ratings.findIndex(
      r => r.userId.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {
      report.ratings[existingRatingIndex].rating = rating;
      report.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      report.ratings.push({ userId, rating });
    }

    report.calculateAverageRating();
    await report.save();

    sendSuccess(res, {
      averageRating: report.averageRating,
      totalRatings: report.totalRatings,
      userRating: rating
    }, 'Rating added successfully');
  } catch (error) {
    sendError(res, 'Failed to add rating', 500, error);
  }
};

const deleteRating = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user._id;

    const report = await Report.findById(reportId);
    if (!report) {
      return sendError(res, 'Report not found', 404);
    }

    report.ratings = report.ratings.filter(
      r => r.userId.toString() !== userId.toString()
    );

    report.calculateAverageRating();
    await report.save();

    sendSuccess(res, {
      averageRating: report.averageRating,
      totalRatings: report.totalRatings
    }, 'Rating removed successfully');
  } catch (error) {
    sendError(res, 'Failed to delete rating', 500, error);
  }
};

const getRatingsSettings = async (req, res) => {
  try {
    const showRatings = await Settings.get('showRatings', true);
    sendSuccess(res, { showRatings });
  } catch (error) {
    sendError(res, 'Failed to get settings', 500, error);
  }
};

const updateRatingsSettings = async (req, res) => {
  try {
    checkAdminAccess(req.user);
    
    const { showRatings } = req.body;
    
    await Settings.set('showRatings', showRatings, req.user._id, 'Control visibility of ratings on public reports');

    sendSuccess(res, { showRatings }, 'Settings updated successfully');
  } catch (error) {
    sendError(res, error.message || 'Failed to update settings', error.message ? 403 : 500, error);
  }
};

const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prompt, language, isPublic, generatedReport } = req.body;
    
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user._id);
    
    if (prompt !== undefined) report.prompt = prompt;
    if (language !== undefined) report.language = language;
    if (isPublic !== undefined) report.isPublic = isPublic;
    if (generatedReport !== undefined) {
      report.generatedReport = generatedReport;
      report.generatedAt = new Date();
    }
    
    await report.save();
    
    sendSuccess(res, { report }, 'Report updated successfully');
  } catch (error) {
    console.error('Update report error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to update report', statusCode, error);
  }
};

const regenerateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prompt, language } = req.body;
    
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    
    const report = await findReportById(reportId);
    checkReportOwnership(report, req.user._id);
    
    if (!report.data || report.data.length === 0) {
      return sendError(res, 'No data available for regeneration', 400);
    }
    
    report.status = 'processing';
    if (prompt) report.prompt = prompt;
    if (language) report.language = language;
    await report.save();
    
    const generatedText = await generateReport(report.data, report.prompt, report.language);
    
    report.generatedReport = generatedText;
    report.status = 'completed';
    report.generatedAt = new Date();
    await report.save();
    
    sendSuccess(res, { report }, 'Report regenerated successfully');
  } catch (error) {
    console.error('Regenerate report error:', error);
    
    const report = await Report.findById(req.params.reportId);
    if (report) {
      report.status = 'error';
      await report.save();
    }
    
    const statusCode = error.message?.includes('not found') ? 404 : 
                       error.message?.includes('Access denied') ? 403 : 500;
    sendError(res, error.message || 'Failed to regenerate report', statusCode, error);
  }
};

module.exports = {
  uploadFile,
  generateAReport,
  getAllReports,
  getPublicReports,
  getReport,
  downloadReport,
  emailReport,
  togglePublicStatus,
  updateReport,
  regenerateReport,
  deleteReport,
  getAllReportsForAdmin,
  deleteReportByAdmin,
  addRating,
  deleteRating,
  getRatingsSettings,
  updateRatingsSettings
};
