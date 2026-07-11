# firstOrDefault

> Returns the first matching item, or `undefined` if there is none.

**Category:** terminal operator (element) · **.NET:** [`FirstOrDefault`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.firstordefault) · **RxJS:** `first` (with a default value)

## Signature

```ts
function firstOrDefault<T>(
  selector?: (item: T) => boolean,
): UnaryFunction<Iterable<T>, T | undefined>;
```

## Semantics

- Exactly [first](./first.md), except no match yields **`undefined`** (TypeScript's analogue of .NET's `default(T)`) instead of throwing.
- The return type is honest: `T | undefined`, so the compiler forces you to handle the miss.
- Short-circuiting, like `first`.

## Example

```ts
import { from, firstOrDefault } from 'linq-in-typescript';

from([1, 2, 3]).pipe(firstOrDefault((x) => x > 9)); // undefined
```

Caveat: on a sequence that *contains* `undefined`, a hit and a miss are indistinguishable — same as .NET's `FirstOrDefault` returning `default(T)` for both.

## See also

- [first](./first.md) · [lastOrDefault](./lastOrDefault.md) · [singleOrDefault](./singleOrDefault.md)
- Tests: [`test/first.test.ts`](../test/first.test.ts)
