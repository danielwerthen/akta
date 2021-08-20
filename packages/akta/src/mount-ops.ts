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
import { AktaNode, isAktaElement } from './types';

export class Attacher {
  private live: boolean = false;
  private nodes: (ChildNode | Attacher)[] = [];
  private sibling: () => ChildNode | null;
  private parent: HTMLElement;
  private activator: Subject<void> | undefined;
  private activators: Subject<void>[] = [];
  constructor(
    sibling: () => ChildNode | null,
    parent: HTMLElement,
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
    if (this.nodes[idx]) {
      const node = this.nodes[idx];
      if (node instanceof Attacher) {
        node.teardown();
      } else if (this.live) {
        node.remove();
      }
    }
    delete this.nodes[idx];
  }
  attach(node: ChildNode, idx: number) {
    this.remove(idx);
    this.nodes[idx] = node;
    if (this.live) {
      const sib = this.nodes[idx - 1] ?? this.sibling();
      if (sib instanceof Attacher) {
        sib.appendAfter(node);
      } else if (sib) {
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(node);
      } else {
        const p = this.parent;
        if (p.childNodes.length > 0) {
          p.firstChild?.before(node);
        } else {
          p.appendChild(node);
        }
      }
    }
  }
  private appendAfter(node: ChildNode) {
    if (this.live) {
      const item = this.nodes[this.nodes.length];
      if (item instanceof Attacher) {
        item.appendAfter(node);
      } else {
        item.after(node);
      }
    } else {
      const sib = this.sibling();
      if (sib) {
        sib.after(node);
      }
      const root = this.parent;
      root.appendChild(node);
    }
  }
  private getLastNode(): ChildNode | null {
    if (this.live) {
      const item = this.nodes[this.nodes.length];
      if (item instanceof Attacher) {
        return item.getLastNode();
      } else {
        return item;
      }
    }
    return this.sibling();
  }
  private _activate() {
    this.live = true;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (!node || node instanceof Attacher) {
        continue;
      }
      const sib = this.nodes[i - 1] ?? this.sibling();
      if (sib instanceof Attacher) {
        sib.appendAfter(node);
      } else if (sib) {
        if (!sib.parentNode) {
          throw new Error('Activation out of order');
        }
        sib.after(node);
      } else {
        const p = this.parent;
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
      this.activator.subscribe({ complete: () => this._activate() });
    } else {
      this._activate();
    }
  }
  branch(idx: number): Attacher {
    this.remove(idx);
    const activator = new Subject<void>();
    this.activators.push(activator);
    return (this.nodes[idx] = new Attacher(
      () => {
        for (let i = idx - 1; i >= 0; i++) {
          const node = this.nodes[i];
          if (node instanceof Attacher) {
            const sib = node.getLastNode();
            if (sib) {
              return sib;
            }
            continue;
          }
          return node;
        }
        return null;
      },
      this.parent,
      this.live ? undefined : activator
    ));
  }
  teardown() {
    let node: ChildNode | Attacher | undefined;
    while ((node = this.nodes.pop())) {
      if (node instanceof Attacher) {
        node.teardown();
      } else if (this.live) {
        node.remove();
      }
    }
  }
}

function onlyFirst(_value: unknown, idx: number) {
  return idx === 0;
}

export function attachChildren(
  root: HTMLElement | Attacher,
  item: AktaNode,
  index?: number
): Observable<unknown> | void {
  const attacher =
    root instanceof Attacher ? root : new Attacher(() => null, root);
  if (!item) {
    const node = document.createTextNode('');
    attacher.attach(node, index ?? 0);
  } else if (typeof item === 'string') {
    const node = document.createTextNode(item);
    attacher.attach(node, index ?? 0);
  } else if (Array.isArray(item)) {
    const branch =
      typeof index === 'number' ? attacher.branch(index) : attacher;
    const observables = item
      .map((child, idx) => {
        return attachChildren(branch, child, idx);
      })
      .filter<Observable<unknown>>(
        (item: unknown): item is Observable<unknown> => !!item
      );
    if (observables.length < 1) {
      branch.activate();
      return;
    }
    return combineLatest(observables).pipe(
      tap(() => {
        branch.activate();
      })
    );
  } else if (isObservable(item)) {
    return item.pipe(
      switchMap(child => {
        const obs = attachChildren(attacher, child, index);
        if (!obs) {
          return of(void 0);
        }
        return obs;
      }),
      filter(onlyFirst)
    );
  } else if (isAktaElement(item)) {
  }
}
