export const MethodMissing = Symbol('methodMissing');

interface MetaObjectInterface<V> {
  [key: string]: V;
  [MethodMissing](_property: string | symbol): V | undefined;
}

const prototype = new Proxy(
  {},
  {
    get: function get(_target, property, receiver) {
      if (Reflect.has(receiver, MethodMissing)) {
        const method = Reflect.get(receiver, MethodMissing).apply(receiver, [
          property,
        ]);
        if (method !== void 0) {
          const receiverPrototype = Reflect.getPrototypeOf(receiver);
          if (receiverPrototype) {
            Reflect.defineProperty(receiverPrototype, property, {
              value: method,
            });
          }
        }
        return method;
      }
    },
  }
);

function Base() {}

Object.defineProperty(Base, 'prototype', { value: prototype });

class MetaObject<T> extends (Base as any) implements MetaObjectInterface<T> {
  [key: string]: T;
  [MethodMissing](_property: string | symbol): T | undefined {
    throw new Error('MethodMissing is not defined');
  }
}

export default MetaObject;
