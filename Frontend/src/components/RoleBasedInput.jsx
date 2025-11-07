import React from 'react';
import { isColumnEditable } from '../utils/rolePermissions';

const RoleBasedInput = ({ 
  // New pattern props (Pages 3, some of Page 4)
  fieldKey,
  userRole,
  formData,
  handleInputChange,
  // Old pattern props (Pages 4, 5, 6 - backward compatibility)
  fieldName,
  columnType: columnTypeProp,
  // Common props
  className = "border p-2 w-full",
  min = "0",
  max = "10",
  type = "number",
  placeholder = "",
  ...props
}) => {
  // Support both patterns: use fieldKey if provided, otherwise use fieldName
  const actualFieldKey = fieldKey || fieldName;
  
  // Handle missing fieldKey/fieldName
  if (!actualFieldKey) {
    console.warn('RoleBasedInput: No fieldKey or fieldName provided');
    return null;
  }

  // For old pattern (fieldName), we need to get data from localStorage
  // since no props are passed
  let actualUserRole = userRole;
  let actualFormData = formData;
  let actualHandleInputChange = handleInputChange;
  
  if (!actualUserRole || !actualFormData || !actualHandleInputChange) {
    // Fallback: Get from localStorage for old pattern components
    try {
      const authState = JSON.parse(localStorage.getItem('authState'));
      actualUserRole = actualUserRole || authState?.role;
      
      const storedFormData = JSON.parse(localStorage.getItem('formData'));
      actualFormData = actualFormData || storedFormData;
      
      // For old pattern, we can't have handleInputChange, so make a dummy function
      if (!actualHandleInputChange) {
        actualHandleInputChange = () => {
          console.warn('RoleBasedInput: handleInputChange not available for', actualFieldKey);
        };
      }
    } catch (e) {
      console.error('RoleBasedInput: Failed to get data from localStorage', e);
    }
  }

  // Determine column type from field key or use provided columnType
  let columnType = columnTypeProp;
  if (!columnType) {
    if (actualFieldKey.endsWith('Self')) columnType = 'self';
    else if (actualFieldKey.endsWith('HoD')) columnType = 'hod';
    else if (actualFieldKey.endsWith('External')) columnType = 'external';
  }
  
  // Get value directly from formData - simple and straightforward
  const value = actualFormData?.[actualFieldKey] || '';
  
  // Check if this column is editable for the current role
  const isEditable = columnType ? isColumnEditable(actualUserRole, columnType) : false;
  
  // Determine if field should be read-only
  const isReadOnly = !isEditable;
  
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => actualHandleInputChange(e, actualFieldKey)}
      className={`${className} ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      min={min}
      max={max}
      placeholder={placeholder}
      disabled={isReadOnly}
      readOnly={isReadOnly}
      {...props}
    />
  );
};

export default RoleBasedInput;