# 🏗️ Backend Architecture - AI Reports System

> **Comprehensive system for data analysis and report generation using Artificial Intelligence**

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Project Structure](#-project-structure)
3. [Core Layers](#-core-layers)
4. [Database Models](#-database-models)
5. [API Endpoints](#-api-endpoints)
6. [Controllers](#-controllers)
7. [Services](#-services)
8. [Middleware](#-middleware)
9. [Utility Functions](#-utility-functions)
10. [Data Flow](#-data-flow)
11. [Security](#-security)
12. [Technologies Used](#-technologies-used)
13. [Setup & Running](#-setup--running)

---

## 🌟 Overview

### What is the Project?

A comprehensive web system that allows users to:
- 📤 Upload data files (CSV, Excel)
- 🤖 Generate intelligent analytical reports using AI
- 🌐 Choose report language (Arabic or English)
- 📊 Display reports in professional format
- 📄 Download reports as PDF files (RTL for Arabic, LTR for English)
- 📧 Send reports via email with attached PDF
- 🔐 Email verification with OTP system (6 digits)
- 🔑 Password reset via email
- 👥 User and permission management
- 🛡️ API protection with Rate Limiting

### Key Features

| Feature | Description |
|---------|-------------|
| 🌐 **Multi-language** | Reports in Arabic or English by choice |
| 🔐 **Secure** | JWT + Password encryption + OTP Email Verification |
| 🚀 **Fast** | Instant file processing |
| 🤖 **Smart** | Integration with Groq Llama 3.3 70B & Hugging Face |
| 📧 **Email Integration** | Gmail SMTP with notifications and report sending |
| 🛡️ **Rate Limiting** | Comprehensive protection against excessive use |
| 📱 **Flexible** | Scalable REST API |
| 🎨 **React Router** | URL routing with optimized navigation |

---

## 📂 Project Structure

```
server/
│
├── 📄 index.js                      # Main entry point
├── 🔧 config.env                    # Environment variables
│
├── 📁 models/                       # MongoDB Models (Mongoose)
│   ├── User.js                     # User data
│   ├── Report.js                   # Report data
│   ├── Comment.js                  # Comments
│   └── Settings.js                 # System settings
│
├── 📁 controllers/                  # Request processing logic
│   ├── authController.js           # Authentication & Users
│   ├── reportController.js         # Reports
│   ├── commentController.js        # Comments
│   └── aiController.js             # Artificial Intelligence
│
├── 📁 routes/                       # API Routes
│   ├── auth.js                     # /api/auth/*
│   ├── reports.js                  # /api/reports/*
│   ├── comments.js                 # /api/comments/*
│   └── ai.js                       # /api/ai/*
│
├── 📁 middleware/                   # Verification middleware
│   ├── auth.js                     # JWT Authentication
│   └── rateLimiter.js              # Rate Limiting (7 types)
│
├── 📁 services/                     # Complex operations logic
│   ├── reportService.js            # File processing + AI + PDF
│   └── emailService.js             # Gmail SMTP + OTP + Notifications
│
├── 📁 utils/                        # Reusable utility functions
│   ├── responseHelper.js           # Unified API responses
│   ├── userHelper.js               # User operations
│   └── reportHelper.js             # Report operations
│
└── 📁 uploads/                      # Uploaded files
    ├── avatars/                    # Profile pictures
    └── data files/                 # CSV/Excel files
```

---

## 🧱 Core Layers

### Enhanced MVC Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                        │
│                   HTTP Requests                          │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                     ROUTES LAYER                         │
│  - Define routes (Endpoints)                             │
│  - Link routes to Controllers                            │
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
│  - Receive data from Request                             │
│  - Call appropriate Services                             │
│  - Return Response                                       │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                          │
│  - Complex operations logic                              │
│  - File processing                                       │
│  - AI APIs integration                                   │
│  - PDF generation                                        │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   MODELS LAYER                           │
│  - Data definition (Schema)                              │
│  - Data validation                                       │
│  - MongoDB interaction                                   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                             │
│                    MongoDB                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Models

### 1. User Model (`models/User.js`)

**Purpose:** Store user data and manage authentication

```javascript
{
  _id: ObjectId,                    // Unique identifier
  username: String (unique),        // Username
  email: String (unique),           // Email address
  password: String (hashed),        // Encrypted password
  firstName: String,                // First name
  lastName: String,                 // Last name
  role: String,                     // Role: 'user' or 'admin'
  isActive: Boolean (default: true),// Account status
  avatarUrl: String,                // Profile picture URL
  
  // Email Verification (OTP System)
  isEmailVerified: Boolean,         // Is email verified?
  emailVerificationOTP: String,     // Verification code (6 digits)
  emailVerificationExpires: Date,   // OTP validity (10 minutes)
  
  // Password Reset
  resetPasswordToken: String,       // Password reset token
  resetPasswordExpires: Date,       // Token validity (1 hour)
  
  // Notification Preferences
  notificationPreferences: {
    email: Boolean,                 // Receive email notifications
    reportGenerated: Boolean,       // Report generation notification
    accountUpdates: Boolean         // Account notifications
  },
  
  lastLogin: Date,                  // Last login
  createdAt: Date (default: now)    // Creation date
}
```

#### Built-in Methods:

```javascript
// 1. Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 2. Hide password when returning
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// 3. Automatically encrypt password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

#### Indexes for Performance:

```javascript
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, isActive: 1 });
```

---

### 2. Report Model (`models/Report.js`)

**Purpose:** Store reports and analyzed data

```javascript
{
  _id: ObjectId,                    // Unique identifier
  filename: String (required),      // Original file name
  filePath: String,                 // File path on server
  data: [Object],                   // Extracted data (JSON)
  prompt: String,                   // User's AI request
  generatedReport: String,          // Generated report (Markdown)
  status: String,                   // pending | processing | completed | error
  userId: ObjectId (ref: 'User'),   // Report owner
  isPublic: Boolean (default: true),  // Is report public? (default public)
  language: String,                 // Report language: 'ar' or 'en'
  
  // Rating System
  ratings: [{
    userId: ObjectId (ref: 'User'), // User who rated
    rating: Number (1-5),           // Rating from 1 to 5
    createdAt: Date                 // Rating date
  }],
  averageRating: Number (0-5),      // Average rating
  totalRatings: Number,             // Number of ratings
  
  // Comments Count
  commentsCount: Number,            // Number of comments (auto-updated)
  
  createdAt: Date (default: now),   // Upload date
  generatedAt: Date                 // Generation date
}
```

#### Built-in Methods:

```javascript
// Calculate average rating
reportSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
    this.totalRatings = this.ratings.length;
  }
};
```

#### Report States:

| State | Description |
|-------|-------------|
| `pending` | Uploaded, awaiting analysis |
| `processing` | Being analyzed by AI |
| `completed` | Successfully generated |
| `error` | Error occurred |

#### Indexes:

```javascript
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ isPublic: 1, status: 1 });
reportSchema.index({ isPublic: 1, averageRating: -1 }); // For sorting by rating
```

---

### 3. Comment Model (`models/Comment.js`)

**Purpose:** Manage comments on public reports

```javascript
{
  _id: ObjectId,                    // Unique identifier
  reportId: ObjectId (ref: 'Report', required), // Related report
  userId: ObjectId (ref: 'User', required),     // Author
  content: String (required, maxlength: 1000),  // Comment content
  isApproved: Boolean (default: false),         // Approval status (for moderation)
  createdAt: Date (default: now),   // Creation date
  updatedAt: Date (default: now)    // Last update date
}
```

#### Features:
- ✅ Approval system (Moderation) - Comments need admin approval
- ✅ Maximum 1000 characters
- ✅ Indexes for performance
- ✅ Auto-update for updatedAt

#### Indexes:

```javascript
commentSchema.index({ reportId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ isApproved: 1 });
```

---

### 4. Settings Model (`models/Settings.js`)

**Purpose:** Manage configurable system settings

```javascript
{
  _id: ObjectId,
  key: String (required, unique),   // Setting key (e.g., 'showRatings')
  value: Mixed (required),          // Value (any type)
  description: String,              // Setting description
  updatedBy: ObjectId (ref: 'User'),// Who updated
  updatedAt: Date (default: now)    // Update date
}
```

#### Static Methods:

```javascript
// Get setting value
Settings.get(key, defaultValue = null)

// Example:
const showRatings = await Settings.get('showRatings', true);

// Set setting value
Settings.set(key, value, userId = null, description = '')

// Example:
await Settings.set('showRatings', false, adminId, 'Disable ratings system');
```

---

## 🌐 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)

#### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (sends OTP) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify OTP (6 digits) |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

**Example - Registration:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "123456",
  "firstName": "John",
  "lastName": "Doe"
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

#### Protected Routes (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile` | View profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/profile/avatar` | Upload profile picture |

#### Admin Routes (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/admin/users` | View all users |
| POST | `/api/auth/admin/users` | Create new user |
| PUT | `/api/auth/admin/users/:id` | Update user |
| DELETE | `/api/auth/admin/users/:id` | Delete user |

---

### 💬 Comments Routes (`/api/comments`)

**Purpose:** Manage comments on reports

#### Comment Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/comments/:reportId` | Add comment | **Required** |
| GET | `/api/comments/:reportId` | Get report comments | Optional* |
| DELETE | `/api/comments/:commentId` | Delete comment | **Required** |
| PATCH | `/api/comments/:commentId/approve` | Approve/Reject (Admin) | **Admin** |
| GET | `/api/comments/admin/all` | All comments (Admin) | **Admin** |

**Note:* Unapproved comments only visible to admin

**Example - Add Comment:**
```javascript
POST /api/comments/6123abc...
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excellent and very useful report!"
}

// Response:
{
  "success": true,
  "message": "Comment added successfully. Waiting for approval.",
  "data": {
    "_id": "789xyz...",
    "content": "Excellent and very useful report!",
    "userId": { ... },
    "isApproved": false,
    "createdAt": "2025-10-09T..."
  }
}
```

**Example - Approve Comment (Admin):**
```javascript
PATCH /api/comments/789xyz.../approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isApproved": true
}

// Response:
{
  "success": true,
  "message": "Comment approved successfully"
}
```

---

### 📊 Reports Routes (`/api/reports`)

#### Report Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/reports/upload` | Upload CSV/Excel file | Optional |
| POST | `/api/reports/generate/:id` | Generate report with AI | Optional |
| GET | `/api/reports/` | View reports | Optional |
| GET | `/api/reports/:id` | View single report | Optional |
| GET | `/api/reports/:id/download` | Download PDF | Optional |
| POST | `/api/reports/:id/email` | Send PDF via email | **Required** |
| GET | `/api/reports/public` | Get public reports (for blog) | Public |
| PATCH | `/api/reports/:id/toggle-public` | Toggle public/private status | Required |
| POST | `/api/reports/:id/rating` | Rate report (1-5) | **Required** |
| GET | `/api/reports/settings/ratings` | Get ratings settings | Public |
| PUT | `/api/reports/:id` | Update report | Required |
| DELETE | `/api/reports/:id` | Delete report | Required |

**Example - Upload File:**
```javascript
POST /api/reports/upload
Content-Type: multipart/form-data
Authorization: Bearer <token> // optional

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

**Example - Generate Report:**
```javascript
POST /api/reports/generate/6123abc...
Content-Type: application/json
Authorization: Bearer <token> // optional

{
  "prompt": "Analyze sales data and give me key statistics",
  "language": "en"  // or "ar"
}

// Response:
{
  "success": true,
  "data": {
    "_id": "6123abc...",
    "generatedReport": "# Sales Analysis\n\n## Statistics...",
    "language": "en",
    "status": "completed",
    "generatedAt": "2025-10-08T..."
  }
}
```

**Example - Rate Report:**
```javascript
POST /api/reports/6123abc.../rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5
}

// Response:
{
  "success": true,
  "message": "Rating added successfully",
  "data": {
    "averageRating": 4.8,
    "totalRatings": 15
  }
}
```

**Restrictions:**
- One user can rate a report only once
- Can update existing rating
- Ratings from 1 to 5 stars only

#### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/admin/all` | View all reports + user data |
| DELETE | `/api/reports/admin/:id` | Delete any report |

---

### 🤖 AI Routes (`/api/ai`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/ai/chat` | Direct chat with AI | Admin only |

**Example:**
```javascript
POST /api/ai/chat
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "What is the best way to analyze customer data?"
}

// Response:
{
  "success": true,
  "data": {
    "response": "The best way to analyze customer data...",
    "model": "llama-3.3-70b-versatile"
  }
}
```

---

## 🎮 Controllers

### 1. Auth Controller (`controllers/authController.js`)

**Responsibility:** Manage authentication and users

#### a) `register(req, res)`

```
Input:
  ↓ username, email, password, firstName, lastName

Process:
  1. Check for duplicate email/username
  2. Create user (password auto-encrypted)
  3. Create JWT Token
  
Output:
  ↓ { user, token }
```

#### b) `login(req, res)`

```
Input:
  ↓ email, password

Process:
  1. Find user
  2. Verify password
  3. Update lastLogin
  4. Create Token
  
Output:
  ↓ { user, token }
```

#### c) `uploadAvatar(req, res)`

```
Input:
  ↓ File (image: jpg, png, webp, Max: 10MB)

Process:
  1. Save image to /uploads/avatars/
  2. Update avatarUrl in database
  3. Delete old image (if exists)
  
Output:
  ↓ { avatarUrl }
```

---

### 2. Report Controller (`controllers/reportController.js`)

**Responsibility:** Manage reports

#### a) `uploadFile(req, res)`

```
Input:
  ↓ File (CSV/Excel, Max: 10MB)

Process:
  1. Verify file type
  2. Save file to /uploads/
  3. Process file → extract data
  4. Save to database
  
Output:
  ↓ { reportId, filename, recordCount }
```

#### b) `generateAReport(req, res)`

```
Input:
  ↓ reportId, prompt

Process:
  1. Fetch report from DB
  2. Check ownership (if authenticated)
  3. Call AI API
  4. Save result
  
Output:
  ↓ { report (with generatedReport) }
```

#### c) `downloadReport(req, res)`

```
Input:
  ↓ reportId

Process:
  1. Fetch report
  2. Verify generatedReport exists
  3. Convert Markdown → HTML
  4. Generate PDF
  
Output:
  ↓ PDF File Stream
```

---

### 3. Comment Controller (`controllers/commentController.js`)

**Responsibility:** Manage comments

#### a) `addComment(req, res)`

```
Input:
  ↓ reportId, content

Process:
  1. Verify comment content (1-1000 characters)
  2. Check report exists
  3. Verify report is public (isPublic)
  4. Create comment (isApproved: false)
  5. Populate user information
  
Output:
  ↓ { comment }
```

**Protection:**
- ✅ Cannot comment on private reports
- ✅ Comments need admin approval
- ✅ Maximum 1000 characters

#### b) `getComments(req, res)`

```
Input:
  ↓ reportId

Process:
  1. Fetch approved comments (isApproved: true)
  2. If user is Admin → fetch all comments
  3. Populate author information
  4. Sort by date (newest first)
  
Output:
  ↓ [comments]
```

#### c) `deleteComment(req, res)`

```
Input:
  ↓ commentId

Process:
  1. Fetch comment
  2. Check ownership or Admin permissions
  3. Delete comment
  
Output:
  ↓ { success: true }
```

#### d) `approveComment(req, res)` - Admin Only

```
Input:
  ↓ commentId, isApproved (true/false)

Process:
  1. Check Admin permissions
  2. Update approval status
  3. Populate author information
  
Output:
  ↓ { comment }
```

#### e) `getAllComments(req, res)` - Admin Only

```
Input:
  ↓ None

Process:
  1. Check Admin permissions
  2. Fetch all comments
  3. Populate (User + Report)
  4. Calculate statistics
  
Output:
  ↓ {
    comments: [...],
    stats: {
      total: 150,
      approved: 120,
      pending: 30
    }
  }
```

---

### 4. AI Controller (`controllers/aiController.js`)

**Responsibility:** Direct interaction with AI

#### `chatWithAI(req, res)`

```
Input:
  ↓ message (user question)

Process:
  1. Verify Admin permissions
  2. Send to AI API
  3. Return response
  
Output:
  ↓ { response, model }
```

---

## ⚙️ Services

### Report Service (`services/reportService.js`)

**Most important in the project!** Contains all data processing and AI logic.

#### 1. File Processing

##### `processFile(filePath)`

**Purpose:** Read CSV or Excel file and convert to JSON

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

#### 2. Report Generation with AI

##### `generateReport(data, prompt)`

**Purpose:** Use AI to analyze data and generate comprehensive report

```javascript
async function generateReport(data, prompt) {
  try {
    // 1. Take data sample (first 30 records)
    const dataSample = data.slice(0, 30);
    
    // 2. Create detailed prompt
    const fullPrompt = `
You are a professional data analyst specializing in data analysis and creating comprehensive reports.

📋 User request:
${prompt}

📊 Available data:
- Total records: ${data.length}
- Data sample:
${JSON.stringify(dataSample, null, 2)}

📝 Requirements:
1. Analyze data comprehensively
2. Answer user request accurately
3. Provide useful insights and statistics
4. Write report in professional format

⚠️ Very important:
- Write the complete report in English first
- Then write the same report in Arabic
- Use clear headings
- Add accurate numbers and statistics
`;

    // 3. Send to Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data analyst. Create accurate and comprehensive reports in English and Arabic.'
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
    
    // 4. Extract result
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('AI generation failed, using fallback');
    return generateFallbackReport(data, prompt);
  }
}
```

#### 3. Fallback Report

##### `generateFallbackReport(data, prompt)`

**Purpose:** Generate simple statistical report when AI fails

---

#### 4. PDF Generation

##### `generatePDF(reportContent)`

**Purpose:** Convert text report to professional PDF with full Arabic support

```javascript
async function generatePDF(reportContent) {
  // 1. Convert Markdown to HTML
  const htmlContent = marked.parse(reportContent);
  
  // 2. Add CSS for formatting
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
    
    /* Arabic support */
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
  </style>
</head>
<body dir="rtl">
  ${htmlContent}
</body>
</html>
`;

  // 3. Generate PDF
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

---

## 📧 Email Service (`services/emailService.js`)

**Purpose:** Manage all email operations

### Available Functions:

| Function | Usage |
|----------|-------|
| `sendVerificationOTP(user, otp)` | Send OTP for verification (6 digits) |
| `sendReportGeneratedEmail(user, report)` | Report generation notification |
| `sendReportByEmail(user, report, pdfBuffer)` | Send report with PDF attachment |
| `sendPasswordResetEmail(user, resetUrl)` | Password reset link |
| `generateOTP()` | Generate random OTP (100000-999999) |
| `generateToken()` | Generate secure token (hex 64 chars) |

---

## 🛡️ Rate Limiting (`middleware/rateLimiter.js`)

**Purpose:** Protect API from excessive use and attacks

### Seven Configurations:

| Type | Routes | Period | Limit |
|------|--------|--------|-------|
| 🌐 **General** | `/api/*` | 15 minutes | 100 |
| 🔐 **Auth** | `login`, `register` | 15 minutes | 5 |
| 📤 **Upload** | `upload` | 1 hour | 10 |
| 🤖 **AI Generate** | `generate` | 1 hour | 20 |
| 💬 **AI Chat** | `ai/chat` | 1 hour | 50 |
| 📥 **Download** | `download`, `email` | 15 minutes | 30 |
| 👑 **Admin** | `admin/*` | 15 minutes | 50 |

### Protection Against:

- ✅ **DDoS Attacks** - 100 requests limit
- ✅ **Brute Force** - Only 5 login attempts
- ✅ **API Abuse** - Limits per operation
- ✅ **Cost Control** - Protect AI API costs

---

## 🔐 Security

### 1. Password Encryption

```javascript
// Pre-save hook in User Model
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### 2. JWT Authentication

```javascript
// Create Token
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify Token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. Authorization

| Role | Permissions |
|------|-------------|
| **Guest** | - View public reports |
| **User** | - All Guest permissions<br>- Upload files<br>- Generate reports<br>- Delete own reports |
| **Admin** | - All User permissions<br>- User management (CRUD)<br>- View all reports<br>- Delete any report<br>- Direct AI chat |

---

## 🛠️ Technologies Used

### Backend Stack

| Library | Version | Usage |
|---------|---------|-------|
| `express` | ^4.18.0 | Web framework |
| `mongoose` | ^7.5.0 | MongoDB interaction |
| `jsonwebtoken` | ^9.0.0 | JWT Authentication |
| `bcryptjs` | ^2.4.3 | Password encryption |
| `multer` | ^1.4.5 | File uploads |
| `xlsx` | ^0.18.0 | Excel reading |
| `axios` | ^1.5.0 | HTTP Requests |
| `html-pdf-node` | ^1.0.8 | PDF generation |
| `nodemailer` | ^6.9.0 | Email sending (Gmail SMTP) |
| `express-rate-limit` | ^7.1.0 | Rate Limiting & DDoS Protection |
| `cors` | ^2.8.5 | CORS Protection |
| `dotenv` | ^16.3.0 | Environment variables |
| `fs-extra` | ^11.1.0 | Advanced file operations |

---

## ⚙️ Setup & Running

### 1. Requirements

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **npm** or **yarn**

### 2. Installation

```bash
# Clone project
git clone <repository-url>

# Navigate to server folder
cd server

# Install packages
npm install
```

### 3. Database Setup

```bash
# Start MongoDB (Windows)
mongod

# Or (Linux/Mac)
sudo systemctl start mongod
```

### 4. Environment Variables

Create `config.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-reports

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (change to something random and strong)
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

### 5. Run Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
Server started on port 5000
Connected to MongoDB
✓ Ready to accept requests
```

---

## 📊 Project Statistics

### Code

```
📁 server/
├── 18 main files
├── ~6,000 lines of code
├── 13 Models & Controllers & Services
├── 35+ API Endpoints
├── 7 Rate Limiters
├── 8 Email Templates
└── 100+ functions and components
```

### Features

- ✅ **Complete user system** (registration, login, profile, OTP)
- ✅ **Email Verification** (OTP 6 digits, valid 10 minutes)
- ✅ **Password Reset** (via email)
- ✅ **Smart file processing** (CSV, Excel)
- ✅ **AI Integration** (Groq Llama 3.3 70B, Hugging Face)
- ✅ **Multi-language reports** (Arabic or English by choice)
- ✅ **PDF Generation** (RTL for Arabic, LTR for English)
- ✅ **Send reports via email** (PDF attached)
- ✅ **Rate Limiting** (7 different types)
- ✅ **Admin dashboard** (user management, reports, AI chat)
- ✅ **React Router** (URL navigation)
- ✅ **Blog System** (public reports blog)
- ✅ **SEO Optimization** (Schema.org, Meta Tags, Sitemap)
- ✅ **Public/Private Reports** (toggle status)
- ✅ **Comments System** (with Moderation)
  - Comment Model with Indexes
  - Comment Controller (5 functions)
  - Admin approval system
  - Delete by author/admin
- ✅ **Rating System** (1-5 stars)
  - Rate once per user
  - Automatic average calculation
  - Prevent duplicate ratings
- ✅ **Settings System** (configurable settings)
  - Static Methods (get/set)
  - Support any data type (Mixed)
  - Track who updated

---

## 🚀 Future Improvements

### ✅ Completed

- [x] **Rate Limiting** for API protection (7 different types)
- [x] **Email Service** for notifications (Gmail SMTP)
- [x] **Email Verification** (OTP System)
- [x] **Password Reset** (via email)
- [x] **Email Reports** (send PDF via email)
- [x] **React Router** (URL navigation)
- [x] **Responsive Design** (mobile optimized)
- [x] **Multi-language Reports** (Arabic/English)
- [x] **RTL/LTR PDF** (formatting by language)
- [x] **Blog System** (public reports blog)
- [x] **SEO Optimization** (Schema.org, Meta Tags, Sitemap)
- [x] **Public/Private Reports** (toggle status)
- [x] **Comments System** (with Moderation)
- [x] **Rating System** (5 stars)
- [x] **Settings System** (configurable settings)

### 📋 Planned

- [ ] **Replies on Comments** (comment replies)
- [ ] **Like/Dislike System** (like/dislike)
- [ ] **WebSocket** for live reports
- [ ] **Redis Caching** to speed up response
- [ ] **Advanced Analytics** interactive charts
- [ ] **Export Options** (Excel, Word, JSON)
- [ ] **Logging System** with Winston
- [ ] **Unit Tests** with Jest
- [ ] **Docker** containerization
- [ ] **CI/CD Pipeline** with GitHub Actions
- [ ] **Two-Factor Authentication** (2FA)
- [ ] **API Documentation** with Swagger

---

**Last Update:** October 9, 2025

**Version:** 4.2

**Status:** ✅ In Production

**New Features:** Comments System (with Moderation), Rating System (5 stars), Settings System, Advanced Search, Blog Enhancements

---

<div align="center">

### 🌟 Made with ❤️ for the Arab Developer Community

**#AI #DataAnalysis #NodeJS #MongoDB #Express #EmailVerification #RateLimiting #ReactRouter**

</div>

