import { AktaAllElements, AktaElement, isAktaElement } from './types';
import { from, isObservable, Observable, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import {
  AktaIntrinsicElements,
  callComponent,
  mountElement,
  teardownDependency,
  unmountElement,
} from './akta-integrators';
import { createDependencyMap, DependencyMap } from './dependency-map';

type Cleanup = (() => void) | void;

type AktaContext = {
  intrinsic: AktaIntrinsicElements;
  parent: HTMLElement;
  dependencies: DependencyMap;
};

function isPromise(obj: unknown): obj is Promise<unknown> {
  return typeof (obj as Promise<unknown>)?.then === 'function';
}

function joinChildElements(
  children: AktaAllElements | AktaAllElements[],
  parent: HTMLElement,
  ctx: AktaContext
): Cleanup {
  if (Array.isArray(children)) {
    const subs = children
      .map(child => elementize(child, ctx))
      .map(observedChild => {
        let oldNode: HTMLElement | Text | undefined;
        const sub = observedChild.subscribe(newNode => {
          if (oldNode) {
            parent.replaceChild(newNode, oldNode);
            mountElement(newNode);
            unmountElement(oldNode);
          } else {
            parent.appendChild(newNode);
            mountElement(newNode);
          }
          oldNode = newNode;
        });
        if (!oldNode) {
          oldNode = document.createTextNode('');
          parent.appendChild(oldNode);
        }
        return sub;
      });
    return () => subs.forEach(sub => sub.unsubscribe());
  }
  let oldNode: HTMLElement | Text;
  const sub = elementize(children, ctx).subscribe(newNode => {
    if (oldNode) {
      parent.replaceChild(newNode, oldNode);
      mountElement(newNode);
      unmountElement(oldNode);
    } else {
      parent.appendChild(newNode);
      mountElement(newNode);
    }
    oldNode = newNode;
  });
  return () => sub.unsubscribe();
}

function elementizeAktaElement(
  node: AktaElement,
  ctx: AktaContext
): Observable<HTMLElement | Text> {
  if (!node) {
    return of(document.createTextNode(''));
  }
  if (typeof node.type === 'string') {
    const element = document.createElement(node.type);
    const cleanups: Cleanup[] = [];
    for (const key in node.props) {
      if (key === 'children') {
        const children: AktaAllElements | AktaAllElements[] = node.props[key];
        const cleanup = joinChildElements(children, element, ctx);
        if (cleanup) {
          cleanups.push(cleanup);
        }
      } else {
        const cleanup = ctx.intrinsic[node.type][key](element, node.props[key]);
        if (cleanup) {
          cleanups.push(cleanup);
        }
      }
    }
    return new Observable<typeof element>(sub => {
      sub.next(element);
    }).pipe(
      finalize(() => {
        cleanups.forEach(c => c && c());
      })
    );
  } else if (typeof node.type === 'function') {
    const Component = node.type as (p: {}) => AktaElement;
    const [element, dependencies] = callComponent(
      Component,
      node.props,
      ctx.dependencies
    );

    const teardown = dependencies.get(teardownDependency);

    const output = elementize(element, { ...ctx, dependencies });
    if (teardown) {
      return output.pipe(finalize(teardown));
    }
    return output;
  } else {
    return of(document.createTextNode(node.toString()));
  }
}

function elementize(
  node: AktaAllElements,
  ctx: AktaContext
): Observable<HTMLElement | Text> {
  if (isObservable(node)) {
    return node.pipe(
      switchMap(innerNode => {
        return elementize(innerNode, ctx);
      })
    );
  } else if (isPromise(node)) {
    return from(node).pipe(
      switchMap((innerNode: AktaAllElements) => {
        return elementize(innerNode, ctx);
      })
    );
  } else if (isAktaElement(node)) {
    return elementizeAktaElement(node, ctx);
  } else {
    return of(document.createTextNode(node.toString()));
  }
}

export function mount(
  node: AktaAllElements,
  ctx: Omit<AktaContext, 'dependencies'>
): Cleanup {
  return joinChildElements(node, ctx.parent, {
    dependencies: createDependencyMap(),
    ...ctx,
  });
}
