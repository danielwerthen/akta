import { BehaviorSubject, isObservable, Observable, Subscription } from 'rxjs';

export enum PrepState {
  init = 'init',
  active = 'active',
  terminated = 'terminated',
}

export class PrepContext {
  subscriptions: Subscription[] = [];
  teardowns: Function[] = [];
  dependencies: number = 0;
  state: BehaviorSubject<PrepState> = new BehaviorSubject(PrepState.init);
  spawn() {
    return new PrepContext();
  }
  terminate() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    for (let cb of this.teardowns) {
      cb();
    }
    this.state.next(PrepState.terminated);
  }
  placeholder(): ChildNode {
    const el: Detachable = document.createTextNode('');
    el.onDetach = () => {
      this.dependencies -= 1;
      if (this.dependencies === 0) {
        this.state.next(PrepState.active);
      }
    };
    this.dependencies += 1;
    return el;
  }
  monitor(): void {
    if (this.dependencies < 1) {
      this.state.next(PrepState.active);
      return;
    }
  }
}

export type NodeInstance = ChildNode | [ChildNode, ...ChildNode[]];
export type BlueprintNode =
  | ChildNode
  | Array<BlueprintNode>
  | Observable<BlueprintNode>
  | null;

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
  blueprint: BlueprintNode,
  ctx: PrepContext,
  recursive: boolean = false
): NodeInstance {
  try {
    if (Array.isArray(blueprint)) {
      const result: Array<ChildNode> = [];
      for (let item of blueprint) {
        const prep = prepare(item, ctx, true);
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
      let activeSpawn: PrepContext | null = null;
      const sub = blueprint.subscribe({
        next: next => {
          if (activeSpawn) {
            activeSpawn.terminate();
          }
          activeSpawn = ctx.spawn();
          const nextInstance = prepare(next, activeSpawn);
          if (activeSpawn.state.value === PrepState.init) {
            ctx.dependencies += 1;
            const sub = activeSpawn.state.subscribe(state => {
              if (state !== PrepState.init) {
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
    } else {
      return blueprint;
    }
  } finally {
    if (!recursive) {
      ctx.monitor();
    }
  }
}
