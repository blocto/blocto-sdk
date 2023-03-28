export const isEmail = (value?: string) => value && typeof value === 'string' && /\S+@\S+\.\S+/.test(value);
