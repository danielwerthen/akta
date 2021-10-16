import { Subject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { jsx } from './jsx-runtime';
import { mount } from './mount-ops';

describe('Element ops', () => {
  it('should handle observable classNames', async () => {
    const root = document.createElement('div');
    const subj = new Subject();
    const unsub = mount(jsx('div', { className: subj }), root);
    subj.next('cl454');
    expect(root).toMatchSnapshot();
    subj.next(3);
    expect(root).toMatchSnapshot();
    subj.next(null);
    expect(root).toMatchSnapshot();
    subj.next(undefined);
    expect(root).toMatchSnapshot();
    subj.next('final');
    expect(root).toMatchSnapshot();
    unsub();
  });
  it('should handle onclick events', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const subj = new Subject();
    const unsub = mount(jsx('button', { onClick: subj }), root);
    const res = firstValueFrom(subj.pipe(take(4), toArray()));
    const btn = document.getElementsByTagName('button')[0];
    btn.click();
    btn.click();
    btn.click();
    btn.click();
    const final = await res;
    expect(final).toMatchSnapshot();
    unsub();
    document.body.removeChild(root);
  });
  it('should handle onclick functions', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const fun = jest.fn();
    const unsub = mount(jsx('button', { onClick: fun }), root);
    const btn = document.getElementsByTagName('button')[0];
    btn.click();
    btn.click();
    btn.click();
    btn.click();
    expect(fun.mock.calls).toMatchSnapshot();
    unsub();
    document.body.removeChild(root);
  });
  it('should handle aria attributes', async () => {
    const root = document.createElement('div');
    const unsub = mount(jsx('button', { ['aria-hidden']: true }), root);
    expect(root).toMatchSnapshot();
    unsub();
  });
});
