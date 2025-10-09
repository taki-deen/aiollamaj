import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  isApproved: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CommentsProps {
  reportId: string;
  user: User | null;
}

const Comments: React.FC<CommentsProps> = ({ reportId, user }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { locale } = useLocale();

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE}/comments/${reportId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert(locale === 'ar' ? 'يجب تسجيل الدخول للتعليق' : 'Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      alert(locale === 'ar' ? 'الرجاء كتابة تعليق' : 'Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE}/comments/${reportId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewComment('');
        alert(locale === 'ar' 
          ? '✅ تم إضافة التعليق، في انتظار الموافقة'
          : '✅ Comment added, waiting for approval'
        );
        fetchComments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل إضافة التعليق' : 'Failed to add comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm(locale === 'ar' ? 'هل تريد حذف التعليق؟' : 'Delete this comment?')) {
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.delete(`${API_BASE}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(comments.filter(c => c._id !== commentId));
      alert(locale === 'ar' ? '✅ تم حذف التعليق' : '✅ Comment deleted');
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل حذف التعليق' : 'Failed to delete comment'));
    }
  };

  const handleApprove = async (commentId: string, isApproved: boolean) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.patch(
        `${API_BASE}/comments/${commentId}/approve`,
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchComments();
      alert(locale === 'ar' 
        ? `✅ تم ${isApproved ? 'الموافقة على' : 'رفض'} التعليق`
        : `✅ Comment ${isApproved ? 'approved' : 'rejected'}`
      );
    } catch (error: any) {
      alert(error.response?.data?.message || (locale === 'ar' ? 'فشل تحديث التعليق' : 'Failed to update comment'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return locale === 'ar' ? 'الآن' : 'just now';
    if (diffMins < 60) return locale === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return locale === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    
    return locale === 'ar'
      ? date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        {locale === 'ar' ? 'التعليقات' : 'Comments'}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({comments.length})
        </span>
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            {user.avatarUrl ? (
              <img
                src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`}
                alt={user.firstName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                maxLength={1000}
                rows={3}
                className={`w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newComment.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting 
                    ? (locale === 'ar' ? 'جاري الإرسال...' : 'Posting...')
                    : (locale === 'ar' ? 'نشر التعليق' : 'Post Comment')
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <p className="text-blue-800 dark:text-blue-200">
            {locale === 'ar' 
              ? '🔒 يجب تسجيل الدخول للتعليق'
              : '🔒 Please login to comment'
            }
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>{locale === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet'}</p>
          <p className="text-sm mt-2">
            {locale === 'ar' ? 'كن أول من يعلق!' : 'Be the first to comment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`p-4 rounded-xl border transition-all ${
                comment.isApproved
                  ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
              }`}
            >
              <div className="flex gap-3">
                {comment.userId?.avatarUrl ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${comment.userId.avatarUrl}`}
                    alt={`${comment.userId.firstName} ${comment.userId.lastName}`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(comment.userId?.firstName || 'U', comment.userId?.lastName || 'U')}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!comment.isApproved && (
                        <span className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                          {locale === 'ar' ? 'في انتظار الموافقة' : 'Pending'}
                        </span>
                      )}

                      {user?.role === 'admin' && !comment.isApproved && (
                        <button
                          onClick={() => handleApprove(comment._id, true)}
                          className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'موافقة' : 'Approve'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {(user?._id === comment.userId._id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={`text-gray-700 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'} whitespace-pre-wrap break-words`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;

