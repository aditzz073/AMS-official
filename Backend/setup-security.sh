#!/bin/bash

# Security Setup Script for AMS Backend
# Run this script before production deployment

set -e  # Exit on error

echo "🔒 AMS Security Setup Script"
echo "============================"
echo ""

# Check if we're in the Backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Backend directory"
    exit 1
fi

echo "📋 Step 1: Checking dependencies..."
if ! npm list express-rate-limit &> /dev/null; then
    echo "📦 Installing express-rate-limit..."
    npm install express-rate-limit
else
    echo "✅ express-rate-limit already installed"
fi

echo ""
echo "🔐 Step 2: Generating strong JWT_SECRET..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo ""
echo "Generated JWT_SECRET (save this securely):"
echo "=========================================="
echo "$JWT_SECRET"
echo "=========================================="
echo ""

echo "📝 Step 3: Checking .env configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check if JWT_SECRET is weak
    CURRENT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
    if [ ${#CURRENT_SECRET} -lt 32 ]; then
        echo "⚠️  WARNING: Current JWT_SECRET is too short (${#CURRENT_SECRET} chars)"
        echo "   Recommended: 64 characters minimum"
    fi
    
    # Check if production variables are set
    if ! grep -q "^TOKEN_EXPIRY_HOURS=" .env; then
        echo "⚠️  TOKEN_EXPIRY_HOURS not set (adding default: 6)"
        echo "" >> .env
        echo "# Token Expiry Configuration" >> .env
        echo "TOKEN_EXPIRY_HOURS=6" >> .env
        echo "ADMIN_TOKEN_EXPIRY_HOURS=2" >> .env
    fi
else
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

echo ""
echo "🧪 Step 4: Testing server startup..."
echo "   Starting server for 3 seconds..."

# Start server in background and capture output
(node server.js > /tmp/ams_startup.log 2>&1 &)
SERVER_PID=$!
sleep 3

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    
    # Check for JWT warnings
    if grep -q "WARNING.*JWT_SECRET" /tmp/ams_startup.log; then
        echo "⚠️  JWT_SECRET warning detected"
        grep "WARNING" /tmp/ams_startup.log
    fi
    
    # Kill the test server
    kill $SERVER_PID 2>/dev/null || true
else
    echo "❌ Server failed to start. Check logs:"
    cat /tmp/ams_startup.log
    exit 1
fi

echo ""
echo "📊 Security Status Summary"
echo "=========================="
echo ""

# Check rate limiting middleware
if [ -f "middleware/rateLimiter.js" ]; then
    echo "✅ Rate limiting middleware: INSTALLED"
else
    echo "❌ Rate limiting middleware: MISSING"
fi

# Check security logger
if [ -f "utils/securityLogger.js" ]; then
    echo "✅ Security logger: INSTALLED"
else
    echo "❌ Security logger: MISSING"
fi

# Check router updates
if grep -q "loginLimiter" routers/router.js; then
    echo "✅ Rate limiters applied to routes: YES"
else
    echo "❌ Rate limiters applied to routes: NO"
fi

# Check auth controller updates
if grep -q "securityLogger" controller/authController.js; then
    echo "✅ Secure logging in authController: YES"
else
    echo "❌ Secure logging in authController: NO"
fi

echo ""
echo "🎯 Action Items for Production"
echo "=============================="
echo ""
echo "[ ] 1. Update JWT_SECRET in .env with generated secret above"
echo "[ ] 2. Set NODE_ENV=production"
echo "[ ] 3. Update MONGO_URI to production database"
echo "[ ] 4. Update CLIENT_URL to production domain"
echo "[ ] 5. Configure production SMTP service"
echo "[ ] 6. Enable HTTPS"
echo "[ ] 7. Test all rate limiters"
echo "[ ] 8. Verify secure cookies"
echo ""

echo "📚 Documentation:"
echo "   - Full Guide: docs/SECURITY-IMPROVEMENTS.md"
echo "   - Quick Ref: docs/SECURITY-QUICK-REFERENCE.md"
echo "   - Summary: docs/SECURITY-IMPLEMENTATION-SUMMARY.md"
echo ""

echo "✅ Security setup check complete!"
echo ""
echo "⚠️  IMPORTANT: Update your .env with the generated JWT_SECRET before deployment"
