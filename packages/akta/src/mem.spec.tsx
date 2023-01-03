import { Subject } from 'rxjs';
import { dependencyContext } from './dependencies';
import { DependencyMap } from './dependency-map';
import { mount } from './';
import { jsx } from './jsx-runtime';

describe('ObserveAsync', () => {
  it('Array nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    function Comp() {
      return jsx('p', { children: ['test', 'less'] });
    }
    const value = new Subject();

    dependencyContext.setContext(
      () => mount(jsx('div', { children: value }), root),
      new DependencyMap()
    );
    value.next([jsx(Comp, {})]);
    expect(root).toMatchSnapshot();
  });
});
