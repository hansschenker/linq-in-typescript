import { describe, expect, it } from 'vitest';
import { from, skip, skipWhile, toArray } from '../src/index.js';

describe('skip', () => {
  it('should skip the number of items you request', () => {
    const taken = from([1, 2, 3]).pipe(skip(1), toArray());

    expect(taken).toHaveLength(2);
  });

  it('should only process the items that were not in the skip scope', () => {
    const arr: Array<() => number> = [
      () => {
        throw new Error('the skipped item should never be evaluated');
      },
      () => 1,
    ];

    const taken = from(arr).pipe(skip(1), toArray());

    expect(taken[0]?.()).toBe(1);
  });
});

describe('skipWhile', () => {
  it('should stop skipping as soon as the selector function returns false', () => {
    const taken = from([1, 2, 3, 4]).pipe(
      skipWhile((x) => x > 2),
      toArray(),
    );

    expect(taken).toHaveLength(4);
  });

  it('should skip items while the selector returns true', () => {
    const taken = from([1, 2, 3, 4]).pipe(
      skipWhile((x) => x <= 2),
      toArray(),
    );

    expect(taken).toEqual([3, 4]);
  });

  it('should receive the index during the selector function', () => {
    let index = 0;
    const taken = from([1, 2, 3, 4]).pipe(
      skipWhile((x, i) => {
        expect(i).toBe(index);
        index++;
        return x <= 2;
      }),
    );

    [...taken];
    expect(index).toBe(3);
  });
});
