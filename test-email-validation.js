/**
 * Email Domain Validation Test Script
 * Tests the backend email validation for @dayanandasagar.edu restriction
 */

import { validateEmail, isValidInstitutionalEmail, getInvalidDomainMessage } from './Backend/utils/emailValidator.js';

// Color codes for console output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔬 EMAIL DOMAIN VALIDATION TEST SUITE\n');
console.log('=' .repeat(60));

// Test cases
const testCases = [
  // Valid cases
  { email: 'student@dayanandasagar.edu', expected: true, description: 'Valid student email' },
  { email: 'faculty@dayanandasagar.edu', expected: true, description: 'Valid faculty email' },
  { email: 'admin@dayanandasagar.edu', expected: true, description: 'Valid admin email' },
  { email: 'john.doe@dayanandasagar.edu', expected: true, description: 'Valid email with dot' },
  { email: 'john_doe123@dayanandasagar.edu', expected: true, description: 'Valid email with underscore and numbers' },
  { email: 'STUDENT@DAYANANDASAGAR.EDU', expected: true, description: 'Valid email (uppercase)' },
  { email: '  student@dayanandasagar.edu  ', expected: true, description: 'Valid email with whitespace' },
  
  // Invalid cases - wrong domains
  { email: 'student@gmail.com', expected: false, description: 'Gmail address' },
  { email: 'faculty@yahoo.com', expected: false, description: 'Yahoo address' },
  { email: 'admin@hotmail.com', expected: false, description: 'Hotmail address' },
  { email: 'user@dayanandasagar.com', expected: false, description: 'Wrong TLD (.com instead of .edu)' },
  { email: 'user@dayanandasagar.edu.in', expected: false, description: 'Extra domain part' },
  { email: 'user@dsce.edu.in', expected: false, description: 'Different institution domain' },
  { email: 'user@outlook.com', expected: false, description: 'Outlook address' },
  
  // Invalid cases - format issues
  { email: 'invalid-email', expected: false, description: 'No @ symbol' },
  { email: '@dayanandasagar.edu', expected: false, description: 'No local part' },
  { email: 'user@', expected: false, description: 'No domain' },
  { email: '', expected: false, description: 'Empty string' },
  { email: '   ', expected: false, description: 'Only whitespace' },
  { email: 'user @dayanandasagar.edu', expected: false, description: 'Space in email' },
  { email: 'user@@dayanandasagar.edu', expected: false, description: 'Double @ symbol' },
];

let passed = 0;
let failed = 0;

// Run tests
console.log('\n📋 TEST RESULTS:\n');

testCases.forEach((test, index) => {
  const result = validateEmail(test.email);
  const isValid = result.success;
  const testPassed = isValid === test.expected;
  
  if (testPassed) {
    passed++;
    console.log(`${GREEN}✅ PASS${RESET} - Test ${index + 1}: ${test.description}`);
    console.log(`   Email: "${test.email}"`);
    console.log(`   Expected: ${test.expected ? 'VALID' : 'INVALID'}, Got: ${isValid ? 'VALID' : 'INVALID'}\n`);
  } else {
    failed++;
    console.log(`${RED}❌ FAIL${RESET} - Test ${index + 1}: ${test.description}`);
    console.log(`   Email: "${test.email}"`);
    console.log(`   Expected: ${test.expected ? 'VALID' : 'INVALID'}, Got: ${isValid ? 'VALID' : 'INVALID'}`);
    console.log(`   Message: ${result.message}\n`);
  }
});

// Summary
console.log('=' .repeat(60));
console.log('\n📊 TEST SUMMARY:\n');
console.log(`Total Tests: ${testCases.length}`);
console.log(`${GREEN}Passed: ${passed}${RESET}`);
console.log(`${RED}Failed: ${failed}${RESET}`);
console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(2)}%\n`);

// Test specific functions
console.log('=' .repeat(60));
console.log('\n🔍 SPECIFIC FUNCTION TESTS:\n');

console.log('1. isValidInstitutionalEmail() Tests:');
console.log(`   Valid email: ${isValidInstitutionalEmail('test@dayanandasagar.edu') ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
console.log(`   Invalid email: ${!isValidInstitutionalEmail('test@gmail.com') ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);

console.log('\n2. getInvalidDomainMessage() Test:');
const message = getInvalidDomainMessage();
console.log(`   Message: "${message}"`);
console.log(`   Contains domain: ${message.includes('dayanandasagar.edu') ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);

// Edge cases
console.log('\n3. Edge Case Tests:');
console.log(`   Null input: ${!isValidInstitutionalEmail(null) ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
console.log(`   Undefined input: ${!isValidInstitutionalEmail(undefined) ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
console.log(`   Number input: ${!isValidInstitutionalEmail(123) ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);
console.log(`   Object input: ${!isValidInstitutionalEmail({}) ? GREEN + '✅ PASS' : RED + '❌ FAIL'}${RESET}`);

console.log('\n' + '=' .repeat(60));

// Exit with appropriate code
if (failed > 0) {
  console.log(`\n${RED}⚠️  Some tests failed! Please review the validation logic.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}🎉 All tests passed! Email validation is working correctly.${RESET}\n`);
  process.exit(0);
}
