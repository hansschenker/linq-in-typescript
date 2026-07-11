# last

> Returns the last item (matching the optional predicate); throws if there is none.

**Category:** terminal operator (element) · **.NET:** [`Last`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.last) · **RxJS:** `last`

## Signature

```ts
function last<T>(selector?: (item: T) => boolean): UnaryFunction<Iterable<T>, T>;
```

## Semantics

- Returns the last matching item; **throws** when nothing matches ([lastOrDefault](./lastOrDefault.md) returns `undefined` instead).
- **Consumes the entire sequence** — "last" is only knowable at the end, so there is no short-circuit. Don't call it on an infinite sequence.
- Handles falsy values correctly (tracked with a found-flag, not truthiness).

## Example

```ts
import { from, last } from 'linq-in-typescript';

from([1, 2, 3]).pipe(last());              // 3
from([1, 2, 3]).pipe(last((x) => x < 3));  // 2
```

## Teaching note

The original `linq-in-javascript` implemented `lastOrDefault` via `this.reverse()` — a method that didn't exist, so it always threw. Untested code is unimplemented code; this rewrite added the tests along with the fix.

## See also

- [lastOrDefault](./lastOrDefault.md) · [first](./first.md)
- Tests: [`test/last.test.ts`](../test/last.test.ts)
