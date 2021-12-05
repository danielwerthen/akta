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
import { jsx } from './jsx-runtime';
import { render } from './render';
import { useTeardown } from './dependencies';
import { AktaNode, Fragment } from './types';

describe('Observe node', () => {
  it('should place later nodes in right order', () => {
    const root = document.createElement('article');
    render(
      <div>
        <div>{[from(['hide', 'first']), 'second', 'third']}</div>
        <div>{['first', from(['hide', 'second']), 'third']}</div>
        <div>{['first', 'second', from(['hide', 'third'])]}</div>
      </div>,
      root
    );
    expect(root).toMatchSnapshot();
  });

  it.skip('should handle case 4', () => {
    const root = document.createElement('article');
    function Daniel() {
      throw new Error('Foob');
      return 'comp';
    }
    try {
      render(
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
    render(<App />, root);
    expect(root).toMatchSnapshot();
  });

  it('should mount elements in correct order', () => {
    const root = document.createElement('article');
    const momo = new Subject<AktaNode>();
    function App() {
      return (
        <div>
          {[of('Param id: 42'), momo, of('test'), from([null, 'Match 42'])]}
        </div>
      );
    }
    render(<App />, root);
    momo.next('Foobar2');
    expect(root).toMatchSnapshot();
  });
  it.skip('Should handle events', () => {
    const root = document.createElement('article');
    const fn = jest.fn();
    render(<div onClick={fn}>body</div>, root);
    (root.childNodes[0] as HTMLElement).click();
    expect(fn.mock.calls.length).toBe(1);
    expect(root).toMatchSnapshot();
  });
});

describe('DOM OPS', () => {
  it('Observable child nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    const value = new Observable<AktaNode>(sub => {
      setTimeout((item: string) => sub.next(item), 10, 'foobar');
    });
    render(
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
    render(<p>{value}</p>, root);
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
    render(<p>{value}</p>, root);
    expect(root).toMatchSnapshot();
  });

  it.skip('mount and unmount is called at the right time', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const unsub = render(<p>{value}</p>, root);
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

  it.skip('deep mount and unmount is called at the right time', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const unsub = render(<p>{value}</p>, root);
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
  it.skip('should handle teardown', async () => {
    const root = document.createElement('div');
    const value = new Subject<AktaNode>();
    const teardown = jest.fn();
    function Comp({ name }: { name: string }) {
      useTeardown(teardown);
      return <p>{name}</p>;
    }
    const unsub = render(<div>{value}</div>, root);
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

  it('should handle observable child', async () => {
    const root = document.createElement('div');
    function Comp() {
      return <p>{of('Daniel')}</p>;
    }
    const unsub = render(<Comp />, root);
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
    const unsub = render(
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

  it('should handle observable classNames', async () => {
    const root = document.createElement('div');
    const unsub = render(<div className="cl3" />, root);
    expect(root).toMatchSnapshot();
    unsub();
  });

  it('should handle component exceptions gracefully', async () => {
    const root = document.createElement('div');
    function ErrorImmediately() {
      throw new Error('Should be caught');
      return 'Never';
    }
    expect(() => render(<ErrorImmediately />, root)).toThrowError();
  });

  it.skip('should handle nested component exceptions gracefully', async () => {
    const root = document.createElement('div');
    function ErrorImmediately() {
      throw new Error('Should be caught');
      return 'Never';
    }
    const obs = new Observable<AktaNode>(() => {
      throw new Error('Invalid observable');
    });
    const spy = jest.spyOn(global.console, 'error');
    spy.mockImplementation();
    render(<div>{of(jsx(ErrorImmediately, {}))}</div>, root);
    expect(spy.mock.calls.length).toBe(1);
    render(<div>{obs}</div>, root);
    expect(spy.mock.calls.length).toBe(2);
    const even = new Subject<AktaNode>();
    render(<div>{even}</div>, root);

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
    const unsub = render(<div>{array$}</div>, root);
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
    const unsub = render(
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

  it('should accept html elements', async () => {
    const root = document.createElement('div');
    const el = document.createElement('div');
    el.innerHTML = 'foobar';
    function Comment() {
      const el2 = document.createElement('div');
      el2.innerHTML = 'comment';
      return el2;
    }
    const el3 = document.createElement('div');
    el3.innerHTML = 'el3';
    const unsub = render(
      <div>
        {el}
        <Comment />
        {from([el3])}
      </div>,
      root
    );
    expect(root).toMatchSnapshot();
    unsub();
  });

  it.skip('should accept html elements', async () => {
    const root = document.createElement('div');
    const el = document.createElement('div');
    el.innerHTML = 'el1';
    const unsub = render(
      <div>
        <span>{el}</span>
        <span>{el}</span>
        <span>{el}</span>
      </div>,
      root
    );
    expect(root).toMatchSnapshot();
    unsub();
  });
});
