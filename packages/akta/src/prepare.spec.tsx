import { Observable, of, Subject } from 'rxjs';
import { BlueprintNode, prepare, PrepContext, PrepState } from './prepare';

function render(
  blueprint: string | BlueprintNode,
  type: string = 'div',
  ctx: PrepContext = new PrepContext()
) {
  const parent = document.createElement(type);
  const node = prepare(
    typeof blueprint === 'string'
      ? document.createTextNode(blueprint)
      : blueprint,
    ctx
  );
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
    const sub1 = new Subject<BlueprintNode>();
    const sub2 = new Subject<BlueprintNode>();
    const sub3 = new Subject<BlueprintNode>();
    const ctx = new PrepContext();
    const el = render(
      [of(document.createTextNode('alpha')), sub1, sub2, sub3],
      'div',
      ctx
    );
    expect(ctx.state.value).toEqual(PrepState.init);
    sub3.next(render('sub3', 'p'));
    expect(el).toMatchSnapshot('sub3');
    expect(ctx.state.value).toEqual(PrepState.init);
    sub1.next(render('sub1', 'p'));
    expect(el).toMatchSnapshot('sub1');
    expect(ctx.state.value).toEqual(PrepState.init);
    sub2.next(render('sub2', 'p'));
    expect(el).toMatchSnapshot('sub2');
    expect(ctx.state.value).toEqual(PrepState.active);
    sub2.next(null);
    expect(el).toMatchSnapshot('sub2-empty');
    sub1.next(render('sub1', 'span'));
    expect(el).toMatchSnapshot('sub1-empty');
    sub3.next(null);
    expect(el).toMatchSnapshot('sub3-empty');
  });

  it('unsubscribes to removed elements', () => {
    const sub = new Subject<BlueprintNode>();
    const onUnSub = jest.fn();
    const obs = new Observable<BlueprintNode>(sub => {
      sub.next(document.createTextNode('Observable!'));
      return onUnSub;
    });
    const ctx = new PrepContext();
    const el = render(sub, 'div', ctx);
    expect(el).toMatchSnapshot('initial');
    expect(ctx.state.value).toEqual(PrepState.init);
    sub.next([render('alpha', 'p'), obs]);
    expect(ctx.state.value).toEqual(PrepState.active);
    expect(el).toMatchSnapshot('with obs');
    expect(onUnSub.mock.calls.length).toEqual(0);
    sub.next([render('alpha', 'p')]);
    expect(el).toMatchSnapshot('without obs');
    expect(onUnSub.mock.calls.length).toEqual(1);
  });
});
