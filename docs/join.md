# join

> Correlates two sequences on matching keys — an inner equi-join.

**Category:** lazy sequence operator (join) · **.NET:** [`Join`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.join) · **RxJS:** — (relational joins are pull-natural; RxJS has no equivalent)

## Signature

```ts
function join<TOuter, TInner, TKey, TResult>(
  inner: Iterable<TInner>,
  outerKeySelector: (item: TOuter) => TKey,
  innerKeySelector: (item: TInner) => TKey,
  resultSelector: (outerItem: TOuter, innerItem: TInner) => TResult,
): OperatorFunction<TOuter, TResult>;
```

## Semantics

- The **piped sequence is the outer side**; `inner` is the argument. One result per matching *pair* — an outer item with three matches produces three results.
- **Inner-join semantics:** outer items with no match and inner items with no match are dropped.
- Order: outer order first, inner order within each outer item (matching .NET).
- Key equality: SameValueZero.
- **Laziness profile:** deferred; on first pull the **inner** sequence is buffered into a `Map` lookup (a hash join), then the **outer streams** — an infinite outer sequence works under `take`.

## Example

```ts
import { from, join, toArray } from 'linq-in-typescript';

const people = [{ name: 'Hedlund' }, { name: 'Adams' }];
const pets = [
  { name: 'Barley', owner: 'Adams' },
  { name: 'Whiskers', owner: 'Hedlund' },
];

from(people).pipe(
  join(pets, (p) => p.name, (pet) => pet.owner,
    (person, pet) => `${person.name} owns ${pet.name}`),
  toArray(),
); // ['Hedlund owns Whiskers', 'Adams owns Barley']
```

## Teaching note

Put the *smaller* sequence on the inner side when you can — that's the one that gets buffered. The asymmetry (buffer one side, stream the other) is the same trade a database hash join makes, and choosing the build side is the same optimization.

## See also

- [groupJoin](./groupJoin.md) — keep unmatched outers, matches grouped
- [zip](./zip.md) — pairing by *position* instead of by key
- Tests: [`test/join.test.ts`](../test/join.test.ts)
