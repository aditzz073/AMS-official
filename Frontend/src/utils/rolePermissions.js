// Role-based access control configuration for FPMI
export const roleAccess = {
  faculty: { 
    editable: ['self'], 
    visible: ['self'],
    canEditRemarks: false,
    canViewRemarks: false
  },
  hod: { 
    editable: ['hod'], 
    visible: ['self', 'hod'],
    canEditRemarks: true,
    canViewRemarks: true
  },
  external: { 
    editable: ['external'], 
    visible: ['self', 'hod', 'external'],
    canEditRemarks: true,
    canViewRemarks: true
  },
  principal: { 
    editable: [], 
    visible: ['self', 'hod', 'external'],
    canEditRemarks: true,
    canViewRemarks: true
  },
  admin: { 
    editable: ['self', 'hod', 'external'], 
    visible: ['self', 'hod', 'external'],
    canEditRemarks: true,
    canViewRemarks: true
  },
};

// Column types mapping
export const columnTypes = {
  self: 'Self',
  hod: 'HoD', 
  external: 'External'
};

//Get role permissions for a given user role
export const getRolePermissions = (userRole) => {
  const normalizedRole = userRole?.toLowerCase();
  return roleAccess[normalizedRole] || roleAccess.faculty;
};

// Check if a column is editable for a role
export const isColumnEditable = (userRole, columnType) => {
  const permissions = getRolePermissions(userRole);
  return permissions.editable.includes(columnType);
};

// Check if a column is visible for a role
export const isColumnVisible = (userRole, columnType) => {
  const permissions = getRolePermissions(userRole);
  return permissions.visible.includes(columnType);
};

// Filter form data based on role permissions - only show allowed columns
export const filterDataForRole = (data, userRole) => {
  const permissions = getRolePermissions(userRole);
  const filteredData = { ...data };
  
  // List of field patterns to check
  const fieldPatterns = [
    { pattern: /Self$/, type: 'self' },
    { pattern: /HoD$/, type: 'hod' },
    { pattern: /External$/, type: 'external' }
  ];
  
  // Filter out non-visible columns by setting them to empty string
  Object.keys(filteredData).forEach(key => {
    for (const { pattern, type } of fieldPatterns) {
      if (pattern.test(key)) {
        if (!permissions.visible.includes(type)) {
          filteredData[key] = '';
        }
        break;
      }
    }
  });
  
  return filteredData;
};

// Get field value for display - returns empty string if not visible to role
export const getFieldValueForRole = (data, fieldKey, userRole) => {
  // Handle undefined or null fieldKey
  if (!fieldKey) {
    return '';
  }
  
  // Handle undefined or null data
  if (!data) {
    console.warn('getFieldValueForRole: data is undefined/null');
    return '';
  }
  
  const permissions = getRolePermissions(userRole);
  
  // Determine field type based on suffix
  let fieldType = null;
  if (fieldKey.endsWith('Self')) fieldType = 'self';
  else if (fieldKey.endsWith('HoD')) fieldType = 'hod';
  else if (fieldKey.endsWith('External')) fieldType = 'external';
  
  // If field type is determined and not visible, return empty string
  if (fieldType && !permissions.visible.includes(fieldType)) {
    console.log(`Field ${fieldKey} not visible for role ${userRole}. Permissions:`, permissions);
    return '';
  }
  
  const value = data[fieldKey];
  return value !== undefined && value !== null ? value : '';
};

// Filter form data for submission - only include editable fields for the role
export const filterSubmissionDataForRole = (data, userRole) => {
  const permissions = getRolePermissions(userRole);
  const filteredData = { ...data };
  
  // List of field patterns to check
  const fieldPatterns = [
    { pattern: /Self$/, type: 'self' },
    { pattern: /HoD$/, type: 'hod' },
    { pattern: /External$/, type: 'external' }
  ];
  
  // Remove non-editable fields from submission
  Object.keys(filteredData).forEach(key => {
    for (const { pattern, type } of fieldPatterns) {
      if (pattern.test(key)) {
        if (!permissions.editable.includes(type)) {
          delete filteredData[key];
        }
        break;
      }
    }
  });
  
  return filteredData;
};

// Check if user can edit remarks
export const canEditRemarks = (userRole) => {
  const permissions = getRolePermissions(userRole);
  return permissions.canEditRemarks || false;
};

// Check if user can view remarks
export const canViewRemarks = (userRole) => {
  const permissions = getRolePermissions(userRole);
  return permissions.canViewRemarks || false;
};