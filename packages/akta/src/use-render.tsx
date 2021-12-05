import { dependecyContext, useTeardown } from './dependencies';
import { prepare } from './prepare';
import { RenderingContext, RenderingState } from './rendering-context';
import { AktaNode, isAktaElement } from './types';

export function useRender() {
  const ctx = dependecyContext.getContext();
  return function render(node: AktaNode): Promise<ChildNode> {
    if (!isAktaElement(node) || typeof node.type !== 'string') {
      throw new Error(
        'UseRender function only accepts a single html tag at the top.'
      );
    }
    const rendering = new RenderingContext();
    useTeardown(() => rendering.teardowns.forEach(d => d()), ctx);
    const instance = prepare(node, rendering, ctx);
    if (Array.isArray(instance)) {
      throw new Error('UseRender output was unexpectedly an array.');
    }
    if (rendering.state.value === RenderingState.active) {
      return Promise.resolve(instance);
    }
    return new Promise(res => {
      const sub = rendering.state.subscribe(state => {
        if (state === RenderingState.active) {
          sub.unsubscribe();
          res(instance);
        }
      });
      useTeardown(() => sub.unsubscribe(), ctx);
    });
  };
}
