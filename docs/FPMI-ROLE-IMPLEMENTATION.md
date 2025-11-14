# FPMI Role-Based Access Control Implementation

## Overview

This document describes the implementation of role-based access control for the Faculty Performance Measuring Index (FPMI) form system. The implementation ensures that different user roles see appropriate data visibility and editing permissions.

## Role Configuration

The system implements the following role-based behavior:

### 1. Faculty
- **Can view and edit**: Self-evaluation (A) column only
- **Cannot see**: Evaluation by HoD (B) and Evaluation by External (C) columns (shown as "—")
- **File uploads**: Only for Self-evaluation fields

### 2. HOD (Head of Department)
- **Can view**: Self-evaluation (A) column (read-only)
- **Can edit**: Evaluation by HoD (B) column only
- **Cannot see**: Evaluation by External (C) column (shown as "—")

### 3. External Evaluator
- **Can view**: All three columns (A, B, and C)
- **Can edit**: Evaluation by External (C) column only
- **Read-only**: Self-evaluation (A) and Evaluation by HoD (B) columns

### 4. Principal
- **Can view**: All three columns (A, B, and C)
- **Cannot edit**: Any columns (all read-only) - completely frozen access
- **Signature**: Can only edit their own signature field (principleName)

### 5. Admin
- **Can view**: All three columns (A, B, and C)
- **Can edit**: All three columns (A, B, and C)
- **Full access**: Complete administrative control over all evaluations

## Implementation Details

### 1. Backend Changes

#### File: `/Backend/controller/handelData.js`
- Added role access configuration
- Implemented `validateRoleBasedFields()` function to filter editable fields on submission
- Implemented `filterDataForRole()` function to hide non-visible data when fetching
- Updated `createOrUpdateEmployee()` to validate role permissions before saving
- Updated `getEmployeeById()` to filter response data based on user role

#### File: `/Backend/routers/router.js`
- Added authentication middleware (`protect`) to data endpoints
- Protected routes: `/addData`, `/getData/:id`, `/getEmpCode`

### 2. Frontend Changes

#### Core Utilities

**File: `/Frontend/src/utils/rolePermissions.js`**
- Central role configuration with permissions mapping
- Utility functions for checking visibility and editability
- Data filtering functions for display and submission

**File: `/Frontend/src/hooks/useRoleBasedData.js`**
- Custom React hook providing role-based data management
- Easy-to-use interface for components

#### Components

**File: `/Frontend/src/components/RoleBasedInput.jsx`**
- Smart input component that automatically handles role-based visibility and editing
- Shows "—" placeholder for non-visible fields
- Applies appropriate styling for read-only fields

**File: `/Frontend/src/components/RoleBasedTextarea.jsx`**
- Similar to RoleBasedInput but for textarea fields (remarks)
- Configurable allowed and editable roles

### **Pages Updated:**

**Completed:**
- **Page3** (TLP fields): All TLP111-TLP114 Self/HoD/External fields updated
- **Page7** (Summary/Submission): Remarks sections and submission data filtering
- **Page2** (FPMI Summary): Table columns show/hide based on role + signature fields role-controlled
- **App.jsx**: Fixed isReadOnly logic to include principal for complete read-only access

**Partially Completed:**
- **Page4** (PDRC fields): Imports added, PDRC211 fields updated as examples

**Remaining Work:**
- Complete Page4 (all remaining PDRC fields)
- Update Page5 (CDL fields) 
- Update Page6 (IOW fields)

### **Signature Fields (Page2):**
- **HOD**: Can edit HODName field only
- **External**: Can edit externalEvaluatorName field only  
- **Principal**: Can edit principleName field only
- **Admin**: Can edit all signature fields
- **Faculty**: Cannot edit any signature fields

### 3. Key Features

#### Data Security
- Backend validates all submissions and ignores non-editable fields
- Frontend filters data on fetch to hide non-visible columns
- No sensitive data reaches unauthorized roles

#### User Experience
- Consistent table layout maintained across all roles
- Non-visible fields show "—" instead of being hidden
- Clear visual distinction between editable and read-only fields

#### PDF Generation
- PDF uses full dataset internally regardless of UI restrictions
- No role-based filtering affects document generation

## Usage Instructions

### Using RoleBasedInput Component

```jsx
import RoleBasedInput from "../components/RoleBasedInput";

<RoleBasedInput
  fieldKey="TLP111Self"        // Field identifier (must end with Self/HoD/External)
  userRole={userRole}          // Current user's role
  formData={formData}          // Form data object
  handleInputChange={handleInputChange}  // Change handler function
  className="custom-class"     // Optional styling
/>
```

### Using RoleBasedTextarea Component

```jsx
import RoleBasedTextarea from "../components/RoleBasedTextarea";

<RoleBasedTextarea
  name="RemarksHoD"                    // Field name
  userRole={userRole}                  // Current user's role
  formData={formData}                  // Form data object
  handleInputChange={handleInputChange} // Change handler
  allowedRoles={['hod', 'external', 'principal']}  // Roles that can view
  editableRoles={['hod']}              // Roles that can edit
/>
```

## Completing the Implementation

### Step 1: Update Page4 (PDRC Fields)

Replace all remaining input fields in Page4 that follow this pattern:

```jsx
// OLD PATTERN
<input
  type="number"
  value={userRole === "external" ? "" : formData["PDRC212HoD"] || ""}
  disabled={userRole === "external"}
  readOnly={userRole==="faculty"}
  onChange={(e) => handleInputChange(e, "PDRC212HoD")}
  min="0"
  max="10"
  className="border p-2 w-full"
/>

// NEW PATTERN
<RoleBasedInput
  fieldKey="PDRC212HoD"
  userRole={userRole}
  formData={formData}
  handleInputChange={handleInputChange}
  className="border p-2 w-full"
/>
```

Fields to update in Page4:
- PDRC212Self, PDRC212HoD, PDRC212External
- PDRC213Self, PDRC213HoD, PDRC213External
- PDRC214Self, PDRC214HoD, PDRC214External
- PDRC221Self, PDRC221HoD, PDRC221External
- PDRC222Self, PDRC222HoD, PDRC222External

Also update file upload visibility:
```jsx
// OLD
{userRole === "faculty" ? (
// NEW  
{canEditColumn('self') ? (
```

### Step 2: Update Page5 (CDL Fields)

Add imports:
```jsx
import RoleBasedInput from "../components/RoleBasedInput";
import { useRoleBasedData } from "../hooks/useRoleBasedData";

const Page5 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
  const { canEditColumn } = useRoleBasedData(userRole, formData);
```

Update all CDL fields following the same pattern as above.

### Step 3: Update Page6 (IOW Fields)

Follow the same pattern for all IOW fields (IOW511, IOW512, IOW513, etc.).

### Step 4: Testing

Test with different user roles:
1. Create accounts with different roles (faculty, hod, external, principal)
2. Verify visibility and editability for each role
3. Test form submission to ensure only allowed fields are saved
4. Verify PDF generation works correctly

## Configuration Changes

To modify role permissions, edit `/Frontend/src/utils/rolePermissions.js`:

```javascript
export const roleAccess = {
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
  },
  admin: { 
    editable: ['self', 'hod', 'external'], 
    visible: ['self', 'hod', 'external'] 
  },
  // ... add new roles or modify existing ones
};
```

## Security Considerations

1. **Backend Validation**: All role checks happen on both frontend and backend
2. **Data Filtering**: Non-visible data is filtered out before sending to frontend
3. **Submission Validation**: Backend ignores fields that role cannot edit
4. **Authentication**: All protected endpoints require valid JWT token

## Error Handling

The system gracefully handles:
- Invalid role configurations (defaults to faculty permissions)
- Missing field data (shows empty or "—")
- Network errors during submission
- Unauthorized access attempts

## Future Enhancements

1. **Dynamic Role Configuration**: Admin interface to modify role permissions
2. **Audit Trail**: Track who made what changes and when
3. **Workflow Management**: Multi-step approval process
4. **Field-Level Permissions**: More granular control over individual fields