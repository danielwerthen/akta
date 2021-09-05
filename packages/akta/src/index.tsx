import { isObservable } from 'rxjs';
import { AktaNode } from './types';
import { DependencyMap } from './dependency-map';
import { attachChildren } from './mount-ops';

export * from './dependencies';
export { createDependency, createLazyDependency } from './dependency-map';

export * from './jsx-runtime';
export * from './sync-context';
export { usePrepare, usePreparer } from './dom-ops';
export * from './types';

export function mount(element: AktaNode, root: HTMLElement): () => void {
  const rest = attachChildren(root, element, new DependencyMap());
  if (isObservable(rest)) {
    const sub = rest.subscribe();
    return () => sub.unsubscribe();
  }
  return () => void 0;
}
