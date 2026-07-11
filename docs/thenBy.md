# thenBy

> Adds an ascending tiebreaker to an ordered sequence.

**Category:** lazy sequence operator (ordering) · **.NET:** [`ThenBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.thenby) · **RxJS:** —

## Signature

```ts
function thenBy<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer?: (a: TKey, b: TKey) => number,
): UnaryFunction<OrderedEnumerable<T>, OrderedEnumerable<T>>;
```

## Semantics

- **Input must be an `OrderedEnumerable`** — what [orderBy](./orderBy.md)/[orderByDescending](./orderByDescending.md) return. Piping `thenBy` after anything else is a **compile error**, mirroring .NET's `IOrderedEnumerable` design in the type system.
- Applies only where the previous ordering considers items **equal**; it refines, never reorders, the primary sort.
- Does **not** sort again: it extends the parent's comparator with a tiebreak, so `orderBy → thenBy → thenBy` costs a single sort.
- Chainable: each `thenBy` returns another `OrderedEnumerable`.

## Example

```ts
import { from, orderBy, thenBy, toArray } from 'linq-in-typescript';

from(people).pipe(
  orderBy((p) => p.age),
  thenBy((p) => p.name),
  toArray(),
); // by age, ties alphabetical
```

## Teaching note

`thenBy` only works because `orderBy` is **stable**: a stable sort preserves any pre-existing order among equal keys, so composing comparators (primary, then tiebreak) is equivalent to sorting once by the combined key. With an unstable primary sort, no amount of tiebreaking could restore determinism.

## See also

- [thenByDescending](./thenByDescending.md) · [orderBy](./orderBy.md)
- Tests: [`test/orderBy.test.ts`](../test/orderBy.test.ts)
