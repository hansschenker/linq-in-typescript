import { describe, expect, it } from 'vitest';
import { count, from, where } from '../src/index.js';

describe('count', () => {
  it('should correctly report the number of items in the enumerable', () => {
    const items = [1, 2, 3];

    expect(from(items).pipe(count())).toBe(items.length);
  });

  it('should allow a filter method for counting items', () => {
    expect(from([1, 2, 3]).pipe(count((x) => x % 2 === 0))).toBe(1);
  });

  it('should respect prefilters', () => {
    const filtered = from([1, 2, 3]).pipe(
      where((x) => x % 2 === 0),
      count(),
    );

    expect(filtered).toBe(1);
  });
});
