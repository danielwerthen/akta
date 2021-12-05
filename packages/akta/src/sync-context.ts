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
    resetContextUnsafe(ctx?: T) {
      const prev = stack.shift();
      if (ctx && ctx !== prev) {
        throw new Error('Sync Context was manipulated incorrectly');
      }
    },
    getContext(): T {
      return stack[0];
    },
  };
}
