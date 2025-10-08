# 🛡️ Rate Limiting - حماية API

## 📋 نظرة عامة

تم إضافة نظام Rate Limiting شامل لحماية الـ API من:
- ✅ الاستخدام المفرط
- ✅ هجمات DDoS
- ✅ محاولات Brute Force
- ✅ إساءة استخدام الموارد

---

## 🔧 التكوينات المختلفة

### 1️⃣ General Limiter (حد عام)

**المسار:** جميع مسارات `/api/*`

```javascript
windowMs: 15 دقيقة
max: 100 طلب
```

**الحماية:**
- يحمي من الطلبات المفرطة العامة
- 100 طلب كحد أقصى كل 15 دقيقة لكل IP

---

### 2️⃣ Auth Limiter (حد المصادقة)

**المسارات:**
- `POST /api/auth/register`
- `POST /api/auth/login`

```javascript
windowMs: 15 دقيقة
max: 5 محاولات
skipSuccessfulRequests: true
```

**الحماية:**
- يمنع هجمات Brute Force على تسجيل الدخول
- 5 محاولات فاشلة فقط كل 15 دقيقة
- المحاولات الناجحة لا تُحسب

---

### 3️⃣ Upload Limiter (حد رفع الملفات)

**المسار:**
- `POST /api/reports/upload`

```javascript
windowMs: 1 ساعة
max: 10 ملفات
```

**الحماية:**
- يمنع إغراق السيرفر بالملفات
- 10 ملفات كحد أقصى في الساعة

---

### 4️⃣ AI Limiter (حد توليد التقارير)

**المسار:**
- `POST /api/reports/generate/:reportId`

```javascript
windowMs: 1 ساعة
max: 20 تقرير
```

**الحماية:**
- يحمي من الاستهلاك المفرط لـ API الذكاء الاصطناعي
- 20 تقرير كحد أقصى في الساعة
- يوفر تكاليف استخدام AI APIs

---

### 5️⃣ AI Chat Limiter (حد محادثة AI)

**المسار:**
- `POST /api/ai/chat`

```javascript
windowMs: 1 ساعة
max: 50 رسالة
```

**الحماية:**
- يحمي من الاستخدام المفرط للمحادثة المباشرة
- للإدمن فقط
- 50 رسالة كحد أقصى في الساعة

---

### 6️⃣ Download Limiter (حد التحميل)

**المسار:**
- `GET /api/reports/:reportId/download`

```javascript
windowMs: 15 دقيقة
max: 30 تحميل
```

**الحماية:**
- يمنع تحميل PDF المتكرر بشكل مفرط
- 30 تحميل كحد أقصى كل 15 دقيقة

---

### 7️⃣ Admin Limiter (حد العمليات الإدارية)

**المسارات:**
- `GET /api/auth/admin/users`
- `POST /api/auth/admin/users`
- `PUT /api/auth/admin/users/:userId`
- `DELETE /api/auth/admin/users/:userId`
- `GET /api/reports/admin/all`
- `DELETE /api/reports/admin/:reportId`

```javascript
windowMs: 15 دقيقة
max: 50 عملية
```

**الحماية:**
- يحمي العمليات الحساسة
- للإدمن فقط
- 50 عملية كحد أقصى كل 15 دقيقة

---

## 📊 جدول ملخص

| النوع | المسارات | الفترة | الحد الأقصى |
|------|----------|--------|-------------|
| 🌐 **عام** | `/api/*` | 15 دقيقة | 100 |
| 🔐 **مصادقة** | `login`, `register` | 15 دقيقة | 5 |
| 📤 **رفع** | `upload` | 1 ساعة | 10 |
| 🤖 **AI تقارير** | `generate` | 1 ساعة | 20 |
| 💬 **AI محادثة** | `ai/chat` | 1 ساعة | 50 |
| 📥 **تحميل** | `download` | 15 دقيقة | 30 |
| 👑 **إدمن** | `admin/*` | 15 دقيقة | 50 |

---

## 🔍 كيف يعمل؟

### 1. التتبع بالـ IP

```javascript
Client IP: 192.168.1.100
  ↓
First Request → Counter: 1
  ↓
Second Request → Counter: 2
  ↓
...
  ↓
101st Request → ❌ Rate Limit Exceeded
```

### 2. الرد عند التجاوز

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again after 15 minutes.",
  "message_ar": "عدد كبير من الطلبات من هذا العنوان، يرجى المحاولة بعد 15 دقيقة."
}
```

**Status Code:** `429 Too Many Requests`

### 3. Headers المضافة

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1696789812
```

---

## 📝 أمثلة عملية

### مثال 1: محاولة تسجيل دخول متكررة

```bash
# المحاولة 1
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "wrong"}'
# ✅ يعمل

# المحاولة 2-5
# ... نفس الطلب
# ✅ يعمل

# المحاولة 6
# ❌ 429 Too Many Requests
# {
#   "success": false,
#   "message": "Too many authentication attempts, please try again after 15 minutes."
# }
```

### مثال 2: رفع ملفات متكرر

```bash
# الملف 1-10
curl -X POST http://localhost:5000/api/reports/upload \
  -F "file=@data.csv"
# ✅ يعمل

# الملف 11
# ❌ 429 Too Many Requests
# يجب الانتظار 1 ساعة
```

### مثال 3: توليد تقارير بشكل مفرط

```bash
# التقرير 1-20
curl -X POST http://localhost:5000/api/reports/generate/123 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "تحليل البيانات"}'
# ✅ يعمل

# التقرير 21
# ❌ 429 Too Many Requests
# {
#   "success": false,
#   "message": "Too many AI report generations, please try again after 1 hour."
# }
```

---

## 🧪 اختبار Rate Limiting

### اختبار 1: الحد العام

```javascript
// اختبار 100 طلب متتالي
for (let i = 0; i < 101; i++) {
  await fetch('http://localhost:5000/api/health');
}
// الطلب رقم 101 سيفشل مع 429
```

### اختبار 2: حد المصادقة

```javascript
// اختبار 5 محاولات تسجيل دخول فاشلة
for (let i = 0; i < 6; i++) {
  await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
  });
}
// المحاولة السادسة ستفشل مع 429
```

---

## ⚙️ التخصيص

### تغيير الحدود

في `server/middleware/rateLimiter.js`:

```javascript
// مثال: زيادة الحد العام إلى 200
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // ← غيّر هنا
  // ...
});
```

### إضافة Whitelist

```javascript
const generalLimiter = rateLimit({
  // ...
  skip: (req) => {
    // تجاهل IPs محددة
    const whitelist = ['127.0.0.1', '::1'];
    return whitelist.includes(req.ip);
  }
});
```

### Rate Limiting بناءً على المستخدم

```javascript
const userBasedLimiter = rateLimit({
  // ...
  keyGenerator: (req) => {
    // استخدم user ID بدلاً من IP
    return req.user?._id || req.ip;
  }
});
```

---

## 🔐 الأمان الإضافي

### 1. مع Proxy/Load Balancer

```javascript
// في index.js
app.set('trust proxy', 1);
```

### 2. تخزين في Redis (للإنتاج)

```bash
npm install rate-limit-redis redis
```

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rate-limit:'
  }),
  // ...
});
```

---

## 📈 المراقبة

### Logging

```javascript
const limiter = rateLimit({
  // ...
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ /* ... */ });
  }
});
```

### Metrics

يمكن دمج مع أدوات مثل:
- **Prometheus** - لجمع المقاييس
- **Grafana** - للتصور
- **Winston** - للـ logging المتقدم

---

## 🚀 أفضل الممارسات

### ✅ DO (افعل)

1. **استخدم حدود مختلفة** - لكل نوع عملية
2. **راقب الاستخدام** - تتبع الطلبات
3. **أضف رسائل واضحة** - بالعربية والإنجليزية
4. **استخدم Redis** - في الإنتاج
5. **اختبر الحدود** - قبل النشر

### ❌ DON'T (لا تفعل)

1. **لا تضع حدود صارمة جداً** - تجنب إزعاج المستخدمين
2. **لا تنسى Whitelist** - للـ IPs الموثوقة
3. **لا تعتمد على IP فقط** - استخدم User ID أيضاً
4. **لا تهمل المراقبة** - راقب الأداء
5. **لا تنسى التوثيق** - وثق كل التغييرات

---

## 🆘 استكشاف الأخطاء

### مشكلة: "كل الطلبات محظورة"

**الحل:**
```javascript
// تحقق من trust proxy
app.set('trust proxy', 1);

// أو زد الحد
max: 200 // بدلاً من 100
```

### مشكلة: "Rate limit لا يعمل"

**الحل:**
```javascript
// تأكد من الترتيب الصحيح
app.use('/api/', generalLimiter); // قبل
app.use('/api/auth', authRoutes);  // المسارات
```

### مشكلة: "IPs مشتركة محظورة"

**الحل:**
```javascript
// استخدم User ID بدلاً من IP
keyGenerator: (req) => req.user?._id || req.ip
```

---

## 📚 موارد إضافية

- [express-rate-limit Documentation](https://github.com/nfriedly/express-rate-limit)
- [OWASP Rate Limiting](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [Redis Rate Limiting](https://redis.io/docs/reference/patterns/rate-limiter/)

---

## 📊 إحصائيات

```
✅ 7 أنواع مختلفة من Rate Limiters
✅ حماية 15+ API endpoint
✅ دعم كامل للعربية والإنجليزية
✅ معايير HTTP القياسية (429)
✅ Headers معيارية (RateLimit-*)
```

---

**آخر تحديث:** 8 أكتوبر 2025

**الحالة:** ✅ مُفعّل ويعمل

---

<div align="center">

### 🛡️ API محمي بالكامل ضد الاستخدام المفرط

</div>

