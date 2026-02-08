import React, { useState } from "react";
import toast from "react-hot-toast";
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import { useRoleBasedData } from "../hooks/useRoleBasedData";

const Page3 = ({ formData, setFormData, onNext, onPrevious, isReadOnly, userRole }) => {
  const [previewImages, setPreviewImages] = useState({});
  const { canEditColumn, canViewColumn } = useRoleBasedData(userRole, formData);

  // Helper function to handle text input changes with localStorage
  const handleTextInputChange = (fieldName, value) => {
    const updatedData = {
      ...formData,
      [fieldName]: value
    };
    setFormData(updatedData);
    localStorage.setItem('formData', JSON.stringify(updatedData));
  };

  const handleInputChange = (e, key) => {
    const { value } = e.target;
    
    // Define max marks for specific fields (only applies to faculty, hod, external - NOT principal)
    const maxMarks = {
      // Section 1.1.3, 1.1.4, 1.1.6 - max 8
      'TLP113Self': 8, 'TLP113HoD': 8, 'TLP113External': 8,
      'TLP114Self': 8, 'TLP114HoD': 8, 'TLP114External': 8,
      'TLP116Self': 8, 'TLP116HoD': 8, 'TLP116External': 8,
      // Section 1.1.5 - max 6
      'TLP115Self': 6, 'TLP115HoD': 6, 'TLP115External': 6,
    };
    
    // Get the max value for this field (default 10)
    const maxValue = maxMarks[key] || 10;
    
    // Skip validation for principal role
    if (userRole !== 'principal') {
      if(value < 0 || value > maxValue){
        toast.error(`Value should be between 0-${maxValue}`);
        return;
      }
    }
    
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [key]: value,
      };

      // Store updated data in localStorage
      localStorage.setItem("formData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (matching backend limit)

  
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 10MB. Please upload a smaller file.");
        return;
      }
  
      // Create data URL for preview ONLY
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setPreviewImages(prev => ({
          ...prev,
          [key]: dataUrl
        }));
      };
      reader.readAsDataURL(file);
      
      // Store the actual File object for backend upload
      setFormData(prev => {
        const updatedData = {
          ...prev,
          [`${key}Image`]: file
        };
        
        // Note: We don't save File objects to localStorage (they can't be serialized)
        // Only save the rest of the formData
        try {
          const dataToSave = { ...updatedData };
          // Remove File objects before saving to localStorage
          Object.keys(dataToSave).forEach(k => {
            if (dataToSave[k] instanceof File) {
              delete dataToSave[k];
            }
          });
          localStorage.setItem("formData", dataToSave);
        } catch (error) {
          console.error('[Page3] Error saving to localStorage:', error);
        }
        return updatedData;
      });
    }
  };

  const showImagePreview = (key) => {
    const fileUrl = formData[`${key}Image`];
    if (!fileUrl) {
      alert("No file uploaded for this field");
      return;
    }
    
    // Handle File objects (newly uploaded files not yet submitted)
    if (fileUrl instanceof File || fileUrl instanceof Blob) {
      const blobUrl = URL.createObjectURL(fileUrl);
      window.open(blobUrl, "_blank");
      return;
    }
    
    // Handle data URLs (base64 encoded files)
    if(fileUrl.startsWith('data:')){
    
    
    // Create a blob from the data URL
    const byteString = atob(fileUrl.split(',')[1]);
    const mimeString = fileUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const blobUrl = URL.createObjectURL(blob);
    
    // Open in new tab using the blob URL
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>File Preview</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f0f0;
              }
              img, embed, iframe {
                max-width: 100%;
                max-height: 90vh;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              .container {
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
      `);
      
      // Different handling based on file type
      if (mimeString.startsWith('image/')) {
        newWindow.document.write(`<img src="${blobUrl}" alt="Preview" />`);
      } else if (mimeString === 'application/pdf') {
        newWindow.document.write(`<embed src="${blobUrl}" type="application/pdf" width="800px" height="600px" />`);
      } else if (mimeString.includes('word') || mimeString.includes('excel') || mimeString.includes('powerpoint')) {
        // For office documents
        newWindow.document.write(`
          <div>
            <h3>Office document preview</h3>
            <p>This type of document cannot be previewed directly in the browser.</p>
            <a href="${blobUrl}" download="document">Download File</a>
          </div>
        `);
      } else {
        // Generic file handling
        newWindow.document.write(`
          <div>
            <h3>File preview</h3>
            <p>This type of file (${mimeString}) may not display correctly in the browser.</p>
            <a href="${blobUrl}" download="file">Download File</a>
          </div>
        `);
      }
      
      newWindow.document.write(`
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert("Pop-up blocked. Please allow pop-ups for this site to view the file.");
    }
  } else {
    // Handle Cloudinary URLs or other external URLs
    if (!fileUrl) {
      console.error("No file uploaded for this field");
      return;
    }

    // Detect file type from URL
    const urlLower = fileUrl.toLowerCase();
    const isPDF = urlLower.includes('.pdf') || urlLower.includes('/raw/upload/');
    const isImage = urlLower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)/i);
    
    // Add cache-busting timestamp to prevent old file caching
    const cacheBustedUrl = fileUrl.includes('?') ? `${fileUrl}&t=${Date.now()}` : `${fileUrl}?t=${Date.now()}`;
    
    // For PDFs from Cloudinary (raw uploads), open with proper handling
    if (isPDF) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>PDF Preview</title>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; }
                iframe { border: none; width: 100vw; height: 100vh; }
              </style>
            </head>
            <body>
              <iframe src="${cacheBustedUrl}" type="application/pdf"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback: direct link
        window.open(cacheBustedUrl, "_blank");
      }
    } else {
      // For images and other files, open directly
      window.open(cacheBustedUrl, "_blank");
    }
  }
    
  };
  
  // Validation removed - allow smooth navigation with optional fields
  // Backend will handle any required field validation on submission

  const handleNext = () => {
    // No validation - proceed directly
    onNext();
  };
  console.log(formData);
  

  return (
    <div className="p-6 min-h-screen">
      <h3 className="text-2xl font-bold text-center mb-6">
        1. Teaching Learning Process (TLP)
      </h3>

      {/* Section 1.1 - Teaching Learning Activities */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">1.1</th>
              <th
                colSpan="4"
                className="border border-gray-300 px-4 py-2 text-left"
              >
                Teaching Learning Activities - (maximum marks 50)
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sr. No</th>
              <th className="border border-gray-300 px-4 py-2">Parameter</th>
              <th className="border border-gray-300 px-4 py-2">
                Self-Evaluation
              </th>
              {canViewColumn('hod') && (
                <th className="border border-gray-300 px-4 py-2">
                  Evaluation by HoD
                </th>
              )}
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by External Audit Member
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.1</td>
              <td className="border border-gray-300 px-4 py-2">
                <ol>
                  <li>
                    Lectures taken as percentage of lectures allocated as per
                    academic calendar
                  </li>
                  <span className="text-red-600">
                    (100% compliance = 10 Marks)
                  </span>
                  <ul className="list-disc ml-4">
                    <li className="flex items-center gap-2">
                      SEMESTER No.: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111SemesterNo || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111SemesterNo: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      Total number of lectures allocated: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111LecturesAllocated || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111LecturesAllocated: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      Total number of lectures taken: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111LecturesTaken || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111LecturesTaken: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li>Makeup lectures may be counted as against any leave</li>
                  </ul>
                  <br />
                  <ul className="list-disc ml-4">
                    <li className="flex items-center gap-2">
                      SEMESTER No.: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111SemesterNo2 || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111SemesterNo2: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      Total number of lectures allocated: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111LecturesAllocated2 || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111LecturesAllocated2: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      Total number of lectures taken: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-20 focus:outline-none focus:border-blue-500"
                        value={formData.TLP111LecturesTaken2 || ''}
                        onChange={(e) => {
                          const updatedData = {
                            ...formData,
                            TLP111LecturesTaken2: e.target.value
                          };
                          setFormData(updatedData);
                          localStorage.setItem('formData', JSON.stringify(updatedData));
                        }}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li>Makeup lectures may be counted as against any leave</li>
                  </ul>
                </ol>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP111Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP111Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP111SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP111Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                    <RoleBasedInput
                      fieldKey="TLP111HoD"
                      userRole={userRole}
                      formData={formData}
                      handleInputChange={handleInputChange}
                    />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP111External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.2</td>
              <td className="border border-gray-300 px-4 py-2">
                Tutorials, practical, contact hours undertaken as percentage of those actual allocated as per academic calendar <span className="text-blue-600 font-semibold">(100% compliance = 10 Marks)</span>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP112Semester1 || ''}
                    onChange={(e) => {
                      const updatedData = { ...formData, TLP112Semester1: e.target.value };
                      setFormData(updatedData);
                      localStorage.setItem('formData', JSON.stringify(updatedData));
                    }}
                    disabled={userRole !== 'faculty'}
                  />
                </div>
                <ul className="list-none ml-4 mt-1">
                  <li className="flex items-center gap-2">
                    No. of hours of tutorials, practical allocated: 
                    <input
                      type="text"
                      placeholder="_________"
                      className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                      value={formData.TLP112S1Allocated || ''}
                      onChange={(e) => {
                        const updatedData = { ...formData, TLP112S1Allocated: e.target.value };
                        setFormData(updatedData);
                        localStorage.setItem('formData', JSON.stringify(updatedData));
                      }}
                      disabled={userRole !== 'faculty'}
                    />
                  </li>
                  <li className="flex items-center gap-2">
                    No. of hours of tutorials, practical taken: 
                    <input
                      type="text"
                      placeholder="_______"
                      className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                      value={formData.TLP112S1Taken || ''}
                      onChange={(e) => {
                        const updatedData = { ...formData, TLP112S1Taken: e.target.value };
                        setFormData(updatedData);
                        localStorage.setItem('formData', JSON.stringify(updatedData));
                      }}
                      disabled={userRole !== 'faculty'}
                    />
                  </li>
                </ul>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP112Semester2 || ''}
                    onChange={(e) => handleTextInputChange('TLP112Semester2', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                </div>
                <ul className="list-none ml-4 mt-1">
                  <li className="flex items-center gap-2">
                    No. of hours of tutorials, practical allocated: 
                    <input
                      type="text"
                      placeholder="_________"
                      className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                      value={formData.TLP112S2Allocated || ''}
                      onChange={(e) => handleTextInputChange('TLP112S2Allocated', e.target.value)}
                      disabled={userRole !== 'faculty'}
                    />
                  </li>
                  <li className="flex items-center gap-2">
                    No. of hours of tutorials, practical taken: 
                    <input
                      type="text"
                      placeholder="_______"
                      className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                      value={formData.TLP112S2Taken || ''}
                      onChange={(e) => handleTextInputChange('TLP112S2Taken', e.target.value)}
                      disabled={userRole !== 'faculty'}
                    />
                  </li>
                </ul>
                <ul className="list-disc ml-6 mt-2">
                  <li>Remedial lecturers may be counted as against any leave</li>
                </ul>
                <div className="mt-1">
                  <span className="text-blue-600 font-semibold">(Max: 10 marks)</span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP112Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP112Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP112SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP112Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                    <RoleBasedInput
                      fieldKey="TLP112HoD"
                      userRole={userRole}
                      formData={formData}
                      handleInputChange={handleInputChange}
                    />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP112External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.3</td>
              <td className="border border-gray-300 px-4 py-2">
                Extra Lectures, Remedial Lectures/Practical or other teaching duties<br />
                <span className="text-blue-600 font-semibold">(2-hour excess per week = 4 Marks for each semester)</span> <span className="text-red-600 font-semibold">(Max: 8 marks)</span><br />
                <span className="text-green-600 font-italic">(Verification for 1.1.1 to 1.1.3: Official attendance record)</span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP113Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP113Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP113SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP113Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                    <RoleBasedInput
                      fieldKey="TLP113HoD"
                      userRole={userRole}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      max="8"
                    />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP113External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
              </td>
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-300 px-4 py-2">1.1.4</td>
              <td className="border border-gray-300 px-4 py-2">
                Semester End Examination duties (Question paper setting, evaluation of answer scripts etc.) as per duties allotted <span className="text-blue-600 font-semibold">(100% compliance = 4 Marks/sem)</span> <span className="text-red-600 font-semibold">(Max: 8 marks)</span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP114Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP114Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP114SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP114Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                    <RoleBasedInput
                      fieldKey="TLP114HoD"
                      userRole={userRole}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      max="8"
                    />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP114External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
              </td>
            </tr>

            {/* 1.1.5 - Internal examination/Evaluation duties */}
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.5</td>
              <td className="border border-gray-300 px-4 py-2">
                Internal examination/Evaluation duties for internal/ continuous assessment work as allotted{" "}
                <span className="text-blue-600">(100% compliance = 3 Marks/sem)</span>
                <br />
                <span className="text-red-600">(Max: 6 marks)</span>{" "}
                <span className="text-green-600">(Verification for 1.1.4 to 1.1.5 : Official circulars)</span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP115Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="6"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP115Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP115SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP115Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP115HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="6"
                  />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP115External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  max="6"
                />
              </td>
            </tr>

            {/* 1.1.6 - Use of Innovative teaching methodologies */}
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.6</td>
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <strong>Use of Innovative teaching – learning methodologies;</strong>
                </div>
                <ul className="list-disc ml-6 mt-2">
                  <li>a) Use of Information and Communications Technology (ICT); or any animation software,</li>
                  <li>b) Updated subject content and course improvement</li>
                  <li>c) Subject material sharing with the students.</li>
                  <li>d) Inviting experts from other Organizations</li>
                </ul>
                <div className="mt-2">
                  <span className="text-blue-600">(2 Marks for each activity for all assigned subjects in both the semesters)</span>{" "}
                  <span className="text-red-600">(Max: 8 marks)</span>{" "}
                  <span className="text-green-600">(Verification for 1.1.6: Course file)</span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP116Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP116Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP116SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP116Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP116HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    max="8"
                  />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP116External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  max="8"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 1.2 - Students' centric parameters */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">1.2</th>
              <th
                colSpan="4"
                className="border border-gray-300 px-4 py-2 text-left"
              >
                Students' centric parameters <span className="text-blue-600">(maximum marks 30)</span>
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sr. No</th>
              <th className="border border-gray-300 px-4 py-2">Parameter</th>
              <th className="border border-gray-300 px-4 py-2">
                Self-Evaluation
              </th>
              {canViewColumn('hod') && (
                <th className="border border-gray-300 px-4 py-2">
                  Evaluation by HoD
                </th>
              )}
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by External Audit Member
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 1.2.1 - Attendance of Students */}
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.2.1</td>
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <strong>Attendance of Students above 85%</strong> <span className="text-blue-600 font-semibold">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP121Semester1 || ''}
                    onChange={(e) => handleTextInputChange('TLP121Semester1', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S1Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S1Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S1Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S1Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1/Tutorial 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S1Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S1Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2/ Tutorial 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S1Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S1Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP121Semester2 || ''}
                    onChange={(e) => handleTextInputChange('TLP121Semester2', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S2Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S2Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S2Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S2Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1/Tutorial 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S2Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S2Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2/ Tutorial 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP121S2Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP121S2Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * Average of the student's attendance in the entire Theory/Practical work load assigned during the entire academic year.
                </div>
                <div className="mt-1">
                  <span className="text-blue-600 font-semibold">(Max: 10 marks)</span> <span className="text-green-600 font-italic">(Verification 1.2.1 : Official attendance record)</span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP121Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP121Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP121SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP121Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP121HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP121External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
            </tr>

            {/* 1.2.2 - Student feedback */}
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.2.2</td>
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <strong>Student feedback (TH/PR)</strong> <span className="text-blue-600 font-semibold">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP122Semester1 || ''}
                    onChange={(e) => handleTextInputChange('TLP122Semester1', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S1Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S1Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S1Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S1Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S1Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S1Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S1Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S1Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP122Semester2 || ''}
                    onChange={(e) => handleTextInputChange('TLP122Semester2', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S2Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S2Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S2Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S2Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S2Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S2Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP122S2Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP122S2Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * Score proportional to average of percentage of <strong>"Student's feedback"</strong> obtained for all assigned theory and practical Subjects in both the Semester.
                </div>
                <div className="mt-1">
                  <span className="text-blue-600 font-semibold">(Max: 10 marks)</span> <span className="text-green-600 font-italic">(Verification 1.3.2 : Official feedback record/report)</span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP122Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP122Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP122SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP122Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP122HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP122External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
            </tr>

            {/* 1.2.3 - Results of students */}
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.2.3</td>
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <strong>Results of students(TH/PR)</strong> <span className="text-blue-600 font-semibold">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP123Semester1 || ''}
                    onChange={(e) => handleTextInputChange('TLP123Semester1', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S1Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S1Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S1Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S1Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S1Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S1Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S1Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S1Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.: </strong>
                  <input
                    type="text"
                    placeholder="____"
                    className="border-b border-gray-400 px-2 py-1 w-16 focus:outline-none focus:border-blue-500"
                    value={formData.TLP123Semester2 || ''}
                    onChange={(e) => handleTextInputChange('TLP123Semester2', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                  <ul className="list-disc ml-6 mt-1">
                    <li className="flex items-center gap-2">
                      1. Theory 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S2Theory1 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S2Theory1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      2. Theory 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S2Theory2 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S2Theory2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      3. Practical 1: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S2Practical1 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S2Practical1', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                    <li className="flex items-center gap-2">
                      4. Practical 2: 
                      <input
                        type="text"
                        placeholder="_____"
                        className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                        value={formData.TLP123S2Practical2 || ''}
                        onChange={(e) => handleTextInputChange('TLP123S2Practical2', e.target.value)}
                        disabled={userRole !== 'faculty'}
                      />
                    </li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * More than average of previous three years results in the respective subject/practical – <strong>'10' Marks</strong>
                </div>
                <div className="text-blue-600">
                  If the results are less by 10% compared to the average of three years – <strong>'0' Marks</strong> and in between give proportional Marks.
                </div>
                <div className="mt-1">
                  <span className="text-blue-600 font-semibold">(Max: 10 marks)</span> <span className="text-green-600 font-italic">(Verification 1.3.3 : Official result)</span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="TLP123Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP123Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.TLP123SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("TLP123Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP123HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </td>
              )}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP123External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Remarks for Section 1 - TLP */}
      <RemarksBox
        sectionId="section-1-tlp"
        sectionTitle="Teaching Learning Process (TLP)"
        userRole={userRole}
        formData={formData}
        setFormData={setFormData}
        maxLength={1000}
      />

      <div className="flex justify-between mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page3;