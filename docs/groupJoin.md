# groupJoin

> One result per outer item, paired with the (possibly empty) group of all its matches.

**Category:** lazy sequence operator (join) · **.NET:** [`GroupJoin`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.groupjoin) · **RxJS:** —

## Signature

```ts
function groupJoin<TOuter, TInner, TKey, TResult>(
  inner: Iterable<TInner>,
  outerKeySelector: (item: TOuter) => TKey,
  innerKeySelector: (item: TInner) => TKey,
  resultSelector: (outerItem: TOuter, innerItems: Enumerable<TInner>) => TResult,
): OperatorFunction<TOuter, TResult>;
```

## Semantics

- Exactly **one result per outer item**, always — the result selector receives the outer item plus a **pipeable `Enumerable`** of all inners with a matching key.
- **Outer items with no matches are kept**, paired with an empty enumerable. This is what makes `groupJoin` the **left-outer-join building block** (where [join](./join.md) drops them).
- Order: outer order; matches in inner order. Key equality: SameValueZero.
- **Laziness profile:** like `join` — inner buffered into a lookup on first pull, outer streamed.

## Example

```ts
import { from, groupJoin, count, toArray } from 'linq-in-typescript';

from(people).pipe(
  groupJoin(pets, (p) => p.name, (pet) => pet.owner,
    (person, owned) => [person.name, owned.pipe(count())]),
  toArray(),
); // [['Hedlund', 1], ['Adams', 2], ['Weiss', 0]]  ← Weiss kept, with 0
```

A classic left outer join with a default for the empty case is `groupJoin` + [selectMany](./selectMany.md) over the group (flattening each group, substituting a placeholder when empty).

## See also

- [join](./join.md) · [groupBy](./groupBy.md)
- Tests: [`test/groupJoin.test.ts`](../test/groupJoin.test.ts)
