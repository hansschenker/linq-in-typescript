# select

> Transforms each item with a selector function.

**Category:** lazy sequence operator · **Alias:** `map` · **.NET:** [`Select`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.select) · **RxJS:** `map`

## Signature

```ts
function select<T, TResult>(
  fn: (item: T, index: number) => TResult,
): OperatorFunction<T, TResult>;
```

## Semantics

- The selector receives the **item and its index** in the source.
- **Streaming and deferred:** each item is transformed only when pulled — an item that is never pulled is never transformed.
- Re-iterable: a second pass re-runs the selector (the pipeline is a *recipe*, not a cache).

## Example

```ts
import { from, select, toArray } from 'linq-in-typescript';

from([1, 2, 3]).pipe(select((x) => x + 1), toArray()); // [2, 3, 4]

from(['a', 'b']).pipe(select((x, i) => `${i}:${x}`), toArray()); // ['0:a', '1:b']
```

## Teaching note

The laziness is observable: in the test suite, a source of *functions* is mapped with `select((x) => x())` and the consumer breaks after the first item — the second function is never invoked. `Array.prototype.map` would have invoked both before the consumer saw anything.

## See also

- [selectMany](./selectMany.md) — when the selector returns a sequence to flatten
- [where](./where.md)
- Tests: [`test/select.test.ts`](../test/select.test.ts)
