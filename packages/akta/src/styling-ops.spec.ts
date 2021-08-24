import { stylesheetMap } from './styling-ops';

describe('styling-ops', () => {
  it('should attach style tags in the right order', () => {
    const get = stylesheetMap();
    get('border-bottom-style');
    get('background-color');
    get('border-bottom-style-test');
    get('color');

    get('border-bottom-style', '(max-width: 350px)');
    get('border-bottom', '(max-width: 350px)');
    get('border-bottom-t-2-t', '(max-width: 350px)');
    get('background-color-test-test', '(max-width: 250px)');
    get('color', '(max-width: 750px)');
    get('border-bottom-style-test-test');
    get('border-bottom-style-test-test');
    get('border-bottom-style-test-test');
    get('border-bottom-style-test-test');
    /*
     */
    expect(document.head).toMatchSnapshot();
  });
});
