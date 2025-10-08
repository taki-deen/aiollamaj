const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Configurations
 * حماية الـ API من الاستخدام المفرط والهجمات
 */

// 1. حد عام لكل الطلبات
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    message_ar: 'عدد كبير من الطلبات من هذا العنوان، يرجى المحاولة بعد 15 دقيقة.'
  },
  standardHeaders: true, // إرجاع معلومات rate limit في `RateLimit-*` headers
  legacyHeaders: false, // تعطيل `X-RateLimit-*` headers القديمة
});

// 2. حد للمصادقة (تسجيل دخول/تسجيل)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات تسجيل دخول
  skipSuccessfulRequests: true, // لا تحسب الطلبات الناجحة
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    message_ar: 'محاولات تسجيل دخول كثيرة، يرجى المحاولة بعد 15 دقيقة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. حد لرفع الملفات
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 10, // حد أقصى 10 رفع ملف في الساعة
  message: {
    success: false,
    message: 'Too many file uploads, please try again after 1 hour.',
    message_ar: 'رفعت عدد كبير من الملفات، يرجى المحاولة بعد ساعة واحدة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. حد لتوليد التقارير بالـ AI
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 20, // حد أقصى 20 تقرير في الساعة
  message: {
    success: false,
    message: 'Too many AI report generations, please try again after 1 hour.',
    message_ar: 'عدد كبير من طلبات توليد التقارير، يرجى المحاولة بعد ساعة واحدة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. حد للـ AI Chat (للإدمن)
const aiChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ساعة
  max: 50, // حد أقصى 50 رسالة في الساعة
  message: {
    success: false,
    message: 'Too many AI chat requests, please try again after 1 hour.',
    message_ar: 'عدد كبير من رسائل الذكاء الاصطناعي، يرجى المحاولة بعد ساعة واحدة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. حد للـ PDF Downloads
const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 30, // حد أقصى 30 تحميل PDF
  message: {
    success: false,
    message: 'Too many download requests, please try again after 15 minutes.',
    message_ar: 'عدد كبير من طلبات التحميل، يرجى المحاولة بعد 15 دقيقة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 7. حد صارم للـ Admin Operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // حد أقصى 50 عملية إدارية
  message: {
    success: false,
    message: 'Too many admin operations, please try again after 15 minutes.',
    message_ar: 'عدد كبير من العمليات الإدارية، يرجى المحاولة بعد 15 دقيقة.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// تصدير جميع الـ Limiters
module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  aiChatLimiter,
  downloadLimiter,
  adminLimiter
};

