import React from 'react';
import { CATEGORIES } from '../../constants/reportCategories';

const BasicInfoSection = ({ formData, onChange }) => {
  return (
    <>
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
          onChange={onChange}
        />
        {formData.title && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Auto-generated from image analysis
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category"
          name="category"
          disabled
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={formData.category}
          onChange={onChange}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {formData.category && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Auto-detected from image analysis
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          maxLength="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Provide detailed description of the issue..."
          value={formData.description}
          onChange={onChange}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            {formData.description.length}/1000 characters
          </p>
          {formData.description && (
            <p className="text-sm text-green-600">
              ✓ Auto-generated from image analysis
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;