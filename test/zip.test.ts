import { describe, expect, it } from 'vitest';
import { from, range, toArray, zip } from '../src/index.js';

describe('zip', () => {
  it('should pair up two sequences as tuples', () => {
    const result = from([1, 2, 3]).pipe(zip(['a', 'b', 'c']), toArray());

    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  it('should allow a result selector', () => {
    const result = from([1, 2]).pipe(
      zip(['a', 'b'], (n, s) => s + n),
      toArray(),
    );

    expect(result).toEqual(['a1', 'b2']);
  });

  it('should stop at the end of the shorter sequence when the second is shorter', () => {
    const result = from([1, 2, 3]).pipe(zip(['a']), toArray());

    expect(result).toEqual([[1, 'a']]);
  });

  it('should stop at the end of the shorter sequence when the first is shorter', () => {
    const result = from([1]).pipe(zip(['a', 'b', 'c']), toArray());

    expect(result).toEqual([[1, 'a']]);
  });

  it('should zip with another enumerable', () => {
    const result = from(['a', 'b', 'c']).pipe(zip(range(0, 3)), toArray());

    expect(result).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
  });

  it('should process items in a lazy fashion', () => {
    const naturals = from({
      *[Symbol.iterator](): Generator<number> {
        let i = 0;
        while (true) {
          yield i++;
        }
      },
    });

    const result = naturals.pipe(zip(['a', 'b']), toArray());

    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
    ]);
  });

  it('should return the same result through multiple passes', () => {
    const result = from([1, 2]).pipe(zip(['a', 'b']));

    expect([...result]).toEqual([...result]);
  });
});
