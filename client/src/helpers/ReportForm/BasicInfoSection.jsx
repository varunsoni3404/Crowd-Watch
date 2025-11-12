import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const BasicInfoSection = ({ formData, onChange }) => {
  const { t } = useTranslation();
  
  const CATEGORIES = [
    { key: 'potholes', label: t('categories.potholes') },
    { key: 'sanitation', label: t('categories.sanitation') },
    { key: 'streetlights', label: t('categories.streetlights') },
    { key: 'waterSupply', label: t('categories.waterSupply') },
    { key: 'drainage', label: t('categories.drainage') },
    { key: 'traffic', label: t('categories.traffic') },
    { key: 'parks', label: t('categories.parks') },
    { key: 'other', label: t('categories.other') },
  ];

  return (
    <>
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.title')} *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          disabled
          required
          maxLength="200"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('report.title')}
          value={formData.title}
          onChange={onChange}
        />
        {formData.title && (
          <p className="text-sm text-green-600 mt-1">
            ✓ {t('messages.actionSuccessful')}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.category')} *
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
          <option value="">{t('report.category')}</option>
          {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.label}>
              {cat.label}
            </option>
          ))}
        </select>
        {formData.category && (
          <p className="text-sm text-green-600 mt-1">
            ✓ {t('messages.actionSuccessful')}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.description')} *
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          disabled
          maxLength="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('report.description')}
          value={formData.description}
          onChange={onChange}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            {formData.description.length}/1000 characters
          </p>
          {formData.description && (
            <p className="text-sm text-green-600">
              ✓ {t('messages.actionSuccessful')}
            </p>
          )}
        </div>
      </div>

    {/* Additional Comments */}
    <div>
      <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-1">
        {t('messages.welcome')}
      </label>
      <textarea
        id="additionalComments"
        name="additionalComments"
        rows="3"
        maxLength="1000"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder={t('messages.welcome')}
        value={formData.additionalComments}
        onChange={onChange}
      />
      <p className="text-sm text-gray-500">
        {formData.additionalComments.length}/1000 characters
      </p>
    </div>
    </>
  );
};

export default BasicInfoSection;