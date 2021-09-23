import { mount, ErrorBoundary, jsx } from './index';
import { Subject } from 'rxjs';
import { AktaNode } from './types';

describe('ErrorBoundary', () => {
  it('should handle component exceptions gracefully', async () => {
    const root = document.createElement('div');
    function ErrorImmediately() {
      throw new Error('Should be caught');
      return 'Never';
    }
    mount(
      jsx(ErrorBoundary, {
        fallback: 'fallback',
        children: jsx('div', {
          children: [jsx(ErrorImmediately, {})],
        }),
      }),
      root
    );
    expect(root).toMatchSnapshot();
  });
  it('should handle eventual component exceptions gracefully', async () => {
    const root = document.createElement('div');
    const subject = new Subject<AktaNode>();
    function ErrorLater() {
      return subject;
    }
    const propSubject = new Subject<AktaNode>();
    function ErrorProp() {
      return jsx('div', { className: propSubject });
    }
    mount(
      [
        jsx(ErrorBoundary, {
          fallback: 'fallback',
          children: jsx('div', {
            children: [jsx(ErrorLater, {})],
          }),
        }),
        jsx(ErrorBoundary, {
          fallback: 'fallback2',
          children: jsx('div', {
            children: [jsx(ErrorProp, {})],
          }),
        }),
      ],
      root
    );
    expect(root).toMatchSnapshot();
    subject.next('It works');
    propSubject.next('className');
    expect(root).toMatchSnapshot();
    subject.error(new Error('Foobar'));
    propSubject.next('className2');
    expect(root).toMatchSnapshot();
    propSubject.error(new Error('Foobar'));
    expect(root).toMatchSnapshot();
  });
});
