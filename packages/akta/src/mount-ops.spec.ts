import { from, interval, map, take } from 'rxjs';
import { attachChildren, Attacher } from './mount-ops';

describe('mount-ops', () => {
  it.only('should work', async () => {
    const root = document.createElement('div');

    const child1 = interval(100).pipe(
      take(4),
      map(id => (id > 2 ? ['maker', 'final'] : id + 'test'))
    );
    const child2 = 'bottom';
    const child3 = from(['daniel', 'foobar']);
    const child4 = from([['alpha', 'beta'], 'foobar', ['zeta', 'tau']]);

    const attacher = new Attacher(
      () => null,
      () => root
    );
    const sub = attachChildren(attacher, [child1, child2, child3, child4]);
    if (sub) {
      sub.subscribe({
        error: console.error,
      });
    }
    await new Promise(res => setTimeout(res, 1000));
    expect(root).toMatchSnapshot();
  });
  it.only('should also work', () => {
    const root = document.createElement('div');
    const gen = new Attacher(
      () => null,
      () => root
    );
    gen.attach(document.createTextNode('test1'), 0);
    gen.attach(document.createTextNode('test2'), 1);
    const gen2 = gen.branch(1);
    gen2.attach(document.createTextNode('injected'), 0);
    gen.attach(document.createTextNode('test3'), 2);
    gen.activate();
    gen.attach(document.createTextNode('updated'), 1);
    gen2.activate();
    expect(root).toMatchSnapshot();
  });
});
