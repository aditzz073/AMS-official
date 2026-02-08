import { useState } from "react";
import toast from "react-hot-toast";
import RoleBasedInput from "../components/RoleBasedInput";
import RemarksBox from "../components/RemarksBox";
import useRoleBasedData from "../hooks/useRoleBasedData";

const Page5 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
  const [previewImages, setPreviewImages] = useState({});
  const { canEditColumn, canViewColumn } = useRoleBasedData(userRole, formData);

  const handleInputChange = (e, key) => {
    const { value } = e.target;
    
    // Define max marks for specific fields (only applies to faculty, hod, external - NOT principal)
    const maxMarks = {
      // Section 3.1, 3.2, 3.3 - max 5
      'CIL1Self': 5, 'CIL1HoD': 5, 'CIL1External': 5,
      'CIL2Self': 5, 'CIL2HoD': 5, 'CIL2External': 5,
      'CIL3Self': 5, 'CIL3HoD': 5, 'CIL3External': 5,
      // Section 3.4 - max 10 (CDL34)
      'CDL34Self': 10, 'CDL34HoD': 10, 'CDL34External': 10,
      // Section 3.5 - max 15 (CDL35)
      'CDL35Self': 15, 'CDL35HoD': 15, 'CDL35External': 15,
      // Section 4 CIL4 - max 30
      'CIL4Self': 30, 'CIL4HoD': 30, 'CIL4External': 30,
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
          console.error('[Page5] Error saving to localStorage:', error);
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

  const handleNext = () => {
    // No validation - proceed directly
    onNext();
  };

  console.log(formData);
  return (
    <div className="p-6  min-h-screen">
        <h3 id="head_pdrc" className="text-xl font-bold text-center"> 3. Contribution at Departmental Level (CDL) <span className="text-blue-600">(maximum marks 50)</span></h3>
        <table className="border-3 border-gray-300 w-full">
            <thead>
                <tr className="bg-gray-200">
                    <td className="border border-gray-300 p-2">3</td>
                    <td className="border border-gray-300 p-2">Professional Involvement (PI)</td>
                    <td className="border border-gray-300 p-2">Self-Evaluation</td>
                    {canViewColumn('hod') && (
                      <td className="border border-gray-300 p-2">Evaluation by HOD</td>
                    )}
                    <td className="border border-gray-300 p-2">Evaluation by External Audit Member</td>
                </tr>
            </thead>
            <tbody>
                {[
                    {
                        id: "3.1",
                        no:"31",
                        description: (
                            <>
                                Contribution in conducting the activities of professional bodies (like IEEE, CSI, IETE etc.) either for the students or faculty members<br />
                                <span className="text-blue-600 font-semibold">(5 Marks for activity like FDP, SDP, Seminar, workshop etc. conducted with individual as a main resource person)</span> <span className="text-red-600 font-semibold">(Max: 5 marks)</span>
                            </>
                        ),
                    },
                    {
                        id: "3.2",
                        no:"32",
                        description: (
                            <>
                                Organizing Training program (FDP/SDP/STTP/Workshop/Seminar etc.) / Organization of short term training courses<br />
                                <span className="text-blue-600 font-semibold">Two week duration : Coordinator: Co-Coordinator: Member = (10:8:6)</span><br />
                                <span className="text-blue-600 font-semibold">One week : Coordinator: Co-Coordinator: Member = (6:4:2)</span><br />
                                <span className="text-blue-600 font-semibold">Less than one week : Coordinator: Co-Coordinator: Member = (5:3:1)</span> <span className="text-red-600 font-semibold">(Max: 10 marks)</span>
                            </>
                        ),
                    },
                    {
                        id: "3.3",
                        no:"33",
                        description: (
                            <>
                                Participation in Training Program / Participation in short term training courses<br />
                                <span className="text-blue-600 font-semibold">Two week duration (10 Marks) / One week (8 Marks) / for less than one week (2 Marks),</span> <span className="text-red-600 font-semibold">(Max: 10 marks)</span>
                            </>
                        ),
                    },
                    {
                        id: "3.4",
                        no:"34",
                        description: (
                            <>
                                Internal Revenue Generation (IRG) : Other than the research grant IRG through<br />
                                FDP/SDP/STTP/Workshop/Seminar/Conference/Consultancy<br />
                                <span className="text-blue-600 font-semibold">(Rs.25,000 and above -Coordinator: Co-Coordinator: Member = (10:8:5))</span> <span className="text-red-600 font-semibold">[Max: 10 marks]</span>
                            </>
                        ),
                    },
                    {
                        id: "3.5",
                        no:"35",
                        description: (
                            <>
                                Department level Governance/responsibilities assigned<br />
                                <span className="text-blue-600 font-semibold">NBA/NAAC/NIRF Coordinator/Member - 5/3</span><br />
                                <span className="text-blue-600 font-semibold">IQAC Coordinator/Member - 5/3</span><br />
                                <span className="text-blue-600 font-semibold">Other Departmental Coordinators/Member - 5/3</span><br />
                                <span className="text-green-600 font-italic">(Verification for 3 : Office order/Attendance/ Certificate/ letter/report)</span> <span className="text-red-600 font-semibold">(Max: 15 marks)</span>
                            </>
                        ),
                    },
                ].map((row, index) => (
                    <tr key={row.id}>
                        <td className="border p-2 ">{row.id}</td>
                        <td className="border p-2">{row.description}</td>
                        <td className="border p-2">
                        <div className="flex flex-col items-center space-y-2">
                            <RoleBasedInput
                                fieldKey={`CDL${row.no}Self`}
                                userRole={userRole}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                className="w-full p-2 border"
                                max={row.no === "35" ? "15" : "5"}
                            />
                            {canEditColumn('self') && (
                <div className="flex flex-col items-center mt-2 w-full">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => handleImageUpload(e, `CDL${row.no}Self`)}
                    className="text-xs w-full"
                  />
                </div>
              )}
              
              {formData[`CDL${row.no}SelfImage`] && (
                <button
                  onClick={() => showImagePreview(`CDL${row.no}Self`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                >
                  View Evidence
                </button>
              )}
                            </div>
                        </td>
                        {canViewColumn('hod') && (
                          <td className="border p-2">
                              <RoleBasedInput
                                  fieldKey={`CDL${row.no}HoD`}
                                  userRole={userRole}
                                  formData={formData}
                                  handleInputChange={handleInputChange}
                                  className="w-full p-2 border"
                                  max="5"
                              />
                          </td>
                        )}
                        <td className="border p-2">
                            <RoleBasedInput
                                fieldKey={`CDL${row.no}External`}
                                userRole={userRole}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                className="w-full p-2 border"
                                max={row.no === "35" ? "15" : "5"}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

  {/* Remarks for Section 3 - CDL */}
  <RemarksBox
    sectionId="section-3-cdl"
    sectionTitle="Contribution at Department Level (CDL)"
    userRole={userRole}
    formData={formData}
    setFormData={setFormData}
    maxLength={1000}
  />

        <h3 id="head_pdrc" className="text-xl font-bold text-center pt-6">
          4. Contribution at Institute Level (CIL) <span className="text-blue-600">(maximum marks 50)</span>
        </h3>
        <table className="border-3 border-gray-300 w-full mt-4">
            <thead>
                <tr className="bg-gray-200">
                    <td className="border border-gray-300 p-2">4.</td>
                    <td className="border border-gray-300 p-2">Institutional level Governance responsibilities assigned</td>
                    <td className="border border-gray-300 p-2">Self-Evaluation</td>
                    {canViewColumn('hod') && (
                      <td className="border border-gray-300 p-2">Evaluation by HOD</td>
                    )}
                    <td className="border border-gray-300 p-2">Evaluation by External Audit Member</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border p-2"></td>
                    <td className="border p-2">
                        <div>(Institutional : Member )</div>
                        <div className="mt-2">
                            NBA/NAAC/NIRF Coordinator/Member - <span className="text-blue-600">5/3</span>
                        </div>
                        <div className="mt-1">
                            IQAC Coordinator/Member - <span className="text-blue-600">5/3</span>,
                        </div>
                        <div className="mt-1">
                            Member of BoS/Faculty/Academic council / Senate : <span className="text-blue-600">4 Marks</span>
                        </div>
                        <div className="mt-1">
                            Member of other college / University level committees: <span className="text-blue-600">3 Marks</span>
                        </div>
                        <div className="mt-1">
                            Contribution in activities of statutory bodies: <span className="text-blue-600">3 Marks</span>
                        </div>
                        <div className="mt-1">
                            Institute level responsibility allotted: <span className="text-blue-600">3 each (max: 6 Marks)</span>
                        </div>
                        <div className="mt-1">
                            Internship Support: <span className="text-blue-600">1 Marks</span>
                        </div>
                        <div className="mt-1">
                            Placement Support: <span className="text-blue-600">1 Marks</span>
                        </div>
                        <div className="mt-1">
                            Any other DSI level responsibility allotted : <span className="text-blue-600">2 Marks</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            ( PI specify): 
                            <input
                                type="text"
                                placeholder="____________________"
                                className="border-b border-gray-400 px-2 py-1 w-64 focus:outline-none focus:border-blue-500"
                                value={formData.CIL4PISpecify || ''}
                                onChange={(e) => {
                                    const updatedData = { ...formData, CIL4PISpecify: e.target.value };
                                    setFormData(updatedData);
                                    localStorage.setItem('formData', JSON.stringify(updatedData));
                                }}
                                disabled={userRole !== 'faculty'}
                            />
                        </div>
                        <div className="mt-2 text-green-600">
                            <em>(Verification for 4 : Office order/Attendance/ Certificate/ Account details/letter/report)</em> <span className="text-red-600">(Max: 30 marks)</span>
                        </div>
                    </td>
                    <td className="border p-2">
                        <div className="flex flex-col items-center space-y-2">
                            <RoleBasedInput
                                fieldKey="CIL4Self"
                                userRole={userRole}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                className="w-full p-2 border"
                                max="30"
                            />
                            {canEditColumn('self') && (
                                <div className="flex flex-col items-center mt-2 w-full">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        onChange={(e) => handleImageUpload(e, "CIL4Self")}
                                        className="text-xs w-full"
                                    />
                                </div>
                            )}
                            
                            {formData.CIL4SelfImage && (
                                <button
                                    onClick={() => showImagePreview("CIL4Self")}
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
                                >
                                    View Evidence
                                </button>
                            )}
                        </div>
                    </td>
                    {canViewColumn('hod') && (
                      <td className="border p-2">
                          <RoleBasedInput
                              fieldKey="CIL4HoD"
                              userRole={userRole}
                              formData={formData}
                              handleInputChange={handleInputChange}
                              className="w-full p-2 border"
                              max="30"
                          />
                      </td>
                    )}
                    <td className="border p-2">
                        <RoleBasedInput
                            fieldKey="CIL4External"
                            userRole={userRole}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            className="w-full p-2 border"
                            max="30"
                        />
                    </td>
                </tr>
            </tbody>
        </table>

  {/* Remarks for Section 4 - CIL */}
  <RemarksBox
    sectionId="section-4-cil"
    sectionTitle="Contribution at Institutional Level (CIL)"
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

export default Page5;
