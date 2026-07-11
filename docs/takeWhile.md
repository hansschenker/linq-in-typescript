# takeWhile

> Yields items until the predicate first returns false, then stops.

**Category:** lazy sequence operator · **.NET:** [`TakeWhile`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.takewhile) · **RxJS:** `takeWhile`

## Signature

```ts
function takeWhile<T>(
  fn: (item: T, index: number) => boolean,
): OperatorFunction<T, T>;
```

## Semantics

- Tests each item; yields it while the predicate holds. The **first failing item is consumed but not yielded**, and iteration ends there — items after it are never pulled.
- Not a filter: `[1, 2, 3, 1].pipe(takeWhile(x => x < 3))` yields `[1, 2]` — the trailing `1` is never reached.
- Streaming, deferred, upstream-cancelling on the first failure.

## Example

```ts
import { from, takeWhile, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(takeWhile((x) => x <= 2), toArray()); // [1, 2]
from([3, 1, 2]).pipe(takeWhile((x) => x <= 2), toArray());    // [] — first item already fails
```

## See also

- [take](./take.md) · [skipWhile](./skipWhile.md) · [where](./where.md) (filters the whole sequence instead of stopping)
- Tests: [`test/take.test.ts`](../test/take.test.ts)
