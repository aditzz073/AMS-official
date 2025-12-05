/**
 * @file Custom error classes for employee verification system
 */

/**
 * Base error class for employee-related errors
 */
export class EmployeeError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when employee email is not found in CSV files
 */
export class EmployeeNotFoundError extends EmployeeError {
  constructor(email) {
    super(
      `Email address '${email}' not found in employee database. You are not authorized to create an account.`,
      'EMPLOYEE_NOT_FOUND'
    );
    this.statusCode = 403;
    this.email = email;
  }
}

/**
 * Error thrown when multiple employees have the same email
 */
export class MultipleEmployeeRecordsError extends EmployeeError {
  constructor(email, count) {
    super(
      `Multiple employee records (${count}) found for email '${email}'. Please contact system administrator.`,
      'MULTIPLE_EMPLOYEE_RECORDS'
    );
    this.statusCode = 409;
    this.email = email;
    this.count = count;
  }
}

/**
 * Error thrown when employee is already linked to an existing user account
 */
export class EmployeeAlreadyLinkedError extends EmployeeError {
  constructor(staffId) {
    super(
      `Employee with Staff ID '${staffId}' is already linked to an existing user account.`,
      'EMPLOYEE_ALREADY_LINKED'
    );
    this.statusCode = 409;
    this.staffId = staffId;
  }
}

/**
 * Error thrown when CSV file has invalid format or structure
 */
export class InvalidCSVFormatError extends EmployeeError {
  constructor(filename, reason) {
    super(
      `Invalid CSV format in file '${filename}': ${reason}`,
      'INVALID_CSV_FORMAT'
    );
    this.statusCode = 500;
    this.filename = filename;
  }
}

/**
 * Error thrown when CSV directory is not found or not accessible
 */
export class CSVDirectoryError extends EmployeeError {
  constructor(directory, reason) {
    super(
      `CSV directory error for '${directory}': ${reason}`,
      'CSV_DIRECTORY_ERROR'
    );
    this.statusCode = 500;
    this.directory = directory;
  }
}

/**
 * Error thrown when employee service is not initialized
 */
export class ServiceNotInitializedError extends EmployeeError {
  constructor() {
    super(
      'Employee service is not initialized. Please ensure the service is started before use.',
      'SERVICE_NOT_INITIALIZED'
    );
    this.statusCode = 503;
  }
}
