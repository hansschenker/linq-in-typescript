# aggregate

> The general fold: threads an accumulator through the sequence.

**Category:** terminal operator (aggregation) · **.NET:** [`Aggregate`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.aggregate) · **RxJS:** `reduce`

## Signature

```ts
// four overloads:
function aggregate<T>(fn: (acc: T, next: T) => T): UnaryFunction<Iterable<T>, T>;
function aggregate<T, TResult>(
  fn: (acc: T, next: T) => T,
  resultSelector: (acc: T) => TResult,
): UnaryFunction<Iterable<T>, TResult>;
function aggregate<T, TAccumulate>(
  seed: TAccumulate,
  fn: (acc: TAccumulate, next: T) => TAccumulate,
): UnaryFunction<Iterable<T>, TAccumulate>;
function aggregate<T, TAccumulate, TResult>(
  seed: TAccumulate,
  fn: (acc: TAccumulate, next: T) => TAccumulate,
  resultSelector: (acc: TAccumulate) => TResult,
): UnaryFunction<Iterable<T>, TResult>;
```

## Semantics

- **Unseeded:** the first element becomes the initial accumulator (folding starts at the second); **throws** on an empty sequence.
- **Seeded:** the accumulator may be a different type than the elements; an empty sequence returns the seed.
- The optional **result selector** transforms the final accumulator once at the end.
- The two-function ambiguity (`(fn, resultSelector)` vs `(seed, fn)`) is resolved like .NET: two arguments where the first is a function ⇒ unseeded with result selector.
- Consumes the entire sequence.

## Example

```ts
import { range, from, aggregate } from 'linq-in-typescript';

range(0, 10).pipe(aggregate((sum, n) => sum + n));        // 45
range(0, 10).pipe(aggregate(1, (sum, n) => sum + n));     // 46

from(['apple', 'passionfruit', 'grape']).pipe(
  aggregate(
    (longest, next) => (next.length > longest.length ? next : longest),
    (winner) => winner.toUpperCase(),
  ),
); // 'PASSIONFRUIT'
```

## Teaching note

Every other aggregation is a special case: `count` is `aggregate(0, (n) => n + 1)`, `average` a pair-fold plus result selector, `toArray` a fold into an array. They exist as named operators because names carry intent — but when you need a custom reduction, this is the primitive.

## See also

- [count](./count.md) · [average](./average.md) · [toArray](./toArray.md)
- Tests: [`test/aggregate.test.ts`](../test/aggregate.test.ts)
