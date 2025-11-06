import React from 'react';

const Page0 = ({onNext}) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="border border-gray-200 rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Faculty Performance Appraisal</h1>
          <p className="text-gray-500">Please read all instructions carefully before proceeding</p>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p><strong>Important:</strong> Please ensure that you read all instructions thoroughly before starting the appraisal process. This will help ensure accurate assessment and timely processing of your faculty performance evaluation.</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Faculty member should enter their self-evaluation scores based on the prescribed performance indicators and criteria.</li>
          <li>Completed appraisal form along with necessary proofs should be submitted to the Head of the Department by the specified deadline.</li>
          <li>Head of the department shall verify scores submitted by the faculty and provide their assessment.</li>
          <li>The external evaluator will do the assessment based on the documentation provided and may request additional information if needed.</li>
          <li>The Head of the department after complete evaluation will forward the appraisal to the Dean for final review and approval.</li>
        </ol>
        
        <div className="flex justify-between mt-6">
        <div></div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onNext}
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
};

export default Page0;