import { describe, expect, it } from 'vitest';
import {
  AsyncGrouping,
  count,
  from,
  groupBy,
  groupJoin,
  join,
  select,
  toArray,
} from '../src/async/index.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const people = [{ name: 'Hedlund' }, { name: 'Adams' }, { name: 'Weiss' }];
const pets = [
  { name: 'Barley', owner: 'Adams' },
  { name: 'Boots', owner: 'Adams' },
  { name: 'Whiskers', owner: 'Hedlund' },
];

describe('async groupBy', () => {
  it('should group by key in first-seen order', async () => {
    const groups = await from([1, 2, 3, 4, 5]).pipe(
      groupBy((x) => x % 2),
      select(async (g) => [g.key, await g.pipe(toArray())]),
      toArray(),
    );

    expect(groups).toEqual([
      [1, [1, 3, 5]],
      [0, [2, 4]],
    ]);
  });

  it('should yield AsyncGrouping instances that are pipeable', async () => {
    const sizes = await from([1, 2, 3]).pipe(
      groupBy((x) => x % 2),
      select(async (g) => {
        expect(g).toBeInstanceOf(AsyncGrouping);
        return g.pipe(count());
      }),
      toArray(),
    );

    expect(sizes).toEqual([2, 1]);
  });

  it('should allow async key and element selectors', async () => {
    const groups = await from(['one', 'two', 'three']).pipe(
      groupBy(
        async (w) => {
          await sleep(1);
          return w.length;
        },
        async (w) => w.toUpperCase(),
      ),
      select(async (g) => [g.key, await g.pipe(toArray())]),
      toArray(),
    );

    expect(groups).toEqual([
      [3, ['ONE', 'TWO']],
      [5, ['THREE']],
    ]);
  });
});

describe('async join', () => {
  it('should pair matching outer and inner items', async () => {
    const result = await from(people).pipe(
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
    ]);
  });

  it('should accept async key selectors', async () => {
    const result = await from([1, 2]).pipe(
      join(
        [1, 2],
        async (x) => {
          await sleep(1);
          return x;
        },
        (x) => x,
        (a, b) => a + b,
      ),
      toArray(),
    );

    expect(result).toEqual([2, 4]);
  });
});

describe('async groupJoin', () => {
  it('should keep unmatched outer items with an empty group', async () => {
    const petCounts = await from(people).pipe(
      groupJoin(
        pets,
        (person) => person.name,
        (pet) => pet.owner,
        async (person, owned) => [person.name, await owned.pipe(count())],
      ),
      toArray(),
    );

    expect(petCounts).toEqual([
      ['Hedlund', 1],
      ['Adams', 2],
      ['Weiss', 0],
    ]);
  });
});
