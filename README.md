# Faculty Performance Management & Appraisal System

A comprehensive web-based application for managing faculty performance evaluations with role-based access control, OTP verification, and automated PDF report generation.

## 🚀 Features

- **Role-Based Access Control**: 5 distinct roles (Faculty, HOD, External Auditor, Principal, Admin)
- **Multi-Stage Evaluation**: 7-page evaluation form covering Teaching, Research, Departmental Contribution, and more
- **OTP-Based Authentication**: Email verification and password reset with secure OTP system
- **Real-time Data Validation**: Schema alignment between frontend and backend
- **PDF Report Generation**: Automated FPMI (Faculty Performance Measurement Index) reports
- **Login Activity Tracking**: Comprehensive audit logs for admin monitoring
- **Section-wise Remarks**: Collaborative evaluation with remarks from HOD, External, and Principal
- **Cloudinary Integration**: Secure file upload and management
- **Rate Limiting**: Protection against brute force and DoS attacks (supports 200+ concurrent users)

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Security Features](#security-features)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - Local or Atlas cluster
- **Git**

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aditzz073/AMS-official.git
cd AMS-official
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

## 🔐 Environment Variables

### Backend Configuration

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=9000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# CORS - Frontend URL (comma-separated for multiple origins)
CLIENT_URL=http://localhost:5173

# JWT Secret (Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_128_character_strong_secret_here

# Token Expiry (in hours)
TOKEN_EXPIRY_HOURS=6
ADMIN_TOKEN_EXPIRY_HOURS=2

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Cloudinary Configuration (for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

**Generate Strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend Configuration

Create `.env.development` in the `Frontend` directory:

```env
# Development Environment
VITE_API_URL=http://localhost:9000/app
```

Create `.env.production` in the `Frontend` directory:

```env
# Production Environment
VITE_API_URL=https://your-production-backend.com/app
```

## 🎯 Running the Application

### Development Mode

**Backend (Terminal 1):**
```bash
cd Backend
npm start
# Server runs on http://localhost:9000
```

**Frontend (Terminal 2):**
```bash
cd Frontend
npm run dev
# Application runs on http://localhost:5173
```

### Production Build

**Frontend:**
```bash
cd Frontend
npm run build
# Creates optimized build in dist/ folder
```

**Backend:**
```bash
cd Backend
NODE_ENV=production node server.js
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/app/signup` | Register new user | Public |
| POST | `/app/login` | User login | Public |
| POST | `/app/logout` | User logout | Protected |

### OTP Verification Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/app/auth/request-otp` | Request email OTP | Public |
| POST | `/app/auth/verify-otp` | Verify email OTP | Public |
| POST | `/app/auth/resend-otp` | Resend OTP | Public |

### Password Reset Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/app/auth/forgot-password` | Request password reset | Public |
| POST | `/app/auth/verify-reset-otp` | Verify reset OTP | Public |
| POST | `/app/auth/reset-password` | Reset password | Public |
| POST | `/app/auth/resend-reset-otp` | Resend reset OTP | Public |

### Evaluation Data Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/app/addData` | Create/Update evaluation | Protected |
| GET | `/app/getData/:id` | Get evaluation by email/code | Protected |
| GET | `/app/getEmpCode` | Get all employee codes | Protected |
| POST | `/app/total` | Calculate category totals | Protected |

### Basic Info Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/app/basicInfo` | Get current user's info | Protected |
| PUT | `/app/basicInfo` | Update basic info | Protected (Faculty only) |
| GET | `/app/basicInfo/:identifier` | Get info by email/code | Protected (HOD/External/Admin) |

### Remarks Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/app/remarks/:employeeCode` | Get section remarks | Protected |
| PUT | `/app/remarks/:employeeCode` | Update single remark | Protected (HOD/External/Admin) |
| PUT | `/app/remarks/:employeeCode/bulk` | Bulk update remarks | Protected (HOD/External/Admin) |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/app/admin/login-logs` | Get all login logs | Admin Only |
| GET | `/app/admin/login-stats` | Get login statistics | Admin Only |
| POST | `/app/admin/close-stale-sessions` | Close stale sessions | Admin Only |

## 🚀 Deployment

### Backend Deployment (Example: Render/Railway)

1. **Set Environment Variables** in your hosting platform
2. **Update `package.json` start script:**
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```
3. **Deploy** and note your backend URL

### Frontend Deployment (Example: Vercel/Netlify)

1. **Update `.env.production`** with your backend URL
2. **Build the project:**
   ```bash
   npm run build
   ```
3. **Deploy** the `dist` folder
4. **Update Backend `.env`** with your frontend URL in `CLIENT_URL`

### Post-Deployment Checklist

- [ ] Strong JWT_SECRET configured (128 characters)
- [ ] Production MongoDB connection string
- [ ] CORS configured with production frontend URL
- [ ] SMTP credentials for production email service
- [ ] Cloudinary credentials configured
- [ ] NODE_ENV=production
- [ ] HTTPS/SSL certificates enabled
- [ ] Rate limiters configured for expected traffic
- [ ] Database indexes created
- [ ] Backup strategy in place

## 📁 Project Structure

```
mini_project_25/
├── Backend/
│   ├── controller/         # Request handlers
│   ├── middleware/         # Auth, rate limiting, multer
│   ├── model/             # Mongoose schemas
│   ├── routers/           # API routes
│   ├── utils/             # Email, validation, security
│   ├── config/            # Configuration files
│   ├── uploads/           # Temporary file uploads
│   ├── app.js             # Express app setup
│   ├── server.js          # Server entry point
│   └── dbConnect.js       # Database connection
│
├── Frontend/
│   ├── src/
│   │   ├── assets/        # Images, static files
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React contexts
│   │   ├── helper/        # Axios instance
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components (Page0-Page7)
│   │   ├── redux/         # Redux store & slices
│   │   ├── utils/         # PDF generation, validators
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   └── public/            # Public assets
│
└── docs/                  # Documentation files
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with role-based expiration
- Secure password hashing (bcrypt with 10 salt rounds)
- Role-based access control (RBAC) with 5 distinct roles
- Email domain restriction (@dayanandasagar.edu)

### Rate Limiting (200+ concurrent users supported)
- Login: 10 attempts per 15 minutes
- API: 500 requests per 15 minutes
- OTP: 5 requests per hour (per email)
- Password Reset: 5 requests per hour
- Admin: 200 requests per 15 minutes

### Data Protection
- HTTPS-only cookies in production
- Secure file upload with Cloudinary
- PII masking in security logs
- Input validation and sanitization
- MongoDB injection prevention

### Monitoring & Logging
- Login activity tracking with IP and user agent
- Session duration monitoring
- Security event logging
- Failed authentication tracking

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Faculty** | Edit own evaluation data, view own results |
| **HOD** | View all department faculty, add HOD scores and section remarks |
| **External Auditor** | View assigned faculty, add external scores and remarks (cannot see HOD scores) |
| **Principal** | View all evaluations, add final remarks |
| **Admin** | Full system access, manage users, view login logs, read-only on evaluations |

## 🧪 Testing

**Backend Syntax Check:**
```bash
cd Backend
node --check server.js
```

**Run Security Audit:**
```bash
npm audit
```

**Frontend Build Test:**
```bash
cd Frontend
npm run build
```

## 📞 Support

For issues and questions:
- **Repository**: [AMS-official](https://github.com/aditzz073/AMS-official)
- **Documentation**: See `/docs` folder for detailed guides

## 📄 License

This project is for academic use at Dayananda Sagar College of Engineering.

## 🙏 Acknowledgments

- Dayananda Sagar College of Engineering
- Faculty Performance Management Team
- All contributors and testers

---

**Version**: 1.0.0  
**Last Updated**: December 2025
