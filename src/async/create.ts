import { AsyncEnumerable } from './async-enumerable.js';

export function from<T>(source: Iterable<T> | AsyncIterable<T>): AsyncEnumerable<T> {
  return new AsyncEnumerable<T>({
    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
      yield* source;
    },
  });
}

export function of<T>(...items: T[]): AsyncEnumerable<T> {
  return from(items);
}

export function range(start = 0, count = 0): AsyncEnumerable<number> {
  return new AsyncEnumerable<number>({
    async *[Symbol.asyncIterator](): AsyncGenerator<number> {
      for (let i = 0; i < count; i++) {
        yield start + i;
      }
    },
  });
}

export function repeat<T>(item: T, count = 0): AsyncEnumerable<T> {
  return new AsyncEnumerable<T>({
    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
      for (let i = 0; i < count; i++) {
        yield item;
      }
    },
  });
}
