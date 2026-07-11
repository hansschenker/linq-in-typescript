import { describe, expect, it } from 'vitest';
import {
  concat,
  distinct,
  except,
  from,
  intersect,
  range,
  repeat,
  selectMany,
  skip,
  skipWhile,
  takeWhile,
  toArray,
  union,
  zip,
} from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('async creation', () => {
  it('range should generate a numeric sequence', async () => {
    expect(await range(1, 3).pipe(toArray())).toEqual([1, 2, 3]);
  });

  it('repeat should repeat a value', async () => {
    expect(await repeat('a', 2).pipe(toArray())).toEqual(['a', 'a']);
  });
});

describe('async selectMany', () => {
  it('should flatten nested collections', async () => {
    const result = await from([[1], [2, 3]]).pipe(
      selectMany((x) => x),
      toArray(),
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it('should accept an async collection selector returning an async iterable', async () => {
    const result = await from([1, 2]).pipe(
      selectMany(async (x) => {
        await sleep(1);
        return from([x, x * 10]);
      }),
      toArray(),
    );

    expect(result).toEqual([1, 10, 2, 20]);
  });

  it('should apply the result selector to each flattened element', async () => {
    const result = await from([[1], [2]]).pipe(
      selectMany(
        (x) => x,
        (y) => y * 2,
      ),
      toArray(),
    );

    expect(result).toEqual([2, 4]);
  });
});

describe('async concat', () => {
  it('should append a sync iterable', async () => {
    expect(await from([1, 2]).pipe(concat([3]), toArray())).toEqual([1, 2, 3]);
  });

  it('should append an async iterable', async () => {
    expect(await from([1]).pipe(concat(range(2, 2)), toArray())).toEqual([1, 2, 3]);
  });
});

describe('async zip', () => {
  it('should pair sequences as tuples', async () => {
    const result = await from([1, 2, 3]).pipe(zip(['a', 'b', 'c']), toArray());

    expect(result).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  it('should stop at the shorter sequence', async () => {
    expect(await from([1, 2, 3]).pipe(zip(['a']), toArray())).toEqual([[1, 'a']]);
  });

  it('should allow an async result selector', async () => {
    const result = await from([1, 2]).pipe(
      zip(['a', 'b'], async (n, s) => {
        await sleep(1);
        return s + n;
      }),
      toArray(),
    );

    expect(result).toEqual(['a1', 'b2']);
  });
});

describe('async partitioning', () => {
  it('takeWhile should stop when the predicate fails', async () => {
    const result = await from([1, 2, 3, 4]).pipe(
      takeWhile((x) => x <= 2),
      toArray(),
    );

    expect(result).toEqual([1, 2]);
  });

  it('skip should discard the first n items', async () => {
    expect(await from([1, 2, 3]).pipe(skip(1), toArray())).toEqual([2, 3]);
  });

  it('skipWhile should skip until the predicate first fails', async () => {
    const result = await from([1, 2, 3, 1]).pipe(
      skipWhile(async (x) => {
        await sleep(1);
        return x <= 2;
      }),
      toArray(),
    );

    expect(result).toEqual([3, 1]);
  });
});

describe('async set operators', () => {
  it('distinct should remove duplicates, keeping first occurrence', async () => {
    expect(await from([1, 2, 1, 3]).pipe(distinct(), toArray())).toEqual([1, 2, 3]);
  });

  it('distinct should allow an async key selector', async () => {
    const result = await from([{ id: 1 }, { id: 1 }, { id: 2 }]).pipe(
      distinct(async (x) => {
        await sleep(1);
        return x.id;
      }),
      toArray(),
    );

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('union should combine without duplicates', async () => {
    expect(await from([1, 2]).pipe(union([2, 3]), toArray())).toEqual([1, 2, 3]);
  });

  it('intersect should keep common elements in first-sequence order', async () => {
    expect(await from([1, 2, 3, 4]).pipe(intersect([3, 1, 5]), toArray())).toEqual([1, 3]);
  });

  it('except should remove elements present in the second sequence, distinctly', async () => {
    expect(await from([1, 1, 2, 3]).pipe(except([3]), toArray())).toEqual([1, 2]);
  });

  it('set operators should accept async second sequences', async () => {
    expect(await from([1, 2, 3]).pipe(except(range(2, 2)), toArray())).toEqual([1]);
  });
});
