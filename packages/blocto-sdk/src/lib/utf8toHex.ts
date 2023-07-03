import { Buffer } from 'buffer';
export type ValidInputTypes = Uint8Array | bigint | string | number | boolean;

export const isHexString = (hex: ValidInputTypes) =>
  typeof hex === 'string' && /^0x[0-9A-Fa-f]*$/.test(hex);

export const utf8ToHex = (str: string) => {
  return Buffer.from(str, 'utf8').toString('hex');
};
