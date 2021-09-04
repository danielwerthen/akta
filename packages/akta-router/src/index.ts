import {
  dependecyContext,
  createLazyDependency,
  createSyncContext,
} from 'akta';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';

export class Router {
  history: History;
  location: Observable<Location>;
  private subscribers: Subscriber<Location>[] = [];
  teardown: () => void;
  constructor(history: History) {
    this.history = history;
    this.teardown = history.listen(({ location }) => {
      this.subscribers.forEach(sub => sub.next(location));
    });
    this.location = new Observable<Location>(subscriber => {
      subscriber.next(this.history.location);
      this.subscribers.push(subscriber);
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    });
  }
  push(url: string, state?: {} | null): Observable<void[]> {
    const transitions: Observable<void>[] = [];
    transitionContext.setContext(() => {
      this.history.push(url, state);
    }, transitions);
    return forkJoin(transitions);
  }
}

export const transitionContext = createSyncContext<Observable<void>[]>();

export function createRouter(history?: History): Router {
  return new Router(history ?? createBrowserHistory());
}

export const routerDependency = createLazyDependency<Router>(createRouter);

export function useLocation() {
  const ctx = dependecyContext.getContext().observe(routerDependency);
  return ctx.pipe(switchMap(item => item.location));
}

export function useUpdateLocation() {}

export function route(num: number): number {
  return num;
}
