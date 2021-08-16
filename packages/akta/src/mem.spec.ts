import { verify } from '../test/mem-verify';
import { Subject } from 'rxjs';
import { dependecyContext } from './dependencies';
import { createDependencyMap } from './dependency-map';
import { mount } from './dom-ops';
import { jsx } from './jsx-runtime';

describe('ObserveAsync', () => {
  it(
    'Array nodes are rendered correctly',
    verify(async () => {
      const root = document.createElement('div');
      function Comp() {
        return jsx('p', { children: ['test', 'less'] });
      }
      const value = new Subject();

      dependecyContext.setContext(
        () => mount(jsx('div', { children: value }), root),
        createDependencyMap()
      );
      value.next([jsx(Comp, {})]);
      expect(root).toMatchSnapshot();
    })
  );
});
