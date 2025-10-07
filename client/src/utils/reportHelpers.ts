// Report utility functions

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getStatusText = (status: string, locale: string = 'en'): string => {
  const statusMap: Record<string, { ar: string; en: string }> = {
    completed: { ar: 'مكتمل', en: 'Completed' },
    processing: { ar: 'قيد المعالجة', en: 'Processing' },
    error: { ar: 'خطأ', en: 'Error' },
    pending: { ar: 'في الانتظار', en: 'Pending' }
  };
  
  return statusMap[status]?.[locale as 'ar' | 'en'] || status;
};

export const formatDate = (dateString: string, locale: string = 'en'): string => {
  return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

