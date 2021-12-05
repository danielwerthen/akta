/** @jsxImportSource . */
import { render } from './render';

describe('render', () => {
  it('should rendering akta blueprint', () => {
    const parent = document.createElement('div');
    const teardown = render(<p>Blueprint</p>, parent);
    expect(parent).toMatchSnapshot();
    teardown();
  });
});
