import { createSyncContext } from "./sync-context";

describe("Sync context", () => {
  it("should provide the provided context syncronously", () => {
    const provider = createSyncContext<number>();
    const result = provider.setContext(() => {
      return provider.getContext();
    }, 5);
    expect(result).toBe(5);
  });
  it("should provide the provided context syncronously and nested", () => {
    const provider = createSyncContext<number>();
    const result = provider.setContext(() => {
      {
        const provider = createSyncContext<number>();
        const result = provider.setContext(() => {
          {
            const provider = createSyncContext<number>();
            const result = provider.setContext(() => {
              return provider.getContext();
            }, 36);
            expect(result).toBe(36);
          }
          return provider.getContext();
        }, 42);
        expect(result).toBe(42);
      }
      return provider.getContext();
    }, 5);
    expect(result).toBe(5);
  });
});
