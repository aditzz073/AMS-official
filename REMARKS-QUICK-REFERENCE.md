# 🚀 Remarks Feature - Quick Reference Card

## For HOD Users

### Adding Remarks
1. Open any evaluation form
2. Navigate to any section (TLP, PDRC, CDL, CIL, IOW)
3. Scroll to find the **yellow remarks box**
4. Type your observations/recommendations
5. Watch the character counter (max 1000 chars)
6. Remarks auto-save as you type ✨
7. Click Submit to save to database

### Editing Remarks
- Simply click in the remarks box and edit
- Changes save automatically to localStorage
- Submit form to save to database

---

## For Principal Users

### Viewing Remarks
1. Open any evaluation form
2. Scroll through sections
3. View HOD remarks in **read-only mode**
4. Remarks appear in gray, disabled boxes
5. Cannot edit or add new remarks

---

## For Faculty/External Users

### Remarks Access
- Remarks boxes **do not appear** on your screen
- This is intentional for privacy
- Only HOD adds evaluation remarks

---

## Section IDs Quick Reference

```
Section 1 (TLP)           → section-1-tlp
Section 2.1 (Teaching)    → section-2-1-pdrc-teaching  
Section 2.2 (Research)    → section-2-2-pdrc-research
Section 2 (PDRC Overall)  → section-2-pdrc
Section 3 (CDL)           → section-3-cdl
Section 4 (CIL)           → section-4-cil
Section 5.1 (IOW A)       → section-5-1-iow-a
Section 5.2 (IOW B)       → section-5-2-iow-b  
Section 5 (IOW Overall)   → section-5-iow
```

---

## API Quick Test

### Get Remarks (cURL)
```bash
curl -X GET http://localhost:5000/remarks/EMP001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Remark (cURL)
```bash
curl -X PUT http://localhost:5000/remarks/EMP001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "section-1-tlp",
    "remark": "Excellent teaching performance"
  }'
```

---

## Troubleshooting One-Liners

| Problem | Solution |
|---------|----------|
| Remarks not showing | Check user role (must be HOD/Principal/Admin) |
| Can't edit | Verify you're logged in as HOD or Admin |
| Not saving | Check browser console, verify API is running |
| Character counter wrong | Refresh page, clear localStorage |
| 403 Error | Check JWT token and user role |

---

## File Locations Cheat Sheet

**Backend**
```
Backend/model/data.js                    (schema)
Backend/controller/remarksController.js  (logic)
Backend/controller/handelData.js         (validation)
Backend/routers/router.js               (routes)
```

**Frontend**  
```
Frontend/src/components/RemarksBox.jsx   (component)
Frontend/src/utils/rolePermissions.js    (permissions)
Frontend/src/pages/Page3.jsx            (TLP)
Frontend/src/pages/Page4.jsx            (PDRC)
Frontend/src/pages/Page5.jsx            (CDL)
Frontend/src/pages/Page6.jsx            (IOW)
Frontend/src/pages/Page7.jsx            (CIL + submit)
```

---

## Role Permissions Matrix

| Role | View | Edit |
|------|------|------|
| Faculty | ❌ | ❌ |
| HOD | ✅ | ✅ |
| External | ❌ | ❌ |
| Principal | ✅ | ❌ |
| Admin | ✅ | ✅ |

---

## Component Props

```jsx
<RemarksBox
  sectionId="section-1-tlp"           // Required: unique ID
  sectionTitle="Teaching Learning"    // Required: display title
  userRole={userRole}                 // Required: current user role
  formData={formData}                 // Required: form state
  setFormData={setFormData}           // Required: state setter
  maxLength={1000}                    // Optional: default 1000
/>
```

---

## Database Schema

```javascript
{
  remarks: {
    type: Map,
    of: String,
    default: {}
  }
}
```

---

## Character Limit Colors

- **Green**: 0-899 characters ✅
- **Red/Bold**: 900-1000 characters ⚠️
- **Blocked**: Over 1000 characters ❌

---

## Local Storage Key

```javascript
localStorage.getItem("formData")
// Contains all form data including remarks object
```

---

## Quick Deploy

```bash
# Backend
cd Backend && npm start

# Frontend  
cd Frontend && npm run dev

# Production Build
cd Frontend && npm run build
```

---

## Feature Highlights

✨ **11 remarks boxes** across 5 pages  
🔐 **Role-based access** control  
💾 **Auto-save** to localStorage  
📊 **Character counter** (1000 max)  
🎨 **Yellow-themed** design  
📱 **Responsive** layout  
🔄 **RESTful APIs** for CRUD operations  

---

## Support Resources

📖 **Full Documentation**: `SECTION-REMARKS-FEATURE.md`  
🚀 **Deployment Guide**: `REMARKS-DEPLOYMENT-GUIDE.md`  
📋 **Summary**: `IMPLEMENTATION-SUMMARY.md`  
❓ **This Card**: Quick reference for daily use  

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Print this for your desk! 🖨️**
