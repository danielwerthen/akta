import { createMemoryHistory } from 'history';
import { createRouter, Route, Router } from '../src';
import { mount } from 'akta';
import { Subject } from 'rxjs';
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
    mount(
      <Router history={hist}>
        <Route path="/">Route</Route>
        <Route path="/foobar">{momo}</Route>
      </Router>,
      root
    );
    expect(root).toMatchSnapshot();
    hist.push('/foobar');
    expect(root).toMatchSnapshot();
    momo.next('Foobar');
    expect(root).toMatchSnapshot();
  });
});
