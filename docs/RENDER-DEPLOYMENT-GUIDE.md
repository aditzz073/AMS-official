# Complete Render Deployment Guide for AMS Project

## 📋 Prerequisites
- ✅ GitHub account with your code pushed to repository `aditzz073/AMS-official`
- ✅ Render account (sign up at https://render.com with GitHub)
- ✅ MongoDB Atlas account (free tier at https://mongodb.com/cloud/atlas)
- ✅ Cloudinary account (for file uploads)
- ✅ Gmail account with App Password (for email features)

---

## 🎯 Deployment Strategy

We'll deploy in this order:
1. **MongoDB Atlas** (Database)
2. **Backend** (Node.js/Express API)
3. **Frontend** (React/Vite Static Site)

---

## Step 1: Setup MongoDB Atlas (5 minutes)

### 1.1 Create Free Cluster
1. Go to https://mongodb.com/cloud/atlas
2. Sign up/Login → Click "Build a Database"
3. Choose **FREE** tier (M0 Sandbox)
4. Select region closest to your users
5. Name your cluster (e.g., "ams-cluster")
6. Click "Create"

### 1.2 Configure Database Access
1. Go to "Database Access" → "Add New Database User"
2. Choose "Password" authentication
3. Username: `amsuser` (or your choice)
4. **Save the password securely** - you'll need it!
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. This is needed for Render to connect
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://amsuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add your database name before the `?`:
   ```
   mongodb+srv://amsuser:yourpassword@cluster0.xxxxx.mongodb.net/ams_database?retryWrites=true&w=majority
   ```
7. **Save this - you'll need it for Render!**

---

## Step 2: Deploy Backend on Render (10 minutes)

### 2.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not done
4. Select repository: **AMS-official**
5. Click "Connect"

### 2.2 Configure Backend Service
Fill in these details:

**Basic Settings:**
- **Name:** `ams-backend` (or your choice)
- **Region:** Oregon (US West) or closest to you
- **Branch:** `main`
- **Root Directory:** `Backend`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Instance Type:**
- Select **Free** tier

### 2.3 Add Environment Variables

Click "Advanced" → "Add Environment Variable" for each:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default |
| `MONGO_URI` | Your MongoDB connection string | From Step 1.4 |
| `JWT_SECRET` | Generate random 64+ char string | **IMPORTANT: Use strong random string!** |
| `CLIENT_URL` | `https://ams-frontend.onrender.com` | Update after frontend deploy |
| `CLOUDINARY_NAME` | Your Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_KEY` | Your Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_SECRET` | Your Cloudinary API secret | From Cloudinary dashboard |
| `EMAIL_USER` | Your Gmail address | e.g., yourapp@gmail.com |
| `EMAIL_PASS` | Gmail App Password | See Step 2.4 below |

**Generate Strong JWT_SECRET:**
Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Setup Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password
6. Use this as `EMAIL_PASS` value

### 2.5 Deploy Backend
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Once live, note your backend URL:
   ```
   https://ams-backend.onrender.com
   ```
4. Test it by visiting: `https://ams-backend.onrender.com/app`

---

## Step 3: Deploy Frontend on Render (8 minutes)

### 3.1 Create Static Site
1. Go to https://dashboard.render.com
2. Click "New +" → "Static Site"
3. Select repository: **AMS-official**
4. Click "Connect"

### 3.2 Configure Frontend Service

**Basic Settings:**
- **Name:** `ams-frontend` (or your choice)
- **Region:** Oregon (US West) or same as backend
- **Branch:** `main`
- **Root Directory:** `Frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### 3.3 Add Environment Variable

Click "Advanced" → Add this variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://ams-backend.onrender.com/app` |

**Replace** with your actual backend URL from Step 2.5!

### 3.4 Deploy Frontend
1. Click "Create Static Site"
2. Wait 3-5 minutes for deployment
3. Once live, note your frontend URL:
   ```
   https://ams-frontend.onrender.com
   ```

---

## Step 4: Update Backend CORS (IMPORTANT!)

### 4.1 Update CLIENT_URL in Backend
1. Go to Render Dashboard → Select **ams-backend**
2. Go to "Environment" tab
3. Find `CLIENT_URL` variable
4. Update value to: `https://ams-frontend.onrender.com`
5. Click "Save Changes"
6. Backend will auto-redeploy (wait 2-3 minutes)

---

## Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://ams-backend.onrender.com/app`

Should see API response (not error)

### 5.2 Test Frontend
1. Visit: `https://ams-frontend.onrender.com`
2. Try to register/login
3. Test all features

### 5.3 Check Logs if Issues
**Backend Logs:**
1. Render Dashboard → ams-backend
2. Click "Logs" tab
3. Check for errors

**Frontend Issues:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests

---

## 🎉 Deployment Complete!

Your URLs:
- **Frontend:** https://ams-frontend.onrender.com
- **Backend:** https://ams-backend.onrender.com/app
- **Database:** MongoDB Atlas (managed)

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Backend spins down after 15 min inactivity**
  - First request after inactivity takes ~30 seconds
  - Subsequent requests are fast
- **750 hours/month free** (enough for 1 service 24/7)
- **100 GB bandwidth/month**

### Keep Services Awake (Optional)
Use a free uptime monitor:
1. https://uptimerobot.com (free)
2. Ping your backend every 14 minutes
3. Prevents cold starts

### Custom Domain (Optional)
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Render Dashboard → Static Site → "Custom Domain"
3. Add your domain and update DNS records

### Upgrade to Paid Plan
- **$7/month per service** for always-on instances
- No cold starts
- Better performance

---

## 🔧 Maintenance & Updates

### Deploy New Changes
1. Push code to GitHub `main` branch
2. Render auto-deploys (if enabled)
3. Or manually trigger deploy in Render dashboard

### View Logs
- Render Dashboard → Service → Logs tab
- Real-time logs for debugging

### Monitor Performance
- Render Dashboard → Service → Metrics tab
- CPU, Memory, Request stats

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check logs for errors
- Verify all environment variables are set
- Ensure MONGO_URI is correct
- Check JWT_SECRET is set

### Frontend Shows API Errors
- Check VITE_API_URL is correct in frontend env
- Verify CLIENT_URL is set in backend env
- Check CORS configuration
- Look at browser console errors

### Database Connection Failed
- Verify MongoDB Atlas allows 0.0.0.0/0
- Check MONGO_URI format and password
- Ensure database name is in connection string

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASS
- Check Gmail App Password is correct
- Ensure 2FA is enabled in Gmail

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Render Community:** https://community.render.com

---

## 🎓 Next Steps

1. ✅ Test all features thoroughly
2. ✅ Set up uptime monitoring
3. ✅ Configure custom domain (optional)
4. ✅ Set up automated backups for MongoDB
5. ✅ Monitor usage and performance
6. ✅ Consider upgrading if needed

**Congratulations! Your app is now live! 🚀**
