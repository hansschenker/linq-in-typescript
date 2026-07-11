import { describe, expect, it } from 'vitest';
import { from, take, takeWhile, toArray } from '../src/index.js';

describe('take', () => {
  it('should give you only the number of items you request', () => {
    const taken = from([1, 2, 3]).pipe(take(1), toArray());

    expect(taken).toHaveLength(1);
  });

  it('should only process the items that were in the take scope', () => {
    const arr: Array<() => number> = [
      () => 1,
      () => {
        throw new Error('the second item should never be evaluated');
      },
    ];

    const taken = from(arr).pipe(take(1), toArray());

    expect(taken).toHaveLength(1);
    expect(taken[0]?.()).toBe(1);
  });
});

describe('takeWhile', () => {
  it('should stop when the selector function returns false', () => {
    const taken = from([1, 2, 3, 4]).pipe(
      takeWhile((x) => x > 2),
      toArray(),
    );

    expect(taken).toHaveLength(0);
  });

  it('should return items while the selector returns true', () => {
    const taken = from([1, 2, 3, 4]).pipe(
      takeWhile((x) => x <= 2),
      toArray(),
    );

    expect(taken).toEqual([1, 2]);
  });

  it('should receive the index during the selector function', () => {
    let index = 0;
    const taken = from([1, 2, 3, 4]).pipe(
      takeWhile((x, i) => {
        expect(i).toBe(index);
        index++;
        return x <= 2;
      }),
    );

    [...taken];
    expect(index).toBe(3);
  });
});
