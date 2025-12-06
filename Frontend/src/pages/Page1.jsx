import React, { useState, useEffect } from "react";
import axiosInstance from "../helper/axiosInstance";
import { useSelector } from "react-redux";

const Page1 = ({ catTotal, formData, setFormData,onPrevious, onNext }) => {
  const { userId, role, email, employeeCode } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [employeeCodes, setEmployeeCodes] = useState([]);
  const [employees, setEmployees] = useState([]); // Store full employee list with email, code, name
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  const [curFormData, setCurFormData] = useState({
    email: email || "",
    employeeCode: employeeCode || "",
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

  // Check if user is HOD, External, Principal, or Admin (all use employee selection)
  const isHodOrExternal = role === "hod" || role === "external" || role === "principal" || role === "admin";
  const isFaculty = role === "faculty";
  const isAdmin = role === "admin";
  // Admin has full edit access, others (HOD/External/Principal) are read-only
  const isReadOnlyRole = (role === "hod" || role === "external" || role === "principal") && role !== "admin";

  // Fetch all employee codes when component mounts if user is HOD, External, Principal, or Admin
  // For faculty, auto-load their own data by email
  useEffect(() => {
    if (isHodOrExternal) {
      fetchAllEmployeeCodes();
    } else if (isFaculty && email) {
      // Auto-load faculty's own data using their email
      fetchEmployeeData(email);
    }
  }, [isHodOrExternal, isFaculty, email]);

  // Function to fetch all employee codes
  const fetchAllEmployeeCodes = async () => {
    setIsLoadingEmployees(true);
    try {
      const response = await axiosInstance.get("/getEmpCode");
      console.log(response);
      
      if (response?.data?.success) {
        // New API returns employees array with email, employeeCode, name
        const employeesList = response.data.employees || [];
        setEmployees(employeesList);
        
        // Also extract just the codes for backward compatibility
        setEmployeeCodes(response.data.employeeCodes || []);
        
        // Check if there's a previously selected employee identifier in localStorage
        const savedIdentifier = localStorage.getItem("selectedEmployeeIdentifier");
        if (savedIdentifier) {
          handleEmployeeSelect({ target: { value: savedIdentifier } });
        }
      } else {
        setMessage({ 
          text: "Failed to load employee list. Please try again later.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error fetching employee list:", error);
      setMessage({ 
        text: error.response?.data?.message || "Failed to load employee list. Please try again.", 
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

  // Special handler for employee selection (by email or employeeCode)
  const handleEmployeeSelect = async (e) => {
    const selectedIdentifier = e.target.value; // Can be email or employeeCode
    
    // Update form data with selected identifier
    const updatedData = { 
      ...formData, 
      employeeCode: selectedIdentifier.includes('@') ? '' : selectedIdentifier,
      email: selectedIdentifier.includes('@') ? selectedIdentifier : ''
    };
    setFormData(updatedData);
    
    // Save selected identifier to localStorage
    localStorage.setItem("selectedEmployeeIdentifier", selectedIdentifier);
    
    // Fetch employee details if an identifier is selected
    if (selectedIdentifier) {
      await fetchEmployeeData(selectedIdentifier);
    }
  };

  const fetchEmployeeData = async (identifier = null) => {
    // Use identifier parameter, or fall back to email for faculty, or employeeCode for others
    let targetIdentifier = identifier;
    
    if (!targetIdentifier) {
      if (isFaculty && email) {
        targetIdentifier = email;
      } else {
        targetIdentifier = formData.email || formData.employeeCode;
      }
    }
    
    if (!targetIdentifier) {
      setMessage({ text: "Please enter or select an employee.", type: "error" });
      return false;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.get(`/getData/${encodeURIComponent(targetIdentifier)}`);
      
      if (response?.data?.success) {
        setMessage({ text: "Employee data loaded successfully!", type: "success" });
        setFormData(response?.data?.data);
        localStorage.setItem("formData", JSON.stringify(response?.data?.data));
        return true;
      } else {
        setMessage({ 
          text: `No existing data found for: ${targetIdentifier}. You can start with new data.`, 
          type: "info" 
        });
        // For HOD/External, don't reset the form completely
        if (!isHodOrExternal) {
          const newData = { ...curFormData, email: email };
          setFormData(newData);
          localStorage.setItem("formData", JSON.stringify(newData));
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

  // For regular users - handle employee code blur (deprecated but kept for backward compatibility)
  const handleEmployeeCodeBlur = async () => {
    if (!isHodOrExternal && formData.employeeCode && formData.employeeCode.length > 0) {
      await fetchEmployeeData(formData.employeeCode);
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
          {/* Email field - shown for faculty (read-only) */}
          {isFaculty && (
            <tr>
              <td colSpan="3" className="border border-gray-300 p-2">
                Email (Your Account):
                <input
                  type="email"
                  name="email"
                  value={formData.email || email}
                  readOnly
                  className="border border-gray-400 rounded px-2 py-1 w-full bg-gray-100"
                  placeholder="Your email address"
                />
              </td>
            </tr>
          )}
          
          {/* Employee selector - shown for HOD/External/Principal/Admin */}
          {isHodOrExternal && (
            <tr>
              <td colSpan="3" className="border border-gray-300 p-2">
                Select Employee:
                <div className="flex items-center">
                  <div className="w-full">
                    <select
                      name="employeeIdentifier"
                      value={formData.email || formData.employeeCode || ""}
                      onChange={handleEmployeeSelect}
                      className="border border-gray-400 rounded px-2 py-1 w-full"
                      disabled={isLoading || isLoadingEmployees}
                    >
                      <option value="">Select Employee</option>
                      {isLoadingEmployees ? (
                        <option value="" disabled>Loading employees...</option>
                      ) : (
                        employees.map(emp => (
                          <option 
                            key={emp.email || emp.employeeCode} 
                            value={emp.email || emp.employeeCode}
                          >
                            {emp.name} - {emp.email || emp.employeeCode}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          )}
          
          {/* Employee Code field - shown for all, editable for faculty and admin */}
          <tr>
            <td colSpan="3" className="border border-gray-300 p-2">
              Employee Code:
              <div className="flex items-center">
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode || ""}
                  onChange={handleChange}
                  className={`border border-gray-400 rounded px-2 py-1 w-full ${isReadOnlyRole ? 'bg-gray-100' : ''}`}
                  placeholder={isFaculty ? "Enter your employee code" : "Employee code"}
                  readOnly={isReadOnlyRole}
                />
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
                disabled={isLoading}
                readOnly={isReadOnlyRole}
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
                disabled={isLoading}
                readOnly={isReadOnlyRole}
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
                disabled={isLoading || (isReadOnlyRole && !formData.employeeCode)}
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
                disabled={isLoading || (isReadOnlyRole && !formData.employeeCode)}
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
                disabled={isLoading}
                readOnly={isReadOnlyRole}
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
                disabled={isLoading}
                readOnly={isReadOnlyRole}
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
            isLoading || (isHodOrExternal && !formData.email && !formData.employeeCode)
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={onNext}
          disabled={isLoading || (isHodOrExternal && !formData.email && !formData.employeeCode)}
        >
          {isLoading ? "Loading..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Page1;