# intersect

> Distinct items of the first sequence that also appear in the second.

**Category:** lazy sequence operator (set) · **.NET:** [`Intersect`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.intersect) / [`IntersectBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.intersectby) · **RxJS:** —

## Signature

```ts
function intersect<T, TKey = T>(
  second: Iterable<T>,
  keySelector?: (item: T) => TKey,
): OperatorFunction<T, T>;
```

## Semantics

- **Set semantics: distinct output**, in **first-sequence order**; the yielded items come from the *first* sequence (relevant with a key selector).
- Equality: SameValueZero.
- **Laziness profile:** deferred; on first pull the **second** sequence is buffered into a `Set` of keys, then the first sequence **streams** — so an infinite first sequence works.

## Example

```ts
import { from, intersect, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(intersect([3, 1, 5]), toArray()); // [1, 3]
```

## Teaching note

The implementation's yield test is `candidates.delete(key)` — `Set.delete` returns `true` only the first time, so "present in second" and "not yielded yet" collapse into one operation and distinct output falls out for free. A tiny example of encoding an invariant in a data structure instead of in bookkeeping code.

## See also

- [union](./union.md) · [except](./except.md) · [distinct](./distinct.md)
- Tests: [`test/intersect.test.ts`](../test/intersect.test.ts)
