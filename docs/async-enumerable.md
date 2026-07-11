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

- **Creation:** `from(iterable | asyncIterable)` — wraps either protocol — and `of(...items)`.
- **Sequence operators:** `where`/`filter`, `select`/`map`, `take` — like their sync counterparts, but predicates and selectors **may be async** (`where(async (x) => ...)`), awaited per item.
- **Time operator:** [debounceTime](./debounceTime.md) — the operator this module exists to make possible.
- **Terminal:** `toArray()` — returns `Promise<T[]>`; async-pull terminals resolve rather than return.

The rest of the sync operator set ports mechanically (swap `function*` for `async function*`, `for...of` for `for await...of`) and can be added as needed.

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
