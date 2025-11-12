// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { adminAPI } from '../utils/api';
import useTranslation from '../hooks/useTranslation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdminReportCard from '../components/admin/AdminReportCard';
import StatsCards from '../components/admin/StatsCards';
import ReportsChart from '../components/admin/ReportsChart';
import FilterControls from '../components/admin/FilterControls';
import ReportsMap from '../components/admin/ReportsMap';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BASE_URL);
// const socket = io('https://sq04q0b3-5000.inc1.devtunnels.ms');

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const { user, logout } = useAuth();
  const { showError, showSuccess } = useNotification();
  const { t, direction } = useTranslation();
  
  const downloadReports = async (format = 'csv') => {
    try {
      const response = await adminAPI.getExport(format);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers['content-disposition'] || '';
      let filename = '';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^;\"]+)"?/.exec(disposition);
      if (match) filename = decodeURIComponent(match[1] || match[2]);
      if (!filename) filename = `reports.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess(t('messages.actionSuccessful'));
    } catch (error) {
      console.error('Export error:', error);
      showError(t('messages.actionFailed'));
    }
  };

  // Initial fetch
  useEffect(() => {
    const { status, category, sortBy, sortOrder, page, limit } = filters;
    fetchReports({ status, category, sortBy, sortOrder, page, limit });
  }, [
    filters.status,
    filters.category,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchStats();
  }, []);


  useEffect(() => {

    socket.on('reportCreated', (newReport) => {
      setReports((prev) => [newReport, ...prev]);
      fetchStats();
    });

    socket.on('reportUpdated', (updatedReport) => {
      setReports((prev) =>
        prev.map((r) => (r._id === updatedReport._id ? updatedReport : r))
      );
      fetchStats();
    });

    socket.on('reportDeleted', (deletedId) => {
      setReports((prev) => prev.filter((r) => r._id !== deletedId));
      fetchStats();
    });

    return () => {
      socket.off('reportCreated');
      socket.off('reportUpdated');
      socket.off('reportDeleted');
    };
  }, []);

  const fetchReports = async (appliedFilters) => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllReports(appliedFilters);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError(t('report.noReportsFound'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showError(t('admin.statistics'));
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus, adminNotes = '') => {
    try {
      await adminAPI.updateReportStatus(reportId, {
        status: newStatus,
        adminNotes,
      });

      showSuccess(t('messages.actionSuccessful'));

    } catch (error) {
      console.error('Error updating status:', error);
      showError(t('messages.actionFailed'));
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm(t('report.confirmDelete'))) {
      try {
        await adminAPI.deleteReport(reportId);
        showSuccess(t('report.reportDeleted'));

      } catch (error) {
        console.error('Error deleting report:', error);
        showError(t('messages.actionFailed'));
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={direction}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {t('admin.dashboard')}
              </h1>
              <p className="text-purple-100 mt-2 text-lg">{t('messages.welcome')}, <span className="font-semibold">{user?.username}</span> - {t('admin.reportManagement')}</p>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => downloadReports('csv')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 font-semibold shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{t('common.download')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="mb-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>
      )}

      {/* Charts Section */}
      {stats && !statsLoading && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <ReportsChart stats={stats} />
        </div>
      )}

      {/* Reports Management */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              {t('admin.allReports')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="font-semibold">{t('admin.totalReports')}:</span> 
                <span className="font-bold text-lg text-indigo-600">{reports.length}</span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm rounded-md transition-all font-medium ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-sm'
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
                  className={`px-3 py-2 text-sm rounded-md transition-all font-medium ${
                    viewMode === 'map'
                      ? 'bg-white text-indigo-600 shadow-sm'
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
          </div>

          {/* Filter Controls */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <FilterControls filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Reports List or Map */}
        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : reports.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {reports
                    .filter((report) =>
                      filters.location
                        ? (report.location?.address || '')
                            .toLowerCase()
                            .includes(filters.location.toLowerCase())
                        : true
                    )
                    .map((report) => (
                      <AdminReportCard
                        key={report._id}
                        report={report}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={handleDeleteReport}
                      />
                    ))}
                </div>
              ) : (
                <ReportsMap 
                  reports={reports.filter((report) =>
                    filters.location
                      ? (report.location?.address || '')
                          .toLowerCase()
                          .includes(filters.location.toLowerCase())
                      : true
                  )} 
                  height="500px"
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('report.noReportsFound')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.category
                  ? t('messages.tryAgain')
                  : t('messages.welcome')}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
