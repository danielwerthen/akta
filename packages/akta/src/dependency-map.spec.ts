import { firstValueFrom, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { createDependency, createDependencyMap } from './dependency-map';

describe('Dependency map', () => {
  const depA = createDependency('alpha');
  const depB = createDependency(0);
  const depC = createDependency(of(0));

  it('should fetch the right dependency', async () => {
    const top = createDependencyMap();
    top.provide(depB, 1);
    const middle = top.branch();
    middle.provide(depA, 'middle');
    expect(await firstValueFrom(top(depB))).toBe(1);
    expect(await firstValueFrom(top.use(depB))).toBe(0);
    expect(await firstValueFrom(top.use(depA))).toBe('alpha');
    expect(await firstValueFrom(middle(depA))).toBe('middle');

    expect(await firstValueFrom(middle(depB))).toBe(1);
    expect(await firstValueFrom(middle.use(depB))).toBe(1);

    middle.provide(depB, 2);
    expect(await firstValueFrom(top(depB))).toBe(1);
    expect(await firstValueFrom(top.use(depB))).toBe(0);
    expect(await firstValueFrom(middle(depB))).toBe(2);
    expect(await firstValueFrom(middle.use(depB))).toBe(1);

    const bottom = middle.branch();
    bottom.provide(depA, 'bottom');
    expect(await firstValueFrom(top(depA))).toBe('alpha');
    expect(await firstValueFrom(middle(depA))).toBe('middle');
    expect(await firstValueFrom(bottom(depA))).toBe('bottom');
  });

  it('should work with observable dependencies', async () => {
    const top = createDependencyMap();
    const subject = new Subject<number>();
    top.provide(depC, subject);
    const value = top(depC).pipe(switchMap(val => val));
    const receiver = jest.fn();
    value.subscribe(val => receiver(val));
    subject.next(0);
    await new Promise(res => setTimeout(res, 0));
    subject.next(2);
    const subject2 = new Subject<number>();
    top.provide(depC, subject2);
    subject2.next(10);
    expect(receiver.mock.calls).toEqual([[0], [2], [10]]);
  });
});
