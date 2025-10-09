const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
  approveComment,
  getAllComments
} = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.post('/:reportId', authenticate, addComment);
router.get('/:reportId', optionalAuth, getComments);
router.delete('/:commentId', authenticate, deleteComment);
router.patch('/:commentId/approve', authenticate, approveComment);
router.get('/admin/all', authenticate, getAllComments);

module.exports = router;

