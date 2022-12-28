import { from, isObservable, Observable, of } from 'rxjs';
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

function isIteratorResult(obj: unknown): obj is IteratorResult<unknown> {
  if (obj && typeof obj === 'object') {
    return Reflect.has(obj, 'value') && Reflect.has(obj, 'done');
  }
  return false;
}

export function callComponent<PROPS>(
  runComponent: AktaComponent<PROPS>,
  props: PROPS,
  parentDeps: DependencyMap
): [ReturnType<AktaComponent<PROPS>>, DependencyMap] {
  const deps = parentDeps.branch();
  deps.provide(teardownDependency, []);
  try {
    dependecyContext.setContextUnsafe(deps);
    const element = runComponent(props);
    if (!element) {
      return [null, deps];
    }
    if (isObservable(element)) {
      return [element, deps];
    }
    if (isGenerator(element)) {
      const continuation = lazy();
      deps.provide(continuationDependency, () => continuation);
      try {
        dependecyContext.setContextUnsafe(deps);
        const generated = element.next();
        const observable = new Observable<AktaNode>(subscriber => {
          let isDefined = false;
          function process({
            value,
            done,
          }: IteratorResult<AktaNode, AktaNode>) {
            subscriber.next(value);
            if (done) {
              subscriber.complete();
              return;
            }
            if (!isDefined) {
              isDefined = true;
              continuation.define(input => {
                if (!isGenerator(element)) {
                  return of();
                }
                try {
                  dependecyContext.setContextUnsafe(deps);
                  const generated = element.next(input);
                  if (isIteratorResult(generated)) {
                    process(generated);
                    return of();
                  } else {
                    return from(Promise.resolve(generated).then(process));
                  }
                } finally {
                  dependecyContext.resetContextUnsafe();
                }
              });
            }
          }
          if (isIteratorResult(generated)) {
            process(generated);
          } else {
            Promise.resolve(generated).then(process);
          }
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
