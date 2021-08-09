import {
  combineLatest,
  firstValueFrom,
  from,
  isObservable,
  Observable,
  of,
} from 'rxjs';
import { filter, finalize, map, mapTo, switchMap, tap } from 'rxjs/operators';
import {
  continuationDependency,
  dependecyContext,
  teardownDependency,
} from './dependencies';
import { createDependencyMap, DependencyMap } from './dependency-map';
import { AllElements, mountElement, unmountElement } from './element-ops';
import { lazy } from './lazy-function';
import {
  AktaAllElements,
  AktaComponent,
  AktaElement,
  isAktaElement,
} from './types';

type AktaContext = {
  intrinsic: AllElements;
  dependencies: DependencyMap;
};

function applyProp(
  element: HTMLElement,
  type: string,
  key: string,
  value: unknown,
  ctx: AktaContext
): Observable<unknown> | void {
  return ctx.intrinsic[type][key](element, value);
}

function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

const emptyNode = () => document.createTextNode('');

function isGenerator(
  obj: unknown
): obj is Generator<any, any, any> | AsyncGenerator<any, any, any> {
  if (typeof obj === 'object') {
    return typeof (obj as Generator<any, any, any>).next === 'function';
  }
  return false;
}

export function callComponent<PROPS>(
  component: AktaComponent<PROPS>,
  props: PROPS,
  parentDeps: DependencyMap
): [AktaAllElements, DependencyMap] {
  const deps = parentDeps.branch();
  const element = dependecyContext.setContext(() => {
    return component(props);
  }, deps);
  if (isObservable(element)) {
    return [element, deps];
  }
  if (isGenerator(element)) {
    const continuation = lazy();
    deps.provide(continuationDependency, continuation);
    const generated = dependecyContext.setContext(() => {
      return element.next();
    }, deps);
    const observable = new Observable<AktaAllElements>(subscriber => {
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
          const generated = dependecyContext.setContext(() => {
            return element.next(input);
          }, deps);
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
        });
      });
    });
    return [observable, deps];
  }
  return [element, deps];
}

function applyChildren(
  children: AktaAllElements | AktaAllElements[],
  parent: HTMLElement,
  ctx: AktaContext
): Observable<unknown> {
  if (Array.isArray(children)) {
    const observables = children
      .map(child => produceElements(child, ctx))
      .map(observedChild => {
        let oldNode: HTMLElement | Text | undefined;
        return observedChild.pipe(
          tap(newNode => {
            if (oldNode) {
              unmountElement(oldNode);
              mountElement(newNode);
              parent.replaceChild(newNode, oldNode);
            } else {
              parent.appendChild(newNode);
              mountElement(newNode);
            }
            oldNode = newNode;
          }),
          filter(onlyFirst)
        );
      });
    return combineLatest(observables).pipe(mapTo(void 0));
  }
  let oldNode: HTMLElement | Text;
  return produceElements(children, ctx).pipe(
    tap(newNode => {
      if (oldNode) {
        parent.replaceChild(newNode, oldNode);
        mountElement(newNode);
        unmountElement(oldNode);
      } else {
        parent.appendChild(newNode);
        mountElement(newNode);
      }
      oldNode = newNode;
    }),
    filter(onlyFirst)
  );
}

function produceElement(
  node: AktaElement,
  ctx: AktaContext
): Observable<HTMLElement | Text> {
  const { type, props } = node;
  if (typeof type === 'string') {
    const element = document.createElement(type);
    const observables: Observable<unknown>[] = [];
    for (var key in props) {
      const observable =
        key === 'children'
          ? applyChildren(props[key] as AktaAllElements, element, ctx)
          : applyProp(element, type, key, props[key], ctx);
      if (observable) {
        observables.push(observable.pipe(filter(onlyFirst)));
      }
    }
    if (observables.length < 1) {
      return of(element);
    }
    return combineLatest(observables).pipe(mapTo(element));
  } else if (typeof type === 'function') {
    const [element, dependencies] = callComponent(
      type,
      props,
      ctx.dependencies
    );

    const teardown = dependencies.get(teardownDependency);
    const output = produceElements(element, { ...ctx, dependencies });
    if (teardown) {
      return output.pipe(finalize(teardown));
    }
    return output;
  } else {
    return of(emptyNode());
  }
}

function isPromise(obj: unknown): obj is Promise<unknown> {
  return typeof (obj as Promise<unknown>)?.then === 'function';
}

function produceElements(
  node: AktaAllElements,
  ctx: AktaContext
): Observable<HTMLElement | Text> {
  if (isObservable(node)) {
    return node.pipe(
      switchMap(innerNode => {
        return produceElements(innerNode, ctx);
      })
    );
  } else if (isPromise(node)) {
    return from(node).pipe(
      switchMap((innerNode: AktaAllElements) => {
        return produceElements(innerNode, ctx);
      })
    );
  } else if (isAktaElement(node)) {
    return produceElement(node, ctx);
  } else {
    return of(document.createTextNode(node.toString()));
  }
}

export function prepare(
  element: AktaAllElements,
  root: HTMLElement
): Promise<void> {
  const dependencies = dependecyContext.getContext();
  const ctx = {
    dependencies,
    intrinsic: new AllElements(),
  };
  return firstValueFrom(applyChildren(element, root, ctx).pipe(mapTo(void 0)));
}

export function mount(element: AktaAllElements, root: HTMLElement) {
  const ctx = {
    dependencies: createDependencyMap(),
    intrinsic: new AllElements(),
  };
  const sub = applyChildren(element, root, ctx).subscribe();

  return () => sub.unsubscribe();
}
