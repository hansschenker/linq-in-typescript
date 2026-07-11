import { describe, expect, it } from 'vitest';
import { from, singleOrDefault } from '../src/index.js';

describe('singleOrDefault', () => {
  it("should throw when no additional filter applied and there's more than one item in the collection", () => {
    expect(() => from([1, 2, 3]).pipe(singleOrDefault())).toThrow(
      'Sequence contains more than one matching element',
    );
  });

  it("shouldn't throw when no additional filter applied and there's only one item", () => {
    expect(from([1]).pipe(singleOrDefault())).toBe(1);
  });

  it('should allow a filter to be used to find a value', () => {
    expect(from([1, 2, 3]).pipe(singleOrDefault((item) => item === 2))).toBe(2);
  });

  it('should throw if multiple match the selector', () => {
    expect(() => from([1, 2, 2, 3]).pipe(singleOrDefault((item) => item === 2))).toThrow(
      'Sequence contains more than one matching element',
    );
  });

  it('should return undefined when no match is found', () => {
    expect(from([1, 2, 3]).pipe(singleOrDefault(() => false))).toBeUndefined();
  });
});
