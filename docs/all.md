# all

> Returns `true` if every item satisfies the predicate.

**Category:** terminal operator (quantifier) · **.NET:** [`All`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.all) · **RxJS:** `every`

## Signature

```ts
function all<T>(fn?: (item: T) => boolean): UnaryFunction<Iterable<T>, boolean>;
```

## Semantics

- **Short-circuits on the first `false`** — the rest of the sequence is never pulled.
- **Vacuously true on an empty sequence** (standard universal quantification): `from([]).pipe(all(p))` is `true`.

## Example

```ts
import { from, all } from 'linq-in-typescript';

from([2, 4, 6]).pipe(all((x) => x % 2 === 0)); // true
from([2, 3, 6]).pipe(all((x) => x % 2 === 0)); // false — stops at 3
```

## See also

- [any](./any.md) — the dual quantifier: `all(p)` ≡ `!any(x => !p(x))`
- Tests: [`test/all.test.ts`](../test/all.test.ts)
