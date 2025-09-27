import React from 'react';

const PhotoUploadSection = ({ photo, photoPreview, onPhotoChange, analyzing }) => {
  return (
    <div>
      <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
        Photo *
      </label>
      <input
        type="file"
        id="photo"
        name="photo"
        accept="image/*"
        required
        disabled={analyzing}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        onChange={onPhotoChange}
      />
      <p className="text-sm text-gray-500 mt-1">
        Upload a clear photo of the issue (Max 5MB, JPG/PNG)
        {analyzing && " - Analyzing image..."}
      </p>

      {/* Photo Preview */}
      {photoPreview && (
        <div className="mt-3 relative">
          <img
            src={photoPreview}
            alt="Preview"
            className={`max-w-full h-48 object-cover rounded-md border border-gray-300 ${analyzing ? 'opacity-50' : ''}`}
          />
          {analyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-md">
              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-blue-800">Analyzing...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;