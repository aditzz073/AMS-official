# Employee Verification Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install csv-parser chokidar pino
```

### 2. Place CSV Files
Put employee CSV files in `Backend/Faculty data/`

### 3. Start Server
```bash
npm start
```

The employee service initializes automatically on server start.

---

## 📋 CSV File Requirements

**Required Columns:**
- `Staff I D` (unique identifier)
- `EmailInstitute` (for verification)

**Example:**
```csv
Sr,Staff I D,StaffFullName,StaffShortName,Mobile,StaffCode,EmailPrivate,EmailInstitute,InstituteJoiningDate,CurrentDesignationName,DepartmentCode,FacultyName
1,1500,Dr. John Doe,JD,9876543210,20016,john@gmail.com,john.doe@dayanandasagar.edu,11/17/95,Professor,CS,FoE
```

---

## 🔑 Key Features

✅ **Automatic CSV Loading** - Loads on server start  
✅ **File Watching** - Auto-reloads when CSV changes  
✅ **Fast Lookups** - In-memory cache, < 1ms  
✅ **One-to-One Linking** - Each employee → one account  
✅ **Case-Insensitive** - Matches emails regardless of case  
✅ **Production Ready** - Error handling, logging, testing  

---

## 📡 API Endpoint

### POST /api/auth/signup

**Request:**
```json
{
  "email": "john.doe@dayanandasagar.edu",
  "password": "securePassword123",
  "role": "faculty"
}
```

**Success (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "john.doe@dayanandasagar.edu",
    "role": "faculty"
  }
}
```

**Error - Not Found (403):**
```json
{
  "success": false,
  "message": "You are not authorized to create an account. Email not found in employee database."
}
```

**Error - Already Linked (409):**
```json
{
  "success": false,
  "message": "Employee with Staff ID '1500' is already linked to an existing user account."
}
```

---

## 💻 Programmatic Usage

### Verify Employee Email
```javascript
const result = await employeeService.verifyEmployeeEmail('email@domain.com');

if (result.success) {
  console.log('Staff ID:', result.employee.staffId);
  console.log('Name:', result.employee.staffFullName);
}
```

### Get Employee by Staff ID
```javascript
const employee = await employeeService.getEmployeeByStaffId('1500');
```

### Get Cache Statistics
```javascript
const stats = employeeService.getCacheStats();
console.log('Loaded employees:', stats.employeeCount);
```

### Reload CSV Files
```javascript
await employeeService.reloadEmployees();
```

---

## ⚙️ Configuration

Add to `.env`:
```env
# Optional: Custom CSV directory
CSV_DIRECTORY=/path/to/csv/files

# Optional: Log level
LOG_LEVEL=info
```

---

## 🗄️ Database Schema

### User Model Additions

```javascript
{
  staffId: String,              // Unique, indexed
  employeeDetails: {
    staffFullName: String,
    departmentCode: String,
    mobile: String,
    emailPrivate: String,
    currentDesignationName: String,
    // ... more fields
  }
}
```

**Key Points:**
- `staffId` has **sparse unique index** (allows nulls)
- One employee can link to **only one user account**
- External users can exist without `staffId`

---

## 🚨 Error Codes

| Error | Code | HTTP |
|-------|------|------|
| Email not found | `EMPLOYEE_NOT_FOUND` | 403 |
| Multiple records | `MULTIPLE_EMPLOYEE_RECORDS` | 409 |
| Already linked | `EMPLOYEE_ALREADY_LINKED` | 409 |
| Service not ready | `SERVICE_NOT_INITIALIZED` | 503 |

---

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Files:**
- `__tests__/employeeService.test.js` - CSV loading & verification
- `__tests__/signup.integration.test.js` - Signup flow
- `__tests__/fixtures/*.csv` - Sample data

---

## 🔍 Troubleshooting

### CSV Not Loading
```bash
# Check directory
ls -la "Backend/Faculty data"/*.csv

# Check permissions
chmod 644 "Backend/Faculty data"/*.csv

# Set path in .env
CSV_DIRECTORY=/absolute/path/to/Faculty data
```

### Employee Not Found
1. ✅ Verify email exists in CSV
2. ✅ Check column headers match format
3. ✅ Reload: `await employeeService.reloadEmployees()`

### Already Linked Error
```javascript
// Check existing link
const user = await User.findOne({ staffId: 'XXX' });
```

### High Memory Usage
Enable streaming mode:
```javascript
const service = createEmployeeService({
  streamingMode: true  // Uses less memory
});
```

---

## 📊 Performance

**Typical Dataset (10K employees):**
- Memory: ~2-4 MB
- Lookup: < 1ms
- Load time: ~200-500ms

**Large Dataset (100K+ employees):**
- Use `streamingMode: true`
- Memory: Minimal
- Lookup: Slightly slower but efficient

---

## 🔒 Security Checklist

✅ CSV files outside web root  
✅ Add CSV files to `.gitignore`  
✅ Implement rate limiting on signup  
✅ Use bcrypt cost factor ≥ 12  
✅ Validate email domains  
✅ Never log passwords or sensitive data  

---

## 📁 File Structure

```
Backend/
├── services/
│   └── employeeService.js       # Main service
├── controller/
│   └── authController.js        # Signup with verification
├── model/
│   └── user.js                  # User + employee fields
├── utils/errors/
│   └── employeeErrors.js        # Custom errors
├── types/
│   └── employee.types.js        # JSDoc types
└── __tests__/                   # Tests
```

---

## 🔗 Related Documentation

- **Full Documentation:** `docs/EMPLOYEE-VERIFICATION-SYSTEM.md`
- **API Reference:** Same file, API section
- **Migration Guide:** Same file, Migration section

---

## 📞 Quick Commands

```bash
# Start server
npm start

# Run tests
npm test

# Check logs (server startup)
# Look for: "Employee Service initialized successfully"
# Shows: "Loaded X employee records"

# Manual reload (in Node REPL)
await employeeService.reloadEmployees();
```

---

## ✨ Example Usage Flow

```javascript
// 1. User submits signup form
POST /api/auth/signup
{
  "email": "john.doe@dayanandasagar.edu",
  "password": "secure123",
  "role": "faculty"
}

// 2. System verifies email in CSV
const result = await employeeService.verifyEmployeeEmail(email);

// 3. If found, checks if already linked
const existing = await User.findOne({ staffId: result.employee.staffId });

// 4. Creates user with employee data
await User.create({
  email,
  password,
  role,
  staffId: result.employee.staffId,
  employeeDetails: { ... }
});

// 5. Returns success with JWT token
```

---

**Version:** 1.0.0  
**Node:** 18+  
**Database:** MongoDB  
**Updated:** November 24, 2025
