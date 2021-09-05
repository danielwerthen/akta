import { createMemoryHistory } from 'history';
import {
  createRouter,
  Fallback,
  Route,
  routeMatchDependency,
  Router,
} from '../src';
import { mount, useDependency } from 'akta';
import { map, Subject } from 'rxjs';
describe('Test', () => {
  it('should', () => {
    const router = createRouter(createMemoryHistory());
    let counter = 0;
    router.location.subscribe(() => {
      counter++;
    });
    router.history.push('/foobar');
    router.history.push('/foobar');
    expect(counter).toBe(3);
  });
  it('should match snapshot', async () => {
    const root = document.createElement('div');
    const hist = createMemoryHistory({ initialEntries: ['/route'] });
    const momo = new Subject<string>();
    function Comp() {
      const match = useDependency(routeMatchDependency);
      return (
        <div>
          {match.pipe(
            map(match =>
              match ? `Param id: ${match.params.id}` : 'Not matched'
            )
          )}
          {momo}
          <Route path="/foobar/42">Match</Route>
        </div>
      );
    }
    mount(
      <Router history={hist}>
        <Route path="/route">Route</Route>
        <Route path="/foobar/:id">
          <Comp />
        </Route>
        <Fallback>Fallback</Fallback>
      </Router>,
      root
    );
    expect(root).toMatchSnapshot();
    hist.push('/foobar/41');
    expect(root).toMatchSnapshot();
    momo.next('Foobar2');
    expect(root).toMatchSnapshot();
    hist.push('/foobar/42');
    expect(root).toMatchSnapshot();
    hist.push('/unmatched');
    expect(root).toMatchSnapshot();
  });
});
