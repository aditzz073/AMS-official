/**
 * @file Integration tests for signup with employee verification
 * @description Tests the complete signup flow including employee verification
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../model/user.js';
import EmailVerificationOtp from '../model/emailVerificationOtp.js';
import { EmployeeService } from '../services/employeeService.js';
import { setEmployeeService } from '../controller/authController.js';
import {
  EmployeeNotFoundError,
  EmployeeAlreadyLinkedError,
} from '../utils/errors/employeeErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('Signup Integration Tests', () => {
  let employeeService;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/test_employee_verification';
    await mongoose.connect(mongoUri);

    // Initialize employee service
    employeeService = new EmployeeService({
      csvDirectory: FIXTURES_DIR,
      enableFileWatch: false,
      logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
    });

    await employeeService.initialize();
    setEmployeeService(employeeService);
  });

  afterAll(async () => {
    await employeeService.shutdown();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await EmailVerificationOtp.deleteMany({});
  });

  describe('Employee Verification During Signup', () => {
    it('should successfully create user with valid employee email', async () => {
      const email = 'john.doe@dayanandasagar.edu';
      
      // Verify employee
      const verificationResult = await employeeService.verifyEmployeeEmail(email);
      
      expect(verificationResult.success).toBe(true);
      expect(verificationResult.employee).not.toBeNull();
      
      // Create user with employee data
      const user = await User.create({
        email,
        password: 'password123',
        role: 'faculty',
        emailVerified: true,
        staffId: verificationResult.employee.staffId,
        employeeDetails: {
          staffFullName: verificationResult.employee.staffFullName,
          staffShortName: verificationResult.employee.staffShortName,
          mobile: verificationResult.employee.mobile,
          staffCode: verificationResult.employee.staffCode,
          emailPrivate: verificationResult.employee.emailPrivate,
          instituteJoiningDate: verificationResult.employee.instituteJoiningDate,
          currentDesignationName: verificationResult.employee.currentDesignationName,
          departmentCode: verificationResult.employee.departmentCode,
          facultyName: verificationResult.employee.facultyName,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.staffId).toBe('TEST001');
      expect(user.employeeDetails.staffFullName).toBe('Dr. John Doe');
    });

    it('should reject signup with non-existent employee email', async () => {
      const email = 'nonexistent@dayanandasagar.edu';
      
      await expect(
        employeeService.verifyEmployeeEmail(email)
      ).rejects.toThrow(EmployeeNotFoundError);
    });

    it('should prevent duplicate staff ID linking', async () => {
      const email = 'jane.smith@dayanandasagar.edu';
      
      // First user
      const verificationResult = await employeeService.verifyEmployeeEmail(email);
      
      const user1 = await User.create({
        email,
        password: 'password123',
        role: 'faculty',
        emailVerified: true,
        staffId: verificationResult.employee.staffId,
      });

      expect(user1.staffId).toBe('TEST002');

      // Try to create another user with same staffId
      await expect(
        User.create({
          email: 'different@example.com',
          password: 'password456',
          role: 'faculty',
          staffId: 'TEST002', // Same staff ID
        })
      ).rejects.toThrow();
    });

    it('should detect if employee is already linked', async () => {
      const email = 'bob.wilson@dayanandasagar.edu';
      
      const verificationResult = await employeeService.verifyEmployeeEmail(email);
      const staffId = verificationResult.employee.staffId;

      // Create first user
      await User.create({
        email,
        password: 'password123',
        role: 'faculty',
        staffId,
      });

      // Check if already linked
      const linkedUser = await User.findOne({ staffId });
      expect(linkedUser).not.toBeNull();
      
      if (linkedUser) {
        const error = new EmployeeAlreadyLinkedError(staffId);
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe('EMPLOYEE_ALREADY_LINKED');
      }
    });

    it('should handle case-insensitive email verification', async () => {
      const email = 'ALICE.BROWN@dayanandasagar.edu'; // Uppercase
      
      const verificationResult = await employeeService.verifyEmployeeEmail(email);
      
      expect(verificationResult.success).toBe(true);
      expect(verificationResult.employee.staffId).toBe('TEST004');
    });

    it('should store all employee details correctly', async () => {
      const email = 'john.doe@dayanandasagar.edu';
      
      const verificationResult = await employeeService.verifyEmployeeEmail(email);
      const employee = verificationResult.employee;

      const user = await User.create({
        email,
        password: 'password123',
        role: 'faculty',
        staffId: employee.staffId,
        employeeDetails: {
          staffFullName: employee.staffFullName,
          staffShortName: employee.staffShortName,
          mobile: employee.mobile,
          staffCode: employee.staffCode,
          emailPrivate: employee.emailPrivate,
          instituteJoiningDate: employee.instituteJoiningDate,
          currentDesignationName: employee.currentDesignationName,
          departmentCode: employee.departmentCode,
          facultyName: employee.facultyName,
          sourceFile: employee._sourceFile,
        },
      });

      const savedUser = await User.findById(user._id);
      
      expect(savedUser.employeeDetails.staffFullName).toBe('Dr. John Doe');
      expect(savedUser.employeeDetails.departmentCode).toBe('CS');
      expect(savedUser.employeeDetails.mobile).toBe('9876543210');
      expect(savedUser.employeeDetails.emailPrivate).toBe('john.personal@gmail.com');
    });
  });

  describe('User Model Validation', () => {
    it('should enforce unique staffId constraint', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        password: 'password123',
        role: 'faculty',
        staffId: 'UNIQUE001',
      });

      expect(user1.staffId).toBe('UNIQUE001');

      // Try to create another user with same staffId
      await expect(
        User.create({
          email: 'user2@example.com',
          password: 'password456',
          role: 'faculty',
          staffId: 'UNIQUE001',
        })
      ).rejects.toThrow();
    });

    it('should allow multiple users without staffId (sparse index)', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        password: 'password123',
        role: 'external',
        // No staffId
      });

      const user2 = await User.create({
        email: 'user2@example.com',
        password: 'password456',
        role: 'external',
        // No staffId
      });

      expect(user1.staffId).toBeUndefined();
      expect(user2.staffId).toBeUndefined();
    });

    it('should store employee details in nested object', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'faculty',
        staffId: 'TEST999',
        employeeDetails: {
          staffFullName: 'Test Employee',
          departmentCode: 'CS',
          facultyName: 'Engineering',
        },
      });

      const savedUser = await User.findById(user._id);
      
      expect(savedUser.employeeDetails).toBeDefined();
      expect(savedUser.employeeDetails.staffFullName).toBe('Test Employee');
      expect(savedUser.employeeDetails.departmentCode).toBe('CS');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create test users
      await User.create({
        email: 'john.doe@dayanandasagar.edu',
        password: 'password123',
        role: 'faculty',
        staffId: 'TEST001',
        employeeDetails: {
          staffFullName: 'Dr. John Doe',
          departmentCode: 'CS',
        },
      });

      await User.create({
        email: 'jane.smith@dayanandasagar.edu',
        password: 'password456',
        role: 'faculty',
        staffId: 'TEST002',
        employeeDetails: {
          staffFullName: 'Dr. Jane Smith',
          departmentCode: 'CS',
        },
      });
    });

    it('should find user by staffId', async () => {
      const user = await User.findOne({ staffId: 'TEST001' });
      
      expect(user).not.toBeNull();
      expect(user.email).toBe('john.doe@dayanandasagar.edu');
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'jane.smith@dayanandasagar.edu' });
      
      expect(user).not.toBeNull();
      expect(user.staffId).toBe('TEST002');
    });

    it('should query by department code', async () => {
      const users = await User.find({ 'employeeDetails.departmentCode': 'CS' });
      
      expect(users.length).toBeGreaterThanOrEqual(2);
    });

    it('should check if staffId is already linked', async () => {
      const existingUser = await User.findOne({ staffId: 'TEST001' });
      
      expect(existingUser).not.toBeNull();
      
      // This simulates the check in signup flow
      if (existingUser) {
        const error = new EmployeeAlreadyLinkedError('TEST001');
        expect(error).toBeInstanceOf(EmployeeAlreadyLinkedError);
      }
    });
  });
});
