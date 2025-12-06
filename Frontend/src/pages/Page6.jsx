import React, { useState } from 'react';
import axiosInstance from '../helper/axiosInstance';
import toast from 'react-hot-toast';
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import useRoleBasedData from "../hooks/useRoleBasedData";

const Page6 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
  const [previewImages, setPreviewImages] = useState({});
  const { canEditColumn } = useRoleBasedData(userRole, formData);

  const handleInputChange = (e, key) => {
    const { value } = e.target;
    if(value<0 || value>10){
      toast.error("Value should be between range of 0-10");
      return
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

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("/total", formData);
      
      if (response?.data?.success) {
        const categoriesTotal = {
          TLPSelf: response?.data?.totals?.TLPSelf || "0",
          TLPHoD: response?.data?.totals?.TLPHoD || "0",
          TLPExternal: response?.data?.totals?.TLPExternal || "0",
          PDRCSelf: response?.data?.totals?.PDRCSelf || "0",
          PDRCHoD: response?.data?.totals?.PDRCHoD || "0",
          PDRCExternal: response?.data?.totals?.PDRCExternal || "0",
          CDLSelf: response?.data?.totals?.CDLSelf || "0",
          CDLHoD: response?.data?.totals?.CDLHoD || "0",
          CDLExternal: response?.data?.totals?.CDLExternal || "0",
          CILSelf: response?.data?.totals?.CILSelf || "0",
          CILHoD: response?.data?.totals?.CILHoD || "0",
          CILExternal: response?.data?.totals?.CILExternal || "0",
          IOWSelf: response?.data?.totals?.IOWSelf || "0",
          IOWHoD: response?.data?.totals?.IOWHoD || "0",
          IOWExternal: response?.data?.totals?.IOWExternal || "0",
        };
        
        const totalSelf = response?.data?.totals?.totalSelf || "0";
        const totalHoD = response?.data?.totals?.totalHoD || "0";
        const totalExternal = response?.data?.totals?.totalExternal || "0";
        
        // Update formData with calculated totals
        const updatedFormData = { 
          ...formData, 
          categoriesTotal: categoriesTotal,
          totalSelf: totalSelf, 
          totalHoD: totalHoD, 
          totalExternal: totalExternal 
        };
        
        // Update both state and localStorage
        setFormData(updatedFormData);
        localStorage.setItem("formData", JSON.stringify(updatedFormData));
        
        onNext();
      } else {
        throw new Error("Calculation failed");
      }
    } catch (error) {
      alert("Failed to submit data. Please try again.");
    }
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    const MAX_FILE_SIZE = 1024 * 1024; // 1MB

  
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }
  
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const imageUrl = reader.result;
  
        setPreviewImages(prev => ({
          ...prev,
          [key]: imageUrl
        }));
  
        setFormData(prev => {
          const updatedData = {
            ...prev,
            [`${key}Image`]: imageUrl
          };
  
          localStorage.setItem("formData", JSON.stringify(updatedData));
          return updatedData;
        });
      };
  
      reader.readAsDataURL(file);
    }
  };

  const showImagePreview = (key) => {
    const fileUrl = formData[`${key}Image`];
    if (!fileUrl) {
      alert("No file uploaded for this field");
      return;
    }
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
  }else{
    if (!fileUrl) {
      return;
  }

  window.open(fileUrl, "_blank");
  }
    
  };

  // Validation removed - allow smooth navigation with optional fields
  // Backend will handle any required field validation on submission

  const handleNext = () => {
    // No validation - proceed directly
    onNext();
  };

  return (
    <div className='p-6  min-h-screen'>
      <h3 id="head_pdrc" className="text-xl font-bold mb-4 text-center">
        5. Interaction with the Outside World (IOW) / External Interface (EI)
      </h3>
      <table className="border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-200 ">
            <td className="border border-gray-300 p-2">5</td>
            <td className="border border-gray-300 p-2">Interaction with outside world: <span className="">A = 10 points, B = 4 points per activity</span></td>
            <td className="border border-gray-300 p-2">Self-Evaluation</td>
            <td className="border border-gray-300 p-2">Evaluation by HOD</td>
            <td className="border border-gray-300 p-2">Evaluation by External Audit Member</td>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-300">
            <td className="p-2">A</td>
            <td colSpan="4" className="p-2"></td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">1</td>
            <td className="border border-gray-300 p-2">Invited as speaker</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW511Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW511Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW511Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW511Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW511HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW511External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">2</td>
            <td className="border border-gray-300 p-2">Live Industrial Projects</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW512Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW512Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW512Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW512Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW512HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW512External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">3</td>
            <td className="border border-gray-300 p-2">Any other please specify</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW513Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW513Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW513Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW513Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW513HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW513External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr className="bg-gray-300">
            <td className="p-2">B</td>
            <td colSpan="4" className="p-2"></td>
          </tr>
        </tbody>
      </table>

      {/* Remarks for Subsection 5.1 (A) */}
      <RemarksBox
        sectionId="section-5-1-iow-a"
        sectionTitle="Section 5.1 - IOW/EI (A)"
        userRole={userRole}
        formData={formData}
        setFormData={setFormData}
        maxLength={1000}
      />

      <table className="border border-gray-300 w-full">
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">1</td>
            <td className="border border-gray-300 p-2">Subject Expert for Interview panel</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW521Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW521Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW521Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW521Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW521HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW521External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">2</td>
            <td className="border border-gray-300 p-2">Judge/Session chairs for International/National Conference</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW522Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW522Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW522Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW522Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW522HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW522External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">3</td>
            <td className="border border-gray-300 p-2">Reviewer - International/National Journal</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW523Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW523Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW523Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW523Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW523HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW523External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">4</td>
            <td className="border border-gray-300 p-2">Editorial Board Member for National and International journal</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW524Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW524Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("IOW524Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW524Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW524HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW524External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">5</td>
            <td className="border border-gray-300 p-2">Resource person for conferences/seminars/workshops/symposia etc.</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="IOW525Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
                {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "IOW525Self")}
                        className="text-xs w-full"
                      />
                         <button
                         onClick={() => showImagePreview("IOW525Self")}
                         className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                       >
                         View Evidence
                       </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("IOW525Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW525HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
            <td className="border border-gray-300 p-2">
              <RoleBasedInput
                fieldKey="IOW525External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-1 w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks for Subsection 5.2 (B) */}
      <RemarksBox
        sectionId="section-5-2-iow-b"
        sectionTitle="Section 5.2 - IOW/EI (B)"
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

export default Page6;
