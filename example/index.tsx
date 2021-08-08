import { mount, AktaIntrinsicElements } from 'akta';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

function App() {
  const loop = interval(1000).pipe(map(idx => <p>Iteration {idx}</p>));
  return (
    <div>
      <p>Loops:</p>
      {loop}
    </div>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, {
  parent: el,
  intrinsic: new AktaIntrinsicElements(),
});
