import { Enumerable } from './enumerable.js';
import type {
  IndexedPredicate,
  IndexedSelector,
  OperatorFunction,
  Predicate,
  UnaryFunction,
} from './enumerable.js';

const alwaysTrue = (): boolean => true;

function lazy<T>(generator: () => Generator<T>): Enumerable<T> {
  return new Enumerable<T>({ [Symbol.iterator]: generator });
}

// --- sequence operators (lazy) ---

export function where<T>(selector: IndexedPredicate<T>): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      for (const item of source) {
        if (selector(item, index++)) {
          yield item;
        }
      }
    });
}

export const filter = where;

export function select<T, TResult>(fn: IndexedSelector<T, TResult>): OperatorFunction<T, TResult> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      for (const item of source) {
        yield fn(item, index++);
      }
    });
}

export const map = select;

export function selectMany<T, TCollection>(
  colSelector: IndexedSelector<T, Iterable<TCollection>>,
): OperatorFunction<T, TCollection>;
export function selectMany<T, TCollection, TResult>(
  colSelector: IndexedSelector<T, Iterable<TCollection>>,
  resSelector: (collectionItem: TCollection, item: T) => TResult,
): OperatorFunction<T, TResult>;
export function selectMany<T, TCollection, TResult>(
  colSelector: IndexedSelector<T, Iterable<TCollection>>,
  resSelector?: (collectionItem: TCollection, item: T) => TResult,
): OperatorFunction<T, TCollection | TResult> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      for (const item of source) {
        for (const collectionItem of colSelector(item, index++)) {
          yield resSelector ? resSelector(collectionItem, item) : collectionItem;
        }
      }
    });
}

export class Grouping<TKey, TElement> extends Enumerable<TElement> {
  readonly key: TKey;

  constructor(key: TKey, elements: Iterable<TElement>) {
    super(elements);
    this.key = key;
  }
}

export function groupBy<T, TKey>(
  keySelector: IndexedSelector<T, TKey>,
): OperatorFunction<T, Grouping<TKey, T>>;
export function groupBy<T, TKey, TElement>(
  keySelector: IndexedSelector<T, TKey>,
  elementSelector: IndexedSelector<T, TElement>,
): OperatorFunction<T, Grouping<TKey, TElement>>;
export function groupBy<T, TKey, TElement>(
  keySelector: IndexedSelector<T, TKey>,
  elementSelector?: IndexedSelector<T, TElement>,
): OperatorFunction<T, Grouping<TKey, T | TElement>> {
  return (source) =>
    lazy(function* () {
      const groups = new Map<TKey, Array<T | TElement>>();
      let index = 0;
      for (const item of source) {
        const key = keySelector(item, index);
        const element = elementSelector ? elementSelector(item, index) : item;
        index++;
        const bucket = groups.get(key);
        if (bucket) {
          bucket.push(element);
        } else {
          groups.set(key, [element]);
        }
      }
      for (const [key, elements] of groups) {
        yield new Grouping(key, elements);
      }
    });
}

function buildLookup<TInner, TKey>(
  inner: Iterable<TInner>,
  keySelector: (item: TInner) => TKey,
): Map<TKey, TInner[]> {
  const lookup = new Map<TKey, TInner[]>();
  for (const item of inner) {
    const key = keySelector(item);
    const bucket = lookup.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      lookup.set(key, [item]);
    }
  }
  return lookup;
}

export function join<TOuter, TInner, TKey, TResult>(
  inner: Iterable<TInner>,
  outerKeySelector: (item: TOuter) => TKey,
  innerKeySelector: (item: TInner) => TKey,
  resultSelector: (outerItem: TOuter, innerItem: TInner) => TResult,
): OperatorFunction<TOuter, TResult> {
  return (source) =>
    lazy(function* () {
      const lookup = buildLookup(inner, innerKeySelector);
      for (const outerItem of source) {
        const matches = lookup.get(outerKeySelector(outerItem));
        if (matches) {
          for (const innerItem of matches) {
            yield resultSelector(outerItem, innerItem);
          }
        }
      }
    });
}

export function groupJoin<TOuter, TInner, TKey, TResult>(
  inner: Iterable<TInner>,
  outerKeySelector: (item: TOuter) => TKey,
  innerKeySelector: (item: TInner) => TKey,
  resultSelector: (outerItem: TOuter, innerItems: Enumerable<TInner>) => TResult,
): OperatorFunction<TOuter, TResult> {
  return (source) =>
    lazy(function* () {
      const lookup = buildLookup(inner, innerKeySelector);
      for (const outerItem of source) {
        const matches = lookup.get(outerKeySelector(outerItem)) ?? [];
        yield resultSelector(outerItem, new Enumerable(matches));
      }
    });
}

export type Comparer<TKey> = (a: TKey, b: TKey) => number;

const defaultComparer = <TKey>(a: TKey, b: TKey): number => (a < b ? -1 : a > b ? 1 : 0);

export class OrderedEnumerable<T> extends Enumerable<T> {
  private readonly unsorted: Iterable<T>;
  private readonly comparer: Comparer<T>;

  constructor(unsorted: Iterable<T>, comparer: Comparer<T>) {
    super({
      [Symbol.iterator]: (): Iterator<T> => {
        const items = [...unsorted];
        items.sort(comparer);
        return items[Symbol.iterator]();
      },
    });
    this.unsorted = unsorted;
    this.comparer = comparer;
  }

  createOrderedEnumerable(tiebreaker: Comparer<T>): OrderedEnumerable<T> {
    const parent = this.comparer;
    return new OrderedEnumerable(this.unsorted, (a, b) => {
      const result = parent(a, b);
      return result !== 0 ? result : tiebreaker(a, b);
    });
  }
}

export function orderBy<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<Iterable<T>, OrderedEnumerable<T>> {
  return (source) =>
    new OrderedEnumerable(source, (a, b) => comparer(keySelector(a), keySelector(b)));
}

export function orderByDescending<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<Iterable<T>, OrderedEnumerable<T>> {
  return (source) =>
    new OrderedEnumerable(source, (a, b) => comparer(keySelector(b), keySelector(a)));
}

export function thenBy<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<OrderedEnumerable<T>, OrderedEnumerable<T>> {
  return (source) =>
    source.createOrderedEnumerable((a, b) => comparer(keySelector(a), keySelector(b)));
}

export function thenByDescending<T, TKey>(
  keySelector: (item: T) => TKey,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<OrderedEnumerable<T>, OrderedEnumerable<T>> {
  return (source) =>
    source.createOrderedEnumerable((a, b) => comparer(keySelector(b), keySelector(a)));
}

export function distinct<T, TKey = T>(
  keySelector: (item: T) => TKey = (item): TKey => item as unknown as TKey,
): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      const seen = new Set<TKey>();
      for (const item of source) {
        const key = keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
    });
}

export function union<T, TKey = T>(
  second: Iterable<T>,
  keySelector: (item: T) => TKey = (item): TKey => item as unknown as TKey,
): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      const seen = new Set<TKey>();
      for (const item of source) {
        const key = keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
      for (const item of second) {
        const key = keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
    });
}

export function intersect<T, TKey = T>(
  second: Iterable<T>,
  keySelector: (item: T) => TKey = (item): TKey => item as unknown as TKey,
): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      const candidates = new Set<TKey>();
      for (const item of second) {
        candidates.add(keySelector(item));
      }
      for (const item of source) {
        if (candidates.delete(keySelector(item))) {
          yield item;
        }
      }
    });
}

export function except<T, TKey = T>(
  second: Iterable<T>,
  keySelector: (item: T) => TKey = (item): TKey => item as unknown as TKey,
): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      const excluded = new Set<TKey>();
      for (const item of second) {
        excluded.add(keySelector(item));
      }
      for (const item of source) {
        const key = keySelector(item);
        if (!excluded.has(key)) {
          excluded.add(key);
          yield item;
        }
      }
    });
}

export function concat<T>(col: Iterable<T>): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      yield* source;
      yield* col;
    });
}

export function zip<T, TSecond>(second: Iterable<TSecond>): OperatorFunction<T, [T, TSecond]>;
export function zip<T, TSecond, TResult>(
  second: Iterable<TSecond>,
  resultSelector: (first: T, second: TSecond) => TResult,
): OperatorFunction<T, TResult>;
export function zip<T, TSecond, TResult>(
  second: Iterable<TSecond>,
  resultSelector?: (first: T, second: TSecond) => TResult,
): OperatorFunction<T, [T, TSecond] | TResult> {
  return (source) =>
    lazy(function* () {
      const secondIterator = second[Symbol.iterator]();
      try {
        for (const item of source) {
          const other = secondIterator.next();
          if (other.done) {
            return;
          }
          yield resultSelector
            ? resultSelector(item, other.value)
            : ([item, other.value] as [T, TSecond]);
        }
      } finally {
        secondIterator.return?.();
      }
    });
}

export function take<T>(count = 0): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      if (count <= 0) {
        return;
      }
      let taken = 0;
      for (const item of source) {
        yield item;
        if (++taken >= count) {
          return;
        }
      }
    });
}

export function takeWhile<T>(fn: IndexedPredicate<T>): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      for (const item of source) {
        if (!fn(item, index++)) {
          return;
        }
        yield item;
      }
    });
}

export function skip<T>(count = 0): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      for (const item of source) {
        if (index++ >= count) {
          yield item;
        }
      }
    });
}

export function skipWhile<T>(fn: IndexedPredicate<T>): OperatorFunction<T, T> {
  return (source) =>
    lazy(function* () {
      let index = 0;
      let skipping = true;
      for (const item of source) {
        if (skipping && !fn(item, index)) {
          skipping = false;
        }
        index++;
        if (!skipping) {
          yield item;
        }
      }
    });
}

// --- terminal operators (eager) ---

export function aggregate<T>(fn: (accumulated: T, next: T) => T): UnaryFunction<Iterable<T>, T>;
export function aggregate<T, TResult>(
  fn: (accumulated: T, next: T) => T,
  resultSelector: (accumulated: T) => TResult,
): UnaryFunction<Iterable<T>, TResult>;
export function aggregate<T, TAccumulate>(
  seed: TAccumulate,
  fn: (accumulated: TAccumulate, next: T) => TAccumulate,
): UnaryFunction<Iterable<T>, TAccumulate>;
export function aggregate<T, TAccumulate, TResult>(
  seed: TAccumulate,
  fn: (accumulated: TAccumulate, next: T) => TAccumulate,
  resultSelector: (accumulated: TAccumulate) => TResult,
): UnaryFunction<Iterable<T>, TResult>;
export function aggregate<T>(...args: readonly unknown[]): UnaryFunction<Iterable<T>, unknown> {
  type Accumulator = (accumulated: unknown, next: T) => unknown;
  type ResultSelector = (accumulated: unknown) => unknown;

  let initialSeed: unknown;
  let seeded = false;
  let fn: Accumulator;
  let resultSelector: ResultSelector | undefined;

  if (args.length === 1) {
    fn = args[0] as Accumulator;
  } else if (args.length === 2 && typeof args[0] === 'function') {
    fn = args[0] as Accumulator;
    resultSelector = args[1] as ResultSelector;
  } else {
    initialSeed = args[0];
    seeded = true;
    fn = args[1] as Accumulator;
    resultSelector = args[2] as ResultSelector | undefined;
  }

  return (source) => {
    const iterator = source[Symbol.iterator]();
    let seed = initialSeed;

    if (!seeded) {
      const first = iterator.next();
      if (first.done) {
        throw new Error('Sequence contains no elements');
      }
      seed = first.value;
    }

    let current = iterator.next();
    while (!current.done) {
      seed = fn(seed, current.value);
      current = iterator.next();
    }

    return resultSelector ? resultSelector(seed) : seed;
  };
}

export function all<T>(fn: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, boolean> {
  return (source) => {
    for (const item of source) {
      if (!fn(item)) {
        return false;
      }
    }
    return true;
  };
}

export function any<T>(fn: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, boolean> {
  return (source) => {
    for (const item of source) {
      if (fn(item)) {
        return true;
      }
    }
    return false;
  };
}

export function average(): UnaryFunction<Iterable<number>, number>;
export function average<T>(selector: (item: T) => number): UnaryFunction<Iterable<T>, number>;
export function average<T>(selector?: (item: T) => number): UnaryFunction<Iterable<T>, number> {
  return (source) => {
    let total = 0;
    let count = 0;

    for (const item of source) {
      total += selector ? selector(item) : (item as unknown as number);
      count++;
    }

    if (count === 0) {
      throw new Error('Sequence contains no elements');
    }
    return total / count;
  };
}

export function contains<T>(
  value: T,
  tester: (item: T, value: T) => boolean = (x, y): boolean => x === y,
): UnaryFunction<Iterable<T>, boolean> {
  return (source) => {
    for (const item of source) {
      if (tester(item, value)) {
        return true;
      }
    }
    return false;
  };
}

export function count<T>(fn: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, number> {
  return (source) => {
    let total = 0;
    for (const item of source) {
      if (fn(item)) {
        total++;
      }
    }
    return total;
  };
}

export function first<T>(selector: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, T> {
  return (source) => {
    for (const item of source) {
      if (selector(item)) {
        return item;
      }
    }
    throw new Error('Sequence contains no matching elements');
  };
}

export function firstOrDefault<T>(
  selector: Predicate<T> = alwaysTrue,
): UnaryFunction<Iterable<T>, T | undefined> {
  return (source) => {
    for (const item of source) {
      if (selector(item)) {
        return item;
      }
    }
    return undefined;
  };
}

export function last<T>(selector: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, T> {
  return (source) => {
    let result: T | undefined;
    let found = false;
    for (const item of source) {
      if (selector(item)) {
        result = item;
        found = true;
      }
    }
    if (!found) {
      throw new Error('Sequence contains no matching elements');
    }
    return result as T;
  };
}

export function lastOrDefault<T>(
  selector: Predicate<T> = alwaysTrue,
): UnaryFunction<Iterable<T>, T | undefined> {
  return (source) => {
    let result: T | undefined;
    for (const item of source) {
      if (selector(item)) {
        result = item;
      }
    }
    return result;
  };
}

export function single<T>(selector: Predicate<T> = alwaysTrue): UnaryFunction<Iterable<T>, T> {
  return (source) => {
    let matched: T | undefined;
    let found = false;
    for (const item of source) {
      if (selector(item)) {
        if (found) {
          throw new Error('Sequence contains more than one matching element');
        }
        matched = item;
        found = true;
      }
    }
    if (!found) {
      throw new Error('Sequence contains no matching element');
    }
    return matched as T;
  };
}

export function singleOrDefault<T>(
  selector: Predicate<T> = alwaysTrue,
): UnaryFunction<Iterable<T>, T | undefined> {
  return (source) => {
    let matched: T | undefined;
    let found = false;
    for (const item of source) {
      if (selector(item)) {
        if (found) {
          throw new Error('Sequence contains more than one matching element');
        }
        matched = item;
        found = true;
      }
    }
    return matched;
  };
}

export function toArray<T>(): UnaryFunction<Iterable<T>, T[]> {
  return (source) => [...source];
}
