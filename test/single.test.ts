import { describe, expect, it } from 'vitest';
import { from, single } from '../src/index.js';

describe('single', () => {
  it('should return the uniquely matched value', () => {
    expect(from([1, 2, 3]).pipe(single((x) => x === 2))).toBe(2);
  });

  it('should throw if more than one item is matched', () => {
    expect(() => from([1, 2, 3, 2]).pipe(single((x) => x === 2))).toThrow(
      'Sequence contains more than one matching element',
    );
  });

  it('should throw if no match is found', () => {
    expect(() => from([1, 2, 3]).pipe(single((x) => x === 4))).toThrow(
      'Sequence contains no matching element',
    );
  });
});
