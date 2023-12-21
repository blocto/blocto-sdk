export function isHexString(value) {
    return (
      typeof value === 'string' &&
      value.length % 2 === 0 &&
      value.match(/^0x[0-9A-Fa-f]*$/)
    );
  }
  
  export function removeHexPrefix(value) {
    return value.slice(0, 2) === '0x' ? value.slice(2) : value;
  }
  
  export function mergeErrors(errEOA, errCA) {
    const msgEOA = errEOA
      ? `errored with: ${errEOA.toString()}`
      : 'returned false';
    return `Authorisation check failed and errored in 2 alternative flows. 'External Owned Account' check ${msgEOA} . 'Contract Account' check errored with: ${errCA.toString()}`;
  }
  