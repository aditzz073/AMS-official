/**
 * Email Domain Validation Utility - Frontend
 * Ensures only @dayanandasagar.edu emails are allowed
 */

const ALLOWED_DOMAIN = '@dayanandasagar.edu';
const DOMAIN_REGEX = /^[A-Za-z0-9._%+-]+@dayanandasagar\.edu$/;

/**
 * Validates if email belongs to the allowed domain
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidInstitutionalEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim and convert to lowercase for consistent validation
  const normalizedEmail = email.trim().toLowerCase();

  // Check using both endsWith and regex for double validation
  return normalizedEmail.endsWith(ALLOWED_DOMAIN.toLowerCase()) && 
         DOMAIN_REGEX.test(normalizedEmail);
};

/**
 * Get error message for invalid email domain
 * @returns {string} - Error message
 */
export const getInvalidDomainMessage = () => {
  return 'Please use your official Dayananda Sagar University email ID (example@dayanandasagar.edu) to create an account.';
};

/**
 * Validates email format and domain
 * @param {string} email - Email to validate
 * @returns {object} - Validation result with success flag and message
 */
export const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  // Trim whitespace for validation
  const trimmedEmail = email.trim();

  // Basic email format validation
  const basicEmailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!basicEmailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'Invalid email format'
    };
  }

  // Check institutional domain
  if (!isValidInstitutionalEmail(trimmedEmail)) {
    return {
      isValid: false,
      message: getInvalidDomainMessage()
    };
  }

  return {
    isValid: true,
    message: 'Valid email'
  };
};

/**
 * Get domain example for display
 * @returns {string}
 */
export const getDomainExample = () => {
  return `example${ALLOWED_DOMAIN}`;
};

export default {
  isValidInstitutionalEmail,
  getInvalidDomainMessage,
  validateEmail,
  getDomainExample,
  ALLOWED_DOMAIN
};
