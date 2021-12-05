import { AktaNode } from './types';
import { DependencyMap } from './dependency-map';
import { prepare } from './prepare';
import { renderingContext, RenderingContext } from './rendering-context';

export function render(
  blueprint: AktaNode,
  parent: HTMLElement,
  ctx: RenderingContext = new RenderingContext()
): () => void {
  renderingContext.setContextUnsafe(ctx);
  try {
    const node = prepare(blueprint, new DependencyMap());
    console.log(node);
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
