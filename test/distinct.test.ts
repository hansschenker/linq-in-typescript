import { describe, expect, it } from 'vitest';
import { distinct, from, select, take, toArray } from '../src/index.js';

describe('distinct', () => {
  it('should remove duplicates, keeping first-occurrence order', () => {
    const result = from([1, 2, 1, 3, 2, 4]).pipe(distinct(), toArray());

    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should allow a key selector, keeping the first item per key', () => {
    const people = [
      { name: 'Alice', age: 25 },
      { name: 'Ben', age: 30 },
      { name: 'Cara', age: 25 },
    ];

    const names = from(people).pipe(
      distinct((p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Ben']);
  });

  it('should use SameValueZero equality, so NaN deduplicates', () => {
    const result = from([NaN, NaN, 1]).pipe(distinct(), toArray());

    expect(result).toEqual([NaN, 1]);
  });

  it('should process items in a lazy fashion', () => {
    const naturals = from({
      *[Symbol.iterator](): Generator<number> {
        let i = 0;
        while (true) {
          yield i++ % 3;
        }
      },
    });

    const result = naturals.pipe(distinct(), take(3), toArray());

    expect(result).toEqual([0, 1, 2]);
  });

  it('should return the same result through multiple passes', () => {
    const result = from([1, 2, 1, 3]).pipe(distinct());

    expect([...result]).toEqual([...result]);
  });
});
