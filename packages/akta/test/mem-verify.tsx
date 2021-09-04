let WRef: any = (global as any).WeakRef;

let subjects: any[] = [];

function mockRegister(obj: any) {
  if (!subjects) {
    subjects = [];
  }
  if (!WRef) {
    WRef = (global as any).WeakRef;
  }
  if (!WRef) {
    return;
  }
  subjects.push(new WRef(obj));
}

jest.mock('rxjs/dist/cjs/internal/Subscription', () => {
  const actual = jest.requireActual('rxjs/dist/cjs/internal/Subscription');
  class Subscription extends actual.Subscription {
    constructor(...args: []) {
      super(...args);
      mockRegister(this);
    }
  }
  return { ...actual, Subscription };
});

jest.mock('rxjs/dist/cjs/internal/Observable', () => {
  const actual = jest.requireActual('rxjs/dist/cjs/internal/Observable');
  class Observable extends actual.Observable {
    constructor(...args: []) {
      super(...args);
      mockRegister(this);
    }
  }
  return { ...actual, Observable };
});

jest.mock('rxjs', () => {
  const actual = jest.requireActual('rxjs');
  class Subject extends actual.Subject {
    constructor() {
      super();
      mockRegister(this);
    }
  }

  class BehaviorSubject extends actual.BehaviorSubject {
    constructor(...args: any[]) {
      super(...args);
      mockRegister(this);
    }
  }

  class Observable extends actual.Observable {
    constructor(...args: any[]) {
      super(...args);
      mockRegister(this);
    }
  }

  class ReplaySubject extends actual.ReplaySubject {
    constructor(...args: any[]) {
      super(...args);
      mockRegister(this);
    }
  }
  return {
    ...actual,
    Subject,
    BehaviorSubject,
    ReplaySubject,
    Observable,
  };
});

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

const logEntityCount = false;

export function verify(fn: () => Promise<void>) {
  return async () => {
    subjects.splice(0, subjects.length);
    if (typeof global.gc === 'undefined') {
      console.warn('Skipping memory verification');
      await fn();
      return;
    }
    global.gc();
    await fn();
    {
      const count = subjects.map(sub => !!sub.deref()).filter(id => id).length;
      if (logEntityCount) {
        console.log(
          subjects
            .map(sub => sub.deref().__proto__.constructor.name)
            .reduce((sum, name) => {
              return {
                ...sum,
                [name]: (sum[name] ?? 0) + 1,
              };
            }, {})
        );
      }
      if (count < 1) {
        throw new Error('No observable objects were monitored');
      }
    }
    await sleep(10);
    global.gc();
    await sleep(10);
    const refs = subjects.map(sub => sub.deref());
    const notClean = refs.some(v => v);
    if (notClean) {
      throw new Error('Observables was not garbage collected in time');
    }
  };
}
