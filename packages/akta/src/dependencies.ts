import { BehaviorSubject, firstValueFrom, Subject, switchMap } from 'rxjs';
import { createDependency, DependencyMap } from './dependency-map';
import { AllElements, isEvent } from './element-ops';
import { lazy } from './lazy-function';
import MetaObject, { MethodMissing } from './meta-object';
import { createSyncContext } from './sync-context';
import { AktaNode, ElementProperties } from './types';

export const dependecyContext = createSyncContext<DependencyMap>();

export const continuationDependency = createDependency(lazy());
export type TeardownFunction = () => void;
export const teardownDependency = createDependency<null | TeardownFunction[]>(
  null
);

export const elementsDependency = createDependency(new AllElements());

export function useNext<T extends AktaNode, RETURN extends AktaNode, NEXT>(
  _input?: () => Generator<T, RETURN, NEXT> | AsyncGenerator<T, RETURN, NEXT>
): (input: NEXT) => Promise<void> {
  const ctx = dependecyContext.getContext();
  return (input: NEXT) => {
    return firstValueFrom(
      ctx(continuationDependency).pipe(switchMap(next => next(input)))
    ).then(() => void 0);
  };
}

export function useTeardown(fn: TeardownFunction) {
  const ctx = dependecyContext.getContext();
  ctx.provide(teardownDependency, fns => {
    if (!fns) {
      return [fn];
    }
    fns.push(fn);
    return fns;
  });
}

export class PropertiesBase extends MetaObject<
  | ((factory?: () => Subject<unknown>) => Subject<unknown>)
  | ((start?: unknown) => Subject<unknown>)
> {
  [MethodMissing](key: string) {
    if (isEvent(key)) {
      return (factory?: () => Subject<unknown>) =>
        factory ? factory() : new Subject();
    } else {
      return (initialValue?: unknown) => {
        if (initialValue === undefined) {
          return new Subject();
        } else {
          return new BehaviorSubject(initialValue);
        }
      };
    }
  }
}

const propertiesBase = new PropertiesBase();
export class ElementPropertiesBase extends MetaObject<PropertiesBase> {
  [MethodMissing](_key: string) {
    return propertiesBase;
  }
}

export const Props: ElementProperties = (new ElementPropertiesBase() as unknown) as ElementProperties;
