import { parseProp, stylesheetMap } from './styling-ops';

describe('styling-ops', () => {
  it('should attach style tags in the right order', () => {
    const get = stylesheetMap();
    get('2');
    get('1');
    get('3');
    get('0');

    get('2', '(max-width: 350px)');
    get('1', '(max-width: 350px)');
    get('4', '(max-width: 350px)');
    get('3', '(max-width: 250px)');
    get('0', '(max-width: 750px)');
    get('4');
    get('4');
    get('4');
    get('4');
    /*
     */
    expect(document.head).toMatchSnapshot();
  });
  it('should properly parse props', () => {
    expect(
      [
        'color',
        'backgroundColor',
        'borderTopWidth',
        'color_max100',
        'color_max100_min40',
        'color_max100_hover',
        'color_max100_hover_focus',
        'color_large',
        'color_nthChild(2n)',
      ].map(parseProp)
    ).toMatchSnapshot();
  });
});
