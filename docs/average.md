# average

> Returns the arithmetic mean of the sequence (optionally via a selector).

**Category:** terminal operator (aggregation) · **.NET:** [`Average`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.average) · **RxJS:** — (a `reduce` away)

## Signature

```ts
function average(): UnaryFunction<Iterable<number>, number>;
function average<T>(selector: (item: T) => number): UnaryFunction<Iterable<T>, number>;
```

## Semantics

- The no-argument overload is only accepted on `Iterable<number>` — averaging non-numbers without a selector is a **compile error**, not a runtime `NaN`.
- **Throws** `'Sequence contains no elements'` on an empty sequence (matching .NET) — an average of nothing is undefined, and `NaN` would poison downstream math silently.
- Consumes the entire sequence; single pass, O(1) memory (running total + count).

## Example

```ts
import { range, from, average } from 'linq-in-typescript';

range(0, 10).pipe(average());                 // 4.5
from(people).pipe(average((p) => p.age));     // mean age
```

## See also

- [aggregate](./aggregate.md) — the general fold `average` is a special case of
- [count](./count.md)
- Tests: [`test/average.test.ts`](../test/average.test.ts)
