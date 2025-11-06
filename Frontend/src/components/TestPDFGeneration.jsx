import React from 'react';
import { generateFPMIPDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const TestPDFGeneration = () => {
  const testData = {
    employeeCode: "EMP001",
    name: "Dr. John Doe",
    designation: "Assistant Professor",
    college: "DSCE",
    campus: "Kumarswamy Layout (Campus 1)",
    department: "Information Science and Engineering",
    joiningDate: "2020-01-15",
    periodOfAssessment: "2024-25",
    categoriesTotal: {
      TLPSelf: "65",
      TLPHoD: "70",
      TLPExternal: "68",
      PDRCSelf: "75",
      PDRCHoD: "78",
      PDRCExternal: "76",
      CDLSelf: "40",
      CDLHoD: "42",
      CDLExternal: "41",
      CILSelf: "25",
      CILHoD: "27",
      CILExternal: "26",
      IOWSelf: "35",
      IOWHoD: "38",
      IOWExternal: "36",
    },
    totalSelf: "240",
    totalHoD: "255",
    totalExternal: "247",
    HODName: "Dr. Jane Smith",
    externalEvaluatorName: "Dr. Mike Johnson",
    principleName: "Dr. Sarah Wilson"
  };

  const handleTestPDF = () => {
    try {
      const filename = generateFPMIPDF(testData);
      toast.success(`Test PDF generated successfully: ${filename}`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate test PDF");
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">PDF Generation Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This button will generate a test PDF with sample data to verify the PDF generation functionality.
      </p>
      <button
        onClick={handleTestPDF}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Generate Test PDF
      </button>
    </div>
  );
};

export default TestPDFGeneration;