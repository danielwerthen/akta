import {
  combineLatest,
  firstValueFrom,
  isObservable,
  Observable,
  of,
  ReplaySubject,
  Subscription,
} from 'rxjs';
import { switchMap, tap, filter, mapTo, catchError } from 'rxjs/operators';
import { jsx } from './jsx-runtime';
import {
  elementsDependency,
  teardownDependency,
  useTeardown,
  dependecyContext,
} from './dependencies';
import { DependencyMap } from './dependency-map';
import { callComponent } from './component-ops';
import { AktaNode, AktaPreparedComponent, isAktaElement } from './types';
import { mountElement, unmountElement } from './element-ops';

type RecNode = null | ChildNode | LazyAttacher | RecNode[];

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
  } else if (item instanceof LazyAttacher) {
    return item.activate(node => {
      if (sibling) {
        sibling.after(node);
      } else {
        initial(node);
      }
    });
  } else if (sibling) {
    if (!sibling.parentNode) {
      throw new Error('Cant attach to unattached sibling');
    }
    sibling.after(item);
  } else {
    initial(item);
  }
  mountElement(item);
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

export function* getPrev(indicies: number[]) {
  while (true) {
    if (indicies.length < 1) {
      return;
    }
    let last = indicies.pop();
    if (last === undefined) {
      return;
    }
    if (last > 0) {
      indicies.push(last - 1);
      yield indicies;
    } else if (last === 0) {
      continue;
    }
  }
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
  if (node instanceof LazyAttacher) {
    return getLastChild(node.nodes);
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
    } else if (node instanceof LazyAttacher) {
      return getSibling(node.nodes, indicies);
    } else {
      return node;
    }
  } while (true);
}

export class LazyAttacher {
  nodes: RecNode[] = [];
  private initial?: (node: ChildNode) => void;

  private _unmount(node: RecNode) {
    if (!this.initial || !node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(item => this._unmount(item));
      return;
    } else if (node instanceof LazyAttacher) {
      node.nodes.forEach(n => node._unmount(n));
      return;
    }
    node.remove();
    unmountElement(node);
  }
  private _mount(node: ChildNode | LazyAttacher, indicies: number[]) {
    if (!this.initial) {
      return;
    }
    const init = this.initial;
    const sibling = getSibling(this.nodes, indicies);
    if (node instanceof LazyAttacher) {
      node.activate(inner => {
        if (sibling) {
          if (!sibling.parentNode) {
            throw new Error('Cant attach to unattached sibling');
          }
          sibling.after(inner);
        } else {
          init(inner);
        }
      });
      return;
    }
    if (sibling) {
      if (!sibling.parentNode) {
        throw new Error('Cant attach to unattached sibling');
      }
      sibling.after(node);
    } else {
      this.initial(node);
    }
    mountElement(node);
  }

  attach(node: LazyAttacher | ChildNode | null, indicies: number[]) {
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

  activate(initial: (node: ChildNode) => void): ChildNode | null {
    this.initial = initial;
    return attach(null, this.nodes, initial);
  }
}

function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

export class NodeObserver {
  initCallbacks: (() => void)[] = [];
  finalCallbacks: (() => void)[] = [];
  observables: Observable<unknown>[] = [];
  observe(): Observable<void> {
    let obs =
      this.observables.length > 0
        ? combineLatest(this.observables.map(o => o.pipe(filter(onlyFirst))))
        : of([]);
    if (this.initCallbacks.length > 0) {
      const cbs = this.initCallbacks;
      obs = obs.pipe(
        tap(() => {
          for (let i = cbs.length - 1; i > -1; i--) {
            cbs[i]();
          }
        })
      );
    }
    if (this.finalCallbacks.length > 0) {
      return new Observable(sub => {
        for (let cb of this.finalCallbacks) {
          sub.add(cb);
        }
        return obs.subscribe({
          next: () => sub.next(),
          error: sub.error,
          complete: this.finalCallbacks.length > 0 ? undefined : sub.complete,
        });
      });
    }
    return obs.pipe(mapTo(void 0));
  }
}

type QueueItem = [
  AktaNode,
  DependencyMap,
  LazyAttacher,
  NodeObserver,
  number[] | undefined
];

export function observeNode(
  _node: AktaNode,
  _deps: DependencyMap,
  _attacher: LazyAttacher,
  _observer: NodeObserver,
  _idx?: number[]
): void {
  const queue: QueueItem[] = [[_node, _deps, _attacher, _observer, _idx]];
  const addToQueue: typeof observeNode = function(...args) {
    queue.push(args as QueueItem);
  };
  while (true) {
    const item = queue.shift();
    if (item === undefined) {
      break;
    }
    const [node, deps, attacher, observer, idx] = item;
    if (!node) {
      attacher.attach(null, idx ?? [0]);
    } else if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        addToQueue(node[i], deps, attacher, observer, idx ? [...idx, i] : [i]);
      }
    } else if (isObservable(node)) {
      const obs = node.pipe(
        switchMap(innerNode => {
          const subs = new NodeObserver();
          observeNode(innerNode, deps, attacher, subs, idx);
          return subs.observe();
        })
      );
      observer.observables.push(obs);
    } else if (typeof node === 'string') {
      attacher.attach(document.createTextNode(node), idx ?? [0]);
    } else if (isAktaElement(node)) {
      const { type, props } = node;
      if (typeof type === 'string') {
        const element = document.createElement(type);
        let childAttacher: null | LazyAttacher = null;

        const elements = deps.peek(elementsDependency);
        for (var key in props) {
          if (key === 'children') {
            const children = props[key] as AktaNode;
            childAttacher = new LazyAttacher();
            addToQueue(children, deps, childAttacher, observer);
          } else {
            const observable = elements[type][key](element, props[key]);
            if (observable) {
              observer.observables.push(observable);
            }
          }
        }
        observer.initCallbacks.push(() => {
          if (childAttacher) {
            childAttacher.activate(node =>
              element.insertBefore(node, element.firstChild)
            );
          }
          attacher.attach(element, idx ?? [0]);
        });
      } else if (type === AktaPreparedComponent) {
        const innerAttacher = props.attacher as LazyAttacher;
        const observable = props.observable as Observable<unknown>;
        observer.observables.push(observable);
        observer.initCallbacks.push(() => {
          attacher.attach(innerAttacher, idx ?? [0]);
        });
      } else if (!type) {
        const children = props.children as AktaNode;
        addToQueue(children, deps, attacher, observer, idx);
      } else {
        const [element, nextDeps] = callComponent(type, props, deps);
        addToQueue(element, nextDeps, attacher, observer, idx);

        const fns = nextDeps.peek(teardownDependency);
        if (fns && fns.length > 0) {
          observer.finalCallbacks.push(...fns);
        }
      }
    } else {
      attacher.attach(
        document.createTextNode(
          node.toString ? node.toString() : Object.prototype.toString.call(node)
        ),
        idx ?? [0]
      );
    }
  }
}

export function usePrepare(element: AktaNode): Promise<AktaNode> {
  const dependencies = dependecyContext.getContext();

  const attacher = new LazyAttacher();
  const observer = new NodeObserver();
  observeNode(element, dependencies, attacher, observer);
  const subject = new ReplaySubject<void>(1);
  const sub = observer.observe().subscribe(subject);
  useTeardown(() => sub.unsubscribe());
  return firstValueFrom(subject).then(() => {
    return jsx(AktaPreparedComponent, {
      attacher,
      observable: subject.asObservable(),
    });
  });
}

export function usePreparer(): (
  element: AktaNode
) => [AktaNode, Observable<void>, Subscription] {
  const dependencies = dependecyContext.getContext();
  const subscriptions: Subscription[] = [];
  useTeardown(() => {
    subscriptions.forEach(sub => sub.unsubscribe());
  });
  return (element: AktaNode) => {
    const attacher = new LazyAttacher();
    const observer = new NodeObserver();
    observeNode(element, dependencies, attacher, observer);
    const subject = new ReplaySubject<void>(1);
    const subscription = observer.observe().subscribe(subject);
    subscriptions.push(subscription);
    return [
      jsx(AktaPreparedComponent, {
        attacher,
        observable: subject.asObservable(),
      }),
      subject.pipe(filter(onlyFirst), mapTo(void 0)),
      subscription,
    ];
  };
}

export function mount(element: AktaNode, root: HTMLElement): () => void {
  const attacher = new LazyAttacher();
  const observer = new NodeObserver();
  observeNode(element, new DependencyMap(), attacher, observer);
  const sub = observer
    .observe()
    .pipe(
      tap(() =>
        attacher.activate(node => root.insertBefore(node, root.firstChild))
      ),
      catchError((e: unknown) => {
        console.error(e);
        return of(void 0);
      })
    )
    .subscribe();
  return () => sub.unsubscribe();
}
