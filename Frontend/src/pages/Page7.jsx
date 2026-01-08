import React, { useState } from 'react';
import axiosInstance from '../helper/axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRoleBasedData from '../hooks/useRoleBasedData';
import RoleBasedTextarea from '../components/RoleBasedTextarea';
import RemarksBox from '../components/RemarksBox';
import { generateSimpleFPMIPDF } from '../utils/simplePdfGenerator';

const Page7 = ({formData,setFormData,onPrevious,isReadOnly,userRole}) => {
  const navigate=useNavigate()
  const { getSubmissionData, canViewColumn } = useRoleBasedData(userRole, formData);
  
  const handleInputChange = (e) => {
    const {name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // Store updated data in localStorage
      localStorage.setItem("formData", JSON.stringify(updatedData)); 
      return updatedData;
    });
  };

  const handleSubmit = async () => {
    const confirmSubmit = window.confirm("This action will submit the form data. Do you want to proceed?");
    if (!confirmSubmit) return;
    
    // Filter form data based on role permissions before submission
    const filteredFormData = getSubmissionData(formData);
    
    const evaluationData = new FormData();
    
    console.log('=== FINAL FORM SUBMISSION ===');
    console.log('Total fields in formData:', Object.keys(filteredFormData).length);
    
    // Count image fields
    const imageFields = Object.keys(filteredFormData).filter(k => k.endsWith('Image'));
    const imageUrls = imageFields.filter(k => {
      const val = filteredFormData[k];
      return typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));
    });
    console.log(`Image fields: ${imageFields.length} total, ${imageUrls.length} with Cloudinary URLs`);

    for (const [key, value] of Object.entries(filteredFormData)) {
      if (value === null || value === undefined) continue;
      
      if (key === 'categoriesTotal' && typeof value === 'object') {
        evaluationData.append(key, JSON.stringify(value));
      }
      else if (key === 'remarks' && typeof value === 'object') {
        // Convert remarks Map to plain object for submission
        const remarksObj = {};
        if (value instanceof Map) {
          value.forEach((val, key) => {
            remarksObj[key] = val;
          });
        } else {
          Object.assign(remarksObj, value);
        }
        evaluationData.append(key, JSON.stringify(remarksObj));
      }
      else if (key.endsWith('Image')) {
        // CRITICAL FIX: Send File objects to backend for Cloudinary upload
        // Also send existing Cloudinary URLs
        if (value instanceof File || value instanceof Blob) {
          // New file upload - send to backend for Cloudinary upload
          console.log(`Including new file upload: ${key} (${value.size} bytes, ${value.type})`);
          evaluationData.append(key, value);
        }
        else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
          // Already uploaded to Cloudinary, send the URL as-is
          const displayUrl = value.length > 60 ? value.substring(0, 60) + '...' : value;
          console.log(`Including existing image URL: ${key} = ${displayUrl}`);
          evaluationData.append(key, value);
        }
        // Skip FILE_PENDING markers and base64 (shouldn't exist anymore)
        else if (value !== 'FILE_PENDING') {
          console.log(`Skipping invalid value for ${key}:`, typeof value);
        }
      }
      else {
        evaluationData.append(key, value);
      }
    }
    
    try {
      const response = await axiosInstance.post("/addData", evaluationData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('=== SUBMISSION RESPONSE ===');
      console.log('Response:', response.data);
      
      if (response?.data?.success) {
        // Show success message
        toast.success("Form submitted successfully!");
        
        // Generate and download PDF after successful submission
        try {
          const filename = generateSimpleFPMIPDF(formData, userRole);
          toast.success(`PDF report generated: ${filename}`);
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError);
          toast.error("Form submitted successfully, but PDF generation failed.");
        }
        
        // Clean up localStorage
        localStorage.removeItem("selectedEmployeeCode");
        localStorage.removeItem("formData");
        
        // Navigate to thank you page
        navigate("/tankyouPage")
      } else {
        console.error('Submission failed:', response.data);
        toast.error(response.data?.message || "Form submission failed. Please try again.");
      }
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "An error occurred while submitting the form";
      
      toast.error(errorMessage);
      
      // Show detailed error in console for debugging
      if (error.response?.data?.details) {
        console.error('Error details:', error.response.data.details);
      }
    }
  };
  
  return (
    <div className="container mx-auto p-6  min-h-screen">
      <h6 className="text-2xl font-bold text-center">Criteria for Rating</h6>
      <table className="border-3 border-black w-full mt-4">
        <>
          <thead>
            <tr className="bg-pink-500">
              <td className="px-4 py-2">Faculty Rating</td>
              <td className="px-4 py-2">Outstanding</td>
              <td className="px-4 py-2">Competent</td>
              <td className="px-4 py-2">Good</td>
              <td className="px-4 py-2">Satisfactory</td>
              <td className="px-4 py-2">Poor</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-pink-200 px-4 py-2">Professor</td>
              <td className="px-4 py-2">{">"}250Marks</td>
              <td className="px-4 py-2">{">"}225-250Marks</td>
              <td className="px-4 py-2">200-225Marks</td>
              <td className="px-4 py-2">175-200Marks</td>
              <td className="px-4 py-2">below 175Marks</td>
            </tr>
            <tr>
              <td className="bg-pink-200 px-4 py-2">Associate Professor</td>
              <td className="px-4 py-2">{">"}225Marks</td>
              <td className="px-4 py-2">200-225Marks</td>
              <td className="px-4 py-2">175-200Marks</td>
              <td className="px-4 py-2">150-175Marks</td>
              <td className="px-4 py-2">below 150Marks</td>
            </tr>
            <tr>
              <td className="bg-pink-200 px-4 py-2">Assistant Professor</td>
              <td className="px-4 py-2">{">"}200Marks</td>
              <td className="px-4 py-2">180-200Marks</td>
              <td className="px-4 py-2">160-180Marks</td>
              <td className="px-4 py-2">140-160Marks</td>
              <td className="px-4 py-2">below 140Marks</td>
            </tr>
          </tbody>
        </>
      </table>

      <p className="mt-4 text-sm text-gray-600">
        Note: The evaluation of score is based on taking average of three (Self, HoD, External Audit Member)
      </p>

      {canViewColumn('hod') && (
        <div className="mt-4">
          <label className="block text-lg font-semibold">Remarks by HoD:</label>
          <RoleBasedTextarea
            name="RemarksHoD"
            userRole={userRole}
            formData={formData}
            handleInputChange={handleInputChange}
            allowedRoles={['hod', 'external', 'principal']}
            editableRoles={['hod']}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block text-lg font-semibold">Remarks by External Auditor:</label>
        <RoleBasedTextarea
          name="RemarksExternal"
          userRole={userRole}
          formData={formData}
          handleInputChange={handleInputChange}
          allowedRoles={['external', 'principal']}
          editableRoles={['external']}
        />

        <label className="block text-lg font-semibold mt-4">Remarks by Principal:</label>
        <RoleBasedTextarea
          name="RemarksPrincipal"
          userRole={userRole}
          formData={formData}
          handleInputChange={handleInputChange}
          allowedRoles={['principal']}
          editableRoles={['principal']}
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit
        </button>
       
      </div>
    </div>
  );
};

export default Page7;

