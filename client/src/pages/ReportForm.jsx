import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useReportForm } from '../hooks/useReportForm';
import FormHeader from '../helpers/ReportForm/FormHeader';
import BasicInfoSection from '../helpers/ReportForm/BasicInfoSection';
import PhotoUploadSection from '../helpers/ReportForm/PhotoUploadSection';
import LocationSection from '../helpers/ReportForm/LocationSection';
import FormActions from '../helpers/ReportForm/FormActions';

const ReportForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const {
    formData,
    loading,
    locationLoading,
    photoPreview,
    analyzing,
    handleInputChange,
    handlePhotoChange,
    getCurrentLocation,
    handleSubmit,
    validateForm
  } = useReportForm({ showSuccess, showError, navigate });

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <FormHeader onBack={handleBack} />
      
      {analyzing && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-800">Analyzing image and generating content...</span>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PhotoUploadSection
            photo={formData.photo}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            analyzing={analyzing}
          />
          
          <BasicInfoSection 
            formData={formData}
            onChange={handleInputChange}
          />
          
          <LocationSection
            formData={formData}
            locationLoading={locationLoading}
            onChange={handleInputChange}
            onGetCurrentLocation={getCurrentLocation}
          />
          
          <FormActions
            loading={loading}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default ReportForm;