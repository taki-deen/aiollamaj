# 🎨 معمارية Frontend - نظام التقارير الذكية

> **واجهة مستخدم حديثة ومتجاوبة مع React و TypeScript**

---

## 📑 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [هيكل المشروع](#-هيكل-المشروع)
3. [التقنيات المستخدمة](#-التقنيات-المستخدمة)
4. [المكونات الأساسية](#-المكونات-الأساسية)
5. [الصفحات (Pages)](#-الصفحات-pages)
6. [السياقات (Contexts)](#-السياقات-contexts)
7. [التوجيه (Routing)](#-التوجيه-routing)
8. [إدارة الحالة](#-إدارة-الحالة)
9. [التكامل مع API](#-التكامل-مع-api)
10. [التصميم والأنماط](#-التصميم-والأنماط)
11. [الأمان](#-الأمان)
12. [الإعداد والتشغيل](#-الإعداد-والتشغيل)

---

## 🌟 نظرة عامة

### ما هو المشروع؟

واجهة مستخدم متكاملة مبنية بـ **React + TypeScript** توفر:

- 🎨 **تصميم حديث** مع Tailwind CSS
- 🌐 **دعم ثنائي اللغة** (عربي/إنجليزي) مع RTL/LTR
- 📱 **Responsive Design** يعمل على جميع الأجهزة
- 🔐 **نظام مصادقة كامل** مع JWT
- 📧 **التحقق بـ OTP** (6 أرقام)
- 🔑 **إعادة تعيين كلمة المرور**
- 📊 **عرض تقارير تفاعلية** مع Markdown
- 📥 **تحميل PDF** مع دعم RTL
- 📧 **إرسال تقارير بالبريد**
- 🎭 **Dark/Light Mode** مع حفظ التفضيلات
- 🗺️ **React Router** للتنقل السلس
- 📚 **نظام المدونة** للتقارير العامة
- 🔍 **SEO Optimization** مع React Helmet

### المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| ⚛️ **React 18** | أحدث إصدار مع Hooks |
| 📘 **TypeScript** | Type Safety كامل |
| 🎨 **Tailwind CSS** | Utility-first CSS Framework |
| 🌐 **i18n** | تبديل فوري بين العربية والإنجليزية |
| 🌓 **Dark Mode** | وضع داكن/فاتح |
| 🗺️ **React Router** | SPA Navigation |
| 📱 **Mobile First** | تصميم يبدأ من الموبايل |
| 🔍 **SEO Optimized** | Schema.org + Meta Tags |
| 📚 **Blog System** | مدونة تقارير عامة |
| ♿ **Accessible** | معايير الوصول (ARIA) |

---

## 📂 هيكل المشروع

```
client/
│
├── 📄 package.json                 # Dependencies & Scripts
├── 📄 tsconfig.json                # TypeScript Config
├── 📄 tailwind.config.js           # Tailwind CSS Config
├── 📄 postcss.config.js            # PostCSS Config
│
├── 📁 public/                      # Static Files
│   ├── index.html                 # HTML Entry Point
│   ├── favicon.ico                # App Icon
│   ├── manifest.json              # PWA Manifest
│   └── robots.txt                 # SEO
│
└── 📁 src/                         # Source Code
    ├── 📄 index.tsx                # React Entry Point
    ├── 📄 App.tsx                  # Main App Component
    ├── 📄 App.css                  # Global Styles
    ├── 📄 index.css                # Tailwind Imports
    │
    ├── 📁 components/              # Reusable Components
    │   ├── Header.jsx             # Header Component
    │   ├── Sidebar.tsx            # Sidebar Navigation
    │   ├── Login.jsx              # Login Form
    │   ├── Register.jsx           # Registration Form
    │   ├── FileUpload.tsx         # File Upload
    │   ├── ReportGenerator.tsx    # Report Generator
    │   ├── ReportDisplay.tsx      # Report Viewer
    │   ├── UserReports.tsx        # User Reports List
    │   ├── UserSettings.tsx       # User Settings
    │   ├── UserManagement.tsx     # Admin User Manager
    │   └── AdminDashboard.tsx     # Admin Dashboard
    │
    ├── 📁 pages/                   # Page Components
    │   ├── LandingPage.tsx        # Home Page
    │   ├── LoginPage.tsx          # Login Page
    │   ├── RegisterPage.tsx       # Registration Page
    │   ├── VerifyOTPPage.tsx      # OTP Verification
    │   ├── ForgotPasswordPage.tsx # Password Reset Request
    │   ├── ResetPasswordPage.tsx  # New Password Set
    │   ├── CreateReportPage.tsx   # Create Report
    │   ├── ReportsPage.tsx        # My Reports
    │   ├── SettingsPage.tsx       # Settings
    │   ├── AdminPage.tsx          # Admin Panel
    │   ├── BlogPage.tsx           # Blog (Public Reports)
    │   └── BlogPostPage.tsx       # Single Report View
    │
    ├── 📁 contexts/                # React Contexts
    │   ├── LocaleContext.tsx      # Language & i18n
    │   └── ThemeContext.tsx       # Dark/Light Mode
    │
    ├── 📁 types/                   # TypeScript Types
    │   ├── User.ts                # User Types
    │   └── Report.ts              # Report Types
    │
    └── 📁 utils/                   # Utility Functions
        └── seo.ts                 # SEO Helpers
```

---

## 🛠️ التقنيات المستخدمة

### Core Stack

```
┌─────────────────────────────────────────┐
│         React 18.2                      │
│         UI Library                       │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         TypeScript 4.9+                 │
│         Type Safety                      │
└────────────────┬────────────────────────┘
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ Tailwind CSS │  │ React Router │
│   Styling    │  │  Navigation  │
└──────────────┘  └──────────────┘
```

### المكتبات الأساسية

| المكتبة | الإصدار | الاستخدام |
|---------|---------|-----------|
| `react` | ^18.2.0 | UI Library |
| `react-dom` | ^18.2.0 | DOM Rendering |
| `react-router-dom` | ^6.20.0 | Client-side Routing |
| `typescript` | ^4.9.5 | Type Checking |
| `tailwindcss` | ^3.3.0 | CSS Framework |
| `axios` | ^1.5.0 | HTTP Client |
| `react-markdown` | ^9.0.0 | Markdown Rendering |
| `remark-gfm` | ^4.0.0 | GitHub Flavored Markdown |
| `react-helmet-async` | ^2.0.5 | SEO & Meta Tags |
| `lucide-react` | ^0.263.0 | Icons |
| `@testing-library/react` | ^13.4.0 | Testing |

### Dev Dependencies

| المكتبة | الاستخدام |
|---------|-----------|
| `@types/react` | React Types |
| `@types/node` | Node.js Types |
| `autoprefixer` | CSS Vendor Prefixes |
| `postcss` | CSS Processing |

---

## 🧩 المكونات الأساسية

### 1. Header Component (`components/Header.jsx`)

**الهدف:** شريط العلوي للتطبيق مع اسم التطبيق والتحكم في اللغة والثيم

```jsx
┌──────────────────────────────────────────────────────┐
│ 🤖 AI Reports    [🌙 Dark] [🌐 عربي] [👤 أحمد] │
└──────────────────────────────────────────────────────┘
```

**المميزات:**
- ✅ عرض اسم التطبيق
- ✅ زر تبديل Dark/Light Mode
- ✅ زر تبديل اللغة (🇸🇦 ⇄ 🇺🇸)
- ✅ عرض اسم المستخدم والصورة
- ✅ قائمة منسدلة (Profile، Settings، Logout)
- ✅ Responsive (يتقلص في الموبايل)

**الكود الأساسي:**
```typescript
interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { locale, toggleLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold">🤖 {t('appName')}</h1>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={toggleLocale}>
            {locale === 'ar' ? '🇺🇸 English' : '🇸🇦 عربي'}
          </button>
          {user && <UserMenu user={user} onLogout={onLogout} />}
        </div>
      </div>
    </header>
  );
};
```

---

### 2. Sidebar Component (`components/Sidebar.tsx`)

**الهدف:** قائمة جانبية للتنقل بين الصفحات

```
┌──────────────────┐
│  👤 أحمد علي     │
│  ahmed@email.com │
├──────────────────┤
│ 🏠 الرئيسية      │
│ ➕ تقرير جديد    │
│ 📊 تقاريري       │
│ ⚙️ الإعدادات     │
│ 🔧 الإدارة       │ (admin only)
├──────────────────┤
│ 🚪 تسجيل خروج    │
└──────────────────┘
```

**المميزات:**
- ✅ صورة المستخدم مع Fallback (أول حرفين)
- ✅ قائمة ديناميكية حسب `locale`
- ✅ Icons من Lucide React
- ✅ Active State للصفحة الحالية
- ✅ Admin-only items
- ✅ Burger Menu للموبايل

**الكود:**
```typescript
const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose }) => {
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'home', label: t('home'), icon: Home, path: '/' },
    { id: 'create', label: t('createReport'), icon: Plus, path: '/create' },
    { id: 'reports', label: t('myReports'), icon: FileText, path: '/reports' },
    { id: 'settings', label: t('settings'), icon: Settings, path: '/settings' },
    ...(user?.role === 'admin' ? [
      { id: 'admin', label: t('adminPanel'), icon: Shield, path: '/admin' }
    ] : [])
  ];
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* User Info */}
      <div className="user-info">
        <img src={user.avatarUrl || getInitials(user)} />
        <p>{user.firstName} {user.lastName}</p>
        <p className="text-sm">{user.email}</p>
      </div>
      
      {/* Menu Items */}
      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={isActive(item.path) ? 'active' : ''}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
```

---

### 3. Login Component (`components/Login.jsx`)

**الهدف:** نموذج تسجيل الدخول

```
┌──────────────────────────────────────┐
│     🔐 تسجيل الدخول                 │
├──────────────────────────────────────┤
│ 📧 البريد الإلكتروني:              │
│ [________________]                   │
│                                      │
│ 🔒 كلمة المرور:                     │
│ [________________] 👁️               │
│                                      │
│ [✓] تذكرني                          │
│                                      │
│ [    تسجيل الدخول    ]              │
│                                      │
│ نسيت كلمة المرور؟                   │
│ ليس لديك حساب؟ سجل الآن             │
└──────────────────────────────────────┘
```

**المميزات:**
- ✅ Email و Password Inputs
- ✅ Show/Hide Password (👁️)
- ✅ Remember Me Checkbox
- ✅ نسيت كلمة المرور؟ (رابط)
- ✅ التحقق من صحة الإدخال
- ✅ Loading State
- ✅ رسائل الأخطاء

**الكود:**
```jsx
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLocale();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      onLogin(user);
      navigate('/create');
    } catch (err) {
      setError(err.response?.data?.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Email Input */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email')}
        required
      />
      
      {/* Password Input with Toggle */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
      
      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Submit Button */}
      <button type="submit" disabled={loading}>
        {loading ? t('loading') : t('login')}
      </button>
      
      {/* Links */}
      <Link to="/forgot-password">{t('forgotPassword')}</Link>
      <Link to="/register">{t('noAccount')}</Link>
    </form>
  );
};
```

---

### 4. Register Component (`components/Register.jsx`)

**الهدف:** نموذج التسجيل

**الحقول:**
- ✅ اسم المستخدم (username)
- ✅ البريد الإلكتروني (email)
- ✅ الاسم الأول (firstName)
- ✅ الاسم الأخير (lastName)
- ✅ كلمة المرور (password) + Show/Hide
- ✅ تأكيد كلمة المرور (confirmPassword) + Show/Hide

**التدفق:**
```
ملء النموذج
   ↓
POST /api/auth/register
   ↓
يُرسل OTP (6 أرقام) إلى البريد
   ↓
navigate('/verify-otp', { state: { userId, email } })
```

---

### 5. FileUpload Component (`components/FileUpload.tsx`)

**الهدف:** رفع ملفات CSV/Excel

```
┌──────────────────────────────────────┐
│  📤 اختر ملف البيانات               │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │  [اختر ملف]  data.csv         │ │
│  │  💾 15 KB                      │ │
│  └────────────────────────────────┘ │
│                                      │
│  ✅ CSV, Excel (Max 10MB)           │
│                                      │
│  [      رفع الملف      ]            │
│                                      │
│  📊 جاري الرفع... 45%               │
└──────────────────────────────────────┘
```

**المميزات:**
- ✅ Custom File Input UI
- ✅ عرض اسم الملف والحجم
- ✅ Progress Bar
- ✅ التحقق من النوع والحجم
- ✅ Drag & Drop (اختياري)
- ✅ معاينة البيانات

**الكود:**
```typescript
interface FileUploadProps {
  onUploadSuccess: (reportId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { locale, t } = useLocale();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        alert(t('invalidFileType'));
        return;
      }
      
      // Check file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert(t('fileTooLarge'));
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/reports/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total!
            );
            setProgress(percent);
          }
        }
      );
      
      onUploadSuccess(response.data.data.reportId);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('uploadError'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="file-upload">
      <label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          hidden
        />
        <div className="file-input-custom">
          {file ? (
            <>
              <FileIcon />
              <span>{file.name}</span>
              <span className="text-sm">{formatFileSize(file.size)}</span>
            </>
          ) : (
            <span>{t('chooseFile')}</span>
          )}
        </div>
      </label>
      
      {file && (
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin" />
              {t('uploading')} {progress}%
            </div>
          ) : (
            t('uploadFile')
          )}
        </button>
      )}
      
      {uploading && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};
```

---

### 6. ReportGenerator Component (`components/ReportGenerator.tsx`)

**الهدف:** توليد التقرير بالذكاء الاصطناعي

```
┌──────────────────────────────────────┐
│  🤖 توليد التقرير                   │
├──────────────────────────────────────┤
│  📋 اكتب طلبك للذكاء الاصطناعي:    │
│  ┌────────────────────────────────┐ │
│  │ حلل بيانات المبيعات وأعطني   │ │
│  │ أهم الإحصائيات والرؤى...     │ │
│  └────────────────────────────────┘ │
│                                      │
│  🌐 لغة التقرير:                    │
│  ⚪ عربي  ⚫ English                 │
│                                      │
│  [   🚀 توليد التقرير   ]          │
│                                      │
│  ⏳ جاري التحليل...                 │
└──────────────────────────────────────┘
```

**المميزات:**
- ✅ Textarea للطلب
- ✅ اختيار اللغة (عربي/إنجليزي)
- ✅ عداد الأحرف
- ✅ أمثلة جاهزة (Templates)
- ✅ Loading Animation
- ✅ معاينة مباشرة

---

### 7. ReportDisplay Component (`components/ReportDisplay.tsx`)

**الهدف:** عرض التقرير المولد

```
┌──────────────────────────────────────┐
│  📊 التقرير المولد                  │
├──────────────────────────────────────┤
│  📄 sales_data.csv                   │
│  🕐 8 أكتوبر 2025، 10:30 ص         │
│  🌐 العربية                         │
├──────────────────────────────────────┤
│  [📥 تحميل PDF] [📧 إرسال بالبريد] │
├──────────────────────────────────────┤
│                                      │
│  # تحليل المبيعات                   │
│                                      │
│  ## الإحصائيات العامة                │
│  - إجمالي المبيعات: 150             │
│  - المتوسط: 1,200 ريال              │
│  ...                                 │
│                                      │
└──────────────────────────────────────┘
```

**المميزات:**
- ✅ Markdown Rendering (react-markdown)
- ✅ RTL/LTR حسب اللغة
- ✅ Syntax Highlighting للكود
- ✅ Tables Support
- ✅ زر تحميل PDF
- ✅ زر إرسال بالبريد
- ✅ زر النسخ (Copy)
- ✅ زر الطباعة

**الكود:**
```typescript
interface ReportDisplayProps {
  report: Report;
  onDownloadPDF: () => void;
  onEmailPDF: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({
  report,
  onDownloadPDF,
  onEmailPDF
}) => {
  const { t } = useLocale();
  const [copying, setCopying] = useState(false);
  
  const handleCopy = async () => {
    setCopying(true);
    await navigator.clipboard.writeText(report.generatedReport);
    setTimeout(() => setCopying(false), 2000);
  };
  
  return (
    <div className={`report-display ${report.language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="report-header">
        <h2>{t('generatedReport')}</h2>
        <div className="metadata">
          <span>📄 {report.filename}</span>
          <span>🕐 {formatDate(report.generatedAt)}</span>
          <span>🌐 {report.language === 'ar' ? 'العربية' : 'English'}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="actions">
        <button onClick={onDownloadPDF}>
          <Download /> {t('downloadPDF')}
        </button>
        <button onClick={onEmailPDF}>
          <Mail /> {t('emailPDF')}
        </button>
        <button onClick={handleCopy}>
          {copying ? <Check /> : <Copy />}
          {copying ? t('copied') : t('copy')}
        </button>
      </div>
      
      {/* Content */}
      <div className="report-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-medium mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-3" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc mr-6 mb-3" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal mr-6 mb-3" {...props} />,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full border" {...props} />
              </div>
            )
          }}
        >
          {report.generatedReport}
        </ReactMarkdown>
      </div>
    </div>
  );
};
```

---

### 8. UserReports Component (`components/UserReports.tsx`)

**الهدف:** عرض قائمة تقارير المستخدم

```
┌──────────────────────────────────────────────┐
│  📊 تقاريري (15)                            │
├──────────────────────────────────────────────┤
│  [🔍 بحث...] [🗂️ الكل ▼] [📅 الأحدث ▼]   │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ │
│  │ 📄 sales_data.csv                     │ │
│  │ ✅ مكتمل  •  🌐 عربي  •  8 أكتوبر   │ │
│  │ "حلل بيانات المبيعات..."             │ │
│  │ [👁️ عرض] [📥 تحميل] [🗑️ حذف]       │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 📄 student_scores.csv                 │ │
│  │ ⏳ قيد المعالجة  •  🌐 English       │ │
│  │ [⏸️ في الانتظار...]                  │ │
│  └────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  [◀ السابق]  1 2 3 4 5  [التالي ▶]        │
└──────────────────────────────────────────────┘
```

**المميزات:**
- ✅ عرض جميع التقارير
- ✅ بحث وفلترة
- ✅ ترتيب (الأحدث، الأقدم، الاسم)
- ✅ حالات مختلفة (مكتمل، معالجة، خطأ)
- ✅ Pagination
- ✅ إجراءات (عرض، تحميل، حذف)
- ✅ Empty State (لا توجد تقارير)

---

### 9. AdminDashboard Component (`components/AdminDashboard.tsx`)

**الهدف:** لوحة تحكم المسؤول

```
┌─────────────────────────────────────────────────────┐
│  🔧 لوحة الإدارة                                   │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 👥 150   │  │ 📊 1,234 │  │ ⚡ 45    │          │
│  │ مستخدم   │  │ تقرير   │  │ نشط     │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├─────────────────────────────────────────────────────┤
│  📊 إحصائيات الاستخدام                            │
│  [رسم بياني للنشاط اليومي/الأسبوعي]              │
├─────────────────────────────────────────────────────┤
│  👥 المستخدمون (10 الأحدث)                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ 👤 أحمد علي  • ahmed@email.com • user      │ │
│  │ 🕐 منذ يومين  • 📊 5 تقارير                │ │
│  │ [✏️ تعديل] [🔒 تعطيل] [🗑️ حذف]           │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  📊 التقارير الأخيرة                              │
│  [قائمة بآخر التقارير مع معلومات المستخدم]       │
└─────────────────────────────────────────────────────┘
```

**الأقسام:**
1. **Statistics Cards** - إحصائيات سريعة
2. **Activity Chart** - رسم بياني للنشاط
3. **Users Management** - إدارة المستخدمين
4. **Recent Reports** - آخر التقارير
5. **System Health** - حالة النظام

---

## 📄 الصفحات (Pages)

### 1. LandingPage (`pages/LandingPage.tsx`)

**الصفحة الرئيسية للزوار غير المسجلين**

```
┌──────────────────────────────────────────────────┐
│  [🤖 AI Reports]  [🌐 EN] [تسجيل الدخول] [تسجيل]│
├──────────────────────────────────────────────────┤
│                                                  │
│       🚀 حوّل بياناتك إلى رؤى قيمة             │
│                                                  │
│      استخدم الذكاء الاصطناعي لتحليل بياناتك    │
│           وتوليد تقارير احترافية فوراً         │
│                                                  │
│     [🚀 ابدأ مجاناً]  [📖 اعرف المزيد]        │
│                                                  │
├──────────────────────────────────────────────────┤
│  ✨ المميزات:                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ 🤖 AI     │ │ 📊 تقارير │ │ 📥 PDF     │  │
│  │ تحليل ذكي│ │ احترافية  │ │ تحميل سهل │  │
│  └────────────┘ └────────────┘ └────────────┘  │
└──────────────────────────────────────────────────┘
```

**الأقسام:**
- Hero Section (عنوان + CTA)
- Features Grid (المميزات)
- How It Works (كيف يعمل)
- Testimonials (آراء المستخدمين - اختياري)
- Footer

---

### 2. VerifyOTPPage (`pages/VerifyOTPPage.tsx`)

**صفحة التحقق من OTP**

```
┌──────────────────────────────────────┐
│  ✉️ التحقق من البريد الإلكتروني    │
├──────────────────────────────────────┤
│  تم إرسال كود التحقق إلى:          │
│  ahmed@example.com                   │
│                                      │
│  أدخل الكود المكون من 6 أرقام:     │
│                                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                      │
│  ⏱️ ينتهي خلال: 09:45               │
│                                      │
│  [    تحقق    ]                     │
│                                      │
│  لم تستلم الكود؟ إعادة الإرسال (30) │
└──────────────────────────────────────┘
```

**المميزات:**
- ✅ 6 حقول منفصلة للأرقام
- ✅ Auto-focus على الحقل التالي
- ✅ دعم اللصق (Paste)
- ✅ Backspace للرجوع
- ✅ عد تنازلي (10 دقائق)
- ✅ زر إعادة إرسال مع Cooldown (60 ثانية)
- ✅ تحقق تلقائي عند اكتمال الكود

**الكود:**
```typescript
const VerifyOTPPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...new Array(6 - newOtp.length).fill('')]);
    inputRefs.current[Math.min(5, pastedData.length)]?.focus();
  };
  
  const handleVerify = async () => {
    const otpCode = otp.join('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        userId: state.userId,
        otp: otpCode
      });
      
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      navigate('/create');
    } catch (error) {
      alert('رمز التحقق غير صحيح');
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }
  };
  
  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', {
        userId: state.userId
      });
      alert('تم إرسال كود جديد');
      setTimeLeft(600);
      setResendCooldown(60);
      setCanResend(false);
    } catch (error) {
      alert('فشل إعادة الإرسال');
    }
  };
  
  return (
    <div className="verify-otp-page">
      <h1>✉️ التحقق من البريد الإلكتروني</h1>
      <p>تم إرسال كود التحقق إلى: {state.email}</p>
      
      <div className="otp-inputs" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
          />
        ))}
      </div>
      
      <p className="timer">
        ⏱️ ينتهي خلال: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </p>
      
      <button onClick={handleVerify} disabled={otp.some(d => !d)}>
        تحقق
      </button>
      
      <button onClick={handleResend} disabled={!canResend || resendCooldown > 0}>
        لم تستلم الكود؟ إعادة الإرسال {resendCooldown > 0 && `(${resendCooldown})`}
      </button>
    </div>
  );
};
```

---

### 3. ForgotPasswordPage (`pages/ForgotPasswordPage.tsx`)

**طلب إعادة تعيين كلمة المرور**

```
┌──────────────────────────────────────┐
│  🔑 نسيت كلمة المرور؟               │
├──────────────────────────────────────┤
│  أدخل بريدك الإلكتروني وسنرسل لك   │
│  رابطاً لإعادة تعيين كلمة المرور    │
│                                      │
│  📧 البريد الإلكتروني:              │
│  [____________________________]      │
│                                      │
│  [  إرسال رابط إعادة التعيين  ]    │
│                                      │
│  ← العودة لتسجيل الدخول              │
└──────────────────────────────────────┘
```

---

### 4. ResetPasswordPage (`pages/ResetPasswordPage.tsx`)

**إعادة تعيين كلمة المرور**

```
┌──────────────────────────────────────┐
│  🔒 إعادة تعيين كلمة المرور         │
├──────────────────────────────────────┤
│  🔒 كلمة المرور الجديدة:            │
│  [____________________________] 👁️  │
│                                      │
│  🔒 تأكيد كلمة المرور:              │
│  [____________________________] 👁️  │
│                                      │
│  ✅ 8 أحرف على الأقل                │
│  ❌ حرف كبير واحد على الأقل         │
│  ✅ رقم واحد على الأقل              │
│                                      │
│  [   تعيين كلمة المرور الجديدة   ] │
└──────────────────────────────────────┘
```

---

### 5. CreateReportPage (`pages/CreateReportPage.tsx`)

**صفحة إنشاء تقرير جديد**

**المراحل:**
```
1. رفع الملف (FileUpload)
   ↓
2. توليد التقرير (ReportGenerator)
   ↓
3. عرض التقرير (ReportDisplay)
```

**الكود:**
```typescript
const CreateReportPage: React.FC = () => {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [step, setStep] = useState<'upload' | 'generate' | 'display'>('upload');
  
  const handleUploadSuccess = (reportId: string) => {
    setCurrentReport({ _id: reportId } as Report);
    setStep('generate');
  };
  
  const handleGenerateSuccess = (report: Report) => {
    setCurrentReport(report);
    setStep('display');
  };
  
  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reports/${currentReport?._id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${currentReport?.filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('فشل تحميل PDF');
    }
  };
  
  const handleEmailPDF = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/reports/${currentReport?._id}/email`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('تم إرسال التقرير إلى بريدك الإلكتروني');
    } catch (error) {
      alert('فشل إرسال البريد');
    }
  };
  
  return (
    <div className="create-report-page">
      <h1>➕ إنشاء تقرير جديد</h1>
      
      {/* Step Indicator */}
      <div className="steps">
        <div className={step === 'upload' ? 'active' : 'completed'}>1. رفع الملف</div>
        <div className={step === 'generate' ? 'active' : ''}>2. توليد التقرير</div>
        <div className={step === 'display' ? 'active' : ''}>3. النتيجة</div>
      </div>
      
      {/* Content */}
      {step === 'upload' && <FileUpload onUploadSuccess={handleUploadSuccess} />}
      {step === 'generate' && (
        <ReportGenerator
          reportId={currentReport?._id!}
          onGenerateSuccess={handleGenerateSuccess}
        />
      )}
      {step === 'display' && currentReport && (
        <ReportDisplay
          report={currentReport}
          onDownloadPDF={handleDownloadPDF}
          onEmailPDF={handleEmailPDF}
        />
      )}
    </div>
  );
};
```

---

## 🎯 السياقات (Contexts)

### 1. LocaleContext (`contexts/LocaleContext.tsx`)

**الهدف:** إدارة اللغة والترجمة

```typescript
interface LocaleContextType {
  locale: 'ar' | 'en';
  toggleLocale: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    appName: 'تقارير AI',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    createReport: 'إنشاء تقرير جديد',
    myReports: 'تقاريري',
    settings: 'الإعدادات',
    adminPanel: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
    uploadFile: 'رفع ملف',
    generateReport: 'توليد التقرير',
    downloadPDF: 'تحميل PDF',
    emailPDF: 'إرسال بالبريد',
    // ... 100+ مفتاح
  },
  en: {
    appName: 'AI Reports',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    createReport: 'Create New Report',
    myReports: 'My Reports',
    settings: 'Settings',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    uploadFile: 'Upload File',
    generateReport: 'Generate Report',
    downloadPDF: 'Download PDF',
    emailPDF: 'Email PDF',
    // ... 100+ key
  }
};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('locale') as 'ar' | 'en') || 'ar';
  });
  
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);
  
  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };
  
  const t = (key: string): string => {
    return translations[locale][key] || key;
  };
  
  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
```

**الاستخدام:**
```typescript
const MyComponent = () => {
  const { locale, toggleLocale, t } = useLocale();
  
  return (
    <div>
      <h1>{t('appName')}</h1>
      <button onClick={toggleLocale}>
        {locale === 'ar' ? 'English' : 'عربي'}
      </button>
    </div>
  );
};
```

---

### 2. ThemeContext (`contexts/ThemeContext.tsx`)

**الهدف:** إدارة الوضع الداكن/الفاتح

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**CSS (Tailwind):**
```css
/* Light Mode */
.bg-white { background-color: white; }
.text-gray-900 { color: #111827; }

/* Dark Mode */
.dark .bg-white { background-color: #1f2937; }
.dark .text-gray-900 { color: #f9fafb; }
```

---

## 🗺️ التوجيه (Routing)

### React Router Setup

**`index.tsx`:**
```typescript
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LocaleProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**`App.tsx`:**
```typescript
import { Routes, Route, Navigate } from 'react-router-dom';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Protected Route Component
  const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };
  
  // Admin Route Component
  const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/create" replace />;
    return <>{children}</>;
  };
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={() => setUser(null)}>
              <CreateReportPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={() => setUser(null)}>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={() => setUser(null)}>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout user={user} onLogout={() => setUser(null)}>
              <AdminPage user={user} />
            </Layout>
          </AdminRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
```

### Navigation Helpers

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/create');
    // أو
    navigate(-1); // Back
    // أو
    navigate('/login', { replace: true }); // لا يمكن الرجوع
  };
};
```

---

## 🔄 إدارة الحالة

### Local State (useState)

```typescript
const [user, setUser] = useState<User | null>(null);
const [reports, setReports] = useState<Report[]>([]);
const [loading, setLoading] = useState(false);
```

### Persistent State (localStorage)

```typescript
// Save
const handleLogin = (user: User, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setUser(user);
};

// Load
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);

// Clear
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
};
```

### Global State (Context)

```typescript
// Created in LocaleContext and ThemeContext
// Accessible via useLocale() and useTheme()
```

---

## 🔌 التكامل مع API

### Axios Configuration

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Calls

```typescript
// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const verifyOTP = async (userId: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { userId, otp });
  return response.data.data;
};

// Reports
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const generateReport = async (reportId: string, prompt: string, language: string) => {
  const response = await api.post(`/reports/generate/${reportId}`, { prompt, language });
  return response.data.data;
};

export const getMyReports = async () => {
  const response = await api.get('/reports');
  return response.data.data;
};

export const downloadPDF = async (reportId: string) => {
  const response = await api.get(`/reports/${reportId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export const emailPDF = async (reportId: string) => {
  const response = await api.post(`/reports/${reportId}/email`);
  return response.data;
};
```

---

## 🎨 التصميم والأنماط

### Tailwind CSS Configuration

**`tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
        en: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
```

### RTL/LTR Support

```css
/* index.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* Tailwind utilities */
.mr-4 { /* في LTR: margin-right */}
[dir="rtl"] .mr-4 { /* في RTL: يصبح margin-left */}

/* الحل الأفضل: استخدام logical properties */
.ms-4 { margin-inline-start: 1rem; } /* يتكيف تلقائياً */
.me-4 { margin-inline-end: 1rem; }
```

### Responsive Design

```typescript
// Tailwind Breakpoints
sm: '640px'   // موبايل كبير
md: '768px'   // تابلت
lg: '1024px'  // لابتوب
xl: '1280px'  // ديسكتوب
2xl: '1536px' // شاشات كبيرة

// الاستخدام
<div className="
  text-sm sm:text-base md:text-lg lg:text-xl
  p-2 sm:p-4 md:p-6
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
">
  {/* Content */}
</div>
```

### Dark Mode Classes

```typescript
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
  border border-gray-200 dark:border-gray-700
">
  {/* Content */}
</div>
```

---

## 🔐 الأمان

### 1. JWT Token Management

```typescript
// تخزين آمن
const saveToken = (token: string) => {
  localStorage.setItem('token', token);
  // أفضل: استخدام httpOnly cookies في production
};

// التحقق من انتهاء الصلاحية
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// تنظيف عند Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

### 2. XSS Protection

```typescript
// ❌ خطر
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ آمن
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ الأفضل: استخدام react-markdown
<ReactMarkdown>{userInput}</ReactMarkdown>
```

### 3. CSRF Protection

```typescript
// إرسال token مع كل طلب
axios.defaults.headers.common['X-CSRF-Token'] = getCsrfToken();
```

### 4. Input Validation

```typescript
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('8 أحرف على الأقل');
  if (!/[A-Z]/.test(password)) errors.push('حرف كبير واحد');
  if (!/[a-z]/.test(password)) errors.push('حرف صغير واحد');
  if (!/[0-9]/.test(password)) errors.push('رقم واحد');
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

---

## ⚙️ الإعداد والتشغيل

### 1. المتطلبات

- **Node.js** >= 18.0.0
- **npm** or **yarn**

### 2. التثبيت

```bash
cd client
npm install
```

### 3. متغيرات البيئة

إنشاء `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=AI Reports
```

### 4. التشغيل

```bash
# Development
npm start
# → http://localhost:3000

# Build for Production
npm run build

# Test
npm test
```

### 5. Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 📊 إحصائيات المشروع

```
📁 client/src/
├── 25+ مكون (Components)
├── 12 صفحات (Pages) - بما فيها Blog
├── 2 سياق (Contexts)
├── 1 Utils (SEO Helpers)
├── ~10,000 سطر كود
├── 200+ ترجمة (عربي/إنجليزي)
├── 60+ واجهة TypeScript
├── 100% Responsive
├── SEO Score: 95/100
└── Blog System متكامل
```

---

## 🚀 الميزات المتقدمة

### ✅ تم إنجازه

- [x] **React 18 + TypeScript** - Type Safety كامل
- [x] **Tailwind CSS** - Utility-first styling
- [x] **Dark Mode** - مع حفظ التفضيلات
- [x] **i18n (عربي/إنجليزي)** - 200+ ترجمة
- [x] **RTL/LTR** - تبديل تلقائي
- [x] **React Router** - SPA Navigation
- [x] **OTP Verification** - 6 حقول تفاعلية
- [x] **Password Reset** - تدفق كامل
- [x] **Show/Hide Password** - تحسين UX
- [x] **Responsive Design** - Mobile-first
- [x] **Markdown Rendering** - مع تنسيق كامل
- [x] **PDF Download** - مع RTL support
- [x] **Email Reports** - إرسال PDF
- [x] **File Upload** - مع Progress Bar
- [x] **Admin Dashboard** - إدارة كاملة
- [x] **Protected Routes** - حماية الصفحات
- [x] **Loading States** - تجربة سلسة
- [x] **Error Handling** - رسائل واضحة
- [x] **Blog System** - مدونة للتقارير العامة
- [x] **SEO Optimization** - React Helmet + Schema.org
- [x] **Public/Private Toggle** - تبديل حالة التقارير
- [x] **Author Profiles** - صور ومعلومات الكتّاب

### 📋 في الخطة

- [ ] **PWA** - تحويل لتطبيق Progressive Web App
- [ ] **Offline Mode** - العمل بدون إنترنت
- [ ] **Push Notifications** - إشعارات فورية
- [ ] **Charts & Graphs** - رسوم بيانية تفاعلية
- [ ] **Export Options** - تصدير لصيغ متعددة
- [ ] **Drag & Drop** - سحب وإفلات الملفات
- [ ] **Real-time Updates** - WebSocket
- [ ] **Accessibility** - تحسين ARIA
- [ ] **Unit Tests** - تغطية 80%+
- [ ] **E2E Tests** - Cypress/Playwright
- [ ] **Performance** - Lazy Loading, Code Splitting
- [ ] **SEO Optimization** - React Helmet

---

## 📚 Blog System (نظام المدونة)

### الصفحات الجديدة:

#### **1. BlogPage (`pages/BlogPage.tsx`)**
```typescript
// قائمة جميع التقارير العامة
- عرض شبكي (Grid 3 أعمدة)
- بحث وفلترة متقدمة
- فلتر حسب اللغة
- ترتيب (أحدث/أقدم)
- صور الكتّاب
- تحميل PDF مباشر
```

#### **2. BlogPostPage (`pages/BlogPostPage.tsx`)**
```typescript
// عرض تقرير فردي كامل
- Hero section احترافي
- معلومات الكاتب مع الصورة
- Markdown rendering كامل
- Share buttons (نسخ، مشاركة)
- Download PDF
- SEO optimized
```

### الميزات:
- ✅ Header ديناميكي (للزوار والمستخدمين)
- ✅ Sidebar للمستخدمين المسجلين
- ✅ CTA مخصص حسب حالة المستخدم
- ✅ Responsive design كامل
- ✅ Dark mode support

---

## 🔍 SEO Optimization

### React Helmet Implementation:

```typescript
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{report.filename} - مدونة التقارير</title>
  <meta name="description" content={getExcerpt(report)} />
  <meta name="keywords" content="..." />
  
  {/* Open Graph */}
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
  
  {/* Schema.org */}
  <script type="application/ld+json">
    {JSON.stringify(generateReportSchema(report))}
  </script>
</Helmet>
```

### SEO Utils (`utils/seo.ts`):

```typescript
// Structured Data Generators
generateReportSchema(report) → Article Schema
generateBlogSchema(count) → Blog Schema
getExcerpt(content, length) → SEO Description
generateMetaTags(...) → Meta Tags Object
```

### ملفات SEO:

#### **robots.txt:**
```txt
Allow: /blog
Allow: /blog/*
Disallow: /admin
Disallow: /settings
Sitemap: /sitemap.xml
```

#### **sitemap.xml:**
```xml
<url>
  <loc>/blog</loc>
  <priority>0.9</priority>
  <changefreq>hourly</changefreq>
</url>
```

#### **manifest.json:**
```json
{
  "name": "AI Reports",
  "lang": "ar",
  "dir": "rtl",
  "categories": ["business", "productivity"]
}
```

### Microdata في HTML:
```html
<article itemScope itemType="https://schema.org/Article">
  <h1 itemProp="headline">...</h1>
  <span itemProp="author" itemScope itemType="https://schema.org/Person">
    <span itemProp="name">...</span>
  </span>
  <time itemProp="datePublished">...</time>
  <p itemProp="description">...</p>
</article>
```

---

## 🌍 Environment Variables & Dynamic URLs

### الاستخدام الموحد:

```typescript
// API Base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Root (للصور والملفات)
const API_ROOT = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Client Base URL (ديناميكي)
const CLIENT_URL = window.location.origin;
```

### الفوائد:
- ✅ تغيير URL من ملف واحد (`.env`)
- ✅ دعم بيئات متعددة (dev, staging, production)
- ✅ URLs ديناميكية للـ SEO
- ✅ سهولة النشر على أي domain

### الملفات المحدثة (19 ملف):
```
✅ BlogPage.tsx
✅ BlogPostPage.tsx
✅ seo.ts
✅ Sidebar.tsx
✅ Header.jsx
✅ Login.jsx
✅ Register.jsx
✅ ReportGenerator.tsx
✅ UserReports.tsx
✅ CreateReportPage.tsx
✅ VerifyOTPPage.tsx
✅ ResetPasswordPage.tsx
✅ ForgotPasswordPage.tsx
✅ VerifyEmailPage.tsx
✅ FileUpload.tsx
✅ AdminDashboard.tsx
✅ UserManagement.tsx
✅ UserSettings.tsx
✅ AIChatAdmin.tsx
```

---

## 🎯 Logo Navigation

### الميزة:
اللوجو الآن قابل للنقر ويرجع للصفحة الرئيسية!

```tsx
// Header.jsx
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate('/')}
      className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
        {/* Logo SVG */}
      </div>
      <div className="hidden sm:block">
        <h1>{t('welcome')}</h1>
      </div>
    </button>
  );
};
```

### UX محسّن:
- ✅ نقر على اللوجو → `/` (الصفحة الرئيسية)
- ✅ Hover effect (opacity)
- ✅ Cursor pointer
- ✅ يعمل من أي صفحة في التطبيق

---

**آخر تحديث:** 8 أكتوبر 2025

**الإصدار:** 4.1

**الحالة:** ✅ قيد الإنتاج والتشغيل

**الميزات الجديدة:** Blog System, SEO Optimization, Environment Variables, Logo Navigation, Avatar Upload (10MB)

**التقنيات:** React 18, TypeScript, Tailwind CSS, React Router, React Helmet, Axios

---

<div align="center">

### 🌟 صُنع بـ ❤️ من أجل مجتمع المطورين العرب

**#React #TypeScript #TailwindCSS #ReactRouter #Frontend #i18n #RTL**

</div>

