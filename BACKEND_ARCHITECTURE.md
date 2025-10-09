# 🏗️ معمارية Backend - نظام التقارير الذكية

> **نظام متكامل لتحليل البيانات وتوليد التقارير باستخدام الذكاء الاصطناعي**

---

## 📑 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [هيكل المشروع](#-هيكل-المشروع)
3. [الطبقات الأساسية](#-الطبقات-الأساسية)
4. [نماذج قاعدة البيانات](#-نماذج-قاعدة-البيانات)
5. [API Endpoints](#-api-endpoints)
6. [المتحكمات (Controllers)](#-المتحكمات-controllers)
7. [الخدمات (Services)](#-الخدمات-services)
8. [الوسيطات (Middleware)](#-الوسيطات-middleware)
9. [الدوال المساعدة (Utils)](#-الدوال-المساعدة-utils)
10. [تدفق البيانات](#-تدفق-البيانات)
11. [الأمان](#-الأمان)
12. [التقنيات المستخدمة](#-التقنيات-المستخدمة)
13. [الإعداد والتشغيل](#-الإعداد-والتشغيل)

---

## 🌟 نظرة عامة

### ما هو المشروع؟

نظام ويب متكامل يسمح للمستخدمين بـ:
- 📤 رفع ملفات البيانات (CSV, Excel)
- 🤖 توليد تقارير تحليلية ذكية بالذكاء الاصطناعي
- 🌐 اختيار لغة التقرير (عربي أو إنجليزي)
- 📊 عرض التقارير بتنسيق احترافي
- 📄 تحميل التقارير كملفات PDF (RTL للعربية، LTR للإنجليزية)
- 📧 إرسال التقارير بالبريد الإلكتروني مع PDF مرفق
- 🔐 التحقق من البريد بنظام OTP (6 أرقام)
- 🔑 إعادة تعيين كلمة المرور عبر البريد
- 👥 إدارة المستخدمين والصلاحيات
- 🛡️ حماية API مع Rate Limiting

### المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🌐 **متعدد اللغات** | تقارير بالعربية أو الإنجليزية حسب الاختيار |
| 🔐 **آمن** | JWT + تشفير كلمات المرور + OTP Email Verification |
| 🚀 **سريع** | معالجة فورية للملفات |
| 🤖 **ذكي** | تكامل مع Groq Llama 3.3 70B & Hugging Face |
| 📧 **Email Integration** | Gmail SMTP مع إشعارات وإرسال تقارير |
| 🛡️ **Rate Limiting** | حماية شاملة ضد الاستخدام المفرط |
| 📱 **مرن** | REST API قابل للتوسع |
| 🎨 **React Router** | URL routing مع navigation محسّن |

---

## 📂 هيكل المشروع

```
server/
│
├── 📄 index.js                      # نقطة الدخول الرئيسية
├── 🔧 config.env                    # متغيرات البيئة
│
├── 📁 models/                       # نماذج MongoDB (Mongoose)
│   ├── User.js                     # بيانات المستخدمين
│   └── Report.js                   # بيانات التقارير
│
├── 📁 controllers/                  # منطق معالجة الطلبات
│   ├── authController.js           # المصادقة والمستخدمين
│   ├── reportController.js         # التقارير
│   └── aiController.js             # الذكاء الاصطناعي
│
├── 📁 routes/                       # مسارات API
│   ├── auth.js                     # /api/auth/*
│   ├── reports.js                  # /api/reports/*
│   └── ai.js                       # /api/ai/*
│
├── 📁 middleware/                   # وسيطات التحقق
│   ├── auth.js                     # JWT Authentication
│   └── rateLimiter.js              # Rate Limiting (7 أنواع)
│
├── 📁 services/                     # منطق العمليات المعقدة
│   ├── reportService.js            # معالجة الملفات + AI + PDF
│   └── emailService.js             # Gmail SMTP + OTP + Notifications
│
├── 📁 utils/                        # دوال مساعدة قابلة لإعادة الاستخدام
│   ├── responseHelper.js           # ردود API موحدة
│   ├── userHelper.js               # عمليات المستخدمين
│   └── reportHelper.js             # عمليات التقارير
│
└── 📁 uploads/                      # الملفات المرفوعة
    ├── avatars/                    # الصور الشخصية
    └── data files/                 # ملفات CSV/Excel
```

---

## 🧱 الطبقات الأساسية

### معمارية MVC محسّنة

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                        │
│                   HTTP Requests                          │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                     ROUTES LAYER                         │
│  - تعريف المسارات (Endpoints)                           │
│  - ربط المسارات بالـ Controllers                        │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                        │
│  - Authentication (JWT)                                  │
│  - Authorization (User/Admin)                            │
│  - Validation                                            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                 CONTROLLERS LAYER                        │
│  - استقبال البيانات من Request                          │
│  - استدعاء Services المناسبة                           │
│  - إرجاع Response                                       │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                          │
│  - منطق العمليات المعقدة                               │
│  - معالجة الملفات                                       │
│  - التكامل مع AI APIs                                   │
│  - توليد PDF                                            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   MODELS LAYER                           │
│  - تعريف البيانات (Schema)                             │
│  - التحقق من صحة البيانات (Validation)                 │
│  - التفاعل مع MongoDB                                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                             │
│                    MongoDB                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ نماذج قاعدة البيانات

### 1. User Model (`models/User.js`)

**الهدف:** تخزين بيانات المستخدمين وإدارة المصادقة

```javascript
{
  _id: ObjectId,                    // معرف فريد
  username: String (unique),        // اسم المستخدم
  email: String (unique),           // البريد الإلكتروني
  password: String (hashed),        // كلمة المرور المشفرة
  firstName: String,                // الاسم الأول
  lastName: String,                 // الاسم الأخير
  role: String,                     // الدور: 'user' أو 'admin'
  isActive: Boolean (default: true),// حالة الحساب
  avatarUrl: String,                // رابط الصورة الشخصية
  
  // Email Verification (OTP System)
  isEmailVerified: Boolean,         // هل البريد مؤكد؟
  emailVerificationOTP: String,     // كود التحقق (6 أرقام)
  emailVerificationExpires: Date,   // صلاحية OTP (10 دقائق)
  
  // Password Reset
  resetPasswordToken: String,       // token إعادة تعيين كلمة المرور
  resetPasswordExpires: Date,       // صلاحية token (1 ساعة)
  
  // Notification Preferences
  notificationPreferences: {
    email: Boolean,                 // استقبال إشعارات البريد
    reportGenerated: Boolean,       // إشعار توليد التقرير
    accountUpdates: Boolean         // إشعارات الحساب
  },
  
  lastLogin: Date,                  // آخر تسجيل دخول
  createdAt: Date (default: now)    // تاريخ الإنشاء
}
```

#### الدوال المدمجة:

```javascript
// 1. مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 2. إخفاء كلمة المرور عند الإرجاع
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// 3. تشفير كلمة المرور تلقائياً قبل الحفظ
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

#### Indexes للأداء:

```javascript
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, isActive: 1 });
```

---

### 2. Report Model (`models/Report.js`)

**الهدف:** تخزين التقارير والبيانات المحللة

```javascript
{
  _id: ObjectId,                    // معرف فريد
  filename: String (required),      // اسم الملف الأصلي
  filePath: String,                 // مسار الملف على السيرفر
  data: [Object],                   // البيانات المستخرجة (JSON)
  prompt: String,                   // طلب المستخدم للـ AI
  generatedReport: String,          // التقرير المولد (Markdown)
  status: String,                   // pending | processing | completed | error
  userId: ObjectId (ref: 'User'),   // صاحب التقرير
  isPublic: Boolean (default: true),  // هل التقرير عام؟ (افتراضياً عام)
  language: String,                 // لغة التقرير: 'ar' أو 'en'
  createdAt: Date (default: now),   // تاريخ الرفع
  generatedAt: Date                 // تاريخ التوليد
}
```

#### حالات التقرير:

| الحالة | الوصف |
|--------|-------|
| `pending` | تم الرفع، في انتظار التحليل |
| `processing` | جاري التحليل بالـ AI |
| `completed` | تم التوليد بنجاح |
| `error` | حدث خطأ |

#### Indexes:

```javascript
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ isPublic: 1, status: 1 });
```

---

## 🌐 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

#### مسارات عامة (Public)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد (يُرسل OTP) |
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/verify-otp` | التحقق من OTP (6 أرقام) |
| POST | `/api/auth/resend-otp` | إعادة إرسال OTP |
| POST | `/api/auth/forgot-password` | طلب إعادة تعيين كلمة المرور |
| POST | `/api/auth/reset-password/:token` | إعادة تعيين كلمة المرور |

**مثال - التسجيل:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "ahmed_ali",
  "email": "ahmed@example.com",
  "password": "123456",
  "firstName": "أحمد",
  "lastName": "علي"
}

// Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### مسارات محمية (Authenticated)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/auth/profile` | عرض الملف الشخصي |
| PUT | `/api/auth/profile` | تحديث البيانات |
| PUT | `/api/auth/change-password` | تغيير كلمة المرور |
| POST | `/api/auth/profile/avatar` | رفع صورة شخصية |

#### مسارات الإدمن (Admin Only)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/auth/admin/users` | عرض جميع المستخدمين |
| POST | `/api/auth/admin/users` | إنشاء مستخدم جديد |
| PUT | `/api/auth/admin/users/:id` | تحديث مستخدم |
| DELETE | `/api/auth/admin/users/:id` | حذف مستخدم |

---

### 📊 Reports Routes (`/api/reports`)

#### مسارات التقارير

| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| POST | `/api/reports/upload` | رفع ملف CSV/Excel | اختيارية |
| POST | `/api/reports/generate/:id` | توليد تقرير بالـ AI | اختيارية |
| GET | `/api/reports/` | عرض التقارير | اختيارية |
| GET | `/api/reports/:id` | عرض تقرير واحد | اختيارية |
| GET | `/api/reports/:id/download` | تحميل PDF | اختيارية |
| POST | `/api/reports/:id/email` | إرسال PDF بالبريد | **مطلوبة** |
| GET | `/api/reports/public` | جلب التقارير العامة (للمدونة) | عامة |
| PATCH | `/api/reports/:id/toggle-public` | تبديل حالة عام/خاص | مطلوبة |
| DELETE | `/api/reports/:id` | حذف تقرير | مطلوبة |

**مثال - رفع ملف:**
```javascript
POST /api/reports/upload
Content-Type: multipart/form-data
Authorization: Bearer <token> // اختياري

file: data.csv (Max: 10MB)

// Response:
{
  "success": true,
  "data": {
    "reportId": "6123abc...",
    "filename": "sales_data.csv",
    "recordCount": 150
  }
}
```

**مثال - توليد تقرير:**
```javascript
POST /api/reports/generate/6123abc...
Content-Type: application/json
Authorization: Bearer <token> // اختياري

{
  "prompt": "حلل بيانات المبيعات واعطني أهم الإحصائيات",
  "language": "ar"  // أو "en"
}

// Response:
{
  "success": true,
  "data": {
    "_id": "6123abc...",
    "generatedReport": "# تحليل المبيعات\n\n## الإحصائيات...",
    "language": "ar",
    "status": "completed",
    "generatedAt": "2025-10-08T..."
  }
}
```

**مثال - إرسال التقرير بالإيميل:**
```javascript
POST /api/reports/:id/email
Authorization: Bearer <token> // مطلوب
Content-Type: application/json

// Response:
{
  "success": true,
  "message": "تم إرسال التقرير إلى بريدك الإلكتروني"
}

// سيستلم المستخدم إيميل فيه:
// - رسالة ترحيبية
// - معلومات التقرير
// - PDF مرفق
```

#### مسارات الإدمن

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/reports/admin/all` | عرض كل التقارير + بيانات المستخدمين |
| DELETE | `/api/reports/admin/:id` | حذف أي تقرير |

---

### 🤖 AI Routes (`/api/ai`)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|----------|
| POST | `/api/ai/chat` | محادثة مباشرة مع AI | Admin فقط |

**مثال:**
```javascript
POST /api/ai/chat
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "ما هي أفضل طريقة لتحليل بيانات العملاء؟"
}

// Response:
{
  "success": true,
  "data": {
    "response": "أفضل طريقة لتحليل بيانات العملاء...",
    "model": "llama-3.3-70b-versatile"
  }
}
```

---

## 🎮 المتحكمات (Controllers)

### 1. Auth Controller (`controllers/authController.js`)

**المسؤولية:** إدارة المصادقة والمستخدمين

#### أ) `register(req, res)`

```
الإدخال:
  ↓ username, email, password, firstName, lastName

العملية:
  1. التحقق من عدم تكرار البريد/اسم المستخدم
  2. إنشاء المستخدم (كلمة المرور تُشفر تلقائياً)
  3. إنشاء JWT Token
  
الإخراج:
  ↓ { user, token }
```

**الكود:**
```javascript
const register = async (req, res) => {
  try {
    // 1. استخراج البيانات
    const { username, email, password, firstName, lastName } = req.body;
    
    // 2. التحقق من عدم التكرار
    const existingUser = await checkUserExists(email, username);
    if (existingUser) {
      return sendError(res, 'User already exists', 400);
    }
    
    // 3. إنشاء المستخدم
    const user = await createUser({ username, email, password, firstName, lastName });
    
    // 4. إنشاء Token
    const token = generateToken(user._id);
    
    // 5. الإرجاع
    sendSuccess(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    sendError(res, 'Registration failed', 500, error);
  }
};
```

#### ب) `login(req, res)`

```
الإدخال:
  ↓ email, password

العملية:
  1. البحث عن المستخدم
  2. التحقق من كلمة المرور
  3. تحديث lastLogin
  4. إنشاء Token
  
الإخراج:
  ↓ { user, token }
```

#### ج) `uploadAvatar(req, res)`

```
الإدخال:
  ↓ File (image: jpg, png, webp, Max: 10MB)

العملية:
  1. حفظ الصورة في /uploads/avatars/
  2. تحديث avatarUrl في قاعدة البيانات
  3. حذف الصورة القديمة (إن وجدت)
  
الإخراج:
  ↓ { avatarUrl }
```

**التحديد:**
```javascript
// Multer Configuration
const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.user._id}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

---

### 2. Report Controller (`controllers/reportController.js`)

**المسؤولية:** إدارة التقارير

#### أ) `uploadFile(req, res)`

```
الإدخال:
  ↓ File (CSV/Excel, Max: 10MB)

العملية:
  1. التحقق من نوع الملف
  2. حفظ الملف في /uploads/
  3. معالجة الملف → استخراج البيانات
  4. حفظ في قاعدة البيانات
  
الإخراج:
  ↓ { reportId, filename, recordCount }
```

**التدفق:**
```javascript
uploadFile()
  ↓
Multer Middleware (حفظ الملف)
  ↓
reportService.processFile(filePath)
  ├─ CSV? → قراءة وتحليل النص
  └─ Excel? → استخدام XLSX library
  ↓
تحويل إلى JSON Array
  ↓
Report.create({ filename, filePath, data })
  ↓
return reportId
```

#### ب) `generateAReport(req, res)`

```
الإدخال:
  ↓ reportId, prompt

العملية:
  1. جلب التقرير من DB
  2. التحقق من الملكية (إن كان مسجلاً)
  3. استدعاء AI API
  4. حفظ النتيجة
  
الإخراج:
  ↓ { report (مع generatedReport) }
```

**التدفق:**
```javascript
generateAReport()
  ↓
Report.findById(reportId)
  ↓
checkReportOwnership() // إن كان authenticated
  ↓
reportService.generateReport(report.data, prompt)
  ├─ إنشاء Prompt مفصل
  ├─ إرسال لـ Groq API
  ├─ في حالة الفشل → generateFallbackReport()
  └─ الإرجاع: تقرير نصي (Markdown)
  ↓
Report.update({ generatedReport, status: 'completed' })
  ↓
return report
```

#### ج) `downloadReport(req, res)`

```
الإدخال:
  ↓ reportId

العملية:
  1. جلب التقرير
  2. التحقق من وجود generatedReport
  3. تحويل Markdown → HTML
  4. توليد PDF
  
الإخراج:
  ↓ PDF File Stream
```

---

### 3. AI Controller (`controllers/aiController.js`)

**المسؤولية:** التفاعل المباشر مع AI

#### `chatWithAI(req, res)`

```
الإدخال:
  ↓ message (سؤال المستخدم)

العملية:
  1. التحقق من صلاحيات الإدمن
  2. إرسال للـ AI API
  3. الإرجاع
  
الإخراج:
  ↓ { response, model }
```

**الكود:**
```javascript
const chatWithAI = async (req, res) => {
  try {
    // 1. التحقق من الصلاحيات
    checkAdminAccess(req.user);
    
    // 2. استخراج الرسالة
    const { message } = req.body;
    
    // 3. إرسال للـ AI
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: message }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    
    // 4. الإرجاع
    sendSuccess(res, {
      response: response.data.choices[0].message.content,
      model: 'llama-3.3-70b-versatile'
    });
  } catch (error) {
    sendError(res, 'AI chat failed', 500, error);
  }
};
```

---

## ⚙️ الخدمات (Services)

### Report Service (`services/reportService.js`)

**الأهم في المشروع!** يحتوي على كل منطق معالجة البيانات والـ AI.

---

#### 1. معالجة الملفات

##### `processFile(filePath)`

**الهدف:** قراءة ملف CSV أو Excel وتحويله لـ JSON

```javascript
async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    return await processCSV(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return await processExcel(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
}
```

**مثال - ملف CSV:**
```
Input (sales.csv):
Product,Price,Quantity
Laptop,1200,5
Phone,800,10
Tablet,600,8

↓ processFile() ↓

Output (JSON):
[
  { "Product": "Laptop", "Price": "1200", "Quantity": "5" },
  { "Product": "Phone", "Price": "800", "Quantity": "10" },
  { "Product": "Tablet", "Price": "600", "Quantity": "8" }
]
```

---

#### 2. توليد التقارير بالذكاء الاصطناعي

##### `generateReport(data, prompt)`

**الهدف:** استخدام AI لتحليل البيانات وتوليد تقرير شامل

```javascript
async function generateReport(data, prompt) {
  try {
    // 1. أخذ عينة من البيانات (أول 30 سجل)
    const dataSample = data.slice(0, 30);
    
    // 2. إنشاء Prompt مفصل
    const fullPrompt = `
أنت محلل بيانات محترف متخصص في تحليل البيانات وإنشاء تقارير شاملة.

📋 طلب المستخدم:
${prompt}

📊 البيانات المتاحة:
- إجمالي السجلات: ${data.length}
- عينة من البيانات:
${JSON.stringify(dataSample, null, 2)}

📝 المطلوب منك:
1. قم بتحليل البيانات بشكل شامل
2. أجب على طلب المستخدم بدقة
3. قدم رؤى وإحصائيات مفيدة
4. اكتب التقرير بتنسيق احترافي

⚠️ مهم جداً:
- اكتب التقرير الكامل بالعربية أولاً
- ثم اكتب نفس التقرير بالإنجليزية
- استخدم عناوين واضحة
- أضف أرقام وإحصائيات دقيقة
`;

    // 3. إرسال للـ Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'أنت محلل بيانات خبير. قم بإنشاء تقارير دقيقة وشاملة بالعربية والإنجليزية.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 4. استخراج النتيجة
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('AI generation failed, using fallback');
    return generateFallbackReport(data, prompt);
  }
}
```

---

#### 3. التقرير الاحتياطي

##### `generateFallbackReport(data, prompt)`

**الهدف:** توليد تقرير إحصائي بسيط عند فشل الـ AI

```javascript
function generateFallbackReport(data, prompt) {
  // 1. إحصائيات أساسية
  const totalRecords = data.length;
  const columns = Object.keys(data[0] || {});
  
  // 2. إحصائيات رقمية
  const numericColumns = columns.filter(col => {
    return !isNaN(parseFloat(data[0][col]));
  });
  
  const stats = {};
  numericColumns.forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    stats[col] = {
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      max: Math.max(...values),
      min: Math.min(...values)
    };
  });
  
  // 3. إنشاء التقرير
  return `
# 📊 تقرير تحليلي - ${new Date().toLocaleDateString('ar-EG')}

## الإحصائيات العامة
- إجمالي السجلات: **${totalRecords}**
- عدد الأعمدة: **${columns.length}**
- الأعمدة: ${columns.join(', ')}

## التحليل الإحصائي

${numericColumns.map(col => `
### ${col}
- المتوسط: ${stats[col].avg}
- الأعلى: ${stats[col].max}
- الأقل: ${stats[col].min}
`).join('\n')}

## الخلاصة
تم تحليل البيانات بنجاح. البيانات تحتوي على ${totalRecords} سجل مع ${columns.length} عمود.

---

# 📊 Analytical Report - ${new Date().toLocaleDateString('en-US')}

## General Statistics
- Total Records: **${totalRecords}**
- Number of Columns: **${columns.length}**
- Columns: ${columns.join(', ')}

## Statistical Analysis

${numericColumns.map(col => `
### ${col}
- Average: ${stats[col].avg}
- Maximum: ${stats[col].max}
- Minimum: ${stats[col].min}
`).join('\n')}

## Conclusion
Data analyzed successfully. The dataset contains ${totalRecords} records with ${columns.length} columns.
`;
}
```

---

#### 4. توليد PDF

##### `generatePDF(reportContent)`

**الهدف:** تحويل التقرير النصي إلى PDF احترافي مع دعم كامل للعربية

```javascript
async function generatePDF(reportContent) {
  // 1. تحويل Markdown إلى HTML
  const htmlContent = marked.parse(reportContent);
  
  // 2. إضافة CSS للتنسيق
  const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    /* دعم العربية */
    [dir="rtl"] {
      direction: rtl;
      text-align: right;
    }
    
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }
    
    h3 {
      color: #7f8c8d;
      margin-top: 20px;
    }
    
    p {
      margin: 15px 0;
    }
    
    strong {
      color: #e74c3c;
      font-weight: bold;
    }
    
    ul, ol {
      margin: 15px 0;
      padding-right: 30px;
    }
    
    li {
      margin: 8px 0;
    }
  </style>
</head>
<body dir="rtl">
  ${htmlContent}
</body>
</html>
`;

  // 3. توليد PDF
  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };
  
  const file = { content: styledHtml };
  const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
  
  return pdfBuffer;
}
```

**نتيجة PDF:**
- ✅ دعم كامل للعربية والإنجليزية
- ✅ تنسيق احترافي
- ✅ RTL تلقائي للعربية
- ✅ ألوان وعناوين واضحة

---

## 📧 Email Service (`services/emailService.js`)

**الهدف:** إدارة جميع عمليات البريد الإلكتروني

### الدوال المتاحة:

| الدالة | الاستخدام |
|--------|-----------|
| `sendVerificationOTP(user, otp)` | إرسال OTP للتحقق (6 أرقام) |
| `sendReportGeneratedEmail(user, report)` | إشعار توليد تقرير |
| `sendReportByEmail(user, report, pdfBuffer)` | إرسال تقرير مع PDF |
| `sendPasswordResetEmail(user, resetUrl)` | رابط إعادة تعيين كلمة المرور |
| `generateOTP()` | توليد OTP عشوائي (100000-999999) |
| `generateToken()` | توليد token آمن (hex 64 حرف) |

### إعداد Gmail:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // App Password من Google
  }
});
```

### مثال - OTP Email:

```
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎉 مرحباً أحمد!      ┃
┃ شكراً لانضمامك       ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃                      ┃
┃    ┌──────────┐      ┃
┃    │ 123456  │      ┃
┃    └──────────┘      ┃
┃                      ┃
┃ ⚠️ صالح لـ 10 دقائق ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🛡️ Rate Limiting (`middleware/rateLimiter.js`)

**الهدف:** حماية API من الاستخدام المفرط والهجمات

### التكوينات السبعة:

| النوع | المسارات | الفترة | الحد |
|------|----------|--------|------|
| 🌐 **General** | `/api/*` | 15 دقيقة | 100 |
| 🔐 **Auth** | `login`, `register` | 15 دقيقة | 5 |
| 📤 **Upload** | `upload` | 1 ساعة | 10 |
| 🤖 **AI Generate** | `generate` | 1 ساعة | 20 |
| 💬 **AI Chat** | `ai/chat` | 1 ساعة | 50 |
| 📥 **Download** | `download`, `email` | 15 دقيقة | 30 |
| 👑 **Admin** | `admin/*` | 15 دقيقة | 50 |

### الحماية من:

- ✅ **DDoS Attacks** - حد عام 100 طلب
- ✅ **Brute Force** - 5 محاولات login فقط
- ✅ **API Abuse** - حدود لكل عملية
- ✅ **Cost Control** - حماية تكاليف AI API

---

## 🛡️ الوسيطات (Middleware)

### Auth Middleware (`middleware/auth.js`)

**الهدف:** التحقق من هوية المستخدم وصلاحياته

---

#### 1. `generateToken(userId)`

**إنشاء JWT Token**

```javascript
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }  // صالح لمدة 7 أيام
  );
}
```

**مثال Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTIzYWJjIiwiaWF0IjoxNjk...
```

---

#### 2. `authenticate(req, res, next)`

**التحقق من المصادقة (مطلوب)**

```javascript
async function authenticate(req, res, next) {
  try {
    // 1. استخراج Token من Header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }
    
    // 2. التحقق من صحة Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. جلب المستخدم
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return sendError(res, 'User not found or inactive', 401);
    }
    
    // 4. إضافة المستخدم إلى Request
    req.user = user;
    next();
    
  } catch (error) {
    sendError(res, 'Invalid token', 401);
  }
}
```

**التدفق:**
```
Client Request
  ↓
Header: "Authorization: Bearer <token>"
  ↓
authenticate() Middleware
  ├─ استخراج Token
  ├─ التحقق من صحته
  ├─ جلب المستخدم من DB
  └─ req.user = user
  ↓
Controller يستخدم req.user
```

---

#### 3. `optionalAuth(req, res, next)`

**مصادقة اختيارية (للمسارات المختلطة)**

```javascript
async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    // نستمر حتى لو لم يكن هناك token
    next();
    
  } catch (error) {
    // تجاهل الأخطاء والاستمرار
    next();
  }
}
```

**متى نستخدمه؟**
- التقارير العامة (يمكن رؤيتها بدون تسجيل)
- API يعمل مع/بدون مصادقة

---

#### 4. `authorizeAdmin(req, res, next)`

**التحقق من صلاحيات الإدمن**

```javascript
function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  
  if (req.user.role !== 'admin') {
    return sendError(res, 'Admin access required', 403);
  }
  
  next();
}
```

**الاستخدام:**
```javascript
// في routes/auth.js
router.get('/admin/users', 
  authenticate,      // تأكد من المصادقة
  authorizeAdmin,    // تأكد من الصلاحيات
  getAllUsers        // نفذ العملية
);
```

---

## 🔧 الدوال المساعدة (Utils)

### 1. Response Helper (`utils/responseHelper.js`)

**الهدف:** توحيد شكل الردود من الـ API

```javascript
// ✅ رد النجاح
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

// ❌ رد الخطأ
function sendError(res, message = 'Error', statusCode = 500, error = null) {
  res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error
  });
}

// 🔄 معالج async تلقائي
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ✔️ التحقق من الحقول المطلوبة
function validateRequiredFields(fields, data) {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
```

**الاستخدام:**
```javascript
// في controller
sendSuccess(res, { user }, 'Login successful');
// → { success: true, message: "Login successful", data: { user } }

sendError(res, 'Invalid credentials', 401);
// → { success: false, message: "Invalid credentials" }
```

---

### 2. User Helper (`utils/userHelper.js`)

**الهدف:** عمليات مشتركة للمستخدمين

```javascript
// التحقق من وجود مستخدم
async function checkUserExists(email, username, excludeUserId = null) {
  const query = {
    $or: [{ email }, { username }]
  };
  
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  
  return await User.findOne(query);
}

// إنشاء مستخدم جديد
async function createUser(userData) {
  // التحقق من عدم التكرار
  const exists = await checkUserExists(userData.email, userData.username);
  if (exists) {
    throw new Error('User already exists');
  }
  
  // إنشاء المستخدم
  const user = new User(userData);
  await user.save();
  
  return user;
}
```

---

### 3. Report Helper (`utils/reportHelper.js`)

**الهدف:** عمليات مشتركة للتقارير

```javascript
// التحقق من ملكية التقرير
function checkReportOwnership(report, userId) {
  if (report.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized access to report');
  }
}

// التحقق من صلاحيات الإدمن
function checkAdminAccess(user) {
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

// جلب تقرير بالـ ID
async function findReportById(reportId, populateUser = false) {
  let query = Report.findById(reportId);
  
  if (populateUser) {
    query = query.populate('userId', 'firstName lastName email avatarUrl');
  }
  
  const report = await query;
  
  if (!report) {
    throw new Error('Report not found');
  }
  
  return report;
}
```

---

## 🔄 تدفق البيانات

### سيناريو كامل: من الرفع إلى التحميل

```
┌─────────────────────────────────────────────────────────┐
│ 1️⃣ المستخدم يرفع ملف CSV                               │
│    POST /api/reports/upload                             │
│    File: sales_data.csv (150 records)                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2️⃣ Multer Middleware                                    │
│    - حفظ الملف في /uploads/1696789012-sales_data.csv   │
│    - التحقق من الحجم والنوع                            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3️⃣ reportController.uploadFile()                        │
│    - استدعاء reportService.processFile()               │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4️⃣ reportService.processFile()                          │
│    CSV:                                                 │
│    Product,Price,Quantity                               │
│    Laptop,1200,5                                        │
│    ↓                                                    │
│    JSON:                                                │
│    [{ Product: "Laptop", Price: "1200", ... }]          │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5️⃣ حفظ في MongoDB                                      │
│    Report.create({                                      │
│      filename: "sales_data.csv",                        │
│      data: [...],                                       │
│      status: "pending",                                 │
│      userId: req.user?._id                              │
│    })                                                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6️⃣ رد للمستخدم                                         │
│    {                                                    │
│      success: true,                                     │
│      data: {                                            │
│        reportId: "6123abc...",                          │
│        filename: "sales_data.csv",                      │
│        recordCount: 150                                 │
│      }                                                  │
│    }                                                    │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 7️⃣ المستخدم يطلب توليد تقرير                          │
│    POST /api/reports/generate/6123abc...                │
│    { prompt: "حلل بيانات المبيعات" }                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 8️⃣ reportController.generateAReport()                   │
│    - جلب التقرير من DB                                 │
│    - التحقق من الملكية                                 │
│    - تحديث status: "processing"                        │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 9️⃣ reportService.generateReport()                       │
│    - بناء Prompt مفصل:                                 │
│      * طلب المستخدم                                    │
│      * عينة من البيانات (30 سجل)                      │
│      * تعليمات التحليل                                 │
│    - إرسال لـ Groq API                                 │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 🔟 Groq API (Llama 3.3 70B)                             │
│    - تحليل البيانات                                    │
│    - توليد تقرير بالعربية                             │
│    - توليد نفس التقرير بالإنجليزية                    │
│    - إرجاع النص (Markdown)                             │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 1️⃣1️⃣ حفظ التقرير في DB                                │
│    Report.update({                                      │
│      generatedReport: "# تحليل المبيعات...",           │
│      status: "completed",                               │
│      generatedAt: new Date()                            │
│    })                                                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 1️⃣2️⃣ رد للمستخدم                                       │
│    {                                                    │
│      success: true,                                     │
│      data: {                                            │
│        _id: "6123abc...",                               │
│        generatedReport: "# تحليل...",                   │
│        status: "completed"                              │
│      }                                                  │
│    }                                                    │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 1️⃣3️⃣ المستخدم يطلب تحميل PDF                          │
│    GET /api/reports/6123abc.../download                 │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 1️⃣4️⃣ reportService.generatePDF()                        │
│    - Markdown → HTML                                    │
│    - إضافة CSS (RTL للعربية)                          │
│    - html-pdf-node → PDF Buffer                         │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 1️⃣5️⃣ إرسال PDF للتحميل                                │
│    Content-Type: application/pdf                        │
│    Content-Disposition: attachment; filename="..."      │
│    Body: PDF Buffer                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 الأمان

### 1. تشفير كلمات المرور

```javascript
// Pre-save hook في User Model
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**كيف يعمل؟**
```
Input: "mypassword123"
  ↓
bcrypt.hash() with 10 salt rounds
  ↓
Output: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  ↓
يُحفظ في قاعدة البيانات
```

---

### 2. JWT Authentication

```javascript
// إنشاء Token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// التحقق من Token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// → { userId: "6123abc...", iat: 1696789012, exp: 1697393812 }
```

**دورة حياة Token:**
```
1. المستخدم يسجل دخول
   ↓
2. السيرفر ينشئ Token (صالح 7 أيام)
   ↓
3. Client يحفظه في localStorage
   ↓
4. في كل طلب: Header: "Authorization: Bearer <token>"
   ↓
5. السيرفر يتحقق من Token
   ↓
6. إن صحيح: يكمل الطلب
   إن خطأ: يُرجع 401 Unauthorized
```

---

### 3. الصلاحيات (Authorization)

| الدور | الصلاحيات |
|------|-----------|
| **Guest** | - عرض التقارير العامة |
| **User** | - كل صلاحيات Guest<br>- رفع ملفات<br>- توليد تقارير<br>- حذف تقاريره |
| **Admin** | - كل صلاحيات User<br>- إدارة المستخدمين (CRUD)<br>- عرض كل التقارير<br>- حذف أي تقرير<br>- محادثة AI مباشرة |

---

### 4. التحقق من الملفات

```javascript
// في Multer config
const fileFilter = (req, file, cb) => {
  // أنواع مسموحة فقط
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'));
  }
};

// حدود الحجم
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB
  },
  fileFilter: fileFilter
});
```

---

## 🛠️ التقنيات المستخدمة

### Backend Stack

```
┌─────────────────────────────────────────┐
│         Node.js (v18+)                  │
│         Runtime Environment              │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Express.js (v4)                 │
│         Web Framework                    │
└────────────────┬────────────────────────┘
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │  Mongoose    │
│   Database   │  │     ODM      │
└──────────────┘  └──────────────┘
```

### المكتبات الأساسية

| المكتبة | الإصدار | الاستخدام |
|---------|---------|-----------|
| `express` | ^4.18.0 | إطار عمل الويب |
| `mongoose` | ^7.5.0 | التعامل مع MongoDB |
| `jsonwebtoken` | ^9.0.0 | JWT Authentication |
| `bcryptjs` | ^2.4.3 | تشفير كلمات المرور |
| `multer` | ^1.4.5 | رفع الملفات |
| `xlsx` | ^0.18.0 | قراءة Excel |
| `axios` | ^1.5.0 | HTTP Requests |
| `html-pdf-node` | ^1.0.8 | توليد PDF |
| `nodemailer` | ^6.9.0 | إرسال الإيميلات (Gmail SMTP) |
| `express-rate-limit` | ^7.1.0 | Rate Limiting & DDoS Protection |
| `cors` | ^2.8.5 | CORS Protection |
| `dotenv` | ^16.3.0 | متغيرات البيئة |
| `fs-extra` | ^11.1.0 | عمليات الملفات المتقدمة |

---

## ⚙️ الإعداد والتشغيل

### 1. المتطلبات

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **npm** or **yarn**

### 2. التثبيت

```bash
# استنساخ المشروع
git clone <repository-url>

# الانتقال لمجلد السيرفر
cd server

# تثبيت المكتبات
npm install
```

### 3. إعداد قاعدة البيانات

```bash
# تشغيل MongoDB (Windows)
mongod

# أو (Linux/Mac)
sudo systemctl start mongod

# إنشاء قاعدة البيانات (اختياري - تُنشأ تلقائياً)
mongo
> use ai-reports
```

### 4. متغيرات البيئة

إنشاء ملف `config.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-reports

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (غيّره لشيء عشوائي قوي)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# AI APIs
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
HF_TOKEN=hf_xxxxxxxxxxxxx

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM="AI Reports <your-email@gmail.com>"

# App Settings
APP_NAME=AI Reports
CLIENT_URL=http://localhost:3000

# Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 5. تشغيل السيرفر

```bash
# Development mode (مع auto-reload)
npm run dev

# Production mode
npm start
```

**الخرج المتوقع:**
```
Server started on port 5000
Connected to MongoDB
✓ Ready to accept requests
```

### 6. اختبار API

```bash
# اختبار صحة السيرفر
curl http://localhost:5000/api/auth/test

# تسجيل مستخدم
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 📊 إحصائيات المشروع

### الأكواد

```
📁 server/
├── 15 ملفات رئيسية
├── ~5,000 سطر من الكود
├── 10 Models & Controllers & Services
├── 25+ API Endpoints
├── 7 Rate Limiters
├── 8 Email Templates
└── 80+ دالة ومكون
```

### الميزات

- ✅ **نظام مستخدمين كامل** (تسجيل، دخول، ملف شخصي، OTP)
- ✅ **Email Verification** (OTP 6 أرقام، صالح 10 دقائق)
- ✅ **Password Reset** (إعادة تعيين عبر البريد)
- ✅ **معالجة ملفات ذكية** (CSV, Excel)
- ✅ **تكامل AI** (Groq Llama 3.3 70B، Hugging Face)
- ✅ **تقارير متعددة اللغات** (عربي أو إنجليزي حسب الاختيار)
- ✅ **توليد PDF** (RTL للعربية، LTR للإنجليزية)
- ✅ **إرسال تقارير بالإيميل** (PDF مرفق)
- ✅ **Rate Limiting** (7 أنواع مختلفة)
- ✅ **لوحة تحكم إدمن** (إدارة مستخدمين، تقارير، AI chat)
- ✅ **React Router** (URL navigation)
- ✅ **Responsive Design** (موبايل + ديسكتوب)
- ✅ **API موثق ومنظم**

---

## 🚀 تحسينات مستقبلية

### ✅ تم إنجازه

- [x] **Rate Limiting** لحماية API (7 أنواع مختلفة)
- [x] **Email Service** للإشعارات (Gmail SMTP)
- [x] **Email Verification** (OTP System)
- [x] **Password Reset** (عبر البريد)
- [x] **Email Reports** (إرسال PDF بالبريد)
- [x] **React Router** (URL navigation)
- [x] **Responsive Design** (موبايل محسّن)
- [x] **Multi-language Reports** (عربي/إنجليزي)
- [x] **RTL/LTR PDF** (تنسيق حسب اللغة)
- [x] **Blog System** (مدونة التقارير العامة)
- [x] **SEO Optimization** (Schema.org، Meta Tags، Sitemap)
- [x] **Public/Private Reports** (تبديل الحالة)

### 📋 في الخطة

- [ ] **WebSocket** للتقارير الحية
- [ ] **Redis Caching** لتسريع الاستجابة
- [ ] **Advanced Analytics** رسوم بيانية تفاعلية
- [ ] **Export Options** (Excel, Word, JSON)
- [ ] **Logging System** مع Winston
- [ ] **Unit Tests** مع Jest
- [ ] **Docker** containerization
- [ ] **CI/CD Pipeline** مع GitHub Actions
- [ ] **Two-Factor Authentication** (2FA)
- [ ] **API Documentation** مع Swagger

---

## 📞 الدعم والمساهمة

### الإبلاغ عن مشاكل

إذا واجهت أي مشكلة، يُرجى فتح issue في GitHub مع:
- وصف المشكلة
- خطوات إعادة إنتاج المشكلة
- الأخطاء (logs)
- نظام التشغيل والإصدارات

### المساهمة

نرحب بأي مساهمات! 
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح تحت رخصة MIT.

---

## 👨‍💻 الفريق

تم تطوير هذا المشروع بواسطة فريق متخصص مع التركيز على:

| المبدأ | التطبيق |
|--------|---------|
| 🎯 **Clean Code** | كود نظيف وقابل للصيانة |
| 🏗️ **Scalable Architecture** | معمارية قابلة للتوسع |
| 🔐 **Security First** | أمان عالي في كل طبقة |
| 🌍 **i18n Support** | دعم كامل للعربية والإنجليزية |
| 📚 **Well Documented** | توثيق شامل ومفصل |

---

---

## 🎯 الميزات المتقدمة المضافة

### 1️⃣ نظام OTP للتحقق من البريد

**كيف يعمل:**
```
التسجيل → يُرسل OTP (6 أرقام)
   ↓
/verify-otp → إدخال الكود
   ↓
✅ تفعيل الحساب + تسجيل دخول تلقائي
```

**المميزات:**
- ✅ كود من 6 أرقام فقط (سهل الإدخال)
- ✅ صالح لمدة 10 دقائق
- ✅ إمكانية إعادة الإرسال
- ✅ واجهة مستخدم احترافية (6 حقول منفصلة)
- ✅ دعم اللصق (Paste)
- ✅ عد تنازلي مباشر

---

### 2️⃣ إعادة تعيين كلمة المرور

**المسار:**
```
/login → "نسيت كلمة المرور؟"
   ↓
/forgot-password → إدخال البريد
   ↓
يُرسل رابط إعادة التعيين
   ↓
/reset-password/:token → كلمة مرور جديدة
   ↓
✅ تم التغيير
```

**الأمان:**
- ✅ Token آمن (64 حرف hex)
- ✅ صالح لمدة ساعة واحدة فقط
- ✅ يُحذف تلقائياً بعد الاستخدام
- ✅ لا يُخبر إن كان البريد موجود (حماية)

---

### 3️⃣ تقارير متعددة اللغات

**الفكرة:**
- المستخدم يختار اللغة من الواجهة (🇸🇦 عربي أو 🇺🇸 English)
- AI يولد التقرير بلغة واحدة فقط
- PDF يتبع نفس اللغة مع تنسيق صحيح

**عربي (RTL):**
```
       هذا نص عربي •
        نص آخر •
      النتائج الرئيسية ##
```

**English (LTR):**
```
• This is English text
• Another text
## Key Findings
```

---

### 4️⃣ إرسال التقارير بالبريد

**الميزة:**
- زر "📧 إرسال بالإيميل" بجانب "📥 تحميل PDF"
- يُرسل PDF مرفق مع إيميل HTML جميل
- معلومات كاملة عن التقرير

**الإيميل يحتوي:**
- ✅ رسالة ترحيبية
- ✅ اسم الملف والطلب
- ✅ تاريخ التوليد
- ✅ PDF مرفق كاملاً
- ✅ ثنائي اللغة (حسب لغة التقرير)

---

### 5️⃣ Rate Limiting الشامل

**7 أنواع مختلفة:**

1. **General** - 100 طلب/15 دقيقة (كل المسارات)
2. **Auth** - 5 محاولات/15 دقيقة (login/register)
3. **Upload** - 10 ملفات/ساعة
4. **AI Generate** - 20 تقرير/ساعة
5. **AI Chat** - 50 رسالة/ساعة (admin)
6. **Download/Email** - 30 عملية/15 دقيقة
7. **Admin** - 50 عملية/15 دقيقة

**الرد عند التجاوز:**
```json
{
  "success": false,
  "message": "Too many requests, please try again after 15 minutes.",
  "message_ar": "عدد كبير من الطلبات، يرجى المحاولة بعد 15 دقيقة."
}
```
**Status Code:** `429 Too Many Requests`

---

### 6️⃣ React Router Navigation

**المسارات:**
```
/                  → Landing Page
/login             → تسجيل دخول
/register          → تسجيل
/verify-otp        → تحقق OTP
/forgot-password   → نسيت كلمة المرور
/reset-password    → إعادة تعيين

/create            → إنشاء تقرير (محمي)
/reports           → تقاريري (محمي)
/settings          → الإعدادات (محمي)
/admin             → لوحة الإدارة (admin فقط)
```

**المميزات:**
- ✅ URL يتغير مع كل صفحة
- ✅ زر Back/Forward يعمل
- ✅ يمكن مشاركة الروابط
- ✅ فتح في تاب جديد
- ✅ حماية تلقائية للصفحات

---

### 7️⃣ تحسينات UX

**أ) Show/Hide Password:**
- ✅ زر عين 👁️ لإظهار كلمة المرور
- ✅ في Login و Register
- ✅ كل حقول كلمة المرور

**ب) Burger Menu Sidebar:**
- ✅ قائمة جانبية احترافية
- ✅ صورة المستخدم + الاسم
- ✅ متاحة في كل الصفحات
- ✅ RTL/LTR حسب اللغة

**ج) Responsive Design:**
- ✅ جميع الصفحات محسّنة للموبايل
- ✅ Tailwind breakpoints (sm, md, lg, xl)
- ✅ قوائم عمودية على الموبايل
- ✅ أزرار ملائمة للمس

---

## 🌐 Blog System (نظام المدونة)

### المسارات:
```
GET /api/reports/public → جلب جميع التقارير العامة
PATCH /api/reports/:id/toggle-public → تبديل حالة التقرير
```

### الميزات:
- ✅ عرض التقارير العامة فقط (isPublic: true)
- ✅ فلترة وبحث متقدم
- ✅ ترتيب حسب التاريخ
- ✅ معلومات الكاتب مع الصورة
- ✅ تحميل PDF مباشر
- ✅ مشاركة على وسائل التواصل

### الصفحات:
```
/blog → قائمة جميع التقارير العامة
/blog/:id → عرض تقرير فردي كامل
```

---

## 🔍 SEO Optimization

### تحسينات محركات البحث:

#### **1. React Helmet Async:**
```typescript
<Helmet>
  <title>عنوان محسّن SEO</title>
  <meta name="description" content="وصف 160 حرف" />
  <meta name="keywords" content="كلمات, مفتاحية" />
</Helmet>
```

#### **2. Schema.org Structured Data:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "عنوان التقرير",
  "author": { "@type": "Person", "name": "أحمد علي" },
  "datePublished": "2025-10-08"
}
```

#### **3. Open Graph Tags:**
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
```

#### **4. Twitter Cards:**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
```

#### **5. Microdata في HTML:**
```html
<article itemScope itemType="https://schema.org/Article">
  <h1 itemProp="headline">...</h1>
  <span itemProp="author">...</span>
  <time itemProp="datePublished">...</time>
</article>
```

#### **6. ملفات SEO:**
- ✅ `robots.txt` - السماح/المنع لمحركات البحث
- ✅ `sitemap.xml` - خريطة الموقع
- ✅ `manifest.json` - معلومات التطبيق

### AI Prompts محسّنة للـ SEO:
```javascript
// System Message:
"أنت محلل بيانات محترف وكاتب محتوى SEO"

// المخرجات:
- عناوين واضحة (H1, H2, H3)
- جداول markdown منظمة
- نقاط رئيسية مع أرقام
- نص عريض للأرقام المهمة
- هيكل صديق لمحركات البحث
```

---

## 📸 Avatar Upload Configuration

### الإعدادات الحالية:

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| **Max File Size** | 10MB | الحد الأقصى لحجم الصورة |
| **Allowed Types** | JPG, PNG, WebP | الصيغ المدعومة |
| **Storage Path** | `./uploads/avatars/` | مكان الحفظ |
| **Naming Pattern** | `timestamp-userId.ext` | نمط التسمية |

### Multer Configuration:

```javascript
// server/routes/auth.js
const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.user?._id || 'guest'}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

### Express Body Size:

```javascript
// server/index.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### ملخص الحدود:

```
📸 Avatar Images:     10MB
📊 CSV/Excel Files:   10MB
📦 Express Body:      50MB
```

---

**آخر تحديث:** 8 أكتوبر 2025

**الإصدار:** 4.1

**الحالة:** ✅ قيد الإنتاج والتشغيل

**الميزات الجديدة:** Blog System, SEO Optimization, Avatar Upload (10MB), Public/Private Reports, Schema.org

---

<div align="center">

### 🌟 صُنع بـ ❤️ من أجل مجتمع المطورين العرب

**#AI #DataAnalysis #NodeJS #MongoDB #Express #EmailVerification #RateLimiting #ReactRouter**

</div>
