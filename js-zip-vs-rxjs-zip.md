# Pull-zip vs push-zip: linq-in-typescript's `zip` compared with RxJS's `zip`

`zip` is the operator where the pull/push duality (see [js-iterator-vs-rxjs-observer.md](./js-iterator-vs-rxjs-observer.md)) stops being abstract and becomes visible in every line.

A framing note first: RxJS's [`zipAll`](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/zipAll.ts) is a thin higher-order wrapper — it zips an observable-of-observables once the outer completes, and `joinAllInternals(zip, project)` is its whole body. The real machinery lives in [`observable/zip.ts`](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/zip.ts), and the closest RxJS relative of this library's operator is its pipeable form, `zipWith`.

## The cores, side by side

```typescript
// linq-in-typescript (pull)
for (const item of source) {
  const other = secondIterator.next();
  if (other.done) return;
  yield resultSelector ? resultSelector(item, other.value) : [item, other.value];
}
```

```typescript
// RxJS (push, next handler per source)
next: (value) => {
  buffers[sourceIndex].push(value);
  if (buffers.every((b) => b.length)) {
    const result = buffers.map((b) => b.shift()!);
    destination.next(resultSelector ? resultSelector(...result) : result);
    if (buffers.some((b, i) => !b.length && completed[i])) {
      destination.complete();
    }
  }
},
```

## Buffering is the whole difference

In the pull version, alignment is free: the consumer demands a pair, so one value is pulled from each side — values are *manufactured* already paired, and nothing is ever stored.

RxJS can't do that, because push inverts control: each source emits whenever it likes, at unrelated rates, and you can't ask an Observable to wait. So RxJS must keep a queue per source (`buffers`, keyed by source index), emit only when every queue is non-empty, and `shift()` the oldest from each. That has a real cost the pull version structurally cannot have: zip a fast source with a slow one and the fast side's buffer grows without bound. Pull-zip is O(1) memory, always.

## Completion: one check vs two-site detection

Both stop at the shorter sequence, but detecting that differs.

- **Pull:** one check in one place — `other.done` → `return`, synchronously final.
- **Push:** completion detection in *two* places — in the `complete` handler (source completed with an empty buffer → done) and again inside `next` after each emission (a source already marked `completed` whose buffer just drained → done). The second check is needed because in push-world a "finished" source may still have buffered values that can form more pairs. No buffers, no such case.

## Cleanup: language protocol vs Subscription plumbing

RxJS wires each inner subscription to the destination via `operate({ destination, ... })` and registers teardowns that null out `buffers` and `completed` to avoid leaks.

The pull version is a `try/finally` calling `secondIterator.return?.()`: when a consumer breaks early (`take`, `first`, a `break`), the runtime closes the generator, the `finally` closes the second iterator, and `for...of` closes the first automatically. Same guarantee — early exit releases both sources — one built from Subscription plumbing, one inherited from language semantics.

## API shape

The RxJS `zip` is an N-ary *creation* function with runtime argument parsing (`argsOrArgArray` to accept spread-or-array, `popResultSelector` to peel a trailing selector, `EMPTY` for zero sources) and variadic tuple types (`ObservableInputTuple<A>`).

linq-in-typescript's `zip(second, resultSelector?)` mirrors `zipWith` instead: binary and pipeable, with the tuple-vs-selector choice resolved purely by compile-time overloads and a single `resultSelector ? :` at runtime. For an N-ary version, RxJS's `A extends readonly unknown[]` overload pattern is exactly the template to borrow.

## What they share

The parts that matter are identical:

- **Lazy until consumed** — subscribe ↔ iterate.
- **Re-run per consumption** — cold observable ↔ re-iterable enumerable (the second iterator is created inside the generator, fresh per pass).
- **Identical zip semantics** — pair by index, stop at the shorter sequence, optional result selector.

## The takeaway

The pull version is ~20 lines; the push version is ~60 plus helpers — not because RxJS is over-engineered, but because zip is intrinsically a **pull-natural operator**: pairing-by-index is what demand-driven evaluation does by default, and RxJS has to simulate that demand with queues.

The flip side: an operator like `debounceTime` is trivial in push and *impossible* in synchronous pull — a neat confirmation that neither side of the duality is the "better" one.
