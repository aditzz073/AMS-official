import React, { useState } from "react";
import toast from "react-hot-toast";
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import { useRoleBasedData } from "../hooks/useRoleBasedData";

const Page3 = ({ formData, setFormData, onNext, onPrevious, isReadOnly, userRole }) => {
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
  
  // Validation removed - allow smooth navigation with optional fields
  // Backend will handle any required field validation on submission

  const handleNext = () => {
    // No validation - proceed directly
    onNext();
  };

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
                  <RoleBasedInput
                    fieldKey="TLP111Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') ? (
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
                  <RoleBasedInput
                    fieldKey="TLP111HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
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
                  <RoleBasedInput
                    fieldKey="TLP112Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') ? (
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
                  onClick={() => showImagePreview("TLP112Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP112HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
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
                  <RoleBasedInput
                    fieldKey="TLP113Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') ? (
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
                  onClick={() => showImagePreview("TLP113Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP113HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP113External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
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
                  <RoleBasedInput
                    fieldKey="TLP114Self"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  {canEditColumn('self') ? (
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
                  onClick={() => showImagePreview("TLP114Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP114HoD"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                  <RoleBasedInput
                    fieldKey="TLP114External"
                    userRole={userRole}
                    formData={formData}
                    handleInputChange={handleInputChange}
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
                  />
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP115Self")}
                        className="text-xs w-full"
                      />
                      <button
                        onClick={() => showImagePreview("TLP115Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  ):<><button
                    onClick={() => showImagePreview("TLP115Self")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    View Evidence
                  </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP115HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP115External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
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
                  />
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP116Self")}
                        className="text-xs w-full"
                      />
                      <button
                        onClick={() => showImagePreview("TLP116Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  ):<><button
                    onClick={() => showImagePreview("TLP116Self")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    View Evidence
                  </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP116HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP116External"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
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
              <th className="border border-gray-300 px-4 py-2">
                Evaluation by HoD
              </th>
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
                  <strong>Attendance of Students above 85%</strong> <span className="text-red-600">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1/Tutorial 1...........</li>
                    <li>4. Practical 2/ Tutorial 2..........</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1/Tutorial 1...........</li>
                    <li>4. Practical 2/ Tutorial 2..........</li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * Average of the student's attendance in the entire Theory/Practical work load assigned during the entire academic year.
                </div>
                <div className="mt-1 text-green-600">
                  (Max: 10 marks) (Verification 1.2.1 : Official attendance record)
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
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP121Self")}
                        className="text-xs w-full"
                      />
                      <button
                        onClick={() => showImagePreview("TLP121Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  ):<><button
                    onClick={() => showImagePreview("TLP121Self")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    View Evidence
                  </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP121HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
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
                  <strong>Student feedback (TH/PR)</strong> <span className="text-red-600">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1........................</li>
                    <li>4. Practical 2........................</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1........................</li>
                    <li>4. Practical 2........................</li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * Score proportional to average of percentage of <strong>"Student's feedback"</strong> obtained for all assigned theory and practical Subjects in both the Semester.
                </div>
                <div className="mt-1 text-green-600">
                  (Max: 10 marks) (Verification 1.3.2 : Official feedback record/report)
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
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP122Self")}
                        className="text-xs w-full"
                      />
                      <button
                        onClick={() => showImagePreview("TLP122Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  ):<><button
                    onClick={() => showImagePreview("TLP122Self")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    View Evidence
                  </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP122HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
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
                  <strong>Results of students(TH/PR)</strong> <span className="text-red-600">(5 marks for each semester)</span>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1........................</li>
                    <li>4. Practical 2........................</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>SEMESTER No.:</strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>1. Theory 1...........................</li>
                    <li>2. Theory 2...........................</li>
                    <li>3. Practical 1........................</li>
                    <li>4. Practical 2........................</li>
                  </ul>
                </div>
                <div className="mt-2 text-blue-600">
                  * More than average of previous three years results in the respective subject/practical – <strong>'10' Marks</strong>
                </div>
                <div className="text-blue-600">
                  If the results are less by 10% compared to the average of three years – <strong>'0' Marks</strong> and in between give proportional Marks.
                </div>
                <div className="mt-1 text-green-600">
                  (Max: 10 marks) (Verification 1.3.3 : Official result)
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
                  {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "TLP123Self")}
                        className="text-xs w-full"
                      />
                      <button
                        onClick={() => showImagePreview("TLP123Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  ):<><button
                    onClick={() => showImagePreview("TLP123Self")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    View Evidence
                  </button></>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <RoleBasedInput
                  fieldKey="TLP123HoD"
                  userRole={userRole}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </td>
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