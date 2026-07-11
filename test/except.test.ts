import { describe, expect, it } from 'vitest';
import { except, from, select, take, toArray } from '../src/index.js';

describe('except', () => {
  it('should return elements of the first sequence not present in the second', () => {
    const result = from([1, 2, 3, 4]).pipe(except([2, 4]), toArray());

    expect(result).toEqual([1, 3]);
  });

  it('should produce distinct results', () => {
    const result = from([1, 1, 2, 2, 3]).pipe(except([3]), toArray());

    expect(result).toEqual([1, 2]);
  });

  it('should allow a key selector', () => {
    const people = [
      { name: 'Alice', age: 25 },
      { name: 'Ben', age: 30 },
      { name: 'Cara', age: 35 },
    ];
    const retired = [{ name: 'Dan', age: 30 }];

    const names = from(people).pipe(
      except(retired, (p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Cara']);
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

    const result = naturals.pipe(except([0, 1]), take(3), toArray());

    expect(result).toEqual([2, 3, 4]);
  });

  it('should defer consuming both sequences until iterated', () => {
    let secondConsumed = false;
    const second = {
      *[Symbol.iterator](): Generator<number> {
        secondConsumed = true;
        yield 2;
      },
    };

    const result = from([1, 2]).pipe(except(second));

    expect(secondConsumed).toBe(false);
    expect([...result]).toEqual([1]);
    expect(secondConsumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const result = from([1, 2, 3]).pipe(except([2]));

    expect([...result]).toEqual([...result]);
  });
});
