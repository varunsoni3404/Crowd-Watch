import React from 'react';
import useTranslation from '../../hooks/useTranslation';

const FilterControls = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  
  const CATEGORIES = [
    t('categories.potholes'),
    t('categories.sanitation'), 
    t('categories.streetlights'),
    t('categories.waterSupply'),
    t('categories.drainage'),
    t('categories.traffic'),
    t('categories.parks'),
    t('categories.other')
  ];

  const STATUSES = [
    t('status.pending'),
    t('status.inProgress'),
    t('status.resolved')
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.status')}
        </label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('common.filter')}</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.category')}
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('common.filter')}</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('report.location')}
        </label>
        <input
          type="text"
          value={filters.location || ""}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          placeholder={t('report.selectLocation')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('common.search')}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="createdAt">{t('report.createdAt')}</option>
          <option value="statusUpdatedAt">{t('report.updatedAt')}</option>
          <option value="title">{t('report.title')}</option>
          <option value="status">{t('report.status')}</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('common.filter')}
        </label>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="desc">{t('report.createdAt')}</option>
          <option value="asc">{t('report.updatedAt')}</option>
        </select>
      </div>
    </div>
  );
};

export default FilterControls;
