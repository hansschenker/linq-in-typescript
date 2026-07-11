import { describe, expect, it } from 'vitest';
import { Enumerable, from, of, range, repeat, select, take, toArray } from '../src/index.js';

describe('Enumerable', () => {
  describe('creation', () => {
    it('should allow creation from an existing array', () => {
      const enumerable = from([1, 2, 3]);

      expect(enumerable).toBeInstanceOf(Enumerable);
    });

    it('should allow creation without a source', () => {
      const enumerable = new Enumerable();

      expect([...enumerable]).toEqual([]);
    });

    it('should allow creation from loose values', () => {
      expect(of(1, 2, 3).pipe(toArray())).toEqual([1, 2, 3]);
    });

    it('should be iterable multiple times', () => {
      const enumerable = from([1, 2, 3]);

      expect([...enumerable]).toEqual([...enumerable]);
    });
  });

  describe('range', () => {
    it('should return values within the range', () => {
      const values = range(1, 2);

      let expected = 1;
      for (const x of values) {
        expect(x).toBe(expected);
        expected++;
      }
      expect(expected).toBe(3);
    });

    it('should create a range of the expected length', () => {
      expect(range(1, 2).pipe(toArray())).toHaveLength(2);
    });

    it('should allow a select from a range', () => {
      const selected = range(0, 10).pipe(
        select((x) => x + 1),
        toArray(),
      );

      expect(selected).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should allow a take from a range', () => {
      const taken = range(0, 10).pipe(take(1), toArray());

      expect(taken).toEqual([0]);
    });
  });

  describe('repeat', () => {
    it('should create an enumerable of the expected length', () => {
      expect(repeat(1, 1).pipe(toArray())).toHaveLength(1);
    });

    it('should create an enumerable containing only the provided value', () => {
      expect(repeat('a', 3).pipe(toArray())).toEqual(['a', 'a', 'a']);
    });
  });

  describe('toArray', () => {
    it('should allow conversion back to an array', () => {
      const items = from([1, 2, 3]).pipe(toArray());

      expect(Array.isArray(items)).toBe(true);
      expect(items).toEqual([1, 2, 3]);
    });
  });
});
