import { describe, expect, it } from 'vitest';
import { from, map, select, selectMany, toArray } from '../src/index.js';

describe('select', () => {
  it('should transform the items in the collection', () => {
    const arr = [1, 2, 3];
    const fn = (x: number): number => x + 1;

    const res = from(arr).pipe(select(fn));

    let pos = 0;
    for (const x of res) {
      expect(x).toBe(fn(arr[pos] as number));
      pos++;
    }
    expect(pos).toBe(3);
  });

  it('should process items in a lazy fashion', () => {
    const arr: Array<() => boolean> = [
      () => true,
      () => {
        throw new Error('the second item should never be evaluated');
      },
    ];

    const mapped = from(arr).pipe(select((x) => x()));

    let pos = 0;
    for (const item of mapped) {
      expect(item).toBe(true);
      pos++;
      break;
    }
    expect(pos).toBe(1);
  });

  it('should provide the index to the selector', () => {
    let pos = 0;
    const mapped = from([1, 2, 3]).pipe(
      select((_, i) => {
        expect(i).toBe(pos);
        pos++;
        return true;
      }),
    );

    [...mapped];
    expect(pos).toBe(3);
  });

  it('should return the same result through multiple passes', () => {
    const mapped = from([1, 2, 3]).pipe(select((x) => x + 1));

    const one = [...mapped];
    const two = [...mapped];

    expect(one).toEqual(two);
    expect(one).toEqual([2, 3, 4]);
  });
});

describe('map', () => {
  it('should be able to use map like select', () => {
    const arr = [1, 2, 3];
    const fn = (x: number): number => x + 1;

    const res = from(arr).pipe(map(fn));

    let pos = 0;
    for (const x of res) {
      expect(x).toBe(fn(arr[pos] as number));
      pos++;
    }
    expect(pos).toBe(3);
  });
});

describe('selectMany', () => {
  it('should collapse a simple nested array', () => {
    const results = from([[1], [2], [3]]).pipe(
      selectMany((x) => x),
      toArray(),
    );

    expect(results).toEqual([1, 2, 3]);
  });

  it('should collapse a simple nested array and transform to new objects', () => {
    const results = from([[1], [2], [3]]).pipe(
      selectMany(
        (x) => x,
        (y) => y * 2,
      ),
      toArray(),
    );

    expect(results).toEqual([2, 4, 6]);
  });

  it('should collapse an array containing enumerables', () => {
    const results = from([[1], [2], [3]]).pipe(
      selectMany((x) => from(x).pipe(select((y) => y + 1))),
      toArray(),
    );

    expect(results).toEqual([2, 3, 4]);
  });

  it('should collapse an array containing enumerables and transform to new objects', () => {
    const results = from([[1], [2], [3]]).pipe(
      selectMany(
        (x) => from(x).pipe(select((y) => y + 1)),
        (z) => z * 2,
      ),
      toArray(),
    );

    expect(results).toEqual([4, 6, 8]);
  });
});
