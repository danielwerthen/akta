import { dependecyContext, createLazyDependency } from 'akta';
import { Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { createBrowserHistory, History, Location } from 'history';

export type Router = {
  history: History;
  location: Observable<Location>;
};

export function createRouter(history?: History): Router {
  const hist = history ?? createBrowserHistory();
  const location = new Observable<Location>(subscriber => {
    subscriber.next(hist.location);
    return hist.listen(({ location }) => subscriber.next(location));
  }).pipe(shareReplay(1));
  return {
    history: hist,
    location,
  };
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
