/**
 * Comprehensive System Test Suite
 * Tests all critical features without external dependencies
 */

import { validateEmail } from './Backend/utils/emailValidator.js';
import { validateJWTSecret } from './Backend/utils/securityLogger.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`\n${BLUE}╔════════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║     🧪 COMPREHENSIVE PRODUCTION READINESS TEST SUITE      ║${RESET}`);
console.log(`${BLUE}╔════════════════════════════════════════════════════════════╗${RESET}\n`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const logTest = (name, passed, message = '') => {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`${GREEN}✅ PASS${RESET} - ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    failedTests++;
    console.log(`${RED}❌ FAIL${RESET} - ${name}`);
    if (message) console.log(`   ${RED}${message}${RESET}`);
  }
};

const logSection = (title) => {
  console.log(`\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${YELLOW}  ${title}${RESET}`);
  console.log(`${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
};

// ============================================================================
// 1. EMAIL VALIDATION TESTS
// ============================================================================
logSection('1. EMAIL VALIDATION SYSTEM');

const emailTests = [
  { email: 'student@dayanandasagar.edu', valid: true, desc: 'Valid institutional email' },
  { email: 'faculty@dayanandasagar.edu', valid: true, desc: 'Valid faculty email' },
  { email: 'john.doe@dayanandasagar.edu', valid: true, desc: 'Email with dot' },
  { email: 'student@gmail.com', valid: false, desc: 'Gmail rejection' },
  { email: 'user@yahoo.com', valid: false, desc: 'Yahoo rejection' },
  { email: 'invalid-email', valid: false, desc: 'Invalid format' },
  { email: '', valid: false, desc: 'Empty string' },
];

emailTests.forEach(test => {
  const result = validateEmail(test.email);
  logTest(
    `Email: ${test.email || '(empty)'}`,
    result.success === test.valid,
    `Expected: ${test.valid ? 'VALID' : 'INVALID'}, Got: ${result.success ? 'VALID' : 'INVALID'}`
  );
});

// ============================================================================
// 2. JWT SECRET VALIDATION
// ============================================================================
logSection('2. JWT SECRET SECURITY');

// Load env first before validation
import dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' });

try {
  validateJWTSecret();
  logTest('JWT_SECRET strength validation', true, 'Strong secret configured');
} catch (error) {
  logTest('JWT_SECRET strength validation', false, error.message);
}

// ============================================================================
// 3. ENVIRONMENT VARIABLES CHECK
// ============================================================================
logSection('3. ENVIRONMENT CONFIGURATION');

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'CLIENT_URL',
  'JWT_SECRET',
  'NODE_ENV',
  'TOKEN_EXPIRY_HOURS',
  'ADMIN_TOKEN_EXPIRY_HOURS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_EMAIL',
  'SMTP_PASSWORD',
];

requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  logTest(
    `Environment variable: ${varName}`,
    exists,
    exists ? `Value: ${varName.includes('SECRET') || varName.includes('PASSWORD') ? '[HIDDEN]' : process.env[varName]}` : 'Missing'
  );
});

// ============================================================================
// 4. FILE STRUCTURE VALIDATION
// ============================================================================
logSection('4. PROJECT FILE STRUCTURE');

import fs from 'fs';
import path from 'path';

const criticalFiles = [
  'Backend/server.js',
  'Backend/app.js',
  'Backend/dbConnect.js',
  'Backend/.env',
  'Backend/package.json',
  'Backend/model/user.js',
  'Backend/model/data.js',
  'Backend/controller/authController.js',
  'Backend/middleware/auth.js',
  'Backend/middleware/rateLimiter.js',
  'Frontend/package.json',
  'Frontend/src/App.jsx',
  'Frontend/src/helper/axiosInstance.js',
  'Frontend/.env.development',
  'Frontend/.env.production',
  'README.md',
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  logTest(
    `File exists: ${file}`,
    exists,
    exists ? 'Found' : 'Missing - create this file'
  );
});

// ============================================================================
// 5. PACKAGE DEPENDENCIES CHECK
// ============================================================================
logSection('5. BACKEND DEPENDENCIES');

const backendPackage = JSON.parse(fs.readFileSync('./Backend/package.json', 'utf8'));
const backendDeps = backendPackage.dependencies;

const criticalBackendDeps = [
  'express',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs',
  'cors',
  'dotenv',
  'express-rate-limit',
  'nodemailer',
  'cloudinary',
  'multer',
  'cookie-parser',
];

criticalBackendDeps.forEach(dep => {
  const installed = !!backendDeps[dep];
  logTest(
    `Dependency: ${dep}`,
    installed,
    installed ? `Version: ${backendDeps[dep]}` : 'Not installed'
  );
});

// ============================================================================
// 6. FRONTEND DEPENDENCIES CHECK
// ============================================================================
logSection('6. FRONTEND DEPENDENCIES');

const frontendPackage = JSON.parse(fs.readFileSync('./Frontend/package.json', 'utf8'));
const frontendDeps = frontendPackage.dependencies;

const criticalFrontendDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'axios',
  '@reduxjs/toolkit',
  'react-redux',
  'jspdf',
  'react-hot-toast',
];

criticalFrontendDeps.forEach(dep => {
  const installed = !!frontendDeps[dep];
  logTest(
    `Dependency: ${dep}`,
    installed,
    installed ? `Version: ${frontendDeps[dep]}` : 'Not installed'
  );
});

// ============================================================================
// 7. SECURITY CONFIGURATION
// ============================================================================
logSection('7. SECURITY SETTINGS');

logTest(
  'JWT_SECRET length',
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
  `Length: ${process.env.JWT_SECRET?.length || 0} chars (minimum 32 required)`
);

logTest(
  'NODE_ENV configured',
  !!process.env.NODE_ENV,
  `Environment: ${process.env.NODE_ENV}`
);

logTest(
  'Rate limiting configured',
  fs.existsSync('./Backend/middleware/rateLimiter.js'),
  'Rate limiter middleware found'
);

logTest(
  'CORS configuration',
  process.env.CLIENT_URL && process.env.CLIENT_URL.length > 0,
  `Allowed origins: ${process.env.CLIENT_URL}`
);

// ============================================================================
// 8. CLOUDINARY CONFIGURATION
// ============================================================================
logSection('8. CLOUDINARY FILE UPLOAD');

const cloudinaryVars = ['CLOUDINARY_NAME', 'CLOUDINARY_KEY', 'CLOUDINARY_SECRET'];
cloudinaryVars.forEach(varName => {
  const exists = !!process.env[varName];
  const isPlaceholder = process.env[varName]?.includes('your_cloudinary');
  logTest(
    `Cloudinary: ${varName}`,
    exists && !isPlaceholder,
    exists ? (isPlaceholder ? 'Placeholder detected - update with real values' : 'Configured') : 'Missing'
  );
});

// ============================================================================
// 9. CODE SPLITTING VERIFICATION
// ============================================================================
logSection('9. FRONTEND OPTIMIZATION');

const appJsx = fs.readFileSync('./Frontend/src/App.jsx', 'utf8');
logTest(
  'React.lazy() code splitting',
  appJsx.includes('lazy(') && appJsx.includes('Suspense'),
  'Code splitting implemented'
);

logTest(
  'Dynamic imports for pages',
  appJsx.includes('const Page') && appJsx.includes('lazy('),
  'Page components lazy loaded'
);

// ============================================================================
// 10. API ROUTE STRUCTURE
// ============================================================================
logSection('10. API ENDPOINTS');

const routerFile = fs.readFileSync('./Backend/routers/router.js', 'utf8');

const criticalRoutes = [
  { path: '/signup', desc: 'User registration' },
  { path: '/login', desc: 'User login' },
  { path: '/logout', desc: 'User logout' },
  { path: '/addData', desc: 'Evaluation data' },
  { path: '/basicInfo', desc: 'Basic employee info' },
  { path: '/remarks', desc: 'Section remarks' },
  { path: '/auth/request-otp', desc: 'OTP verification' },
  { path: '/auth/forgot-password', desc: 'Password reset' },
  { path: '/admin/login-logs', desc: 'Admin login logs' },
];

criticalRoutes.forEach(route => {
  // Check if route exists (handles both exact matches and routes with parameters)
  const exists = routerFile.includes(`"${route.path}"`) || 
                 routerFile.includes(`'${route.path}'`) ||
                 routerFile.includes(`"${route.path}/`) ||
                 routerFile.includes(`'${route.path}/`) ||
                 routerFile.includes(`"${route.path}:`);
  logTest(
    `Route: ${route.path}`,
    exists,
    `${route.desc}`
  );
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log(`\n${BLUE}╔════════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║                     TEST SUMMARY                           ║${RESET}`);
console.log(`${BLUE}╠════════════════════════════════════════════════════════════╣${RESET}`);
console.log(`${BLUE}║${RESET}  Total Tests Run: ${totalTests.toString().padEnd(43)}${BLUE}║${RESET}`);
console.log(`${BLUE}║${RESET}  ${GREEN}Passed: ${passedTests.toString().padEnd(49)}${BLUE}║${RESET}`);
console.log(`${BLUE}║${RESET}  ${failedTests > 0 ? RED : GREEN}Failed: ${failedTests.toString().padEnd(49)}${BLUE}║${RESET}`);
console.log(`${BLUE}║${RESET}  Success Rate: ${((passedTests/totalTests)*100).toFixed(2)}%${' '.repeat(36)}${BLUE}║${RESET}`);
console.log(`${BLUE}╚════════════════════════════════════════════════════════════╝${RESET}\n`);

if (failedTests === 0) {
  console.log(`${GREEN}🎉 ALL TESTS PASSED! System is production ready!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}⚠️  ${failedTests} test(s) failed. Please fix the issues above.${RESET}\n`);
  process.exit(1);
}
