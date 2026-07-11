# selectMany

> Projects each item to a sequence and flattens the results into one sequence.

**Category:** lazy sequence operator · **.NET:** [`SelectMany`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.selectmany) · **RxJS:** `concatMap` (closest — order-preserving flattening)

## Signature

```ts
function selectMany<T, TCollection>(
  colSelector: (item: T, index: number) => Iterable<TCollection>,
): OperatorFunction<T, TCollection>;

function selectMany<T, TCollection, TResult>(
  colSelector: (item: T, index: number) => Iterable<TCollection>,
  resSelector: (collectionItem: TCollection, item: T) => TResult,
): OperatorFunction<T, TResult>;
```

## Semantics

- For each source item, the collection selector produces an iterable; its elements are yielded in order before the next source item is consulted (depth-first, order-preserving).
- The optional result selector receives each **flattened element** plus the source item it came from.
- **Streaming and deferred** on both levels: inner sequences are themselves iterated lazily.

## Example

```ts
import { from, selectMany, toArray } from 'linq-in-typescript';

from([[1], [2, 3]]).pipe(selectMany((x) => x), toArray()); // [1, 2, 3]

// result selector: (innerElement, outerItem)
const orders = [
  { customer: 'A', items: ['x', 'y'] },
  { customer: 'B', items: ['z'] },
];
from(orders).pipe(
  selectMany((o) => o.items, (item, o) => `${o.customer}:${item}`),
  toArray(),
); // ['A:x', 'A:y', 'B:z']
```

## Teaching note

The original `linq-in-javascript` implementation didn't actually flatten — it returned `arr[0]` per item, and its tests passed by coincidence (`[1] * 2 === 2` in JS!). The rewrite implements genuine flattening. In RxJS, flattening strategy is a whole family (`mergeMap`, `concatMap`, `switchMap`, `exhaustMap`) because push-world must decide what to do when inner streams *overlap in time*; in pull-world there is no overlap — depth-first is the only order — so one operator suffices.

## See also

- [select](./select.md)
- Tests: [`test/select.test.ts`](../test/select.test.ts)
