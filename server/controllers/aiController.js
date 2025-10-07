const axios = require('axios');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { checkAdminAccess } = require('../utils/reportHelper');

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    checkAdminAccess(req.user);

    const apiKey = process.env.GROQ_API_KEY || process.env.HF_TOKEN;
    
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'your_huggingface_token_here') {
      return sendError(res, 'AI service is not configured', 503);
    }

    let response;
    
    if (process.env.GROQ_API_KEY) {
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for an admin dashboard. You help with data analysis, insights, and general questions. Be concise and professional.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      return sendSuccess(res, {
        response: aiResponse,
        model: 'llama-3.3-70b-versatile'
      });
    } else {
      response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          inputs: message,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = Array.isArray(response.data) 
        ? response.data[0].generated_text 
        : response.data.generated_text || 'No response generated';

      return sendSuccess(res, {
        response: aiResponse,
        model: 'mistral-7b-instruct'
      });
    }

  } catch (error) {
    console.error('AI Chat Error:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Error:', error.response.data);
    }

    const statusCode = error.message.includes('Admin access') ? 403 : 500;
    return sendError(res, error.message || 'Failed to get AI response. Please try again.', statusCode, error);
  }
};

module.exports = {
  chatWithAI
};

