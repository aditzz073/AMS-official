import { useState } from "react";
import toast from "react-hot-toast";

const Page5 = ({formData, setFormData, onNext, onPrevious,isReadOnly,userRole }) => {
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
        <div className="p-6  min-h-screen">
            <h3 id="head_pdrc" className="text-xl font-bold text-center"> 3. Contribution at Department Level (CDL)</h3>
            <table className="border-3 border-gray-300 w-full">
                <thead>
                    <tr className="bg-gray-200">
                        <td className="border border-gray-300 p-2">3</td>
                        <td className="border border-gray-300 p-2">Professional Involvement (PI)</td>
                        <td className="border border-gray-300 p-2">Self-Evaluation</td>
                        <td className="border border-gray-300 p-2">Evaluation by HOD</td>
                        <td className="border border-gray-300 p-2">Evaluation by External Audit Member</td>
                    </tr>
                </thead>
                <tbody>
                    {[
                        {
                            id: "3.1",
                            no:"31",
                            description:
                                "Contribution in conducting the activities of professional bodies (like IEEE, CSI, IETE etc.) either for the students or faculty members (5 points for activity like FDP, SDP, Seminar, workshop etc. conducted with individual as a main resource person)",
                        },
                        {
                            id: "3.2",
                            no:"32",
                            description:
                                "Organizing Training program (FDP/SDP/STTP/Workshop/Seminar etc.) / Organization of short term training courses (Coordinator: Co-Coordinator: Member = 10:8:6 for 2-week duration)",
                        },
                        {
                            id: "3.3",
                            no:"33",
                            description:
                                "Participation in Training Program / Participation in short term training courses (10 points for two-week duration, 8 points for one week, 2 points for less than one week)",
                        },
                        {
                            id: "3.4",
                            no:"34",
                            description:
                                "Internal Revenue Generation (IRG) through FDP / SDP / STTP / Workshop / Seminar / Conference / Consultancy (Rs.25,000 and above - Coordinator: Co-Coordinator: Member = 10:8:5)",
                        },
                        {
                            id: "3.5",
                            no:"35",
                            description:
                                "Department level Governance/responsibilities assigned (NBA/NAAC/NIRF Coordinator/Member, IQAC Coordinator/Member, Other Departmental Coordinators/Member)",
                        },
                    ].map((row, index) => (
                        <tr key={row.id}>
                            <td className="border p-2 ">{row.id}</td>
                            <td className="border p-2">{row.description}</td>
                            <td className="border p-2">
                            <div className="flex flex-col items-center space-y-2">

                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={formData[`CDL${row.no}Self`] || ""}
                                    readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, `CDL${row.no}Self`)}
                                    className="w-full p-2 border"
                                />
                                {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, `CDL${row.no}Self`)}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview(`CDL${row.no}Self`)}
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
                            <td className="border p-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    readOnly={userRole==="faculty"}
                                    value={userRole === "external" ? "" :formData[`CDL${row.no}HoD`] || ""}
                                    disabled={userRole === "external"}

                onChange={(e) => handleInputChange(e, `CDL${row.no}HoD`)}
                                    className="w-full p-2 border"
                                />
                            </td>
                            <td className="border p-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={userRole === "hod" ? "" :formData[`CDL${row.no}External`] || ""}
                                    disabled={userRole === "hod"}
                                    readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, `CDL${row.no}External`)}
                                    className="w-full p-2 border"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 id="head_pdrc" className="text-xl font-bold text-center pt-6">4. Contribution at Institute Level (CIL)</h3>
            <table className="border-3 border-gray-300 w-full mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <td className="border border-gray-300 p-2">4</td>
                        <td className="border border-gray-300 p-2">Institutional level Governance responsibilities assigned</td>
                        <td className="border border-gray-300 p-2">Self-Evaluation</td>
                        <td className="border border-gray-300 p-2">Evaluation by HOD</td>
                        <td className="border border-gray-300 p-2">Evaluation by External Audit Member</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border p-2 ">4</td>
                        <td className="border p-2">
                            Member of statutory bodies: NBA/NAAC/NIRF Coordinator/Member, IQAC Coordinator/Member, Member of BoS/Faculty/Academic council, and various college/university level committees. Activities such as Internship and Placement Support.
                            <div className="text-red-600">Internship support through hackman – 1, Placement support through Catalysis and Hackman – 1</div>
                        </td>
                        <td className="border p-2">
                        <div className="flex flex-col items-center space-y-2">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={formData[`CIL4Self`] || ""}
                                readOnly={isReadOnly}

                onChange={(e) => handleInputChange(e, `CIL4Self`)}
                                className="w-full p-2 border"
                            />
                            {userRole === "faculty" ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleImageUpload(e, "CIL4Self")}
                        className="text-xs w-full"
                      />
                        <button
                        onClick={() => showImagePreview("CIL4Self")}
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
                        <td className="border p-2">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={userRole === "external" ? "" :formData[`CIL4HoD`] || ""}
                                disabled={userRole === "external"}
                                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, `CIL4HoD`)}
                                className="w-full p-2 border"
                            />
                        </td>
                        <td className="border p-2">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={userRole === "hod" ? "" :formData[`CIL4External`] || ""}
                                disabled={userRole === "hod"}
                                readOnly={userRole==="faculty"}
                onChange={(e) => handleInputChange(e, `CIL4External`)}
                                className="w-full p-2 border"
                            />
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
          onClick={onNext}
        >
          Next
        </button>
      </div>
        </div>
    );
};

export default Page5;
