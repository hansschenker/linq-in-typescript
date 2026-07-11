import { describe, expect, it } from 'vitest';
import { contains, range } from '../src/index.js';

describe('contains', () => {
  it('should return true if it finds a matching value', () => {
    expect(range(0, 10).pipe(contains(5))).toBe(true);
  });

  it('should return false if there is no matching value', () => {
    expect(range(0, 10).pipe(contains(-5))).toBe(false);
  });

  it('should allow a custom equality tester', () => {
    expect(range(0, 10).pipe(contains(5, (x, y) => x === y))).toBe(true);
  });
});
