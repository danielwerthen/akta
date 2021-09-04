import { isObservable } from 'rxjs';
import { AktaNode } from './types';
import { DependencyMap } from './dependency-map';
import { attachChildren } from './mount-ops';

export { Props, useTeardown, useNext, dependecyContext } from './dependencies';
export { createDependency, createLazyDependency } from './dependency-map';

export * from './jsx-runtime';

export function mount(element: AktaNode, root: HTMLElement): () => void {
  const rest = attachChildren(root, element, new DependencyMap());
  if (isObservable(rest)) {
    const sub = rest.subscribe();
    return () => sub.unsubscribe();
  }
  return () => void 0;
}
