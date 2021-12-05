/** @jsxImportSource . */
import { AktaNode, DependencyMap } from './index';
import { from, Observable, of, Subject } from 'rxjs';
import { prepare } from './prepare';
import {
  renderingContext,
  RenderingContext,
  RenderingState,
} from './rendering-context';
import { useNext } from './dependencies';

function render(
  blueprint: AktaNode,
  type: string = 'div',
  ctx: RenderingContext = new RenderingContext()
) {
  const parent = document.createElement(type);
  renderingContext.setContextUnsafe(ctx);
  try {
    const node = prepare(blueprint, new DependencyMap());
    if (Array.isArray(node)) {
      parent.append(...node);
    } else {
      parent.append(node);
    }
    return parent;
  } finally {
    renderingContext.resetContextUnsafe(ctx);
  }
}

describe('prepare', () => {
  it('takes nested arrays of elements', () => {
    const el = render([
      [render('alpha', 'p'), [render('beta', 'p')]],
      render('zeta', 'p'),
    ]);
    expect(el).toMatchSnapshot();
  });

  it('takes observable nodes and inserts them in the correct order', () => {
    const sub1 = new Subject<AktaNode>();
    const sub2 = new Subject<AktaNode>();
    const sub3 = new Subject<AktaNode>();
    const ctx = new RenderingContext();
    const el = render(
      [of(document.createTextNode('alpha')), sub1, sub2, sub3],
      'div',
      ctx
    );
    expect(ctx.state.value).toEqual(RenderingState.init);
    sub3.next(render('sub3', 'p'));
    expect(el).toMatchSnapshot('sub3');
    expect(ctx.state.value).toEqual(RenderingState.init);
    sub1.next(render('sub1', 'p'));
    expect(el).toMatchSnapshot('sub1');
    expect(ctx.state.value).toEqual(RenderingState.init);
    sub2.next(render('sub2', 'p'));
    expect(el).toMatchSnapshot('sub2');
    expect(ctx.state.value).toEqual(RenderingState.active);
    sub2.next(null);
    expect(el).toMatchSnapshot('sub2-empty');
    sub1.next(render('sub1', 'span'));
    expect(el).toMatchSnapshot('sub1-empty');
    sub3.next(null);
    expect(el).toMatchSnapshot('sub3-empty');
  });

  it('unsubscribes to removed elements', () => {
    const sub = new Subject<AktaNode>();
    const onUnSub = jest.fn();
    const obs = new Observable<AktaNode>(sub => {
      sub.next(document.createTextNode('Observable!'));
      return onUnSub;
    });
    const ctx = new RenderingContext();
    const el = render(sub, 'div', ctx);
    expect(el).toMatchSnapshot('initial');
    expect(ctx.state.value).toEqual(RenderingState.init);
    sub.next([render('alpha', 'p'), obs]);
    expect(ctx.state.value).toEqual(RenderingState.active);
    expect(el).toMatchSnapshot('with obs');
    expect(onUnSub.mock.calls.length).toEqual(0);
    sub.next([render('alpha', 'p')]);
    expect(el).toMatchSnapshot('without obs');
    expect(onUnSub.mock.calls.length).toEqual(1);
  });
  it('takes nested arrays of observables of arrays', () => {
    const el = render([
      from([
        [render('alpha'), render('beta')],
        [render('daniel'), render('kalle')],
      ]),
      render('zeta', 'p'),
    ]);
    expect(el).toMatchSnapshot();
  });
  it('handles jsx', () => {
    const el = render([
      <p className="daniel">Akta {of(<span>Number 5</span>)}</p>,
    ]);
    expect(el).toMatchSnapshot();
  });
  it('handles components', () => {
    function Component() {
      return <p>Component</p>;
    }
    const el = render([<Component />]);
    expect(el).toMatchSnapshot();
  });
  it('handles generator components', () => {
    function* Component() {
      yield (<p>Initial</p>);
      return <p>Component</p>;
    }
    const el = render([<Component />]);
    expect(el).toMatchSnapshot();
  });
  it('handles async generator components', async () => {
    const cont: any = [];
    async function* Component() {
      const test = useNext();
      cont.push(test);
      const res: number = yield (<p>Initial</p>);
      return <p>Component {res}</p>;
    }
    const el = render([<Component />]);
    await cont[0](42);
    expect(el).toMatchSnapshot();
  });
});
