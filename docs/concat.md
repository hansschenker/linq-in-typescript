# concat

> Yields the first sequence in full, then the second.

**Category:** lazy sequence operator (combination) · **.NET:** [`Concat`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.concat) · **RxJS:** `concatWith`

## Signature

```ts
function concat<T>(col: Iterable<T>): OperatorFunction<T, T>;
```

## Semantics

- Plain sequential append — **duplicates are kept** (use [union](./union.md) for set semantics).
- Accepts any iterable as the second sequence.
- **Fully streaming and deferred:** the second sequence isn't touched until the first is exhausted; the whole implementation is `yield* source; yield* col;`.

## Example

```ts
import { from, concat, toArray } from 'linq-in-typescript';

from([1, 2]).pipe(concat([2, 3]), toArray()); // [1, 2, 2, 3]
```

## See also

- [union](./union.md) — concat with dedup
- [zip](./zip.md) — interleaving instead of appending
- Tests: [`test/concat.test.ts`](../test/concat.test.ts)
