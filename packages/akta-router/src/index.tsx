import {
  dependecyContext,
  createLazyDependency,
  createDependency,
  createSyncContext,
  AktaNode,
  usePreparer,
} from 'akta';
import { forkJoin, Observable, of, Subject, Subscriber } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  mapTo,
  switchMap,
  take,
} from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';
import { match, Match } from 'path-to-regexp';

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

export const RouteMatchDependency = createDependency<
  Match<{
    [key: string]: unknown;
  }>
>(false);

export function Route({ children, path }: RouteProps) {
  const loc = useLocation();
  const ctx = dependecyContext.getContext();
  const prepare = usePreparer();
  const matcher = match(path);
  return loc.pipe(
    map(location => {
      const matched = matcher(location.pathname);
      ctx.provide(RouteMatchDependency, matched);
      return !!matched;
    }),
    distinctUntilChanged(),
    switchMap(matched => {
      const router = ctx.observe(routerDependency);
      const transitions = transitionContext.getContext();
      if (matched) {
        const [node, promise] = prepare(children);
        if (Array.isArray(transitions)) {
          if (promise) {
            transitions.push(promise);
          }
          return router.pipe(
            switchMap(rtr => rtr.conductor),
            take(1),
            mapTo(node)
          );
        } else {
          return of(node);
        }
      }
      if (Array.isArray(transitions)) {
        return router.pipe(
          switchMap(rtr => rtr.conductor),
          take(1),
          mapTo(null)
        );
      }
      return of(null);
    }),
    catchError(e => {
      console.error(e);
      return of(<p>Error: {e}</p>);
    })
  );
}
