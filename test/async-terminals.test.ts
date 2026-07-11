import { describe, expect, it } from 'vitest';
import {
  aggregate,
  all,
  any,
  average,
  contains,
  count,
  first,
  firstOrDefault,
  from,
  last,
  lastOrDefault,
  range,
  single,
  singleOrDefault,
} from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('async aggregate', () => {
  it('should fold without a seed', async () => {
    expect(await range(0, 10).pipe(aggregate((a, b) => a + b))).toBe(45);
  });

  it('should fold with a seed', async () => {
    expect(await range(0, 10).pipe(aggregate(1, (a, b) => a + b))).toBe(46);
  });

  it('should apply a result selector and allow async folders', async () => {
    const result = await from(['apple', 'passionfruit', 'grape']).pipe(
      aggregate(
        async (longest, next) => {
          await sleep(1);
          return next.length > longest.length ? next : longest;
        },
        (winner) => winner.toUpperCase(),
      ),
    );

    expect(result).toBe('PASSIONFRUIT');
  });

  it('should reject for an unseeded empty sequence', async () => {
    await expect(from<number>([]).pipe(aggregate((a, b) => a + b))).rejects.toThrow(
      'Sequence contains no elements',
    );
  });
});

describe('async quantifiers', () => {
  it('all should short-circuit on the first false', async () => {
    expect(await from([2, 4, 5]).pipe(all((x) => x % 2 === 0))).toBe(false);
    expect(await from([2, 4]).pipe(all(async (x) => x % 2 === 0))).toBe(true);
  });

  it('any should detect matches and emptiness', async () => {
    expect(await from([1]).pipe(any())).toBe(true);
    expect(await from([]).pipe(any())).toBe(false);
    expect(await from([1, 2]).pipe(any(async (x) => x > 1))).toBe(true);
  });

  it('contains should find values, with an optional async tester', async () => {
    expect(await range(0, 10).pipe(contains(5))).toBe(true);
    expect(await range(0, 10).pipe(contains(-5))).toBe(false);
    expect(
      await from([{ id: 1 }]).pipe(
        contains({ id: 1 }, async (a, b) => a.id === b.id),
      ),
    ).toBe(true);
  });
});

describe('async aggregation', () => {
  it('count should count, optionally with a predicate', async () => {
    expect(await from([1, 2, 3]).pipe(count())).toBe(3);
    expect(await from([1, 2, 3]).pipe(count(async (x) => x % 2 === 1))).toBe(2);
  });

  it('average should compute the mean and reject on empty', async () => {
    expect(await range(0, 10).pipe(average())).toBe(4.5);
    expect(await from([{ v: 2 }, { v: 4 }]).pipe(average((x) => x.v))).toBe(3);
    await expect(from<number>([]).pipe(average())).rejects.toThrow(
      'Sequence contains no elements',
    );
  });
});

describe('async element access', () => {
  it('first / firstOrDefault', async () => {
    expect(await from([0, 1]).pipe(first())).toBe(0);
    expect(await from([1, 2, 3]).pipe(first(async (x) => x > 1))).toBe(2);
    await expect(from([1]).pipe(first(() => false))).rejects.toThrow(
      'Sequence contains no matching elements',
    );
    expect(await from([1]).pipe(firstOrDefault(() => false))).toBeUndefined();
  });

  it('last / lastOrDefault', async () => {
    expect(await from([1, 2, 0]).pipe(last())).toBe(0);
    expect(await from([1, 2, 3]).pipe(last((x) => x < 3))).toBe(2);
    await expect(from([1]).pipe(last(() => false))).rejects.toThrow(
      'Sequence contains no matching elements',
    );
    expect(await from([1]).pipe(lastOrDefault(() => false))).toBeUndefined();
  });

  it('single / singleOrDefault', async () => {
    expect(await from([1, 2, 3]).pipe(single((x) => x === 2))).toBe(2);
    await expect(from([1, 2, 2]).pipe(single((x) => x === 2))).rejects.toThrow(
      'Sequence contains more than one matching element',
    );
    await expect(from([1]).pipe(single((x) => x === 9))).rejects.toThrow(
      'Sequence contains no matching element',
    );
    expect(await from([1]).pipe(singleOrDefault((x) => x === 9))).toBeUndefined();
    await expect(from([2, 2]).pipe(singleOrDefault((x) => x === 2))).rejects.toThrow(
      'Sequence contains more than one matching element',
    );
  });
});
