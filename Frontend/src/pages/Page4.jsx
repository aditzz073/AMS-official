import React, { useState } from "react";
import toast from "react-hot-toast";
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import useRoleBasedData from "../hooks/useRoleBasedData";
import { FormProvider } from "../contexts/FormContext";

const Page4 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
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
      // Section 2.1.2, 2.1.3, 2.1.4 - max 4
      'PDRC212Self': 4, 'PDRC212HoD': 4, 'PDRC212External': 4,
      'PDRC213Self': 4, 'PDRC213HoD': 4, 'PDRC213External': 4,
      'PDRC214Self': 4, 'PDRC214HoD': 4, 'PDRC214External': 4,
      // Section 2.2.1 - max 9
      'PDRC221Self': 9, 'PDRC221HoD': 9, 'PDRC221External': 9,
      // Section 2.2.2 - max 3
      'PDRC222Self': 3, 'PDRC222HoD': 3, 'PDRC222External': 3,
      // Section 2.2.3 - max 7
      'PDRC223Self': 7, 'PDRC223HoD': 7, 'PDRC223External': 7,
      // Section 2.2.4 - max 10 (already default)
      'PDRC224Self': 10, 'PDRC224HoD': 10, 'PDRC224External': 10,
      // Section 2.2.5 - max 8
      'PDRC225Self': 8, 'PDRC225HoD': 8, 'PDRC225External': 8,
      // Section 2.2.6 - max 5
      'PDRC226Self': 5, 'PDRC226HoD': 5, 'PDRC226External': 5,
      // Section 2.2.7 - max 12
      'PDRC227Self': 12, 'PDRC227HoD': 12, 'PDRC227External': 12,
      // Section 2.2.8 - max 8
      'PDRC228Self': 8, 'PDRC228HoD': 8, 'PDRC228External': 8,
      // Section 2.2.9 - max 6
      'PDRC229Self': 6, 'PDRC229HoD': 6, 'PDRC229External': 6,
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
          localStorage.setItem("formData", JSON.stringify(dataToSave));
        } catch (error) {
          console.error('[Page4] Error saving to localStorage:', error);
        }
        return updatedData;
      });
    }
  };

  // Handle multiple file uploads
  const handleMultipleImageUpload = (e, key) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

    // Check each file size
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed 10MB. Please upload smaller files.`);
      return;
    }

    if (files.length > 0) {
      // Get existing files if any
      const existingFiles = formData[`${key}Image`];
      const currentFiles = Array.isArray(existingFiles) ? existingFiles : (existingFiles ? [existingFiles] : []);

      // Convert new files to data URLs for persistence
      const filePromises = files.map((file, index) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImages(prev => ({
              ...prev,
              [`${key}_${currentFiles.length + index}`]: reader.result
            }));
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      });

      // Wait for all files to be converted
      Promise.all(filePromises).then(dataUrls => {
        // Combine existing and new data URLs
        const allFiles = [...currentFiles, ...dataUrls];

        // Store all files in formData
        setFormData(prev => {
          const updatedData = {
            ...prev,
            [`${key}Image`]: allFiles
          };

          // Save to localStorage
          try {
            localStorage.setItem("formData", JSON.stringify(updatedData));
          } catch (error) {
            console.error('[Page4] Error saving to localStorage:', error);
          }
          return updatedData;
        });

        toast.success(`${files.length} file(s) uploaded successfully`);
      });
    }
  };

  // Remove a specific file from multiple uploads
  const removeFileFromMultipleUpload = (key, fileIndex) => {
    setFormData(prev => {
      const existingFiles = prev[`${key}Image`];
      const currentFiles = Array.isArray(existingFiles) ? existingFiles : [];
      const updatedFiles = currentFiles.filter((_, index) => index !== fileIndex);

      const updatedData = {
        ...prev,
        [`${key}Image`]: updatedFiles.length > 0 ? updatedFiles : null
      };

      // Save to localStorage
      try {
        localStorage.setItem("formData", JSON.stringify(updatedData));
      } catch (error) {
        console.error('[Page4] Error saving to localStorage:', error);
      }
      return updatedData;
    });

    // Remove preview
    setPreviewImages(prev => {
      const updated = { ...prev };
      delete updated[`${key}_${fileIndex}`];
      return updated;
    });

    toast.success("File removed successfully");
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

  // Show preview for multiple files
  const showMultipleImagePreview = (key, fileIndex = null) => {
    const filesData = formData[`${key}Image`];
    
    if (!filesData) {
      alert("No files uploaded for this field");
      return;
    }

    // Convert to array if not already
    const files = Array.isArray(filesData) ? filesData : [filesData];

    // If specific file index provided, show only that file
    if (fileIndex !== null) {
      const file = files[fileIndex];
      if (!file) {
        alert("File not found");
        return;
      }
      openSingleFilePreview(file);
      return;
    }

    // Otherwise, show all files in a gallery view
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Pop-up blocked. Please allow pop-ups for this site to view files.");
      return;
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>Multiple Files Preview</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: #f0f0f0;
              font-family: Arial, sans-serif;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .gallery {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              padding: 20px;
            }
            .file-card {
              background: white;
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
            }
            .file-card img {
              max-width: 100%;
              height: auto;
              max-height: 200px;
              border-radius: 4px;
              margin-bottom: 10px;
            }
            .file-card .file-info {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .file-card button {
              margin-top: 10px;
              padding: 8px 16px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            .file-card button:hover {
              background-color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Uploaded Files (${files.length} file${files.length > 1 ? 's' : ''})</h2>
          </div>
          <div class="gallery" id="gallery">
          </div>
          <script>
            const gallery = document.getElementById('gallery');
          </script>
        </body>
      </html>
    `);

    // Process each file
    files.forEach((file, index) => {
      if (file instanceof File || file instanceof Blob) {
        const blobUrl = URL.createObjectURL(file);
        const fileType = file.type || '';
        const fileName = file.name || `File ${index + 1}`;

        if (fileType.startsWith('image/')) {
          const scriptContent = `
            <script>
              gallery.innerHTML += '<div class="file-card"><img src="${blobUrl}" alt="${fileName}" /><div class="file-info">${fileName}</div><button onclick="window.open(\\'${blobUrl}\\', \\'_blank\\')">Open Full Size</button></div>';
            </script>
          `;
          newWindow.document.write(scriptContent);
        } else {
          const scriptContent = `
            <script>
              gallery.innerHTML += '<div class="file-card"><div>📄</div><div class="file-info">${fileName}</div><button onclick="window.open(\\'${blobUrl}\\', \\'_blank\\')">View File</button></div>';
            </script>
          `;
          newWindow.document.write(scriptContent);
        }
      } else if (typeof file === 'string') {
        // Handle URLs (Cloudinary or data URLs)
        const scriptContent = `
          <script>
            gallery.innerHTML += '<div class="file-card"><div>📄</div><div class="file-info">File ${index + 1}</div><button onclick="window.open(\\'${file}\\', \\'_blank\\')">View File</button></div>';
          </script>
        `;
        newWindow.document.write(scriptContent);
      }
    });

    newWindow.document.close();
  };

  // Helper to open single file preview
  const openSingleFilePreview = (file) => {
    if (file instanceof File || file instanceof Blob) {
      const blobUrl = URL.createObjectURL(file);
      window.open(blobUrl, "_blank");
    } else if (typeof file === 'string') {
      window.open(file, "_blank");
    }
  };

  console.log(formData);

  // Validation removed - allow smooth navigation with optional fields
  // Backend will handle any required field validation on submission

  const handleNext = () => {
    // No validation - proceed directly
    onNext();
  };

    return (
    <FormProvider userRole={userRole} formData={formData} handleInputChange={handleInputChange}>
      <div className="p-6  min-h-screen">
        <h3 className="text-xl font-bold text-center" id="head_pdrc">
          2. Professional Development and Research Contribution (PDRC)
        </h3>

        {/* Professional Development Table */}
        <table className="min-w-full border-collapse border border-gray-300 mt-4">
          <thead className="bg-gray-200">
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">2.1</th>
              <th className="border border-gray-300 px-4 py-2">Professional Development (maximum marks 22)</th>
              <th className="border border-gray-300 px-4 py-2">Self-Evaluation</th>
              {canViewColumn('hod') && (
                <th className="border border-gray-300 px-4 py-2">Evaluation by HOD</th>
              )}
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by External Audit Member
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">2.1.1</td>
              <td className="border px-4 py-2">
                Qualification improvement<br />
                (Ph. D / Post Doctorate – <span className="text-blue-600 font-semibold">10 Marks</span>)<br />
                (Ph. D registered – <span className="text-blue-600 font-semibold">4 Marks</span>) and for every progress report submission<br />
                – <span className="text-blue-600 font-semibold">1 Marks</span><br />
                <span className="text-red-600 font-semibold">(Max: 10 Marks)</span>
              </td>
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC211Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={(e) => handleImageUpload(e, "PDRC211Self")}
                          className="text-xs w-full"
                        />
                      </div>
                    )}
                    
                    {formData.PDRC211SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC211Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )}
              </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC211HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                />
              </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC211External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">2.1.2</td>
              <td className="border px-4 py-2">
                Acquiring status of Certified trainer for skill development courses from
                reputed organization. <span className="text-blue-600 font-semibold">(02 Marks each)</span> <span className="text-red-600 font-semibold">(Max: 4 Marks)</span>
              </td>
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC212Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={(e) => handleImageUpload(e, "PDRC212Self")}
                          className="text-xs w-full"
                        />
                      </div>
                    )}
                    
                    {formData.PDRC212SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC212Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )}
              </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC212HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
              </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC212External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
                max="4"
              />
            </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">2.1.3</td>
              <td className="border px-4 py-2">
                Certification of International / National repute from reputed
                organization (e.g. EdX, MOOC from some best central universities
                /IITs/ NITs/ NPTEL etc.) <span className="text-blue-600 font-semibold">(02 Marks each)</span> <span className="text-red-600 font-semibold">(Max: 4 Marks)</span>
              </td>
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC213Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={(e) => handleImageUpload(e, "PDRC213Self")}
                          className="text-xs w-full"
                        />
                      </div>
                    )}
                    
                    {formData.PDRC213SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC213Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC213HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="4"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC213External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">2.1.4</td>
              <td className="border px-4 py-2">
                Awards/ Recognition/ Any other achievement through professional
                bodies of National/International repute (e.g. Best Teacher, Young
                Scientist award given by ISTE). <span className="text-blue-600 font-semibold">(02 Marks each)</span> <span className="text-red-600 font-semibold">(Max: 4 Marks)</span><br />
                <span className="text-green-600 font-italic">(Verification for 2.1 : Certificate/letter/report)</span>
              </td>
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC214Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={(e) => handleImageUpload(e, "PDRC214Self")}
                          className="text-xs w-full"
                        />
                      </div>
                    )}
                    
                    {formData.PDRC214SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC214Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC214HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="4"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC214External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="4"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks for Subsection 2.1 */}
        <RemarksBox
          sectionId="section-2-1-pdrc-teaching"
          sectionTitle="Section 2.1 - Teaching Related Activities"
          userRole={userRole}
          formData={formData}
          setFormData={setFormData}
          maxLength={1000}
        />

        {/* Research Achievements Table */}
        <table className="min-w-full border-collapse border-2 border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">2.2</th>
              <th className="border border-gray-300 px-4 py-2">Research Achievements (RA) (maximum marks 68)</th>
              <th className="border border-gray-300 px-4 py-2">Self-Evaluation</th>
              {canViewColumn('hod') && (
                <th className="border border-gray-300 px-4 py-2">Evaluation by HOD</th>
              )}
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by External Audit Member
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">2.2.1</td>
              <td className="border px-4 py-2">
                <b>Research Publication (journals)</b><br />
                Number of articles in refereed International Journals<br />
                <span className="text-blue-600 font-semibold">(For 2 publication : Scopus indexed -5 Marks, Web of Science indexed – 3 Marks and UGC care list – 2 Marks)</span><br />
                <span className="text-blue-600 font-semibold">H-index{">"} 5 : 2 Marks</span><br />
                <span className="text-blue-600 font-semibold">Citation.{">"}10 : 2 Marks</span><br />
                <span className="text-blue-600 font-semibold">No publication : 0 marks,</span> <span className="text-red-600 font-semibold">(Max: 9 marks)</span>
              </td>
              {/* <td className="border px-4 py-2">
                Scopus – 5<br />
                Citations – 2<br />
                UGC care list – 2<br />
              </td> */}
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC221Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="9"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          multiple
                          onChange={(e) => handleMultipleImageUpload(e, "PDRC221Self")}
                          className="text-xs w-full"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          You can select multiple files (hold Ctrl/Cmd to select multiple)
                        </div>
                      </div>
                    )}
                    
                    {formData.PDRC221SelfImage && (
                      <div className="flex flex-col items-center w-full mt-2 space-y-2">
                        {/* Show file count */}
                        <div className="text-xs text-gray-700 font-semibold">
                          {Array.isArray(formData.PDRC221SelfImage) 
                            ? `${formData.PDRC221SelfImage.length} file(s) uploaded`
                            : '1 file uploaded'}
                        </div>
                        
                        {/* View all files button for all roles */}
                        <button
                          onClick={() => showMultipleImagePreview("PDRC221Self")}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs w-full"
                        >
                          View All Evidence
                        </button>

                        {/* List individual files with remove option (only for faculty) */}
                        {canEditColumn('self') && Array.isArray(formData.PDRC221SelfImage) && (
                          <div className="w-full space-y-1">
                            {formData.PDRC221SelfImage.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded text-xs">
                                <span className="truncate flex-1">
                                  {file instanceof File ? file.name : `File ${index + 1}`}
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => showMultipleImagePreview("PDRC221Self", index)}
                                    className="bg-green-500 text-white px-2 py-1 rounded"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => removeFileFromMultipleUpload("PDRC221Self", index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC221HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="9"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC221External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="9"
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">2.2.2</td>
              <td className="border px-4 py-2">
                <b>Full paper publication in Conference Proceedings</b><br />
                <span className="text-blue-600 font-semibold">(For publication in International Conference Proceedings- 3 Marks, and National Conference Proceedings – 2 Marks) (Egs. Springer / Elesevier/ IEEE and ACM etc.)</span><br />
                <span className="text-red-600 font-semibold">(Max: 3 marks)</span>
              </td>
              <td className="border px-4 py-2">
              <div className="flex flex-col items-center space-y-2">
                <RoleBasedInput
                  fieldKey="PDRC222Self"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="3"
                />
                {canEditColumn('self') && (
                      <div className="flex flex-col items-center mt-2 w-full">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={(e) => handleImageUpload(e, "PDRC222Self")}
                          className="text-xs w-full"
                        />
                      </div>
                    )}
                    
                    {formData.PDRC222SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC222Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC222HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="3"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC222External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="3"
                />
              </td>
            </tr>

            {/* 2.2.3 - Books published */}
            <tr>
              <td className="border px-4 py-2">2.2.3</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Books published</strong>
                </div>
                <div className="mt-1">
                  With ISBN/ISSN numbers or Number of chapters in edited books
                </div>
                <div className="mt-1">
                  <span className="text-blue-600">(Books - 5 Marks, Book chapters – 2 Marks)</span>
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 7 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC223Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="7"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC223Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC223SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC223Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC223HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="7"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC223External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="7"
                />
              </td>
            </tr>

            {/* 2.2.4 - Organizing Conference */}
            <tr>
              <td className="border px-4 py-2">2.2.4</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Organizing Conference/s (International/National)</strong>
                </div>
                <div className="mt-1">
                  Convener/Coordinator/Member-<span className="text-blue-600">10/7/4 Marks</span>
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 10 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC224Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="10"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC224Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC224SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC224Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC224HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="10"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC224External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="10"
                />
              </td>
            </tr>

            {/* 2.2.5 - Sponsored/Funded Projects */}
            <tr>
              <td className="border px-4 py-2">2.2.5</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Sponsored/ Funded Projects carried out/ ongoing</strong>
                </div>
                <div className="mt-1">
                  (PI /Co-PI: &lt; Rs. 5 Lakhs: 5/2 Marks, &gt; Rs. 5 lakhs: 8/5 Marks)
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 8 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC225Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="8"
                  />
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC225Self")}
                        className="text-xs w-full"
                      />
                      {formData.PDRC225SelfImage && (
                        <button
                          onClick={() => showImagePreview("PDRC225Self")}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                        >
                          View Evidence
                        </button>
                      )}
                    </div>
                  ) : (
                    formData.PDRC225SelfImage && canViewColumn('self') && (
                      <button
                        onClick={() => showImagePreview("PDRC225Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    )
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC225HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="8"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC225External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="8"
                />
              </td>
            </tr>

            {/* 2.2.6 - Consultancy/MoU */}
            <tr>
              <td className="border px-4 py-2">2.2.6</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Consultancy / MoU</strong> <span className="text-blue-600">(5/3 Marks)</span>
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 5 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC226Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="5"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC226Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC226SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC226Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC226HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="5"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC226External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="5"
                />
              </td>
            </tr>

            {/* 2.2.7 - Patents/Copyright */}
            <tr>
              <td className="border px-4 py-2">2.2.7</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Patents/Copy right (National/ International)</strong>
                </div>
                <div className="mt-1">
                  <span className="text-blue-600">(Patents: Commercialized/Granted/Published: 10/7/4)</span>
                </div>
                <div>
                  <span className="text-blue-600">(Copyrights: published: 2 Marks)</span>
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 12 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC227Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="12"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC227Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC227SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC227Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC227HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="12"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC227External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="12"
                />
              </td>
            </tr>

            {/* 2.2.8 - Research Guidance */}
            <tr>
              <td className="border px-4 py-2">2.2.8</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Research Guidance</strong>
                </div>
                <div className="mt-1">
                  PG – 1 Marks for every awarded degree <span className="text-blue-600">(max. 3 Marks)</span>
                </div>
                <div>
                  UG – 1 point for every awarded group <span className="text-blue-600">(max. 2 Marks)</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  Degree awarded (Nos.): 
                  <input
                    type="text"
                    placeholder="_____"
                    className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                    value={formData.PDRC228DegreeAwarded1 || ''}
                    onChange={(e) => handleTextInputChange('PDRC228DegreeAwarded1', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  Ph. D (Awarded/In progress) <span className="text-blue-600">(3/2)</span>
                </div>
                <div className="flex items-center gap-2">
                  Degree awarded (Nos.): 
                  <input
                    type="text"
                    placeholder="_____"
                    className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                    value={formData.PDRC228DegreeAwarded2 || ''}
                    onChange={(e) => handleTextInputChange('PDRC228DegreeAwarded2', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  Number of research scholars under guidance : 
                  <input
                    type="text"
                    placeholder="_____"
                    className="border-b border-gray-400 px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                    value={formData.PDRC228ResearchScholars || ''}
                    onChange={(e) => handleTextInputChange('PDRC228ResearchScholars', e.target.value)}
                    disabled={userRole !== 'faculty'}
                  />
                </div>
                <div className="mt-1">
                  <span className="text-red-600">(Max: 8 marks)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC228Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="8"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC228Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC228SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC228Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC228HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="8"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC228External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="8"
                />
              </td>
            </tr>

            {/* 2.2.9 - Involvement of student in Research activities */}
            <tr>
              <td className="border px-4 py-2">2.2.9</td>
              <td className="border px-4 py-2">
                <div>
                  <strong>Involvement of student in Research activities</strong>
                </div>
                <div className="mt-1">
                  <span className="text-blue-600 font-semibold">(1 point for each of the following activity :)</span>
                </div>
                <ul className="list-disc ml-6 mt-2">
                  <li>Encourage the students to pursue Masters and Ph. D.</li>
                  <li>Encourage students to participate in research related activities.</li>
                  <li>Inculcate research culture in the institute by arranging motivational lectures to emphasize/or provide awareness of research, patent, copyrights, research tools etc.</li>
                  <li>Undertake projects with specialized themes and social needs.</li>
                  <li>Strengthen association with research organizations such as DRDO, ARAI, IISc, ISRO etc.</li>
                  <li>Promote interdisciplinary projects</li>
                </ul>
                <div className="mt-2">
                  <span className="text-red-600 font-semibold">(Max: 6 marks)</span>
                </div>
                <div className="mt-1">
                  <span className="text-green-600 font-italic">(Verification for 2.1 to 2.9: Published paper/URL/Books/ Certificate / account details/notification/letter/report)</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <RoleBasedInput
                    fieldKey="PDRC229Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="6"
                  />
                  {canEditColumn('self') && (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC229Self")}
                        className="text-xs w-full"
                      />
                    </div>
                  )}
                  
                  {formData.PDRC229SelfImage && canViewColumn('self') && (
                    <button
                      onClick={() => showImagePreview("PDRC229Self")}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </td>
              {canViewColumn('hod') && (
                <td className="border px-4 py-2">
                  <RoleBasedInput
                    fieldKey="PDRC229HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    className="border p-2 w-full"
                    max="6"
                  />
                </td>
              )}
              <td className="border px-4 py-2">
                <RoleBasedInput
                  fieldKey="PDRC229External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  className="border p-2 w-full"
                  max="6"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks for Subsection 2.2 */}
        <RemarksBox
          sectionId="section-2-2-pdrc-research"
          sectionTitle="Section 2.2 - Research Achievements"
          userRole={userRole}
          formData={formData}
          setFormData={setFormData}
          maxLength={1000}
        />

        {/* Remarks for Overall Section 2 - PDRC */}
        <RemarksBox
          sectionId="section-2-pdrc"
          sectionTitle="Professional Development and Research Contribution (PDRC)"
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
    </FormProvider>
  );
};

export default Page4;
