import { Observable } from 'rxjs';
import { prepare } from './dom-ops';
import { jsx } from './jsx-runtime';

describe('DOM OPS', () => {
  it('Observable child nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    const value = new Observable(sub => {
      setTimeout((item: string) => sub.next(item), 10, 'foobar');
    });
    const promise = prepare(jsx('p', { children: value }), root);
    expect(root).toMatchSnapshot();
    await promise;
    expect(root).toMatchSnapshot();
  });
  it('should render within range of comparison implementation', async () => {
    const root = document.createElement('div');
    const array = new Array(100).fill(0);
    const value = array.map(() =>
      jsx('span', { children: 'word', className: 'foobar' })
    );
    const t0 = performance.now();
    await prepare(jsx('p', { children: value }), root);
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
    expect(ratio).toBeLessThan(10);
  });

  it('Array nodes are rendered correctly', async () => {
    const root = document.createElement('div');
    const value = ['test', 'more'];
    await prepare(jsx('p', { children: value }), root);
    expect(root).toMatchSnapshot();
  });
});
