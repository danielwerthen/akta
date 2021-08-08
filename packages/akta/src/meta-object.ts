export const MethodMissing = Symbol('methodMissing');

interface MetaObjectInterface<V> {
  [key: string]: V;
  [MethodMissing](_property: string | symbol): V | undefined;
}

class MetaObject<T> implements MetaObjectInterface<T> {
  [key: string]: T;
  [MethodMissing](_property: string | symbol): T | undefined {
    throw new Error('MethodMissing is not defined');
  }
}

MetaObject.prototype = new Proxy(MetaObject.prototype, {
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
});

export default MetaObject;
