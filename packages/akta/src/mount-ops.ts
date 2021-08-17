import {
  combineLatest,
  Observable,
  tap,
  isObservable,
  filter,
  switchMap,
  of,
} from 'rxjs';

type TempNode = null | string | TempNode[] | Observable<TempNode>;

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
  attacherInit: ReturnType<typeof attach> | (() => ChildNode),
  children: TempNode,
  index: number = 0
): Observable<unknown> | void {
  let attacher: ReturnType<typeof attach>;
  if (typeof attacherInit === 'function') {
    attacher = attach(attacherInit);
    attacher.next();
  } else {
    attacher = attacherInit;
  }
  if (!children) {
    const node = document.createTextNode('');
    attacher.next([node, index]);
  } else if (typeof children === 'string') {
    const node = document.createTextNode(children);
    attacher.next([node, index]);
  } else if (Array.isArray(children)) {
    const { value } = attacher.next(index);
    const generator = value ? attach(value) : attacher;
    generator.next();
    const observables = children
      .map((child, idx) => {
        return attachChildren(generator, child, idx);
      })
      .filter<Observable<unknown>>(
        (item: unknown): item is Observable<unknown> => !!item
      );
    return new Observable(sub => {
      sub.add(() => generator.next('teardown'));

      if (observables.length < 1) {
        generator.next('activate');
        sub.next();
        return;
      }
      return combineLatest(observables)
        .pipe(
          tap(() => {
            generator.next('activate');
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
