# groupBy

> Partitions the sequence into groups by key; each group is itself pipeable.

**Category:** lazy sequence operator (grouping) · **.NET:** [`GroupBy`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.groupby) · **RxJS:** `groupBy` (yields `GroupedObservable`s)

## Signature

```ts
function groupBy<T, TKey>(
  keySelector: (item: T, index: number) => TKey,
): OperatorFunction<T, Grouping<TKey, T>>;

function groupBy<T, TKey, TElement>(
  keySelector: (item: T, index: number) => TKey,
  elementSelector: (item: T, index: number) => TElement,
): OperatorFunction<T, Grouping<TKey, TElement>>;
```

## Semantics

- Yields **`Grouping<TKey, TElement>`** objects — enumerables with a readonly `key` property, so each group can be piped (`g.pipe(count())`).
- Groups appear in **first-seen key order**; within a group, elements keep source order (both matching .NET).
- The optional element selector projects each grouped value; both selectors receive the source index.
- Key equality: `Map`-based SameValueZero.
- **Laziness profile: deferred but buffering** — grouping cannot yield the first group until it knows that group is complete, which requires consuming the entire source. Nothing happens before iteration; everything happens at the first pull.

## Example

```ts
import { from, groupBy, select, count, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4, 5]).pipe(
  groupBy((x) => x % 2),
  select((g) => [g.key, [...g]]),
  toArray(),
); // [[1, [1, 3, 5]], [0, [2, 4]]]

from(words).pipe(
  groupBy((w) => w.length, (w) => w.toUpperCase()),
  select((g) => `${g.key}: ${g.pipe(count())}`),
  toArray(),
);
```

## Teaching note

Compare with RxJS's `groupBy`, which can emit a `GroupedObservable` the moment its first member arrives and feed it incrementally — push can stream groups because groups are *streams*. Pull must finish the source first, because a pull group is a *finished collection*. Same operator name, dual output types.

## See also

- [groupJoin](./groupJoin.md) — grouping driven by a second sequence
- [orderBy](./orderBy.md) — the other buffering operator
- Tests: [`test/groupBy.test.ts`](../test/groupBy.test.ts)
