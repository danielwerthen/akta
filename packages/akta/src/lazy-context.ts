export const LazySymbol = Symbol("Lazy storage");
export type LazyInit<T> = {
  (): T,
  [LazySymbol]?: T,
}

export type NotFunction<T> = T extends Function ? never : T;
export function createLazyContext<T extends NotFunction<{}>>() {
  type Initialize = () => T;
  const stack: Initialize[] = [];
  return {
    setContextUnsafe(ctx: Initialize) {
      stack.unshift(ctx);
    },
    resetContextUnsafe() {
      stack.shift();
    },
    get(): () => T {
      const init = stack[0];
      return () => (init as LazyInit<T>)[LazySymbol] ??= init();
    },
    peek(): T | undefined {
      const init = stack[0];
      return (init as LazyInit<T>)[LazySymbol];
    }
  };
}
