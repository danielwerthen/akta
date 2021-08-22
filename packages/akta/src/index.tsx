import { isObservable } from 'rxjs';
import { AktaNode } from './types';
import { createDependencyMap } from './dependency-map';
import { attachChildren } from './mount-ops';

export { Props, useTeardown, useNext } from './dependencies';

export * from './jsx-runtime';

export function mount(element: AktaNode, root: HTMLElement): () => void {
  const rest = attachChildren(root, element, createDependencyMap());
  if (isObservable(rest)) {
    const sub = rest.subscribe();
    return () => sub.unsubscribe();
  }
  return () => void 0;
}
