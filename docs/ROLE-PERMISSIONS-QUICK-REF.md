# Role Permissions Quick Reference

**Last Updated:** December 6, 2025  
**Status:** ✅ Verified and Fixed

---

## Quick Permission Matrix

| Role | Can Edit | Can View | Special Permissions |
|------|----------|----------|-------------------|
| **Faculty** | Self column (own) | Self column (own) | ✅ Edit own basic profile |
| **HOD** | HoD column | Self + HoD | ✅ Edit section remarks + RemarksHoD |
| **External** | External column | Self + HoD + External | ✅ Edit RemarksExternal only |
| **Principal** | ❌ None (read-only) | Self + HoD + External | ✅ View section remarks + Edit RemarksPrincipal |
| **Admin** | All columns | All columns | ✅ Edit all remarks (NOT basic info) |

---

## Critical Fixes Applied

### 1. Admin Basic Info ✅ FIXED
**Before:** Admin could edit basic employee info  
**After:** Only faculty can edit basic info (admin read-only)  
**Files:** `Page1.jsx`, `basicEmployeeInfoController.js`

### 2. External Remarks ✅ FIXED
**Before:** External could view/edit section remarks  
**After:** External cannot access section remarks at all  
**Files:** `rolePermissions.js`

### 3. Principal Clarified ✅
**Section Remarks:** View only (read-only)  
**RemarksPrincipal Field:** Can edit  
**Files:** `rolePermissions.js`

---

## Remarks Types

### Section-Wise Remarks (RemarksBox)
- **Locations:** Pages 3, 4, 5, 6
- **Editable by:** HOD, Admin
- **Visible to:** HOD, Principal, Admin
- **Hidden from:** Faculty, External

### Remark Fields (Page 7)
- **RemarksHoD:** HOD editable, others read-only
- **RemarksExternal:** External editable, others read-only
- **RemarksPrincipal:** Principal editable, others hidden

---

## PDF Visibility

### Roles That See Remarks in PDF
- ✅ HOD
- ✅ Principal
- ✅ ExternalEvaluator (External)
- ✅ Admin

### Roles That DON'T See Remarks
- ❌ Faculty

**Mapping:** `hod→HOD`, `principal→Principal`, `external→ExternalEvaluator`, `admin→Admin`

---

## Basic Info Editing

**ONLY FACULTY** can edit basic employee info fields:
- Employee Code
- Name, Designation, Department
- College, Campus
- Joining Date, Period of Assessment
- Evaluator Names

**All other roles** (HOD, External, Principal, Admin) are **READ-ONLY** for basic info.

---

## Employee Selection

| Role | Can Select? | Scope |
|------|-------------|-------|
| Faculty | ❌ No | Own record automatically loaded |
| HOD | ✅ Yes | Any employee in department |
| External | ✅ Yes | Assigned employees |
| Principal | ✅ Yes | Any employee in institution |
| Admin | ✅ Yes | Any employee in system |

---

## Backend Validation

### handelData.js
- Removes unauthorized fields before save
- HOD/Admin only for section remarks
- Role-based visibility filtering

### remarksController.js
- HOD/Admin can edit section remarks
- HOD/Principal/Admin can view section remarks
- External/Faculty blocked with 403

### basicEmployeeInfoController.js
- Faculty only for updates (403 for others)
- HOD/External/Principal/Admin can search/view

---

## Testing Checklist

- [ ] Faculty cannot edit HOD/External columns
- [ ] Faculty cannot see section remarks
- [ ] HOD cannot edit basic info
- [ ] External cannot see section remarks
- [ ] Principal cannot edit any columns
- [ ] Principal can view section remarks (read-only)
- [ ] Principal can edit RemarksPrincipal field
- [ ] Admin cannot edit basic info
- [ ] Admin can edit all columns and remarks
- [ ] Faculty PDF doesn't show remarks
- [ ] Other PDFs show remarks

---

**Full Documentation:** See `ROLE-PERMISSIONS-AUDIT.md`
