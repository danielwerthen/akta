import { ElementProperties, AktaAllElements, AktaComponent } from './types';
import {
  BehaviorSubject,
  isObservable,
  Observable,
  Subject,
  from,
  of,
  firstValueFrom,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { standardCSSMethod } from './akta-styling';
import MetaObject, { MethodMissing } from './meta-object';
import { createDependency, DependencyMap } from './dependency-map';
import { lazy } from './lazy-function';
import { createSyncContext } from './sync-context';

function isEvent(key: string) {
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

function standardPropMethod<T extends HTMLElement>(key: string) {
  return function(element: T, value: unknown) {
    if (!(key in element)) {
      if (key in element.style) {
        if (isObservable(value)) {
          const sub = value.subscribe(val => {
            element.style[(key as unknown) as number] = val + '';
          });
          return () => sub.unsubscribe();
        } else {
          element.style[(key as unknown) as number] = value + '';
          return;
        }
      }
      console.warn('Invalid property ' + key);
      return;
    }
    if (isObservable(value)) {
      const sub = value.subscribe(val => {
        element.setAttribute(key, val + '');
      });
      return () => sub.unsubscribe();
    } else {
      element.setAttribute(key, value + '');
      return;
    }
  };
}

function standardEventMethod<T extends HTMLElement>(key: string) {
  const eventName = key.substr(2).toLowerCase();
  return function(element: T, value: unknown) {
    const subject = value as Subject<Event>;
    function eventHandler(e: Event) {
      subject.next(e);
    }
    element.addEventListener(eventName, eventHandler, false);
    return () => {
      element.removeEventListener(eventName, eventHandler);
    };
  };
}

export class AktaHTMLAttributes<
  T extends HTMLElement = HTMLElement
> extends MetaObject<(element: T, value: unknown) => (() => void) | void> {
  onMount(element: T, value: Subject<T>) {
    (element as AktaMountable<T>)[AKTA_MOUNT] = value;
  }
  onUnmount(element: T, value: Subject<T>) {
    (element as AktaMountable<T>)[AKTA_UNMOUNT] = value;
  }
  className(element: T, value: Observable<string> | string) {
    if (isObservable(value)) {
      let prevClassName: string;
      const sub = value.subscribe(className => {
        if (prevClassName) {
          element.classList.remove(prevClassName);
        }
        element.classList.add(className);
        prevClassName = className;
      });
      return () => sub.unsubscribe();
    } else {
      element.classList.add(value + '');
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

export class InputElementalAttributes extends AktaHTMLAttributes<
  HTMLInputElement
> {
  type(element: HTMLElement, value: unknown) {
    element.setAttribute('type', value + '');
  }
  value(element: HTMLInputElement, value: unknown) {
    if (isObservable(value)) {
      const sub = value.subscribe(val => {
        element.value = val + '';
      });
      return () => sub.unsubscribe();
    } else {
      element.value = value + '';
      return;
    }
  }
}

export class AktaIntrinsicElements extends MetaObject<
  AktaHTMLAttributes<HTMLElement>
> {
  _base = new AktaHTMLAttributes();
  input = new InputElementalAttributes();
  [MethodMissing](_key: string) {
    const base = this._base;
    return base;
  }
}

export class PropertiesBase extends MetaObject<
  | ((factory?: () => Subject<unknown>) => Subject<unknown>)
  | ((start?: unknown) => Subject<unknown>)
> {
  [MethodMissing](key: string) {
    if (isEvent(key)) {
      return (factory?: () => Subject<unknown>) =>
        factory ? factory() : new Subject();
    } else {
      return (initialValue?: unknown) => {
        if (initialValue === undefined) {
          return new Subject();
        } else {
          return new BehaviorSubject(initialValue);
        }
      };
    }
  }
}

const propertiesBase = new PropertiesBase();
export class ElementPropertiesBase extends MetaObject<PropertiesBase> {
  [MethodMissing](_key: string) {
    return propertiesBase;
  }
}

export const Props: ElementProperties = (new ElementPropertiesBase() as unknown) as ElementProperties;

export const dependecyContext = createSyncContext<DependencyMap>();
export const continuationDependency = createDependency(lazy());
export type TeardownFunction = () => void;
export const teardownDependency = createDependency<null | TeardownFunction>(
  null
);

export function useNext<
  T extends AktaAllElements,
  RETURN extends AktaAllElements,
  NEXT
>(
  _input?: () => Generator<T, RETURN, NEXT> | AsyncGenerator<T, RETURN, NEXT>
): (input: NEXT) => Promise<void> {
  const ctx = dependecyContext.getContext();
  return (input: NEXT) => {
    return firstValueFrom(
      ctx(continuationDependency).pipe(switchMap(next => next(input)))
    ).then(() => void 0);
  };
}

export function useTeardown(fn: TeardownFunction) {
  const ctx = dependecyContext.getContext();
  ctx.provide(teardownDependency, fn);
}

function isGenerator(
  obj: unknown
): obj is Generator<any, any, any> | AsyncGenerator<any, any, any> {
  if (typeof obj === 'object') {
    return typeof (obj as Generator<any, any, any>).next === 'function';
  }
  return false;
}

export function callComponent<PROPS>(
  component: AktaComponent<PROPS>,
  props: PROPS,
  parentDeps: DependencyMap
): [Observable<AktaAllElements>, DependencyMap] {
  const deps = parentDeps.branch();
  const element = dependecyContext.setContext(() => {
    return component(props);
  }, deps);
  if (isObservable(element)) {
    return [element, deps];
  }
  if (isGenerator(element)) {
    const continuation = lazy();
    deps.provide(continuationDependency, continuation);
    const generated = dependecyContext.setContext(() => {
      return element.next();
    }, deps);
    const observable = new Observable<AktaAllElements>(subscriber => {
      Promise.resolve(generated).then(({ value, done }) => {
        subscriber.next(value);
        if (done) {
          subscriber.complete();
          return;
        }
        let isComplete = false;
        continuation.define(input => {
          if (isComplete) {
            return of();
          }
          const generated = dependecyContext.setContext(() => {
            return element.next(input);
          }, deps);
          return from(Promise.resolve(generated)).pipe(
            map(({ value, done }) => {
              if (isComplete) {
                return;
              }
              subscriber.next(value);
              if (done) {
                isComplete = true;
                subscriber.complete();
                return;
              }
            })
          );
        });
      });
    });
    return [observable, deps];
  }
  return [of(element), deps];
}
