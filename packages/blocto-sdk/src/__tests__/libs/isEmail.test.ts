import { isEmail } from '../../lib/isEmail';

describe('isEmail function', () => {
  it('should return true for a valid email', () => {
    const validEmail = 'test@example.com';
    const isValid = isEmail(validEmail);
    expect(isValid).toBe(true);
  });

  it('should return false for an invalid email', () => {
    const invalidEmail = 'invalid-email';
    const isValid = isEmail(invalidEmail);
    expect(isValid).toBe(false);
  });

  it('should return false for an empty string', () => {
    const emptyString = '';
    const isValid = isEmail(emptyString);
    expect(isValid).toBe(false);
  });

  it('should return false for a string without @ symbol', () => {
    const noAtSymbol = 'emailWithoutAtSymbol.com';
    const isValid = isEmail(noAtSymbol);
    expect(isValid).toBe(false);
  });

  it('should return false for a string without dot after @ symbol', () => {
    const noDotAfterAtSymbol = 'email@withoutDotAfterAtSymbol';
    const isValid = isEmail(noDotAfterAtSymbol);
    expect(isValid).toBe(false);
  });

  // Add more test cases for edge cases or specific scenarios
});
