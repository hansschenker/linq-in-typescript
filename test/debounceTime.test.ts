import { describe, expect, it } from 'vitest';
import { debounceTime, from, take, toArray } from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function timed<T>(entries: ReadonlyArray<readonly [number, T]>): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
      for (const [delay, value] of entries) {
        await sleep(delay);
        yield value;
      }
    },
  };
}

describe('debounceTime', () => {
  it('should emit only values followed by silence', async () => {
    // 1, 2, 3 arrive rapidly; 3 survives its quiet window; 4 is flushed at completion
    const source = timed([
      [5, 1],
      [5, 2],
      [5, 3],
      [150, 4],
    ]);

    const result = await from(source).pipe(debounceTime(50), toArray());

    expect(result).toEqual([3, 4]);
  });

  it('should drop values superseded within the window', async () => {
    const source = timed([
      [5, 'a'],
      [5, 'b'],
      [5, 'c'],
    ]);

    const result = await from(source).pipe(debounceTime(50), toArray());

    expect(result).toEqual(['c']);
  });

  it('should flush the pending value when the source completes', async () => {
    const source = timed([[5, 42]]);

    const result = await from(source).pipe(debounceTime(10_000), toArray());

    expect(result).toEqual([42]); // no 10s wait — completion flushes immediately
  });

  it('should emit the last value of each quiet window', async () => {
    const source = timed([
      [5, 'a1'],
      [5, 'a2'],
      [150, 'b1'],
      [5, 'b2'],
      [150, 'c'],
    ]);

    const result = await from(source).pipe(debounceTime(50), toArray());

    expect(result).toEqual(['a2', 'b2', 'c']);
  });

  it('should yield nothing for an empty source', async () => {
    const result = await from(timed<number>([])).pipe(debounceTime(50), toArray());

    expect(result).toEqual([]);
  });

  it('should compose with take against an endless source', async () => {
    const endless = {
      async *[Symbol.asyncIterator](): AsyncGenerator<number> {
        let i = 0;
        while (true) {
          await sleep(5);
          yield i++;
          await sleep(150); // quiet window after each value
        }
      },
    };

    const result = await from(endless).pipe(debounceTime(50), take(2), toArray());

    expect(result).toEqual([0, 1]);
  });

  it('should propagate source errors', async () => {
    const failing = {
      async *[Symbol.asyncIterator](): AsyncGenerator<number> {
        yield 1;
        await sleep(5);
        throw new Error('source failed');
      },
    };

    await expect(from(failing).pipe(debounceTime(50), toArray())).rejects.toThrow(
      'source failed',
    );
  });

  it('should return the same result through multiple passes', async () => {
    const make = (): AsyncIterable<number> =>
      timed([
        [5, 1],
        [5, 2],
      ]);
    const source = from({
      [Symbol.asyncIterator]: (): AsyncIterator<number> =>
        make()[Symbol.asyncIterator](),
    });

    const piped = source.pipe(debounceTime(50));

    expect(await from(piped).pipe(toArray())).toEqual([2]);
    expect(await from(piped).pipe(toArray())).toEqual([2]);
  });
});
