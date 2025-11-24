#!/usr/bin/env node

/**
 * @file Validation script for employee verification system
 * @description Tests the system with actual CSV files without needing MongoDB
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createEmployeeService } from '../services/employeeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvDirectory = path.join(__dirname, '..', 'Faculty data');

console.log('\n🔍 Employee Verification System - Validation Report\n');
console.log('='.repeat(60));

async function validateSystem() {
  try {
    // Initialize service
    console.log('\n1️⃣  Initializing Employee Service...');
    const employeeService = createEmployeeService({
      csvDirectory,
      enableFileWatch: false,
      streamingMode: false,
      logger: {
        info: (msg) => console.log('   ℹ️ ', typeof msg === 'string' ? msg : msg.msg || JSON.stringify(msg)),
        warn: (msg) => console.log('   ⚠️ ', typeof msg === 'string' ? msg : msg.msg || JSON.stringify(msg)),
        error: (msg) => console.log('   ❌', typeof msg === 'string' ? msg : msg.msg || JSON.stringify(msg)),
        debug: () => {},
      },
    });

    await employeeService.initialize();

    // Get statistics
    const stats = employeeService.getCacheStats();
    console.log('\n2️⃣  Cache Statistics:');
    console.log(`   ✅ Initialized: ${stats.isInitialized}`);
    console.log(`   📊 Employee Count: ${stats.employeeCount}`);
    console.log(`   📁 CSV Directory: ${stats.config.csvDirectory}`);
    console.log(`   🕐 Last Load Time: ${stats.lastLoadTime}`);

    // Test sample emails from each department
    console.log('\n3️⃣  Testing Email Verification:\n');

    const testEmails = [
      { email: 'aswath.ar@dayanandasagar.edu', dept: 'EC', expected: true },
      { email: 'anupama-aiml@dayanandasagar.edu', dept: 'AI & ML', expected: true },
      { email: 'bindubhargavi-ise@dayanandasagar.edu', dept: 'IS', expected: true },
      { email: 'nonexistent@dayanandasagar.edu', dept: 'N/A', expected: false },
      { email: 'ASWATH.AR@DAYANANDASAGAR.EDU', dept: 'EC', expected: true }, // Case insensitive test
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const test of testEmails) {
      try {
        const result = await employeeService.verifyEmployeeEmail(test.email);
        
        if (result.success && test.expected) {
          console.log(`   ✅ ${test.email.padEnd(45)} → Found: ${result.employee.staffFullName}`);
          passedTests++;
        } else if (!result.success && !test.expected) {
          console.log(`   ✅ ${test.email.padEnd(45)} → Correctly not found`);
          passedTests++;
        } else {
          console.log(`   ❌ ${test.email.padEnd(45)} → Unexpected result`);
          failedTests++;
        }
      } catch (error) {
        if (!test.expected && (error.code === 'EMPLOYEE_NOT_FOUND')) {
          console.log(`   ✅ ${test.email.padEnd(45)} → Correctly rejected`);
          passedTests++;
        } else {
          console.log(`   ❌ ${test.email.padEnd(45)} → Error: ${error.message}`);
          failedTests++;
        }
      }
    }

    // Test staff ID lookup
    console.log('\n4️⃣  Testing Staff ID Lookup:\n');

    const testStaffIds = ['1500', '7424', '1984'];
    
    for (const staffId of testStaffIds) {
      const employee = await employeeService.getEmployeeByStaffId(staffId);
      if (employee) {
        console.log(`   ✅ Staff ID ${staffId}: ${employee.staffFullName} (${employee.departmentCode})`);
      } else {
        console.log(`   ❌ Staff ID ${staffId}: Not found`);
      }
    }

    // Department distribution
    console.log('\n5️⃣  Department Distribution:\n');
    
    const employees = await employeeService.loadAllEmployeeCSVs();
    const deptCounts = {};
    
    employees.forEach(emp => {
      const dept = emp.departmentCode || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([dept, count]) => {
        const bar = '█'.repeat(Math.ceil(count / 2));
        console.log(`   ${dept.padEnd(10)}: ${count.toString().padStart(3)} ${bar}`);
      });

    // Email domain analysis
    console.log('\n6️⃣  Email Domain Analysis:\n');
    
    const domains = {};
    employees.forEach(emp => {
      if (emp.emailInstitute) {
        const domain = emp.emailInstitute.split('@')[1]?.toLowerCase() || 'invalid';
        domains[domain] = (domains[domain] || 0) + 1;
      }
    });

    Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .forEach(([domain, count]) => {
        console.log(`   ${domain.padEnd(30)}: ${count}`);
      });

    // Data quality checks
    console.log('\n7️⃣  Data Quality Checks:\n');
    
    let missingStaffId = 0;
    let missingEmail = 0;
    let missingName = 0;
    let validRecords = 0;

    employees.forEach(emp => {
      if (!emp.staffId) missingStaffId++;
      if (!emp.emailInstitute) missingEmail++;
      if (!emp.staffFullName) missingName++;
      if (emp.staffId && emp.emailInstitute && emp.staffFullName) validRecords++;
    });

    console.log(`   ✅ Valid Records: ${validRecords}/${employees.length}`);
    if (missingStaffId > 0) console.log(`   ⚠️  Missing Staff ID: ${missingStaffId}`);
    if (missingEmail > 0) console.log(`   ⚠️  Missing Email: ${missingEmail}`);
    if (missingName > 0) console.log(`   ⚠️  Missing Name: ${missingName}`);

    // Performance test
    console.log('\n8️⃣  Performance Test:\n');
    
    const iterations = 1000;
    const testEmail = 'aswath.ar@dayanandasagar.edu';
    
    const startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await employeeService.verifyEmployeeEmail(testEmail);
    }
    const endTime = Date.now();
    
    const avgTime = (endTime - startTime) / iterations;
    console.log(`   ⚡ ${iterations} verifications in ${endTime - startTime}ms`);
    console.log(`   📈 Average: ${avgTime.toFixed(2)}ms per verification`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Summary:\n');
    console.log(`   Total Employees Loaded: ${stats.employeeCount}`);
    console.log(`   Verification Tests: ${passedTests} passed, ${failedTests} failed`);
    console.log(`   Data Quality: ${((validRecords / employees.length) * 100).toFixed(1)}% valid`);
    console.log(`   Performance: ${avgTime < 1 ? '✅ Excellent' : avgTime < 5 ? '✅ Good' : '⚠️ Needs optimization'} (${avgTime.toFixed(2)}ms avg)`);
    
    if (failedTests === 0 && validRecords === employees.length) {
      console.log('\n   🎉 All checks passed! System is production-ready.\n');
    } else {
      console.log('\n   ⚠️  Some issues detected. Please review above.\n');
    }

    // Shutdown
    await employeeService.shutdown();

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

validateSystem().catch(console.error);
