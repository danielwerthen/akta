import { TeardownFunction } from './dependencies';
import { from, isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  continuationDependency,
  dependecyContext,
  teardownDependency,
} from './dependencies';
import { DependencyMap } from './dependency-map';
import { lazy } from './lazy-function';
import { RenderingContext } from './rendering-context';
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
function isPromise(obj: unknown): obj is Promise<unknown> {
  return obj ? typeof (obj as Promise<unknown>).then === 'function' : false;
}

function setupTeardown(deps: DependencyMap, ctx: RenderingContext) {
  const teardowns: TeardownFunction[] = [];
  deps.provide(teardownDependency, teardowns);
  ctx.teardowns.push(() => teardowns.forEach(i => i()));
}

export function renderComponent<PROPS>(
  runComponent: AktaComponent<PROPS>,
  props: PROPS,
  ctx: RenderingContext,
  parentDeps: DependencyMap
): AktaNode {
  const deps = parentDeps.branch();
  setupTeardown(deps, ctx);
  try {
    dependecyContext.setContextUnsafe(deps);
    const element = runComponent(props);
    if (!element) {
      return null;
    }
    if (isObservable(element)) {
      return element;
    }
    if (isGenerator(element)) {
      const generator = element;
      const continuation = lazy();
      deps.provide(continuationDependency, () => continuation);
      try {
        dependecyContext.setContextUnsafe(deps);
        const initial = generator.next();
        const observable = new Observable<AktaNode>(subscriber => {
          function mapGenerated({
            value,
            done,
          }: IteratorResult<AktaNode, AktaNode>) {
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
                const generated = generator.next(input);
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
          }
          if (isPromise(initial)) {
            Promise.resolve(initial).then(mapGenerated);
          } else {
            mapGenerated(initial);
          }
        });
        return observable;
      } finally {
        dependecyContext.resetContextUnsafe();
      }
    }
    return element;
  } finally {
    dependecyContext.resetContextUnsafe();
  }
}
