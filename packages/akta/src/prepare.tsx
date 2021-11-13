import { isObservable, Observable, Subscription } from 'rxjs';

export class Subscriber {
  subscriptions: Subscription[] = [];
  teardowns: Function[] = [];
}

export type NodeInstance = ChildNode | [ChildNode, ...ChildNode[]];
export type BlueprintNode =
  | ChildNode
  | Array<BlueprintNode>
  | Observable<BlueprintNode>
  | null;

export type PrepContext = {
  subscriber: Subscriber;
};

function remove(item: NodeInstance) {
  if (Array.isArray(item)) {
    item.forEach(remove);
  } else {
    item.remove();
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
  } else {
    anchor.replaceWith(next);
  }
}

export function prepare(
  blueprint: BlueprintNode,
  ctx: PrepContext
): NodeInstance {
  if (Array.isArray(blueprint)) {
    const result: Array<ChildNode> = [];
    for (let item of blueprint) {
      const prep = prepare(item, ctx);
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
    const sub = blueprint.subscribe({
      next: next => {
        const nextInstance = prepare(next, ctx);
        if (instance) {
          replace(nextInstance, instance);
        }
        instance = nextInstance;
      },
    });
    ctx.subscriber.subscriptions.push(sub);
    if (!instance) {
      instance = document.createTextNode('');
    }
    return instance;
  } else if (blueprint === null) {
    const empty = document.createTextNode('');
    return empty;
  } else {
    return blueprint;
  }
}
