const nodemailer = require('nodemailer');
const crypto = require('crypto');

// إعداد Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// اختبار الاتصال
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ خطأ في إعداد Gmail:', error.message);
  } else {
    console.log('✅ Gmail جاهز لإرسال الإيميلات');
  }
});

/**
 * إرسال OTP للتحقق من البريد
 */
async function sendVerificationOTP(user, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '🔐 كود التحقق - Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .rtl { direction: rtl; text-align: right; }
            .ltr { direction: ltr; text-align: left; }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning-box {
              background: #fef3c7;
              border-right: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Arabic Version -->
            <div class="rtl">
              <div class="header">
                <h1>🎉 مرحباً ${user.firstName}!</h1>
                <p>شكراً لانضمامك إلى ${process.env.APP_NAME || 'AI Reports'}</p>
              </div>
              <div class="content">
                <p>نحن سعداء بتسجيلك معنا! لإكمال التسجيل، يرجى إدخال كود التحقق التالي:</p>
                
                <center>
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 48px; font-weight: bold; letter-spacing: 10px; padding: 30px; border-radius: 12px; margin: 30px 0; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </center>
                
                <div class="warning-box">
                  <strong>⚠️ ملاحظة مهمة:</strong>
                  <ul style="margin: 10px 0; padding-right: 20px;">
                    <li>هذا الكود صالح لمدة 10 دقائق فقط</li>
                    <li>لا تشارك هذا الكود مع أي شخص</li>
                    <li>إذا لم تطلب هذا الكود، يرجى تجاهل هذا البريد</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

            <!-- English Version -->
            <div class="ltr">
              <div class="header">
                <h1>🎉 Welcome ${user.firstName}!</h1>
                <p>Thank you for joining ${process.env.APP_NAME || 'AI Reports'}</p>
              </div>
              <div class="content">
                <p>We're excited to have you! To complete your registration, please enter the following verification code:</p>
                
                <center>
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 48px; font-weight: bold; letter-spacing: 10px; padding: 30px; border-radius: 12px; margin: 30px 0; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </center>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <strong>⚠️ Important Notes:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This code expires in 10 minutes</li>
                    <li>Don't share this code with anyone</li>
                    <li>If you didn't request this code, please ignore this email</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>© 2025 ${process.env.APP_NAME || 'AI Reports'}. All rights reserved.</p>
              <p>إذا لم تقم بالتسجيل، يرجى تجاهل هذا البريد.</p>
              <p>If you didn't register, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال OTP إلى:', user.email, '- الكود:', otp);
    return info;
    
  } catch (error) {
    console.error('❌ خطأ في إرسال OTP:', error.message);
    throw error;
  }
}

/**
 * إرسال إيميل التحقق (للتوافق مع إعادة التعيين)
 */
async function sendVerificationEmail(user, verificationUrl) {
  // هذه الدالة للتوافق مع نظام إعادة تعيين كلمة المرور
  // يمكن حذفها إذا لم تكن مستخدمة
  return sendVerificationOTP(user, '000000');
}

/**
 * إرسال إشعار توليد تقرير
 */
async function sendReportGeneratedEmail(user, report) {
  try {
    const reportUrl = `${process.env.CLIENT_URL}/reports/${report._id}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '🎉 تم توليد تقريرك - Your Report is Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Arabic -->
            <div dir="rtl" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>🎉 مرحباً ${user.firstName}!</h1>
              <p style="font-size: 18px;">تقريرك جاهز الآن!</p>
            </div>
            
            <div dir="rtl" style="background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>تم توليد تقريرك بنجاح باستخدام الذكاء الاصطناعي! 🤖</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10b981;">
                <p><strong>📁 اسم الملف:</strong> ${report.filename}</p>
                <p><strong>📅 التاريخ:</strong> ${new Date(report.generatedAt || report.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <center>
                <a href="${reportUrl}" style="display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                  📊 عرض التقرير
                </a>
              </center>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

            <!-- English -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>🎉 Hello ${user.firstName}!</h1>
              <p style="font-size: 18px;">Your report is ready!</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Your AI-powered report has been generated successfully! 🤖</p>
              
              <center>
                <a href="${reportUrl}" style="display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  📊 View Report
                </a>
              </center>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
              <p>© 2025 ${process.env.APP_NAME || 'AI Reports'}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال إشعار التقرير إلى:', user.email);
    return info;
    
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار التقرير:', error.message);
    // لا نرمي خطأ هنا حتى لا يفشل توليد التقرير
  }
}

/**
 * إرسال رابط إعادة تعيين كلمة المرور
 */
async function sendPasswordResetEmail(user, resetUrl) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '🔐 إعادة تعيين كلمة المرور - Reset Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Arabic -->
            <div dir="rtl" style="background: #ef4444; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>🔐 إعادة تعيين كلمة المرور</h1>
            </div>
            
            <div dir="rtl" style="background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>مرحباً ${user.firstName},</p>
              <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
              
              <center>
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                  🔑 إعادة تعيين كلمة المرور
                </a>
              </center>
              
              <div style="background: #fee2e2; border-right: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>⚠️ تنبيه أمني:</strong></p>
                <ul>
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد</li>
                  <li>لن يتمكن أحد من الوصول لحسابك بدون هذا الرابط</li>
                </ul>
              </div>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

            <!-- English -->
            <div style="background: #ef4444; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>🔐 Reset Your Password</h1>
            </div>
            
            <div style="background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.firstName},</p>
              <p>We received a request to reset your password.</p>
              
              <center>
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  🔑 Reset Password
                </a>
              </center>
              
              <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul>
                  <li>This link expires in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your account is secure without this link</li>
                </ul>
              </div>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
              <p>© 2025 ${process.env.APP_NAME || 'AI Reports'}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال رابط إعادة التعيين إلى:', user.email);
    return info;
    
  } catch (error) {
    console.error('❌ خطأ في إرسال رابط إعادة التعيين:', error.message);
    throw error;
  }
}

/**
 * توليد Token آمن
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * توليد OTP (6 أرقام)
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * إرسال التقرير بالبريد الإلكتروني مع PDF مرفق
 */
async function sendReportByEmail(user, report, pdfBuffer) {
  try {
    const reportLanguage = report.language || 'ar';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: reportLanguage === 'ar' 
        ? `📊 تقريرك: ${report.filename}` 
        : `📊 Your Report: ${report.filename}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            ${reportLanguage === 'ar' ? `
            <!-- Arabic -->
            <div dir="rtl" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>📊 تقريرك جاهز يا ${user.firstName}!</h1>
            </div>
            
            <div dir="rtl" style="background: #f5f3ff; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>مرحباً ${user.firstName},</p>
              <p>كما طلبت، إليك تقرير التحليل الخاص بك مرفقاً بهذا البريد الإلكتروني! 📎</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #6366f1;">
                <p><strong>📁 الملف:</strong> ${report.filename}</p>
                ${report.prompt ? `<p><strong>💬 الطلب:</strong> ${report.prompt}</p>` : ''}
                <p><strong>📅 تاريخ التوليد:</strong> ${new Date(report.generatedAt || report.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div style="background: #dbeafe; border-right: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>📎 المرفق:</strong></p>
                <p>تجد التقرير الكامل بصيغة PDF مرفقاً مع هذا البريد.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                💡 نصيحة: يمكنك تحميل التقرير من حسابك في أي وقت!
              </p>
            </div>
            ` : `
            <!-- English -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1>📊 Your Report is Ready, ${user.firstName}!</h1>
            </div>
            
            <div style="background: #f5f3ff; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.firstName},</p>
              <p>As requested, here's your analysis report attached to this email! 📎</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                <p><strong>📁 File:</strong> ${report.filename}</p>
                ${report.prompt ? `<p><strong>💬 Request:</strong> ${report.prompt}</p>` : ''}
                <p><strong>📅 Generated:</strong> ${new Date(report.generatedAt || report.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>📎 Attachment:</strong></p>
                <p>You'll find the complete report in PDF format attached to this email.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                💡 Tip: You can download the report from your account anytime!
              </p>
            </div>
            `}

            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
              <p>© 2025 ${process.env.APP_NAME || 'AI Reports'}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `${report.filename}_report.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال التقرير إلى:', user.email);
    return info;
    
  } catch (error) {
    console.error('❌ خطأ في إرسال التقرير بالإيميل:', error.message);
    throw error;
  }
}

/**
 * اختبار سريع (للتطوير فقط)
 */
async function testEmail() {
  try {
    const testMail = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: '✅ اختبار Gmail - Test Email',
      html: `
        <div style="font-family: Arial; padding: 20px; text-align: center;">
          <h1 style="color: #10b981;">✅ Gmail يعمل بنجاح!</h1>
          <p>Gmail is working successfully!</p>
          <p style="color: #6b7280; font-size: 12px;">
            ${new Date().toLocaleString('ar-EG')}
          </p>
        </div>
      `
    });
    console.log('✅ تم إرسال إيميل الاختبار:', testMail.messageId);
    return testMail;
  } catch (error) {
    console.error('❌ فشل اختبار الإيميل:', error.message);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  sendVerificationOTP,
  sendReportGeneratedEmail,
  sendReportByEmail,
  sendPasswordResetEmail,
  generateToken,
  generateOTP,
  testEmail
};

