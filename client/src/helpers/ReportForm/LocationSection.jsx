import React from 'react';
import LocationButton from './LocationButton';

const LocationSection = ({ 
  formData, 
  locationLoading, 
  onChange, 
  onGetCurrentLocation 
}) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>

      {/* Get Current Location Button */}
      <div className="mb-4">
        <LocationButton
          loading={locationLoading}
          onClick={onGetCurrentLocation}
        />
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
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default LocationSection;