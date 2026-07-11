# distinct

> Removes duplicates while streaming, keeping the first occurrence per key.

**Category:** lazy sequence operator · **.NET:** [`Distinct`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.distinct) / [`DistinctBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.distinctby) · **RxJS:** `distinct`

## Signature

```ts
function distinct<T, TKey = T>(
  keySelector?: (item: T) => TKey,
): OperatorFunction<T, T>;
```

## Semantics

- Without an argument, compares the values themselves; with a key selector, keeps the **first item per key** (.NET's `DistinctBy`).
- Equality is `Set`-based **SameValueZero**: `NaN` deduplicates (which `===` could not express), `+0`/`-0` are equal, objects compare by reference.
- **Streaming and deferred:** yields each first-seen item immediately; the "seen" set grows as the sequence is consumed. Works with infinite sequences as long as downstream stops pulling (e.g. via `take`).
- Output order = first-occurrence order.

## Example

```ts
import { from, distinct, toArray } from 'linq-in-typescript';

from([1, 2, 1, 3, 2]).pipe(distinct(), toArray()); // [1, 2, 3]

from(people).pipe(distinct((p) => p.age), toArray()); // first person per age
```

## Teaching note

Memory grows with the number of *distinct keys* seen, not with sequence length — the price of deduplication in a single pass. Beware the interaction with infinite sources: `distinct` only terminates early if downstream stops pulling; an infinite source with finitely many distinct values will spin forever once all values have been seen. (This exact mistake once froze this repo's own test suite.)

## See also

- [union](./union.md) / [intersect](./intersect.md) / [except](./except.md) — the set operators built on the same machinery
- Tests: [`test/distinct.test.ts`](../test/distinct.test.ts)
