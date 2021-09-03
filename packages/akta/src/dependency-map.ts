import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type EagerDependency<T> = {
  key: symbol;
  value: T;
};
type LazyDependency<T> = {
  key: symbol;
  init: () => T;
};

export type Dependency<T> = EagerDependency<T> | LazyDependency<T>;

export function isLazyDependency<T>(
  dep: Dependency<T>
): dep is LazyDependency<T> {
  return typeof (dep as LazyDependency<T>).init === 'function';
}

export function getInitialValue<T>(dep: Dependency<T>): T {
  if (isLazyDependency(dep)) {
    return dep.init();
  }
  return dep.value;
}

export type DependencyMap = {
  <T>(dep: Dependency<T>): Observable<T>;
  use<T>(dep: Dependency<T>): Observable<T>;
  get<T>(dep: Dependency<T>): T;
  provide<T>(dep: Dependency<T>, value: T | ((old?: T) => T)): void;
  branch(): DependencyMap;
};

const LocalStop = Symbol('Dependency stopper');

export function createDependencyMap(parent?: DependencyMap): DependencyMap {
  const store: Map<Symbol, BehaviorSubject<unknown>> = new Map();
  function getLocal<T>(dep: Dependency<T>): BehaviorSubject<T> {
    const subject = store.get(dep.key) ?? new BehaviorSubject(LocalStop);
    if (!store.has(dep.key)) {
      store.set(dep.key, subject);
    }
    return subject as BehaviorSubject<T>;
  }
  function dependencyMap<T>(dep: Dependency<T>): Observable<T> {
    const subject = getLocal(dep);
    return subject.pipe(
      switchMap(val => {
        if ((val as unknown) === LocalStop) {
          return parent ? parent(dep) : of(getInitialValue(dep));
        }
        return of(val);
      })
    );
  }
  const map: DependencyMap = dependencyMap as DependencyMap;

  map.branch = () => createDependencyMap(map);
  map.provide = (dep, value) => {
    const subject = getLocal(dep);
    if (typeof value === 'function') {
      const fn = value as <T>(old?: T) => T;
      subject.next(fn(map.get(dep) ?? undefined));
    } else {
      subject.next(value);
    }
  };
  map.use = dep => {
    return parent ? parent(dep) : of(getInitialValue(dep));
  };
  map.get = <T>(dep: Dependency<T>): T => {
    const local = store.get(dep.key)?.value as T;
    if (!local || (local as unknown) === LocalStop) {
      const parVal = parent?.get(dep) as T;
      if (!parVal || (parVal as unknown) === LocalStop) {
        return getInitialValue(dep);
      }
      return parVal;
    }
    return local;
  };
  return map;
}

export function createDependency<T>(initialValue: T): Dependency<T> {
  return {
    key: Symbol('Dependency'),
    value: initialValue,
  };
}

export function createLazyDependency<T>(init: () => T): Dependency<T> {
  return {
    key: Symbol('Dependency'),
    init,
  };
}
