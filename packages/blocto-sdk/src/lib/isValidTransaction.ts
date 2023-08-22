import { ERROR_MESSAGE } from './constant';
import { isHexString } from './utf8toHex';

export const isValidTransaction = (
  transaction: Record<string, any>
): { isValid: boolean; invalidMsg?: string } => {
  if (
    !transaction ||
    typeof transaction !== 'object' ||
    !('from' in transaction)
  ) {
    return { isValid: false, invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTION };
  }
  if (transaction.value && !isHexString(transaction.value)) {
    return {
      isValid: false,
      invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTION_VALUE,
    };
  }

  return { isValid: true };
};

export const isValidTransactions = (
  transactions: Record<string, any>[]
): { isValid: boolean; invalidMsg?: string } => {
  if (!Array.isArray(transactions)) {
    return { isValid: false, invalidMsg: ERROR_MESSAGE.INVALID_TRANSACTIONS };
  }

  for (let i = 0; i < transactions.length; i++) {
    const { isValid, invalidMsg } = isValidTransaction(transactions[i]);

    if (!isValid) {
      return { isValid, invalidMsg };
    }
  }

  return { isValid: true };
};
