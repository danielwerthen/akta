import { mount } from 'akta';
import { finalize, interval, of, from, startWith } from 'rxjs';
import { map, delay } from 'rxjs/operators';

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

export default function Index() {
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
      <div onClick={[console.log, 'Div1']}>
        Div 1
        <div onClick={e => (console.log('Div2', e), e.stopPropagation())}>
          Div 2
          <div onClick={console.log.bind(null, 'Div3')}>
            Div 3<div onClick={console.log.bind(null, 'Div4')}>Div 4</div>
          </div>
        </div>
      </div>
      <div
        height="100vh"
        width="100vw"
        $backgroundColor="red"
        $backgroundColor_min100="blue"
        $backgroundColor_max500_min200="green"
        $backgroundColor_hover_min400_max500="yellow"
      >
        <svg
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          stroke="red"
          fill="grey"
        >
          <circle cx="10" cy="10" r="5"></circle>
          <circle cx="20" cy="20" r="5"></circle>

          <svg
            viewBox="0 0 10 10"
            x="40"
            width="10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="5" r="4"></circle>
          </svg>
        </svg>
      </div>
    </div>
  );
}
