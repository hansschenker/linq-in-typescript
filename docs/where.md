# where

> Keeps the items that satisfy a predicate.

**Category:** lazy sequence operator · **Alias:** `filter` · **.NET:** [`Where`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.where) · **RxJS:** `filter`

## Signature

```ts
function where<T>(
  selector: (item: T, index: number) => boolean,
): OperatorFunction<T, T>;
```

## Semantics

- The predicate receives the **item and its index** (index counts source items seen, not items passed).
- **Streaming and deferred:** each item is tested only when the consumer pulls; filtering interleaves with downstream work item-by-item.
- Multiple `where` calls in one pipe compose as AND, each with its own index counter.

## Example

```ts
import { from, where, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(where((x) => x % 2 === 0), toArray()); // [2, 4]

from([1, 2, 3]).pipe(
  where((x) => x >= 2),
  where((x) => x === 2),
  toArray(),
); // [2]
```

## Teaching note

Combined with [take](./take.md) or [first](./first.md), `where` shows the core pull advantage: `from(million).pipe(where(p), take(5))` stops scanning after the fifth match, while `million.filter(p).slice(0, 5)` tests all million items and allocates the full filtered array first.

## See also

- [distinct](./distinct.md) — filtering by "not seen before"
- [takeWhile](./takeWhile.md) / [skipWhile](./skipWhile.md) — predicate-based partitioning
- Tests: [`test/where.test.ts`](../test/where.test.ts)
