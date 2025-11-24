import React, { useEffect, useState } from "react";
import axiosInstance from "../helper/axiosInstance";
import toast from "react-hot-toast";
import { generateSimpleFPMIPDF } from "../utils/simplePdfGenerator";
import { useRoleBasedData } from "../hooks/useRoleBasedData";

const Page2 = ({ formData, setFormData, onNext, onPrevious, userRole, isReadOnly }) => {
  const { canViewColumn } = useRoleBasedData(userRole, formData);
  const categories = [
    { key: "TLP", title: "Teaching Learning Process (TLP)", max: 80 },
    { key: "PDRC", title: "Professional Development and Research Contribution (PDRC)", max: 90 },
    { key: "CDL", title: "Contribution at Departmental level (CDL)", max: 50 },
    { key: "CIL", title: "Contribution at Institutional level (CIL)", max: 30 },
    { key: "IOW", title: "Interaction with the Outside World (IOW) / External Interface (EI)", max: 50 },
  ];

  const [categoriesTotal, setCategoriesTotal] = useState({});
  const [totalSelf, setTotalSelf] = useState("");
  const [totalHoD, setTotalHoD] = useState("");
  const [totalExternal, setTotalExternal] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const handleChangeSignature = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };
      localStorage.setItem("formData", JSON.stringify(updatedData)); // Save to localStorage
      return updatedData;
    });
  };

  // Function to calculate and update totals
  const calculateTotals = async () => {
    try {
      setIsCalculating(true);
      
      const response = await axiosInstance.post("/total", formData);
      
      if (response?.data?.success) {
        const newCategoriesTotal = {
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
        
        const newTotalSelf = response?.data?.totals?.totalSelf || "0";
        const newTotalHoD = response?.data?.totals?.totalHoD || "0";
        const newTotalExternal = response?.data?.totals?.totalExternal || "0";
        
        // Update state
        setCategoriesTotal(newCategoriesTotal);
        setTotalSelf(newTotalSelf);
        setTotalHoD(newTotalHoD);
        setTotalExternal(newTotalExternal);
        
        // Update formData and localStorage
        const updatedFormData = {
          ...formData,
          categoriesTotal: newCategoriesTotal,
          totalSelf: newTotalSelf,
          totalHoD: newTotalHoD,
          totalExternal: newTotalExternal
        };
        
        setFormData(updatedFormData);
        localStorage.setItem("formData", JSON.stringify(updatedFormData));
      }
    } catch (error) {
      toast.error("Failed to calculate totals. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Load initial data and calculate totals
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData")) || {};
    
    // Set initial values from storage
    setTotalSelf(storedData.totalSelf || "0");
    setTotalHoD(storedData.totalHoD || "0");
    setTotalExternal(storedData.totalExternal || "0");
    setCategoriesTotal(storedData.categoriesTotal || {});
    
    // Calculate fresh totals to ensure accuracy
    calculateTotals();
  }, []);
  
  // Function to generate PDF
  const handleGeneratePDF = () => {
    try {
      // Map userRole to match the role names expected by PDF generator
      let mappedRole = userRole;
      if (userRole === 'hod') mappedRole = 'HOD';
      else if (userRole === 'principal') mappedRole = 'Principal';
      else if (userRole === 'external') mappedRole = 'ExternalEvaluator';
      else if (userRole === 'admin') mappedRole = 'Admin';
      
      // Pass both formData AND mappedRole to the PDF generator
      const filename = generateSimpleFPMIPDF(formData, mappedRole);
      toast.success(`PDF generated successfully: ${filename}`);
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };
  
  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-center flex-1">
          FACULTY PERFORMANCE MEASURING INDEX (FPMI)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={calculateTotals}
            disabled={isCalculating}
            className={`px-4 py-2 rounded text-white text-sm ${
              isCalculating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isCalculating ? 'Calculating...' : 'Refresh Totals'}
          </button>
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 rounded text-white text-sm bg-blue-500 hover:bg-blue-600"
          >
            Generate PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Assessment Head</th>
              <th className="border px-4 py-2">Maximum Marks</th>
              <th className="border px-4 py-2">Self-evaluation (A)</th>
              <th className="border px-4 py-2">Evaluation by HoD (B)</th>
              <th className="border px-4 py-2">Evaluation by External (C)</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{row.title}</td>
                <td className="border px-4 py-2">{row.max}</td>
                {["Self", "HoD", "External"].map((field, fieldIdx) => {
                  const columnType = field.toLowerCase() === 'hod' ? 'hod' : field.toLowerCase();
                  const shouldShow = canViewColumn(columnType);
                  const value = categoriesTotal[`${row.key}${field}`] || "0";
                  
                  return (
                    <td key={field} className="border px-4 py-2">
                      {shouldShow ? value : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border px-4 py-2">Total</td>
              <td className="border px-4 py-2">300</td>
              <td className="border px-4 py-2">
                {canViewColumn('self') ? (totalSelf || "0") : "—"}
              </td>
              <td className="border px-4 py-2">
                {canViewColumn('hod') ? (totalHoD || "0") : "—"}
              </td>
              <td className="border px-4 py-2">
                {canViewColumn('external') ? (totalExternal || "0") : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        {/* Signatures Section */}
        <div className="overflow-x-auto">
        <table className="w-full border border-gray-400">
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                Signature Name of the Faculty Member
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {/* <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChangeSignature}
                  className="border border-gray-400 rounded px-2 py-1 w-full"
                /> */}
              <input type="text" value={formData.name} disabled className="border border-gray-400 rounded px-2 py-1 w-full" />              </td>
              <td className="border border-gray-300 px-4 py-2">Signature Name of the HoD</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="text"
                  name="HODName"
                  value={formData.HODName}
                  onChange={handleChangeSignature}
                  readOnly={userRole !== 'hod' && userRole !== 'admin'}
                  disabled={userRole !== 'hod' && userRole !== 'admin'}
                  className={`border border-gray-400 rounded px-2 py-1 w-full ${
                    userRole !== 'hod' && userRole !== 'admin' ? 'bg-gray-100 text-gray-600' : ''
                  }`}
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                Signature Name of the External Evaluator
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="text"
                  name="externalEvaluatorName"
                  value={formData.externalEvaluatorName}
                  onChange={handleChangeSignature}
                  readOnly={userRole !== 'external' && userRole !== 'admin'}
                  disabled={userRole !== 'external' && userRole !== 'admin'}
                  className={`border border-gray-400 rounded px-2 py-1 w-full ${
                    userRole !== 'external' && userRole !== 'admin' ? 'bg-gray-100 text-gray-600' : ''
                  }`}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">Signature Name of the Principal</td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="text"
                  name="principleName"
                  value={formData.principleName}
                  onChange={handleChangeSignature}
                  readOnly={userRole !== 'principal' && userRole !== 'admin'}
                  disabled={userRole !== 'principal' && userRole !== 'admin'}
                  className={`border border-gray-400 rounded px-2 py-1 w-full ${
                    userRole !== 'principal' && userRole !== 'admin' ? 'bg-gray-100 text-gray-600' : ''
                  }`}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onPrevious}>
          Previous
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Page2;
