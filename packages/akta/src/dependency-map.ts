import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export type Dependency<T> = {
  key: symbol;
  value: T;
};

export type DependencyMap = {
  <T>(dep: Dependency<T>): Observable<T>;
  use<T>(dep: Dependency<T>): Observable<T>;
  get<T>(dep: Dependency<T>): T | null;
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
          return parent ? parent(dep) : of(dep.value);
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
    return parent ? parent(dep) : of(dep.value);
  };
  map.get = <T>(dep: Dependency<T>) => {
    const local = store.get(dep.key)?.value as T;
    if (!local || (local as unknown) === LocalStop) {
      const parVal = parent?.get(dep) as T;
      if (!parVal || (parVal as unknown) === LocalStop) {
        return dep.value;
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
