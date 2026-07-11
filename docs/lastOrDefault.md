# lastOrDefault

> Returns the last matching item, or `undefined` if there is none.

**Category:** terminal operator (element) · **.NET:** [`LastOrDefault`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.lastordefault) · **RxJS:** `last` (with a default value)

## Signature

```ts
function lastOrDefault<T>(
  selector?: (item: T) => boolean,
): UnaryFunction<Iterable<T>, T | undefined>;
```

## Semantics

- [last](./last.md) without the throw: no match yields `undefined` (return type `T | undefined`).
- Consumes the entire sequence — no short-circuit.

## Example

```ts
import { from, lastOrDefault } from 'linq-in-typescript';

from([1, 2, 3]).pipe(lastOrDefault((x) => x > 9)); // undefined
```

## See also

- [last](./last.md) · [firstOrDefault](./firstOrDefault.md)
- Tests: [`test/last.test.ts`](../test/last.test.ts)
