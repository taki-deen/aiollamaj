const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const { 
  uploadFile, 
  generateAReport, 
  getAllReports, 
  getReport, 
  downloadReport, 
  deleteReport,
  getAllReportsForAdmin,
  deleteReportByAdmin
} = require('../controllers/reportController');
const { authenticate, optionalAuth } = require('../middleware/auth');

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

// File upload route (optional authentication)
router.post('/upload', optionalAuth, upload.single('file'), uploadFile);

// Generate report (optional authentication)
router.post('/generate/:reportId', optionalAuth, generateAReport);

// Get all reports (optional authentication - shows user's reports if authenticated)
router.get('/', optionalAuth, getAllReports);

// Get single report (optional authentication)
router.get('/:reportId', optionalAuth, getReport);

// Download report as PDF (optional authentication)
router.get('/:reportId/download', optionalAuth, downloadReport);

// Delete report (optional authentication)
router.delete('/:reportId', optionalAuth, deleteReport);

// Admin routes
router.get('/admin/all', authenticate, getAllReportsForAdmin);
router.delete('/admin/:reportId', authenticate, deleteReportByAdmin);

module.exports = router;
