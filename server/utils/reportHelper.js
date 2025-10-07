const Report = require('../models/Report');

/**
 * Check report ownership
 */
const checkReportOwnership = (report, userId) => {
  if (userId && report.userId && !report.userId.equals(userId)) {
    throw new Error('Access denied. You can only access your own reports.');
  }
};

/**
 * Check admin access
 */
const checkAdminAccess = (user) => {
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
};

/**
 * Find report by ID
 */
const findReportById = async (reportId, populateUser = false) => {
  let query = Report.findById(reportId);
  
  if (populateUser) {
    query = query.populate('userId', 'username email firstName lastName role avatarUrl');
  }
  
  const report = await query;
  
  if (!report) {
    throw new Error('Report not found');
  }
  
  return report;
};

module.exports = {
  checkReportOwnership,
  checkAdminAccess,
  findReportById
};

