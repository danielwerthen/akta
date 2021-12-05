/** @jsxImportSource . */
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AktaNode } from '../dist';
import { render } from './render';
import { useRender } from './use-render';

describe('render', () => {
  let parent: HTMLElement;
  let teardown: () => void;
  function doRender(blueprint: AktaNode) {
    teardown = render(blueprint, parent);
  }
  beforeEach(() => {
    parent = document.createElement('div');
  });
  afterEach(() => {
    if (teardown) {
      teardown();
    }
    parent.innerHTML = '';
  });
  it('should rendering akta blueprint', () => {
    doRender(<p>Blueprint</p>);
    expect(parent).toMatchSnapshot();
  });
  it('should use prepared rendering akta blueprint', () => {
    function Component({
      children,
      order,
    }: {
      order: Observable<number[]>;
      children: AktaNode[];
    }) {
      const doRender = useRender();
      const arr = children.map(doRender);
      return <div>{order.pipe(map(idx => idx.map(i => arr[i])))}</div>;
    }
    const subj = new BehaviorSubject([0, 1, 2]);
    doRender(
      <Component order={subj}>
        <div>Alpha</div>
        <div>Beta</div>
        <div>Theta</div>
      </Component>
    );
    expect(parent).toMatchSnapshot();
    subj.next([2, 1, 0]);
    expect(parent).toMatchSnapshot();
  });
});
