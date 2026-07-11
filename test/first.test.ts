import { describe, expect, it } from 'vitest';
import { first, firstOrDefault, from } from '../src/index.js';

describe('first', () => {
  it('should return the first item in the collection when no additional filter applied', () => {
    expect(from([1, 2, 3]).pipe(first())).toBe(1);
  });

  it('should allow a filter to be used to find a value', () => {
    expect(from([1, 2, 3]).pipe(first((item) => item === 2))).toBe(2);
  });

  it('should only return one value even if multiple match the selector', () => {
    expect(from([1, 2, 2, 3]).pipe(first((item) => item === 2))).toBe(2);
  });

  it('should raise an error when no match is found', () => {
    expect(() => from([1, 2, 3]).pipe(first(() => false))).toThrow(
      'Sequence contains no matching elements',
    );
  });

  it('should return falsy values that match', () => {
    expect(from([0, 1, 2]).pipe(first())).toBe(0);
  });
});

describe('firstOrDefault', () => {
  it('should return the first item in the collection when no additional filter applied', () => {
    expect(from([1, 2, 3]).pipe(firstOrDefault())).toBe(1);
  });

  it('should allow a filter to be used to find a value', () => {
    expect(from([1, 2, 3]).pipe(firstOrDefault((item) => item === 2))).toBe(2);
  });

  it('should only return one value even if multiple match the selector', () => {
    expect(from([1, 2, 2, 3]).pipe(firstOrDefault((item) => item === 2))).toBe(2);
  });

  it('should return undefined when no match is found', () => {
    expect(from([1, 2, 3]).pipe(firstOrDefault(() => false))).toBeUndefined();
  });
});
