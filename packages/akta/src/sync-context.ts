export function createSyncContext<T>() {
  const stack: T[] = [];
  return {
    setContext<OUTPUT>(fn: () => OUTPUT, ctx: T) {
      try {
        stack.unshift(ctx);
        return fn();
      } finally {
        stack.shift();
      }
    },
    setContextUnsafe(ctx: T) {
      stack.unshift(ctx);
    },
    resetContextUnsafe() {
      stack.shift();
    },
    getContext(): T {
      return stack[0];
    },
  };
}
