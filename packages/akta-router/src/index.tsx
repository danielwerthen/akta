import {
  createLazyDependency,
  createDependency,
  createSyncContext,
  useDependency,
  useContext,
  useTeardown,
  AktaNode,
  usePreparer,
  useProvideDependency,
} from 'akta';
import { Akta } from 'akta/jsx-runtime';
import {
  BehaviorSubject,
  forkJoin,
  Observable,
  of,
  Subject,
  Subscriber,
  Subscription,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  tap,
  mapTo,
  switchMap,
  startWith,
  take,
} from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';
import { match, Match } from 'path-to-regexp';

export const routerDependency = createLazyDependency<RouterState>(createRouter);

export const routeMatchDependency = createDependency<
  Match<{
    [key: string]: unknown;
  }>
>(false);

export const matchedRoutesDependency = createDependency<
  BehaviorSubject<Set<Symbol>>
>(new BehaviorSubject(new Set()));

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
  useProvideDependency(routerDependency, createRouter(history));
  useProvideDependency(matchedRoutesDependency, new BehaviorSubject(new Set()));
  return <div>{children}</div>;
}

export function useLocation(): Observable<Location> {
  const ctx = useDependency(routerDependency);
  return ctx.pipe(switchMap(item => item.location));
}

export function route(num: number): number {
  return num;
}

export type RouteProps = {
  path: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  children: AktaNode;
};

export function Route({
  children,
  exact = false,
  strict = false,
  sensitive = false,
  path,
}: RouteProps) {
  const matcher = match(path, {
    end: exact,
    strict,
    sensitive,
  });
  const loc = useLocation();
  const ctx = useContext();
  const matchedRoutes = ctx.peek(matchedRoutesDependency);
  const prepare = usePreparer();
  const routeSymbol = Symbol(`Route for ${path}`);
  useTeardown(() => {
    matchedRoutes.value.delete(routeSymbol);
    matchedRoutes.next(matchedRoutes.value);
  });
  let prevSubscription: Subscription;
  return loc.pipe(
    map(location => {
      const matched = matcher(location.pathname);
      ctx.provide(routeMatchDependency, matched);
      return !!matched;
    }),
    distinctUntilChanged(),
    switchMap(matched => {
      const router = ctx.observe(routerDependency);
      const transitions = transitionContext.getContext();
      if (matched) {
        matchedRoutes.value.add(routeSymbol);
        matchedRoutes.next(matchedRoutes.value);
        const [node, promise, sub] = prepare(children);
        if (Array.isArray(transitions)) {
          if (promise) {
            transitions.push(promise);
          }

          return router.pipe(
            switchMap(rtr => rtr.conductor),
            take(1),
            tap(() => {
              if (prevSubscription) {
                prevSubscription.unsubscribe();
              }
              prevSubscription = sub;
            }),
            mapTo(node)
          );
        } else {
          if (prevSubscription) {
            prevSubscription.unsubscribe();
          }
          prevSubscription = sub;
          return of(node);
        }
      }
      matchedRoutes.value.delete(routeSymbol);
      matchedRoutes.next(matchedRoutes.value);
      if (Array.isArray(transitions)) {
        return router.pipe(
          switchMap(rtr => rtr.conductor),
          take(1),
          mapTo(null),
          tap(() => {
            if (prevSubscription) {
              prevSubscription.unsubscribe();
            }
          })
        );
      }
      if (prevSubscription) {
        prevSubscription.unsubscribe();
      }
      return of(null);
    }),
    startWith(null),
    catchError(e => {
      console.error(e);
      return of(<p>Error: {e}</p>);
    })
  );
}

export type FallbackProps = {
  children: AktaNode;
};

export function Fallback({ children }: FallbackProps) {
  return useDependency(matchedRoutesDependency).pipe(
    switchMap(item => item),
    map(matched => {
      return matched.size === 0 ? children : null;
    }),
    distinctUntilChanged()
  );
}

export function Link({ href, children }: { href: string; children: AktaNode }) {
  const ctx = useContext();
  const onClick: Akta.MouseEventHandler<HTMLAnchorElement> = new Subject();
  onClick.subscribe(e => {
    e.preventDefault();
    ctx.peek(routerDependency).history.push(href);
  });

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
}
