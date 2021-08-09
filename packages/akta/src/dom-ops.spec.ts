import { Observable } from 'rxjs';
import { prepare } from './dom-ops';
import { jsx } from './jsx-runtime';

describe('DOM OPS', () => {
  it('should fail', async () => {
    const root = document.createElement('div');
    const value = new Observable(sub => {
      setTimeout(item => sub.next(item), 100, 'foobar');
    });
    await prepare(jsx('p', { children: value }), root);
    expect(root).toMatchSnapshot();
  });
});
