import {
  dependecyContext,
  createLazyDependency,
  createSyncContext,
  AktaNode,
  usePreparer,
} from 'akta';
import { forkJoin, Observable, of, Subject, Subscriber } from 'rxjs';
import { catchError, mapTo, switchMap, take } from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';

export class RouterState {
  history: History;
  location: Observable<Location>;
  conductor = new Subject<void>();
  private subscribers: Subscriber<Location>[] = [];
  teardown: () => void;
  constructor(history: History) {
    this.history = history;
    this.teardown = history.listen(async ({ location }) => {
      const transitions: Observable<void>[] = [];
      transitionContext.setContext(() => {
        this.subscribers.forEach(sub => sub.next(location));
      }, transitions);
      forkJoin(transitions).subscribe({
        complete: () => this.conductor.next(),
        error: () => this.conductor.next(),
      });
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
  const ctx = dependecyContext.getContext();
  const prepare = usePreparer();
  return loc.pipe(
    switchMap(location => {
      const router = ctx.peek(routerDependency);
      const transitions = transitionContext.getContext();
      if (location.pathname === path) {
        const [node, promise] = prepare(children);
        if (Array.isArray(transitions)) {
          if (promise) {
            transitions.push(promise);
          }
          return router.conductor.pipe(take(1), mapTo(node));
        } else {
          return of(node);
        }
      }
      if (Array.isArray(transitions)) {
        return router.conductor.pipe(take(1), mapTo(null));
      }
      return of(null);
    }),
    catchError(e => {
      console.error(e);
      return of(<p>Error: {e}</p>);
    })
  );
}
