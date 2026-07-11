# pipe

> The composition model: chain operators left-to-right, RxJS-v6 style.

**Category:** foundation

## Two forms

### `.pipe()` on an `Enumerable`

```ts
pipe<A>(op1: UnaryFunction<Enumerable<T>, A>): A;
pipe<A, B>(op1: UnaryFunction<Enumerable<T>, A>, op2: UnaryFunction<A, B>): B;
// ... overloaded up to 9 operators
```

Applies each operator to the result of the previous one. Because each step is just a unary function, the *last* step may be a terminal operator that returns a plain value — the overloads thread the types through:

```ts
import { from, where, select, toArray } from 'linq-in-typescript';

const result = from([1, 2, 3, 4]).pipe(
  where((x) => x % 2 === 0), // Enumerable<number>
  select((x) => x * 10),     // Enumerable<number>
  toArray(),                 // number[]  ← terminal, returns a value
);
```

### Standalone `pipe()`

```ts
function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
// ... overloaded up to 9 functions
```

Composes operators *without* a source — the chain becomes a reusable, named value:

```ts
import { pipe, where, select, toArray } from 'linq-in-typescript';

const doubledEvens = pipe(
  where<number>((x) => x % 2 === 0),
  select((x) => x * 2),
  toArray(),
);

doubledEvens(from([1, 2, 3, 4])); // [4, 8]
doubledEvens(from([5, 6]));       // [12]
```

Note the explicit `where<number>` — without a source there is no context to infer the item type from, so the first operator needs a type argument.

## Semantics

- An operator is any `UnaryFunction<A, B>`; sequence operators are `OperatorFunction<T, R> = (source: Iterable<T>) => Enumerable<R>`.
- Operators accept `Iterable<T>`, not just `Enumerable<T>` — composed chains work on plain arrays too.
- `.pipe()` with no arguments returns the enumerable itself.

## Correspondence

- **RxJS:** `Observable.pipe(...)` and the standalone `pipe()` — the direct model for this design. One difference: RxJS operators always return Observables, while here terminals may end the chain with a plain value.
- **.NET:** LINQ uses extension methods (`source.Where(...).Select(...)`) instead; C#'s equivalent of pipeable functions would be free functions composed by hand.

## See also

- [from](./from.md) — the usual way to obtain something pipeable
- Tests: [`test/api-usages.test.ts`](../test/api-usages.test.ts)
