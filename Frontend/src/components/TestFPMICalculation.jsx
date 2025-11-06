import React, { useState, useEffect } from 'react';
import axiosInstance from '../helper/axiosInstance';

const TestFPMICalculation = () => {
  const [testResults, setTestResults] = useState(null);
  const [currentFormData, setCurrentFormData] = useState(null);

  const testCalculation = async () => {
    try {
      // Get current form data from localStorage
      const formData = JSON.parse(localStorage.getItem("formData")) || {};
      setCurrentFormData(formData);

      // Test data to send to backend
      const testData = {
        // TLP fields
        TLP111Self: "10", TLP111HoD: "8", TLP111External: "9",
        TLP112Self: "8", TLP112HoD: "7", TLP112External: "8",
        TLP113Self: "9", TLP113HoD: "8", TLP113External: "9", 
        TLP114Self: "7", TLP114HoD: "6", TLP114External: "7",
        
        // PDRC fields
        PDRC211Self: "10", PDRC211HoD: "9", PDRC211External: "10",
        PDRC212Self: "8", PDRC212HoD: "7", PDRC212External: "8",
        PDRC213Self: "9", PDRC213HoD: "8", PDRC213External: "9",
        PDRC214Self: "6", PDRC214HoD: "5", PDRC214External: "6",
        PDRC221Self: "7", PDRC221HoD: "6", PDRC221External: "7",
        PDRC222Self: "5", PDRC222HoD: "4", PDRC222External: "5",
        
        // CDL fields  
        CDL31Self: "10", CDL31HoD: "9", CDL31External: "10",
        CDL32Self: "8", CDL32HoD: "7", CDL32External: "8",
        CDL33Self: "9", CDL33HoD: "8", CDL33External: "9",
        CDL34Self: "7", CDL34HoD: "6", CDL34External: "7",
        CDL35Self: "6", CDL35HoD: "5", CDL35External: "6",
        
        // CIL fields
        CIL4Self: "15", CIL4HoD: "14", CIL4External: "15",
        
        // IOW fields
        IOW511Self: "5", IOW511HoD: "4", IOW511External: "5",
        IOW512Self: "6", IOW512HoD: "5", IOW512External: "6",
        IOW513Self: "4", IOW513HoD: "3", IOW513External: "4",
        IOW521Self: "7", IOW521HoD: "6", IOW521External: "7", 
        IOW522Self: "8", IOW522HoD: "7", IOW522External: "8",
        IOW523Self: "5", IOW523HoD: "4", IOW523External: "5",
        IOW524Self: "6", IOW524HoD: "5", IOW524External: "6",
        IOW525Self: "4", IOW525HoD: "3", IOW525External: "4",
      };

      console.log("Sending test data to /app/total:", testData);
      
      // Call the calculation endpoint
      const response = await axiosInstance.post("/total", testData);
      
      console.log("Response from /app/total:", response.data);
      
      setTestResults({
        success: response.data.success,
        totals: response.data.totals,
        expectedTotals: {
          TLPSelf: 34, TLPHoD: 29, TLPExternal: 33,
          PDRCSelf: 45, PDRCHoD: 39, PDRCExternal: 45,
          CDLSelf: 40, CDLHoD: 35, CDLExternal: 40,
          CILSelf: 15, CILHoD: 14, CILExternal: 15,
          IOWSelf: 45, IOWHoD: 37, IOWExternal: 45,
          totalSelf: 179, totalHoD: 154, totalExternal: 178
        }
      });

    } catch (error) {
      console.error("Error testing calculation:", error);
      setTestResults({ error: error.message });
    }
  };

  const testCurrentFormData = async () => {
    try {
      const formData = JSON.parse(localStorage.getItem("formData")) || {};
      console.log("Testing current form data:", formData);
      
      const response = await axiosInstance.post("/total", formData);
      console.log("Current form data calculation result:", response.data);
      
      setTestResults({
        success: response.data.success,
        totals: response.data.totals,
        message: "Results from current form data"
      });
      
    } catch (error) {
      console.error("Error testing current form data:", error);
      setTestResults({ error: error.message });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">FPMI Calculation Test</h2>
      
      <div className="space-y-4">
        <button 
          onClick={testCalculation}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test with Sample Data
        </button>
        
        <button 
          onClick={testCurrentFormData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test with Current Form Data
        </button>
      </div>

      {currentFormData && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Current Form Data Preview</h3>
          <div className="text-sm max-h-40 overflow-y-auto">
            <pre>{JSON.stringify(currentFormData, null, 2)}</pre>
          </div>
        </div>
      )}

      {testResults && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          
          {testResults.error ? (
            <div className="text-red-600">Error: {testResults.error}</div>
          ) : (
            <div>
              <div className="mb-4">
                <strong>Success:</strong> {testResults.success ? "✅" : "❌"}
                {testResults.message && <div className="text-sm text-gray-600">{testResults.message}</div>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Actual Results</h4>
                  <table className="text-sm border">
                    <tbody>
                      {testResults.totals && Object.entries(testResults.totals).map(([key, value]) => (
                        <tr key={key}>
                          <td className="border px-2 py-1">{key}</td>
                          <td className="border px-2 py-1">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {testResults.expectedTotals && (
                  <div>
                    <h4 className="font-semibold">Expected Results</h4>
                    <table className="text-sm border">
                      <tbody>
                        {Object.entries(testResults.expectedTotals).map(([key, value]) => (
                          <tr key={key}>
                            <td className="border px-2 py-1">{key}</td>
                            <td className="border px-2 py-1">{value}</td>
                            <td className="border px-2 py-1">
                              {testResults.totals && testResults.totals[key] == value ? "✅" : "❌"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestFPMICalculation;