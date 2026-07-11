# count

> Returns the number of items (matching the optional predicate).

**Category:** terminal operator (aggregation) · **.NET:** [`Count`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.count) · **RxJS:** `count`

## Signature

```ts
function count<T>(fn?: (item: T) => boolean): UnaryFunction<Iterable<T>, number>;
```

## Semantics

- Consumes the **entire sequence** — never call on an infinite one.
- With a predicate, counts only matching items: `count(p)` ≡ `where(p) → count()`.
- For "are there any?", use [any](./any.md) instead — it stops at one.

## Example

```ts
import { from, count, where } from 'linq-in-typescript';

from([1, 2, 3]).pipe(count());                    // 3
from([1, 2, 3]).pipe(count((x) => x % 2 === 0)); // 1
from([1, 2, 3]).pipe(where((x) => x > 1), count()); // 2
```

## See also

- [any](./any.md) · [average](./average.md) · [aggregate](./aggregate.md)
- Tests: [`test/count.test.ts`](../test/count.test.ts)
