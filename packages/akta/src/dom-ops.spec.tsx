import { mount } from './index';
import {
  BehaviorSubject,
  firstValueFrom,
  from,
  Observable,
  of,
  Subject,
  toArray,
} from 'rxjs';
import { useTeardown } from './dependencies';
import { usePrepare } from './dom-ops';
import { jsx } from './jsx-runtime';
import { AktaNode } from './types';

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
    expect(ratio).toBeLessThan(10);
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
});
