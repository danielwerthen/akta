import { mount, Props } from 'akta';
import { finalize, interval, of, from, startWith } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { route } from 'akta-router';

console.log(route(2));

function Display() {
  const phase1 = of('phase1').pipe(delay(1500));
  const phase2 = of('phase2').pipe(delay(5250), startWith('loading'));
  const phase3 = of('phase3').pipe(delay(1000));
  return (
    <div>
      Phases:
      {phase1}
      {phase2}
      {phase3}
    </div>
  );
}

function ObsArray() {
  return (
    <div>
      {from([
        [1, 2, 3],
        [2, 3, 4],
      ])}
    </div>
  );
}

function App() {
  const loop = interval(1000).pipe(
    startWith(-1),
    map(idx => <p>Iteration {idx}</p>),
    finalize(() => console.log('Ended'))
  );
  return (
    <div>
      <ObsArray />
      <p>Loops:</p>
      {loop}
      <p
        tabIndex={1}
        $background_focus="green"
        $background_hover_focus="yellow"
        $backgroundColor="gray"
        $background="red"
        $background_hover="blue"
      >
        {'daniel is <div>bad</div>'}
      </p>
      {from([null, <Display />])}
    </div>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
