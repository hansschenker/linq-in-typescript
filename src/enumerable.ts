export type UnaryFunction<T, R> = (source: T) => R;

export type OperatorFunction<T, R> = UnaryFunction<Iterable<T>, Enumerable<R>>;

export type Predicate<T> = (item: T) => boolean;
export type IndexedPredicate<T> = (item: T, index: number) => boolean;
export type IndexedSelector<T, TResult> = (item: T, index: number) => TResult;

export class Enumerable<T> implements Iterable<T> {
  private readonly source: Iterable<T>;

  constructor(source: Iterable<T> = []) {
    this.source = source;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.source[Symbol.iterator]();
  }

  pipe(): Enumerable<T>;
  pipe<A>(op1: UnaryFunction<Enumerable<T>, A>): A;
  pipe<A, B>(op1: UnaryFunction<Enumerable<T>, A>, op2: UnaryFunction<A, B>): B;
  pipe<A, B, C>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
  ): C;
  pipe<A, B, C, D>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
  ): D;
  pipe<A, B, C, D, E>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
  ): E;
  pipe<A, B, C, D, E, F>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
  ): F;
  pipe<A, B, C, D, E, F, G>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
  ): G;
  pipe<A, B, C, D, E, F, G, H>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>,
  ): H;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: UnaryFunction<Enumerable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>,
    op9: UnaryFunction<H, I>,
  ): I;
  pipe(...operations: ReadonlyArray<UnaryFunction<never, unknown>>): unknown {
    let result: unknown = this;
    for (const operation of operations) {
      result = (operation as UnaryFunction<unknown, unknown>)(result);
    }
    return result;
  }
}
