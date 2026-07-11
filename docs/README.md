# linq-in-typescript — the operator course

One page per operator: signature, semantics, laziness profile, a runnable example, and how it maps to .NET LINQ and RxJS. Every page links to the operator's test file — the tests are the executable form of the documentation.

## Learning path

### 1. Foundations

| Page | What it teaches |
| --- | --- |
| [pipe](./pipe.md) | The composition model: `.pipe()` on a sequence, standalone `pipe()` for reusable chains |
| [from](./from.md) | Wrap any iterable as an `Enumerable` |
| [of](./of.md) | Build a sequence from loose values |
| [range](./range.md) | Generate a numeric sequence |
| [repeat](./repeat.md) | Repeat a value n times |

### 2. Projection

| Page | One-liner |
| --- | --- |
| [select](./select.md) (alias `map`) | Transform each item |
| [selectMany](./selectMany.md) | Project each item to a sequence and flatten |

### 3. Filtering

| Page | One-liner |
| --- | --- |
| [where](./where.md) (alias `filter`) | Keep items matching a predicate |
| [distinct](./distinct.md) | Remove duplicates while streaming |

### 4. Partitioning

| Page | One-liner |
| --- | --- |
| [take](./take.md) | First n items |
| [takeWhile](./takeWhile.md) | Items until the predicate fails |
| [skip](./skip.md) | Everything after the first n items |
| [skipWhile](./skipWhile.md) | Everything after the predicate first fails |

### 5. Set operators

| Page | One-liner |
| --- | --- |
| [union](./union.md) | Distinct items of both sequences |
| [intersect](./intersect.md) | Distinct items present in both |
| [except](./except.md) | Distinct items of the first not in the second |

### 6. Ordering

| Page | One-liner |
| --- | --- |
| [orderBy](./orderBy.md) | Sort ascending by key |
| [orderByDescending](./orderByDescending.md) | Sort descending by key |
| [thenBy](./thenBy.md) | Ascending tiebreaker |
| [thenByDescending](./thenByDescending.md) | Descending tiebreaker |

### 7. Grouping and joins

| Page | One-liner |
| --- | --- |
| [groupBy](./groupBy.md) | Partition into pipeable groups by key |
| [join](./join.md) | Equi-join two sequences (inner join) |
| [groupJoin](./groupJoin.md) | One result per outer item with all its matches (left-join shape) |

### 8. Combination

| Page | One-liner |
| --- | --- |
| [concat](./concat.md) | Append one sequence after another |
| [zip](./zip.md) | Pair sequences element-by-element |

### 9. Terminal operators

Element access:

| Page | One-liner |
| --- | --- |
| [first](./first.md) / [firstOrDefault](./firstOrDefault.md) | First match — throw vs `undefined` when none |
| [last](./last.md) / [lastOrDefault](./lastOrDefault.md) | Last match — throw vs `undefined` when none |
| [single](./single.md) / [singleOrDefault](./singleOrDefault.md) | The unique match — both throw on more than one |

Quantifiers:

| Page | One-liner |
| --- | --- |
| [all](./all.md) | Does every item satisfy the predicate? |
| [any](./any.md) | Does at least one? |
| [contains](./contains.md) | Is this value in the sequence? |

Aggregation and materialization:

| Page | One-liner |
| --- | --- |
| [count](./count.md) | Number of (matching) items |
| [average](./average.md) | Arithmetic mean |
| [aggregate](./aggregate.md) | General fold with optional seed and result selector |
| [toArray](./toArray.md) | Materialize the pipeline into an array |

### 10. Theory

The essays behind the design, best read in order:

1. [js-iterator-vs-rxjs-observer.md](../js-iterator-vs-rxjs-observer.md) — the Iterator/Observer duality mapping
2. [js-zip-vs-rxjs-zip.md](../js-zip-vs-rxjs-zip.md) — the duality made concrete in one operator
3. [pull-vs-push.md](../pull-vs-push.md) — does it all reduce to the flipped arrow?
4. [why-no-debounce-in-pull.md](../why-no-debounce-in-pull.md) — an operator that only exists on one side

## Reading a page

Each page states the operator's **laziness profile** precisely; the vocabulary:

- **streaming** — items flow through one at a time; works with infinite sequences
- **buffering** — the operator must materialize something before it can yield (e.g. sorting buffers everything; `join` buffers only the inner sequence)
- **deferred** — regardless of profile, *nothing* happens until the result is iterated
- **short-circuiting** — a terminal that stops consuming as soon as the answer is known

All sequence operators produce **re-iterable** enumerables: iterating twice re-runs the pipeline (like a cold Observable in RxJS).
