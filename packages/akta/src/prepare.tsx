import { AktaNode, isAktaElement } from './types';
import { isObservable } from 'rxjs';
import { RenderingContext, RenderingState } from './rendering-context';
import { renderElement } from './render-element';
import { DependencyMap } from './dependency-map';

export type NodeInstance = ChildNode | [ChildNode, ...ChildNode[]];

export type Detachable = ChildNode & {
  onDetach?: () => void;
};

function teardown(item: ChildNode) {
  const detachable = item as Detachable;
  if (typeof detachable.onDetach === 'function') {
    detachable.onDetach();
  }
}

function remove(item: NodeInstance) {
  if (Array.isArray(item)) {
    item.forEach(remove);
  } else {
    item.remove();
    teardown(item);
  }
}

function replace(next: NodeInstance, old: NodeInstance) {
  let anchor: undefined | ChildNode = undefined;
  if (Array.isArray(old)) {
    for (const item of old) {
      if (typeof anchor === 'undefined') {
        anchor = item as ChildNode;
      } else {
        remove(item);
      }
    }
  } else {
    anchor = old;
  }
  if (!anchor) {
    throw new Error('Node structure is malformed');
  }
  if (Array.isArray(next)) {
    anchor.replaceWith(...next);
    teardown(anchor);
  } else {
    anchor.replaceWith(next);
    teardown(anchor);
  }
}

export function prepare(
  blueprint: AktaNode,
  ctx: RenderingContext,
  deps: DependencyMap,
  recursive: boolean = false
): NodeInstance {
  try {
    if (Array.isArray(blueprint)) {
      const result: Array<ChildNode> = [];
      for (let item of blueprint) {
        const prep = prepare(item, ctx, deps, true);
        if (Array.isArray(prep)) {
          result.push(...prep);
        } else {
          result.push(prep);
        }
      }
      if (result.length === 0) {
        result.push(document.createTextNode(''));
      }
      return result as NodeInstance;
    } else if (isObservable(blueprint)) {
      let instance: NodeInstance | null = null;
      let activeSpawn: RenderingContext | null = null;
      const sub = blueprint.subscribe({
        next: next => {
          if (activeSpawn) {
            activeSpawn.terminate();
          }
          activeSpawn = ctx.spawn();
          const nextInstance = prepare(next, activeSpawn, deps);
          if (activeSpawn.state.value === RenderingState.init) {
            ctx.dependencies += 1;
            const sub = activeSpawn.state.subscribe(state => {
              if (state !== RenderingState.init) {
                sub.unsubscribe();
              }
            });
            sub.add(() => {
              ctx.dependencies -= 1;
            });
            ctx.subscriptions.push(sub);
          }
          if (instance) {
            replace(nextInstance, instance);
          }
          instance = nextInstance;
        },
      });
      ctx.teardowns.push(() => activeSpawn?.terminate());
      ctx.subscriptions.push(sub);
      if (!instance) {
        instance = ctx.placeholder();
      }
      return instance;
    } else if (blueprint === null) {
      const empty = document.createTextNode('');
      return empty;
    } else if (typeof blueprint === 'string') {
      return document.createTextNode(blueprint);
    } else if (typeof blueprint === 'number') {
      return document.createTextNode(blueprint.toString());
    } else if (isAktaElement(blueprint)) {
      return renderElement(blueprint, ctx, deps);
    } else {
      return blueprint as HTMLElement;
    }
  } finally {
    if (!recursive) {
      ctx.monitor();
    }
  }
}
