import { useState } from 'react';
import { reportsAPI } from '../utils/api';
import { analyzeIssue } from '../services/classificationService';
import { reverseGeocode } from '../services/locationService';

export const useReportForm = ({ showSuccess, showError, navigate }) => {
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
  const [analyzing, setAnalyzing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    if (file.size > 5 * 1024 * 1024) {
      showError('Photo size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    setFormData(prev => ({ ...prev, photo: file }));
    createPhotoPreview(file);
    
    // Auto-analyze the image and populate form
    await analyzeAndPopulateForm(file);
  };

  const createPhotoPreview = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeAndPopulateForm = async (file) => {
    setAnalyzing(true);
    try {
      const issueData = await analyzeIssue(file);
      
      // Update form with AI-generated data
      setFormData(prev => ({
        ...prev,
        category: issueData.category || prev.category,
        title: issueData.title || prev.title,
        description: issueData.description || prev.description
      }));

      showSuccess('Image analyzed and form auto-populated!');
    } catch (error) {
      console.error('Analysis error:', error);
      showError('Failed to analyze image. Please fill details manually.');
    } finally {
      setAnalyzing(false);
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        try {
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            setFormData(prev => ({ ...prev, address }));
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }

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
      const message = 'Failed to submit report, please upload a valid picture';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};