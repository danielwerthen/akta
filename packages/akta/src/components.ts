import { AktaNode } from './types';
import { usePreparer } from './mount-ops';
import { of } from 'rxjs';
import { switchMap, mapTo, catchError, finalize } from 'rxjs/operators';

export function ErrorBoundary({
  children,
  fallback,
  log,
}: {
  children: AktaNode;
  fallback?: AktaNode;
  log?: boolean;
}) {
  const prepare = usePreparer();
  return of(void 0).pipe(
    switchMap(() => {
      const [node, obs, sub] = prepare(children);
      return obs.pipe(
        mapTo(node),
        finalize(() => sub.unsubscribe())
      );
    }),
    catchError(err => {
      if (log) {
        console.error(err);
      }
      return of(fallback || null);
    })
  );
}
