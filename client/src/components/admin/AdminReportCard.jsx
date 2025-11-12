import React, { useState, useEffect } from 'react';
import ReportLocationMap from './ReportLocationMap';
import useTranslation from '../../hooks/useTranslation';
import { translateReportContent } from '../../services/translationService';

const AdminReportCard = ({ report, onStatusUpdate, onDelete }) => {
  const { t, language } = useTranslation();
  const [translatedReport, setTranslatedReport] = useState(report);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [showMap, setShowMap] = useState(false);

  // Update state when report prop changes (real-time updates)
  useEffect(() => {
    setTranslatedReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.adminNotes || '');
  }, [report]);

  // Translate report when language changes
  useEffect(() => {
    const translateReport = async () => {
      if (language === 'en') {
        // Show original content in English
        setTranslatedReport(report);
      } else {
        // Translate from original to target language
        setIsTranslating(true);
        const translated = await translateReportContent(report, language);
        setTranslatedReport(translated);
        setIsTranslating(false);
      }
    };

    translateReport();
  }, [language, report]);

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
                <h3 className="text-lg font-semibold text-gray-900">
                  {translatedReport.title}
                  {isTranslating && <span className="ml-2 text-xs text-gray-400">(translating...)</span>}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(translatedReport.status)}`}>
                  {t(`status.${translatedReport.status === 'In Progress' ? 'inProgress' : translatedReport.status.toLowerCase()}`)}
                </span>
              </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">{t('report.category')}:</span> {t(`categories.${translatedReport.category.toLowerCase()}`)}
              </div>
              <div>
                <span className="font-medium">{t('report.reporter')}:</span> {translatedReport.userId?.username || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">{t('reportCard.submitted')}:</span> {formatDate(translatedReport.createdAt)}
              </div>
              {translatedReport.assignedAdmin && (
                <div>
                  <span className="font-medium">{t('admin.assigned')}:</span> {translatedReport.assignedAdmin.username}
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{translatedReport.description}</p>

            {translatedReport.additionalComments && (
              <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-400 rounded">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{t('reportCard.additionalComments')}:</span> {translatedReport.additionalComments}
                </p>
              </div>
            )}

            {translatedReport.location && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {translatedReport.location.address ||
                  `${translatedReport.location.latitude.toFixed(4)}, ${translatedReport.location.longitude.toFixed(4)}`}
              </div>
            )}

            {translatedReport.adminNotes && (
              <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{t('reportCard.adminNotes')}:</span> {translatedReport.adminNotes}
                </p>
              </div>
            )}
          </div>

          {translatedReport.photoUrl && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={`${import.meta.env.VITE_BASE_URL}${translatedReport.photoUrl}`}
                alt="Report"
                className="w-24 h-24 object-cover rounded-md border cursor-pointer hover:opacity-80"
                onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${translatedReport.photoUrl}`, '_blank')}
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
              {t('admin.updateStatus')}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {showDetails ? t('common.hide') : t('common.show')} {t('report.details')}
            </button>
            {translatedReport.location && translatedReport.location.latitude && translatedReport.location.longitude && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {showMap ? t('common.hide') : t('common.show')} {t('report.viewMap')}
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
            <div><strong>{t('report.details')} ID:</strong> {translatedReport._id}</div>
            <div><strong>{t('auth.email')}:</strong> {translatedReport.userId?.email || 'N/A'}</div>
            <div><strong>{t('report.updatedAt')}:</strong> {formatDate(translatedReport.statusUpdatedAt || translatedReport.updatedAt)}</div>
            {translatedReport.location && (
              <div>
                <strong>Coordinates:</strong>{" "}
                <a
                  href={`https://www.google.com/maps?q=${translatedReport.location.latitude},${translatedReport.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {translatedReport.location.latitude}, {translatedReport.location.longitude}
                </a>
              </div>
            )}

          </div>
        )}

        {/* Map View */}
        {showMap && translatedReport.location && translatedReport.location.latitude && translatedReport.location.longitude && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{t('report.viewMap')}</h4>
            <ReportLocationMap report={translatedReport} height="250px" />
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('admin.updateStatus')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('report.status')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Submitted">{t('status.submitted')}</option>
                  <option value="In Progress">{t('status.inProgress')}</option>
                  <option value="Resolved">{t('status.resolved')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminNotes.label')}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('adminNotes.placeholder')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setStatusModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('common.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminReportCard;