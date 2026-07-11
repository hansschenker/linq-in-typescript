# union

> All distinct items of both sequences — first sequence's items first.

**Category:** lazy sequence operator (set) · **.NET:** [`Union`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.union) / [`UnionBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.unionby) · **RxJS:** — (no set operators; `merge` + `distinct` approximates)

## Signature

```ts
function union<T, TKey = T>(
  second: Iterable<T>,
  keySelector?: (item: T) => TKey,
): OperatorFunction<T, T>;
```

## Semantics

- **Set semantics: the result is distinct** — duplicates are removed *within* each source as well as across them.
- Order: first-occurrence order — all new items of the first sequence, then items of the second not already seen.
- With a key selector, the first item per key wins (so ties between the sequences resolve to the first sequence's item).
- Equality: SameValueZero (see [distinct](./distinct.md)).
- **Fully streaming and deferred** — the only set operator that never buffers a whole sequence up front; the "seen" set grows as items flow.

## Example

```ts
import { from, union, toArray } from 'linq-in-typescript';

from([1, 2, 3]).pipe(union([2, 3, 4]), toArray()); // [1, 2, 3, 4]
from([1, 1, 2]).pipe(union([2, 2, 3]), toArray()); // [1, 2, 3]
```

## Teaching note

`union` = [concat](./concat.md) + [distinct](./distinct.md), literally: `pipe(concat(second), distinct(key))` is an equivalent implementation. It exists as its own operator because the fused form is clearer and matches .NET's vocabulary.

## See also

- [intersect](./intersect.md) · [except](./except.md) · [distinct](./distinct.md) · [concat](./concat.md)
- Tests: [`test/union.test.ts`](../test/union.test.ts)
