# Email-Primary Refactor - Quick Reference

## 🎯 TL;DR
The AMS system now uses **email** as the primary identifier instead of employeeCode. EmployeeCode is now a foreign key reference.

---

## 📝 Key Points

### For Users
- **Faculty**: Login with email → Auto-loads your data
- **HOD/External**: Login with email → Select employee from dropdown
- **EmployeeCode**: Optional field you can set in your profile

### For Developers
- **Email** = Primary key in all operations
- **EmployeeCode** = Foreign key for backward compatibility
- **Identifier Detection**: `includes('@')` → email, else → employeeCode
- **JWT Token**: Now contains `{ id, email, role, employeeCode }`

---

## 🔄 Migration Steps

```bash
# 1. Backup database
mongodump --uri="YOUR_MONGO_URI" --out=backup

# 2. Run migration
cd Backend
node migration/migrateToEmailPrimary.js

# 3. Update placeholder emails (if any)
# Review migration report for emails ending with @placeholder.edu

# 4. Test the system
# Use Frontend/test-utils/emailPrimaryTests.js

# 5. Deploy
# Standard deployment process
```

---

## 📊 Data Flow

### Before (Old System)
```
employeeCode (Primary) → Evaluation Document
```

### After (New System)
```
email (Primary) → BasicEmployeeInfo ←→ Evaluation
                      ↑
                 employeeCode (Foreign Key)
```

---

## 🔑 API Changes

### Get Employee Data
```javascript
// Old way (still works)
GET /getData/FAC001

// New way
GET /getData/faculty@dsce.edu.in

// Both work! System auto-detects
```

### Save Employee Data
```javascript
// Faculty (auto-uses their email)
POST /addData
Body: {
  TLP111Self: "5"
  // email auto-detected from JWT
}

// HOD/External (specify target)
POST /addData
Body: {
  email: "faculty@dsce.edu.in",
  TLP111HoD: "4"
}
```

### Get Employee List
```javascript
GET /getEmpCode

// Returns
{
  employees: [
    { email: "user1@dsce.edu.in", employeeCode: "FAC001", name: "John" }
  ],
  employeeCodes: ["FAC001"] // backward compatibility
}
```

---

## 🎨 Frontend Changes

### Redux State
```javascript
// Now includes employeeCode
{
  userId: "...",
  email: "faculty@dsce.edu.in",
  role: "faculty",
  employeeCode: "FAC001", // NEW!
  token: "..."
}
```

### Faculty UI
```jsx
// Email shown (read-only)
<input value={email} readOnly />

// Data auto-loaded by email
useEffect(() => {
  if (isFaculty && email) {
    fetchEmployeeData(email);
  }
}, [email]);
```

### HOD/External UI
```jsx
// Dropdown with full employee list
<select onChange={handleEmployeeSelect}>
  {employees.map(emp => (
    <option value={emp.email}>
      {emp.name} - {emp.email}
    </option>
  ))}
</select>
```

---

## 🗂️ File Structure

### New Files
```
Backend/
  model/
    basicEmployeeInfo.js          ✨ NEW
  controller/
    basicEmployeeInfoController.js ✨ NEW
  migration/
    migrateToEmailPrimary.js      ✨ NEW
    rollbackEmailPrimary.js       ✨ NEW

Frontend/
  test-utils/
    emailPrimaryTests.js          ✨ NEW

docs/
  EMAIL-PRIMARY-REFACTOR.md       ✨ NEW
  EMAIL-PRIMARY-QUICK-REF.md      ✨ NEW (this file)
```

### Modified Files
```
Backend/
  model/
    data.js              🔄 Added email, removed basic fields
    user.js              🔄 Added employeeCode
  controller/
    authController.js    🔄 Email + employeeCode in JWT
    handelData.js        🔄 Email-based logic
    remarksController.js 🔄 Email/code support
  routers/
    router.js           🔄 New basicInfo routes

Frontend/
  src/
    redux/authSlice.js  🔄 Added employeeCode
    pages/Page1.jsx     🔄 Email-based UI
    App.jsx             🔄 Email validation
```

---

## ⚡ Quick Commands

### Check migration status
```bash
# Check if BasicEmployeeInfo collection exists
mongosh YOUR_MONGO_URI
> show collections
> db.basicemployeeinfos.countDocuments()
```

### Find placeholder emails
```bash
> db.basicemployeeinfos.find({ email: /@placeholder\.edu$/ })
```

### Test in browser console
```javascript
// Check token
manualTestsAMS.testTokenPayload(localStorage.getItem('token'));

// Check state
manualTestsAMS.testLocalStorage();

// Run all tests
testAMS.runAllTests();
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Can't login | Clear localStorage, re-login |
| Data not loading | Check email in JWT token |
| "Employee not found" | Run migration script |
| Placeholder emails | Update them manually via admin |

---

## 📞 Quick Support

1. **Check docs**: `docs/EMAIL-PRIMARY-REFACTOR.md`
2. **Run tests**: `Frontend/test-utils/emailPrimaryTests.js`
3. **Check logs**: Backend migration output
4. **Rollback**: `node migration/rollbackEmailPrimary.js`

---

## ✅ Pre-Deployment Checklist

- [ ] Database backup complete
- [ ] Migration script run successfully
- [ ] No placeholder emails in production
- [ ] All roles tested (faculty, HOD, external)
- [ ] File uploads working
- [ ] Remarks system functional
- [ ] JWT tokens include email + employeeCode
- [ ] Frontend displays correct data
- [ ] Old employeeCode queries still work

---

**Remember**: Both email and employeeCode work as identifiers. The system auto-detects which one you're using!

---

Last Updated: December 6, 2025
