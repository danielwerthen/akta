import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { createDependency, DependencyMap, Dependency } from './dependency-map';
import { AllNamespaces, isEvent } from './element-ops';
import { lazy } from './lazy-function';
import MetaObject, { MethodMissing } from './meta-object';
import { createSyncContext } from './sync-context';
import { AktaNode, ElementProperties } from './types';

export const dependencyContext = createSyncContext<DependencyMap>();

export const continuationDependency = createDependency(lazy());
export type TeardownFunction = () => void;
export const teardownDependency = createDependency<null | TeardownFunction[]>(
  null
);

export const elementsDependency = createDependency(new AllNamespaces());

export function useNext<T extends AktaNode, RETURN extends AktaNode, NEXT>(
  _input?: () => Generator<T, RETURN, NEXT> | AsyncGenerator<T, RETURN, NEXT>
): (input: NEXT) => Promise<void> {
  const ctx = dependencyContext.getContext();
  return (input: NEXT) => {
    return firstValueFrom(
      ctx.observe(continuationDependency).pipe(switchMap(next => next(input)))
    ).then(() => void 0);
  };
}

export function useTeardown(fn: TeardownFunction) {
  const ctx = dependencyContext.getContext();
  ctx.provide(teardownDependency, fns => {
    if (!fns) {
      return [fn];
    }
    fns.push(fn);
    return fns;
  });
}

export function useProvideDependency<T>(
  dep: Dependency<T>,
  value: T | ((old?: T) => T)
) {
  const ctx = dependencyContext.getContext();
  ctx.provide(dep, value);
}

export function useDependency<T>(dep: Dependency<T>): Observable<T> {
  const ctx = dependencyContext.getContext();
  return ctx.observe(dep);
}

export function useContext(): DependencyMap {
  return dependencyContext.getContext();
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
