import { Subject } from 'rxjs';

export const DelegatedEvents = new Set([
  'beforeinput',
  'click',
  'dblclick',
  'focusin',
  'focusout',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'pointerdown',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  'touchend',
  'touchmove',
  'touchstart',
]);

/**
 * Inspired by https://github.com/ryansolid/dom-expressions/blob/4eb94a2d860cb1b1fa09cce9b47c52e72f2e6648/packages/dom-expressions/src/client.js#L287
 */

type EventTargetElement = HTMLElement & {
  [key: string]: unknown;
};

function eventHandler(e: Event) {
  const key = `__${e.type}`;
  let node: EventTargetElement = ((e.composedPath &&
    e.composedPath()[0]) as unknown) as EventTargetElement;

  // reverse Shadow DOM retargetting
  if (e.target !== node) {
    Object.defineProperty(e, 'target', {
      configurable: true,
      value: node,
    });
  }

  // simulate currentTarget
  Object.defineProperty(e, 'currentTarget', {
    configurable: true,
    get() {
      return node;
    },
  });

  while (node !== null) {
    const handler = node[key];
    if (handler && !node.disabled) {
      if (typeof handler === 'function') {
        handler(e);
      } else if (Array.isArray(handler)) {
        const [innerHandler, data] = handler;
        if (typeof innerHandler === 'function') {
          innerHandler(data, e);
        } else {
          const subj = innerHandler as Subject<unknown>;
          subj.next([data, e]);
        }
      } else {
        const subj = handler as Subject<unknown>;
        subj.next(e);
      }
      if (e.cancelBubble) return;
    }
    node = node.parentNode as EventTargetElement;
  }
}

export function addDelegatedEvents(node: HTMLElement) {
  for (let key of DelegatedEvents.keys()) {
    node.addEventListener(key, eventHandler);
  }
}
