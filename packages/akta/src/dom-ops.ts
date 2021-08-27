import {
  combineLatest,
  firstValueFrom,
  from,
  isObservable,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { filter, map, mapTo, switchMap } from 'rxjs/operators';
import {
  continuationDependency,
  dependecyContext,
  elementsDependency,
  teardownDependency,
  useTeardown,
} from './dependencies';
import { DependencyMap } from './dependency-map';
import { jsx } from './jsx-runtime';
import { lazy } from './lazy-function';
import { attachChildren } from './mount-ops';
import {
  AktaComponent,
  AktaElement,
  AktaNode,
  AktaPreparedComponent,
  isAktaElement,
} from './types';

function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

const emptyNode = () => document.createTextNode('');

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

export function produceElement(
  node: AktaElement,
  deps: DependencyMap
): Observable<ChildNode> | ChildNode {
  const { type, props } = node;
  if (typeof type === 'string') {
    const element = document.createElement(type);
    const observables: Observable<unknown>[] = [];

    const elements = deps.get(elementsDependency);
    for (var key in props) {
      const observable =
        key === 'children'
          ? attachChildren(element, props[key] as AktaNode, deps)
          : elements[type][key](element, props[key]);
      if (observable) {
        observables.push(observable.pipe(filter(onlyFirst)));
      }
    }
    if (observables.length < 1) {
      return element;
    }
    return combineLatest(observables).pipe(mapTo(element));
  } else if (type === AktaPreparedComponent) {
    return props.children as Observable<ChildNode>;
  } else if (typeof type === 'function') {
    const [element, nextDeps] = callComponent(type, props, deps);

    const output = produceElements(element, nextDeps);
    const fns = nextDeps.get(teardownDependency);
    if ((fns?.length ?? 0) < 1) {
      return output;
    }
    return new Observable(sub => {
      sub.add(() => {
        if (fns) {
          fns.forEach(item => item());
        }
      });
      if (isObservable(output)) {
        return output.subscribe({
          next: val => {
            sub.next(val);
          },
          error: val => {
            sub.error(val);
          },
          complete: undefined,
        });
      }
      sub.next(output);
      return;
    });
  } else {
    return emptyNode();
  }
}

function isPromise(obj: unknown): obj is Promise<unknown> {
  return typeof (obj as Promise<unknown>)?.then === 'function';
}

function produceElements(
  node: AktaNode,
  deps: DependencyMap
): Observable<ChildNode> | ChildNode {
  if (isObservable(node)) {
    return node.pipe(
      switchMap(innerNode => {
        const item = produceElements(innerNode, deps);
        return isObservable(item) ? item : of(item);
      })
    );
  } else if (isPromise(node)) {
    return from(node).pipe(
      switchMap((innerNode: AktaNode) => {
        const item = produceElements(innerNode, deps);
        return isObservable(item) ? item : of(item);
      })
    );
  } else if (isAktaElement(node)) {
    return produceElement(node, deps);
  } else {
    return document.createTextNode(node ? node.toString() : '');
  }
}

export function usePrepare(element: AktaNode): Promise<AktaNode> {
  const dependencies = dependecyContext.getContext();

  const children = produceElements(element, dependencies);
  if (isObservable(children)) {
    const subject = new ReplaySubject<ChildNode>(1);
    const sub = children.subscribe(subject);
    useTeardown(() => sub.unsubscribe());
    return firstValueFrom(subject).then(() => {
      return jsx(AktaPreparedComponent, { children: subject.asObservable() });
    });
  }
  return Promise.resolve(
    jsx(AktaPreparedComponent, { children: of(children) })
  );
}
