import React, { useState } from "react";
import toast from "react-hot-toast";
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import useRoleBasedData from "../hooks/useRoleBasedData";
import { FormProvider } from "../contexts/FormContext";

const Page4 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
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
  console.log(formData);
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
            <th className="border border-gray-300 px-4 py-2">Professional Development</th>
            <th className="border border-gray-300 px-4 py-2">Self-Evaluation</th>
            <th className="border border-gray-300 px-4 py-2">Evaluation by HOD</th>
            <th className="border border-gray-300 px-4 py-2">
              Evaluation by External Audit Member
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">2.1.1</td>
            <td className="border px-4 py-2">
              <ol>
                <li>Qualification improvement</li>
                <li>
                  (Ph. D / Post Doctorate –{" "}
                  <span className="text-red-500">10 points</span>)
                </li>
                <li>
                  (Ph. D registered –{" "}
                  <span className="text-red-500">4 points</span>) and for every
                  progress report submission (–{" "}
                  <span className="text-red-500">1 point</span>)
                </li>
              </ol>
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
              {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC211Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("PDRC211Self")}
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
              <td className="border px-4 py-2">
              <RoleBasedInput
                fieldKey="PDRC211HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
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
              Acquiring status of Certified trainer for skill development
              courses from reputed organization.
              <br />
              <span className="text-red-500">
                (02 points each) (Max: 4 points)
              </span>
            </td>
            <td className="border px-4 py-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="PDRC212Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
              {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC212Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("PDRC212Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("PDRC212Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
              </div>
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldKey="PDRC212HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldKey="PDRC212External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">2.1.3</td>
            <td className="border px-4 py-2">
              Certification of International / National repute from reputed
              organization (e.g. EdX, MOOC from some best central
              universities/IITs/NITs/NPTEL etc.)
              <br />
              <span className="text-red-500">
                (02 points each) (Max: 4 points)
              </span>
            </td>
            <td className="border px-4 py-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldKey="PDRC213Self"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
              {canEditColumn('self') ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC213Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("PDRC213Self")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                      >
                        View Evidence
                      </button>
                    </div>
                  
                  ):<><button
                  onClick={() => showImagePreview("PDRC213Self")}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button></>}
              </div>
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldKey="PDRC213HoD"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldKey="PDRC213External"
                userRole={userRole}
                formData={formData}
                handleInputChange={handleInputChange}
                className="border p-2 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">2.1.4</td>
            <td className="border px-4 py-2">
              Awards/ Recognition/ Any other achievement through professional
              bodies of National/International repute (e.g. Best Teacher, Young
              Scientist award given by ISTE).
              <br />
              <span className="text-red-500">
                (02 points each) (Max: 4 points)
              </span>
              <br />
              <span className="text-green-500">
                (Verification for 2.1: Certificate/letter/report)
              </span>
            </td>
            <td className="border px-4 py-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldName="PDRC214Self"
                type="number"
                columnType="self"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
              {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC214Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("PDRC214Self")}
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
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC214HoD"
                type="number"
                columnType="hod"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC214External"
                type="number"
                columnType="external"
                min="0"
                max="10"
                className="border p-2 w-full"
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
            <th className="border border-gray-300 px-4 py-2">Research Achievements (RA)</th>
            <th className="border border-gray-300 px-4 py-2">Self-Evaluation</th>
            <th className="border border-gray-300 px-4 py-2">Evaluation by HOD</th>
            <th className="border border-gray-300 px-4 py-2">
              Evaluation by External Audit Member
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">2.2.1</td>
            <td className="border px-4 py-2">
              <ol>
                <li>
                  <b>Research Publication (journals)</b>
                </li>
                <li>Number of articles in refereed International Journals</li>
                <li>
                  <span className="text-red-500">
                    (For 2 publication: Scopus indexed - 5 points, Web of
                    Science indexed – 3 points, and UGC care list – 2 points)
                    H-index {">"} 5: 2 points, Citation {">"} 10: 2 points
                  </span>
                </li>
              </ol>
            </td>
            {/* <td className="border px-4 py-2">
              Scopus – 5<br />
              Citations – 2<br />
              UGC care list – 2<br />
            </td> */}
            <td className="border px-4 py-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldName="PDRC221Self"
                type="number"
                columnType="self"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
              {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC221Self")}
                        className="text-xs w-full"
                      />
                         <button
                         onClick={() => showImagePreview("PDRC221Self")}
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
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC221HoD"
                type="number"
                columnType="hod"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC221External"
                type="number"
                columnType="external"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">2.2.2</td>
            <td className="border px-4 py-2">
              <ol>
                <li>
                  <b>Full paper publication in Conference Proceedings</b>
                </li>
                <li>
                  <span className="text-red-500">
                    (For publication in International Conference Proceedings – 3
                    points, and National Conference Proceedings – 2 points)
                    (Egs. Springer, Elsevier, IEEE, and ACM etc.)
                  </span>
                </li>
              </ol>
            </td>
            <td className="border px-4 py-2">
            <div className="flex flex-col items-center space-y-2">
              <RoleBasedInput
                fieldName="PDRC222Self"
                type="number"
                columnType="self"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
              {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "PDRC222Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("PDRC222Self")}
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
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC222HoD"
                type="number"
                columnType="hod"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
            </td>
            <td className="border px-4 py-2">
              <RoleBasedInput
                fieldName="PDRC222External"
                type="number"
                columnType="external"
                min="0"
                max="10"
                className="border p-2 w-full"
              />
            </td>
          </tr>
          {/* Continue similarly for remaining rows */}
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
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
    </FormProvider>
  );
};

export default Page4;
