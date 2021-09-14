import { isObservable, of } from 'rxjs';
import { DependencyMap } from './dependency-map';
import { jsx } from './jsx-runtime';
import { LazyAttacher, observeNode } from './mount-ops2';

describe('Mount ops 2', () => {
  const onMount = jest.fn();
  const onUnmount = jest.fn();
  let attacher = new LazyAttacher({
    onMount,
    onUnmount,
  });
  const root = document.createElement('article');
  beforeEach(() => {
    onMount.mockClear();
    onUnmount.mockClear();
    root.innerHTML = '';
    attacher = new LazyAttacher({
      onMount,
      onUnmount,
    });
  });

  it('should create deterministic structures', () => {
    attacher.attach(document.createElement('div'), [0]);
    attacher.attach(document.createTextNode('Foobar'), [1, 1]);
    attacher.attach(document.createTextNode('Baz'), [1, 0]);
    attacher.attach(document.createElement('div'), [2]);
    attacher.activate(node => root.append(node));
    expect(root).toMatchSnapshot();
  });
});

describe('Observe node', () => {
  it('shoudl work', () => {
    const deps = new DependencyMap();
    const attacher = new LazyAttacher({});
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
});
