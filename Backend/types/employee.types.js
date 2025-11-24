/**
 * @file Type definitions for employee verification system
 * @description Provides JSDoc type definitions for Employee records and related entities
 */

/**
 * @typedef {Object} Employee
 * @property {string} sr - Serial number
 * @property {string} staffId - Unique staff identifier
 * @property {string} staffFullName - Full name of the employee
 * @property {string} staffShortName - Short name/initials
 * @property {string} mobile - Mobile phone number
 * @property {string} staffCode - Staff code
 * @property {string} emailPrivate - Personal email address
 * @property {string} emailInstitute - Institute email address (used for verification)
 * @property {string|null} instituteJoiningDate - ISO date string of joining date
 * @property {string} currentDesignationName - Current designation/position
 * @property {string} departmentCode - Department code
 * @property {string} facultyName - Faculty name
 * @property {string} _sourceFile - Source CSV filename (added during processing)
 */

/**
 * @typedef {Object} EmployeeServiceConfig
 * @property {string} csvDirectory - Path to directory containing CSV files
 * @property {boolean} enableFileWatch - Whether to watch for CSV file changes
 * @property {number} cacheTTL - Cache TTL in milliseconds (0 = no expiration)
 * @property {boolean} streamingMode - Use streaming search instead of in-memory cache
 * @property {Object} logger - Logger instance (pino compatible)
 */

/**
 * @typedef {Object} EmployeeVerificationResult
 * @property {boolean} success - Whether verification succeeded
 * @property {Employee|null} employee - Matched employee record
 * @property {string|null} error - Error message if verification failed
 * @property {string|null} errorCode - Error code for programmatic handling
 */

/**
 * @typedef {Object} UserCreatePayload
 * @property {string} email - User email (must match EmailInstitute)
 * @property {string} password - User password
 * @property {string} role - User role
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} [message] - Success or error message
 * @property {string} [token] - JWT token
 * @property {number} [expiresIn] - Token expiration in milliseconds
 * @property {Object} [user] - User details
 * @property {string} [user.id] - User ID
 * @property {string} [user.email] - User email
 * @property {string} [user.role] - User role
 * @property {Object} [user.employeeDetails] - Linked employee details
 */

export {};
