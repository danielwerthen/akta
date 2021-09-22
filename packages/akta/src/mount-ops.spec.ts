import {
  from,
  of,
  Subject,
  BehaviorSubject,
  firstValueFrom,
  Observable,
  toArray,
  mapTo,
} from 'rxjs';
import { DependencyMap } from './dependency-map';
import { jsx } from './jsx-runtime';
import {
  getPrev,
  LazyAttacher,
  observeNode,
  mount,
  NodeObserver,
  usePreparer,
} from './mount-ops';
import { usePrepare } from './index';
import { useTeardown } from './dependencies';
import { AktaNode } from './types';

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
          jsx(undefined, {
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
  it('Should handle events', () => {
    const root = document.createElement('article');
    const fn = jest.fn();
    mount(jsx('div', { onClick: fn, children: 'body' }), root);
    (root.childNodes[0] as HTMLElement).click();
    expect(fn.mock.calls.length).toBe(1);
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

describe('DOM OPS', () => {
  it('Observable child nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    const value = new Observable(sub => {
      setTimeout((item: string) => sub.next(item), 10, 'foobar');
    });
    mount(
      jsx('p', {
        children: ['top', from(['immediate', 'immediate2']), value, 'bottom'],
      }),
      root
    );
    expect(root).toMatchSnapshot();
    await new Promise(res => setTimeout(res, 100));
    expect(root).toMatchSnapshot();
  });
  it('should render within range of comparison implementation', async () => {
    const root = document.createElement('div');
    const array = new Array(100).fill(0);
    const value = array.map(() =>
      jsx('span', { children: 'word', className: 'foobar' })
    );
    const t0 = performance.now();
    mount(jsx('p', { children: value }), root);
    function update(span: HTMLSpanElement) {
      span.classList.add('foobar');
      span.innerText = 'word';
    }
    const t1 = performance.now();
    const root2 = document.createElement('div');
    array.forEach(() => {
      const span = document.createElement('span');
      update(span);
      root2.appendChild(span);
    });
    const t2 = performance.now();

    const ratio = Math.round((100 * (t1 - t0)) / (t2 - t1)) / 100;
    console.log('Established ratio', ratio);
    expect(ratio).toBeLessThan(300);
  });

  it('Array nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    const value = ['test', 'more'];
    mount(jsx('p', { children: value }), root);
    expect(root).toMatchSnapshot();
  });

  it('mount and unmount is called at the right time', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const unsub = mount(jsx('p', { children: value }), root);
    const onMount = new Subject<unknown>();
    const onUnmount = new Subject<unknown>();
    const mounts = firstValueFrom(onMount.pipe(toArray()));
    const unmounts = firstValueFrom(onUnmount.pipe(toArray()));
    value.next(jsx('div', { children: 'final' }));
    await new Promise(res => setTimeout(res, 10));
    value.next(jsx('div', { onMount, onUnmount, children: 'first' }));
    await new Promise(res => setTimeout(res, 10));
    value.next(jsx('div', { children: 'final' }));
    await new Promise(res => setTimeout(res, 10));
    unsub();
    onMount.complete();
    onUnmount.complete();
    expect(root).toMatchSnapshot();
    expect((await mounts).length).toBe(1);
    expect((await unmounts).length).toBe(1);
  });

  it('deep mount and unmount is called at the right time', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const unsub = mount(jsx('p', { children: value }), root);
    const onMount = new Subject<unknown>();
    const onUnmount = new Subject<unknown>();
    const mounts = firstValueFrom(onMount.pipe(toArray()));
    const unmounts = firstValueFrom(onUnmount.pipe(toArray()));
    value.next(jsx('div', { children: 'final' }));
    await new Promise(res => setTimeout(res, 10));
    value.next(
      jsx('div', {
        children: jsx('div', {
          onMount,
          onUnmount,
          children: jsx('div', { onMount, onUnmount, children: 'first' }),
        }),
      })
    );
    await new Promise(res => setTimeout(res, 10));
    value.next(jsx('div', { children: 'final' }));
    await new Promise(res => setTimeout(res, 10));
    unsub();
    onMount.complete();
    onUnmount.complete();
    await new Promise(res => setTimeout(res, 10));
    expect((await unmounts).length).toBe(2);
    expect((await mounts).length).toBe(2);
    expect(root).toMatchSnapshot();
  });
  it('should handle teardown', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const teardown = jest.fn();
    function Comp({ name }: { name: string }) {
      useTeardown(teardown);
      return jsx('p', { children: name });
    }
    const unsub = mount(jsx('div', { children: value }), root);
    value.next(jsx(Comp, { name: 'Data' }));
    expect(teardown.mock.calls.length).toBe(0);
    value.next(jsx(Comp, { name: 'Data2' }));
    expect(teardown.mock.calls.length).toBe(1);
    value.next(jsx(Comp, { name: 'Data3' }));
    expect(teardown.mock.calls.length).toBe(2);
    unsub();
    expect(teardown.mock.calls.length).toBe(3);
    expect(root).toMatchSnapshot();
  });

  it('should handle prepare', async () => {
    const root = document.createElement('div');
    const eventually = new Subject<AktaNode>();
    function Comp() {
      const children = new BehaviorSubject<AktaNode>('Loading');
      usePrepare(jsx('span', { children: eventually })).then(res => {
        children.next(res);
      });
      return jsx('p', { children });
    }
    const unsub = mount(jsx(Comp, {}), root);
    await new Promise(res => setTimeout(res, 10));
    expect(root).toMatchSnapshot();
    eventually.next('Finally');
    await new Promise(res => setTimeout(res, 10));
    unsub();
    expect(root).toMatchSnapshot();
  });
  it('should handle observable child', async () => {
    const root = document.createElement('div');
    function Comp() {
      return jsx('p', { children: of('Daniel') });
    }
    const unsub = mount(jsx(Comp, {}), root);
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should not activate out of order prepared children', async () => {
    const root = document.createElement('div');

    function Foo() {
      return jsx('div', {
        children: [
          jsx('h2', {
            children: 'Links',
          }),
          jsx('div', {
            id: of('55'),
            children: 'Test',
          }),
        ],
      });
    }

    function Second({ children }: { children: AktaNode }) {
      const prepare = usePreparer();
      const [node] = prepare(children);
      return from([null, node]);
    }

    const subject = new Subject();
    const className = new Subject();
    const unsub = mount(
      jsx('div', {
        children: [
          jsx(Second, {
            children: ['first', 'second'],
          }),
          jsx(Foo, {}),
        ],
      }),
      root
    );
    className.next('daniel');
    subject.next(null);
    subject.next([
      jsx('div', { children: 1 }),
      jsx('div', { children: 2 }),
      jsx('div', { children: 3 }),
    ]);
    expect(root).toMatchSnapshot('first');
    unsub();
  });
});
