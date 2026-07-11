import { describe, expect, it } from 'vitest';
import { AsyncEnumerable, from, of, select, take, toArray, where } from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('AsyncEnumerable', () => {
  it('should wrap a sync iterable', async () => {
    const result = await from([1, 2, 3]).pipe(toArray());

    expect(result).toEqual([1, 2, 3]);
  });

  it('should wrap an async iterable', async () => {
    const source = {
      async *[Symbol.asyncIterator](): AsyncGenerator<number> {
        await sleep(1);
        yield 1;
        await sleep(1);
        yield 2;
      },
    };

    const result = await from(source).pipe(toArray());

    expect(result).toEqual([1, 2]);
  });

  it('should allow creation from loose values', async () => {
    expect(await of(1, 2, 3).pipe(toArray())).toEqual([1, 2, 3]);
  });

  it('should be an AsyncEnumerable', () => {
    expect(from([1])).toBeInstanceOf(AsyncEnumerable);
  });

  it('should be iterable multiple times', async () => {
    const source = from([1, 2, 3]).pipe(select((x) => x + 1));

    expect(await source.pipe(toArray())).toEqual([2, 3, 4]);
    expect(await source.pipe(toArray())).toEqual([2, 3, 4]);
  });
});

describe('async where / select', () => {
  it('should filter and transform', async () => {
    const result = await from([1, 2, 3, 4]).pipe(
      where((x) => x % 2 === 0),
      select((x) => x * 10),
      toArray(),
    );

    expect(result).toEqual([20, 40]);
  });

  it('should accept async predicates and selectors', async () => {
    const result = await from([1, 2, 3]).pipe(
      where(async (x) => {
        await sleep(1);
        return x > 1;
      }),
      select(async (x) => {
        await sleep(1);
        return x * 2;
      }),
      toArray(),
    );

    expect(result).toEqual([4, 6]);
  });

  it('should provide the index to the selector', async () => {
    const result = await from(['a', 'b']).pipe(
      select((x, i) => `${i}:${x}`),
      toArray(),
    );

    expect(result).toEqual(['0:a', '1:b']);
  });
});

describe('async take', () => {
  it('should stop pulling after count items, closing an infinite source', async () => {
    let produced = 0;
    const naturals = from({
      async *[Symbol.asyncIterator](): AsyncGenerator<number> {
        let i = 0;
        while (true) {
          produced++;
          yield i++;
        }
      },
    });

    const result = await naturals.pipe(take(2), toArray());

    expect(result).toEqual([0, 1]);
    expect(produced).toBe(2);
  });
});
