// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { adminAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdminReportCard from '../components/admin/AdminReportCard';
import StatsCards from '../components/admin/StatsCards';
import ReportsChart from '../components/admin/ReportsChart';
import FilterControls from '../components/admin/FilterControls';
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

  const { user, logout } = useAuth();
  const { showError, showSuccess } = useNotification();

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
      showError('Failed to fetch reports');
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
      showError('Failed to fetch statistics');
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

      showSuccess('Report status updated successfully');

    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update report status');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await adminAPI.deleteReport(reportId);
        showSuccess('Report deleted successfully');

      } catch (error) {
        console.error('Error deleting report:', error);
        showError('Failed to delete report');
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.username} - Manage civic issue reports
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="mb-6">
          <LoadingSpinner />
        </div>
      ) : (
        <StatsCards stats={stats} />
      )}

      {/* Charts Section */}
      {stats && !statsLoading && (
        <div className="mb-6">
          <ReportsChart stats={stats} />
        </div>
      )}

      {/* Reports Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
              All Reports
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Total: {reports.length} reports</span>
            </div>
          </div>

          {/* Filter Controls */}
          <FilterControls filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Reports List */}
        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : reports.length > 0 ? (
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
                No reports found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.category
                  ? 'Try adjusting your filters to see more reports.'
                  : 'No reports have been submitted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
