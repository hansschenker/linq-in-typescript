# skip

> Discards the first `count` items, yields the rest.

**Category:** lazy sequence operator · **.NET:** [`Skip`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.skip) · **RxJS:** `skip`

## Signature

```ts
function skip<T>(count = 0): OperatorFunction<T, T>;
```

## Semantics

- The first `count` items are pulled from the source (they must be produced) but not yielded; everything after streams through.
- Streaming and deferred. `skip(0)` passes everything through.

## Example

```ts
import { from, skip, toArray } from 'linq-in-typescript';

from([1, 2, 3]).pipe(skip(1), toArray()); // [2, 3]
```

Combined with [take](./take.md), this is lazy pagination:

```ts
source.pipe(skip(page * pageSize), take(pageSize), toArray());
```

## See also

- [skipWhile](./skipWhile.md) · [take](./take.md)
- Tests: [`test/skip.test.ts`](../test/skip.test.ts)
