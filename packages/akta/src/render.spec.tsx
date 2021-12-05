/** @jsxImportSource . */
import { AktaNode } from '../dist';
import { render } from './render';

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
});
