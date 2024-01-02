import invariant from '../../lib/invariant';

describe('invariant Function', () => {
  it('should not throw an error when condition is true', () => {
    expect(() => {
      invariant(true, 'This is a test');
    }).not.toThrow();
  });

  it('should throw an error with the specified message when condition is false', () => {
    const errorMessage = 'This is a test error message';

    expect(() => {
      invariant(false, errorMessage);
    }).toThrowError(errorMessage);
  });
});
