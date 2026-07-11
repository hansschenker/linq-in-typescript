# contains

> Returns `true` if the sequence contains the given value.

**Category:** terminal operator (quantifier) · **.NET:** [`Contains`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.contains) · **RxJS:** —

## Signature

```ts
function contains<T>(
  value: T,
  tester?: (item: T, value: T) => boolean,
): UnaryFunction<Iterable<T>, boolean>;
```

## Semantics

- Default equality is strict `===`; pass a custom tester for anything else (deep equality, key comparison, epsilon comparison for floats…).
- **Short-circuits on the first hit.**
- Note the default differs from the `Set`-based operators: `contains(NaN)` is `false` with `===` — pass `Object.is` as the tester if you need SameValueZero.

## Example

```ts
import { from, range, contains } from 'linq-in-typescript';

range(0, 10).pipe(contains(5));                        // true
range(0, 10).pipe(contains(-5));                       // false
from(users).pipe(contains(target, (a, b) => a.id === b.id));
```

## See also

- [any](./any.md) — `contains(v)` ≡ `any(x => x === v)`
- Tests: [`test/contains.test.ts`](../test/contains.test.ts)
