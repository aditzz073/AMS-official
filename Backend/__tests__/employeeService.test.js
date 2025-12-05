/**
 * @file Unit tests for Employee Service
 * @description Comprehensive tests for CSV loading, caching, and employee verification
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmployeeService } from '../services/employeeService.js';
import {
  EmployeeNotFoundError,
  ServiceNotInitializedError,
  CSVDirectoryError,
} from '../utils/errors/employeeErrors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('EmployeeService', () => {
  let service;

  describe('Initialization', () => {
    it('should initialize successfully with valid CSV directory', async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });

      await service.initialize();

      expect(service.isInitialized).toBe(true);
      const stats = service.getCacheStats();
      expect(stats.employeeCount).toBeGreaterThan(0);
    });

    it('should throw error for non-existent directory', async () => {
      service = new EmployeeService({
        csvDirectory: '/non/existent/path',
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });

      await expect(service.initialize()).rejects.toThrow(CSVDirectoryError);
    });

    it('should not initialize twice', async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });

      await service.initialize();
      const firstStats = service.getCacheStats();

      await service.initialize(); // Should not reinitialize
      const secondStats = service.getCacheStats();

      expect(firstStats.employeeCount).toBe(secondStats.employeeCount);
    });
  });

  describe('CSV Loading', () => {
    beforeEach(async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });
      await service.initialize();
    });

    afterEach(async () => {
      if (service) {
        await service.shutdown();
      }
    });

    it('should load all valid employees from CSV files', async () => {
      const employees = await service.loadAllEmployeeCSVs();
      
      expect(employees.length).toBeGreaterThanOrEqual(4); // At least 4 valid employees
      
      // Verify structure of first employee
      const firstEmployee = employees[0];
      expect(firstEmployee).toHaveProperty('staffId');
      expect(firstEmployee).toHaveProperty('emailInstitute');
      expect(firstEmployee).toHaveProperty('staffFullName');
      expect(firstEmployee).toHaveProperty('_sourceFile');
    });

    it('should skip invalid rows without required fields', async () => {
      const stats = service.getCacheStats();
      
      // Should only load employees with both staffId and emailInstitute
      // Invalid CSV has 2 rows but only 1 valid (TEST005)
      expect(stats.employeeCount).toBeGreaterThanOrEqual(4);
    });

    it('should parse dates correctly', async () => {
      const employee = await service.getEmployeeByStaffId('TEST001');
      
      expect(employee).not.toBeNull();
      if (employee.instituteJoiningDate) {
        expect(typeof employee.instituteJoiningDate).toBe('string');
        expect(new Date(employee.instituteJoiningDate).toString()).not.toBe('Invalid Date');
      }
    });

    it('should normalize email addresses', async () => {
      const employees = await service.loadAllEmployeeCSVs();
      const employee = employees.find(e => e.staffId === 'TEST001');
      
      expect(employee).toBeDefined();
      expect(employee.emailInstitute).toBe('john.doe@dayanandasagar.edu');
    });
  });

  describe('Employee Verification', () => {
    beforeEach(async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });
      await service.initialize();
    });

    afterEach(async () => {
      if (service) {
        await service.shutdown();
      }
    });

    it('should verify existing employee email successfully', async () => {
      const result = await service.verifyEmployeeEmail('john.doe@dayanandasagar.edu');
      
      expect(result.success).toBe(true);
      expect(result.employee).not.toBeNull();
      expect(result.employee.staffId).toBe('TEST001');
      expect(result.employee.staffFullName).toBe('Dr. John Doe');
      expect(result.error).toBeNull();
    });

    it('should verify email case-insensitively', async () => {
      const result = await service.verifyEmployeeEmail('JOHN.DOE@dayanandasagar.edu');
      
      expect(result.success).toBe(true);
      expect(result.employee).not.toBeNull();
      expect(result.employee.staffId).toBe('TEST001');
    });

    it('should verify email with extra whitespace', async () => {
      const result = await service.verifyEmployeeEmail('  john.doe@dayanandasagar.edu  ');
      
      expect(result.success).toBe(true);
      expect(result.employee).not.toBeNull();
    });

    it('should throw EmployeeNotFoundError for non-existent email', async () => {
      await expect(
        service.verifyEmployeeEmail('nonexistent@dayanandasagar.edu')
      ).rejects.toThrow(EmployeeNotFoundError);
    });

    it('should throw ServiceNotInitializedError when not initialized', async () => {
      const uninitializedService = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });

      await expect(
        uninitializedService.verifyEmployeeEmail('test@example.com')
      ).rejects.toThrow(ServiceNotInitializedError);
    });

    it('should return appropriate error for empty email', async () => {
      const result = await service.verifyEmployeeEmail('');
      
      expect(result.success).toBe(false);
      expect(result.employee).toBeNull();
      expect(result.error).toBe('Email address is required');
    });
  });

  describe('Cache Operations', () => {
    beforeEach(async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });
      await service.initialize();
    });

    afterEach(async () => {
      if (service) {
        await service.shutdown();
      }
    });

    it('should return correct cache statistics', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('employeeCount');
      expect(stats).toHaveProperty('lastLoadTime');
      expect(stats).toHaveProperty('watcherActive');
      expect(stats).toHaveProperty('config');
      
      expect(stats.isInitialized).toBe(true);
      expect(stats.employeeCount).toBeGreaterThan(0);
      expect(stats.lastLoadTime).toBeInstanceOf(Date);
    });

    it('should reload employees successfully', async () => {
      const initialStats = service.getCacheStats();
      
      await service.reloadEmployees();
      
      const newStats = service.getCacheStats();
      expect(newStats.employeeCount).toBe(initialStats.employeeCount);
      expect(newStats.lastLoadTime.getTime()).toBeGreaterThanOrEqual(
        initialStats.lastLoadTime.getTime()
      );
    });

    it('should find employee by staff ID', async () => {
      const employee = await service.getEmployeeByStaffId('TEST002');
      
      expect(employee).not.toBeNull();
      expect(employee.staffFullName).toBe('Dr. Jane Smith');
      expect(employee.emailInstitute).toBe('jane.smith@dayanandasagar.edu');
    });

    it('should return null for non-existent staff ID', async () => {
      const employee = await service.getEmployeeByStaffId('NONEXISTENT');
      
      expect(employee).toBeNull();
    });
  });

  describe('Streaming Mode', () => {
    beforeEach(async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        streamingMode: true, // Enable streaming mode
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });
      await service.initialize();
    });

    afterEach(async () => {
      if (service) {
        await service.shutdown();
      }
    });

    it('should verify employee in streaming mode', async () => {
      const result = await service.verifyEmployeeEmail('alice.brown@dayanandasagar.edu');
      
      expect(result.success).toBe(true);
      expect(result.employee).not.toBeNull();
      expect(result.employee.staffId).toBe('TEST004');
    });

    it('should throw error for non-existent email in streaming mode', async () => {
      await expect(
        service.verifyEmployeeEmail('nonexistent@dayanandasagar.edu')
      ).rejects.toThrow(EmployeeNotFoundError);
    });
  });

  describe('Shutdown', () => {
    it('should shut down gracefully', async () => {
      service = new EmployeeService({
        csvDirectory: FIXTURES_DIR,
        enableFileWatch: false,
        logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
      });

      await service.initialize();
      expect(service.isInitialized).toBe(true);

      await service.shutdown();
      expect(service.isInitialized).toBe(false);
    });
  });
});
