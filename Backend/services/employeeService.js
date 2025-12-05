/**
 * @file Employee Service - Handles CSV loading, caching, and employee verification
 * @description Production-ready service for managing employee data from CSV files
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import csv from 'csv-parser';
import chokidar from 'chokidar';
import pino from 'pino';
import {
  EmployeeNotFoundError,
  MultipleEmployeeRecordsError,
  InvalidCSVFormatError,
  CSVDirectoryError,
  ServiceNotInitializedError,
} from '../utils/errors/employeeErrors.js';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * @typedef {import('../types/employee.types.js').Employee} Employee
 * @typedef {import('../types/employee.types.js').EmployeeServiceConfig} EmployeeServiceConfig
 * @typedef {import('../types/employee.types.js').EmployeeVerificationResult} EmployeeVerificationResult
 */

/**
 * Default configuration for the employee service
 */
const DEFAULT_CONFIG = {
  csvDirectory: path.join(process.cwd(), 'Faculty data'),
  enableFileWatch: true,
  cacheTTL: 0, // No expiration by default
  streamingMode: false,
  logger: pino({ level: process.env.LOG_LEVEL || 'info' }),
};

/**
 * Normalize email for case-insensitive comparison
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : '';
};

/**
 * Normalize CSV column headers
 * @param {string} header - Raw header from CSV
 * @returns {string} Normalized header
 */
const normalizeHeader = (header) => {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string from CSV
 * @returns {string|null} ISO date string or null
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
};

/**
 * Validate employee record has required fields
 * @param {Object} record - Raw CSV record
 * @returns {boolean} Whether record is valid
 */
const validateRecord = (record) => {
  return !!(record.emailinstitute && record.staffid);
};

/**
 * Transform raw CSV record to Employee object
 * @param {Object} raw - Raw CSV record
 * @param {string} sourceFile - Source filename
 * @returns {Employee|null} Employee object or null if invalid
 */
const transformRecord = (raw, sourceFile) => {
  if (!validateRecord(raw)) {
    return null;
  }

  return {
    sr: raw.sr || '',
    staffId: raw.staffid || '',
    staffFullName: raw.stafffullname || '',
    staffShortName: raw.staffshortname || '',
    mobile: raw.mobile || '',
    staffCode: raw.staffcode || '',
    emailPrivate: raw.emailprivate || '',
    emailInstitute: raw.emailinstitute || '',
    instituteJoiningDate: parseDate(raw.institutejoiningdate),
    currentDesignationName: raw.currentdesignationname || '',
    departmentCode: raw.departmentcode || '',
    facultyName: raw.facultyname || '',
    _sourceFile: sourceFile,
  };
};

/**
 * EmployeeService - Main service class for managing employee data
 */
export class EmployeeService {
  /**
   * @param {Partial<EmployeeServiceConfig>} config - Service configuration
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = this.config.logger;
    
    /** @type {Map<string, Employee>} */
    this.employeeCache = new Map();
    
    /** @type {Date|null} */
    this.lastLoadTime = null;
    
    /** @type {boolean} */
    this.isInitialized = false;
    
    /** @type {chokidar.FSWatcher|null} */
    this.watcher = null;
    
    /** @type {Promise<void>|null} */
    this.initPromise = null;

    // Synchronization lock for reloading
    this.reloadLock = false;
  }

  /**
   * Initialize the service - load all CSV files
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.warn('Employee service already initialized');
      return;
    }

    if (this.initPromise) {
      this.logger.info('Waiting for ongoing initialization');
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    await this.initPromise;
    this.initPromise = null;
  }

  /**
   * Internal initialization logic
   * @private
   * @returns {Promise<void>}
   */
  async _doInitialize() {
    try {
      this.logger.info({ dir: this.config.csvDirectory }, 'Initializing employee service');

      // Verify directory exists
      try {
        const dirStat = await stat(this.config.csvDirectory);
        if (!dirStat.isDirectory()) {
          throw new CSVDirectoryError(this.config.csvDirectory, 'Path is not a directory');
        }
      } catch (error) {
        throw new CSVDirectoryError(
          this.config.csvDirectory,
          `Directory not accessible: ${error.message}`
        );
      }

      // Load all CSV files
      await this.reloadEmployees();

      // Set up file watcher if enabled
      if (this.config.enableFileWatch) {
        this.setupFileWatcher();
      }

      this.isInitialized = true;
      this.logger.info(
        { employeeCount: this.employeeCache.size },
        'Employee service initialized successfully'
      );
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize employee service');
      throw error;
    }
  }

  /**
   * Load all employee CSV files
   * @returns {Promise<Employee[]>}
   */
  async loadAllEmployeeCSVs() {
    const dirPath = this.config.csvDirectory;
    this.logger.info({ dirPath }, 'Loading employee CSV files');

    try {
      const files = await readdir(dirPath);
      const csvFiles = files.filter((file) => file.toLowerCase().endsWith('.csv'));

      if (csvFiles.length === 0) {
        this.logger.warn({ dirPath }, 'No CSV files found in directory');
        return [];
      }

      this.logger.info({ fileCount: csvFiles.length }, 'Found CSV files');

      // Load all CSV files in parallel
      const employeeArrays = await Promise.all(
        csvFiles.map((file) => this.loadSingleCSV(path.join(dirPath, file)))
      );

      // Flatten arrays
      const allEmployees = employeeArrays.flat();

      this.logger.info(
        { totalRecords: allEmployees.length, files: csvFiles.length },
        'Loaded all employee records'
      );

      return allEmployees;
    } catch (error) {
      this.logger.error({ error, dirPath }, 'Failed to load CSV files');
      throw new CSVDirectoryError(dirPath, error.message);
    }
  }

  /**
   * Load a single CSV file
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Employee[]>}
   */
  async loadSingleCSV(filePath) {
    const filename = path.basename(filePath);
    this.logger.debug({ filename }, 'Loading CSV file');

    return new Promise((resolve, reject) => {
      const employees = [];
      const errors = [];

      const stream = fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header }) => normalizeHeader(header),
          skipLines: 0,
        }))
        .on('data', (data) => {
          try {
            const employee = transformRecord(data, filename);
            if (employee) {
              employees.push(employee);
            } else {
              errors.push({ row: data, reason: 'Missing required fields' });
            }
          } catch (error) {
            errors.push({ row: data, reason: error.message });
          }
        })
        .on('end', () => {
          if (errors.length > 0) {
            this.logger.warn(
              { filename, errorCount: errors.length, validCount: employees.length },
              'CSV loaded with validation errors'
            );
          }
          this.logger.debug(
            { filename, recordCount: employees.length },
            'CSV file loaded successfully'
          );
          resolve(employees);
        })
        .on('error', (error) => {
          this.logger.error({ filename, error }, 'Failed to parse CSV file');
          reject(new InvalidCSVFormatError(filename, error.message));
        });
    });
  }

  /**
   * Reload all employees and update cache
   * @returns {Promise<void>}
   */
  async reloadEmployees() {
    // Prevent concurrent reloads
    if (this.reloadLock) {
      this.logger.info('Reload already in progress, skipping');
      return;
    }

    this.reloadLock = true;

    try {
      const employees = await this.loadAllEmployeeCSVs();
      
      // Build new cache
      const newCache = new Map();
      const duplicates = [];

      for (const employee of employees) {
        const normalizedEmail = normalizeEmail(employee.emailInstitute);
        
        if (newCache.has(normalizedEmail)) {
          duplicates.push(normalizedEmail);
        }
        
        newCache.set(normalizedEmail, employee);
      }

      if (duplicates.length > 0) {
        this.logger.warn(
          { duplicateCount: duplicates.length },
          'Found duplicate email addresses in CSV files'
        );
      }

      // Atomically replace cache
      this.employeeCache = newCache;
      this.lastLoadTime = new Date();

      this.logger.info(
        { cacheSize: this.employeeCache.size },
        'Employee cache reloaded successfully'
      );
    } finally {
      this.reloadLock = false;
    }
  }

  /**
   * Set up file watcher for automatic reload on CSV changes
   */
  setupFileWatcher() {
    if (this.watcher) {
      this.logger.warn('File watcher already set up');
      return;
    }

    const watchPath = path.join(this.config.csvDirectory, '*.csv');
    
    this.watcher = chokidar.watch(watchPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => {
        this.logger.info({ filePath }, 'New CSV file detected, reloading');
        this.reloadEmployees().catch((err) =>
          this.logger.error({ error: err }, 'Failed to reload after file add')
        );
      })
      .on('change', (filePath) => {
        this.logger.info({ filePath }, 'CSV file changed, reloading');
        this.reloadEmployees().catch((err) =>
          this.logger.error({ error: err }, 'Failed to reload after file change')
        );
      })
      .on('unlink', (filePath) => {
        this.logger.info({ filePath }, 'CSV file deleted, reloading');
        this.reloadEmployees().catch((err) =>
          this.logger.error({ error: err }, 'Failed to reload after file deletion')
        );
      })
      .on('error', (error) => {
        this.logger.error({ error }, 'File watcher error');
      });

    this.logger.info({ watchPath }, 'File watcher set up successfully');
  }

  /**
   * Verify employee email exists in CSV data
   * @param {string} emailInstitute - Email to verify
   * @returns {Promise<EmployeeVerificationResult>}
   */
  async verifyEmployeeEmail(emailInstitute) {
    if (!this.isInitialized) {
      throw new ServiceNotInitializedError();
    }

    if (!emailInstitute) {
      return {
        success: false,
        employee: null,
        error: 'Email address is required',
        errorCode: 'INVALID_INPUT',
      };
    }

    const normalizedEmail = normalizeEmail(emailInstitute);
    
    this.logger.debug({ email: normalizedEmail }, 'Verifying employee email');

    try {
      if (this.config.streamingMode) {
        return await this.verifyEmailStreaming(normalizedEmail);
      } else {
        return await this.verifyEmailCached(normalizedEmail);
      }
    } catch (error) {
      this.logger.error({ error, email: normalizedEmail }, 'Email verification failed');
      throw error;
    }
  }

  /**
   * Verify email using in-memory cache
   * @private
   * @param {string} normalizedEmail - Normalized email
   * @returns {Promise<EmployeeVerificationResult>}
   */
  async verifyEmailCached(normalizedEmail) {
    const employee = this.employeeCache.get(normalizedEmail);

    if (!employee) {
      throw new EmployeeNotFoundError(normalizedEmail);
    }

    this.logger.info(
      { email: normalizedEmail, staffId: employee.staffId },
      'Employee verified successfully'
    );

    return {
      success: true,
      employee,
      error: null,
      errorCode: null,
    };
  }

  /**
   * Verify email using streaming search (for very large datasets)
   * @private
   * @param {string} normalizedEmail - Normalized email
   * @returns {Promise<EmployeeVerificationResult>}
   */
  async verifyEmailStreaming(normalizedEmail) {
    const allEmployees = await this.loadAllEmployeeCSVs();
    const matches = allEmployees.filter(
      (emp) => normalizeEmail(emp.emailInstitute) === normalizedEmail
    );

    if (matches.length === 0) {
      throw new EmployeeNotFoundError(normalizedEmail);
    }

    if (matches.length > 1) {
      this.logger.warn(
        { email: normalizedEmail, count: matches.length },
        'Multiple employee records found'
      );
      throw new MultipleEmployeeRecordsError(normalizedEmail, matches.length);
    }

    return {
      success: true,
      employee: matches[0],
      error: null,
      errorCode: null,
    };
  }

  /**
   * Get employee by staff ID
   * @param {string} staffId - Staff ID to search
   * @returns {Promise<Employee|null>}
   */
  async getEmployeeByStaffId(staffId) {
    if (!this.isInitialized) {
      throw new ServiceNotInitializedError();
    }

    for (const employee of this.employeeCache.values()) {
      if (employee.staffId === staffId) {
        return employee;
      }
    }

    return null;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      isInitialized: this.isInitialized,
      employeeCount: this.employeeCache.size,
      lastLoadTime: this.lastLoadTime,
      watcherActive: !!this.watcher,
      config: {
        csvDirectory: this.config.csvDirectory,
        enableFileWatch: this.config.enableFileWatch,
        streamingMode: this.config.streamingMode,
      },
    };
  }

  /**
   * Shutdown the service gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.logger.info('Shutting down employee service');

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.logger.info('File watcher closed');
    }

    this.employeeCache.clear();
    this.isInitialized = false;

    this.logger.info('Employee service shut down successfully');
  }
}

/**
 * Create a singleton instance of EmployeeService
 * @param {Partial<EmployeeServiceConfig>} config - Service configuration
 * @returns {EmployeeService}
 */
export const createEmployeeService = (config = {}) => {
  return new EmployeeService(config);
};

export default EmployeeService;
