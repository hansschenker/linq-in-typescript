# LINQ in TypeScript

A TypeScript rewrite of [linq-in-javascript](https://github.com/aaronpowell/linq-in-javascript) (Aaron Powell's implementation of .NET's [LINQ](https://learn.microsoft.com/dotnet/csharp/linq/) API), reshaped around **pipeable operator functions in the style of RxJS v6**.

Sequences are lazy: each item flows through the whole operator pipeline before the next item is pulled, so you can query large (or infinite) sequences and break early without processing everything. Unlike the original, sequences are also **re-iterable** — enumerating twice gives the same result, like .NET's `IEnumerable<T>`.

## Example

```typescript
import { aggregate, from, range, pipe, where, select, toArray } from 'linq-in-typescript';

// query with .pipe(), RxJS-style
const result = from([1, 2, 3, 4, 5, 6]).pipe(
  where((x) => x % 2 === 1),
  select((x) => x + 1),
  toArray(),
); // [2, 4, 6]

// terminal operators return plain values
const sum = range(0, 10).pipe(aggregate((curr, next) => curr + next)); // 45

// compose reusable chains with the standalone pipe()
const doubledEvens = pipe(
  where<number>((x) => x % 2 === 0),
  select((x) => x * 2),
  toArray(),
);
doubledEvens(from([1, 2, 3, 4])); // [4, 8]
```

## Documentation

**[The operator course](./docs/README.md)** — one page per operator with signature, semantics, laziness profile, examples, and .NET/RxJS correspondences, organized as a learning path from foundations through joins to the pull-vs-push theory essays.

## API

Creation functions: `from` (alias `asEnumerable`), `of`, `range`, `repeat`.

Pipeable sequence operators (lazy, return a new `Enumerable`): `where` (alias `filter`), `select` (alias `map`), `selectMany`, `groupBy`, `join`, `groupJoin`, `orderBy`, `orderByDescending`, `thenBy`, `thenByDescending`, `distinct`, `union`, `intersect`, `except`, `concat`, `zip`, `take`, `takeWhile`, `skip`, `skipWhile`.

`distinct(keySelector?)` removes duplicates (SameValueZero equality), keeping the first occurrence per key. `zip(second, resultSelector?)` pairs two sequences — tuples by default — and stops at the end of the shorter one. Both stream lazily, so they work with infinite sequences.

`union`, `intersect`, and `except` (each with an optional key selector) are the set operators: results are distinct, follow the first sequence's order, and stream lazily — `union` fully, while `intersect`/`except` buffer the second sequence into a set on first pull.

`join(inner, outerKey, innerKey, result)` is an equi-join: it streams the piped (outer) sequence lazily, buffering the inner sequence into a lookup on first pull, and yields a result per matching pair — unmatched items on either side are dropped. `groupJoin` yields one result per outer element paired with a pipeable enumerable of its matches (empty when none — left-join shaped).

`groupBy(keySelector, elementSelector?)` yields `Grouping<TKey, TElement>` objects — enumerables with a `key` property, so each group can itself be piped.

`orderBy`/`orderByDescending(keySelector, comparer?)` return an `OrderedEnumerable` whose ordering can be refined with `thenBy`/`thenByDescending` (the type system rejects a `thenBy` that doesn't follow an `orderBy`). Sorting is deferred until iteration, stable, non-mutating, and compares keys by value — not by JS's default string coercion.

Pipeable terminal operators (eager, return a value): `aggregate`, `all`, `any`, `average`, `contains`, `count`, `first`, `firstOrDefault`, `last`, `lastOrDefault`, `single`, `singleOrDefault`, `toArray`.

Operators are importable from the root or, RxJS-v6-style, from the `linq-in-typescript/operators` subpath.

## Async

The `linq-in-typescript/async` subpath ships `AsyncEnumerable` — the same pipeable model over `AsyncIterable` (`for await...of`). Because async pull re-admits time into the model, it supports `debounceTime`, which is impossible in the sync module:

```typescript
import { from, where, debounceTime, toArray } from 'linq-in-typescript/async';

const searches = await from(keystrokes).pipe(
  where((s) => s.length > 2),
  debounceTime(300),
  toArray(),
);
```

Includes `from`, `of`, `where`/`filter`, `select`/`map` (async predicates and selectors allowed), `take`, `debounceTime`, and `toArray`.

## Development

```
npm install
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run build     # emits ESM + declarations to dist/
```

## License

MIT
