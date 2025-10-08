const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const { 
  uploadFile, 
  generateAReport, 
  getAllReports,
  getPublicReports, 
  getReport, 
  downloadReport,
  emailReport,
  togglePublicStatus,
  deleteReport,
  getAllReportsForAdmin,
  deleteReportByAdmin
} = require('../controllers/reportController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadLimiter, aiLimiter, downloadLimiter, adminLimiter } = require('../middleware/rateLimiter');

// Configure multer for file uploads
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

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// File upload route (optional authentication) - مع Rate Limiting
router.post('/upload', uploadLimiter, optionalAuth, upload.single('file'), uploadFile);

// Generate report (optional authentication) - مع Rate Limiting للـ AI
router.post('/generate/:reportId', aiLimiter, optionalAuth, generateAReport);

// Get all reports (optional authentication - shows user's reports if authenticated)
router.get('/', optionalAuth, getAllReports);

// Get all public reports (no authentication required)
router.get('/public', getPublicReports);

// Get single report (optional authentication)
router.get('/:reportId', optionalAuth, getReport);

// Download report as PDF (optional authentication) - مع Rate Limiting
router.get('/:reportId/download', downloadLimiter, optionalAuth, downloadReport);

// Email report as PDF (requires authentication) - مع Rate Limiting
router.post('/:reportId/email', downloadLimiter, authenticate, emailReport);

// Toggle public status (requires authentication)
router.patch('/:reportId/toggle-public', authenticate, togglePublicStatus);

// Delete report (optional authentication)
router.delete('/:reportId', optionalAuth, deleteReport);

// Admin routes - مع Rate Limiting
router.get('/admin/all', authenticate, adminLimiter, getAllReportsForAdmin);
router.delete('/admin/:reportId', authenticate, adminLimiter, deleteReportByAdmin);

module.exports = router;
