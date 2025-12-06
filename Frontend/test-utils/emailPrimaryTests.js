/**
 * Testing Utilities for Email-Primary Refactor
 * 
 * This file contains helper functions to test the new email-based system
 */

import axiosInstance from '../src/helper/axiosInstance.js';

// Test configuration
const TEST_USERS = {
  faculty: {
    email: 'faculty.test@dsce.edu.in',
    password: 'Test@123',
    role: 'faculty',
    employeeCode: 'FAC001'
  },
  hod: {
    email: 'hod.test@dsce.edu.in',
    password: 'Test@123',
    role: 'hod'
  },
  external: {
    email: 'external.test@dsce.edu.in',
    password: 'Test@123',
    role: 'external'
  }
};

// Test scenarios
export const testScenarios = {
  
  // Test 1: Faculty Login and Auto-Load
  async testFacultyAutoLoad() {
    console.log('\n🧪 Test 1: Faculty Auto-Load by Email');
    try {
      // Login as faculty
      const loginResponse = await axiosInstance.post('/login', {
        email: TEST_USERS.faculty.email,
        password: TEST_USERS.faculty.password
      });
      
      console.log('✅ Faculty login successful');
      const token = loginResponse.data.token;
      
      // Set token in axios
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to get data by email (should auto-load)
      const dataResponse = await axiosInstance.get(`/getData/${TEST_USERS.faculty.email}`);
      
      if (dataResponse.data.success) {
        console.log('✅ Faculty data auto-loaded by email');
        console.log('📊 Data:', dataResponse.data.data);
      } else {
        console.log('ℹ️  No existing data for faculty (expected for new user)');
      }
      
      return { success: true, message: 'Faculty auto-load test passed' };
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  // Test 2: HOD Search by Email and EmployeeCode
  async testHODSearch() {
    console.log('\n🧪 Test 2: HOD Search by Email and EmployeeCode');
    try {
      // Login as HOD
      const loginResponse = await axiosInstance.post('/login', {
        email: TEST_USERS.hod.email,
        password: TEST_USERS.hod.password
      });
      
      console.log('✅ HOD login successful');
      const token = loginResponse.data.token;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get all employees
      const employeesResponse = await axiosInstance.get('/getEmpCode');
      console.log('✅ Employee list fetched:', employeesResponse.data);
      
      // Try to search by email
      if (employeesResponse.data.employees.length > 0) {
        const firstEmployee = employeesResponse.data.employees[0];
        
        if (firstEmployee.email) {
          const byEmailResponse = await axiosInstance.get(`/getData/${firstEmployee.email}`);
          console.log('✅ Search by email successful:', byEmailResponse.data);
        }
        
        if (firstEmployee.employeeCode) {
          const byCodeResponse = await axiosInstance.get(`/getData/${firstEmployee.employeeCode}`);
          console.log('✅ Search by employeeCode successful:', byCodeResponse.data);
        }
      }
      
      return { success: true, message: 'HOD search test passed' };
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  // Test 3: Basic Info Update
  async testBasicInfoUpdate() {
    console.log('\n🧪 Test 3: Basic Info Update');
    try {
      // Login as faculty
      const loginResponse = await axiosInstance.post('/login', {
        email: TEST_USERS.faculty.email,
        password: TEST_USERS.faculty.password
      });
      
      const token = loginResponse.data.token;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update basic info
      const updateResponse = await axiosInstance.put('/basicInfo', {
        name: 'Test Faculty',
        employeeCode: TEST_USERS.faculty.employeeCode,
        designation: 'Assistant Professor',
        department: 'Computer Science'
      });
      
      console.log('✅ Basic info updated:', updateResponse.data);
      
      // Fetch to verify
      const getResponse = await axiosInstance.get('/basicInfo');
      console.log('✅ Basic info fetched:', getResponse.data);
      
      return { success: true, message: 'Basic info update test passed' };
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  // Test 4: Evaluation Data Save with Email
  async testEvaluationSave() {
    console.log('\n🧪 Test 4: Evaluation Data Save');
    try {
      // Login as faculty
      const loginResponse = await axiosInstance.post('/login', {
        email: TEST_USERS.faculty.email,
        password: TEST_USERS.faculty.password
      });
      
      const token = loginResponse.data.token;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save evaluation data
      const evaluationData = {
        email: TEST_USERS.faculty.email,
        employeeCode: TEST_USERS.faculty.employeeCode,
        TLP111Self: '5',
        TLP112Self: '4',
        CDL31Self: '5'
      };
      
      const saveResponse = await axiosInstance.post('/addData', evaluationData);
      console.log('✅ Evaluation data saved:', saveResponse.data);
      
      return { success: true, message: 'Evaluation save test passed' };
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  // Test 5: Remarks System
  async testRemarksSystem() {
    console.log('\n🧪 Test 5: Remarks System');
    try {
      // Login as HOD
      const loginResponse = await axiosInstance.post('/login', {
        email: TEST_USERS.hod.email,
        password: TEST_USERS.hod.password
      });
      
      const token = loginResponse.data.token;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update remark by email
      const remarkData = {
        sectionId: 'TLP',
        remark: 'Good performance in teaching'
      };
      
      const updateResponse = await axiosInstance.put(
        `/remarks/${TEST_USERS.faculty.email}`,
        remarkData
      );
      console.log('✅ Remark updated by email:', updateResponse.data);
      
      // Get remarks
      const getResponse = await axiosInstance.get(`/remarks/${TEST_USERS.faculty.email}`);
      console.log('✅ Remarks fetched:', getResponse.data);
      
      return { success: true, message: 'Remarks system test passed' };
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running all tests...\n');
    console.log('='.repeat(60));
    
    const results = [];
    
    // Test 1
    results.push(await this.testFacultyAutoLoad());
    
    // Test 2
    results.push(await this.testHODSearch());
    
    // Test 3
    results.push(await this.testBasicInfoUpdate());
    
    // Test 4
    results.push(await this.testEvaluationSave());
    
    // Test 5
    results.push(await this.testRemarksSystem());
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${(passed / results.length * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
    
    return results;
  }
};

// Manual test functions for browser console
export const manualTests = {
  
  // Test email vs employeeCode identifier detection
  testIdentifierDetection: (identifier) => {
    if (identifier.includes('@')) {
      console.log(`✅ Detected as EMAIL: ${identifier}`);
    } else {
      console.log(`✅ Detected as EMPLOYEE CODE: ${identifier}`);
    }
  },
  
  // Test JWT token payload
  testTokenPayload: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      console.log('📦 Token Payload:');
      console.log('  User ID:', payload.id);
      console.log('  Email:', payload.email);
      console.log('  Role:', payload.role);
      console.log('  Employee Code:', payload.employeeCode);
      console.log('  Expires:', new Date(payload.exp * 1000).toLocaleString());
      
      return payload;
    } catch (error) {
      console.error('❌ Invalid token:', error.message);
      return null;
    }
  },
  
  // Test localStorage state
  testLocalStorage: () => {
    console.log('💾 LocalStorage State:');
    console.log('  Auth State:', JSON.parse(localStorage.getItem('authState') || '{}'));
    console.log('  Form Data:', JSON.parse(localStorage.getItem('formData') || '{}'));
    console.log('  Token:', localStorage.getItem('token') ? '✅ Present' : '❌ Missing');
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAMS = testScenarios;
  window.manualTestsAMS = manualTests;
  console.log('🧪 AMS Testing utilities loaded!');
  console.log('   Run: testAMS.runAllTests() to run all tests');
  console.log('   Run: manualTestsAMS.testLocalStorage() to check state');
}

export default testScenarios;
