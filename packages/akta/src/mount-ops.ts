import {
  combineLatest,
  Observable,
  tap,
  isObservable,
  filter,
  switchMap,
  of,
  Subject,
} from 'rxjs';

type TempNode = null | string | TempNode[] | Observable<TempNode>;

export class Attacher {
  private live: boolean = false;
  private nodes: ChildNode[] = [];
  private sibling: () => ChildNode | null;
  private parent: () => ChildNode;
  private activator: Subject<void> | undefined;
  private activators: Subject<void>[] = [];
  constructor(
    sibling: () => ChildNode | null,
    parent: () => ChildNode,
    activator?: Subject<void>
  ) {
    this.sibling = sibling;
    this.parent = parent;
    this.activator = activator;
    activator?.subscribe(() => {
      this.activator = undefined;
    });
  }
  remove(idx: number) {
    if (this.live && this.nodes[idx]) {
      this.nodes[idx].remove();
    }
    delete this.nodes[idx];
  }
  attach(node: ChildNode, idx: number) {
    if (this.live && this.nodes[idx]) {
      this.nodes[idx].remove();
    }
    this.nodes[idx] = node;
    if (this.live) {
      const sib = this.nodes[idx - 1] ?? this.sibling();
      if (sib) {
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(node);
      } else {
        const p = this.parent();
        if (p.childNodes.length > 0) {
          p.firstChild?.before(node);
        } else {
          p.appendChild(node);
        }
      }
    }
  }
  private _activate() {
    this.live = true;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (!node) {
        continue;
      }
      const sib = this.nodes[i - 1] ?? this.sibling();
      if (sib) {
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(node);
      } else {
        const p = this.parent();
        if (p.childNodes.length > 0) {
          p.firstChild?.before(node);
        } else {
          p.appendChild(node);
        }
      }
    }
    for (let i = 0; i < this.activators.length; i++) {
      this.activators[i].complete();
    }
  }
  activate() {
    if (this.activator) {
      this.activator.subscribe(() => this._activate());
    } else {
      this._activate();
    }
  }
  branch(idx: number): Attacher {
    const activator = new Subject<void>();
    this.activators.push(activator);
    return new Attacher(
      () => this.nodes[idx - 1],
      this.parent,
      this.live ? undefined : activator
    );
  }
  teardown() {
    let node: ChildNode | undefined;
    while ((node = this.nodes.pop())) {
      if (this.live) {
        node.remove();
      }
    }
  }
}

export function* attach(sibling: () => ChildNode) {
  let lineup: ChildNode[] = [];
  let active = false;
  let yieldData: null | (() => ChildNode) = null;
  while (true) {
    const action:
      | 'activate'
      | [ChildNode, number]
      | 'teardown'
      | number = yield yieldData;
    yieldData = null;
    if (action === 'activate') {
      if (active) {
        throw new Error('Activate can only be triggered once');
      }
      active = true;
      for (let i = 0; i < lineup.length; i++) {
        const sib = lineup[i - 1] ?? sibling();
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(lineup[i]);
      }
    } else if (Array.isArray(action)) {
      const [node, idx] = action;
      if (active && lineup[idx]) {
        lineup[idx].remove();
      }
      lineup[idx] = node;
      if (active) {
        const sib = lineup[idx - 1] ?? sibling();
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(node);
      }
    } else if (action === 'teardown') {
      for (let i = 0; i < lineup.length; i++) {
        lineup[i].remove();
      }
      break;
    } else if (typeof action === 'number') {
      const idx: number = action;
      yieldData = () => lineup[idx - 1] ?? sibling();
    }
  }
}
function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

export function attachChildren(
  attacher: Attacher,
  children: TempNode,
  index?: number
): Observable<unknown> | void {
  if (!children) {
    const node = document.createTextNode('');
    attacher.attach(node, index ?? 0);
  } else if (typeof children === 'string') {
    const node = document.createTextNode(children);
    attacher.attach(node, index ?? 0);
  } else if (Array.isArray(children)) {
    const branch =
      typeof index === 'number' ? attacher.branch(index) : attacher;
    const observables = children
      .map((child, idx) => {
        return attachChildren(branch, child, idx);
      })
      .filter<Observable<unknown>>(
        (item: unknown): item is Observable<unknown> => !!item
      );
    return new Observable(sub => {
      sub.add(() => branch.teardown());

      if (observables.length < 1) {
        if (typeof index === 'number') {
          attacher.remove(index);
        }
        branch.activate();
        sub.next();
        return;
      }
      return combineLatest(observables)
        .pipe(
          tap(() => {
            if (typeof index === 'number') {
              attacher.remove(index);
            }
            branch.activate();
            sub.next();
          })
        )
        .subscribe();
    });
  } else if (isObservable(children)) {
    return children.pipe(
      switchMap(child => {
        const obs = attachChildren(attacher, child, index);
        if (!obs) {
          return of(void 0);
        }
        return obs;
      }),
      filter(onlyFirst)
    );
  }
}
