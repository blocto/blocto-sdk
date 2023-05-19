// instead invariant from package, since all error will throw on production
function invariant(condition: unknown, format: string): void {
  if (!condition) {
    throw new Error(format);
  }
}
export default invariant;
