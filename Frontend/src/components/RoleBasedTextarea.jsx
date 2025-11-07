import React from 'react';

const RoleBasedTextarea = ({ 
  name, 
  userRole, 
  formData, 
  handleInputChange, 
  className = "w-full p-2 mt-2 border border-gray-300 rounded-md",
  placeholder = "—",
  allowedRoles = [],
  editableRoles = []
}) => {
  // Normalize role for consistent comparison
  const normalizedRole = userRole?.toLowerCase();
  
  // Determine if the current user role can view this field
  // Only admin can view all fields regardless of allowedRoles
  // Others must be explicitly in allowedRoles array
  const canView = normalizedRole === 'admin' || allowedRoles.includes(normalizedRole);
  
  // Determine if the current user role can edit this field
  // Check if role is in editableRoles array OR if admin
  const canEdit = normalizedRole === 'admin' 
                  ? true 
                  : editableRoles.includes(normalizedRole);
  
  // Get field value based on visibility permissions
  const fieldValue = canView ? (formData[name] || '') : '';
  
  // Determine if field should be read-only
  const shouldBeReadOnly = !canEdit;
  
  // If user can't view, don't render the field at all
  if (!canView) {
    return null;
  }
  
  return (
    <textarea
      name={name}
      value={fieldValue}
      readOnly={shouldBeReadOnly}
      disabled={shouldBeReadOnly}
      onChange={canEdit ? handleInputChange : undefined}
      className={`${className} ${shouldBeReadOnly || !canView ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
      placeholder={fieldValue === '' ? placeholder : undefined}
    />
  );
};

export default RoleBasedTextarea;