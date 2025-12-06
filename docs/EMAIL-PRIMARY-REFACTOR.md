# Email-Primary Refactor Documentation

## Overview
This document describes the major architectural refactor that changes the AMS system from using `employeeCode` as the primary identifier to using `email` as the primary identifier.

---

## 🎯 Key Changes

### 1. **Database Schema Changes**

#### New Model: `BasicEmployeeInfo`
```javascript
{
  email: String (PRIMARY KEY, UNIQUE, INDEXED),
  employeeCode: String (FOREIGN KEY, UNIQUE, INDEXED),
  name: String,
  designation: String,
  department: String,
  college: String,
  campus: String,
  joiningDate: Date,
  periodOfAssessment: Date,
  externalEvaluatorName: String,
  principalName: String,
  HODName: String
}
```

#### Updated Model: `Evaluation`
```javascript
{
  email: String (PRIMARY KEY, REQUIRED, INDEXED),
  employeeCode: String (FOREIGN KEY, INDEXED),
  // ... all evaluation fields (no basic info fields)
  remarks: Map<String, String>
}
```

#### Updated Model: `User`
```javascript
{
  email: String (PRIMARY KEY),
  password: String,
  role: String,
  employeeCode: String (NEW - references BasicEmployeeInfo),
  emailVerified: Boolean
}
```

---

## 🔑 Primary Identifier Logic

### Identifier Detection
The system automatically detects whether a parameter is an email or employeeCode:

```javascript
// Contains '@' = email
if (identifier.includes('@')) {
  return await Model.findOne({ email: identifier });
}
// Otherwise = employeeCode
return await Model.findOne({ employeeCode: identifier });
```

### Role-Based Behavior

| Role | Primary Identifier | Can Search By | Auto-Load |
|------|-------------------|---------------|-----------|
| Faculty | Email | Own email only | Yes (by email) |
| HOD | Email | Email or employeeCode | No (manual select) |
| External | Email | Email or employeeCode | No (manual select) |
| Principal | Email | Email or employeeCode | No (manual select) |
| Admin | Email | Email or employeeCode | No (manual select) |

---

## 🔄 Authentication Flow

### 1. **Signup**
```javascript
POST /signup
Body: {
  email: "user@dsce.edu.in",
  password: "******",
  role: "faculty",
  employeeCode: "FAC001" // Optional
}

// Backend creates:
// 1. User account with email as primary key
// 2. BasicEmployeeInfo document (if employeeCode provided)
// 3. Links employeeCode to user account
```

### 2. **Login**
```javascript
POST /login
Body: {
  email: "user@dsce.edu.in",
  password: "******"
}

// Backend returns:
{
  token: "JWT_TOKEN",
  user: {
    id: "user_id",
    email: "user@dsce.edu.in",
    role: "faculty",
    employeeCode: "FAC001"
  }
}

// JWT contains: { id, email, role, employeeCode }
```

### 3. **Token Storage**
```javascript
// Redux state
{
  userId: "user_id",
  email: "user@dsce.edu.in",
  role: "faculty",
  employeeCode: "FAC001",
  token: "JWT_TOKEN"
}

// Also saved to localStorage as 'authState'
```

---

## 📊 Data Operations

### 1. **Create/Update Employee Data**

#### Faculty (Auto-uses own email)
```javascript
POST /addData
Headers: { Authorization: "Bearer JWT" }
Body: {
  employeeCode: "FAC001", // Optional - sets if not exists
  TLP111Self: "5",
  // ... other fields
}

// Backend:
// 1. Gets email from JWT token
// 2. Updates/creates BasicEmployeeInfo
// 3. Updates/creates Evaluation with email as primary key
```

#### HOD/External (Specify target)
```javascript
POST /addData
Headers: { Authorization: "Bearer JWT" }
Body: {
  email: "faculty@dsce.edu.in", // Target employee email
  employeeCode: "FAC001",
  TLP111HoD: "4",
  // ... other fields
}
```

### 2. **Retrieve Employee Data**

```javascript
GET /getData/:identifier
// identifier can be email OR employeeCode

// Examples:
GET /getData/faculty@dsce.edu.in
GET /getData/FAC001

// Returns combined data:
{
  success: true,
  data: {
    // From BasicEmployeeInfo
    email: "faculty@dsce.edu.in",
    employeeCode: "FAC001",
    name: "John Doe",
    // ... basic info
    
    // From Evaluation
    TLP111Self: "5",
    TLP111HoD: "4",
    // ... evaluation data
  }
}
```

### 3. **Get Employee List**

```javascript
GET /getEmpCode
// Returns:
{
  success: true,
  employees: [
    {
      email: "faculty1@dsce.edu.in",
      employeeCode: "FAC001",
      name: "John Doe"
    },
    // ...
  ],
  employeeCodes: ["FAC001", "FAC002"] // Backward compatibility
}
```

---

## 🎨 Frontend Changes

### 1. **Faculty Flow**
```jsx
// Auto-loads on page mount
useEffect(() => {
  if (isFaculty && email) {
    fetchEmployeeData(email); // Uses email from Redux
  }
}, [isFaculty, email]);

// UI shows email (read-only)
<input 
  type="email" 
  value={email} 
  readOnly 
  className="bg-gray-100"
/>
```

### 2. **HOD/External Flow**
```jsx
// Loads employee list on mount
useEffect(() => {
  if (isHodOrExternal) {
    fetchAllEmployeeCodes(); // Gets full employee list
  }
}, [isHodOrExternal]);

// UI shows dropdown with email + code
<select onChange={handleEmployeeSelect}>
  <option value="">Select Employee</option>
  {employees.map(emp => (
    <option value={emp.email}>
      {emp.name} - {emp.email}
    </option>
  ))}
</select>
```

### 3. **Redux State**
```javascript
// authSlice now includes employeeCode
const initialState = {
  userId: null,
  email: null,
  role: null,
  employeeCode: null, // NEW
  token: null
};

// JWT decoded automatically includes employeeCode
const decoded = jwtDecode(token);
state.employeeCode = decoded.employeeCode;
```

---

## 🔐 Role-Based Access Control

### Unchanged
The role-based field access system remains the same:

```javascript
const roleAccess = {
  faculty: { 
    editable: ['self'], 
    visible: ['self'] 
  },
  hod: { 
    editable: ['hod'], 
    visible: ['self', 'hod'] 
  },
  external: { 
    editable: ['external'], 
    visible: ['self', 'hod', 'external'] 
  },
  principal: { 
    editable: [], 
    visible: ['self', 'hod', 'external'] 
  }
};
```

---

## 📁 File Storage (Cloudinary)

### No Changes
File storage continues to use employeeCode for folder structure:

```javascript
// Upload structure
cloudinary.uploader.upload(file, {
  folder: `employees/${employeeCode}`,
  public_id: `${fieldName}-${timestamp}`
});

// Result
employees/
  FAC001/
    TLP111SelfImage-1733356800000.pdf
  FAC002/
    CDL31SelfImage-1733356900000.jpg
```

---

## 🔄 Migration Process

### Running the Migration

```bash
# Navigate to backend
cd Backend

# Run migration script
node migration/migrateToEmailPrimary.js
```

### What it Does

1. **Reads** all existing Evaluation documents
2. **Extracts** basic employee info fields
3. **Creates** BasicEmployeeInfo documents
4. **Updates** Evaluation documents with email field
5. **Links** employeeCode to User accounts (if exist)
6. **Generates** placeholder emails for evaluations without users

### Placeholder Emails
For evaluations without associated users:
```
employeeCode: FAC001
Generated email: fac001@placeholder.edu
```

**⚠️ Important:** Review and update placeholder emails after migration!

### Rollback (If Needed)

```bash
node migration/rollbackEmailPrimary.js
```

This removes email fields and optionally deletes BasicEmployeeInfo collection.

---

## 🧪 Testing

### Backend API Tests

```javascript
// Test files location
Backend/migration/migrateToEmailPrimary.js
Frontend/test-utils/emailPrimaryTests.js
```

### Manual Testing Checklist

- [ ] Faculty signup with email
- [ ] Faculty login and auto-load data
- [ ] Faculty save evaluation (auto-uses email)
- [ ] HOD login and view employee list
- [ ] HOD search by email
- [ ] HOD search by employeeCode
- [ ] HOD update evaluation for faculty
- [ ] External evaluator access
- [ ] Principal read-only access
- [ ] Remarks system (by email/employeeCode)
- [ ] File uploads (Cloudinary folders)

### Browser Console Tests

```javascript
// Load testing utilities
// Open browser console on app

// Test token payload
manualTestsAMS.testTokenPayload(localStorage.getItem('token'));

// Test localStorage state
manualTestsAMS.testLocalStorage();

// Test identifier detection
manualTestsAMS.testIdentifierDetection('faculty@dsce.edu.in');
manualTestsAMS.testIdentifierDetection('FAC001');
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run migration script on staging database
- [ ] Verify all placeholder emails are updated
- [ ] Test all user roles in staging
- [ ] Verify file uploads work correctly
- [ ] Check remarks system functionality
- [ ] Ensure backward compatibility with old employeeCode routes

### Database Backup

```bash
# Backup before migration
mongodump --uri="YOUR_MONGO_URI" --out=backup-before-migration

# Backup after migration
mongodump --uri="YOUR_MONGO_URI" --out=backup-after-migration
```

### Environment Variables
No new environment variables required.

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check authentication flow
- [ ] Verify data loading for all roles
- [ ] Test file uploads
- [ ] Confirm email notifications work
- [ ] Review user feedback

---

## 📋 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create account (now includes optional employeeCode) |
| POST | `/login` | Login (returns email + employeeCode in token) |
| POST | `/logout` | Logout |

### Employee Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/addData` | Create/update evaluation (auto-uses email for faculty) |
| GET | `/getData/:identifier` | Get by email or employeeCode |
| GET | `/getEmpCode` | Get all employees (returns emails + codes) |

### Basic Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/basicInfo` | Get current user's basic info |
| PUT | `/basicInfo` | Update current user's basic info |
| GET | `/basicInfo/:identifier` | Get basic info by email/code (HOD+) |

### Remarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/remarks/:identifier` | Get remarks by email/code |
| PUT | `/remarks/:identifier` | Update remark by email/code |
| PUT | `/remarks/:identifier/bulk` | Bulk update remarks |

---

## ⚠️ Breaking Changes

### For Existing Users
- Faculty users MUST use email to login (no change from before)
- Employee codes can be added/updated in profile
- Old evaluation data migrated automatically

### For Integrations
- API endpoints now accept email OR employeeCode
- Response structure includes both email and employeeCode
- Token payload now includes email and employeeCode

---

## 🔧 Troubleshooting

### Issue: "Employee not found"
**Solution:** Check if migration completed successfully. Verify BasicEmployeeInfo document exists.

### Issue: "Unauthorized access"
**Solution:** Check JWT token includes email and employeeCode. Re-login if needed.

### Issue: "Cannot update evaluation"
**Solution:** Verify user's email matches the evaluation's email (for faculty).

### Issue: "Placeholder emails in production"
**Solution:** Run admin script to identify and update placeholder emails.

---

## 📚 Additional Resources

- Migration script: `Backend/migration/migrateToEmailPrimary.js`
- Rollback script: `Backend/migration/rollbackEmailPrimary.js`
- Test utilities: `Frontend/test-utils/emailPrimaryTests.js`
- BasicEmployeeInfo model: `Backend/model/basicEmployeeInfo.js`
- Updated Evaluation model: `Backend/model/data.js`
- Updated User model: `Backend/model/user.js`

---

## 👥 Support

For issues or questions:
1. Check this documentation
2. Review test utilities
3. Check migration logs
4. Consult development team

---

**Last Updated:** December 6, 2025  
**Version:** 2.0.0 (Email-Primary Refactor)
