import React from 'react';

const FormHeader = ({ onBack }) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
      <p className="text-gray-600 mt-2">Help improve your community by reporting civic issues</p>
    </div>
  );
};

export default FormHeader;