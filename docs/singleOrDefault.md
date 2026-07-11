# singleOrDefault

> Returns the unique matching item, `undefined` if none — but still throws on more than one.

**Category:** terminal operator (element) · **.NET:** [`SingleOrDefault`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.singleordefault) · **RxJS:** —

## Signature

```ts
function singleOrDefault<T>(
  selector?: (item: T) => boolean,
): UnaryFunction<Iterable<T>, T | undefined>;
```

## Semantics

- The `orDefault` only softens the **zero-match** case (returns `undefined`). **Multiple matches still throw** — uniqueness is the operator's contract; absence is the tolerated condition.
- Return type `T | undefined`.

## Example

```ts
import { from, singleOrDefault } from 'linq-in-typescript';

from([1, 2, 3]).pipe(singleOrDefault((x) => x === 2)); // 2
from([1, 2, 3]).pipe(singleOrDefault((x) => x === 9)); // undefined
from([1, 2, 2]).pipe(singleOrDefault((x) => x === 2)); // throws
```

## See also

- [single](./single.md) · [firstOrDefault](./firstOrDefault.md)
- Tests: [`test/singleOrDefault.test.ts`](../test/singleOrDefault.test.ts)
