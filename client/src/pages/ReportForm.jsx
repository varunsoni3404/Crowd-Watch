import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useReportForm } from '../hooks/useReportForm';
import useTranslation from '../hooks/useTranslation';
import FormHeader from '../helpers/ReportForm/FormHeader';
import BasicInfoSection from '../helpers/ReportForm/BasicInfoSection';
import PhotoUploadSection from '../helpers/ReportForm/PhotoUploadSection';
import LocationSection from '../helpers/ReportForm/LocationSection';
import FormActions from '../helpers/ReportForm/FormActions';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const ReportForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { t, direction } = useTranslation();
  
  const {
    formData,
    loading,
    locationLoading,
    photoPreview,
    analyzing,
    isAnalyzed,
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6" dir={direction}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <FormHeader onBack={handleBack} />
      
      {analyzing && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-800">{t('common.loading')}</span>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Always show Photo Upload Section */}
          <PhotoUploadSection
            photo={formData.photo}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            analyzing={analyzing}
          />
          
          {/* Show other sections only after API response */}
          {isAnalyzed && (
            <>
              {/* Success message after analysis */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">Image analyzed successfully! Please review and complete the details below.</span>
                </div>
              </div>

              {/* Basic Info Section */}
              <BasicInfoSection 
                formData={formData}
                onChange={handleInputChange}
              />
              
              {/* Location Section */}
              <LocationSection
                formData={formData}
                locationLoading={locationLoading}
                onChange={handleInputChange}
                onGetCurrentLocation={getCurrentLocation}
              />
              
              {/* Form Actions */}
              <FormActions
                loading={loading}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </form>
      </div>
      
      {/* Instructions when no image is uploaded */}
      {!formData.photo && !analyzing && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a Photo to Get Started</h3>
            <p className="text-gray-600">
              Upload a clear photo of the civic issue and our AI will automatically analyze it to generate a title, description, and category for your report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportForm;