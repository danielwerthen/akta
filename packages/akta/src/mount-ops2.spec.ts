import { from, isObservable, of } from 'rxjs';
import { DependencyMap } from './dependency-map';
import { jsx } from './jsx-runtime';
import { LazyAttacher, observeNode, mount } from './mount-ops2';

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
    const result = observeNode(
      of(
        jsx('div', {
          children: ['baz', jsx(Component, { children: 'test' }), of('foobar')],
        })
      ),
      deps,
      attacher
    );
    if (isObservable(result)) {
      result.subscribe(() => {
        attacher.activate(node => root.append(node));
      });
    } else {
      attacher.activate(node => root.append(node));
    }
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
});
