import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'ar' | 'en';

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  toggleLocale: () => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  ar: {
    // Navigation & General
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    back: 'العودة',
    close: 'إغلاق',
    cancel: 'إلغاء',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
    confirm: 'تأكيد',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    
    // Welcome & Landing
    welcome: 'مرحباً بك في مولد التقارير الذكية',
    welcomeMessage: 'ابدأ بتحليل بياناتك وإنشاء تقارير ذكية في دقائق',
    createNewReport: 'إنشاء تقرير جديد',
    myReports: 'تقاريري',
    settings: 'الإعدادات',
    adminPanel: 'لوحة الإدارة',
    
    // File Upload
    uploadFile: 'رفع الملف',
    uploadFiles: 'رفع الملفات',
    uploadFileMessage: 'ارفع ملف CSV أو Excel لبدء التحليل',
    selectFile: 'اختر ملف',
    selectDataFile: 'اختر ملف البيانات',
    dragDropMessage: 'اسحب الملف هنا أو انقر للاختيار',
    supportedFormats: 'الملفات المدعومة: CSV, XLSX, XLS',
    fileSizeLimit: 'الحد الأقصى: 10 ميجابايت',
    noReportsYet: 'لا توجد تقارير بعد',
    uploadFileAndStart: 'ارفع ملفاً وابدأ في إنشاء تقريرك الأول',
    
    // Report Generation
    generateReport: 'توليد التقرير',
    enterPrompt: 'أدخل وصفاً للتحليل المطلوب',
    promptPlaceholder: 'مثال: حلل اتجاهات المبيعات وقدم توصيات',
    generateButton: 'توليد التقرير',
    generating: 'جاري التوليد...',
    
    // Report Display
    reportGenerated: 'تم توليد التقرير',
    downloadPDF: 'تحميل PDF',
    viewReport: 'عرض التقرير',
    reportTitle: 'التقرير المولد',
    
    // User Management
    userManagement: 'إدارة المستخدمين',
    allUsers: 'جميع المستخدمين',
    totalUsers: 'إجمالي المستخدمين',
    activeUsers: 'المستخدمين النشطين',
    inactiveUsers: 'المستخدمين غير النشطين',
    admins: 'المديرين',
    users: 'المستخدمين',
    searchUsers: 'البحث في المستخدمين...',
    allRoles: 'جميع الأدوار',
    allStatus: 'جميع الحالات',
    active: 'نشط',
    inactive: 'غير نشط',
    admin: 'مدير',
    user: 'مستخدم',
    editUser: 'تعديل المستخدم',
    deleteUser: 'حذف المستخدم',
    confirmDelete: 'تأكيد الحذف',
    deleteUserMessage: 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.',
    
    // User Settings
    accountSettings: 'إعدادات الحساب',
    profileInformation: 'معلومات الملف الشخصي',
    changePassword: 'تغيير كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    role: 'الدور',
    status: 'الحالة',
    registered: 'تاريخ التسجيل',
    lastLogin: 'آخر دخول',
    additionalInfo: 'معلومات إضافية',
    passwordRequirements: 'يجب أن تكون 6 أحرف على الأقل',
    passwordsNotMatch: 'كلمات المرور الجديدة غير متطابقة',
    
    // Reports
    reports: 'التقارير',
    allReports: 'جميع التقارير',
    totalReports: 'إجمالي التقارير',
    completed: 'مكتمل',
    processing: 'قيد المعالجة',
    pending: 'في الانتظار',
    reportError: 'خطأ في التقرير',
    public: 'عام',
    private: 'خاص',
    created: 'تاريخ الإنشاء',
    generated: 'تاريخ التوليد',
    prompt: 'الطلب',
    userInfo: 'معلومات المستخدم',
    name: 'الاسم',
    noReports: 'لا توجد تقارير',
    noReportsMessage: 'لا توجد تقارير تطابق معايير البحث',
    createFirstReport: 'إنشاء تقرير جديد',
    
    // Admin Dashboard
    adminDashboard: 'لوحة الإدارة',
    manageReportsUsers: 'إدارة جميع التقارير والمستخدمين',
    reportsTab: 'التقارير',
    usersTab: 'المستخدمين',
    
    // Common Actions
    uploadNew: 'رفع تقرير جديد',
    view: 'عرض',
    download: 'تحميل',
    update: 'تحديث',
    saving: 'جاري الحفظ...',
    updating: 'جاري التحديث...',
    deleting: 'جاري الحذف...',
    changing: 'جاري التغيير...',
    
    // Additional UI Elements
    createdOn: 'تم إنشاؤه في:',
    noReportGenerated: 'لم يتم توليد تقرير بعد',
    createdLabel: 'تم الإنشاء:',
    generatedLabel: 'تم التوليد:',
    welcomeComma: 'مرحباً،',
    
    // Messages
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    userUpdated: 'تم تحديث المستخدم بنجاح',
    userDeleted: 'تم حذف المستخدم بنجاح',
    reportGeneratedSuccess: 'تم توليد التقرير بنجاح',
    fileUploaded: 'تم رفع الملف بنجاح',
    
    // Errors
    loginFailed: 'فشل في تسجيل الدخول',
    registrationFailed: 'فشل في إنشاء الحساب',
    updateFailed: 'فشل في التحديث',
    deleteFailed: 'فشل في الحذف',
    uploadFailed: 'فشل في رفع الملف',
    generationFailed: 'فشل في توليد التقرير',
    loadFailed: 'فشل في التحميل',
  },
  en: {
    // Navigation & General
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    
    // Welcome & Landing
    welcome: 'Welcome to AI Report Generator',
    welcomeMessage: 'Start analyzing your data and creating smart reports in minutes',
    createNewReport: 'Create New Report',
    myReports: 'My Reports',
    settings: 'Settings',
    adminPanel: 'Admin Panel',
    
    // File Upload
    uploadFile: 'Upload File',
    uploadFiles: 'Upload Files',
    uploadFileMessage: 'Upload a CSV or Excel file to start analysis',
    selectFile: 'Select File',
    selectDataFile: 'Select Data File',
    dragDropMessage: 'Drag file here or click to select',
    supportedFormats: 'Supported formats: CSV, XLSX, XLS',
    fileSizeLimit: 'Max size: 10MB',
    noReportsYet: 'No reports yet',
    uploadFileAndStart: 'Upload a file and start creating your first report',
    
    // Report Generation
    generateReport: 'Generate Report',
    enterPrompt: 'Enter a description for the required analysis',
    promptPlaceholder: 'Example: Analyze sales trends and provide recommendations',
    generateButton: 'Generate Report',
    generating: 'Generating...',
    
    // Report Display
    reportGenerated: 'Report Generated',
    downloadPDF: 'Download PDF',
    viewReport: 'View Report',
    reportTitle: 'Generated Report',
    
    // User Management
    userManagement: 'User Management',
    allUsers: 'All Users',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    inactiveUsers: 'Inactive Users',
    admins: 'Admins',
    users: 'Users',
    searchUsers: 'Search users...',
    allRoles: 'All Roles',
    allStatus: 'All Status',
    active: 'Active',
    inactive: 'Inactive',
    admin: 'Admin',
    user: 'User',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    confirmDelete: 'Confirm Delete',
    deleteUserMessage: 'Are you sure you want to delete this user? This action cannot be undone.',
    
    // User Settings
    accountSettings: 'Account Settings',
    profileInformation: 'Profile Information',
    changePassword: 'Change Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    email: 'Email',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    role: 'Role',
    status: 'Status',
    registered: 'Registered',
    lastLogin: 'Last Login',
    additionalInfo: 'Additional Information',
    passwordRequirements: 'Must be at least 6 characters',
    passwordsNotMatch: 'New passwords do not match',
    
    // Reports
    reports: 'Reports',
    allReports: 'All Reports',
    totalReports: 'Total Reports',
    completed: 'Completed',
    processing: 'Processing',
    pending: 'Pending',
    reportError: 'Report Error',
    public: 'Public',
    private: 'Private',
    created: 'Created',
    generated: 'Generated',
    prompt: 'Prompt',
    userInfo: 'User Information',
    name: 'Name',
    noReports: 'No reports found',
    noReportsMessage: 'No reports match the search criteria',
    createFirstReport: 'Create First Report',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    manageReportsUsers: 'Manage all reports and users',
    reportsTab: 'Reports',
    usersTab: 'Users',
    
    // Common Actions
    uploadNew: 'Upload New Report',
    view: 'View',
    download: 'Download',
    update: 'Update',
    saving: 'Saving...',
    updating: 'Updating...',
    deleting: 'Deleting...',
    changing: 'Changing...',
    
    // Additional UI Elements
    createdOn: 'Created on:',
    noReportGenerated: 'No report generated yet',
    createdLabel: 'Created:',
    generatedLabel: 'Generated:',
    welcomeComma: 'Welcome,',
    
    // Messages
    profileUpdated: 'Profile updated successfully',
    passwordChanged: 'Password changed successfully',
    userUpdated: 'User updated successfully',
    userDeleted: 'User deleted successfully',
    reportGeneratedSuccess: 'Report generated successfully',
    fileUploaded: 'File uploaded successfully',
    
    // Errors
    loginFailed: 'Login failed',
    registrationFailed: 'Registration failed',
    updateFailed: 'Update failed',
    deleteFailed: 'Delete failed',
    uploadFailed: 'Upload failed',
    generationFailed: 'Generation failed',
    loadFailed: 'Load failed',
  },
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem('locale');
    return stored === 'en' ? 'en' : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const toggleLocale = () => setLocale(prev => (prev === 'ar' ? 'en' : 'ar'));

  const value = useMemo(() => ({
    locale,
    dir: (locale === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    toggleLocale,
    t: (key: string) => translations[locale][key] ?? key,
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};


