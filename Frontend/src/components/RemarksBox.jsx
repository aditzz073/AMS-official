import React, { useState, useEffect } from 'react';
import { canEditRemarks, canViewRemarks } from '../utils/rolePermissions';

const RemarksBox = ({ 
  sectionId, 
  sectionTitle,
  userRole, 
  formData, 
  setFormData,
  maxLength = 1000 
}) => {
  const [remark, setRemark] = useState('');
  const [charCount, setCharCount] = useState(0);
  const canEdit = canEditRemarks(userRole);
  const canView = canViewRemarks(userRole);

  // Initialize remark from formData
  useEffect(() => {
    if (formData?.remarks && formData.remarks[sectionId]) {
      const remarkText = formData.remarks[sectionId];
      setRemark(remarkText);
      setCharCount(remarkText.length);
    }
  }, [formData, sectionId]);

  // Don't render if user cannot view remarks
  if (!canView) {
    return null;
  }

  const handleRemarkChange = (e) => {
    const newRemark = e.target.value;
    
    // Enforce max length
    if (newRemark.length > maxLength) {
      return;
    }

    setRemark(newRemark);
    setCharCount(newRemark.length);

    // Update formData
    setFormData((prev) => {
      const updatedRemarks = {
        ...(prev.remarks || {}),
        [sectionId]: newRemark
      };
      
      const updatedData = {
        ...prev,
        remarks: updatedRemarks
      };

      // Save to localStorage
      localStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  return (
    <div className="remarks-container my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="font-semibold text-gray-700 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-yellow-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Remarks {sectionTitle && `- ${sectionTitle}`}
          {canEdit && <span className="ml-2 text-xs text-yellow-600">(HOD, Principal and External Evaluator)</span>}
        </label>
        <span className={`text-sm ${charCount > maxLength * 0.9 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          {charCount} / {maxLength}
        </span>
      </div>
      
      <textarea
        value={remark}
        onChange={handleRemarkChange}
        readOnly={!canEdit}
        disabled={!canEdit}
        placeholder={canEdit ? "Enter remarks for this section..." : "No remarks added"}
        className={`w-full p-3 border rounded-lg resize-y min-h-[100px] max-h-[300px] focus:outline-none focus:ring-2 ${
          canEdit 
            ? 'bg-white border-gray-300 focus:ring-yellow-400 focus:border-yellow-400' 
            : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
        }`}
        rows={4}
      />
      
      {canEdit && (
        <p className="text-xs text-gray-500 mt-2 flex items-start">
          <svg 
            className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Add detailed observations, recommendations, or notes for this section. 
            These remarks will be visible to Principal, Director, Admin, and Review Panel.
          </span>
        </p>
      )}
    </div>
  );
};

export default RemarksBox;
