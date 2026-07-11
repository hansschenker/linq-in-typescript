# JavaScript Iterator/Iterable vs RxJS Observer/Observable

Is JavaScript's `Iterator`/`Iterable` the equivalent in RxJS of `Observer`/`Observable`?

Yes — and it's not just an analogy: RxJS's design is the formal **dual** of iteration. Erik Meijer derived Rx.NET by taking .NET's `IEnumerable`/`IEnumerator` (which JS `Iterable`/`Iterator` mirrors) and mechanically reversing the direction of every function call.

## The correspondence

| Pull (iteration) | Push (Rx) |
| --- | --- |
| `Iterable` — a source you can consume | `Observable` — a source you can consume |
| `[Symbol.iterator]()` starts a consumption | `subscribe(observer)` starts a consumption |
| `Iterator` — the consumer's channel | `Observer` — the consumer's channel |
| `next()` returns `{ value, done: false }` | producer calls `observer.next(value)` |
| `next()` returns `{ done: true }` | producer calls `observer.complete()` |
| `next()` throws | producer calls `observer.error(err)` |
| `iterator.return()` (stop early) | `subscription.unsubscribe()` |

## What "dual" means

The arrows flip: with an iterator, *you* call a function and data comes back as the return value — the **consumer controls timing** and blocks synchronously. With an observer, you hand the producer three callbacks and *it* calls them whenever it has something — the **producer controls timing**, which is why Observables model async naturally (events, HTTP, timers) while iterables model synchronous sequences.

Everything else lines up because of this:

- **Both are lazy.** An iterable does nothing until iterated; a cold Observable does nothing until subscribed.
- **Both restart per consumption.** Each `[Symbol.iterator]()` call is a fresh pass; each `subscribe()` is a fresh execution.
- **Both compose the same way.** This is precisely why the RxJS-v6 pipeable style transplants so cleanly onto LINQ-style libraries: LINQ is the pull side and Rx the push side of the same abstraction. `Enumerable.pipe(where, select, take)` in [linq-in-typescript](https://github.com/hansschenker/linq-in-typescript) and an Observable's `pipe(filter, map, take)` are the same algebra over dual substrates. (The re-iterable `Enumerable` design mirrors cold-observable semantics.)

## The full 2×2 picture

It's really a grid of *how many values* by *who drives*, and JavaScript has all four cells:

|  | one value | many values |
| --- | --- | --- |
| **pull** | function call | `Iterable` / `Iterator` |
| **push** | `Promise` | `Observable` |

There's also a hybrid filling the diagonal: `AsyncIterable`/`AsyncIterator` (`for await...of`) is pull-based like an `Enumerable` but asynchronous — the consumer requests, yet awaits each value. That's the natural next substrate for a LINQ-style library over async sources, sitting exactly between pull-LINQ and RxJS.
