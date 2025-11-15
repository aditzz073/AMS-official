/**
 * Password Reset API Integration Test
 * Tests the complete password reset flow via HTTP requests
 * 
 * Run: node test-password-reset-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:9000/app';
const API_HOST = 'localhost';
const API_PORT = 9000;

// HTTP request helper
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let testsPassed = 0;
let testsFailed = 0;
let generatedOTP = null;

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

// Test 1: Request OTP for unregistered email
async function testUnregisteredEmail() {
  logSection('TEST 1: Request OTP with Unregistered Email');
  
  try {
    const response = await makeRequest('POST', '/app/auth/forgot-password', {
      email: 'notregistered@dayanandasagar.edu'
    });
    
    if (response.status === 404) {
      logPass('Unregistered email correctly rejected with 404');
      logInfo(`Message: ${response.data.message}`);
    } else {
      logFail('Unregistered email should be rejected', `Got status ${response.status}`);
    }
  } catch (error) {
    logFail('Unregistered email test', error.message);
  }
}

// Test 2: Request OTP with invalid domain
async function testInvalidDomain() {
  logSection('TEST 2: Request OTP with Invalid Email Domain');
  
  try {
    const response = await makeRequest('POST', '/app/auth/forgot-password', {
      email: 'test@gmail.com'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 400) {
      logPass('Invalid domain correctly rejected with 400');
      logInfo(`Message: ${response.data.message}`);
    } else {
      logFail('Invalid domain should be rejected', `Got status ${response.status}: ${response.data.message || 'No message'}`);
    }
  } catch (error) {
    logFail('Invalid domain test', error.message);
  }
}

// Test 3: Request OTP for valid registered email
async function testValidEmailRequest() {
  logSection('TEST 3: Request OTP for Valid Email');
  
  try {
    const testEmail = 'passwordresettest@dayanandasagar.edu';
    
    const response = await makeRequest('POST', '/app/auth/forgot-password', {
      email: testEmail
    });
    
    if (response.status === 200 && response.data.success) {
      logPass('OTP request successful for valid email');
      logInfo(`Message: ${response.data.message}`);
      logInfo(`Expires in: ${response.data.expiresIn} seconds`);
      logInfo('⚠️  Check email for OTP or check backend logs');
      return testEmail;
    } else if (response.status === 404) {
      logInfo(`Test user doesn't exist yet: ${testEmail}`);
      logInfo('Creating test user first...');
      
      // Try to create test user
      const signupResponse = await makeRequest('POST', '/app/signup', {
        name: 'Password Reset Test User',
        email: testEmail,
        password: 'testPassword123',
        role: 'teacher'
      });
      
      if (signupResponse.status === 201) {
        logInfo('Test user created successfully');
        
        // Verify OTP for signup
        logInfo('⚠️  Check email for signup OTP to complete account creation');
        logInfo('Then re-run this test script');
        return null;
      } else {
        logFail('Failed to create test user', signupResponse.data.message);
        return null;
      }
    } else {
      logFail('Valid email OTP request', `Status ${response.status}`);
      return null;
    }
  } catch (error) {
    logFail('Valid email OTP request', error.message);
    return null;
  }
}

// Test 4: Verify OTP with wrong code
async function testWrongOTP(email) {
  logSection('TEST 4: Verify OTP with Wrong Code');
  
  if (!email) {
    logInfo('Skipping - no valid email from previous test');
    return;
  }
  
  try {
    const response = await makeRequest('POST', '/app/auth/verify-reset-otp', {
      email: email,
      otp: '000000'
    });
    
    if (response.status === 400) {
      logPass('Wrong OTP correctly rejected with 400');
      logInfo(`Message: ${response.data.message}`);
    } else {
      logFail('Wrong OTP should be rejected', `Got status ${response.status}`);
    }
  } catch (error) {
    logFail('Wrong OTP test', error.message);
  }
}

// Test 5: Verify OTP with correct code (manual input required)
async function testCorrectOTP(email, otp) {
  logSection('TEST 5: Verify OTP with Correct Code');
  
  if (!email || !otp) {
    logInfo('Skipping - requires manual OTP input');
    return false;
  }
  
  try {
    const response = await makeRequest('POST', '/app/auth/verify-reset-otp', {
      email: email,
      otp: otp
    });
    
    if (response.status === 200 && response.data.success) {
      logPass('OTP verification successful');
      logInfo(`Message: ${response.data.message}`);
      return true;
    } else {
      logFail('OTP verification', `Status ${response.status}`);
      return false;
    }
  } catch (error) {
    logFail('OTP verification', error.message);
    return false;
  }
}

// Test 6: Reset password with weak password
async function testWeakPassword(email, otp) {
  logSection('TEST 6: Reset Password with Weak Password');
  
  if (!email || !otp) {
    logInfo('Skipping - requires email and OTP from previous tests');
    return;
  }
  
  try {
    const response = await makeRequest('POST', '/app/auth/reset-password', {
      email: email,
      otp: otp,
      newPassword: 'abc'
    });
    
    if (response.status === 400) {
      logPass('Weak password correctly rejected with 400');
      logInfo(`Message: ${response.data.message}`);
    } else {
      logFail('Weak password should be rejected', `Got status ${response.status}`);
    }
  } catch (error) {
    logFail('Weak password test', error.message);
  }
}

// Test 7: Reset password with valid password
async function testValidPasswordReset(email, otp) {
  logSection('TEST 7: Reset Password with Valid Password');
  
  if (!email || !otp) {
    logInfo('Skipping - requires email and OTP from previous tests');
    return;
  }
  
  try {
    const newPassword = 'newSecurePassword123';
    const response = await makeRequest('POST', '/app/auth/reset-password', {
      email: email,
      otp: otp,
      newPassword: newPassword
    });
    
    if (response.status === 200 && response.data.success) {
      logPass('Password reset successful');
      logInfo(`Message: ${response.data.message}`);
      logInfo(`Test user credentials: ${email} / ${newPassword}`);
      return true;
    } else {
      logFail('Password reset', `Status ${response.status}`);
      return false;
    }
  } catch (error) {
    logFail('Password reset', error.message);
    return false;
  }
}

// Test 8: Verify login with new password
async function testLoginWithNewPassword(email) {
  logSection('TEST 8: Login with New Password');
  
  if (!email) {
    logInfo('Skipping - no email from previous tests');
    return;
  }
  
  try {
    const response = await makeRequest('POST', '/app/login', {
      email: email,
      password: 'newSecurePassword123'
    });
    
    if (response.status === 200 && response.data.success && response.data.token) {
      logPass('Login successful with new password');
      logInfo('Password reset flow completed successfully!');
    } else {
      logFail('Login with new password', `Status ${response.status}`);
    }
  } catch (error) {
    logFail('Login with new password', error.message);
  }
}

// Test 9: Rate limiting
async function testRateLimiting(email) {
  logSection('TEST 9: Rate Limiting (3 requests per hour)');
  
  if (!email) {
    logInfo('Skipping - no email from previous tests');
    return;
  }
  
  try {
    logInfo('Sending 3 consecutive OTP requests...');
    
    // Send 3 requests
    for (let i = 1; i <= 3; i++) {
      try {
        await makeRequest('POST', '/app/auth/forgot-password', { email });
        logInfo(`Request ${i}/3 sent successfully`);
      } catch (error) {
        // Ignore errors for already sent OTPs
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Try 4th request - should be blocked
    const response = await makeRequest('POST', '/app/auth/forgot-password', { email });
    
    if (response.status === 429) {
      logPass('Rate limiting correctly enforced after 3 requests');
      logInfo(`Message: ${response.data.message}`);
    } else {
      logFail('Rate limiting', `Expected 429 status, got ${response.status}`);
    }
  } catch (error) {
    logFail('Rate limiting test', error.message);
  }
}

// Check if backend is running
async function checkBackendStatus() {
  logSection('BACKEND STATUS CHECK');
  
  try {
    const response = await makeRequest('GET', '/');
    logPass('Backend server is running');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logFail('Backend connection', 'Server is not running');
      console.log(`\n${RED}❌ Please start the backend server first:${RESET}`);
      console.log(`   cd Backend && npm start\n`);
      return false;
    } else {
      logInfo('Backend might be running (connection attempt made)');
      return true;
    }
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${BLUE}🔐 PASSWORD RESET API INTEGRATION TESTS${RESET}\n`);
  console.log('=' .repeat(70));
  console.log(`\n${YELLOW}⚠️  Prerequisites:${RESET}`);
  console.log('   1. Backend server must be running on http://localhost:9000');
  console.log('   2. Test user should exist: passwordresettest@dayanandasagar.edu');
  console.log('   3. SMTP should be configured for email sending\n');
  
  const backendRunning = await checkBackendStatus();
  
  if (!backendRunning) {
    process.exit(1);
  }
  
  // Run automated tests
  await testUnregisteredEmail();
  await testInvalidDomain();
  const testEmail = await testValidEmailRequest();
  await testWrongOTP(testEmail);
  
  // Manual OTP entry required
  if (testEmail) {
    console.log(`\n${YELLOW}━━━ MANUAL OTP ENTRY REQUIRED ━━━${RESET}\n`);
    console.log(`${BLUE}ℹ️  Check the email sent to: ${testEmail}${RESET}`);
    console.log(`${BLUE}ℹ️  Or check backend console logs for the OTP${RESET}`);
    console.log(`\n${YELLOW}To complete the remaining tests, run:${RESET}`);
    console.log(`   node test-password-reset-api.js ${testEmail} <OTP>\n`);
    console.log(`${YELLOW}Example:${RESET}`);
    console.log(`   node test-password-reset-api.js ${testEmail} 123456\n`);
  }
  
  // Check if OTP was provided as command line argument
  const providedEmail = process.argv[2];
  const providedOTP = process.argv[3];
  
  if (providedEmail && providedOTP) {
    logSection('MANUAL OTP TESTS (with provided OTP)');
    const otpVerified = await testCorrectOTP(providedEmail, providedOTP);
    
    if (otpVerified) {
      await testWeakPassword(providedEmail, providedOTP);
      // Note: This will use the OTP, so we need a fresh one for the next test
      logInfo('Note: Final password reset will consume the OTP');
      
      // Request a new OTP for the final test
      logInfo('Requesting fresh OTP for final password reset test...');
      await makeRequest('POST', '/app/auth/forgot-password', { email: providedEmail });
      
      logInfo('Please check email for new OTP and run:');
      console.log(`   node test-password-reset-api.js complete ${providedEmail} <NEW_OTP>\n`);
    }
  }
  
  // Complete flow test
  if (process.argv[2] === 'complete' && process.argv[3] && process.argv[4]) {
    const email = process.argv[3];
    const otp = process.argv[4];
    
    logSection('COMPLETE PASSWORD RESET FLOW TEST');
    const resetSuccess = await testValidPasswordReset(email, otp);
    
    if (resetSuccess) {
      await testLoginWithNewPassword(email);
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log(`\n${BLUE}📊 TEST SUMMARY${RESET}\n`);
  console.log(`Total Tests Run: ${testsPassed + testsFailed}`);
  console.log(`${GREEN}Passed: ${testsPassed}${RESET}`);
  console.log(`${RED}Failed: ${testsFailed}${RESET}`);
  
  if (testsPassed + testsFailed > 0) {
    console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%\n`);
  }
  
  if (testsFailed === 0 && testsPassed > 0) {
    console.log(`${GREEN}🎉 All executed tests passed!${RESET}\n`);
  } else if (testsPassed > 0) {
    console.log(`${YELLOW}⚠️  Some tests failed or were skipped.${RESET}\n`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${RED}Fatal error:${RESET}`, error);
  process.exit(1);
});
