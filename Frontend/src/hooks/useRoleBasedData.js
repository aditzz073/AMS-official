import { useMemo } from 'react';
import { 
  getRolePermissions, 
  isColumnEditable, 
  isColumnVisible, 
  getFieldValueForRole,
  filterSubmissionDataForRole 
} from '../utils/rolePermissions';

// Custom hook for role-based data management
export const useRoleBasedData = (userRole, formData) => {
  const permissions = useMemo(() => getRolePermissions(userRole), [userRole]);
  
  // Get field value that respects role visibility
  const getFieldValue = (fieldKey) => {
    if (!fieldKey) return '';
    return getFieldValueForRole(formData, fieldKey, userRole);
  };
  
  // Check if field is editable
  const isFieldEditable = (fieldKey) => {
    if (!fieldKey) return false;
    
    let fieldType = null;
    if (fieldKey.endsWith('Self')) fieldType = 'self';
    else if (fieldKey.endsWith('HoD')) fieldType = 'hod';
    else if (fieldKey.endsWith('External')) fieldType = 'external';
    
    return fieldType ? isColumnEditable(userRole, fieldType) : false;
  };
  
  // Check if field is visible
  const isFieldVisible = (fieldKey) => {
    if (!fieldKey) return false;
    
    let fieldType = null;
    if (fieldKey.endsWith('Self')) fieldType = 'self';
    else if (fieldKey.endsWith('HoD')) fieldType = 'hod';
    else if (fieldKey.endsWith('External')) fieldType = 'external';
    
    return fieldType ? isColumnVisible(userRole, fieldType) : true;
  };
  
  // Get filtered data for submission
  const getSubmissionData = (data) => {
    return filterSubmissionDataForRole(data, userRole);
  };
  
  // Check if a column type is editable
  const canEditColumn = (columnType) => {
    return isColumnEditable(userRole, columnType);
  };
  
  // Check if a column type is visible
  const canViewColumn = (columnType) => {
    return isColumnVisible(userRole, columnType);
  };
  
  return {
    permissions,
    getFieldValue,
    isFieldEditable,
    isFieldVisible,
    getSubmissionData,
    canEditColumn,
    canViewColumn
  };
};

export default useRoleBasedData;