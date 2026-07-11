import { describe, expect, it } from 'vitest';
import { filter, from, where } from '../src/index.js';

describe('where', () => {
  it('should handle simple lambda filters', () => {
    const arr = [1, 2, 3];
    const filtered = from(arr).pipe(where(() => true));

    let pos = 0;
    for (const item of filtered) {
      expect(item).toBe(arr[pos]);
      pos++;
    }
    expect(pos).toBe(3);
  });

  it('should filter based on the provided lambda', () => {
    const filtered = from([1, 2, 3]).pipe(where((x) => x === 2));

    let pos = 0;
    for (const item of filtered) {
      expect(item).toBe(2);
      pos++;
    }
    expect(pos).toBe(1);
  });

  it('should allow multiple filters', () => {
    const filtered = from([1, 2, 3]).pipe(
      where((x) => x >= 2),
      where((x) => x === 2),
    );

    let pos = 0;
    for (const item of filtered) {
      expect(item).toBe(2);
      pos++;
    }
    expect(pos).toBe(1);
  });

  it('should process items in a lazy fashion', () => {
    const arr: Array<() => boolean> = [
      () => true,
      () => {
        throw new Error('the second item should never be evaluated');
      },
    ];

    const filtered = from(arr).pipe(where((x) => x()));

    let pos = 0;
    for (const item of filtered) {
      expect(item).toBe(arr[pos]);
      pos++;
      break;
    }
    expect(pos).toBe(1);
  });

  it('should provide the index to the selector', () => {
    let pos = 0;
    const filtered = from([1, 2, 3]).pipe(
      where((_, i) => {
        expect(i).toBe(pos);
        pos++;
        return true;
      }),
    );

    [...filtered];
    expect(pos).toBe(3);
  });
});

describe('filter', () => {
  it('should be able to use filter like where', () => {
    const arr = [1, 2, 3];
    const filtered = from(arr).pipe(filter(() => true));

    let pos = 0;
    for (const item of filtered) {
      expect(item).toBe(arr[pos]);
      pos++;
    }
    expect(pos).toBe(3);
  });
});
