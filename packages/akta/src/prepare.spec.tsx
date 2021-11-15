/** @jsxImportSource . */
import { AktaNode, DependencyMap } from './index';
import { from, Observable, of, Subject } from 'rxjs';
import { prepare } from './prepare';
import { RenderingContext, RenderingState } from './rendering-context';

function render(
  blueprint: AktaNode,
  type: string = 'div',
  ctx: RenderingContext = new RenderingContext()
) {
  const parent = document.createElement(type);
  const node = prepare(blueprint, ctx, new DependencyMap());
  if (Array.isArray(node)) {
    parent.append(...node);
  } else {
    parent.append(node);
  }
  return parent;
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
    const el = render([<p className="daniel">Akta {of(5)}</p>]);
    expect(el).toMatchSnapshot();
  });
});
