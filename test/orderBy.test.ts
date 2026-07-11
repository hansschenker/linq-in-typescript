import { describe, expect, it } from 'vitest';
import {
  from,
  orderBy,
  orderByDescending,
  select,
  thenBy,
  thenByDescending,
  toArray,
} from '../src/index.js';

interface Person {
  name: string;
  age: number;
}

const people: Person[] = [
  { name: 'Cara', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Ben', age: 30 },
  { name: 'Dan', age: 25 },
];

describe('orderBy', () => {
  it('should sort by the selected key', () => {
    const sorted = from([3, 1, 2]).pipe(
      orderBy((x) => x),
      toArray(),
    );

    expect(sorted).toEqual([1, 2, 3]);
  });

  it('should compare numbers by value, not as strings', () => {
    const sorted = from([10, 2, 1]).pipe(
      orderBy((x) => x),
      toArray(),
    );

    expect(sorted).toEqual([1, 2, 10]);
  });

  it('should sort objects by the selected key', () => {
    const names = from(people).pipe(
      orderBy((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Ben', 'Cara', 'Dan']);
  });

  it('should allow a custom comparer', () => {
    const sorted = from(['b', 'A', 'C', 'a']).pipe(
      orderBy(
        (x) => x,
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      ),
      toArray(),
    );

    expect(sorted).toEqual(['A', 'a', 'b', 'C']);
  });

  it('should be a stable sort, preserving source order for equal keys', () => {
    const names = from(people).pipe(
      orderBy((p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Dan', 'Cara', 'Ben']);
  });

  it('should not mutate the source', () => {
    const source = [3, 1, 2];

    from(source).pipe(
      orderBy((x) => x),
      toArray(),
    );

    expect(source).toEqual([3, 1, 2]);
  });

  it('should defer sorting until iterated', () => {
    let consumed = false;
    const source = from({
      *[Symbol.iterator](): Generator<number> {
        consumed = true;
        yield 1;
      },
    });

    const sorted = source.pipe(orderBy((x) => x));

    expect(consumed).toBe(false);
    expect([...sorted]).toEqual([1]);
    expect(consumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const sorted = from([3, 1, 2]).pipe(orderBy((x) => x));

    expect([...sorted]).toEqual([...sorted]);
  });
});

describe('orderByDescending', () => {
  it('should sort by the selected key in descending order', () => {
    const sorted = from([1, 10, 2]).pipe(
      orderByDescending((x) => x),
      toArray(),
    );

    expect(sorted).toEqual([10, 2, 1]);
  });

  it('should remain stable for equal keys', () => {
    const names = from(people).pipe(
      orderByDescending((p) => p.age),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Cara', 'Ben', 'Alice', 'Dan']);
  });
});

describe('thenBy', () => {
  it('should break ties of the primary ordering', () => {
    const names = from(people).pipe(
      orderBy((p) => p.age),
      thenBy((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Alice', 'Dan', 'Ben', 'Cara']);
  });

  it('should compose with orderByDescending', () => {
    const names = from(people).pipe(
      orderByDescending((p) => p.age),
      thenBy((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Ben', 'Cara', 'Alice', 'Dan']);
  });

  it('should allow further tiebreakers', () => {
    const items = [
      { a: 1, b: 1, c: 2 },
      { a: 1, b: 1, c: 1 },
      { a: 0, b: 0, c: 0 },
    ];

    const sorted = from(items).pipe(
      orderBy((x) => x.a),
      thenBy((x) => x.b),
      thenBy((x) => x.c),
      toArray(),
    );

    expect(sorted).toEqual([
      { a: 0, b: 0, c: 0 },
      { a: 1, b: 1, c: 1 },
      { a: 1, b: 1, c: 2 },
    ]);
  });
});

describe('thenByDescending', () => {
  it('should break ties in descending order', () => {
    const names = from(people).pipe(
      orderBy((p) => p.age),
      thenByDescending((p) => p.name),
      select((p) => p.name),
      toArray(),
    );

    expect(names).toEqual(['Dan', 'Alice', 'Cara', 'Ben']);
  });
});
