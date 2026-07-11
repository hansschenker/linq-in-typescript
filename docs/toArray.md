# toArray

> Materializes the pipeline into a plain array.

**Category:** terminal operator (materialization) · **.NET:** [`ToArray`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.toarray) · **RxJS:** `toArray`

## Signature

```ts
function toArray<T>(): UnaryFunction<Iterable<T>, T[]>;
```

## Semantics

- Runs the whole pipeline **once, now**, and snapshots the results — the boundary between the lazy world and the eager one.
- Consumes the entire sequence (never on an infinite one without an upstream [take](./take.md)).
- Implementation is exactly `(source) => [...source]`.

## Example

```ts
import { from, where, select, toArray } from 'linq-in-typescript';

const result = from([1, 2, 3]).pipe(
  where((x) => x > 1),
  select((x) => x * 10),
  toArray(),
); // [20, 30] — a real array, pipeline executed once
```

## Teaching note

Everything before `toArray` is a *recipe*; `toArray` is *cooking it*. Two `toArray` calls on the same enumerable run the pipeline twice — if you need the results more than once (or the source may change underneath you), materialize once and reuse the array. Conversely, if you only iterate once, skip `toArray` and `for...of` the enumerable directly: no intermediate allocation at all.

## See also

- [aggregate](./aggregate.md) — folds without materializing
- Tests: [`test/enumerable.test.ts`](../test/enumerable.test.ts)
