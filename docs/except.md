# except

> Distinct items of the first sequence that do **not** appear in the second.

**Category:** lazy sequence operator (set) · **.NET:** [`Except`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.except) / [`ExceptBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.exceptby) · **RxJS:** —

## Signature

```ts
function except<T, TKey = T>(
  second: Iterable<T>,
  keySelector?: (item: T) => TKey,
): OperatorFunction<T, T>;
```

## Semantics

- **Set semantics: distinct output** — `[1, 1, 2].pipe(except([3]))` yields `[1, 2]`, not `[1, 1, 2]`. This is the .NET behavior that most often surprises people; `except` is *not* just a filter.
- Order: first-sequence order. Equality: SameValueZero.
- **Laziness profile:** deferred; buffers the **second** sequence's keys into a `Set` on first pull, then **streams** the first. Yielded keys are added to the exclusion set — that's what makes the output distinct.

## Example

```ts
import { from, except, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(except([2, 4]), toArray()); // [1, 3]

// set difference by key: people not in the retired list, by age
from(people).pipe(except(retired, (p) => p.age), toArray());
```

## See also

- [union](./union.md) · [intersect](./intersect.md) · [where](./where.md) (plain filtering, no dedup)
- Tests: [`test/except.test.ts`](../test/except.test.ts)
