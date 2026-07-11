import { describe, expect, it } from 'vitest';
import { count, from, groupJoin, select, toArray } from '../src/index.js';

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
];

describe('groupJoin', () => {
  it('should yield one result per outer item with all its matches', () => {
    const result = from(people).pipe(
      groupJoin(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        (person, ownedPets) => `${person.name}: ${[...ownedPets].map((p) => p.name).join(', ')}`,
      ),
      toArray(),
    );

    expect(result).toEqual(['Hedlund: Whiskers', 'Adams: Barley, Boots', 'Weiss: ']);
  });

  it('should include outer items with no matches, paired with an empty group (left join shape)', () => {
    const petCounts = from(people).pipe(
      groupJoin(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        (person, ownedPets) => [person.name, ownedPets.pipe(count())],
      ),
      toArray(),
    );

    expect(petCounts).toEqual([
      ['Hedlund', 1],
      ['Adams', 2],
      ['Weiss', 0],
    ]);
  });

  it('should provide groups that are pipeable enumerables', () => {
    const names = from(people).pipe(
      groupJoin(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        (_, ownedPets) =>
          ownedPets.pipe(
            select((p) => p.name),
            toArray(),
          ),
      ),
      toArray(),
    );

    expect(names).toEqual([['Whiskers'], ['Barley', 'Boots'], []]);
  });

  it('should preserve outer order', () => {
    const keys = from(people).pipe(
      groupJoin(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        (person) => person.name,
      ),
      toArray(),
    );

    expect(keys).toEqual(['Hedlund', 'Adams', 'Weiss']);
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
      groupJoin(
        inner,
        (x) => x,
        (x) => x,
        (x, matches) => [x, [...matches]],
      ),
    );

    expect(outerConsumed).toBe(false);
    expect(innerConsumed).toBe(false);
    expect([...joined]).toEqual([[1, [1]]]);
    expect(outerConsumed).toBe(true);
    expect(innerConsumed).toBe(true);
  });

  it('should return the same result through multiple passes', () => {
    const joined = from([1, 2]).pipe(
      groupJoin(
        [1, 1, 2],
        (x) => x,
        (x) => x,
        (x, matches) => [x, [...matches]],
      ),
    );

    expect([...joined]).toEqual([...joined]);
  });
});
