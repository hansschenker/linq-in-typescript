# repeat

> Yields the same value `count` times.

**Category:** creation · **.NET:** [`Enumerable.Repeat`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.repeat) · **RxJS:** — (RxJS `repeat` is an operator that resubscribes; different concept)

## Signature

```ts
function repeat<T>(item: T, count = 0): Enumerable<T>;
```

## Semantics

- Yields the **same reference** each time — matching .NET. (The original `linq-in-javascript` JSON-cloned the value on every yield; the rewrite deliberately does not.)
- Streaming, deferred, re-iterable.

## Example

```ts
import { repeat, toArray } from 'linq-in-typescript';

repeat('a', 3).pipe(toArray()); // ['a', 'a', 'a']
```

Because the reference is shared, `repeat(someObject, 3)` yields the *same* object three times — mutate one, you've mutated "all".

## See also

- [range](./range.md)
- Tests: [`test/enumerable.test.ts`](../test/enumerable.test.ts)
