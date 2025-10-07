# إعداد AI API المجاني

## 🚀 Groq API (الأسرع - موصى به)

### الخطوات:
1. اذهب إلى [Groq Console](https://console.groq.com/)
2. أنشئ حساب مجاني (Google/GitHub)
3. اذهب إلى [API Keys](https://console.groq.com/keys)
4. اضغط "Create API Key"
5. انسخ الـ key
6. ضعه في `server/config.env`:

```env
GROQ_API_KEY=gsk_your_key_here
```

### المميزات:
- ✅ **Llama 3.3 70B** - نموذج قوي جداً
- ✅ **سرعة فائقة** - أسرع من أي API مجاني آخر
- ✅ **مجاني تماماً** - لا حاجة لبطاقة ائتمان
- ✅ **30 طلب/دقيقة** - كافي للاستخدام الشخصي
- ✅ **دقة عالية** في التحليل

---

## 🤖 Hugging Face API (بديل)

### الخطوات:
1. اذهب إلى [Hugging Face](https://huggingface.co/)
2. أنشئ حساب مجاني
3. اذهب إلى [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. أنشئ token جديد
5. انسخ الـ token
6. ضعه في `server/config.env`:

```env
HF_TOKEN=your_token_here
```

### المميزات:
- ✅ **Kimi-K2-Instruct-0905** - نموذج متقدم للتحليل
- ✅ **Router API** - أداء أفضل من Inference API
- ✅ **30,000 طلب مجاني شهرياً**
- ✅ **لا حاجة لبطاقة ائتمان**
- ✅ **سرعة عالية ودقة ممتازة**
- ✅ **دعم 2000 token** للاستجابة

### مثال الاستخدام:
```javascript
// API call example
const response = await axios.post(
  'https://router.huggingface.co/v1/chat/completions',
  {
    model: 'moonshotai/Kimi-K2-Instruct-0905',
    messages: [
      {
        role: 'user',
        content: 'Analyze this data and provide insights...'
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 🚀 بدائل أخرى

### Groq API (سريع جداً)
1. اذهب إلى [Groq](https://console.groq.com/)
2. أنشئ حساب مجاني
3. احصل على API key
4. غيّر في `reportService.js`:

```javascript
const response = await axios.post(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: fullPrompt }],
    temperature: 0.7,
    max_tokens: 1000
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### OpenAI API (محدود)
1. اذهب إلى [OpenAI](https://platform.openai.com/)
2. أنشئ حساب
3. احصل على $5 رصيد مجاني
4. غيّر في `reportService.js`:

```javascript
const response = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: fullPrompt }],
    temperature: 0.7,
    max_tokens: 1000
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 🔧 التبديل بين APIs

لتغيير API، غيّر فقط:
1. متغير البيئة في `config.env`
2. دالة `generateReport` في `reportService.js`

النظام يدعم fallback تلقائي إذا فشل API!
