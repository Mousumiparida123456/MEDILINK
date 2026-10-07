/**
 * Strict Indian Mobile Number Validation
 * Requires exactly 10 digits starting with 6, 7, 8, or 9.
 * Regex: ^[6-9]\d{9}$
 */
export const isValidPhoneNumber = (phoneStr: string): boolean => {
  if (!phoneStr) return false;
  const cleanPhone = phoneStr.trim();
  return /^[6-9]\d{9}$/.test(cleanPhone);
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
