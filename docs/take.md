# take

> Yields the first `count` items, then stops pulling.

**Category:** lazy sequence operator · **.NET:** [`Take`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.take) · **RxJS:** `take`

## Signature

```ts
function take<T>(count = 0): OperatorFunction<T, T>;
```

## Semantics

- Yields at most `count` items; `take(0)` (or a negative count) yields nothing without touching the source.
- **Streaming, deferred, and upstream-cancelling:** after the nth item, `take` returns — which closes the upstream iterators, so no further source work happens. This is the operator that makes infinite sequences consumable.

## Example

```ts
import { range, take, toArray } from 'linq-in-typescript';

range(0, 1_000_000).pipe(take(3), toArray()); // [0, 1, 2] — three numbers computed, not a million
```

## Teaching note

`take` is where pull-based early exit becomes visible: everything upstream of `take(n)` does exactly as much work as n outputs require. In push-world, `take` must instead *unsubscribe* — actively telling the producer to stop — because the producer, not the consumer, drives.

## See also

- [takeWhile](./takeWhile.md) — predicate-bounded instead of count-bounded
- [skip](./skip.md) — the complement
- Tests: [`test/take.test.ts`](../test/take.test.ts)
