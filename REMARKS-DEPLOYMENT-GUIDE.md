# Remarks Feature - Installation & Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the section-wise remarks feature to your existing Appraisal Management System.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Existing AMS application running
- Admin access to the database

## Installation Steps

### 1. Database Migration

The remarks feature adds a new field to the existing `Evaluation` schema. **No data will be lost** - this is a non-destructive update.

#### Option A: Automatic Migration (Recommended)

MongoDB will automatically add the `remarks` field when you restart the backend with the updated schema. No manual intervention needed.

```bash
# Navigate to backend directory
cd Backend

# Restart the application
npm start
```

#### Option B: Manual Database Update (Optional)

If you want to manually add the field to existing documents:

```javascript
// Run this in MongoDB shell or Compass
db.evaluations.updateMany(
  { remarks: { $exists: false } },
  { $set: { remarks: {} } }
)
```

### 2. Backend Deployment

```bash
# Navigate to backend directory
cd Backend

# Install dependencies (if any new ones were added)
npm install

# Restart the server
npm start
```

The backend should now have:
- ✅ Updated `data.js` model with remarks field
- ✅ New `remarksController.js` with 3 endpoints
- ✅ Updated routes in `router.js`
- ✅ Role-based access control in `handelData.js`

### 3. Frontend Deployment

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies (no new packages required)
npm install

# Build for production
npm run build

# Or start development server
npm run dev
```

The frontend should now have:
- ✅ New `RemarksBox` component
- ✅ Updated role permissions
- ✅ Integrated remarks in all form pages
- ✅ Updated form submission logic

## Verification Checklist

After deployment, verify the following:

### Backend Verification

1. **Check server logs** for successful startup
   ```
   ✓ Server running on port 5000
   ✓ MongoDB connected
   ```

2. **Test API endpoints** (use Postman or curl)
   ```bash
   # Get remarks (requires authentication)
   curl -X GET http://localhost:5000/remarks/EMP001 \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Update remark (HOD/Admin only)
   curl -X PUT http://localhost:5000/remarks/EMP001 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"sectionId": "section-1-tlp", "remark": "Test remark"}'
   ```

3. **Check database schema**
   ```bash
   # In MongoDB shell
   db.evaluations.findOne()
   
   # Should see: remarks: {} or remarks: Map {}
   ```

### Frontend Verification

1. **Login as HOD**
   - Navigate to any evaluation form
   - Scroll through sections
   - Verify yellow remarks boxes appear after each section
   - Type in a remark and verify character counter works
   - Submit form and check if remarks are saved

2. **Login as Principal**
   - Open a form with HOD remarks
   - Verify remarks are visible but read-only
   - Verify textarea is disabled/grayed out

3. **Login as Faculty**
   - Navigate to evaluation form
   - Verify remarks boxes do NOT appear
   - Verify no console errors

4. **Check browser console**
   - No errors should appear
   - Look for successful API calls
   - Verify localStorage updates

## Rollback Plan

If you need to rollback this feature:

### Backend Rollback

```bash
cd Backend

# Revert changes using git
git checkout HEAD~1 model/data.js
git checkout HEAD~1 controller/remarksController.js
git checkout HEAD~1 controller/handelData.js
git checkout HEAD~1 routers/router.js

# Restart server
npm start
```

### Frontend Rollback

```bash
cd Frontend

# Revert changes using git
git checkout HEAD~1 src/components/RemarksBox.jsx
git checkout HEAD~1 src/utils/rolePermissions.js
git checkout HEAD~1 src/pages/Page*.jsx

# Rebuild
npm run build
```

### Database Cleanup (Optional)

If you want to remove the remarks field from all documents:

```javascript
// MongoDB shell
db.evaluations.updateMany(
  {},
  { $unset: { remarks: "" } }
)
```

⚠️ **Warning**: This will permanently delete all remarks data!

## Production Deployment

### Using PM2 (Recommended)

```bash
# Backend
cd Backend
pm2 restart ams-backend

# Or start fresh
pm2 start npm --name "ams-backend" -- start

# Frontend (if using PM2 for frontend)
cd Frontend
pm2 restart ams-frontend
```

### Using Docker

```bash
# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Environment Variables

Ensure your `.env` files are properly configured:

**Backend `.env`**:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ams
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend `.env`**:
```
VITE_API_URL=http://localhost:5000
```

## Performance Considerations

### Database Indexing

For better performance with large datasets:

```javascript
// Create index on employeeCode for faster remarks retrieval
db.evaluations.createIndex({ employeeCode: 1 })
```

### Caching

Consider implementing caching for remarks:

```javascript
// Backend: Use Redis for caching
// Frontend: Use React Query or SWR for data caching
```

## Monitoring

### Health Checks

Add these endpoints to monitor the feature:

```javascript
// Backend health check
GET /health/remarks

// Response
{
  "status": "ok",
  "remarksFeature": "enabled",
  "lastRemarkUpdate": "2025-11-15T10:30:00Z"
}
```

### Logging

Enable detailed logging for remarks operations:

```javascript
// In remarksController.js
console.log(`[REMARKS] User ${req.user.email} accessed remarks for ${employeeCode}`);
console.log(`[REMARKS] Updated section ${sectionId} for ${employeeCode}`);
```

## Troubleshooting

### Issue: Remarks not saving

**Solution**:
1. Check browser console for API errors
2. Verify HOD authentication token is valid
3. Check backend logs for validation errors
4. Ensure MongoDB connection is active

### Issue: Remarks not displaying

**Solution**:
1. Verify user role in Redux store
2. Check rolePermissions.js configuration
3. Clear localStorage and refresh
4. Verify data structure in database

### Issue: Character counter not working

**Solution**:
1. Check RemarksBox component props
2. Verify formData is being passed correctly
3. Check for JavaScript errors in console

### Issue: API returns 403 Forbidden

**Solution**:
1. Verify user role is HOD or Admin
2. Check JWT token validity
3. Review protect middleware
4. Check role-based access control logic

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review remarks usage analytics
2. **Monthly**: Check database size and optimize if needed
3. **Quarterly**: Backup all remarks data
4. **Yearly**: Archive old evaluation remarks

### Backup Strategy

```bash
# Backup remarks data
mongodump --db ams --collection evaluations --out /backup/ams-remarks-$(date +%Y%m%d)

# Restore if needed
mongorestore --db ams --collection evaluations /backup/ams-remarks-20251115/
```

## Additional Resources

- [Backend API Documentation](./SECTION-REMARKS-FEATURE.md#api-documentation)
- [Role Permissions Guide](./SECTION-REMARKS-FEATURE.md#role-based-access-control)
- [Testing Checklist](./SECTION-REMARKS-FEATURE.md#testing-checklist)

## Contact

For deployment issues or questions:
- Create an issue in the repository
- Contact the development team
- Review the comprehensive feature documentation

---

**Deployment Status**: Ready for Production ✅
**Last Updated**: November 15, 2025
**Version**: 1.0.0
