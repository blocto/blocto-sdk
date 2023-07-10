export const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

export const isValidTransaction = (transaction: unknown): boolean => (typeof transaction === 'object' && transaction !== null && 'from' in transaction);

export const isValidTransactions = (transactions: unknown): boolean => (Array.isArray(transactions) && transactions.every(tx => isValidTransaction(tx)));