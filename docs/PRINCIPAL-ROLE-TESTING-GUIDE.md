# 🔒 PRINCIPAL ROLE - TESTING GUIDE

## ✅ Testing Checklist

### 1. **Login as Principal**
- Navigate to the auth page
- Login with principal credentials
- Verify you see: `principal@gmail.com` in the header

### 2. **Test Page 3 (TLP - Teaching Learning Process)**
Navigate to Page 3 and verify:
- [ ] All Self-Evaluation inputs (Column A) are **disabled/grayed out**
- [ ] All HoD Evaluation inputs (Column B) are **disabled/grayed out** ✅ CRITICAL
- [ ] All External Audit inputs (Column C) are **disabled/grayed out** ✅ CRITICAL
- [ ] All fields show existing data if available
- [ ] No input fields are editable
- [ ] Fields show gray background (`bg-gray-100`)

**Test Fields:**
- TLP111Self, TLP111HoD, TLP111External
- TLP112Self, TLP112HoD, TLP112External
- TLP113Self, TLP113HoD, TLP113External
- TLP114Self, TLP114HoD, TLP114External

### 3. **Test Page 4 (PDRC - Professional Development)**
Navigate to Page 4 and verify:
- [ ] All 22 fields (PDRC211-222) are **read-only**
- [ ] Self, HoD, and External columns all disabled
- [ ] No editing possible for principal

### 4. **Test Page 5 (CDL/CIL - Contribution Development)**
Navigate to Page 5 and verify:
- [ ] CDL fields (310-322) all read-only
- [ ] CIL4 fields (41-415) all read-only
- [ ] All three columns disabled

### 5. **Test Page 6 (IOW - Institutional Outreach)**
Navigate to Page 6 and verify:
- [ ] All IOW fields (511-525) read-only
- [ ] All columns disabled for principal

### 6. **Test Page 7 (Final Submission)**
Navigate to Page 7 and verify:
- [ ] Summary textareas are **read-only**
- [ ] Principal can VIEW but not EDIT feedback
- [ ] Cannot submit the form

---

## 🎯 Expected Principal Behavior

### ✅ **WHAT PRINCIPAL CAN DO:**
- ✅ Login and navigate all pages
- ✅ **VIEW** all existing entries
- ✅ See all data from Self, HoD, and External evaluations
- ✅ Review the complete FPMI form

### ❌ **WHAT PRINCIPAL CANNOT DO:**
- ❌ **EDIT** any Self-Evaluation fields (Column A)
- ❌ **EDIT** any HoD Evaluation fields (Column B) - **CRITICAL FIX**
- ❌ **EDIT** any External Audit fields (Column C) - **CRITICAL FIX**
- ❌ Submit or modify any form data
- ❌ Change any scores or comments

---

## 🔍 Visual Indicators

When logged in as Principal, all input fields should show:
- **Gray background** (`bg-gray-100`)
- **Cursor not-allowed** icon on hover
- **Disabled state** (grayed out appearance)
- **No blue focus ring** when clicked

---

## 🐛 How to Check for Bugs

### Browser Console Check:
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Check Console tab for errors
3. Look for any role-related warnings

### Network Tab Check:
1. Open Network tab
2. Try to submit data as principal
3. Verify backend rejects unauthorized edits

### Local Storage Check:
```javascript
// Open console and run:
localStorage.getItem('userRole')  // Should show: "principal"
localStorage.getItem('formData')  // Should show existing data
```

---

## 🔧 If You Find Issues

### Issue: Fields are blank
**Solution:** Check if formData is loaded from localStorage
```javascript
// In console:
JSON.parse(localStorage.getItem('formData'))
```

### Issue: Fields are editable
**Solution:** Check userRole is correctly set
```javascript
// In console:
localStorage.getItem('userRole')
```

### Issue: Can submit data
**Solution:** Backend validation should block. Check network response.

---

## 📊 Test Scenarios

### Scenario 1: Fresh Login
1. Clear localStorage
2. Login as principal
3. Verify all fields are disabled

### Scenario 2: Existing Data
1. Login as faculty, fill some data
2. Logout, login as principal
3. Verify data is visible but not editable

### Scenario 3: Attempted Edit
1. Login as principal
2. Try to click/type in any field
3. Verify nothing happens

### Scenario 4: Role Switching
1. Login as faculty (should be editable)
2. Logout, login as principal (should be read-only)
3. Verify behavior changes correctly

---

## ✅ Success Criteria

The principal role fix is **SUCCESSFUL** if:
1. ✅ All input fields are disabled/read-only
2. ✅ Gray background visible on all fields
3. ✅ No console errors
4. ✅ Can view existing data
5. ✅ Cannot type or change any values
6. ✅ Backend rejects any submission attempts

---

## 🚨 Critical Test: Column B & C Access

**THE MAIN FIX:** Principal should **NOT** be able to edit columns B (HoD) and C (External).

**Test this specifically:**
1. Login as principal
2. Go to Page 3, row 1.1.1
3. Try to click on `TLP111HoD` field (Column B)
4. Try to click on `TLP111External` field (Column C)
5. **BOTH should be disabled/grayed out**

If you can click and type in these fields → **BUG FOUND**
If fields are disabled and gray → **✅ FIX WORKING**

---

## 📞 Need Help?

If the principal can still edit ANY field:
1. Check browser console for errors
2. Verify `RoleBasedInput` component is being used (not legacy input)
3. Check `rolePermissions.js` for correct principal configuration
4. Verify backend validation in `handelData.js`

---

**Date Created:** November 7, 2025
**Status:** Ready for Testing
**Critical Fix:** Principal access to columns B & C blocked
