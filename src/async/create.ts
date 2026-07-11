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
