import { of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';

export function Slow() {
  return (
    <div>
      <h1>Slow page</h1>
      {of('Slow value').pipe(
        delay(3000),
        finalize(() => console.log('Slow page final'))
      )}
    </div>
  );
}
