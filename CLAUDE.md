# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`linq-in-typescript` — a TypeScript rewrite of Aaron Powell's `linq-in-javascript` (.NET LINQ over iterables), reshaped around RxJS-v6-style pipeable operators. Lazy, re-iterable sequences built on generators.

## Commands

- Test: `npm test` (Vitest, runs directly on TS sources — no build needed)
- Single test file: `npx vitest run test/where.test.ts`
- Type-check: `npm run typecheck`
- Build: `npm run build` (tsc → ESM + `.d.ts` into `dist/`, gitignored)

## Architecture

- `src/enumerable.ts` — the minimal `Enumerable<T>` class: wraps an `Iterable<T>`, implements `[Symbol.iterator]`, and has a typed `.pipe(...)` method (overloaded to 9 operators, RxJS-style). No query logic lives on the class.
- `src/operators.ts` — all operators as standalone pipeable factories, `where(pred) => (source) => Enumerable`. Two kinds:
  - **Lazy sequence operators** (`where`, `select`, `selectMany`, `groupBy`, `join/groupJoin`, `orderBy/thenBy` + descending variants, `distinct`, `union/intersect/except`, `concat`, `zip`, `take/takeWhile`, `skip/skipWhile`) return `OperatorFunction<T, R>` and build re-iterable enumerables via the local `lazy()` helper (an object whose `[Symbol.iterator]` is a fresh generator per iteration — this is what makes sequences re-iterable; never return a raw generator, it's one-shot).
  - **Terminal operators** (`toArray`, `count`, `first`, `aggregate`, ...) return `UnaryFunction<Iterable<T>, Result>` — pipeable but produce a plain value.
- `src/create.ts` — `from`/`asEnumerable`, `of`, `range`, `repeat` creation functions (no `Array.prototype` patching, unlike the original).
- `src/pipe.ts` — standalone `pipe()` for composing reusable operator chains without a source.
- `src/index.ts` re-exports everything; `package.json` also exposes an `./operators` subpath.

Operators accept `Iterable<T>` (not just `Enumerable<T>`) so composed chains work on arrays too. Laziness is load-bearing and tested: items flow through the entire pipeline one at a time ("lazy fashion" tests iterate arrays of functions where evaluating a skipped item throws).

Behavior intentionally differs from the JS original in fixed bugs: `first`/`last` work for falsy values, `selectMany` genuinely flattens (result selector receives each flattened element), `repeat` yields the same reference instead of JSON-cloning, and sequences are re-iterable (the once-skipped "multiple passes" test now runs).

## Conventions

- ESM-only (`"type": "module"`), NodeNext resolution — relative imports need `.js` extensions.
- TypeScript strict, no `any` (use `unknown` + casts in overload implementations, `never` in variadic impl signatures).
- One test file per operator in `test/`, mirroring the original repo's suite.
