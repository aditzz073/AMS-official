# Login Activity Logging - Quick Start Guide

## 🎯 What's New?

A complete login activity tracking system has been implemented that captures every user login and logout event, making it visible to Admin users in the Appraisal Management System.

## ✨ Key Features

### For Admin Users:
- 📊 **Dashboard Statistics**: View login counts for today, this week, this month, and active sessions
- 📋 **Detailed Log Table**: See all login activities with email, role, time-in, time-out, duration, and IP address
- 🔍 **Advanced Filters**: Search by email, date range, or use quick filters (Today/This Week)
- 📄 **Pagination**: Navigate through logs efficiently
- 🔧 **Session Management**: Close stale sessions (>6 hours old)
- 🔄 **Real-time Updates**: Refresh logs on demand

### For All Users:
- 🔐 **Automatic Tracking**: Every login/logout is logged automatically
- ⏱️ **Session Duration**: System tracks how long users are logged in
- 🌐 **IP & Browser Info**: Captures connection details for security audit
- 🔒 **Session Cleanup**: Stale sessions are auto-closed on next login or token expiry

## 🚀 How to Use

### As Admin:

1. **Login** to the system with admin credentials
2. **Navigate** to Page 2 (FPMI/Instructions page)
3. **Scroll down** to find "User Login Activity Log" section
4. **View Statistics** at the top (Today, This Week, This Month, Active Sessions)
5. **Use Filters** to search specific users or date ranges:
   - Enter email in search box
   - Select date range
   - Or use quick filters (Today/This Week checkboxes)
6. **Click "Apply Filters"** to filter results
7. **Click "Refresh"** to update the logs
8. **Click "Close Stale Sessions"** to clean up old open sessions

### Viewing Log Details:

Each log entry shows:
- **Email**: User's email address
- **Role**: Color-coded badge (Admin=Red, HOD=Blue, Principal=Purple, External=Green, Faculty=Gray)
- **Time-In**: When user logged in
- **Time-Out**: When user logged out (or "Active" if still logged in)
- **Duration**: How long the session lasted (formatted as "2h 15m" or "Active")
- **IP Address**: Connection IP

### Navigation:
- Use **Previous/Next** buttons at the bottom for pagination
- View **current page number** and **total logs** count

## 🔒 Security & Access Control

- ✅ **Only Admin** users can view login logs
- ✅ Faculty, HOD, External, Principal users **cannot access** this feature (403 Forbidden)
- ✅ All endpoints require **authentication** (valid JWT token)
- ✅ IP address and User Agent are **captured for audit trail**

## 🔄 Session Behavior

### Normal Flow:
1. **User logs in** → New session created with time-in
2. **User logs out** → Session closed with time-out and duration calculated
3. **User logs in again** → Previous open session auto-closed, new session created

### Edge Cases:
- **Browser closed without logout**: Session remains "Active" until:
  - User logs in again (auto-closes previous)
  - Token expires (auto-closes)
  - Admin closes stale sessions
- **Token expiration**: All open sessions for that user are auto-closed
- **Multiple tabs**: Each login creates a new session log

## 🧪 Testing the Feature

### Quick Test:
1. Open browser console (F12)
2. Copy and paste the contents of `test-login-logs.js`
3. Press Enter to run tests
4. Check console output for results

### Manual Test:
1. Login as admin → Check if new log entry appears
2. Logout → Check if time-out is recorded
3. Login again → Check if previous session was closed
4. Try filters → Verify filtering works
5. Test as non-admin user → Should get 403 error

## 📊 API Endpoints

All endpoints require authentication and admin role:

```
GET  /api/admin/login-logs          - Fetch paginated login logs
GET  /api/admin/login-stats         - Get statistics (today, week, month, active)
POST /api/admin/close-stale-sessions - Close sessions older than 6 hours
```

### Query Parameters for `/admin/login-logs`:
- `page` - Page number (default: 1)
- `limit` - Logs per page (default: 20)
- `email` - Filter by email (case-insensitive)
- `startDate` - Filter from this date
- `endDate` - Filter until this date
- `today` - Boolean, filter today's logs
- `thisWeek` - Boolean, filter this week's logs

## 🐛 Troubleshooting

### Logs not showing?
- ✓ Verify you're logged in as **admin**
- ✓ Check browser console for errors
- ✓ Try clicking **Refresh** button
- ✓ Ensure backend server is running

### Getting 403 Forbidden?
- ✓ Check your role in database: must be `role: 'admin'`
- ✓ Logout and login again to refresh JWT token
- ✓ Verify `adminOnly` middleware is active

### Sessions not closing?
- ✓ Ensure you're using the logout button (not just closing browser)
- ✓ For stale sessions, use "Close Stale Sessions" button
- ✓ Check backend logs for errors

### No statistics showing?
- ✓ Ensure you have at least one login log in database
- ✓ Click **Refresh** to reload statistics
- ✓ Check network tab for failed API calls

## 📁 Files Added/Modified

### New Files:
- `Backend/model/loginLog.js` - Login log database schema
- `Backend/controller/loginLogController.js` - Admin endpoints
- `Frontend/src/components/LoginActivityLog.jsx` - UI component
- `LOGIN-ACTIVITY-TRACKING-GUIDE.md` - Detailed documentation
- `test-login-logs.js` - Testing script

### Modified Files:
- `Backend/controller/authController.js` - Added login/logout logging
- `Backend/middleware/auth.js` - Added session cleanup & admin middleware
- `Backend/routers/router.js` - Added login log routes
- `Frontend/src/pages/Page2.jsx` - Integrated log viewer

## 🎓 Technical Details

- **Database**: MongoDB with indexes on user, email, and timeIn
- **Authentication**: JWT token-based with role verification
- **Session Management**: Auto-close on token expiry and new login
- **Pagination**: Server-side with configurable limit
- **Filtering**: Regex search for email, date range support
- **Duration Calculation**: Formatted as human-readable (days/hours/minutes)

## 🚀 Future Enhancements

Potential additions:
- Export logs to CSV/Excel
- Real-time updates with WebSockets
- Geographic location from IP
- Session force-kill by admin
- Email notifications for suspicious activity
- Device fingerprinting

## 📞 Support

For issues or questions:
1. Check the detailed guide: `LOGIN-ACTIVITY-TRACKING-GUIDE.md`
2. Run test script: `test-login-logs.js`
3. Check backend console logs
4. Review browser console for frontend errors

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Author**: GitHub Copilot
