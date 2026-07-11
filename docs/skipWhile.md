# skipWhile

> Discards items while the predicate holds; once it first fails, yields everything from there on.

**Category:** lazy sequence operator · **.NET:** [`SkipWhile`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.skipwhile) · **RxJS:** `skipWhile`

## Signature

```ts
function skipWhile<T>(
  fn: (item: T, index: number) => boolean,
): OperatorFunction<T, T>;
```

## Semantics

- The predicate is only consulted **until it first returns false** — after that, items pass through untested (unlike `where`, which tests every item).
- The item on which the predicate fails **is yielded** (it's the first item of the output).
- Streaming and deferred.

## Example

```ts
import { from, skipWhile, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(skipWhile((x) => x <= 2), toArray()); // [3, 4]
from([1, 2, 3, 1]).pipe(skipWhile((x) => x <= 2), toArray()); // [3, 1] — trailing 1 passes untested
```

## See also

- [skip](./skip.md) · [takeWhile](./takeWhile.md) · [where](./where.md)
- Tests: [`test/skip.test.ts`](../test/skip.test.ts)
