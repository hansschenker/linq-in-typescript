# of

> Builds an `Enumerable` from the values passed as arguments.

**Category:** creation · **.NET:** — (closest is an array literal) · **RxJS:** `of`

## Signature

```ts
function of<T>(...items: T[]): Enumerable<T>;
```

## Semantics

- Equivalent to `from([...items])`; exists for the same ergonomic reason RxJS's `of` does.
- Deferred and re-iterable like every enumerable.

## Example

```ts
import { of, select, toArray } from 'linq-in-typescript';

of(1, 2, 3).pipe(select((x) => x * 2), toArray()); // [2, 4, 6]
```

## See also

- [from](./from.md) — when you already have an iterable
- Tests: [`test/enumerable.test.ts`](../test/enumerable.test.ts)
