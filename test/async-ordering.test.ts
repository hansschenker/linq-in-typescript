import { describe, expect, it } from 'vitest';
import {
  from,
  orderBy,
  orderByDescending,
  select,
  thenBy,
  thenByDescending,
  toArray,
} from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const people = [
  { name: 'Cara', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Ben', age: 30 },
  { name: 'Dan', age: 25 },
];

describe('async orderBy', () => {
  it('should sort by value, not string coercion', async () => {
    expect(
      await from([10, 2, 1]).pipe(
        orderBy((x) => x),
        toArray(),
      ),
    ).toEqual([1, 2, 10]);
  });

  it('should allow an async key selector, awaited once per item', async () => {
    let calls = 0;
    const result = await from([3, 1, 2]).pipe(
      orderBy(async (x) => {
        calls++;
        await sleep(1);
        return x;
      }),
      toArray(),
    );

    expect(result).toEqual([1, 2, 3]);
    expect(calls).toBe(3); // one key computation per item, not per comparison
  });

  it('should be stable for equal keys', async () => {
    const names = await from(people).pipe(
      orderBy((p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Dan', 'Cara', 'Ben']);
  });

  it('should allow a custom comparer', async () => {
    const result = await from(['b', 'A', 'a']).pipe(
      orderBy(
        (x) => x,
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      ),
      toArray(),
    );

    expect(result).toEqual(['A', 'a', 'b']);
  });
});

describe('async orderByDescending / thenBy / thenByDescending', () => {
  it('should sort descending', async () => {
    expect(
      await from([1, 10, 2]).pipe(
        orderByDescending((x) => x),
        toArray(),
      ),
    ).toEqual([10, 2, 1]);
  });

  it('should break ties with thenBy', async () => {
    const names = await from(people).pipe(
      orderBy((p) => p.age),
      thenBy((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Dan', 'Ben', 'Cara']);
  });

  it('should break ties with thenByDescending', async () => {
    const names = await from(people).pipe(
      orderBy((p) => p.age),
      thenByDescending((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Dan', 'Alice', 'Cara', 'Ben']);
  });

  it('should return the same result through multiple passes', async () => {
    const sorted = from([3, 1, 2]).pipe(orderBy((x) => x));

    expect(await sorted.pipe(toArray())).toEqual([1, 2, 3]);
    expect(await sorted.pipe(toArray())).toEqual([1, 2, 3]);
  });
});
