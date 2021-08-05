import { firstValueFrom, of } from "rxjs";
import { lazy, RedefitionError } from "./lazy-function";

describe("lazy", () => {
  it("should return after definition", async () => {
    const fn = lazy<number, number>();
    const response1 = firstValueFrom(fn(5));
    fn.define((nr) => of(nr + 1));
    expect(await response1).toBe(6);
  });
  it("should support synchronous returns", () => {
    const fn = lazy<number, number>();
    const response1 = fn(5);
    const mock = jest.fn();
    response1.subscribe(mock);
    fn.define((nr) => of(nr + 1));
    expect(mock.mock.calls).toEqual([[6]]);
  });
  it("should throw after redefinition", async () => {
    const fn = lazy<number, number>();
    fn.define((nr) => of(nr + 1));
    expect(() => fn.define(() => of(5))).toThrow(RedefitionError);
  });
});
