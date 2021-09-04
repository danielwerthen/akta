import {
  dependecyContext,
  createLazyDependency,
  createSyncContext,
  AktaNode,
} from 'akta';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';

export class RouterState {
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

export function createRouter(history?: History): RouterState {
  return new RouterState(history ?? createBrowserHistory());
}

export type RouterProps = {
  history?: History;
  children: AktaNode;
};

export function Router({ history, children }: RouterProps) {
  dependecyContext
    .getContext()
    .provide(routerDependency, createRouter(history));
  return <div>{children}</div>;
}

export const routerDependency = createLazyDependency<RouterState>(createRouter);

export function useLocation(): Observable<Location> {
  const ctx = dependecyContext.getContext().observe(routerDependency);
  return ctx.pipe(switchMap(item => item.location));
}

export function useUpdateLocation() {}

export function route(num: number): number {
  return num;
}

export type RouteProps = {
  path: string;
  children: AktaNode;
};

export function Route({ children, path }: RouteProps) {
  const loc = useLocation();
  return loc.pipe(
    map(location => {
      if (location.pathname === path) {
        return children;
      }
      return null;
    })
  );
}
