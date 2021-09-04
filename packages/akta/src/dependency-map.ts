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

const LocalStop = Symbol('Dependency stopper');

export function getInitialValue<T>(dep: Dependency<T>): T {
  if (isLazyDependency(dep)) {
    return dep.init();
  }
  return dep.value;
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

export class DependencyMap {
  private store: Map<Symbol, BehaviorSubject<unknown>> = new Map();
  parent?: DependencyMap;
  constructor(parent?: DependencyMap) {
    this.parent = parent;
  }

  private getLocal<T>(dep: Dependency<T>): BehaviorSubject<T> {
    const { key } = dep;
    const subject = this.store.get(key) ?? new BehaviorSubject(LocalStop);
    if (!this.store.has(key)) {
      this.store.set(key, subject);
    }
    return subject as BehaviorSubject<T>;
  }
  observe<T>(dep: Dependency<T>): Observable<T> {
    const subject = this.getLocal(dep);
    return subject.pipe(
      switchMap(val => {
        if ((val as unknown) === LocalStop) {
          return this.parent
            ? this.parent.observe(dep)
            : of(getInitialValue(dep));
        }
        return of(val);
      })
    );
  }
  peek<T>(dep: Dependency<T>): T {
    const value = this.getLocal(dep).value as unknown;
    if (value !== LocalStop) {
      return value as T;
    }
    if (this.parent) {
      return this.parent.peek(dep);
    }
    return getInitialValue(dep);
  }
  branch(): DependencyMap {
    return new DependencyMap(this);
  }
  provide<T>(dep: Dependency<T>, value: T | ((old?: T) => T)) {
    const subject = this.getLocal(dep);
    if (typeof value === 'function') {
      const fn = value as <T>(old?: T) => T;
      subject.next(fn(this.peek(dep) ?? undefined));
    } else {
      subject.next(value);
    }
  }
  unprovide(dep: Dependency<unknown>): unknown {
    const subject = this.getLocal(dep);
    const prev = subject.value;
    if (prev !== LocalStop) {
      subject.next(LocalStop);
      return prev;
    }
    return;
  }
}
