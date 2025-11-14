# Section-wise Remarks Feature

## Overview
This document describes the implementation of section-wise remarks functionality in the Appraisal Management System. The feature allows HODs to add detailed remarks for each section and subsection of the performance evaluation form.

## Features Implemented

### 1. Role-Based Access Control
- **HOD & Admin**: Can view and edit all remarks
- **Principal, Director**: Can view remarks (read-only)
- **Faculty, Evaluator, External**: Cannot see remarks

### 2. Remarks Locations
Remarks have been added after the following sections:

#### Section 1: Teaching Learning Process (TLP)
- **Location**: Page3
- **Section ID**: `section-1-tlp`

#### Section 2: Professional Development and Research Contribution (PDRC)
- **Location**: Page4
- **Section ID**: `section-2-pdrc` (Overall)
- **Subsection 2.1 ID**: `section-2-1-pdrc-teaching`
- **Subsection 2.2 ID**: `section-2-2-pdrc-research`

#### Section 3: Contribution at Department Level (CDL)
- **Location**: Page5
- **Section ID**: `section-3-cdl`

#### Section 4: Contribution at Institutional Level (CIL)
- **Location**: Page7
- **Section ID**: `section-4-cil`

#### Section 5: Interaction with the Outside World (IOW)
- **Location**: Page6
- **Section ID**: `section-5-iow` (Overall)
- **Subsection 5.1 ID**: `section-5-1-iow-a`
- **Subsection 5.2 ID**: `section-5-2-iow-b`

### 3. Remarks Box Features
- **Character Counter**: Shows current/max characters (1000 max per remark)
- **Auto-save**: Remarks are saved to localStorage on change
- **Visual Styling**: Yellow-themed design to distinguish from regular form fields
- **Responsive**: Adjustable textarea height (min 100px, max 300px)
- **Instructions**: Helper text for HOD users
- **Icon Indicators**: Visual icons for better UX

## Technical Implementation

### Backend Changes

#### 1. Database Schema (`Backend/model/data.js`)
```javascript
remarks: {
  type: Map,
  of: String,
  default: {}
}
```

#### 2. API Routes (`Backend/routers/router.js`)
```javascript
// Get remarks for an appraisal
GET /remarks/:employeeCode

// Update single remark
PUT /remarks/:employeeCode

// Bulk update remarks
PUT /remarks/:employeeCode/bulk
```

#### 3. Controller (`Backend/controller/remarksController.js`)
- `getRemarks()`: Fetch all remarks for an evaluation
- `updateRemarks()`: Update a single section remark
- `bulkUpdateRemarks()`: Update multiple section remarks at once

#### 4. Access Control (`Backend/controller/handelData.js`)
- Validates that only HOD and Admin can update remarks
- Filters remarks from responses based on user role

### Frontend Changes

#### 1. RemarksBox Component (`Frontend/src/components/RemarksBox.jsx`)
Reusable component with props:
- `sectionId`: Unique identifier for the section
- `sectionTitle`: Display title for the section
- `userRole`: Current user's role
- `formData`: Complete form data object
- `setFormData`: State setter function
- `maxLength`: Maximum character limit (default: 1000)

#### 2. Role Permissions (`Frontend/src/utils/rolePermissions.js`)
Added functions:
- `canEditRemarks(userRole)`: Check if user can edit remarks
- `canViewRemarks(userRole)`: Check if user can view remarks

#### 3. Form Submission (`Frontend/src/pages/Page7.jsx`)
- Remarks are properly serialized from Map/Object to JSON
- Included in form submission to `/addData` endpoint
- Saved to database with other evaluation data

## Data Structure

### Remarks Storage Format
```javascript
{
  "section-1-tlp": "Excellent performance in teaching...",
  "section-2-1-pdrc-teaching": "Good participation in FDPs...",
  "section-2-2-pdrc-research": "Published 2 papers in SCI journals...",
  "section-2-pdrc": "Overall strong performance in PDRC...",
  "section-3-cdl": "Active in department activities...",
  "section-4-cil": "Contributed to NAAC preparation...",
  "section-5-1-iow-a": "Delivered invited talks at 3 institutions...",
  "section-5-2-iow-b": "Served on interview panels...",
  "section-5-iow": "Good external engagement..."
}
```

## Usage Guide

### For HOD Users
1. Navigate to any evaluation form section
2. Scroll to find the yellow-highlighted "Remarks" box
3. Enter observations, recommendations, or notes
4. Character count updates in real-time
5. Remarks auto-save to localStorage
6. Submit the form to save remarks to database

### For Principal/Director Users
1. Open any evaluation form
2. View all remarks added by HOD (read-only)
3. Cannot edit or add new remarks

### For Faculty/External Users
- Remarks section is not visible
- No access to view or edit remarks

## API Documentation

### Get Remarks
```http
GET /remarks/:employeeCode
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "remarks": {
    "section-1-tlp": "Remark text...",
    "section-2-pdrc": "Remark text..."
  }
}
```

### Update Single Remark
```http
PUT /remarks/:employeeCode
Authorization: Bearer <token>
Content-Type: application/json

{
  "sectionId": "section-1-tlp",
  "remark": "Updated remark text..."
}
```

### Bulk Update Remarks
```http
PUT /remarks/:employeeCode/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": {
    "section-1-tlp": "Remark 1...",
    "section-2-pdrc": "Remark 2..."
  }
}
```

## Validation Rules

1. **Character Limit**: Maximum 1000 characters per remark
2. **Optional**: Remarks are not required (can be empty)
3. **Access Control**: Only HOD and Admin can modify
4. **Visibility**: Principal, Director, Admin, Review Panel can view

## Testing Checklist

- [ ] HOD can add remarks to all sections
- [ ] HOD can edit existing remarks
- [ ] Admin can add/edit remarks
- [ ] Principal can view but not edit remarks
- [ ] Faculty cannot see remarks section
- [ ] External evaluator cannot see remarks
- [ ] Character counter works correctly
- [ ] Remarks persist after page refresh (localStorage)
- [ ] Remarks save to database on form submission
- [ ] Remarks display correctly when loading saved evaluation
- [ ] Bulk update API works correctly
- [ ] Single update API works correctly

## Future Enhancements

1. **Versioning**: Track changes to remarks over time
2. **Rich Text**: Support for formatted text (bold, italic, lists)
3. **Attachments**: Allow file uploads with remarks
4. **Notifications**: Alert when HOD adds new remarks
5. **Templates**: Pre-defined remark templates for common scenarios
6. **Export**: Include remarks in PDF reports
7. **History**: View edit history of remarks
8. **Search**: Search across all remarks

## Files Modified

### Backend
- `Backend/model/data.js` - Added remarks field to schema
- `Backend/controller/remarksController.js` - New controller for remarks
- `Backend/controller/handelData.js` - Added remarks validation
- `Backend/routers/router.js` - Added remarks routes

### Frontend
- `Frontend/src/components/RemarksBox.jsx` - New component
- `Frontend/src/utils/rolePermissions.js` - Added remarks permissions
- `Frontend/src/pages/Page3.jsx` - Integrated RemarksBox
- `Frontend/src/pages/Page4.jsx` - Integrated RemarksBox
- `Frontend/src/pages/Page5.jsx` - Integrated RemarksBox
- `Frontend/src/pages/Page6.jsx` - Integrated RemarksBox
- `Frontend/src/pages/Page7.jsx` - Integrated RemarksBox + submission logic

## Support

For issues or questions about the remarks feature:
1. Check this documentation
2. Review role permissions configuration
3. Verify user authentication and role assignment
4. Check browser console for errors
5. Verify API endpoints are accessible

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Feature Status**: ✅ Implemented and Ready for Testing
