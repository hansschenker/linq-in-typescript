# thenByDescending

> Adds a descending tiebreaker to an ordered sequence.

**Category:** lazy sequence operator (ordering) · **.NET:** [`ThenByDescending`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.thenbydescending) · **RxJS:** —

## Signature

```ts
function thenByDescending<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer?: (a: TKey, b: TKey) => number,
): UnaryFunction<OrderedEnumerable<T>, OrderedEnumerable<T>>;
```

## Semantics

[thenBy](./thenBy.md) with the tiebreak comparison reversed. Same constraints and costs: input must be an `OrderedEnumerable`, refines only among equal primary keys, no additional sort.

## Example

```ts
import { from, orderBy, thenByDescending, toArray } from 'linq-in-typescript';

from(people).pipe(
  orderBy((p) => p.age),
  thenByDescending((p) => p.name),
  toArray(),
); // by age, ties reverse-alphabetical
```

## See also

- [thenBy](./thenBy.md) · [orderByDescending](./orderByDescending.md)
- Tests: [`test/orderBy.test.ts`](../test/orderBy.test.ts)
