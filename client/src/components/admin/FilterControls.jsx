import React from 'react';

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

const STATUSES = ['Submitted', 'In Progress', 'Resolved'];

const FilterControls = ({ filters, onFilterChange }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          value={filters.location || ""}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          placeholder="Search locality, city, state..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="createdAt">Date Created</option>
          <option value="statusUpdatedAt">Last Updated</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Order
        </label>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

export default FilterControls;
