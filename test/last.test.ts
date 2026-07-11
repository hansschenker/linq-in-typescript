import { describe, expect, it } from 'vitest';
import { from, last, lastOrDefault } from '../src/index.js';

describe('last', () => {
  it('should return the last item in the collection when no additional filter applied', () => {
    expect(from([1, 2, 3]).pipe(last())).toBe(3);
  });

  it('should allow a filter to be used to find a value', () => {
    expect(from([1, 2, 3]).pipe(last((item) => item < 3))).toBe(2);
  });

  it('should raise an error when no match is found', () => {
    expect(() => from([1, 2, 3]).pipe(last(() => false))).toThrow(
      'Sequence contains no matching elements',
    );
  });

  it('should return falsy values that match', () => {
    expect(from([1, 2, 0]).pipe(last())).toBe(0);
  });
});

describe('lastOrDefault', () => {
  it('should return the last item in the collection when no additional filter applied', () => {
    expect(from([1, 2, 3]).pipe(lastOrDefault())).toBe(3);
  });

  it('should allow a filter to be used to find a value', () => {
    expect(from([1, 2, 3]).pipe(lastOrDefault((item) => item < 3))).toBe(2);
  });

  it('should return undefined when no match is found', () => {
    expect(from([1, 2, 3]).pipe(lastOrDefault(() => false))).toBeUndefined();
  });
});
