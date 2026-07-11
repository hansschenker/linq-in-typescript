import { describe, expect, it } from 'vitest';
import { concat, count, from, range, toArray } from '../src/index.js';

describe('concat', () => {
  it('should allow concatting two Enumerable objects', () => {
    const combined = range(0, 10).pipe(concat(range(0, 10)));

    expect(combined.pipe(count())).toBe(20);
  });

  it('should allow concatting of an array to an enumerable', () => {
    const combined = range(0, 10).pipe(concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

    expect(combined.pipe(count())).toBe(20);
  });

  it('should contain all values from both collections', () => {
    const first = [0, 1, 2, 3, 4];
    const second = [5, 6, 7, 8, 9];

    const combined = from(first).pipe(concat(second), toArray());

    expect(combined).toEqual(first.concat(second));
  });
});
