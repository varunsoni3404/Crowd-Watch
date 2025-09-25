// src/pages/ReportForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { reportsAPI } from '../utils/api';

const CATEGORIES = [
  'Potholes',
  'Sanitation',
  'Streetlights',
  'Water Supply',
  'Drainage',
  'Traffic',
  'Parks',
  'Other'
];

const ReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photo: null,
    latitude: '',
    longitude: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError('Photo size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Auto-classify the image
      try {
        const classifyFormData = new FormData();
        classifyFormData.append('image', file);

        const response = await fetch('http://127.0.0.1:8080/classify', {
          method: 'POST',
          body: classifyFormData,
        });

        if (response.ok) {
          const result = await response.json();
          const detectedCategory = result.category;

           // Map the API response to your form categories
          const categoryMapping = {
            "pothole on road": "Potholes",
            "drainage issue": "Drainage",
            "garbage problem": "Sanitation", 
            "streetlight not working": "Streetlights",
          };

          const mappedCategory = categoryMapping[detectedCategory.toLowerCase()] || 'Other';

          // Auto-select the category
          setFormData(prev => ({
            ...prev,
            category: mappedCategory
          }));

          showSuccess(`Image classified as: ${mappedCategory}`);
        } else {
          console.error('Classification failed:', response.statusText);
          showError('Failed to classify image. Please select category manually.');
        }
      } catch (error) {
        console.error('Classification error:', error);
        showError('Failed to classify image. Please select category manually.');
      }
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      showError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        // Try to get address from coordinates (reverse geocoding)
        reverseGeocode(latitude, longitude);
        setLocationLoading(false);
        showSuccess('Location captured successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        showError('Failed to get location.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  //Testing for multiple locations
  // const getCurrentLocation = () => {
  //   // Fake coords for testing
  //   const latitude = 19.22890345509869
  //   const longitude = 73.27701777688996;

  //   setFormData(prev => ({
  //     ...prev,
  //     latitude: latitude.toString(),
  //     longitude: longitude.toString()
  //   }));

  //   reverseGeocode(latitude, longitude);
  //   showSuccess('Fake location set for testing');
  // };

  //For lower specificity of location
  // const reverseGeocode = async (lat, lng) => {
  //   try {
  //     // This is a simple reverse geocoding using a free service
  //     // In production, you might want to use Google Maps API or similar
  //     const response = await fetch(
  //       `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.display_name || data.locality) {
  //         setFormData(prev => ({
  //           ...prev,
  //           address: data.display_name || `${data.locality}, ${data.city}`
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Reverse geocoding failed:', error);
  //     // Don't show error to user as this is optional
  //   }
  // };
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (response.ok) {
        const data = await response.json();

        // Collect available parts
        const parts = [];
        if (data.locality) parts.push(data.locality);
        if (data.city) parts.push(data.city);
        if (data.principalSubdivision) parts.push(data.principalSubdivision);

        if (parts.length > 0) {
          setFormData(prev => ({
            ...prev,
            address: parts.join(", ")
          }));
        }
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };


  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Please enter a title');
      return false;
    }

    if (!formData.description.trim()) {
      showError('Please enter a description');
      return false;
    }

    if (!formData.category) {
      showError('Please select a category');
      return false;
    }

    if (!formData.photo) {
      showError('Please upload a photo');
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      showError('Please provide location information');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('photo', formData.photo);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      if (formData.address) {
        submitData.append('address', formData.address.trim());
      }

      await reportsAPI.createReport(submitData);

      showSuccess('Report submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to submit report';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
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

      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief title describing the issue"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              disabled
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              // required
              rows="4"
              maxLength="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide detailed description of the issue..."
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Photo Upload */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handlePhotoChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a clear photo of the issue (Max 5MB, JPG/PNG)
            </p>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mt-3">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>

            {/* Get Current Location Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {locationLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use Current Location
                  </>
                )}
              </button>
            </div>

            {/* Manual Location Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  disabled
                  required
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 40.7128"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  disabled
                  type="number"
                  id="longitude"
                  name="longitude"
                  required
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., -74.0060"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                disabled
                id="address"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address or landmark"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;