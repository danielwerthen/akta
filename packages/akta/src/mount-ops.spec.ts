import { from, of, Subject } from 'rxjs';
import { DependencyMap } from './dependency-map';
import { jsx } from './jsx-runtime';
import {
  getPrev,
  LazyAttacher,
  observeNode,
  mount,
  NodeObserver,
} from './mount-ops';

describe('Mount ops 2', () => {
  let attacher = new LazyAttacher();
  const root = document.createElement('article');
  beforeEach(() => {
    root.innerHTML = '';
    attacher = new LazyAttacher();
  });

  it('should create deterministic structures', () => {
    attacher.attach(document.createElement('div'), [0]);
    attacher.attach(document.createTextNode('Foobar'), [1, 1]);
    attacher.attach(document.createTextNode('Baz'), [1, 0]);
    attacher.activate(node => root.append(node));
    attacher.attach(document.createElement('div'), [2]);
    expect(root).toMatchSnapshot();
  });
});

describe('Observe node', () => {
  it('shoudl work', () => {
    const deps = new DependencyMap();
    const attacher = new LazyAttacher();
    const root = document.createElement('article');
    function Component({ children }: any) {
      return children;
    }
    const observer = new NodeObserver();
    observeNode(
      of(
        jsx('div', {
          children: ['baz', jsx(Component, { children: 'test' }), of('foobar')],
        })
      ),
      deps,
      attacher,
      observer
    );
    observer.observe().subscribe(() => {
      attacher.activate(node => root.append(node));
    });
    expect(root).toMatchSnapshot();
  });

  it('should place later nodes in right order', () => {
    const root = document.createElement('article');
    mount(
      jsx('div', {
        children: [
          jsx('div', {
            children: [from(['hide', 'first']), 'second', 'third'],
          }),
          jsx('div', {
            children: ['first', from(['hide', 'second']), 'third'],
          }),
          jsx('div', {
            children: ['first', 'second', from(['hide', 'third'])],
          }),
        ],
      }),
      root
    );
    expect(root).toMatchSnapshot();
  });

  it('should handle case 4', () => {
    const root = document.createElement('article');
    function Daniel() {
      throw new Error('Foob');
      return 'comp';
    }
    try {
      mount(
        jsx('div', {
          children: [
            jsx('div', {
              children: [
                jsx('div', {
                  children: [
                    jsx('div', {
                      children: [jsx(Daniel, {})],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        root
      );
      throw new Error('Should not end up here');
    } catch (e) {
      const error = e as Error;
      const stackDepth = ((error.stack || '').match(/at observeNode/g) || [])
        .length;
      expect(stackDepth).toEqual(1);
      expect(root).toMatchSnapshot();
    }
  });

  it('should handle fragments properly', () => {
    const root = document.createElement('article');
    function Comp() {
      return jsx('div', {
        children: ['test', 'foo'],
      });
    }
    function App() {
      return jsx('div', {
        children: [
          jsx('h2', {
            children: 'Header',
          }),
          jsx(undefined as any, {
            children: [jsx(Comp, {}), jsx(Comp, {})],
          }),
          jsx('div', {
            children: 'after',
          }),
        ],
      });
    }
    mount(jsx(App, {}), root);
    expect(root).toMatchSnapshot();
  });

  it('should mount elements in correct order', () => {
    const root = document.createElement('article');
    const momo = new Subject();
    function App() {
      return jsx('div', {
        children: [
          of('Param id: 42'),
          momo,
          of(null),
          from([null, 'Match 42']),
        ],
      });
    }
    mount(jsx(App, {}), root);
    momo.next('Foobar2');
    expect(root).toMatchSnapshot();
  });
});

describe('getPrev', () => {
  it('should generate indicies in the right order', () => {
    const foo = getPrev([2, 3]);
    expect(foo.next().value).toStrictEqual([2, 2]);
    expect(foo.next().value).toStrictEqual([2, 1]);
    expect(foo.next().value).toStrictEqual([2, 0]);
    expect(foo.next().value).toStrictEqual([1]);
    expect(foo.next().value).toStrictEqual([0]);
    expect(foo.next().done).toBe(true);
  });
});
