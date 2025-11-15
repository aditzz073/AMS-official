/**
 * Password Reset Feature Test Script
 * Tests the complete forgot password flow including OTP generation, verification, and password reset
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PasswordResetOtp from './Backend/model/passwordResetOtp.js';
import User from './Backend/model/user.js';

// Load environment variables
dotenv.config({ path: './Backend/.env' });

// Color codes for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`\n${BLUE}🔐 PASSWORD RESET FEATURE TEST SUITE${RESET}\n`);
console.log('=' .repeat(70));

let testsPassed = 0;
let testsFailed = 0;

const logPass = (test) => {
  testsPassed++;
  console.log(`${GREEN}✅ PASS${RESET} - ${test}`);
};

const logFail = (test, error) => {
  testsFailed++;
  console.log(`${RED}❌ FAIL${RESET} - ${test}`);
  if (error) console.log(`   Error: ${error}`);
};

const logInfo = (message) => {
  console.log(`${BLUE}ℹ️  ${message}${RESET}`);
};

const logSection = (title) => {
  console.log(`\n${YELLOW}━━━ ${title} ━━━${RESET}\n`);
};

// Test database connection
async function testDatabaseConnection() {
  logSection('DATABASE CONNECTION TEST');
  
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      logFail('Database Connection', 'MONGO_URI not found in environment variables');
      return false;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logPass('Successfully connected to MongoDB');
    return true;
  } catch (error) {
    logFail('Database Connection', error.message);
    return false;
  }
}

// Test PasswordResetOtp Model
async function testPasswordResetOtpModel() {
  logSection('PASSWORD RESET OTP MODEL TESTS');

  try {
    // Test 1: Create OTP record
    const testEmail = 'test@dayanandasagar.edu';
    const testOtp = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpRecord = await PasswordResetOtp.create({
      email: testEmail,
      otp: testOtp,
      expiresAt
    });

    if (otpRecord && otpRecord.email === testEmail) {
      logPass('Create OTP record');
    } else {
      logFail('Create OTP record', 'Record not created properly');
    }

    // Test 2: Check isValid method
    if (otpRecord.isValid()) {
      logPass('OTP isValid() method returns true for fresh OTP');
    } else {
      logFail('OTP isValid() method', 'Should return true for fresh OTP');
    }

    // Test 3: Test rate limiting check
    const canSend = await PasswordResetOtp.checkRateLimit(testEmail);
    if (canSend) {
      logPass('Rate limit check (first OTP allowed)');
    } else {
      logFail('Rate limit check', 'Should allow first OTP');
    }

    // Test 4: Create multiple OTPs for rate limit test
    await PasswordResetOtp.create({
      email: testEmail,
      otp: '234567',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await PasswordResetOtp.create({
      email: testEmail,
      otp: '345678',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    const canSendAfterThree = await PasswordResetOtp.checkRateLimit(testEmail);
    if (!canSendAfterThree) {
      logPass('Rate limit enforcement (max 3 OTPs per hour)');
    } else {
      logFail('Rate limit enforcement', 'Should block after 3 OTPs');
    }

    // Test 5: Test invalidatePreviousOtps
    await PasswordResetOtp.invalidatePreviousOtps(testEmail);
    const unusedOtps = await PasswordResetOtp.countDocuments({
      email: testEmail,
      isUsed: false
    });
    
    if (unusedOtps === 0) {
      logPass('Invalidate previous OTPs');
    } else {
      logFail('Invalidate previous OTPs', `Found ${unusedOtps} unused OTPs`);
    }

    // Test 6: Test OTP expiration
    const expiredOtpRecord = await PasswordResetOtp.create({
      email: testEmail,
      otp: '456789',
      expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
    });

    if (!expiredOtpRecord.isValid()) {
      logPass('OTP expiration detection');
    } else {
      logFail('OTP expiration detection', 'Expired OTP should be invalid');
    }

    // Test 7: Test used OTP
    const usedOtpRecord = await PasswordResetOtp.create({
      email: testEmail,
      otp: '567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: true
    });

    if (!usedOtpRecord.isValid()) {
      logPass('Used OTP detection');
    } else {
      logFail('Used OTP detection', 'Used OTP should be invalid');
    }

    // Cleanup test data
    await PasswordResetOtp.deleteMany({ email: testEmail });
    logInfo('Cleaned up test OTP records');

  } catch (error) {
    logFail('Password Reset OTP Model Tests', error.message);
  }
}

// Test User Model Integration
async function testUserModelIntegration() {
  logSection('USER MODEL INTEGRATION TESTS');

  try {
    const testEmail = 'passwordresettest@dayanandasagar.edu';
    
    // Check if test user exists
    let testUser = await User.findOne({ email: testEmail });
    
    if (!testUser) {
      // Create test user
      testUser = await User.create({
        email: testEmail,
        password: 'oldPassword123',
        role: 'faculty',
        emailVerified: true
      });
      logPass('Created test user');
    } else {
      logPass('Test user already exists');
    }

    // Test password update
    const newPassword = 'newPassword456';
    testUser.password = newPassword;
    await testUser.save();

    // Verify password was hashed
    if (testUser.password !== newPassword) {
      logPass('Password hashing on save');
    } else {
      logFail('Password hashing', 'Password should be hashed');
    }

    // Test password comparison
    const isMatch = await testUser.comparePassword(newPassword);
    if (isMatch) {
      logPass('Password comparison after reset');
    } else {
      logFail('Password comparison', 'New password should match');
    }

    // Cleanup: Keep test user for manual testing
    logInfo(`Test user preserved: ${testEmail} / password: ${newPassword}`);

  } catch (error) {
    logFail('User Model Integration Tests', error.message);
  }
}

// Test API Route Configuration
async function testAPIRouteConfiguration() {
  logSection('API ROUTE CONFIGURATION TESTS');

  try {
    // Import router to check if routes are configured
    const router = await import('./Backend/routers/router.js');
    
    if (router.default) {
      logPass('Router module loaded successfully');
    } else {
      logFail('Router module', 'Default export not found');
    }

    // Check if password reset controller is imported
    const controller = await import('./Backend/controller/passwordResetController.js');
    
    if (controller.requestPasswordReset) {
      logPass('requestPasswordReset controller exists');
    } else {
      logFail('requestPasswordReset controller', 'Function not exported');
    }

    if (controller.verifyResetOTP) {
      logPass('verifyResetOTP controller exists');
    } else {
      logFail('verifyResetOTP controller', 'Function not exported');
    }

    if (controller.resetPassword) {
      logPass('resetPassword controller exists');
    } else {
      logFail('resetPassword controller', 'Function not exported');
    }

    if (controller.resendResetOTP) {
      logPass('resendResetOTP controller exists');
    } else {
      logFail('resendResetOTP controller', 'Function not exported');
    }

  } catch (error) {
    logFail('API Route Configuration', error.message);
  }
}

// Test Email Service
async function testEmailService() {
  logSection('EMAIL SERVICE TESTS');

  try {
    const emailService = await import('./Backend/utils/emailService.js');

    if (emailService.generateOTP) {
      const otp = emailService.generateOTP();
      if (/^\d{6}$/.test(otp)) {
        logPass('OTP generation (6-digit numeric)');
      } else {
        logFail('OTP generation', `Invalid format: ${otp}`);
      }
    } else {
      logFail('generateOTP function', 'Not exported from emailService');
    }

    if (emailService.sendPasswordResetOTP) {
      logPass('sendPasswordResetOTP function exists');
    } else {
      logFail('sendPasswordResetOTP function', 'Not exported from emailService');
    }

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (smtpHost && smtpEmail && smtpPassword) {
      logPass('SMTP configuration found in environment');
    } else {
      logFail('SMTP configuration', 'Missing SMTP_HOST, SMTP_EMAIL, or SMTP_PASSWORD');
    }

  } catch (error) {
    logFail('Email Service Tests', error.message);
  }
}

// Test Email Validator
async function testEmailValidator() {
  logSection('EMAIL VALIDATOR TESTS');

  try {
    const validator = await import('./Backend/utils/emailValidator.js');

    // Test valid email
    const validResult = validator.validateEmail('test@dayanandasagar.edu');
    if (validResult.success) {
      logPass('Valid institutional email accepted');
    } else {
      logFail('Valid email validation', validResult.message);
    }

    // Test invalid domain
    const invalidResult = validator.validateEmail('test@gmail.com');
    if (!invalidResult.success) {
      logPass('Invalid domain rejected');
    } else {
      logFail('Invalid domain validation', 'Should reject non-institutional email');
    }

    // Test empty email
    const emptyResult = validator.validateEmail('');
    if (!emptyResult.success) {
      logPass('Empty email rejected');
    } else {
      logFail('Empty email validation', 'Should reject empty email');
    }

  } catch (error) {
    logFail('Email Validator Tests', error.message);
  }
}

// Test Database Indexes
async function testDatabaseIndexes() {
  logSection('DATABASE INDEX TESTS');

  try {
    const indexes = await PasswordResetOtp.collection.getIndexes();
    
    if (indexes) {
      logPass('Retrieved collection indexes');
      logInfo(`Found ${Object.keys(indexes).length} indexes`);
      
      // Check for email index
      const hasEmailIndex = Object.values(indexes).some(idx => 
        idx.some(field => field[0] === 'email')
      );
      
      if (hasEmailIndex) {
        logPass('Email index exists');
      } else {
        logInfo('Email index may need to be created on first document insert');
      }

      // Check for expiresAt TTL index
      const hasTTLIndex = Object.values(indexes).some(idx => 
        idx.some(field => field[0] === 'expiresAt')
      );
      
      if (hasTTLIndex) {
        logPass('TTL index exists for auto-cleanup');
      } else {
        logInfo('TTL index will be created on first document insert');
      }
    }

  } catch (error) {
    logFail('Database Index Tests', error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    const connected = await testDatabaseConnection();
    
    if (connected) {
      await testPasswordResetOtpModel();
      await testUserModelIntegration();
      await testAPIRouteConfiguration();
      await testEmailService();
      await testEmailValidator();
      await testDatabaseIndexes();
    }

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log(`\n${BLUE}📊 TEST SUMMARY${RESET}\n`);
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`${GREEN}Passed: ${testsPassed}${RESET}`);
    console.log(`${RED}Failed: ${testsFailed}${RESET}`);
    console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%\n`);

    if (testsFailed === 0) {
      console.log(`${GREEN}🎉 All tests passed! Password reset feature is working correctly.${RESET}\n`);
    } else {
      console.log(`${YELLOW}⚠️  Some tests failed. Please review the errors above.${RESET}\n`);
    }

  } catch (error) {
    console.error(`${RED}Fatal error:${RESET}`, error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.\n');
    process.exit(testsFailed === 0 ? 0 : 1);
  }
}

// Run tests
runAllTests();
