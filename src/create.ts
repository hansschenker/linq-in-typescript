import { Enumerable } from './enumerable.js';

export function from<T>(source: Iterable<T>): Enumerable<T> {
  return new Enumerable<T>(source);
}

export const asEnumerable = from;

export function of<T>(...items: T[]): Enumerable<T> {
  return new Enumerable<T>(items);
}

export function range(start = 0, count = 0): Enumerable<number> {
  return new Enumerable<number>({
    *[Symbol.iterator]() {
      for (let i = 0; i < count; i++) {
        yield start + i;
      }
    },
  });
}

export function repeat<T>(item: T, count = 0): Enumerable<T> {
  return new Enumerable<T>({
    *[Symbol.iterator]() {
      for (let i = 0; i < count; i++) {
        yield item;
      }
    },
  });
}
