import { describe, expect, it } from 'vitest';
import { any, from } from '../src/index.js';

describe('any', () => {
  describe('return true', () => {
    it('should return true when no callback and the collection has items', () => {
      expect(from([1]).pipe(any())).toBe(true);
    });

    it('should return true when at least one item matches the selector', () => {
      expect(from([1, 2, 3]).pipe(any((x) => x >= 2))).toBe(true);
    });

    it('should return true when only one item matches the selector', () => {
      expect(from([1, 2, 1, 1]).pipe(any((x) => x !== 1))).toBe(true);
    });
  });

  describe('return false', () => {
    it('should return false when there are no items in the collection', () => {
      expect(from([]).pipe(any())).toBe(false);
    });

    it("should return false when there are no items even if there's a function", () => {
      expect(from<number>([]).pipe(any(() => true))).toBe(false);
    });

    it('should return false when no items match the selector', () => {
      expect(from([1, 2, 3]).pipe(any((x) => x > 4))).toBe(false);
    });
  });
});
