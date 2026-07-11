import { describe, expect, it } from 'vitest';
import { average, from, range } from '../src/index.js';

describe('average', () => {
  it('should calculate the average', () => {
    expect(range(0, 10).pipe(average())).toBe(4.5);
  });

  it('should throw an error if there is an empty collection', () => {
    expect(() => from<number>([]).pipe(average())).toThrow('Sequence contains no elements');
  });

  it('should allow a function to manipulate the values being averaged', () => {
    expect(range(0, 10).pipe(average((x) => x * 2))).toBe(9);
  });
});
