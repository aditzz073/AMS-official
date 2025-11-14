import LoginLog from '../model/loginLog.js';

// @desc    Get all login logs (Admin only)
// @route   GET /api/admin/login-logs
// @access  Private/Admin
export const getLoginLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Filter by email if provided
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.timeIn = {};
      if (req.query.startDate) {
        filter.timeIn.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filter.timeIn.$lte = endDate;
      }
    }

    // Filter by today
    if (req.query.today === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.timeIn = { $gte: today, $lt: tomorrow };
    }

    // Filter by this week
    if (req.query.thisWeek === 'true') {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      filter.timeIn = { $gte: firstDayOfWeek };
    }

    // Get total count for pagination
    const total = await LoginLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await LoginLog.find(filter)
      .populate('user', 'email role')
      .sort({ timeIn: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format the logs
    const formattedLogs = logs.map(log => ({
      id: log._id,
      email: log.email,
      role: log.user?.role || 'N/A',
      timeIn: log.timeIn,
      timeOut: log.timeOut,
      duration: log.sessionDuration ? formatDuration(log.sessionDuration) : 'Active',
      ipAddress: log.ipAddress || 'N/A',
      userAgent: log.userAgent || 'N/A'
    }));

    res.status(200).json({
      success: true,
      data: formattedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        logsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login logs',
      error: error.message
    });
  }
};

// @desc    Get login statistics (Admin only)
// @route   GET /api/admin/login-stats
// @access  Private/Admin
export const getLoginStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay());

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, weekCount, monthCount, activeSessionsCount] = await Promise.all([
      LoginLog.countDocuments({ timeIn: { $gte: today } }),
      LoginLog.countDocuments({ timeIn: { $gte: thisWeek } }),
      LoginLog.countDocuments({ timeIn: { $gte: thisMonth } }),
      LoginLog.countDocuments({ timeOut: null })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        activeSessions: activeSessionsCount
      }
    });
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login statistics',
      error: error.message
    });
  }
};

// @desc    Close stale sessions (Admin only)
// @route   POST /api/admin/close-stale-sessions
// @access  Private/Admin
export const closeStaleSession = async (req, res) => {
  try {
    // Close sessions older than 6 hours that are still open
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    
    const staleSessions = await LoginLog.find({
      timeIn: { $lt: sixHoursAgo },
      timeOut: null
    });

    for (const session of staleSessions) {
      await session.closeSession();
    }

    res.status(200).json({
      success: true,
      message: `Closed ${staleSessions.length} stale sessions`,
      count: staleSessions.length
    });
  } catch (error) {
    console.error('Error closing stale sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close stale sessions',
      error: error.message
    });
  }
};

// Helper function to format duration
const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};
