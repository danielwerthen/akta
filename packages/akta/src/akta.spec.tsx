/** @jsxImportSource . */
import { mount } from './mount-ops';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { createRenderer } from './test-utils/test-render';
import { useNext } from './dependencies';
import {
  BaseAttributes,
  BaseHTMLAttributes,
  BaseSVGAttributes,
  HTMLElements,
} from './element-ops';

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
  function rit(str: string, func: () => (() => void) | Promise<() => void>) {
    it(str, async () => {
      const cleanup = await func();
      expect(document.body).toMatchSnapshot();
      expect(getCSS()).toMatchSnapshot();
      expect(
        await render(document, {
          width: 50,
          height: 50,
        })
      ).toMatchImageSnapshot({
        dumpDiffToConsole: true,
      });
      expect(
        await render(document, {
          width: 150,
          height: 150,
        })
      ).toMatchImageSnapshot();
      expect(
        await render(document, {
          width: 500,
          height: 500,
        })
      ).toMatchImageSnapshot();
      cleanup();
    });
  }
  rit('should handle css props with media queries properly', async () => {
    return mount(
      <div
        height="100vh"
        width="100vw"
        $backgroundColor="red"
        $backgroundColor_min100="blue"
        $backgroundColor_max500_min200="green"
      >
        <svg
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          stroke="red"
          fill="grey"
        >
          <circle cx="10" cy="10" r="5"></circle>
          <circle cx="20" cy="20" r="5"></circle>

          <svg
            viewBox="0 0 10 10"
            x="40"
            width="10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="5" r="4"></circle>
          </svg>
        </svg>
      </div>,
      container
    );
  });

  it('it should render generator components', async () => {
    function* Component() {
      const next = useNext();
      yield (
        <div>
          <p>State 1</p>
          <button onClick={next}>Next</button>
        </div>
      );
      yield (
        <div>
          <p>State 2</p>
          <button onClick={next}>Next</button>
        </div>
      );
      return <p>State 3</p>;
    }
    const cleanup = mount(
      <div>
        <Component />
      </div>,
      container
    );

    document.body
      .getElementsByTagName('button')
      .item(0)
      ?.click();

    expect(document.body).toMatchSnapshot();

    document.body
      .getElementsByTagName('button')
      .item(0)
      ?.click();

    expect(document.body).toMatchSnapshot();
    cleanup();
  });
  rit('should handle custom attributes', () => {
    BaseHTMLAttributes.prototype.xCustom = (element, val) => {
      element.dataset['x_custom'] = 'html-' + val;
    };
    BaseAttributes.prototype.xCustom = (element, val) => {
      element.dataset['x_custom'] = 'base-' + val;
    };
    BaseAttributes.prototype.baseCustom = (element, val) => {
      element.dataset['base_custom'] = 'base-' + val;
    };
    BaseHTMLAttributes.prototype.htmlCustom = (element, val) => {
      element.dataset['html_custom'] = 'html-' + val;
    };
    BaseSVGAttributes.prototype.svgCustom = (element, val) => {
      element.dataset['svg_custom'] = 'svg-' + val;
    };

    HTMLElements.p.pCustom = (element, val) => {
      element.dataset['p_custom'] = 'p-' + val;
    };
    return mount(
      <div pCustom="div">
        <p
          xCustom="custom-value"
          baseCustom="html"
          htmlCustom="html"
          svgCustom="html"
          pCustom="p"
        >
          Text
        </p>
        <svg
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          stroke="red"
          fill="grey"
        >
          <circle
            xCustom="custom-value"
            cx="10"
            cy="10"
            r="5"
            baseCustom="svg"
            htmlCustom="svg"
            svgCustom="svg"
            pCustom="circle"
          ></circle>
        </svg>
      </div>,
      container
    );
  });
});
