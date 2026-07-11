import { AsyncEnumerable } from './async-enumerable.js';
import type { AsyncOperatorFunction } from './async-enumerable.js';
import type { UnaryFunction } from '../enumerable.js';

function lazyAsync<T>(generator: () => AsyncGenerator<T>): AsyncEnumerable<T> {
  return new AsyncEnumerable<T>({ [Symbol.asyncIterator]: generator });
}

export function where<T>(
  selector: (item: T, index: number) => boolean | Promise<boolean>,
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
  fn: (item: T, index: number) => TResult | Promise<TResult>,
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

export function toArray<T>(): UnaryFunction<AsyncIterable<T>, Promise<T[]>> {
  return async (source) => {
    const items: T[] = [];
    for await (const item of source) {
      items.push(item);
    }
    return items;
  };
}

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
