# AsyncEnumerable — the async-pull module

> Pull-based like `Enumerable`, but the consumer awaits each value: the third quadrant of the pull/push grid.

**Import:** `linq-in-typescript/async` · **Ecosystem relative:** IxJS's `ix/asynciterable`

```ts
import { from, where, select, debounceTime, toArray } from 'linq-in-typescript/async';
```

## The model

`AsyncEnumerable<T>` wraps an `AsyncIterable<T>` — the protocol behind `for await...of`. It is still **demand-driven** (the consumer requests each value) but the request returns a *promise*, so production may take time. That single change re-admits time into the model, which is what makes [debounceTime](./debounceTime.md) possible here when it's impossible in the sync module.

|  | sync pull | async pull | push |
| --- | --- | --- | --- |
| substrate | `Iterable` | `AsyncIterable` | Observable |
| this library | `Enumerable` | `AsyncEnumerable` | (RxJS) |

Everything structural carries over from the sync module: `.pipe()` with the same typed overloads, operators as standalone pipeable factories, lazy and re-iterable sequences (each iteration re-runs the pipeline), streaming with early exit (`take` closes an infinite source).

## What's in the module

**Full parity with the sync module**, plus the time operator. Semantics match the sync operator pages; only the substrate differs.

- **Creation:** `from(iterable | asyncIterable)`, `of`, `range`, `repeat`. The standalone `pipe` is re-exported too.
- **Sequence operators:** `where`/`filter`, `select`/`map`, `selectMany`, `groupBy`, `join`, `groupJoin`, `orderBy`, `orderByDescending`, `thenBy`, `thenByDescending`, `distinct`, `union`, `intersect`, `except`, `concat`, `zip`, `take`, `takeWhile`, `skip`, `skipWhile`.
- **Time operator:** [debounceTime](./debounceTime.md) — the operator this module exists to make possible.
- **Terminals:** `aggregate`, `all`, `any`, `average`, `contains`, `count`, `first`/`firstOrDefault`, `last`/`lastOrDefault`, `single`/`singleOrDefault`, `toArray` — all returning `Promise`s; async-pull terminals resolve rather than return.

## Async-specific differences

- **Every callback may be async.** Predicates, selectors, key selectors, folders, and testers can return promises; they're awaited per item (`where(async (x) => ...)`).
- **Second sequences accept either protocol.** `concat`, `zip`, the set operators, and the joins take `Iterable | AsyncIterable`.
- **`zip` pulls both sides concurrently** (`Promise.all` on the two `next()` calls) — an async-only improvement over sequential pulling.
- **`orderBy` awaits each key once per item** (decorate–sort–undecorate), since `Array.sort` comparators can't await. Key selectors may be async; comparers must be sync. A side effect: the async `orderBy` calls the key selector once per item, not once per comparison.
- **Support types are prefixed:** `groupBy` yields `AsyncGrouping<TKey, TElement>`; the ordering family works on `OrderedAsyncEnumerable<T>` (same `thenBy`-only-after-`orderBy` compile-time guarantee as the sync module).

## Example

```ts
import { from, where, select, toArray } from 'linq-in-typescript/async';

const result = await from(fetchPages()).pipe(   // any AsyncIterable source
  where((page) => page.ok),
  select(async (page) => await page.json()),    // async selector, awaited per item
  toArray(),
);
```

## See also

- [debounceTime](./debounceTime.md)
- Theory: [js-iterator-vs-rxjs-observer.md](../js-iterator-vs-rxjs-observer.md) (the 2×2 grid), [why-no-debounce-in-pull.md](../why-no-debounce-in-pull.md)
- Tests: [`test/async-enumerable.test.ts`](../test/async-enumerable.test.ts)
