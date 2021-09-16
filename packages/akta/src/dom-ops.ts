import { from, isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  continuationDependency,
  dependecyContext,
  teardownDependency,
} from './dependencies';
import { DependencyMap } from './dependency-map';
import { lazy } from './lazy-function';
import { AktaComponent, AktaNode } from './types';

function isGenerator(
  obj: unknown
): obj is Generator<any, any, any> | AsyncGenerator<any, any, any> {
  if (!obj) {
    return false;
  }
  if (typeof obj === 'object') {
    return typeof (obj as Generator<any, any, any>).next === 'function';
  }
  return false;
}

export function callComponent<PROPS>(
  component: AktaComponent<PROPS>,
  props: PROPS,
  parentDeps: DependencyMap
): [ReturnType<AktaComponent<PROPS>>, DependencyMap] {
  const deps = parentDeps.branch();
  deps.provide(teardownDependency, []);
  try {
    dependecyContext.setContextUnsafe(deps);
    const element = component(props);
    if (!element) {
      return [null, deps];
    }
    if (isObservable(element)) {
      return [element, deps];
    }
    if (isGenerator(element)) {
      const continuation = lazy();
      deps.provide(continuationDependency, continuation);
      try {
        dependecyContext.setContextUnsafe(deps);
        const generated = element.next();
        const observable = new Observable<AktaNode>(subscriber => {
          Promise.resolve(generated).then(({ value, done }) => {
            subscriber.next(value);
            if (done) {
              subscriber.complete();
              return;
            }
            let isComplete = false;
            continuation.define(input => {
              if (isComplete) {
                return of();
              }
              try {
                dependecyContext.setContextUnsafe(deps);
                const generated = element.next(input);
                return from(Promise.resolve(generated)).pipe(
                  map(({ value, done }) => {
                    if (isComplete) {
                      return;
                    }
                    subscriber.next(value);
                    if (done) {
                      isComplete = true;
                      subscriber.complete();
                      return;
                    }
                  })
                );
              } finally {
                dependecyContext.resetContextUnsafe();
              }
            });
          });
        });
        return [observable, deps];
      } finally {
        dependecyContext.resetContextUnsafe();
      }
    }
    return [element, deps];
  } finally {
    dependecyContext.resetContextUnsafe();
  }
}
