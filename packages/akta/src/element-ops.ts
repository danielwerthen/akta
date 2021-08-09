import { isObservable, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { standardCSSMethod } from './akta-styling';
import MetaObject, { MethodMissing } from './meta-object';

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
export function mountElement<T extends HTMLElement | Text>(element: T) {
  const mount = ((element ?? empty) as AktaMountable<T>)[AKTA_MOUNT];
  if (mount) {
    mount.next(element);
  }
}

export function unmountElement<T extends HTMLElement | Text>(element: T) {
  const unmount = ((element ?? empty) as AktaMountable<T>)[AKTA_UNMOUNT];
  if (unmount) {
    unmount.next(element);
  }
}

function standardPropMethod<T extends HTMLElement>(
  key: string
): AttributeMethod {
  return function(element: T, value: unknown) {
    if (!(key in element)) {
      if (key in element.style) {
        if (isObservable(value)) {
          return value.pipe(
            tap(item => {
              element.style[(key as unknown) as number] = item + '';
            })
          );
        } else {
          element.style[(key as unknown) as number] = value + '';
          return;
        }
      }
      console.warn('Invalid property ' + key);
      return;
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

function standardEventMethod<T extends HTMLElement>(
  key: string
): AttributeMethod {
  const eventName = key.substr(2).toLowerCase();
  return function(element: T, value: unknown) {
    const subject = value as Subject<Event>;
    return new Observable(sub => {
      sub.next();
      function eventHandler(e: Event) {
        subject.next(e);
      }
      element.addEventListener(eventName, eventHandler, false);
      return () => {
        element.removeEventListener(eventName, eventHandler);
      };
    });
  };
}

export type AttributeMethod<T extends HTMLElement = HTMLElement> = (
  element: T,
  value: unknown
) => Observable<unknown> | void;

export class BaseAttributes<
  T extends HTMLElement = HTMLElement
> extends MetaObject<
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
          const classNames = item.split(' ');
          if (prevClassNames) {
            prevClassNames.forEach(name => {
              if (!classNames.includes(name)) {
                element.classList.remove(name);
              }
            });
            classNames.forEach(name => {
              element.classList.add(name);
            });
          }
        })
      );
    } else {
      value.split(' ').forEach(value => element.classList.add(value));
      return;
    }
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

export class AllElements extends MetaObject<BaseAttributes<HTMLElement>> {
  _base = new BaseAttributes();
  [MethodMissing](_key: string) {
    const base = this._base;
    return base;
  }
}
