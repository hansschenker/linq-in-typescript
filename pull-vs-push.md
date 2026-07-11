# Is it all just pull vs push?

Follow-up to [js-zip-vs-rxjs-zip.md](./js-zip-vs-rxjs-zip.md): are the differences between the two zip implementations ultimately *the* difference between pull and push?

**Yes — with one precision.** Almost everything deep in that comparison is a downstream consequence of a single flipped arrow. But not *everything*: some differences ride along for other reasons, and it pays to separate the theorems from the style choices.

## The single root

Pull vs push is exactly one question: **who initiates the transfer of each value?**

- **Pull:** the consumer calls a function (`iterator.next()`) and receives the value as the *return value*. The consumer controls timing; the producer is paused in between.
- **Push:** the producer calls functions the consumer handed over (`observer.next(value)`). The producer controls timing; the consumer is passive in between.

One inversion of function-call direction. Everything below follows from it.

## The theorems — consequences of the flipped arrow

| Consequence | Pull (`Enumerable`) | Push (`Observable`) |
| --- | --- | --- |
| **Alignment** | free — demand *is* the alignment; values are manufactured in pairs | must be simulated with per-source queues |
| **Where progress lives** | in the program counter (paused iterators) | reified as data (`buffers`, `completed[]` flags) |
| **Completion** | a return value, inspected at the single point of demand | an event, needing checks wherever state changes |
| **Cleanup** | inherited from the language's iteration protocol (`for...of` closes iterators, `try/finally`) | built by hand (the `Subscription`/teardown system) |
| **Memory** | O(1) — nothing buffered, ever | unbounded-buffer risk when source rates diverge |

The unifying law: **inverting control turns control flow into state.** What pull keeps implicit in "where the code is paused," push must store in data structures — and then manage, check, and eventually null out.

## What is *not* pull vs push

Three things in the comparison don't reduce to the flipped arrow:

1. **Sync vs async is an orthogonal axis.** Pull does not imply synchronous: `AsyncIterable` is pull *and* async (the consumer requests, then awaits). A `Promise` is push with a single value. RxJS's asynchrony *amplifies* the buffering problem (rates can really diverge), but the buffering itself comes from push, not from async.

2. **API shape is convention, not consequence.** RxJS `zip` being an N-ary creation function with runtime argument parsing (`argsOrArgArray`, `popResultSelector`) versus linq-in-typescript's binary pipeable operator with compile-time overloads — either library could have chosen the other shape. Nothing about push forces variadic runtime parsing.

3. **Operators have a natural home on one side.** `zip` is pull-natural: pairing-by-index is what demand-driven evaluation does by default. `debounceTime` is push-natural — and *impossible* in synchronous pull, because it needs producer-side timing that a blocked consumer can't observe (see [why-no-debounce-in-pull.md](./why-no-debounce-in-pull.md) for the full argument). The duality doesn't crown a winner; it assigns each operator a side where it's cheap and a side where it's effortful.

## One-line answer

Yes: a single flipped arrow — who calls whom — is the root. Buffering, state, completion handling, cleanup, and memory behavior are its theorems; arity and argument parsing are just style; and sync-vs-async is a different axis entirely.

*Background: [js-iterator-vs-rxjs-observer.md](./js-iterator-vs-rxjs-observer.md) — the full Iterator/Observer duality mapping.*
