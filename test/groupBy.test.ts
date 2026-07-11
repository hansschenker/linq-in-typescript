import { describe, expect, it } from 'vitest';
import { count, from, groupBy, select, toArray } from '../src/index.js';

describe('groupBy', () => {
  it('should group items by the selected key', () => {
    const groups = from([1, 2, 3, 4, 5]).pipe(
      groupBy((x) => x % 2),
      select((g) => [g.key, [...g]]),
      toArray(),
    );

    expect(groups).toEqual([
      [1, [1, 3, 5]],
      [0, [2, 4]],
    ]);
  });

  it('should yield groups in first-seen key order', () => {
    const keys = from(['banana', 'apple', 'blueberry', 'avocado']).pipe(
      groupBy((word) => word[0]),
      select((g) => g.key),
      toArray(),
    );

    expect(keys).toEqual(['b', 'a']);
  });

  it('should allow an element selector to project the grouped values', () => {
    const groups = from(['one', 'two', 'three', 'four']).pipe(
      groupBy(
        (word) => word.length,
        (word) => word.toUpperCase(),
      ),
      select((g) => [g.key, [...g]]),
      toArray(),
    );

    expect(groups).toEqual([
      [3, ['ONE', 'TWO']],
      [5, ['THREE']],
      [4, ['FOUR']],
    ]);
  });

  it('should produce groups that are pipeable enumerables', () => {
    const sizes = from([1, 2, 3, 4, 5]).pipe(
      groupBy((x) => x % 2),
      select((g) => g.pipe(count())),
      toArray(),
    );

    expect(sizes).toEqual([3, 2]);
  });

  it('should provide the index to the selectors', () => {
    const groups = from([10, 11, 12, 13]).pipe(
      groupBy(
        (_, i) => i % 2,
        (x, i) => [x, i] as const,
      ),
      select((g) => [g.key, [...g]]),
      toArray(),
    );

    expect(groups).toEqual([
      [
        0,
        [
          [10, 0],
          [12, 2],
        ],
      ],
      [
        1,
        [
          [11, 1],
          [13, 3],
        ],
      ],
    ]);
  });

  it('should defer enumerating the source until the groups are iterated', () => {
    let consumed = false;
    const source = from({
      *[Symbol.iterator](): Generator<number> {
        consumed = true;
        yield 1;
      },
    });

    const grouped = source.pipe(groupBy((x) => x));

    expect(consumed).toBe(false);
    expect([...grouped]).toHaveLength(1);
    expect(consumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const grouped = from([1, 2, 3, 4]).pipe(groupBy((x) => x % 2));

    const one = [...grouped].map((g) => [g.key, [...g]]);
    const two = [...grouped].map((g) => [g.key, [...g]]);

    expect(one).toEqual(two);
  });
});
