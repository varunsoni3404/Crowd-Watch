// src/components/user/ReportCard.js
import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../utils/api';
import useTranslation from '../../hooks/useTranslation';
import { translateReportContent } from '../../services/translationService';

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
  const { t, language } = useTranslation();
  const [translatedReport, setTranslatedReport] = useState(report);
  const [isTranslating, setIsTranslating] = useState(false);

  // Update translated report when report prop changes (real-time updates from socket)
  useEffect(() => {
    if (language === 'en') {
      setTranslatedReport(report);
    } else {
      // Re-translate when report changes
      const translateReport = async () => {
        setIsTranslating(true);
        const translated = await translateReportContent(report, language);
        setTranslatedReport(translated);
        setIsTranslating(false);
      };
      translateReport();
    }
  }, [report, language]);

  const statusColorClass = getStatusColor(translatedReport.status);

  const onDelete = async (reportId) => {
    if (window.confirm(t('reportCard.deleteConfirm'))) {
      try {
        await reportsAPI.deleteReport(reportId);
        showSuccess(t('report.reportDeleted'));

      } catch (error) {
        console.error('Error deleting report:', error);
        showError(t('messages.actionFailed'));
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center text-gray-500">
              {getCategoryIcon(translatedReport.category)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {translatedReport.title}
              {isTranslating && <span className="ml-2 text-xs text-gray-400">(translating...)</span>}
            </h3>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColorClass}`}>
              {t(`status.${translatedReport.status === 'In Progress' ? 'inProgress' : translatedReport.status.toLowerCase()}`)}
            </span>
            <span className="text-sm text-gray-500">{t(`categories.${translatedReport.category.toLowerCase()}`)}</span>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {translatedReport.description}
          </p>

          {translatedReport.additionalComments && (
            <div className="mt-2 p-2 bg-gray-50 border-l-4 border-gray-400 rounded">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{t('reportCard.additionalComments')}:</span> {translatedReport.additionalComments}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{t('reportCard.submitted')}: {formatDate(translatedReport.createdAt)}</span>
            {translatedReport.statusUpdatedAt && translatedReport.statusUpdatedAt !== translatedReport.createdAt && (
              <span>{t('reportCard.updated')}: {formatDate(translatedReport.statusUpdatedAt)}</span>
            )}
          </div>

          {translatedReport.adminNotes && (
            <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <span className="font-medium">{t('reportCard.adminNotes')}:</span> {translatedReport.adminNotes}
              </p>
            </div>
          )}
        </div>

        {translatedReport.photoUrl && (
          <div className="ml-4 flex-shrink-0">
            <img
              // src={`https://sq04q0b3-5000.inc1.devtunnels.ms${report.photoUrl}`}
              src={`${import.meta.env.VITE_BASE_URL}${translatedReport.photoUrl}`}

              alt="Report"
              className="w-20 h-20 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      {translatedReport.location && (
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
              {translatedReport.location.address ||
                `${translatedReport.location.latitude.toFixed(4)}, ${translatedReport.location.longitude.toFixed(4)}`}
            </div>

            {/* <button
              onClick={() => onDelete(report._id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('common.delete')}
            </button> */}
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportCard;