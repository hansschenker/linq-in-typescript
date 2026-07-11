import { describe, expect, it } from 'vitest';
import { all, from, pipe, range, select, toArray, where } from '../src/index.js';

describe('Interesting API usages', () => {
  it('should calc prime numbers', () => {
    const primes = range(3, 10).pipe(
      where((n) => range(2, Math.floor(Math.sqrt(n))).pipe(all((i) => n % i > 0))),
      toArray(),
    );

    expect(primes).toEqual([3, 5, 7, 11]);
  });

  it('should allow composing reusable chains with the standalone pipe', () => {
    const doubledEvens = pipe(
      where<number>((x) => x % 2 === 0),
      select((x) => x * 2),
      toArray(),
    );

    expect(doubledEvens(from([1, 2, 3, 4]))).toEqual([4, 8]);
    expect(doubledEvens(from([5, 6]))).toEqual([12]);
  });
});
