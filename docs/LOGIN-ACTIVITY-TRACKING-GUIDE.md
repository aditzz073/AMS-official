# Login Activity Logging System - Implementation Guide

## Overview
This document describes the complete login activity logging system that tracks user login/logout events and displays them to Admin users in the Appraisal Management System.

## Features Implemented

### 1. **Database Schema (MongoDB)**
- **Model**: `LoginLog` (`Backend/model/loginLog.js`)
- **Fields**:
  - `user`: Reference to User model (ObjectId)
  - `email`: User's email address (indexed)
  - `timeIn`: Login timestamp (indexed)
  - `timeOut`: Logout timestamp (null for active sessions)
  - `ipAddress`: Client IP address
  - `userAgent`: Browser/client information
  - `sessionDuration`: Duration in milliseconds (calculated on logout)
  - `timestamps`: Auto-generated createdAt/updatedAt

### 2. **Backend Implementation**

#### Authentication Updates (`Backend/controller/authController.js`)
- **Login Function**:
  - Closes any previous open sessions for the user
  - Creates new login log entry with IP and User Agent
  - Captures `timeIn` automatically
  
- **Logout Function**:
  - Finds the latest open session (where `timeOut` is null)
  - Closes the session with current timestamp
  - Calculates session duration
  - Handles errors gracefully

#### Middleware Updates (`Backend/middleware/auth.js`)
- **protect**: Enhanced to close sessions when token expires
- **adminOnly**: New middleware to restrict access to admin-only routes

#### Login Log Controller (`Backend/controller/loginLogController.js`)
Three main endpoints:

1. **GET /admin/login-logs**: Fetch paginated login logs
   - Parameters:
     - `page`: Page number (default: 1)
     - `limit`: Records per page (default: 20)
     - `email`: Filter by email (regex search)
     - `startDate`: Filter by start date
     - `endDate`: Filter by end date
     - `today`: Filter today's logs (boolean)
     - `thisWeek`: Filter this week's logs (boolean)
   - Returns: Paginated logs with formatted data

2. **GET /admin/login-stats**: Get login statistics
   - Returns:
     - Today's login count
     - This week's login count
     - This month's login count
     - Active sessions count

3. **POST /admin/close-stale-sessions**: Close stale sessions
   - Closes sessions older than 6 hours that are still open
   - Returns count of closed sessions

### 3. **Frontend Implementation**

#### Login Activity Log Component (`Frontend/src/components/LoginActivityLog.jsx`)
Features:
- **Statistics Dashboard**: Shows today, this week, this month, and active session counts
- **Advanced Filters**:
  - Email search (case-insensitive)
  - Date range filtering
  - Quick filters (Today, This Week)
  - Clear filters option
- **Data Table**: Displays all login logs with:
  - Email
  - Role (color-coded badges)
  - Time-In
  - Time-Out (shows "Active" for ongoing sessions)
  - Duration (formatted as days, hours, minutes)
  - IP Address
- **Pagination**: Navigate through pages of logs
- **Actions**:
  - Refresh button
  - Close stale sessions button
  - Apply/Clear filters

#### Page 2 Integration (`Frontend/src/pages/Page2.jsx`)
- Login Activity Log is conditionally rendered only for Admin role
- Placed at the bottom of the FPMI page
- Seamlessly integrated with existing page structure

### 4. **Routes Added** (`Backend/routers/router.js`)
```javascript
// Admin-only Login Log routes
router.get('/admin/login-logs', protect, adminOnly, getLoginLogs);
router.get('/admin/login-stats', protect, adminOnly, getLoginStats);
router.post('/admin/close-stale-sessions', protect, adminOnly, closeStaleSession);

// Updated logout to use protect middleware
router.post('/logout', protect, logout);
```

## Access Control

### Role-Based Access
- **Admin**: Full access to all login logs and statistics
- **Faculty/HOD/External/Principal**: Cannot access login logs (403 Forbidden)

### Security Features
1. All login log endpoints require authentication (`protect` middleware)
2. Additional `adminOnly` middleware ensures only admins can access
3. Token expiration automatically closes open sessions
4. IP address and User Agent captured for audit trail
5. Stale session cleanup to handle browser closures without logout

## Session Management

### Login Behavior
1. User logs in → New login log created
2. Any previous open sessions for that user are auto-closed
3. IP address and User Agent are captured
4. `timeIn` is set to current timestamp

### Logout Behavior
1. User clicks logout → Latest open session is found
2. `timeOut` is set to current timestamp
3. `sessionDuration` is calculated
4. Session is marked as complete

### Token Expiration
1. Token expires → Middleware detects expiration
2. All open sessions for that user are closed
3. User is redirected to login

### Browser Close (No Logout)
1. Session remains open with `timeOut = null`
2. Marked as "Active" in the UI
3. Auto-closed when:
   - User logs in again (previous session closed)
   - Token expires
   - Admin manually closes stale sessions (>6 hours old)

## UI Features

### Statistics Cards
- **Today**: Count of logins today
- **This Week**: Count of logins this week
- **This Month**: Count of logins this month
- **Active Sessions**: Currently active sessions

### Filters Panel
- **Email Search**: Real-time search by email
- **Date Range**: Start date and end date pickers
- **Quick Filters**: Checkboxes for Today and This Week
- **Actions**: Apply Filters, Clear Filters, Refresh

### Data Table
- **Responsive Design**: Scrollable on small screens
- **Color-Coded Roles**:
  - Admin: Red badge
  - HOD: Blue badge
  - Principal: Purple badge
  - External: Green badge
  - Faculty: Gray badge
- **Duration Formatting**: 
  - Days and hours (e.g., "2d 5h")
  - Hours and minutes (e.g., "3h 45m")
  - Minutes and seconds (e.g., "15m 30s")
  - "Active" for ongoing sessions

### Pagination
- Shows current page and total pages
- Total logs count
- Previous/Next navigation
- Disabled buttons at boundaries

## API Response Examples

### Get Login Logs
```json
{
  "success": true,
  "data": [
    {
      "id": "673abc123...",
      "email": "admin@example.com",
      "role": "admin",
      "timeIn": "2025-11-15T10:30:00.000Z",
      "timeOut": "2025-11-15T12:45:00.000Z",
      "duration": "2h 15m",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalLogs": 95,
    "logsPerPage": 20
  }
}
```

### Get Login Stats
```json
{
  "success": true,
  "stats": {
    "today": 12,
    "thisWeek": 45,
    "thisMonth": 156,
    "activeSessions": 3
  }
}
```

## Testing Checklist

- [ ] Login creates new log entry
- [ ] Logout closes session with correct timestamp
- [ ] Multiple logins by same user close previous sessions
- [ ] Token expiration closes sessions
- [ ] Admin can view all login logs
- [ ] Non-admin users get 403 error
- [ ] Pagination works correctly
- [ ] Email filter works (case-insensitive)
- [ ] Date filters work correctly
- [ ] Today/This Week quick filters work
- [ ] Statistics display correctly
- [ ] Active sessions show as "Active"
- [ ] Duration formatting is correct
- [ ] Stale session cleanup works
- [ ] IP address is captured
- [ ] User agent is captured

## Installation Steps

1. **No database migration needed** - MongoDB will auto-create collections
2. **Restart backend server** to load new models and routes
3. **Login as admin** to test the feature
4. **Navigate to Page 2** (FPMI page) to view Login Activity Log

## Future Enhancements (Optional)

- Export logs to CSV/Excel
- Real-time updates using WebSocket
- More detailed session information
- Session anomaly detection
- Geographic location from IP
- Device fingerprinting
- Session force-kill by admin

## Troubleshooting

### Login logs not appearing
- Ensure user is logged in as admin
- Check browser console for errors
- Verify backend routes are registered
- Check MongoDB connection

### 403 Forbidden error
- User must have `role: 'admin'` in database
- Check JWT token includes correct role
- Verify `adminOnly` middleware is working

### Sessions not closing
- Check `protect` middleware in logout route
- Verify LoginLog model methods are working
- Check for errors in backend logs

## File Changes Summary

### New Files
1. `Backend/model/loginLog.js` - LoginLog schema
2. `Backend/controller/loginLogController.js` - Login log endpoints
3. `Frontend/src/components/LoginActivityLog.jsx` - UI component

### Modified Files
1. `Backend/controller/authController.js` - Added login/logout logging
2. `Backend/middleware/auth.js` - Added adminOnly middleware, session cleanup
3. `Backend/routers/router.js` - Added login log routes
4. `Frontend/src/pages/Page2.jsx` - Integrated LoginActivityLog component

## Conclusion

The login activity logging system is now fully functional and provides comprehensive tracking of user sessions. Admin users can monitor login activity, view statistics, and manage stale sessions through an intuitive interface.
