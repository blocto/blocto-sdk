import {
  isValidTransaction,
  isValidTransactions,
} from '../../lib/isValidTransaction';
import { ERROR_MESSAGE } from '../../lib/constant';

describe('isValidTransaction', () => {
  it('should return valid when passing valid transaction', () => {
    const mockTransaction = {
      from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
      to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
      value: '0x1',
    };

    expect(isValidTransaction(mockTransaction)).toEqual({ isValid: true });
  });

  it("should return invalid when passing invalid transaction without 'from'", () => {
    const mockTransaction = {
      to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
      value: '0x1',
    };

    expect(isValidTransaction(mockTransaction)).toEqual({
      isValid: false,
      invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTION,
    });
  });

  it("should return invalid when passing transaction with invalid 'value'", () => {
    const mockTransaction = {
      from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
      to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
      value: 1,
    };

    expect(isValidTransaction(mockTransaction)).toEqual({
      isValid: false,
      invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTION_VALUE,
    });
  });
});

describe('isValidTransactions', () => {
  it('should return valid for an array of valid transactions', () => {
    const mockTransactions = [
      {
        from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
        to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        value: '0x1',
      },
      {
        from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
        to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        data: '0xa9059cbb00000000000000000000000076c7a9cac72db4865bd1db3acfa78a261755c4fb0000000000000000000000000000000000000000000000000000000005f5e100',
      },
    ];

    expect(isValidTransactions(mockTransactions)).toEqual({ isValid: true });
  });

  it('should return invalid when passing invalid array of transactions', () => {
    const mockTransactions = 'notAnArray';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(isValidTransactions(mockTransactions)).toEqual({
      isValid: false,
      invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTIONS,
    });
  });

  it('should return invalid when passing contain invalid transactions', () => {
    const mockTransactions = [
      {
        from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
        to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        value: 1,
      },
      {
        from: '0xC5a6382a81CDA092DBdE9dFeEfa2642306cF0006',
        to: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        data: '0xa9059cbb000000000000000000000000d3ea1bfe3d1f99278c2ac7b6429e2e2ac32564e30000000000000000000000000000000000000000000000000000000005f5e100',
      },
    ];

    expect(isValidTransactions(mockTransactions)).toEqual({
      isValid: false,
      invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTION_VALUE,
    });
  });
});
