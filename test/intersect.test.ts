import { describe, expect, it } from 'vitest';
import { from, intersect, select, take, toArray } from '../src/index.js';

describe('intersect', () => {
  it('should return elements present in both sequences, in first-sequence order', () => {
    const result = from([1, 2, 3, 4]).pipe(intersect([3, 1, 5]), toArray());

    expect(result).toEqual([1, 3]);
  });

  it('should produce distinct results', () => {
    const result = from([1, 1, 2, 1]).pipe(intersect([1, 1]), toArray());

    expect(result).toEqual([1]);
  });

  it('should allow a key selector', () => {
    const people = [
      { name: 'Alice', age: 25 },
      { name: 'Ben', age: 30 },
      { name: 'Cara', age: 35 },
    ];
    const others = [{ name: 'Dan', age: 30 }];

    const names = from(people).pipe(
      intersect(others, (p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Ben']);
  });

  it('should buffer the second sequence but stream the first', () => {
    const naturals = from({
      *[Symbol.iterator](): Generator<number> {
        let i = 0;
        while (true) {
          yield i++;
        }
      },
    });

    const result = naturals.pipe(intersect([5, 2]), take(2), toArray());

    expect(result).toEqual([2, 5]);
  });

  it('should defer consuming both sequences until iterated', () => {
    let secondConsumed = false;
    const second = {
      *[Symbol.iterator](): Generator<number> {
        secondConsumed = true;
        yield 1;
      },
    };

    const result = from([1, 2]).pipe(intersect(second));

    expect(secondConsumed).toBe(false);
    expect([...result]).toEqual([1]);
    expect(secondConsumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const result = from([1, 2, 3]).pipe(intersect([2, 3]));

    expect([...result]).toEqual([...result]);
  });
});
