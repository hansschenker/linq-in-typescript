# any

> Returns `true` if at least one item satisfies the predicate (or if the sequence is non-empty, with no predicate).

**Category:** terminal operator (quantifier) · **.NET:** [`Any`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.any) · **RxJS:** — (closest: `first` + error handling, or `isEmpty` negated)

## Signature

```ts
function any<T>(fn?: (item: T) => boolean): UnaryFunction<Iterable<T>, boolean>;
```

## Semantics

- With no argument: "is the sequence non-empty?" — pulls at most **one** item.
- **Short-circuits on the first match**; an empty sequence is `false`.
- `any()` is the cheap emptiness test; prefer it over `count() > 0`, which consumes everything.

## Example

```ts
import { from, any } from 'linq-in-typescript';

from([1, 2, 3]).pipe(any());               // true
from([1, 2, 3]).pipe(any((x) => x > 2));   // true
from([]).pipe(any());                       // false
```

## See also

- [all](./all.md) · [contains](./contains.md) — `any` with an equality predicate
- Tests: [`test/any.test.ts`](../test/any.test.ts)
