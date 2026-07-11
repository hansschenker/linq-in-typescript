# orderBy

> Sorts the sequence ascending by a selected key.

**Category:** lazy sequence operator (ordering) · **.NET:** [`OrderBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.orderby) · **RxJS:** — (sorting a push stream requires buffering it all: `toArray` + sort)

## Signature

```ts
function orderBy<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer?: (a: TKey, b: TKey) => number,
): UnaryFunction<Iterable<T>, OrderedEnumerable<T>>;
```

## Semantics

- Returns an **`OrderedEnumerable<T>`** — a regular enumerable whose ordering can be refined with [thenBy](./thenBy.md)/[thenByDescending](./thenByDescending.md). The type system rejects a `thenBy` that doesn't follow an `orderBy`.
- The default comparer compares **by value** (`<`/`>`): `[10, 2, 1]` sorts to `[1, 2, 10]`, not JS's string-coerced `[1, 10, 2]`. Pass a custom comparer for anything else (e.g. `localeCompare`).
- **Stable:** items with equal keys keep their source order (this is what makes `thenBy` compose correctly).
- **Laziness profile: deferred but buffering.** Nothing happens until iteration; on first pull the whole source is copied and sorted. The source is never mutated; each pass re-sorts, keeping the sequence re-iterable. An entire `orderBy → thenBy → thenBy` chain performs **one** sort.

## Example

```ts
import { from, orderBy, toArray } from 'linq-in-typescript';

from([3, 1, 2]).pipe(orderBy((x) => x), toArray()); // [1, 2, 3]

from(people).pipe(orderBy((p) => p.name), toArray()); // alphabetical

from(words).pipe(
  orderBy((w) => w, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
  toArray(),
);
```

## Teaching note

Sorting is the counterexample to "pull streams everything": you cannot emit the smallest item until you've seen them all, so buffering is *semantically* required, not an implementation shortcut. The laziness that remains is deferral — the sort happens at iteration time, on each pass, against the data as it is *then*.

## See also

- [orderByDescending](./orderByDescending.md) · [thenBy](./thenBy.md) · [thenByDescending](./thenByDescending.md)
- Tests: [`test/orderBy.test.ts`](../test/orderBy.test.ts)
