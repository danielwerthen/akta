import { createSyncContext } from './sync-context';
import { BehaviorSubject, Subscription } from 'rxjs';

export enum RenderingState {
  init = 'init',
  active = 'active',
  terminated = 'terminated',
}

export type Detachable = ChildNode & {
  onDetach?: () => void;
};

export class RenderingContext {
  subscriptions: Subscription[] = [];
  teardowns: Function[] = [];
  dependencies: number = 0;
  state: BehaviorSubject<RenderingState> = new BehaviorSubject(
    RenderingState.init
  );
  spawn() {
    const child = new RenderingContext();
    this.teardowns.push(() => child.terminate());
    return child;
  }
  terminate() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    for (let cb of this.teardowns) {
      cb();
    }
    this.state.next(RenderingState.terminated);
  }
  placeholder(): ChildNode {
    const el: Detachable = document.createTextNode('');
    el.onDetach = () => {
      this.dependencies -= 1;
      if (this.dependencies === 0) {
        this.state.next(RenderingState.active);
      }
    };
    this.dependencies += 1;
    return el;
  }
  monitor(): void {
    if (this.dependencies < 1) {
      this.state.next(RenderingState.active);
      return;
    }
  }
}

export const renderingContext = createSyncContext<RenderingContext>();
