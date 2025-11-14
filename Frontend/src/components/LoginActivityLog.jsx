import React, { useState, useEffect } from 'react';
import axiosInstance from '../helper/axiosInstance';
import toast from 'react-hot-toast';

const LoginActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    activeSessions: 0
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    logsPerPage: 20
  });
  const [filters, setFilters] = useState({
    email: '',
    startDate: '',
    endDate: '',
    today: false,
    thisWeek: false
  });

  // Fetch login logs
  const fetchLoginLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filters.email) params.append('email', filters.email);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.today) params.append('today', 'true');
      if (filters.thisWeek) params.append('thisWeek', 'true');

      const response = await axiosInstance.get(`/admin/login-logs?${params}`);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching login logs:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to fetch login logs');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch login statistics
  const fetchLoginStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/login-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching login stats:', error);
    }
  };

  // Close stale sessions
  const handleCloseStaleSession = async () => {
    try {
      const response = await axiosInstance.post('/admin/close-stale-sessions');
      if (response.data.success) {
        toast.success(response.data.message);
        fetchLoginLogs(pagination.currentPage);
        fetchLoginStats();
      }
    } catch (error) {
      console.error('Error closing stale sessions:', error);
      toast.error('Failed to close stale sessions');
    }
  };

  // Initial load
  useEffect(() => {
    fetchLoginLogs();
    fetchLoginStats();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchLoginLogs(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      email: '',
      startDate: '',
      endDate: '',
      today: false,
      thisWeek: false
    });
    setTimeout(() => fetchLoginLogs(1), 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Active';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">User Login Activity Log</h3>
        <button
          onClick={handleCloseStaleSession}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
        >
          Close Stale Sessions
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Today</div>
          <div className="text-2xl font-bold text-blue-700">{stats.today}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">This Week</div>
          <div className="text-2xl font-bold text-green-700">{stats.thisWeek}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">This Month</div>
          <div className="text-2xl font-bold text-purple-700">{stats.thisMonth}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Active Sessions</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.activeSessions}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Email
            </label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Enter email..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="today"
                  checked={filters.today}
                  onChange={handleFilterChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Today</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="thisWeek"
                  checked={filters.thisWeek}
                  onChange={handleFilterChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">This Week</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Filters
          </button>
          <button
            onClick={() => fetchLoginLogs(pagination.currentPage)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading login logs...</p>
        </div>
      )}

      {/* Login Logs Table */}
      {!loading && logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Role</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Time-In</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Time-Out</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Duration</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{log.email}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.role === 'admin' ? 'bg-red-100 text-red-800' :
                      log.role === 'hod' ? 'bg-blue-100 text-blue-800' :
                      log.role === 'principal' ? 'bg-purple-100 text-purple-800' :
                      log.role === 'external' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{formatDate(log.timeIn)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {log.timeOut ? formatDate(log.timeOut) : 
                      <span className="text-green-600 font-medium">Active</span>
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {log.duration === 'Active' ? 
                      <span className="text-green-600 font-medium">{log.duration}</span> : 
                      log.duration
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data State */}
      {!loading && logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No login logs found</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalLogs} total logs)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLoginLogs(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-4 py-2 rounded text-sm ${
                pagination.currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.currentPage}
            </span>
            <button
              onClick={() => fetchLoginLogs(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-4 py-2 rounded text-sm ${
                pagination.currentPage === pagination.totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginActivityLog;
