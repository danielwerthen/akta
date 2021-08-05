import { Observable, ObservableInput, ReplaySubject } from "rxjs";
import { switchMap } from "rxjs/operators";

export type LazyFunction<INPUT, OUTPUT> = {
  (input: INPUT): Observable<OUTPUT>;
  define(fn: (input: INPUT) => Observable<OUTPUT>): void;
};

export type LazyDefinition<INPUT, OUTPUT> = (
  input: INPUT
) => ObservableInput<OUTPUT>;

export class RedefitionError extends Error {
  constructor() {
    super("It is not possible to redefine a lazy function.");
  }
}

export function lazy<INPUT, OUTPUT>(): LazyFunction<INPUT, OUTPUT> {
  const definition: ReplaySubject<LazyDefinition<INPUT, OUTPUT>> =
    new ReplaySubject(1);
  const result = function lazyFunction(input: INPUT) {
    return definition.pipe(switchMap((fn) => fn(input)));
  } as LazyFunction<INPUT, OUTPUT>;
  let isComplete = false;
  result.define = (fn) => {
    if (isComplete) {
      throw new RedefitionError();
    }
    definition.next(fn);
    isComplete = true;
  };
  return result;
}
