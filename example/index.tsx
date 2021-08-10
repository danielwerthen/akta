import { mount, Props } from 'akta';
import { finalize, interval } from 'rxjs';
import { map } from 'rxjs/operators';

function App() {
  const loop = interval(1000).pipe(
    map(idx => <p>Iteration {idx}</p>),
    finalize(() => console.log('Ended'))
  );
  return (
    <div>
      <p>Loops:</p>
      {loop}
      {'daniel is <div>bad</div>'}
    </div>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
