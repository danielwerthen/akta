import {
  combineLatest,
  firstValueFrom,
  from,
  isObservable,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import {
  continuationDependency,
  dependecyContext,
  teardownDependency,
  useTeardown,
} from './dependencies';
import { createDependencyMap, DependencyMap } from './dependency-map';
import { AllElements, mountElement, unmountElement } from './element-ops';
import { jsx } from './jsx-runtime';
import { lazy } from './lazy-function';
import {
  AktaAllElements,
  AktaComponent,
  AktaElement,
  AktaNode,
  AktaPreparedComponent,
  isAktaElement,
} from './types';

type AktaContext = {
  intrinsic: AllElements;
  dependencies: DependencyMap;
};

type DOMNode = HTMLElement | Text;

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
  children: AktaNode,
  parent: HTMLElement,
  ctx: AktaContext
): Observable<unknown> | void {
  if (!children) {
    return;
  } else if (typeof children === 'string') {
    parent.appendChild(document.createTextNode(children));
    return;
  }
  if (Array.isArray(children)) {
    let lineup: (HTMLElement | Text)[] | null = [];
    const observables = children
      .map((child: AktaAllElements, idx) => {
        const item = produceElements(child, ctx);
        if (isObservable(item)) {
          return item.pipe(
            map(newNode => {
              if (lineup) {
                lineup[idx] = newNode;
              } else {
                const oldNode = parent.childNodes[idx];
                if (oldNode instanceof HTMLElement) {
                  unmountElement(oldNode);
                }
                parent.childNodes[idx].replaceWith(newNode);
                mountElement(newNode);
              }
              return newNode;
            }),
            filter<HTMLElement | Text>(onlyFirst)
          );
        }
        if (lineup) {
          lineup[idx] = item;
        } else {
          parent.appendChild(item);
          mountElement(item);
        }
        return;
      })
      .filter<Observable<DOMNode>>(
        (item: unknown): item is Observable<DOMNode> => !!item
      );
    if (observables.length < 1) {
      lineup.forEach(node => {
        parent.appendChild(node);
        mountElement(node);
      });
      lineup = null;
      return;
    }
    return combineLatest(observables).pipe(
      map(() => {
        if (lineup) {
          while (parent.firstChild) {
            if (parent.firstChild instanceof HTMLElement) {
              unmountElement(parent.firstChild);
            }
            parent.firstChild.remove();
          }
          lineup.forEach(node => {
            parent.appendChild(node);
            mountElement(node);
          });
        }
        lineup = null;
      })
    );
  } else if (isObservable(children)) {
    // TODO: Here be dragons
    return children.pipe(
      switchMap(child => {
        return applyChildren(child, parent, ctx) ?? of(void 0);
      })
    );
  }
  const item = produceElements(children, ctx);
  if (isObservable(item)) {
    let oldNode: HTMLElement | Text;
    return item.pipe(
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
  while (parent.firstChild) {
    if (parent.firstChild instanceof HTMLElement) {
      unmountElement(parent.firstChild);
    }
    parent.firstChild.remove();
  }
  parent.appendChild(item);
  mountElement(item);
}

function produceElement(
  node: AktaElement,
  ctx: AktaContext
): Observable<DOMNode> | DOMNode {
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
      return element;
    }
    return combineLatest(observables).pipe(mapTo(element));
  } else if (type === AktaPreparedComponent) {
    return props.children as Observable<DOMNode>;
  } else if (typeof type === 'function') {
    const [element, dependencies] = callComponent(
      type,
      props,
      ctx.dependencies
    );

    const output = produceElements(element, { ...ctx, dependencies });
    return new Observable(sub => {
      sub.add(() => {
        const fns = dependencies.get(teardownDependency);
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
  node: string | null | AktaAllElements,
  ctx: AktaContext
): Observable<DOMNode> | DOMNode {
  if (isObservable(node)) {
    return node.pipe(
      switchMap(innerNode => {
        const item = produceElements(innerNode, ctx);
        return isObservable(item) ? item : of(item);
      })
    );
  } else if (isPromise(node)) {
    return from(node).pipe(
      switchMap((innerNode: AktaAllElements) => {
        const item = produceElements(innerNode, ctx);
        return isObservable(item) ? item : of(item);
      })
    );
  } else if (isAktaElement(node)) {
    return produceElement(node, ctx);
  } else {
    return document.createTextNode(node ? node.toString() : '');
  }
}

export function prepare(element: AktaElement): Promise<AktaNode> {
  const dependencies = dependecyContext.getContext();
  const ctx = {
    dependencies,
    intrinsic: new AllElements(),
  };
  const children = produceElement(element, ctx);
  if (isObservable(children)) {
    const subject = new ReplaySubject<DOMNode>(1);
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

export function mount(element: AktaAllElements, root: HTMLElement) {
  const ctx = {
    dependencies: createDependencyMap(),
    intrinsic: new AllElements(),
  };
  const rest = applyChildren(element, root, ctx);
  if (isObservable(rest)) {
    const sub = rest.subscribe();
    return () => sub.unsubscribe();
  }
  return () => void 0;
}
