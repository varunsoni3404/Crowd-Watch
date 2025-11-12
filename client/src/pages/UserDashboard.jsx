// src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { reportsAPI } from '../utils/api';
import useTranslation from '../hooks/useTranslation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReportCard from '../components/user/ReportCard';
import ReportsMap from '../components/admin/ReportsMap';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import socket from '../utils/socket';

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
  });

  const { user, logout } = useAuth();
  const { showError } = useNotification();
  const { t, direction } = useTranslation();

  useEffect(() => {
    fetchUserReports();

    socket.on("reportUpdated", (updatedReport) => {
      setReports((prevReports) => {
        const exists = prevReports.find((r) => r._id === updatedReport._id);
        if (exists) {
          return prevReports.map((r) =>
            r._id === updatedReport._id ? updatedReport : r
          );
        } else {
          return [updatedReport, ...prevReports];
        }
      });
    });

    socket.on("reportDeleted", (reportId) => {
      setReports((prevReports) =>
        prevReports.filter((r) => r._id !== reportId)
      );
    });

    return () => {
      socket.off("reportUpdated");
      socket.off("reportDeleted");
    };
  }, []);

  useEffect(() => {
    const newStats = {
      total: reports.length,
      submitted: reports.filter(r => r.status === 'Submitted').length,
      inProgress: reports.filter(r => r.status === 'In Progress').length,
      resolved: reports.filter(r => r.status === 'Resolved').length,
    };
    setStats(newStats);
  }, [reports]);

  const fetchUserReports = async () => {
    try {
      const response = await reportsAPI.getUserReports();
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError(t('report.noReportsFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6" dir={direction}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">
              {t('messages.welcome')}, {user?.username}
            </h1>
            <p className="text-gray-600">{t('user.dashboard')}</p>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('common.search')}</h2>
        <Link
          to="/report"
          className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('user.reportIssue')}
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{t('admin.totalReports')}</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{t('admin.pendingReports')}</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{t('admin.inProgressReports')}</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{t('admin.resolvedReports')}</h3>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">{t('user.myReports')}</h2>
            
            {/* View Mode Toggle - Only show if there are reports */}
            {reports.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{t('admin.totalReports')}: {reports.length}</span>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    {t('common.search')}
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'map'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {t('report.viewMap')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {reports.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <ReportCard key={report._id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="h-96">
                  <ReportsMap 
                    reports={reports} 
                    height="400px"
                    showUserReportsOnly={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new report.</p>
              <div className="mt-6">
                <Link
                  to="/report"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Report
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;