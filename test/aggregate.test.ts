import { describe, expect, it } from 'vitest';
import { aggregate, from, range } from '../src/index.js';

describe('aggregate', () => {
  it('should aggregate a collection and return the final value', () => {
    const result = range(0, 10).pipe(aggregate((curr, next) => curr + next));

    expect(result).toBe(45);
  });

  it('should allow a seed value for the aggregation', () => {
    const result = range(0, 10).pipe(aggregate(1, (curr, next) => curr + next));

    expect(result).toBe(46);
  });

  it('should have a results selector', () => {
    const result = from(['apple', 'mango', 'orange', 'passionfruit', 'grape']).pipe(
      aggregate(
        'banana',
        (longest, next) => (next.length > longest.length ? next : longest),
        (fruit) => fruit.toUpperCase(),
      ),
    );

    expect(result).toBe('PASSIONFRUIT');
  });

  it('should be able to use a result selector without a seed', () => {
    const result = from(['apple', 'mango', 'orange', 'passionfruit', 'grape']).pipe(
      aggregate(
        (longest, next) => (next.length > longest.length ? next : longest),
        (fruit) => fruit.toUpperCase(),
      ),
    );

    expect(result).toBe('PASSIONFRUIT');
  });

  it('should throw for an unseeded aggregation of an empty sequence', () => {
    expect(() => from<number>([]).pipe(aggregate((curr, next) => curr + next))).toThrow(
      'Sequence contains no elements',
    );
  });
});
