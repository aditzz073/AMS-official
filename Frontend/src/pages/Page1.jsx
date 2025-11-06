import React, { useState, useEffect } from "react";
import axiosInstance from "../helper/axiosInstance";
import { useSelector } from "react-redux";

const Page1 = ({ catTotal, formData, setFormData,onPrevious, onNext }) => {
  const { userId, role, email } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [employeeCodes, setEmployeeCodes] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  const [curFormData, setCurFormData] = useState({
    employeeCode: "",
    name: "",
    designation: "",
    college: "DSCE",
    campus: "Kumarswamy Layout (Campus 1)",
    department: "Information Science and Engineering",
    joiningDate: "",
    periodOfAssessment: "",
    categoriesTotal: catTotal,
    totalSelf: "",
    totalHoD: "",
    totalExternal: "",
    HODName: "",
    externalEvaluatorName: "",
    principleName: "",
  });

  // Check if user is HOD or external
  const isHodOrExternal = role === "hod" || role === "external";

  // Fetch all employee codes when component mounts if user is HOD or external
  useEffect(() => {
    if (isHodOrExternal) {
      fetchAllEmployeeCodes();
    }
  }, [isHodOrExternal]);

  // Function to fetch all employee codes
  const fetchAllEmployeeCodes = async () => {
    setIsLoadingEmployees(true);
    try {
      // Adjust endpoint as needed based on your API
      const response = await axiosInstance.get("/getEmpCode");
      console.log(response);
      
      if (response?.data?.success) {
        setEmployeeCodes(response.data.employeeCodes || []);
        
        // Check if there's a previously selected employee code in localStorage
        const savedEmployeeCode = localStorage.getItem("selectedEmployeeCode");
        if (savedEmployeeCode) {
          handleEmployeeCodeSelect({ target: { value: savedEmployeeCode } });
        }
      } else {
        setMessage({ 
          text: "Failed to load employee codes. Please try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error fetching employee codes:", error);
      setMessage({ 
        text: error.response?.data?.message || "Failed to load employee codes. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const curUpdatedData = { ...curFormData, [name]: value };
    setCurFormData(curUpdatedData);

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    localStorage.setItem("formData", JSON.stringify(updatedData)); // Save to localStorage
  };

  // Special handler for employee code dropdown
  const handleEmployeeCodeSelect = async (e) => {
    const selectedCode = e.target.value;
    
    // Update form data with selected code
    const updatedData = { ...formData, employeeCode: selectedCode };
    setFormData(updatedData);
    
    // Save selected code to localStorage
    localStorage.setItem("selectedEmployeeCode", selectedCode);
    
    // Fetch employee details if a code is selected
    if (selectedCode) {
      await fetchEmployeeData(selectedCode);
    }
  };

  const fetchEmployeeData = async (code = null) => {
    const employeeCode = code || formData.employeeCode;
    
    if (!employeeCode) {
      setMessage({ text: "Please enter or select an Employee Code.", type: "error" });
      return false;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.get(`/getData/${employeeCode}`);
      
      if (response?.data?.success) {
        setMessage({ text: "Employee data loaded successfully!", type: "success" });
        setFormData(response?.data?.data);
        localStorage.setItem("formData", JSON.stringify(response?.data?.data));
        return true;
      } else {
        setMessage({ 
          text: `No existing data found using employee code: ${employeeCode}, please verify the code and try again.`, 
          type: "info" 
        });
        // For HOD/External, don't reset the form completely
        if (!isHodOrExternal) {
          setFormData(curFormData);
          localStorage.setItem("formData", JSON.stringify(curFormData));
        }
        return false;
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setMessage({ 
        text: error.response?.data?.message || "Failed to fetch employee data. Please try again.", 
        type: "error" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // For regular users - handle employee code blur
  const handleEmployeeCodeBlur = async () => {
    if (!isHodOrExternal && formData.employeeCode && formData.employeeCode.length > 0) {
      await fetchEmployeeData();
    }
  };

 

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-xl font-bold text-center mb-4">Performance Appraisal Form</h2>
      
      {/* Message display */}
      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === "success" ? "bg-green-100 text-green-800" : 
          message.type === "error" ? "bg-red-100 text-red-800" : 
          "bg-blue-100 text-blue-800"
        }`}>
          {message.text}
        </div>
      )}
      
      <table className="w-full border border-gray-400">
        <tbody>
          <tr>
            <td colSpan="3" className="border border-gray-300 p-2">
              Employee Code:
              <div className="flex items-center">
                {isHodOrExternal ? (
                  /* Dropdown for HOD or External roles */
                  <div className="w-full">
                    <select
                      name="employeeCode"
                      value={formData.employeeCode || ""}
                      onChange={handleEmployeeCodeSelect}
                      className="border border-gray-400 rounded px-2 py-1 w-full"
                      disabled={isLoading || isLoadingEmployees}
                    >
                      <option value="">Select Employee Code</option>
                      {isLoadingEmployees ? (
                        <option value="" disabled>Loading employee codes...</option>
                      ) : (
                        employeeCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))
                      )}
                    </select>
                  </div>
                ) : (
                  /* Text input for regular users */
                  <>
                    <input
                      type="text"
                      name="employeeCode"
                      value={formData.employeeCode || ""}
                      onChange={handleChange}
                      onBlur={handleEmployeeCodeBlur}
                      className="border border-gray-400 rounded px-2 py-1 w-full"
                      placeholder="Enter employee code to load existing data"
                      disabled={isLoading}
                    />
                    <button 
                      onClick={() => fetchEmployeeData()}
                      disabled={isLoading || !formData.employeeCode}
                      className="ml-2 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      {isLoading ? "..." : "Fetch"}
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              Full Name:
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
                readOnly={isHodOrExternal}
              />
            </td>
            <td colSpan="2" className="border border-gray-300 p-2">
              Designation:
              <input
                type="text"
                name="designation"
                value={formData.designation || ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
                readOnly={isHodOrExternal}
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">
              College / Institute:
              <input type="text" value="DSCE" disabled className="border border-gray-400 rounded px-2 py-1 w-full" />
            </td>
            <td colSpan="2" className="border border-gray-300 p-2">
              Campus:
              <select
                name="campus"
                value={formData.campus || ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
              >
                <option value="">Select Campus</option>
                <option value="Kumaraswamy Layout (Campus 1)">Kumaraswamy Layout (Campus 1)</option>
                <option value="Harohalli (Campus 2)">Harohalli (Campus 2)</option>
                <option value="Kanakpura Road (Campus 3)">Kanakpura Road (Campus 3)</option>
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="3" className="border border-gray-300 p-2">
              Department:
              <select
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
              >
                <option value="">Select Department</option>
                <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Computer Science Engineering (Cyber Security)">Computer Science Engineering (Cyber Security)</option>
                <option value="Computer Science Engineering(Data Science)">Computer Science Engineering(Data Science)</option>
                <option value="Computer Science and Engineering (IoT & Cyber Security Including Blockchain Technology)">Computer Science and Engineering (IoT & Cyber Security Including Blockchain Technology)</option>
                <option value="Computer Science and Design">Computer Science and Design</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                <option value="Information Science & Engineering">Information Science & Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Medical Electronics Engineering">Medical Electronics Engineering</option>
                <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
                <option value="Master of Business Administration">Master of Business Administration</option>
                <option value="Master of Computer Applications">Master of Computer Applications</option>
                <option value="Mathematics Department">Mathematics Department</option>
                <option value="Physics Department">Physics Department</option>
                <option value="Chemistry Department">Chemistry Department</option>
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="3" className="border border-gray-300 p-2">
              Joining Date at DSCE:
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate ? formData.joiningDate.split("T")[0] : ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
                readOnly={isHodOrExternal}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="3" className="border border-gray-300 p-2">
              Period of Assessment:
              <input
                type="date"
                name="periodOfAssessment"
                value={formData.periodOfAssessment ? formData.periodOfAssessment.split("T")[0] : ""}
                onChange={handleChange}
                className="border border-gray-400 rounded px-2 py-1 w-full"
                disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
                readOnly={isHodOrExternal}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="instructions mb-6">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Faculty member should enter their self-evaluation scores...</li>
          <li>Completed appraisal form along with necessary proofs...</li>
          <li>Head of the department shall verify scores...</li>
          <li>The external evaluator will do the assessment...</li>
          <li>The Head of the department after complete evaluation...</li>
        </ol>
      </div>

      <div className="flex justify-between mt-6">
      <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          className={`px-4 py-2 rounded text-white ${
            isLoading || (isHodOrExternal && !formData.employeeCode)
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={onNext}
          disabled={isLoading || (isHodOrExternal && !formData.employeeCode)}
        >
          {isLoading ? "Loading..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Page1;