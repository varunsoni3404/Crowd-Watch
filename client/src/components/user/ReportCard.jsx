// src/components/user/ReportCard.js
import React from 'react';
import { reportsAPI } from '../../utils/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'Submitted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category) => {
  const iconClass = "w-5 h-5";

  switch (category) {
    case 'Potholes':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case 'Sanitation':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case 'Streetlights':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'Water Supply':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'Drainage':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2-2 2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ReportCard = ({ report }) => {
  const statusColorClass = getStatusColor(report.status);

  const onDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsAPI.deleteReport(reportId);
        showSuccess('Report deleted successfully');

      } catch (error) {
        console.error('Error deleting report:', error);
        showError('Failed to delete report');
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center text-gray-500">
              {getCategoryIcon(report.category)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColorClass}`}>
              {report.status}
            </span>
            <span className="text-sm text-gray-500">{report.category}</span>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {report.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Submitted: {formatDate(report.createdAt)}</span>
            {report.statusUpdatedAt && report.statusUpdatedAt !== report.createdAt && (
              <span>Updated: {formatDate(report.statusUpdatedAt)}</span>
            )}
          </div>

          {report.adminNotes && (
            <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Admin Notes:</span> {report.adminNotes}
              </p>
            </div>
          )}
        </div>

        {report.photoUrl && (
          <div className="ml-4 flex-shrink-0">
            <img
              // src={`https://sq04q0b3-5000.inc1.devtunnels.ms${report.photoUrl}`}
              src={`${import.meta.env.VITE_BASE_URL}${report.photoUrl}`}

              alt="Report"
              className="w-20 h-20 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      {report.location && (
        <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {report.location.address ||
                `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
            </div>

            <button
              onClick={() => onDelete(report._id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportCard;