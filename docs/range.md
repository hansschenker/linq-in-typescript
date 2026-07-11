# range

> Generates a sequence of `count` integers starting at `start`.

**Category:** creation · **.NET:** [`Enumerable.Range`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.range) · **RxJS:** `range`

## Signature

```ts
function range(start = 0, count = 0): Enumerable<number>;
```

## Semantics

- Yields `start, start + 1, …, start + count - 1` — note the second argument is a **count**, not an end value (matching .NET).
- **Streaming and deferred:** values are computed one at a time as pulled; `range(0, 1_000_000).pipe(take(3))` computes three numbers.
- **Re-iterable:** unlike the original `linq-in-javascript` (which mutated its start counter and was one-shot), each iteration starts fresh.

## Example

```ts
import { range, where, all, toArray } from 'linq-in-typescript';

range(1, 5).pipe(toArray()); // [1, 2, 3, 4, 5]

// primes via a nested query
range(3, 10).pipe(
  where((n) => range(2, Math.floor(Math.sqrt(n))).pipe(all((i) => n % i > 0))),
  toArray(),
); // [3, 5, 7, 11]
```

## See also

- [repeat](./repeat.md) — the other numeric generator
- Tests: [`test/enumerable.test.ts`](../test/enumerable.test.ts), [`test/api-usages.test.ts`](../test/api-usages.test.ts)
