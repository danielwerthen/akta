import { from, interval, map, take } from 'rxjs';
import { attach, attachChildren } from './mount-ops';

describe('mount-ops', () => {
  it.only('should work', async () => {
    const root = document.createElement('div');
    const sibling = document.createTextNode('');
    root.appendChild(sibling);

    const child1 = interval(100).pipe(
      take(4),
      map(id => (id > 2 ? ['danie', 'foobar'] : id + 'test'))
    );
    const child2 = 'bottom';
    const child3 = from(['daniel', 'foobar']);

    const sub = attachChildren(() => sibling, [child1, child2, child3]);
    if (sub) {
      sub.subscribe({
        error: console.error,
      });
    }
    await new Promise(res => setTimeout(res, 1000));
    expect(root).toMatchSnapshot();
  });
  it('should also work', () => {
    const root = document.createElement('div');
    const sibling = document.createTextNode('');
    root.appendChild(sibling);
    const gen = attach(() => sibling);
    gen.next();
    gen.next([document.createTextNode('test1'), 0]);
    gen.next([document.createTextNode('test2'), 1]);
    const { value } = gen.next(1);
    if (!value) {
      throw new Error('Invalid state');
    }
    const gen2 = attach(value);
    gen2.next();
    gen2.next([document.createTextNode('injected'), 0]);
    gen.next([document.createTextNode('test3'), 2]);
    gen.next('activate');
    gen.next([document.createTextNode('updated'), 1]);
    gen2.next('activate');
    expect(root).toMatchSnapshot();
  });
});
