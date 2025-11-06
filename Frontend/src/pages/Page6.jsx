import React, { useState } from 'react';
import axiosInstance from '../helper/axiosInstance';
import toast from 'react-hot-toast';

const Page6 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
    const [previewImages, setPreviewImages] = useState({});

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
      console.log("Page6 calculation response:", response);
      
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
        
        console.log("Calculated totals:", { categoriesTotal, totalSelf, totalHoD, totalExternal });
        
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
        
        console.log("Updated formData with totals:", updatedFormData);
        
        onNext();
      } else {
        throw new Error("Calculation failed");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
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
      console.error("No file uploaded for this field");
      return;
  }

  window.open(fileUrl, "_blank");
  }
    
  };
  console.log(formData);
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
              <input type="number"
                value={formData["IOW511Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW511Self")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW511HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW511HoD")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW511External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW511External")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">2</td>
            <td className="border border-gray-300 p-2">Live Industrial Projects</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW512Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW512Self")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW512HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW512HoD")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW512External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW512External")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">3</td>
            <td className="border border-gray-300 p-2">Any other please specify</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW513Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW513Self")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW513HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW513HoD")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW513External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW513External")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr className="bg-gray-300">
            <td className="p-2">B</td>
            <td colSpan="4" className="p-2"></td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">1</td>
            <td className="border border-gray-300 p-2">Subject Expert for Interview panel</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW521Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW521Self")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW521HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW521HoD")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW521External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW521External")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">2</td>
            <td className="border border-gray-300 p-2">Judge/Session chairs for International/National Conference</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW522Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW522Self")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW522HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW522HoD")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW522External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW522External")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">3</td>
            <td className="border border-gray-300 p-2">Reviewer - International/National Journal</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW523Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW523Self")}
                min="0"
                max="10" className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW523HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW523HoD")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW523External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW523External")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">4</td>
            <td className="border border-gray-300 p-2">Editorial Board Member for National and International journal</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW524Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW524Self")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW524HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW524HoD")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW524External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW524External")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">5</td>
            <td className="border border-gray-300 p-2">Resource person for conferences/seminars/workshops/symposia etc.</td>
            <td className="border border-gray-300 p-2">
            <div className="flex flex-col items-center space-y-2">
              <input type="number"
                value={formData["IOW525Self"] || ""}
                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, "IOW525Self")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
                {userRole === "faculty" ? (
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
                  onClick={() => showImagePreview("TLP111Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "external" ? "" :formData["IOW525HoD"] || ""}
                disabled={userRole === "external"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW525HoD")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
            <td className="border border-gray-300 p-2">
              <input type="number"
                value={userRole === "hod" ? "" :formData["IOW525External"] || ""}
                disabled={userRole === "hod"}
                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, "IOW525External")}
                min="0"
                max="10"  className="border p-1" minLength="0" maxLength="10" />
            </td>
          </tr>
          <tr>
            <td colSpan="5" className="text-green-500 p-2">
              (Verification for 2.2 : Office order / Attendance / Certificate / Account details / letter/report)
            </td>
          </tr>
        </tbody>
      </table>

      {/* Navigation Buttons */}
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
          Next
        </button>
      </div>
    </div>
  );
};

export default Page6;
