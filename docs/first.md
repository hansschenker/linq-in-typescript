# first

> Returns the first item (matching the optional predicate); throws if there is none.

**Category:** terminal operator (element) · **.NET:** [`First`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.first) · **RxJS:** `first`

## Signature

```ts
function first<T>(selector?: (item: T) => boolean): UnaryFunction<Iterable<T>, T>;
```

## Semantics

- Returns the first item for which the predicate holds (default: any item).
- **Throws** `'Sequence contains no matching elements'` when nothing matches — use [firstOrDefault](./firstOrDefault.md) to get `undefined` instead.
- **Short-circuiting:** stops pulling the moment a match is found; upstream work beyond that point never happens.
- Falsy values are returned correctly: `from([0, 1]).pipe(first())` is `0`. (The original JS version used a truthiness check and failed this.)

## Example

```ts
import { from, first } from 'linq-in-typescript';

from([1, 2, 3]).pipe(first());               // 1
from([1, 2, 3]).pipe(first((x) => x > 1));   // 2
from([1, 2, 3]).pipe(first((x) => x > 9));   // throws
```

## See also

- [firstOrDefault](./firstOrDefault.md) · [last](./last.md) · [single](./single.md) (asserts uniqueness)
- Tests: [`test/first.test.ts`](../test/first.test.ts)
