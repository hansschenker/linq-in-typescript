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

## API

Creation functions: `from` (alias `asEnumerable`), `of`, `range`, `repeat`.

Pipeable sequence operators (lazy, return a new `Enumerable`): `where` (alias `filter`), `select` (alias `map`), `selectMany`, `groupBy`, `concat`, `take`, `takeWhile`, `skip`, `skipWhile`.

`groupBy(keySelector, elementSelector?)` yields `Grouping<TKey, TElement>` objects — enumerables with a `key` property, so each group can itself be piped.

Pipeable terminal operators (eager, return a value): `aggregate`, `all`, `any`, `average`, `contains`, `count`, `first`, `firstOrDefault`, `last`, `lastOrDefault`, `single`, `singleOrDefault`, `toArray`.

Operators are importable from the root or, RxJS-v6-style, from the `linq-in-typescript/operators` subpath.

## Development

```
npm install
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run build     # emits ESM + declarations to dist/
```

## License

MIT
