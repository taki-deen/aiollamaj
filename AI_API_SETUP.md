# إعداد AI API المجاني

## 🤖 Hugging Face API (موصى به)

### الخطوات:
1. اذهب إلى [Hugging Face](https://huggingface.co/)
2. أنشئ حساب مجاني
3. اذهب إلى [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. أنشئ token جديد
5. انسخ الـ token
6. ضعه في `server/config.env`:

```env
HUGGINGFACE_API_KEY=your_token_here
```

### المميزات:
- ✅ 30,000 طلب مجاني شهرياً
- ✅ لا حاجة لبطاقة ائتمان
- ✅ نماذج قوية ومتعددة
- ✅ سرعة جيدة

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
