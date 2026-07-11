import { describe, expect, it } from 'vitest';
import { from, select, take, toArray, union } from '../src/index.js';

describe('union', () => {
  it('should combine two sequences without duplicates', () => {
    const result = from([1, 2, 3]).pipe(union([2, 3, 4]), toArray());

    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should remove duplicates within each source too', () => {
    const result = from([1, 1, 2]).pipe(union([2, 2, 3]), toArray());

    expect(result).toEqual([1, 2, 3]);
  });

  it('should allow a key selector, keeping the first item per key', () => {
    const first = [{ id: 1, from: 'first' }];
    const second = [
      { id: 1, from: 'second' },
      { id: 2, from: 'second' },
    ];

    const result = from(first).pipe(
      union(second, (x) => x.id),
      select((x) => `${x.id}:${x.from}`),
      toArray(),
    );

    expect(result).toEqual(['1:first', '2:second']);
  });

  it('should stream lazily, working with an infinite first sequence', () => {
    const naturals = from({
      *[Symbol.iterator](): Generator<number> {
        let i = 0;
        while (true) {
          yield i++;
        }
      },
    });

    const result = naturals.pipe(union([5]), take(3), toArray());

    expect(result).toEqual([0, 1, 2]);
  });

  it('should return the same result through multiple passes', () => {
    const result = from([1, 2]).pipe(union([2, 3]));

    expect([...result]).toEqual([...result]);
  });
});
