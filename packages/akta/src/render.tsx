import { AktaNode } from './types';
import { DependencyMap } from './dependency-map';
import { prepare } from './prepare';
import { renderingContext, RenderingContext } from './rendering-context';
import { addDelegatedEvents } from './events';

export function render(
  blueprint: AktaNode,
  parent: HTMLElement,
  ctx: RenderingContext = new RenderingContext()
): () => void {
  renderingContext.setContextUnsafe(ctx);
  addDelegatedEvents(parent);
  try {
    const node = prepare(blueprint, new DependencyMap());
    if (Array.isArray(node)) {
      parent.append(...node);
    } else {
      parent.append(node);
    }
  } finally {
    renderingContext.resetContextUnsafe(ctx);
  }
  return () => ctx.terminate();
}
