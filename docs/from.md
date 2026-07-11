# from

> Wraps any iterable as an `Enumerable`, the pipeable sequence type.

**Category:** creation · **Alias:** `asEnumerable` · **.NET:** [`AsEnumerable`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.asenumerable) · **RxJS:** `from`

## Signature

```ts
function from<T>(source: Iterable<T>): Enumerable<T>;
```

## Semantics

- Accepts anything iterable: arrays, `Set`, `Map`, strings, generator objects, other enumerables.
- **Deferred:** the source is not touched until the enumerable is iterated.
- **Re-iterable:** iterating the result twice iterates the source twice (fresh pass each time), provided the source itself is re-iterable.

## Example

```ts
import { from, where, toArray } from 'linq-in-typescript';

from([1, 2, 3, 4]).pipe(where((x) => x > 2), toArray()); // [3, 4]

from(new Set(['a', 'b'])).pipe(toArray()); // ['a', 'b']

// Infinite generator sources work — operators pull lazily
const naturals = from({
  *[Symbol.iterator]() {
    let i = 0;
    while (true) yield i++;
  },
});
```

## Notes

The original `linq-in-javascript` patched `Array.prototype.asEnumerable()`. The rewrite uses a creation function instead, following the RxJS ethos: no prototype patching. `asEnumerable` survives as a named alias of `from`.

## See also

- [of](./of.md) — from loose values instead of an iterable
- Tests: [`test/enumerable.test.ts`](../test/enumerable.test.ts)
