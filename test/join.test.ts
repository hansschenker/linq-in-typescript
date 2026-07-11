import { describe, expect, it } from 'vitest';
import { from, join, take, toArray } from '../src/index.js';

interface Person {
  name: string;
}

interface Pet {
  name: string;
  owner: string;
}

const people: Person[] = [{ name: 'Hedlund' }, { name: 'Adams' }, { name: 'Weiss' }];

const pets: Pet[] = [
  { name: 'Barley', owner: 'Adams' },
  { name: 'Boots', owner: 'Adams' },
  { name: 'Whiskers', owner: 'Hedlund' },
  { name: 'Daisy', owner: 'Weiss' },
];

describe('join', () => {
  it('should pair outer and inner items with matching keys', () => {
    const result = from(people).pipe(
      join(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        (person, pet) => `${person.name} owns ${pet.name}`,
      ),
      toArray(),
    );

    expect(result).toEqual([
      'Hedlund owns Whiskers',
      'Adams owns Barley',
      'Adams owns Boots',
      'Weiss owns Daisy',
    ]);
  });

  it('should exclude unmatched items from both sides (inner join semantics)', () => {
    const owners = [{ name: 'Adams' }, { name: 'NoPets' }];
    const animals = [
      { name: 'Barley', owner: 'Adams' },
      { name: 'Stray', owner: 'Nobody' },
    ];

    const result = from(owners).pipe(
      join(
        animals,
        (person) => person.name,
        (pet) => pet.owner,
        (person, pet) => [person.name, pet.name],
      ),
      toArray(),
    );

    expect(result).toEqual([['Adams', 'Barley']]);
  });

  it('should preserve outer order, then inner order within each match', () => {
    const result = from([2, 1]).pipe(
      join(
        [
          { k: 1, v: 'a' },
          { k: 2, v: 'b' },
          { k: 1, v: 'c' },
        ],
        (n) => n,
        (x) => x.k,
        (n, x) => `${n}${x.v}`,
      ),
      toArray(),
    );

    expect(result).toEqual(['2b', '1a', '1c']);
  });

  it('should stream the outer sequence lazily', () => {
    const naturals = from({
      *[Symbol.iterator](): Generator<number> {
        let i = 0;
        while (true) {
          yield i++;
        }
      },
    });

    const result = naturals.pipe(
      join(
        [0, 1],
        (n) => n % 2,
        (x) => x,
        (n, x) => [n, x],
      ),
      take(3),
      toArray(),
    );

    expect(result).toEqual([
      [0, 0],
      [1, 1],
      [2, 0],
    ]);
  });

  it('should defer consuming both sequences until iterated', () => {
    let outerConsumed = false;
    let innerConsumed = false;
    const outer = from({
      *[Symbol.iterator](): Generator<number> {
        outerConsumed = true;
        yield 1;
      },
    });
    const inner = {
      *[Symbol.iterator](): Generator<number> {
        innerConsumed = true;
        yield 1;
      },
    };

    const joined = outer.pipe(
      join(
        inner,
        (x) => x,
        (x) => x,
        (a, b) => [a, b],
      ),
    );

    expect(outerConsumed).toBe(false);
    expect(innerConsumed).toBe(false);
    expect([...joined]).toEqual([[1, 1]]);
    expect(outerConsumed).toBe(true);
    expect(innerConsumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const joined = from([1, 2]).pipe(
      join(
        [1, 2],
        (x) => x,
        (x) => x,
        (a, b) => a + b,
      ),
    );

    expect([...joined]).toEqual([...joined]);
  });
});
