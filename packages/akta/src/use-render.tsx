import { Observable, ReplaySubject } from 'rxjs';
import { dependecyContext } from './dependencies';
import { prepare } from './prepare';
import { renderingContext, RenderingState } from './rendering-context';
import { AktaNode, isAktaElement } from './types';

export function useRender() {
  const deps = dependecyContext.getContext();
  return function render(node: AktaNode): ChildNode | Observable<ChildNode> {
    if (!isAktaElement(node) || typeof node.type !== 'string') {
      throw new Error(
        'UseRender function only accepts a single html tag at the top.'
      );
    }
    const parent = renderingContext.getContext();
    const rendering = parent.spawn();
    renderingContext.setContextUnsafe(rendering);
    try {
      const instance = prepare(node, deps);
      if (Array.isArray(instance)) {
        throw new Error('UseRender output was unexpectedly an array.');
      }
      if (rendering.state.value === RenderingState.active) {
        return instance;
      }
      const obs = new ReplaySubject<ChildNode>(1);
      const sub = rendering.state.subscribe(val => {
        if (val === RenderingState.active) {
          obs.next(instance);
          obs.complete();
        }
      });
      rendering.subscriptions.push(sub);
      return obs;
    } finally {
      renderingContext.resetContextUnsafe(rendering);
    }
  };
}
