# orderByDescending

> Sorts the sequence descending by a selected key.

**Category:** lazy sequence operator (ordering) · **.NET:** [`OrderByDescending`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.orderbydescending) · **RxJS:** —

## Signature

```ts
function orderByDescending<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer?: (a: TKey, b: TKey) => number,
): UnaryFunction<Iterable<T>, OrderedEnumerable<T>>;
```

## Semantics

Identical to [orderBy](./orderBy.md) with the comparison reversed — implemented by swapping the comparer's arguments (`comparer(keyB, keyA)`), which keeps the sort **stable**: equal keys still preserve source order rather than being reversed.

Everything else (value-based default comparer, `OrderedEnumerable` return type, deferred-but-buffering profile, non-mutating, one sort per chain) is as documented on the [orderBy](./orderBy.md) page.

## Example

```ts
import { from, orderByDescending, thenBy, toArray } from 'linq-in-typescript';

from([1, 10, 2]).pipe(orderByDescending((x) => x), toArray()); // [10, 2, 1]

// oldest first, ties alphabetical
from(people).pipe(
  orderByDescending((p) => p.age),
  thenBy((p) => p.name),
  toArray(),
);
```

## See also

- [orderBy](./orderBy.md) · [thenByDescending](./thenByDescending.md)
- Tests: [`test/orderBy.test.ts`](../test/orderBy.test.ts)
