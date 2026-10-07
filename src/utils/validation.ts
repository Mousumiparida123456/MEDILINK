/**
 * Strict Phone Number Validation
 * Rejects fake/dummy sequences (e.g. 0000000000, 1111111111, 1234567890, 9999999999)
 * Validates 10-digit Indian mobile numbers (must start with 6, 7, 8, or 9)
 * Validates international numbers with country codes (10 to 15 digits)
 */
export const isValidPhoneNumber = (phoneStr: string): boolean => {
  if (!phoneStr) return false;
  const digits = phoneStr.replace(/\D/g, '');

  // Must be between 10 and 15 digits
  if (digits.length < 10 || digits.length > 15) return false;

  // Reject all identical repeating digits (e.g., 0000000000, 9999999999)
  if (/^(\d)\1{9,}$/.test(digits)) return false;

  // Reject sequential fake patterns like 1234567890 or 0123456789
  if ('123456789012345'.includes(digits) || '012345678901234'.includes(digits)) return false;

  // 10-digit mobile validation (Indian mobile numbers start with 6, 7, 8, or 9)
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }

  // International format validation (11-15 digits)
  return /^[1-9]\d{9,14}$/.test(digits);
};

/**
 * Standard RFC-Compliant Email Address Validation
 * Validates email structure (e.g. name@domain.com, user.name@domain.co.in)
 * Requires a valid domain TLD extension of at least 2 characters (.com, .org, .in, .net, etc.)
 */
export const isValidEmailAddress = (emailStr: string): boolean => {
  if (!emailStr) return false;
  const cleanEmail = emailStr.trim().toLowerCase();

  // Standard RFC-compliant email regex: user@domain.tld
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/;
  if (!emailRegex.test(cleanEmail)) return false;

  const [localPart, domainPart] = cleanEmail.split('@');
  if (!localPart || !domainPart) return false;

  // Local part must be at least 2 characters long
  if (localPart.length < 2) return false;

  // Domain name before extension must be at least 2 characters
  const domainParts = domainPart.split('.');
  if (!domainParts[0] || domainParts[0].length < 2) return false;

  return true;
};
