/** @jsxImportSource . */
import { of } from 'rxjs';
import { mount } from './mount-ops';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { createRenderer } from './test-utils/test-render';

function getCSS() {
  const lines: string[] = [];
  const styleElements = document.getElementsByTagName('style');
  for (let index = 0; index < styleElements.length; index++) {
    const sheet = styleElements.item(index)?.sheet;
    const media = styleElements.item(index)?.media;
    if (!sheet) {
      continue;
    }
    if (media) {
      lines.push(media);
    }
    for (let ruleIdx = 0; ruleIdx < (sheet.cssRules.length || 0); ruleIdx++) {
      const rule = sheet.cssRules[ruleIdx];
      if (rule?.cssText) {
        lines.push(rule?.cssText);
      }
    }
  }

  return lines.join('\n');
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot(): R;
    }
  }
}

expect.extend({
  toMatchImageSnapshot,
});

describe('Akta', () => {
  let container: HTMLElement;
  const render = createRenderer();
  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.append(container);
  });
  afterEach(() => {
    document.getElementById('app')?.remove();
  });
  it('should render a nested jsx blob', async () => {
    function Component() {
      return of(<div>An observable component</div>);
    }
    function NestedComponent() {
      return (
        <div>
          <div $color="black">{of('Leaf 1')}</div>
          <div $color="white">{of('Leaf 2')}</div>
          <div $color="red">{of('Leaf 3')}</div>
        </div>
      );
    }
    const cleanup = mount(
      <div>
        <p
          id="daniel"
          $color="red"
          $color_min100="blue"
          $color_max500_min200="green"
          background="gray"
        >
          This is a paragraph
        </p>
        {of(<div>An observable element</div>)}
        <button>This is button</button>
        <Component />
        <NestedComponent />
      </div>,
      container
    );
    expect(document.body).toMatchSnapshot();
    expect(getCSS()).toMatchSnapshot();
    expect(
      await render(document, { width: 400, height: 400 })
    ).toMatchImageSnapshot();
    cleanup();
  });
});
