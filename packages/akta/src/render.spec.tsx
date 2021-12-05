/** @jsxImportSource . */
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
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
    const subfn = jest.fn();
    subfn.mockReturnValue('sub-fn');
    function SubComponent() {
      return <p>{subfn()}</p>;
    }
    const subj = new BehaviorSubject([0, 1, 2]);
    doRender(
      <Component order={subj}>
        <div>
          Alpha
          <SubComponent />
        </div>
        <div>
          Beta
          <SubComponent />
        </div>
        <div>
          Theta
          <SubComponent />
        </div>
      </Component>
    );
    expect(parent).toMatchSnapshot();
    subj.next([2, 1, 0]);
    expect(parent).toMatchSnapshot();
    subj.next([0, 1, 0, 2, 0]);
    expect(parent).toMatchSnapshot();
    expect(subfn.mock.calls.length).toEqual(3);
  });
  it('should allow async elements in prepared nodes', () => {
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
    const subject = new Subject<number>();
    function SubComponent() {
      return <p>{subject}</p>;
    }
    const subj = new BehaviorSubject([1, 1, 0]);
    doRender(
      <Component order={subj}>
        <div>
          Alpha
          <SubComponent />
        </div>
        <div>
          Beta
          <SubComponent />
        </div>
        <div>
          Theta
          <SubComponent />
        </div>
      </Component>
    );
    expect(parent).toMatchSnapshot();
    subject.next(44);
    expect(parent).toMatchSnapshot();
  });
});
