import { AsyncEnumerable } from './async-enumerable.js';
import type { AsyncOperatorFunction } from './async-enumerable.js';
import type { UnaryFunction } from '../enumerable.js';
import type { Comparer } from '../operators.js';
import { from } from './create.js';

export type Awaitable<T> = T | Promise<T>;
export type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;

const alwaysTrue = (): boolean => true;

function lazyAsync<T>(generator: () => AsyncGenerator<T>): AsyncEnumerable<T> {
  return new AsyncEnumerable<T>({ [Symbol.asyncIterator]: generator });
}

// --- sequence operators (lazy) ---

export function where<T>(
  selector: (item: T, index: number) => Awaitable<boolean>,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      for await (const item of source) {
        if (await selector(item, index++)) {
          yield item;
        }
      }
    });
}

export const filter = where;

export function select<T, TResult>(
  fn: (item: T, index: number) => Awaitable<TResult>,
): AsyncOperatorFunction<T, TResult> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      for await (const item of source) {
        yield await fn(item, index++);
      }
    });
}

export const map = select;

export function selectMany<T, TCollection>(
  colSelector: (item: T, index: number) => Awaitable<AnyIterable<TCollection>>,
): AsyncOperatorFunction<T, TCollection>;
export function selectMany<T, TCollection, TResult>(
  colSelector: (item: T, index: number) => Awaitable<AnyIterable<TCollection>>,
  resSelector: (collectionItem: TCollection, item: T) => Awaitable<TResult>,
): AsyncOperatorFunction<T, TResult>;
export function selectMany<T, TCollection, TResult>(
  colSelector: (item: T, index: number) => Awaitable<AnyIterable<TCollection>>,
  resSelector?: (collectionItem: TCollection, item: T) => Awaitable<TResult>,
): AsyncOperatorFunction<T, TCollection | TResult> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      for await (const item of source) {
        const col = await colSelector(item, index++);
        for await (const collectionItem of from(col)) {
          yield resSelector ? await resSelector(collectionItem, item) : collectionItem;
        }
      }
    });
}

export class AsyncGrouping<TKey, TElement> extends AsyncEnumerable<TElement> {
  readonly key: TKey;

  constructor(key: TKey, elements: Iterable<TElement>) {
    super({
      async *[Symbol.asyncIterator](): AsyncGenerator<TElement> {
        yield* elements;
      },
    });
    this.key = key;
  }
}

export function groupBy<T, TKey>(
  keySelector: (item: T, index: number) => Awaitable<TKey>,
): AsyncOperatorFunction<T, AsyncGrouping<TKey, T>>;
export function groupBy<T, TKey, TElement>(
  keySelector: (item: T, index: number) => Awaitable<TKey>,
  elementSelector: (item: T, index: number) => Awaitable<TElement>,
): AsyncOperatorFunction<T, AsyncGrouping<TKey, TElement>>;
export function groupBy<T, TKey, TElement>(
  keySelector: (item: T, index: number) => Awaitable<TKey>,
  elementSelector?: (item: T, index: number) => Awaitable<TElement>,
): AsyncOperatorFunction<T, AsyncGrouping<TKey, T | TElement>> {
  return (source) =>
    lazyAsync(async function* () {
      const groups = new Map<TKey, Array<T | TElement>>();
      let index = 0;
      for await (const item of source) {
        const key = await keySelector(item, index);
        const element = elementSelector ? await elementSelector(item, index) : item;
        index++;
        const bucket = groups.get(key);
        if (bucket) {
          bucket.push(element);
        } else {
          groups.set(key, [element]);
        }
      }
      for (const [key, elements] of groups) {
        yield new AsyncGrouping(key, elements);
      }
    });
}

async function buildLookup<TInner, TKey>(
  inner: AnyIterable<TInner>,
  keySelector: (item: TInner) => Awaitable<TKey>,
): Promise<Map<TKey, TInner[]>> {
  const lookup = new Map<TKey, TInner[]>();
  for await (const item of from(inner)) {
    const key = await keySelector(item);
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
  inner: AnyIterable<TInner>,
  outerKeySelector: (item: TOuter) => Awaitable<TKey>,
  innerKeySelector: (item: TInner) => Awaitable<TKey>,
  resultSelector: (outerItem: TOuter, innerItem: TInner) => Awaitable<TResult>,
): AsyncOperatorFunction<TOuter, TResult> {
  return (source) =>
    lazyAsync(async function* () {
      const lookup = await buildLookup(inner, innerKeySelector);
      for await (const outerItem of source) {
        const matches = lookup.get(await outerKeySelector(outerItem));
        if (matches) {
          for (const innerItem of matches) {
            yield await resultSelector(outerItem, innerItem);
          }
        }
      }
    });
}

export function groupJoin<TOuter, TInner, TKey, TResult>(
  inner: AnyIterable<TInner>,
  outerKeySelector: (item: TOuter) => Awaitable<TKey>,
  innerKeySelector: (item: TInner) => Awaitable<TKey>,
  resultSelector: (outerItem: TOuter, innerItems: AsyncEnumerable<TInner>) => Awaitable<TResult>,
): AsyncOperatorFunction<TOuter, TResult> {
  return (source) =>
    lazyAsync(async function* () {
      const lookup = await buildLookup(inner, innerKeySelector);
      for await (const outerItem of source) {
        const matches = lookup.get(await outerKeySelector(outerItem)) ?? [];
        yield await resultSelector(outerItem, from(matches));
      }
    });
}

// --- ordering ---

const defaultComparer = <TKey>(a: TKey, b: TKey): number => (a < b ? -1 : a > b ? 1 : 0);

interface SortStep<T> {
  keySelector: (item: T) => unknown;
  comparer: Comparer<unknown>;
  descending: boolean;
}

export class OrderedAsyncEnumerable<T> extends AsyncEnumerable<T> {
  private readonly unsorted: AsyncIterable<T>;
  private readonly steps: ReadonlyArray<SortStep<T>>;

  constructor(unsorted: AsyncIterable<T>, steps: ReadonlyArray<SortStep<T>>) {
    super({
      async *[Symbol.asyncIterator](): AsyncGenerator<T> {
        const keyed: Array<{ item: T; keys: unknown[] }> = [];
        for await (const item of unsorted) {
          const keys: unknown[] = [];
          for (const step of steps) {
            keys.push(await step.keySelector(item));
          }
          keyed.push({ item, keys });
        }
        keyed.sort((a, b) => {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i] as SortStep<T>;
            const result = step.descending
              ? step.comparer(b.keys[i], a.keys[i])
              : step.comparer(a.keys[i], b.keys[i]);
            if (result !== 0) {
              return result;
            }
          }
          return 0;
        });
        for (const { item } of keyed) {
          yield item;
        }
      },
    });
    this.unsorted = unsorted;
    this.steps = steps;
  }

  withStep(step: SortStep<T>): OrderedAsyncEnumerable<T> {
    return new OrderedAsyncEnumerable(this.unsorted, [...this.steps, step]);
  }
}

export function orderBy<T, TKey>(
  keySelector: (item: T) => Awaitable<TKey>,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<AsyncIterable<T>, OrderedAsyncEnumerable<T>> {
  return (source) =>
    new OrderedAsyncEnumerable(source, [
      { keySelector, comparer: comparer as Comparer<unknown>, descending: false },
    ]);
}

export function orderByDescending<T, TKey>(
  keySelector: (item: T) => Awaitable<TKey>,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<AsyncIterable<T>, OrderedAsyncEnumerable<T>> {
  return (source) =>
    new OrderedAsyncEnumerable(source, [
      { keySelector, comparer: comparer as Comparer<unknown>, descending: true },
    ]);
}

export function thenBy<T, TKey>(
  keySelector: (item: T) => Awaitable<TKey>,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<OrderedAsyncEnumerable<T>, OrderedAsyncEnumerable<T>> {
  return (source) =>
    source.withStep({ keySelector, comparer: comparer as Comparer<unknown>, descending: false });
}

export function thenByDescending<T, TKey>(
  keySelector: (item: T) => Awaitable<TKey>,
  comparer: Comparer<TKey> = defaultComparer,
): UnaryFunction<OrderedAsyncEnumerable<T>, OrderedAsyncEnumerable<T>> {
  return (source) =>
    source.withStep({ keySelector, comparer: comparer as Comparer<unknown>, descending: true });
}

// --- set operators ---

export function distinct<T, TKey = T>(
  keySelector: (item: T) => Awaitable<TKey> = (item): TKey => item as unknown as TKey,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      const seen = new Set<TKey>();
      for await (const item of source) {
        const key = await keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
    });
}

export function union<T, TKey = T>(
  second: AnyIterable<T>,
  keySelector: (item: T) => Awaitable<TKey> = (item): TKey => item as unknown as TKey,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      const seen = new Set<TKey>();
      for await (const item of source) {
        const key = await keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
      for await (const item of from(second)) {
        const key = await keySelector(item);
        if (!seen.has(key)) {
          seen.add(key);
          yield item;
        }
      }
    });
}

export function intersect<T, TKey = T>(
  second: AnyIterable<T>,
  keySelector: (item: T) => Awaitable<TKey> = (item): TKey => item as unknown as TKey,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      const candidates = new Set<TKey>();
      for await (const item of from(second)) {
        candidates.add(await keySelector(item));
      }
      for await (const item of source) {
        if (candidates.delete(await keySelector(item))) {
          yield item;
        }
      }
    });
}

export function except<T, TKey = T>(
  second: AnyIterable<T>,
  keySelector: (item: T) => Awaitable<TKey> = (item): TKey => item as unknown as TKey,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      const excluded = new Set<TKey>();
      for await (const item of from(second)) {
        excluded.add(await keySelector(item));
      }
      for await (const item of source) {
        const key = await keySelector(item);
        if (!excluded.has(key)) {
          excluded.add(key);
          yield item;
        }
      }
    });
}

// --- combination ---

export function concat<T>(col: AnyIterable<T>): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      yield* source;
      yield* from(col);
    });
}

export function zip<T, TSecond>(
  second: AnyIterable<TSecond>,
): AsyncOperatorFunction<T, [T, TSecond]>;
export function zip<T, TSecond, TResult>(
  second: AnyIterable<TSecond>,
  resultSelector: (first: T, second: TSecond) => Awaitable<TResult>,
): AsyncOperatorFunction<T, TResult>;
export function zip<T, TSecond, TResult>(
  second: AnyIterable<TSecond>,
  resultSelector?: (first: T, second: TSecond) => Awaitable<TResult>,
): AsyncOperatorFunction<T, [T, TSecond] | TResult> {
  return (source) =>
    lazyAsync(async function* () {
      const firstIterator = source[Symbol.asyncIterator]();
      const secondIterator = from(second)[Symbol.asyncIterator]();
      try {
        while (true) {
          // Pull both sides concurrently — an async-pull advantage over sequential pulls.
          const [a, b] = await Promise.all([firstIterator.next(), secondIterator.next()]);
          if (a.done || b.done) {
            return;
          }
          yield resultSelector
            ? await resultSelector(a.value, b.value)
            : ([a.value, b.value] as [T, TSecond]);
        }
      } finally {
        void firstIterator.return?.()?.catch(() => undefined);
        void secondIterator.return?.()?.catch(() => undefined);
      }
    });
}

// --- partitioning ---

export function take<T>(count = 0): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      if (count <= 0) {
        return;
      }
      let taken = 0;
      for await (const item of source) {
        yield item;
        if (++taken >= count) {
          return;
        }
      }
    });
}

export function takeWhile<T>(
  fn: (item: T, index: number) => Awaitable<boolean>,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      for await (const item of source) {
        if (!(await fn(item, index++))) {
          return;
        }
        yield item;
      }
    });
}

export function skip<T>(count = 0): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      for await (const item of source) {
        if (index++ >= count) {
          yield item;
        }
      }
    });
}

export function skipWhile<T>(
  fn: (item: T, index: number) => Awaitable<boolean>,
): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      let index = 0;
      let skipping = true;
      for await (const item of source) {
        if (skipping && !(await fn(item, index))) {
          skipping = false;
        }
        index++;
        if (!skipping) {
          yield item;
        }
      }
    });
}

// --- time ---

/**
 * Emits a value only after `ms` of silence from the source; values superseded
 * within the window are dropped. The pending value is flushed when the source
 * completes.
 *
 * Time-based operators are impossible in synchronous pull (see
 * why-no-debounce-in-pull.md). They become possible here by inverting pull to
 * push internally: a pump consumes the source eagerly, detached from
 * downstream demand, and the consumer is served from that internal flow.
 */
export function debounceTime<T>(ms: number): AsyncOperatorFunction<T, T> {
  return (source) =>
    lazyAsync(async function* () {
      const iterator = source[Symbol.asyncIterator]();

      const ready: T[] = [];
      let pending: { value: T } | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let done = false;
      let failure: unknown;
      let hasFailure = false;

      let wake: () => void = () => undefined;
      let sleep = new Promise<void>((resolve) => {
        wake = resolve;
      });
      const notify = (): void => {
        wake();
        sleep = new Promise<void>((resolve) => {
          wake = resolve;
        });
      };

      const flush = (): void => {
        if (pending) {
          ready.push(pending.value);
          pending = null;
          notify();
        }
      };

      // The pump: consumes the source eagerly, independent of consumer demand.
      void (async () => {
        try {
          while (true) {
            const result = await iterator.next();
            if (result.done) {
              return;
            }
            pending = { value: result.value };
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(flush, ms);
          }
        } catch (err) {
          hasFailure = true;
          failure = err;
        } finally {
          done = true;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          flush();
          notify();
        }
      })();

      try {
        while (true) {
          const wait = sleep;
          while (ready.length > 0) {
            yield ready.shift() as T;
          }
          if (hasFailure) {
            throw failure;
          }
          if (done) {
            if (ready.length === 0) {
              return;
            }
            continue;
          }
          await wait;
        }
      } finally {
        if (timer) {
          clearTimeout(timer);
        }
        void iterator.return?.()?.catch(() => undefined);
      }
    });
}

// --- terminal operators (eager, return promises) ---

export function aggregate<T>(
  fn: (accumulated: T, next: T) => Awaitable<T>,
): UnaryFunction<AsyncIterable<T>, Promise<T>>;
export function aggregate<T, TResult>(
  fn: (accumulated: T, next: T) => Awaitable<T>,
  resultSelector: (accumulated: T) => Awaitable<TResult>,
): UnaryFunction<AsyncIterable<T>, Promise<TResult>>;
export function aggregate<T, TAccumulate>(
  seed: TAccumulate,
  fn: (accumulated: TAccumulate, next: T) => Awaitable<TAccumulate>,
): UnaryFunction<AsyncIterable<T>, Promise<TAccumulate>>;
export function aggregate<T, TAccumulate, TResult>(
  seed: TAccumulate,
  fn: (accumulated: TAccumulate, next: T) => Awaitable<TAccumulate>,
  resultSelector: (accumulated: TAccumulate) => Awaitable<TResult>,
): UnaryFunction<AsyncIterable<T>, Promise<TResult>>;
export function aggregate<T>(
  ...args: readonly unknown[]
): UnaryFunction<AsyncIterable<T>, Promise<unknown>> {
  type Accumulator = (accumulated: unknown, next: T) => Awaitable<unknown>;
  type ResultSelector = (accumulated: unknown) => Awaitable<unknown>;

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

  return async (source) => {
    const iterator = source[Symbol.asyncIterator]();
    let seed = initialSeed;

    if (!seeded) {
      const first = await iterator.next();
      if (first.done) {
        throw new Error('Sequence contains no elements');
      }
      seed = first.value;
    }

    let current = await iterator.next();
    while (!current.done) {
      seed = await fn(seed, current.value);
      current = await iterator.next();
    }

    return resultSelector ? await resultSelector(seed) : seed;
  };
}

export function all<T>(
  fn: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<boolean>> {
  return async (source) => {
    for await (const item of source) {
      if (!(await fn(item))) {
        return false;
      }
    }
    return true;
  };
}

export function any<T>(
  fn: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<boolean>> {
  return async (source) => {
    for await (const item of source) {
      if (await fn(item)) {
        return true;
      }
    }
    return false;
  };
}

export function average(): UnaryFunction<AsyncIterable<number>, Promise<number>>;
export function average<T>(
  selector: (item: T) => Awaitable<number>,
): UnaryFunction<AsyncIterable<T>, Promise<number>>;
export function average<T>(
  selector?: (item: T) => Awaitable<number>,
): UnaryFunction<AsyncIterable<T>, Promise<number>> {
  return async (source) => {
    let total = 0;
    let count = 0;

    for await (const item of source) {
      total += selector ? await selector(item) : (item as unknown as number);
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
  tester: (item: T, value: T) => Awaitable<boolean> = (x, y): boolean => x === y,
): UnaryFunction<AsyncIterable<T>, Promise<boolean>> {
  return async (source) => {
    for await (const item of source) {
      if (await tester(item, value)) {
        return true;
      }
    }
    return false;
  };
}

export function count<T>(
  fn: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<number>> {
  return async (source) => {
    let total = 0;
    for await (const item of source) {
      if (await fn(item)) {
        total++;
      }
    }
    return total;
  };
}

export function first<T>(
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T>> {
  return async (source) => {
    for await (const item of source) {
      if (await selector(item)) {
        return item;
      }
    }
    throw new Error('Sequence contains no matching elements');
  };
}

export function firstOrDefault<T>(
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T | undefined>> {
  return async (source) => {
    for await (const item of source) {
      if (await selector(item)) {
        return item;
      }
    }
    return undefined;
  };
}

export function last<T>(
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T>> {
  return async (source) => {
    let result: T | undefined;
    let found = false;
    for await (const item of source) {
      if (await selector(item)) {
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
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T | undefined>> {
  return async (source) => {
    let result: T | undefined;
    for await (const item of source) {
      if (await selector(item)) {
        result = item;
      }
    }
    return result;
  };
}

export function single<T>(
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T>> {
  return async (source) => {
    let matched: T | undefined;
    let found = false;
    for await (const item of source) {
      if (await selector(item)) {
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
  selector: (item: T) => Awaitable<boolean> = alwaysTrue,
): UnaryFunction<AsyncIterable<T>, Promise<T | undefined>> {
  return async (source) => {
    let matched: T | undefined;
    let found = false;
    for await (const item of source) {
      if (await selector(item)) {
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

export function toArray<T>(): UnaryFunction<AsyncIterable<T>, Promise<T[]>> {
  return async (source) => {
    const items: T[] = [];
    for await (const item of source) {
      items.push(item);
    }
    return items;
  };
}
