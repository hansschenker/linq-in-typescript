# debounceTime

> Emits a value only after `ms` of silence from the source; superseded values are dropped.

**Category:** async time operator (`linq-in-typescript/async`) · **.NET:** Rx's `Throttle` (not LINQ — no `IEnumerable` equivalent exists) · **RxJS:** `debounceTime`

## Signature

```ts
function debounceTime<T>(ms: number): AsyncOperatorFunction<T, T>;
```

## Semantics

- A value becomes *pending* when it arrives; if `ms` elapses with no newer value, it is emitted. A newer arrival within the window **replaces** the pending value (trailing debounce, like RxJS).
- **Completion flushes:** when the source ends, a pending value is emitted immediately — no residual wait.
- Errors from the source propagate to the consumer after any already-emitted values.
- Early exit downstream (`take`, `break`) clears the timer and closes the source iterator.

## Example

```ts
import { from, debounceTime, toArray } from 'linq-in-typescript/async';

// keystrokes arriving 5ms apart, then a pause: only the last of each burst survives
await from(keystrokes).pipe(debounceTime(300), toArray());
```

## Teaching note — the pull→push inversion

This operator cannot exist in the sync module ([why-no-debounce-in-pull.md](../why-no-debounce-in-pull.md)): synchronous pull has no arrival times to debounce. It exists here only by **smuggling push in**. Look at the implementation's two halves:

1. **The pump** — an internal task that consumes the source *eagerly*, detached from downstream demand. Each arrival replaces the pending value and resets a `setTimeout`. This half is a miniature RxJS: producer-paced, timer-driven, push.
2. **The served side** — the async generator the consumer actually pulls from, fed from an internal `ready` queue with promise-based wake-ups.

In other words: `debounceTime` converts pull→push internally, debounces in push-world where the operation is natural, and converts back to pull at the boundary. The buffering that pull-zip proudly avoids ([js-zip-vs-rxjs-zip.md](../js-zip-vs-rxjs-zip.md)) reappears here — because this time the *operator's semantics*, not the substrate, demand producer-side autonomy. Each operator has a natural home; `debounceTime` brings its home with it.

## See also

- [AsyncEnumerable](./async-enumerable.md) — the module this lives in
- Tests: [`test/debounceTime.test.ts`](../test/debounceTime.test.ts)
