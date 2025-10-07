# 📚 شرح معماريّة الـ Backend

## 🏗️ البنية العامة للمشروع

```
server/
├── index.js              # نقطة البداية الرئيسية
├── config.env            # متغيرات البيئة
├── models/               # نماذج قاعدة البيانات (MongoDB)
│   ├── User.js          # نموذج المستخدم
│   └── Report.js        # نموذج التقرير
├── controllers/          # منطق معالجة الطلبات
│   ├── authController.js
│   ├── reportController.js
│   └── aiController.js
├── routes/               # تعريف المسارات (API Endpoints)
│   ├── auth.js
│   ├── reports.js
│   └── ai.js
├── middleware/           # وسيطات المصادقة والتحقق
│   └── auth.js
├── services/             # خدمات معالجة البيانات والذكاء الاصطناعي
│   └── reportService.js
├── utils/                # دوال مساعدة
│   ├── responseHelper.js
│   ├── userHelper.js
│   └── reportHelper.js
└── uploads/              # الملفات المرفوعة
    ├── avatars/         # الصور الشخصية
    └── *.csv, *.xlsx    # ملفات البيانات
```

---

## 1️⃣ نقطة البداية - `index.js`

### الإعدادات الأساسية

```javascript
// تحميل متغيرات البيئة من config.env
require('dotenv').config({ path: './config.env' });

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// إعداد Express Server
const app = express();
app.use(cors());                    // السماح بطلبات CORS
app.use(express.json());            // تحليل JSON
app.use('/uploads', express.static) // عرض الصور والملفات

// تعريف المسارات الرئيسية
app.use('/api/auth', authRoutes);      // مسارات المصادقة
app.use('/api/reports', reportRoutes); // مسارات التقارير
app.use('/api/ai', aiRoutes);          // مسارات الذكاء الاصطناعي
```

### المميزات
- ✅ معالجة الأخطاء المركزية
- ✅ دعم رفع الملفات حتى 50MB
- ✅ حماية CORS
- ✅ عرض الملفات الثابتة

---

## 2️⃣ النماذج (Models) - قاعدة البيانات

### User Model - `models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  username: String,      // اسم المستخدم (فريد)
  email: String,         // البريد الإلكتروني (فريد)
  password: String,      // كلمة المرور (مشفرة بـ bcrypt)
  firstName: String,     // الاسم الأول
  lastName: String,      // الاسم الأخير
  role: String,          // الدور: 'user' أو 'admin'
  isActive: Boolean,     // هل الحساب مفعل؟
  avatarUrl: String,     // رابط الصورة الشخصية
  lastLogin: Date,       // آخر تسجيل دخول
  createdAt: Date        // تاريخ الإنشاء
});
```

**الدوال المهمة:**
- `comparePassword()` - التحقق من كلمة المرور
- `toJSON()` - إخفاء كلمة المرور عند الإرجاع
- Pre-save hook - تشفير كلمة المرور تلقائياً

### Report Model - `models/Report.js`

```javascript
const reportSchema = new mongoose.Schema({
  filename: String,         // اسم الملف المرفوع
  filePath: String,         // مسار حفظ الملف
  data: Array,              // البيانات المستخرجة (JSON Array)
  prompt: String,           // طلب المستخدم للذكاء الاصطناعي
  generatedReport: String,  // التقرير المُولد
  status: String,           // الحالة: pending, processing, completed, error
  userId: ObjectId,         // معرف المستخدم (ربط مع User)
  isPublic: Boolean,        // هل التقرير عام؟
  createdAt: Date,          // تاريخ الإنشاء
  generatedAt: Date         // تاريخ التوليد
});
```

**Indexes للأداء:**
- `{ userId: 1, createdAt: -1 }` - للبحث السريع
- `{ status: 1 }` - لفلترة الحالات

---

## 3️⃣ المسارات (Routes) - API Endpoints

### Authentication Routes - `routes/auth.js`

#### المسارات العامة (بدون تسجيل دخول)
```
POST /api/auth/register           # تسجيل مستخدم جديد
POST /api/auth/login              # تسجيل الدخول
```

#### المسارات المحمية (تحتاج Token)
```
GET  /api/auth/profile            # عرض الملف الشخصي
PUT  /api/auth/profile            # تحديث البيانات الشخصية
PUT  /api/auth/change-password    # تغيير كلمة المرور
POST /api/auth/profile/avatar     # رفع صورة شخصية (5MB max)
```

#### مسارات الإدمن فقط
```
GET    /api/auth/admin/users        # عرض جميع المستخدمين
POST   /api/auth/admin/users        # إنشاء مستخدم جديد
PUT    /api/auth/admin/users/:id    # تحديث بيانات مستخدم
DELETE /api/auth/admin/users/:id    # حذف مستخدم
```

### Report Routes - `routes/reports.js`

#### مسارات التقارير (اختياري التسجيل)
```
POST   /api/reports/upload              # رفع ملف CSV/Excel (10MB max)
POST   /api/reports/generate/:id        # توليد تقرير بالذكاء الاصطناعي
GET    /api/reports/                    # عرض جميع التقارير
GET    /api/reports/:id                 # عرض تقرير واحد
GET    /api/reports/:id/download        # تحميل التقرير كـ PDF
DELETE /api/reports/:id                 # حذف تقرير
```

#### مسارات الإدمن
```
GET    /api/reports/admin/all           # عرض كل التقارير مع بيانات المستخدمين
DELETE /api/reports/admin/:id           # حذف أي تقرير
```

### AI Routes - `routes/ai.js`

```
POST /api/ai/chat                       # محادثة مع الذكاء الاصطناعي (إدمن فقط)
```

---

## 4️⃣ Controllers - منطق معالجة الطلبات

### Auth Controller - `controllers/authController.js`

```javascript
register(req, res)
  ↓ يستقبل: username, email, password, firstName, lastName
  ↓ يتحقق من عدم وجود البريد/اسم المستخدم
  ↓ ينشئ المستخدم (يشفر كلمة المرور تلقائياً)
  ↓ يُنشئ JWT Token
  ↓ يُرجع: { user, token }

login(req, res)
  ↓ يستقبل: email, password
  ↓ يبحث عن المستخدم بالبريد
  ↓ يتحقق من كلمة المرور
  ↓ يُحدث lastLogin
  ↓ يُنشئ JWT Token
  ↓ يُرجع: { user, token }

getProfile(req, res)
  ↓ يُرجع بيانات المستخدم الحالي (من req.user)

updateProfile(req, res)
  ↓ يحدث: firstName, lastName, username, email
  ↓ يتحقق من عدم تكرار البريد/اسم المستخدم

changePassword(req, res)
  ↓ يتحقق من كلمة المرور القديمة
  ↓ يحفظ كلمة المرور الجديدة (مشفرة)
```

#### وظائف الإدمن

```javascript
getAllUsers(req, res)
  ↓ يُرجع جميع المستخدمين (مع فلاتر)

createUserByAdmin(req, res)
  ↓ ينشئ مستخدم جديد بدور محدد

updateUserByAdmin(req, res)
  ↓ يحدث بيانات أي مستخدم

deleteUserByAdmin(req, res)
  ↓ يحذف مستخدم (يتحقق أنه ليس إدمن)
```

### Report Controller - `controllers/reportController.js`

```javascript
uploadFile(req, res)
  ↓ يستقبل ملف CSV/Excel
  ↓ يتحقق من النوع والحجم
  ↓ يحفظ الملف في /uploads
  ↓ يعالجه بـ reportService.processFile()
  ↓ يحفظ البيانات في MongoDB
  ↓ يُرجع: { reportId, filename, recordCount }

generateAReport(req, res)
  ↓ يستقبل: reportId, prompt
  ↓ يجلب التقرير من قاعدة البيانات
  ↓ يتحقق من ملكية التقرير
  ↓ يستدعي reportService.generateReport()
  ↓ يحفظ التقرير المُولد
  ↓ يُرجع: التقرير الكامل

downloadReport(req, res)
  ↓ يجلب التقرير
  ↓ يتحقق من وجود generatedReport
  ↓ يستدعي reportService.generatePDF()
  ↓ يُرسل ملف PDF للتحميل

deleteReport(req, res)
  ↓ يتحقق من ملكية التقرير
  ↓ يحذفه من قاعدة البيانات
```

### AI Controller - `controllers/aiController.js`

```javascript
chatWithAI(req, res)
  ↓ يتحقق من صلاحيات الإدمن
  ↓ يستقبل: message
  ↓ يُرسل للـ Groq API (أو Hugging Face)
  ↓ يُرجع: { response, model }
```

---

## 5️⃣ Services - خدمات معالجة البيانات

### Report Service - `services/reportService.js`

هذا أهم ملف في المشروع!

#### 1. معالجة الملفات

```javascript
processFile(filePath)
  ↓ يتحقق من نوع الملف (.csv, .xlsx, .xls)
  ↓ CSV: يقرأ النص ويحوله لـ JSON
  ↓ Excel: يستخدم مكتبة XLSX
  ↓ يُرجع: Array of Objects
```

**مثال:**
```
ملف CSV:
Name,Age,Score
Ahmed,25,90
Sara,22,85

يتحول إلى:
[
  { Name: "Ahmed", Age: "25", Score: "90" },
  { Name: "Sara", Age: "22", Score: "85" }
]
```

#### 2. توليد التقارير بالذكاء الاصطناعي

```javascript
generateReport(data, prompt)
  ↓ يتحقق من وجود API Key
  ↓ يأخذ أول 30 سجل كعينة
  ↓ يُنشئ Prompt مفصل:
     - طلب المستخدم
     - بيانات العينة
     - تعليمات التحليل
     - طلب التقرير بالعربية والإنجليزية
  ↓ يُرسل لـ Groq API (llama-3.3-70b)
  ↓ إن فشل، يستخدم generateFallbackReport()
  ↓ يُرجع: التقرير النصي (Markdown)
```

**هيكل الـ Prompt:**
```
أنت محلل بيانات محترف...

طلب المستخدم: "ما هو متوسط الدرجات؟"

البيانات:
- إجمالي السجلات: 200
- عينة: [...]

المطلوب:
1. اكتب التحليل الكامل بالعربية
2. ثم اكتب نفس التحليل بالإنجليزية
```

#### 3. التقرير الاحتياطي (Fallback)

```javascript
generateFallbackReport(data, prompt)
  ↓ يُستخدم عند فشل الـ API
  ↓ يُنشئ تحليل إحصائي بسيط:
     - عدد السجلات
     - الأعمدة
     - إحصائيات رقمية (متوسط، أعلى، أقل)
  ↓ بالعربية والإنجليزية
```

#### 4. توليد PDF

```javascript
generatePDF(report)
  ↓ يحول التقرير النصي (Markdown) لـ HTML
  ↓ يضيف CSS للتنسيق:
     - دعم العربية والإنجليزية
     - RTL/LTR تلقائي
     - تنسيق جميل
  ↓ يستخدم html-pdf-node
  ↓ يُرجع: PDF Buffer
```

**مثال HTML:**
```html
<div style="direction: rtl; font-family: Arial;">
  <h1>التقرير التحليلي</h1>
  <p>هذا تحليل شامل...</p>
</div>
<div style="direction: ltr; font-family: Arial;">
  <h1>Analytical Report</h1>
  <p>This is a comprehensive analysis...</p>
</div>
```

---

## 6️⃣ Middleware - وسيطات التحقق

### Auth Middleware - `middleware/auth.js`

```javascript
generateToken(userId)
  ↓ ينشئ JWT Token
  ↓ صالح لمدة 7 أيام
  ↓ يُرجع: Token String

authenticate(req, res, next)
  ↓ يستخرج Token من Header: "Authorization: Bearer <token>"
  ↓ يتحقق من صحة Token
  ↓ يجلب المستخدم من قاعدة البيانات
  ↓ يحمله في req.user
  ↓ إن فشل: يُرجع 401 Unauthorized

optionalAuth(req, res, next)
  ↓ نفس authenticate
  ↓ لكن لا يفشل إن لم يُوجد Token
  ↓ يُستخدم للمسارات التي تعمل مع/بدون تسجيل دخول

authorizeAdmin(req, res, next)
  ↓ يتحقق أن req.user.role === 'admin'
  ↓ إن لم يكن: يُرجع 403 Forbidden
```

---

## 7️⃣ Utils - دوال مساعدة

### Response Helper - `utils/responseHelper.js`

```javascript
sendSuccess(res, data, message, statusCode)
  // يُرسل رد موحد للنجاح
  { success: true, message, data }

sendError(res, message, statusCode, error)
  // يُرسل رد موحد للخطأ
  { success: false, message, error }

asyncHandler(fn)
  // يلتقط الأخطاء تلقائياً في async functions

validateRequiredFields(fields, data)
  // يتحقق من وجود الحقول المطلوبة
```

### User Helper - `utils/userHelper.js`

```javascript
checkUserExists(email, username, excludeUserId)
  // يتحقق من وجود المستخدم
  // يُستخدم قبل التسجيل/التحديث

createUser(userData)
  // ينشئ مستخدم جديد
  // يتحقق من عدم التكرار
  // يُستخدم في register و createUserByAdmin
```

### Report Helper - `utils/reportHelper.js`

```javascript
checkReportOwnership(report, userId)
  // يتحقق من ملكية التقرير
  // يرمي خطأ إن لم يكن المالك

checkAdminAccess(user)
  // يتحقق من صلاحيات الإدمن
  // يرمي خطأ إن لم يكن إدمن

findReportById(reportId, populateUser)
  // يجلب التقرير بالـ ID
  // يمكن تحميل بيانات المستخدم معه
```

---

## 📊 تدفق البيانات الكامل

### مثال 1: رفع ملف وتوليد تقرير

```
┌─────────────────┐
│  المستخدم      │
│  يرفع ملف CSV  │
└────────┬────────┘
         ↓
┌────────────────────────────┐
│ POST /api/reports/upload   │
│ Multer يحفظ في /uploads    │
└────────┬───────────────────┘
         ↓
┌──────────────────────────────┐
│ reportController.uploadFile()│
│ reportService.processFile()  │
│ - يقرأ CSV                   │
│ - يحول لـ JSON               │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────┐
│ حفظ في MongoDB           │
│ Report { data: [...] }   │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ إرجاع reportId          │
└────────┬─────────────────┘
         ↓
┌──────────────────────────────────┐
│ المستخدم يطلب توليد تقرير       │
│ POST /api/reports/generate/:id  │
│ Body: { prompt: "..." }         │
└────────┬─────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ reportController.generateAReport() │
│ reportService.generateReport()     │
│ - يُرسل لـ Groq API               │
│ - Prompt + Data Sample            │
└────────┬───────────────────────────┘
         ↓
┌──────────────────────────────┐
│ Groq API يُحلل ويُولد       │
│ تقرير بالعربية والإنجليزية │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────┐
│ حفظ التقرير في DB        │
│ status: 'completed'      │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ إرجاع التقرير للمستخدم  │
└──────────────────────────┘
```

### مثال 2: تحميل PDF

```
┌─────────────────────────────────┐
│ GET /api/reports/:id/download   │
└────────┬────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ reportController.downloadReport()│
│ - جلب التقرير من DB              │
│ - التحقق من الملكية              │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────┐
│ reportService.generatePDF()  │
│ - تحويل Markdown → HTML      │
│ - إضافة CSS                  │
│ - دعم العربية                │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────┐
│ html-pdf-node            │
│ توليد PDF Buffer         │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ إرسال الملف للتحميل     │
│ Content-Type: pdf        │
└──────────────────────────┘
```

### مثال 3: نظام المصادقة

```
┌──────────────────────┐
│ POST /api/auth/login │
│ { email, password }  │
└────────┬─────────────┘
         ↓
┌────────────────────────────┐
│ authController.login()     │
│ - البحث عن المستخدم       │
│ - التحقق من كلمة المرور   │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│ generateToken(userId)      │
│ JWT صالح لـ 7 أيام        │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│ إرجاع { user, token }     │
└────────┬───────────────────┘
         ↓
┌────────────────────────────────┐
│ Client يحفظ في localStorage  │
│ localStorage.setItem('token') │
└────────┬───────────────────────┘
         ↓
┌─────────────────────────────────┐
│ في كل طلب:                     │
│ Header: "Authorization: Bearer" │
└────────┬────────────────────────┘
         ↓
┌────────────────────────────┐
│ middleware/authenticate    │
│ - استخراج Token           │
│ - التحقق منه              │
│ - تحميل المستخدم في req  │
└────────┬───────────────────┘
         ↓
┌────────────────────────┐
│ Controller يستخدم     │
│ req.user               │
└────────────────────────┘
```

---

## 🔐 نظام الأمان

### 1. تشفير كلمات المرور
- استخدام `bcryptjs` مع salt rounds = 10
- التشفير التلقائي قبل الحفظ (pre-save hook)
- عدم إرجاع كلمة المرور في الـ API

### 2. JWT Authentication
- Tokens صالحة لـ 7 أيام
- التحقق في كل طلب
- إلغاء الصلاحية عند تعطيل الحساب

### 3. الصلاحيات (Authorization)
- User: يرى ويُعدل بياناته فقط
- Admin: وصول كامل

### 4. التحقق من المدخلات
- Mongoose schema validation
- File type validation (CSV/Excel فقط)
- File size limits (10MB للبيانات، 5MB للصور)
- Email format validation

---

## 🎯 الميزات الرئيسية

### ✅ نظام المستخدمين
- تسجيل وتسجيل دخول
- ملف شخصي كامل
- صور شخصية
- تغيير كلمة المرور
- أدوار (User/Admin)

### ✅ معالجة الملفات
- رفع CSV/Excel
- استخراج البيانات تلقائياً
- دعم ملفات حتى 10MB
- تخزين آمن

### ✅ الذكاء الاصطناعي
- تكامل مع Groq API (Llama 3.3 70B)
- تكامل مع Hugging Face (احتياطي)
- تقارير ثنائية اللغة (عربي/إنجليزي)
- نظام Fallback عند فشل الـ API

### ✅ التقارير
- توليد تلقائي
- حفظ في قاعدة البيانات
- تحميل كـ PDF
- دعم كامل للعربية في PDF

### ✅ لوحة تحكم الإدمن
- إدارة المستخدمين (CRUD)
- عرض جميع التقارير
- حذف أي تقرير
- محادثة مباشرة مع الـ AI

---

## 🛠️ التقنيات المستخدمة

### Backend Framework
- **Express.js** - إطار عمل الويب
- **Node.js** - بيئة التشغيل

### قاعدة البيانات
- **MongoDB** - قاعدة بيانات NoSQL
- **Mongoose** - ODM للتعامل مع MongoDB

### المصادقة والأمان
- **JWT** - JSON Web Tokens
- **bcryptjs** - تشفير كلمات المرور
- **CORS** - حماية الطلبات

### معالجة الملفات
- **Multer** - رفع الملفات
- **XLSX** - قراءة Excel
- **fs-extra** - عمليات الملفات

### الذكاء الاصطناعي
- **Groq API** - Llama 3.3 70B
- **Hugging Face** - Mistral 7B (احتياطي)
- **Axios** - طلبات HTTP

### توليد PDF
- **html-pdf-node** - تحويل HTML إلى PDF
- دعم كامل للعربية والإنجليزية

---

## 📝 متغيرات البيئة (`config.env`)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-reports

# Server
PORT=5000

# JWT
JWT_SECRET=your_jwt_secret_key_here

# AI APIs
GROQ_API_KEY=your_groq_api_key_here
HF_TOKEN=your_huggingface_token_here

# Upload Directory
UPLOAD_DIR=uploads
```

---

## 🚀 كيفية عمل المشروع

### 1. تثبيت المكتبات
```bash
cd server
npm install
```

### 2. إعداد قاعدة البيانات
```bash
# تأكد من تشغيل MongoDB
mongod
```

### 3. إعداد متغيرات البيئة
```bash
# انسخ config.env.example إلى config.env
# ثم عدل القيم
```

### 4. تشغيل السيرفر
```bash
npm run dev
```

السيرفر سيعمل على `http://localhost:5000`

---

## 🔍 اختبار الـ API

### مثال: تسجيل مستخدم جديد
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "ahmed",
  "email": "ahmed@example.com",
  "password": "123456",
  "firstName": "Ahmed",
  "lastName": "Ali"
}
```

### مثال: رفع ملف
```bash
POST http://localhost:5000/api/reports/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: data.csv
```

### مثال: توليد تقرير
```bash
POST http://localhost:5000/api/reports/generate/:reportId
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "ما هو متوسط الدرجات للطلاب؟"
}
```

---

## 📈 تحسينات مستقبلية محتملة

- [ ] WebSocket للتقارير الحية
- [ ] نظام إشعارات
- [ ] تصدير لصيغ أخرى (Excel, Word)
- [ ] رسوم بيانية تفاعلية
- [ ] API Rate Limiting
- [ ] Caching مع Redis
- [ ] Logging مع Winston
- [ ] Unit Tests مع Jest
- [ ] Docker containerization
- [ ] CI/CD Pipeline

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام التعليمي والتجاري.

---

## 👨‍💻 المطور

تم تطوير هذا المشروع بواسطة فريق العمل مع التركيز على:
- ✅ كود نظيف وقابل للصيانة
- ✅ معمارية قابلة للتوسع
- ✅ أمان عالي
- ✅ دعم كامل للعربية

---

**آخر تحديث:** أكتوبر 2025

