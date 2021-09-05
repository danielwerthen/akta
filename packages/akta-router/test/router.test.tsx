import { createMemoryHistory } from 'history';
import { createRouter, Route, RouteMatchDependency, Router } from '../src';
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
  it('should match snapshot', () => {
    const root = document.createElement('div');
    const hist = createMemoryHistory({ initialEntries: ['/'] });
    const momo = new Subject<string>();
    function Comp() {
      const match = useDependency(RouteMatchDependency);
      return (
        <div>
          {match.pipe(
            map(match =>
              match ? `Param id: ${match.params.id}` : 'Not matched'
            )
          )}
          {momo}
        </div>
      );
    }
    mount(
      <Router history={hist}>
        <Route path="/">Route</Route>
        <Route path="/foobar/:id">
          <Comp />
        </Route>
      </Router>,
      root
    );
    expect(root).toMatchSnapshot();
    hist.push('/foobar/42');
    expect(root).toMatchSnapshot();
    momo.next('Foobar2');
    expect(root).toMatchSnapshot();
  });
});
