# Why there is no `debounceTime` in a pull library

Is anything missing in JavaScript that prevents implementing time-based operators like `debounceTime` over iterables?

**No — nothing is missing from JavaScript.** The language has every ingredient needed (`setTimeout`, the event loop, promises, async generators), and the proof is that RxJS's `debounceTime` is implemented *in* JavaScript and works fine. What makes it impossible in a synchronous pull `Enumerable` is the **model itself**, for two stacked reasons — one semantic, one mechanical.

## The semantic reason: sync pull has no notion of arrival time

`debounceTime(500)` means "emit a value once the *producer* has been silent for 500 ms." That definition presupposes values arrive at moments the producer chooses — that there is such a thing as "silence."

In synchronous pull, the producer never speaks on its own; it only answers. A value is produced at exactly the moment the consumer calls `next()`, *because* the consumer called — the request causes the production. So "time between values" isn't hidden or hard to measure; **it doesn't exist as a property of the sequence.** Asking to debounce an `Enumerable` is like asking to debounce a function call.

The only timing in the pull model is *demand* timing, and that belongs to the consumer — who doesn't need an operator to pace themselves.

## The mechanical reason: run-to-completion

Even if you tried to fake it, JavaScript's single-threaded execution means that while a synchronous `for...of` loop is pulling, no timer callback can run — `setTimeout` callbacks queue behind the current task and only fire when the stack unwinds. There is no moment during a synchronous iteration at which "500 ms of silence" could even be observed.

Notably, this isn't JS-specific: C# has real threads, and .NET *still* puts `Debounce`/`Throttle` in Rx's `IObservable`, not in LINQ-to-Objects' `IEnumerable`. Same split, different language — which confirms it's the model, not the language.

## In terms of the duality

Put in terms of [pull-vs-push.md](./pull-vs-push.md): time-based operators require the **producer to own the clock**, and producer-owned timing is the *definition* of push. `debounceTime` isn't an operator that happens to be missing from pull libraries; it's an operator whose semantics are only expressible on the push side of the duality.

That's the mirror image of [`zip`](./js-zip-vs-rxjs-zip.md), which is pull-natural — each operator has a home.

## The interesting middle case: async pull

With `AsyncIterable`, time re-enters the model — `next()` returns a promise, so an operator can race timers against source values. Libraries like IxJS (the `AsyncIterable` sibling of RxJS) do ship `debounce`.

But look at how it must work internally: the operator has to *pump the source eagerly*, detached from downstream demand, timestamp what arrives, and serve the consumer from that internal flow — in other words, it builds a miniature push system inside a pull interface. Even where debounce is possible, it's possible only by smuggling push in.

## Conclusion

For linq-in-typescript, time-based operators are out of scope *by design*, not by limitation. In a future `AsyncEnumerable` variant — the natural next substrate — `debounceTime` becomes implementable, at the cost of exactly that internal pull→push inversion.

*Background: [js-iterator-vs-rxjs-observer.md](./js-iterator-vs-rxjs-observer.md) — the Iterator/Observer duality mapping.*
