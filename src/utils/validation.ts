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
 * Strict Email Address Validation
 * Validates RFC-compliant email structure with valid TLD extension (.com, .org, .in, etc.)
 * Rejects bogus emails like a@b, test@test.com, or missing domain extensions
 */
export const isValidEmailAddress = (emailStr: string): boolean => {
  if (!emailStr) return false;
  const cleanEmail = emailStr.trim().toLowerCase();

  // Strict email regex requiring domain extension of at least 2 characters (e.g. .com, .in, .edu)
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/;
  if (!strictEmailRegex.test(cleanEmail)) return false;

  const [localPart, domainPart] = cleanEmail.split('@');
  if (!localPart || !domainPart) return false;

  // Local part must be at least 2 characters
  if (localPart.length < 2) return false;

  // Disallow bogus repetitive domains like test@test.com or abc@abc.com
  const domainName = domainPart.split('.')[0];
  if (localPart === domainName && (localPart === 'test' || localPart === 'abc' || localPart === 'asdf')) {
    return false;
  }

  return true;
};
