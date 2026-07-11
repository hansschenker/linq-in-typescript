# zip

> Pairs two sequences element-by-element, stopping at the shorter one.

**Category:** lazy sequence operator (combination) · **.NET:** [`Zip`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.zip) · **RxJS:** `zipWith`

## Signature

```ts
function zip<T, TSecond>(second: Iterable<TSecond>): OperatorFunction<T, [T, TSecond]>;

function zip<T, TSecond, TResult>(
  second: Iterable<TSecond>,
  resultSelector: (first: T, second: TSecond) => TResult,
): OperatorFunction<T, TResult>;
```

## Semantics

- Without a result selector, yields **typed tuples** `[T, TSecond]`; with one, yields projected values.
- Stops at the end of the **shorter** sequence; the longer side's surplus is never pulled.
- **Fully streaming and deferred, O(1) memory:** one value is pulled from each side per output — nothing is ever buffered. Works with an infinite side.
- Cleans up properly: early exit (`take`, `break`) closes both iterators (`try/finally` + `iterator.return`).

## Example

```ts
import { from, range, zip, toArray } from 'linq-in-typescript';

from(['a', 'b', 'c']).pipe(zip(range(0, 3)), toArray());
// [['a', 0], ['b', 1], ['c', 2]]

from([1, 2]).pipe(zip(['a', 'b'], (n, s) => s + n), toArray()); // ['a1', 'b2']
```

## Teaching note

This is the operator where pull and push diverge most instructively — pull-zip aligns values for free while push-zip must buffer per source and detect completion in two places. The full line-by-line comparison with RxJS's implementation is in [js-zip-vs-rxjs-zip.md](../js-zip-vs-rxjs-zip.md).

## See also

- [join](./join.md) — pairing by key instead of by position
- [concat](./concat.md)
- Tests: [`test/zip.test.ts`](../test/zip.test.ts)
