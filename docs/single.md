# single

> Returns the unique matching item; throws if there are zero **or more than one**.

**Category:** terminal operator (element) · **.NET:** [`Single`](https://learn.microsoft.com/dotnet/api/system.linq.enumerable.single) · **RxJS:** `single`

## Signature

```ts
function single<T>(selector?: (item: T) => boolean): UnaryFunction<Iterable<T>, T>;
```

## Semantics

- Asserts **uniqueness**, not just existence: zero matches throws `'Sequence contains no matching element'`, two or more throws `'Sequence contains more than one matching element'`.
- Must keep consuming after the first match (to prove there's no second), but throws **immediately** on finding a second match — that much short-circuits.

## Example

```ts
import { from, single } from 'linq-in-typescript';

from([1, 2, 3]).pipe(single((x) => x === 2));  // 2
from([1, 2, 2]).pipe(single((x) => x === 2));  // throws: more than one
```

## Teaching note

Use `single` when a duplicate would mean your *data* is wrong — say, looking up by what should be a unique ID. `first` silently picks one and hides the corruption; `single` turns the broken invariant into a loud failure at the point where it's cheapest to debug.

## See also

- [singleOrDefault](./singleOrDefault.md) · [first](./first.md)
- Tests: [`test/single.test.ts`](../test/single.test.ts)
