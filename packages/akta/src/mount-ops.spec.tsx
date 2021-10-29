/** @jsxImportSource . */
import {
  from,
  of,
  Subject,
  BehaviorSubject,
  firstValueFrom,
  Observable,
  toArray,
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
import { AktaNode, Fragment } from './types';

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
      of(<div>{['baz', <Component>test</Component>, of('foobar')]}</div>),
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
      <div>
        <div>{[from(['hide', 'first']), 'second', 'third']}</div>
        <div>{['first', from(['hide', 'second']), 'third']}</div>
        <div>{['first', 'second', from(['hide', 'third'])]}</div>
      </div>,
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
        <div>
          <div>
            <div>
              <div>
                <Daniel />
              </div>
            </div>
          </div>
        </div>,
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
      return <div>{['test', 'foo']}</div>;
    }
    function App() {
      return (
        <div>
          <h2>Header</h2>
          <>
            <Comp />
            <Comp />
          </>
          <div>after</div>
        </div>
      );
    }
    mount(<App />, root);
    expect(root).toMatchSnapshot();
  });

  it('should mount elements in correct order', () => {
    const root = document.createElement('article');
    const momo = new Subject();
    function App() {
      return (
        <div>
          {[of('Param id: 42'), momo, of('test'), from([null, 'Match 42'])]}
        </div>
      );
    }
    mount(<App />, root);
    momo.next('Foobar2');
    expect(root).toMatchSnapshot();
  });
  it('Should handle events', () => {
    const root = document.createElement('article');
    const fn = jest.fn();
    mount(<div onClick={fn}>body</div>, root);
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
      <p>{['top', from(['immediate', 'immediate2']), value, 'bottom']}</p>,
      root
    );
    expect(root).toMatchSnapshot();
    await new Promise(res => setTimeout(res, 100));
    expect(root).toMatchSnapshot();
  });
  it('should render within range of comparison implementation', async () => {
    const root = document.createElement('div');
    const array = new Array(100).fill(0);
    const value = array.map(() => <span className="foobar">word</span>);
    const t0 = performance.now();
    mount(<p>{value}</p>, root);
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
    mount(<p>{value}</p>, root);
    expect(root).toMatchSnapshot();
  });

  it('mount and unmount is called at the right time', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const unsub = mount(<p>{value}</p>, root);
    const onMount = new Subject<any>();
    const onUnmount = new Subject<any>();
    const mounts = firstValueFrom(onMount.pipe(toArray()));
    const unmounts = firstValueFrom(onUnmount.pipe(toArray()));
    value.next(<div>final</div>);
    value.next(
      <div onMount={onMount} onUnmount={onUnmount}>
        first
      </div>
    );
    value.next(<div>final</div>);
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
    const unsub = mount(<p>{value}</p>, root);
    const onMount = new Subject<any>();
    const onUnmount = new Subject<any>();
    const mounts = firstValueFrom(onMount.pipe(toArray()));
    const unmounts = firstValueFrom(onUnmount.pipe(toArray()));
    value.next(<div>final</div>);
    await new Promise(res => setTimeout(res, 10));
    value.next(
      <div>
        <div onMount={onMount} onUnmount={onUnmount}>
          <div onMount={onMount} onUnmount={onUnmount}>
            first
          </div>
        </div>
      </div>
    );
    await new Promise(res => setTimeout(res, 10));
    value.next(<div>final</div>);
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
      return <p>{name}</p>;
    }
    const unsub = mount(<div>{value}</div>, root);
    value.next(<Comp name="Data" />);
    expect(teardown.mock.calls.length).toBe(0);
    value.next(<Comp name="Data2" />);
    expect(teardown.mock.calls.length).toBe(1);
    value.next(<Comp name="Data3" />);
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
      usePrepare(<span>{eventually}</span>).then(res => {
        children.next(res);
      });
      return <p>{children}</p>;
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
      return <p>{of('Daniel')}</p>;
    }
    const unsub = mount(<Comp />, root);
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should handle observable child with null siblings', async () => {
    const root = document.createElement('div');
    function Comp({ sub }: { sub: Subject<number | null> }) {
      return sub;
    }
    const sub1 = new Subject<number | null>();
    const sub2 = new Subject<number | null>();
    const sub3 = new Subject<number | null>();
    const unsub = mount(
      <>
        <Comp sub={sub1} />
        <Comp sub={sub2} />
        <Comp sub={sub3} />
      </>,
      root
    );
    sub1.next(1);
    sub2.next(1);
    sub3.next(1);
    expect(root).toMatchSnapshot();
    sub1.next(null);
    sub2.next(null);
    sub3.next(null);
    expect(root).toMatchSnapshot();
    sub1.next(2);
    expect(root).toMatchSnapshot();
    sub3.next(3);
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should not activate out of order prepared children', async () => {
    const root = document.createElement('div');

    function Foo() {
      return (
        <div>
          <h2>Links</h2>
          <div id={of('55')}>Test</div>
        </div>
      );
    }

    function Second({ children }: { children: AktaNode }) {
      const prepare = usePreparer();
      const [node] = prepare(children);
      return from([null, node]);
    }

    const subject = new Subject();
    const className = new Subject();
    const unsub = mount(
      <div>
        <Second>{['first', 'second']}</Second>
        <Foo />
      </div>,
      root
    );
    className.next('daniel');
    subject.next(null);
    subject.next([<div>1</div>, <div>2</div>, <div>3</div>]);
    expect(root).toMatchSnapshot('first');
    unsub();
  });

  it('should handle observable classNames', async () => {
    const root = document.createElement('div');
    const unsub = mount(<div className="cl3" />, root);
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should handle component exceptions gracefully', async () => {
    const root = document.createElement('div');
    function ErrorImmediately() {
      throw new Error('Should be caught');
      return 'Never';
    }
    expect(() => mount(<ErrorImmediately />, root)).toThrowError();
  });

  it('should handle nested component exceptions gracefully', async () => {
    const root = document.createElement('div');
    function ErrorImmediately() {
      throw new Error('Should be caught');
      return 'Never';
    }
    const obs = new Observable(() => {
      throw new Error('Invalid observable');
    });
    const spy = jest.spyOn(global.console, 'error');
    spy.mockImplementation();
    mount(<div>{of(jsx(ErrorImmediately, {}))}</div>, root);
    expect(spy.mock.calls.length).toBe(1);
    mount(<div>{obs}</div>, root);
    expect(spy.mock.calls.length).toBe(2);
    const even = new Subject();
    mount(<div>{even}</div>, root);

    even.next(jsx(ErrorImmediately, {}));
    expect(spy.mock.calls.length).toBe(3);
    spy.mockRestore();
  });

  it('should allow prepared elements to be detachable', async () => {
    const foo = <p>Daniel</p>;
    expect(foo).toMatchSnapshot();
  });

  it('should remove old array items when sizes differ', async () => {
    const root = document.createElement('div');
    const array$ = new BehaviorSubject<any[]>([]);
    const unsub = mount(<div>{array$}</div>, root);
    array$.next(
      new Array(10).fill(0).map((_i, idx) => <p>{idx.toString()}</p>)
    );
    expect(root).toMatchSnapshot();
    array$.next(new Array(5).fill(0).map((_i, idx) => <p>{idx.toString()}</p>));
    expect(root).toMatchSnapshot();
    array$.next(new Array(0).fill(0).map((_i, idx) => <p>{idx.toString()}</p>));
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should accept Fragments with keys', async () => {
    const root = document.createElement('div');
    const unsub = mount(
      <div>
        {[
          <>Empty</>,
          <Fragment>Fragment</Fragment>,
          <Fragment key="foo">Fragment2</Fragment>,
        ]}
      </div>,
      root
    );
    expect(root).toMatchSnapshot();
    unsub();
  });
});
