import React, { useState } from 'react';
import ReportLocationMap from './ReportLocationMap';

const AdminReportCard = ({ report, onStatusUpdate, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [showMap, setShowMap] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = () => {
    onStatusUpdate(report._id, newStatus, adminNotes);
    setStatusModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">Category:</span> {report.category}
              </div>
              <div>
                <span className="font-medium">User:</span> {report.userId?.username || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Submitted:</span> {formatDate(report.createdAt)}
              </div>
              {report.assignedAdmin && (
                <div>
                  <span className="font-medium">Assigned to:</span> {report.assignedAdmin.username}
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{report.description}</p>

            {report.location && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {report.location.address ||
                  `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
              </div>
            )}

            {report.adminNotes && (
              <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Admin Notes:</span> {report.adminNotes}
                </p>
              </div>
            )}
          </div>

          {report.photoUrl && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={`${import.meta.env.VITE_BASE_URL}${report.photoUrl}`}
                alt="Report"
                className="w-24 h-24 object-cover rounded-md border cursor-pointer hover:opacity-80"
                onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${report.photoUrl}`, '_blank')}
              // onClick={() => window.open(`https://sq04q0b3-5000.inc1.devtunnels.ms${report.photoUrl}`, '_blank')}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusModal(true)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Status
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            {report.location && report.location.latitude && report.location.longitude && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            )}
          </div>
          {/* <button
            onClick={() => onDelete(report._id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button> */}
        </div>

        {/* Additional Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
            <div><strong>Report ID:</strong> {report._id}</div>
            <div><strong>User Email:</strong> {report.userId?.email || 'N/A'}</div>
            <div><strong>Last Updated:</strong> {formatDate(report.statusUpdatedAt || report.updatedAt)}</div>
            {/* {report.location && (
              <div>
                <strong>Coordinates:</strong> {report.location.latitude}, {report.location.longitude}
              </div>
            )} */}
            {report.location && (
              <div>
                <strong>Coordinates:</strong>{" "}
                <a
                  href={`https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {report.location.latitude}, {report.location.longitude}
                </a>
              </div>
            )}

          </div>
        )}

        {/* Map View */}
        {showMap && report.location && report.location.latitude && report.location.longitude && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Location Map</h4>
            <ReportLocationMap report={report} height="250px" />
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Report Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this report..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setStatusModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminReportCard;