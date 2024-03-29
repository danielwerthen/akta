import { isObservable, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { standardCSSMethod } from './styling-ops';
import MetaObject, { MethodMissing } from './meta-object';
import { DelegatedEvents } from './events';

export function isEvent(key: string) {
  return (
    key.startsWith('on') && key.substr(2, 1) === key.substr(2, 1).toUpperCase()
  );
}

export const AKTA_MOUNT = Symbol('Akta mount event');
export const AKTA_UNMOUNT = Symbol('Akta unmount event');

type AktaMountable<T> = T & {
  [AKTA_MOUNT]: Subject<T>;
  [AKTA_UNMOUNT]: Subject<T>;
};

const empty = {};
export function mountElement<T extends ChildNode>(element: T) {
  const mount = ((element ?? empty) as AktaMountable<T>)[AKTA_MOUNT];
  if (mount) {
    mount.next(element);
  }
}

export function unmountElement<T extends ChildNode>(element: T) {
  if (element instanceof HTMLElement) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      if (child instanceof HTMLElement) {
        unmountElement(child);
      }
    }
  }
  const unmount = ((element ?? empty) as AktaMountable<T>)[AKTA_UNMOUNT];
  if (unmount) {
    unmount.next(element);
  }
}

function standardPropMethod<T extends Element>(key: string): AttributeMethod {
  return function(element: T, value: unknown) {
    if (
      !(key in element) &&
      (element instanceof HTMLElement || element instanceof SVGElement) &&
      key in element.style
    ) {
      if (isObservable(value)) {
        return value.pipe(
          tap(item => {
            element.style.setProperty(
              key,
              item + '',
              element.style.getPropertyPriority(key)
            );
          })
        );
      } else {
        element.style.setProperty(
          key,
          value + '',
          element.style.getPropertyPriority(key)
        );
        return;
      }
    }
    if (isObservable(value)) {
      return value.pipe(
        tap(item => {
          element.setAttribute(key, item + '');
        })
      );
    } else {
      element.setAttribute(key, value + '');
      return;
    }
  };
}

function isSubject<T>(value: unknown): value is Subject<T> {
  return !!value && typeof (value as Subject<T>).next === 'function';
}

function standardEventMethod<T extends Element>(key: string): AttributeMethod {
  const eventName = key.substr(2).toLowerCase();
  if (DelegatedEvents.has(eventName)) {
    const key = `__${eventName}`;
    return function(element: T, value: unknown) {
      ((element as unknown) as { [key: string]: unknown })[key] = value;
    };
  }
  return function(element: T, value: unknown) {
    if (!value) {
      return;
    }
    if (typeof value === 'function') {
      element.addEventListener(eventName, value as (e: Event) => void);
    } else if (isSubject<Event>(value)) {
      element.addEventListener(eventName, e => value.next(e));
    }
  };
}

export type AttributeMethod<T extends Element = Element> = (
  element: T,
  value: unknown
) => Observable<unknown> | void;

export class BaseAttributes<T extends Element = Element> extends MetaObject<
  (element: T, value: unknown) => Observable<unknown> | void
> {
  onMount(element: T, value: Subject<T>) {
    (element as AktaMountable<T>)[AKTA_MOUNT] = value;
  }
  onUnmount(element: T, value: Subject<T>) {
    (element as AktaMountable<T>)[AKTA_UNMOUNT] = value;
  }
  className(element: T, value: Observable<string> | string) {
    if (isObservable(value)) {
      let prevClassNames: string[];
      return value.pipe(
        tap(item => {
          const classNames = item ? item.toString().split(' ') : [];
          if (prevClassNames) {
            prevClassNames.forEach(name => {
              if (!classNames.includes(name)) {
                element.classList.remove(name);
              }
            });
          }
          classNames.forEach(name => {
            element.classList.add(name);
          });
          prevClassNames = classNames;
        })
      );
    } else if (value) {
      value
        .toString()
        .split(' ')
        .forEach(value => element.classList.add(value));
    }
    return;
  }
  [MethodMissing](key: string | symbol) {
    if (typeof key === 'symbol') {
      return;
    }
    if (key.startsWith('$')) {
      return standardCSSMethod(key.substr(1));
    }
    if (isEvent(key)) {
      return standardEventMethod(key);
    }
    return standardPropMethod(key);
  }
}

export class BaseHTMLAttributes extends BaseAttributes<HTMLElement> {}

export class BaseSVGAttributes extends BaseAttributes<SVGElement> {}

const htmlElements: { [key: string]: BaseHTMLAttributes } = {
  default: new BaseHTMLAttributes(),
};

class HTMLElementPrototypes extends MetaObject<
  typeof BaseHTMLAttributes.prototype
> {
  [MethodMissing](key: string) {
    function createBaseType() {
      class BaseType extends BaseHTMLAttributes {}
      Object.defineProperty(BaseType, 'name', {
        value: `Base${key.toUpperCase()}Attributes`,
        writable: false,
      });
      return new BaseType();
    }
    return Reflect.getPrototypeOf(
      htmlElements[key] || (htmlElements[key] = createBaseType())
    ) as typeof BaseHTMLAttributes.prototype;
  }
}

const svgElements: { [key: string]: BaseSVGAttributes } = {
  default: new BaseSVGAttributes(),
};

class SVGElementPrototypes extends MetaObject<
  typeof BaseSVGAttributes.prototype
> {
  [MethodMissing](key: string) {
    function createBaseType() {
      class BaseType extends BaseSVGAttributes {}
      Object.defineProperty(BaseType, 'name', {
        value: `Base${key.toUpperCase()}Attributes`,
        writable: false,
      });
      return new BaseType();
    }
    return Reflect.getPrototypeOf(
      svgElements[key] || (svgElements[key] = createBaseType())
    ) as typeof BaseSVGAttributes.prototype;
  }
}

export const HTMLElements = new HTMLElementPrototypes();
export const SVGElements = new SVGElementPrototypes();

export class AllNamespaces extends MetaObject<{
  [key: string]: BaseAttributes<Element>;
}> {
  constructor() {
    super();
    this[''] = htmlElements;
    this['http://www.w3.org/2000/svg'] = svgElements;
  }

  [MethodMissing](_key: string) {
    const attributes = new BaseAttributes();
    return new Proxy(
      {},
      {
        get: (_target, _type: string) => {
          return attributes;
        },
      }
    );
  }
}

export const Namespaces = new AllNamespaces();
