
import React, { useState } from "react";
import toast from "react-hot-toast";

const Page3 = ({ formData, setFormData, onNext, onPrevious, isReadOnly, userRole }) => {
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
    <div className="p-6 min-h-screen">
      <h3 className="text-2xl font-bold text-center mb-6">
        1. Teaching Learning Process (TLP)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">1.1</th>
              <th
                colSpan="4"
                className="border border-gray-300 px-4 py-2 text-left"
              >
                Teaching Learning Activities
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sr. No</th>
              <th className="border border-gray-300 px-4 py-2">Parameter</th>
              <th className="border border-gray-300 px-4 py-2">
                Self-Evaluation
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by HoD
              </th>
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
                    (100% compliance = 10 points)
                  </span>
                  <ul className="list-disc ml-4">
                    <li>Total number of lectures allocated: 40</li>
                    <li>Total number of lectures taken: 40</li>
                    <li>SEMESTER No.: 6</li>
                    <li>Makeup lectures may be counted as against any leave</li>
                  </ul>
                </ol>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    name="TLP111"
                    readOnly={isReadOnly}
                    value={formData["TLP111Self"] || ""}
                    onChange={(e) => handleInputChange(e, "TLP111Self")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP111Self")}
                        className="text-xs w-full"
                      />
                          
                          <button
                        onClick={() => showImagePreview("TLP111Self")}
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
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    name="TLP111"
                    readOnly={userRole==="faculty"}
                    value={userRole === "external" ? "" : formData["TLP111HoD"] || ""}
                    disabled={userRole === "external"}
                    onChange={(e) => handleInputChange(e, "TLP111HoD")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={userRole === "hod" ? "" :formData["TLP111External"] || ""}
                    readOnly={userRole==="faculty"}
                    disabled={userRole === "hod"}
                    onChange={(e) => handleInputChange(e, "TLP111External")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.2</td>
              <td className="border border-gray-300 px-4 py-2">
                <ol>
                  <li>
                    Tutorials, practical, contact hours undertaken as percentage
                    of those allocated
                  </li>
                  <span className="text-red-600">
                    (100% compliance = 10 points)
                  </span>
                  <ul className="list-disc ml-4">
                    <li>SEMESTER No.: 7</li>
                    <li>Total number of tutorials allocated: 40</li>
                    <li>Total number of tutorials taken: 40</li>
                  </ul>
                </ol>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData["TLP112Self"] || ""}
                    readOnly={isReadOnly}
                    onChange={(e) => handleInputChange(e, "TLP112Self")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP112Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("TLP112Self")}
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
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={userRole === "external" ? "" :formData["TLP112HoD"] || ""}
                    readOnly={userRole==="faculty"}
                    disabled={userRole === "external"}
                    onChange={(e) => handleInputChange(e, "TLP112HoD")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={userRole === "hod" ? "" :formData["TLP112External"] || ""}
                    readOnly={userRole==="faculty"}
                    disabled={userRole === "hod"}
                    onChange={(e) => handleInputChange(e, "TLP112External")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1.1.3</td>
              <td className="border border-gray-300 px-4 py-2">
                Extra Lectures, Remedial Lectures/Practical or other teaching
                duties
                <span className="text-red-600">
                  {" "}
                  (2 hour excess per week = 4 points for each semester)
                </span>
                <br />
                <span className="text-green-600">
                  Verification: Official attendance record
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData["TLP113Self"] || ""}
                    readOnly={isReadOnly}
                    onChange={(e) => handleInputChange(e, "TLP113Self")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP113Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("TLP113Self")}
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
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={userRole === "external" ? "" :formData["TLP113HoD"] || ""}
                    readOnly={userRole==="faculty"}
                    disabled={userRole === "external"}
                    onChange={(e) => handleInputChange(e, "TLP113HoD")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={userRole === "hod" ? "" :formData["TLP113External"] || ""}
                    readOnly={userRole==="faculty"}
                    disabled={userRole === "hod"}
                    onChange={(e) => handleInputChange(e, "TLP113External")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  
              </td>
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-300 px-4 py-2">1.1.4</td>
              <td className="border border-gray-300 px-4 py-2">
                Semester End Examination duties (Question paper setting,
                evaluation of answer scripts etc.){" "}
                <span className="text-red-500">(100% compliance = 4 points/sem)</span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData["TLP114Self"] || ""}
                    readOnly={isReadOnly}
                    onChange={(e) => handleInputChange(e, "TLP114Self")}
                    className="border border-gray-400 px-2 py-1 w-16 text-center"
                  />
                  {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP114Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("TLP114Self")}
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
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input 
                    type="number" 
                    min="0" 
                    value={userRole === "external" ? "" :formData["TLP114HoD"] || ""}
                    disabled={userRole === "external"}
                    readOnly={userRole==="faculty"}
                    onChange={(e) => handleInputChange(e, "TLP114HoD")} 
                    max="10" 
                    className="border border-gray-400 px-2 py-1 w-16 text-center" 
                  />
                  
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <input 
                    type="number" 
                    min="0" 
                    value={userRole === "hod" ? "" :formData["TLP114External"] || ""}
                    disabled={userRole === "hod"}
                    readOnly={userRole==="faculty"}
                    onChange={(e) => handleInputChange(e, "TLP114External")} 
                    max="10" 
                    className="border border-gray-400 px-2 py-1 w-16 text-center" 
                  />
                  
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page3;