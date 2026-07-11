import { describe, expect, it } from 'vitest';
import { all, from } from '../src/index.js';

describe('all', () => {
  it('should return true only if all values in the enumerable are true', () => {
    const result = from([true, true]).pipe(all((x) => x));

    expect(result).toBe(true);
  });

  it('should return false if not all values return true', () => {
    const result = from([true, false, true]).pipe(all((x) => x));

    expect(result).toBe(false);
  });
});
