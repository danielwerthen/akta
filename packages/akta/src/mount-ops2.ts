import {
  combineLatest,
  filter,
  isObservable,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { elementsDependency, teardownDependency } from './dependencies';
import { DependencyMap } from './dependency-map';
import { callComponent } from './dom-ops';
import { AktaNode, isAktaElement } from './types';

type RecNode = null | ChildNode | RecNode[];

function attach(
  sibling: ChildNode | null,
  item: RecNode,
  initial: (node: ChildNode) => void
): ChildNode | null {
  if (!item) {
    return null;
  } else if (Array.isArray(item)) {
    return item.reduce<ChildNode | null>((sibling, node) => {
      return attach(sibling, node, initial);
    }, sibling);
  } else if (sibling) {
    sibling.after(item);
  } else {
    initial(item);
  }
  return item;
}

function getNode(items: RecNode[], indicies: number[]) {
  let nodes = items;
  const lastPos = indicies.length - 1;
  for (let i = 0; i < lastPos; i++) {
    const item = nodes[indicies[i]];
    if (!item) {
      return null;
    } else if (Array.isArray(item)) {
      nodes = item;
    } else {
      return item;
    }
  }
  return nodes[indicies[lastPos]] ?? null;
}

function* getPrev(indicies: number[]) {
  let last = indicies.pop();
  if (last === undefined) {
    return;
  }
  while (!last) {
    last = indicies.pop();
  }
  indicies.push(last - 1);
  yield indicies;
}

function getLastChild(node: RecNode): ChildNode | null {
  if (!node) {
    return null;
  }
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      const val = getLastChild(node[i]);
      if (!val) {
        continue;
      }
      return val;
    }
    return null;
  }
  return node;
}

function getSibling(items: RecNode[], indicies: number[]): ChildNode | null {
  const gen = getPrev([...indicies]);
  do {
    const { done, value } = gen.next();
    if (done || !value) {
      return null;
    }
    const node = getNode(items, value);
    if (!node) {
      continue;
    } else if (Array.isArray(node)) {
      const lastChild = getLastChild(node);
      if (!lastChild) {
        continue;
      }
      return lastChild;
    } else {
      return node;
    }
  } while (true);
}
export type LazyAttacherOptions = {
  onUnmount?: (node: ChildNode) => void;
  onMount?: (node: ChildNode) => void;
};

export class LazyAttacher {
  private nodes: RecNode[] = [];
  private initial?: (node: ChildNode) => void;
  options: LazyAttacherOptions;
  constructor(options: LazyAttacherOptions) {
    this.options = options;
  }

  private _unmount(node: RecNode) {
    if (!this.initial || !node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(item => this._unmount(item));
      return;
    }
    node.remove();
    if (this.options.onUnmount) {
      this.options.onUnmount(node);
    }
  }
  private _mount(node: ChildNode, indicies: number[]) {
    if (!this.initial) {
      return;
    }
    const sibling = getSibling(this.nodes, indicies);
    if (sibling) {
      sibling.after(node);
    } else {
      this.initial(node);
    }
    if (this.options.onMount) {
      this.options.onMount(node);
    }
  }

  attach(node: ChildNode | null, indicies: number[]) {
    let nodes = this.nodes;
    const lastPos = indicies.length - 1;
    for (let i = 0; i < lastPos; i++) {
      const item = nodes[indicies[i]];
      if (!item) {
        nodes = nodes[indicies[i]] = [];
      } else if (Array.isArray(item)) {
        nodes = item;
      } else {
        this._unmount(item);
        nodes = nodes[indicies[i]] = [];
      }
    }
    const old = nodes[indicies[lastPos]];
    if (old) {
      this._unmount(old);
    }
    if (!node) {
      delete nodes[indicies[lastPos]];
    } else {
      nodes[indicies[lastPos]] = node;
      this._mount(node, indicies);
    }
  }

  activate(initial: (node: ChildNode) => void) {
    this.initial = initial;
    attach(null, this.nodes, initial);
  }
}

function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

export function observeNode(
  node: AktaNode,
  deps: DependencyMap,
  attacher: LazyAttacher,
  idx?: number[]
): Observable<unknown> | void {
  if (!node) {
    attacher.attach(null, idx ?? [0]);
    return;
  }
  if (Array.isArray(node)) {
    const items = node
      .map((item, i) => {
        return observeNode(item, deps, attacher, idx ? [...idx, i] : [i]);
      })
      .filter(function isObs(node): node is Observable<void> {
        return isObservable(node);
      });
    if (items.length === 0) {
      return;
    } else if (items.length === 1) {
      return items[0];
    }
    return combineLatest(items).pipe(filter(onlyFirst));
  } else if (isObservable(node)) {
    return node.pipe(
      switchMap(innerNode => {
        return observeNode(innerNode, deps, attacher, idx) || of(void 0);
      }),
      filter(onlyFirst)
    );
  } else if (typeof node === 'string') {
    attacher.attach(document.createTextNode(node), idx ?? [0]);
    return;
  } else if (isAktaElement(node)) {
    const { type, props } = node;
    if (typeof type === 'string') {
      const element = document.createElement(type);
      const observables: Observable<unknown>[] = [];
      let childAttacher: null | LazyAttacher = null;

      const elements = deps.peek(elementsDependency);
      for (var key in props) {
        if (key === 'children') {
          const children = props[key] as AktaNode;
          childAttacher = new LazyAttacher(attacher.options);
          const observable = observeNode(children, deps, childAttacher);
          if (observable) {
            observables.push(observable.pipe(filter(onlyFirst)));
          }
        } else {
          const observable = elements[type][key](element, props[key]);
          if (observable) {
            observables.push(observable.pipe(filter(onlyFirst)));
          }
        }
      }
      if (observables.length < 1) {
        if (childAttacher) {
          childAttacher.activate(node => element.append(node));
        }
        attacher.attach(element, idx ?? [0]);
        return;
      }
      return combineLatest(observables).pipe(
        tap(() => {
          if (childAttacher) {
            childAttacher.activate(node => element.append(node));
          }
          attacher.attach(element, idx ?? [0]);
        })
      );
    } else {
      const [element, nextDeps] = callComponent(type, props, deps);
      const observable = observeNode(element, deps, attacher, idx);

      const fns = nextDeps.peek(teardownDependency);
      if ((fns?.length ?? 0) < 1) {
        return observable;
      }
      return new Observable(sub => {
        sub.add(() => {
          if (fns) {
            fns.forEach(item => item());
          }
        });
        if (isObservable(observable)) {
          return observable.subscribe({
            next: val => {
              sub.next(val);
            },
            error: val => {
              sub.error(val);
            },
            complete: undefined,
          });
        }
        sub.next(observable);
        return;
      });
    }
  } else {
    attacher.attach(
      document.createTextNode(Object.prototype.toString.call(node)),
      idx ?? [0]
    );
    return;
  }
}
