const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { checkAdminAccess } = require('../utils/reportHelper');

const addComment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Comment content is required', 400);
    }

    if (content.length > 1000) {
      return sendError(res, 'Comment too long (max 1000 characters)', 400);
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return sendError(res, 'Report not found', 404);
    }

    if (!report.isPublic) {
      return sendError(res, 'Cannot comment on private reports', 403);
    }

    const comment = await Comment.create({
      reportId,
      userId,
      content: content.trim()
    });

    await comment.populate('userId', 'firstName lastName avatarUrl');

    sendSuccess(res, comment, 'Comment added successfully. Waiting for approval.', 201);
  } catch (error) {
    sendError(res, 'Failed to add comment', 500, error);
  }
};

const getComments = async (req, res) => {
  try {
    const { reportId } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const filter = { reportId };
    if (!isAdmin) {
      filter.isApproved = true;
    }

    const comments = await Comment.find(filter)
      .populate('userId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 });

    sendSuccess(res, comments);
  } catch (error) {
    sendError(res, 'Failed to fetch comments', 500, error);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    if (!isAdmin && comment.userId.toString() !== userId.toString()) {
      return sendError(res, 'You can only delete your own comments', 403);
    }

    await Comment.findByIdAndDelete(commentId);

    sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete comment', 500, error);
  }
};

const approveComment = async (req, res) => {
  try {
    checkAdminAccess(req.user);

    const { commentId } = req.params;
    const { isApproved } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved },
      { new: true }
    ).populate('userId', 'firstName lastName avatarUrl');

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    sendSuccess(res, comment, `Comment ${isApproved ? 'approved' : 'rejected'} successfully`);
  } catch (error) {
    sendError(res, error.message || 'Failed to update comment', error.message ? 403 : 500, error);
  }
};

const getAllComments = async (req, res) => {
  try {
    checkAdminAccess(req.user);

    const comments = await Comment.find()
      .populate('userId', 'firstName lastName avatarUrl email')
      .populate('reportId', 'filename prompt')
      .sort({ createdAt: -1 });

    const stats = {
      total: comments.length,
      approved: comments.filter(c => c.isApproved).length,
      pending: comments.filter(c => !c.isApproved).length
    };

    sendSuccess(res, { comments, stats });
  } catch (error) {
    sendError(res, error.message || 'Failed to fetch comments', error.message ? 403 : 500, error);
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  approveComment,
  getAllComments
};

