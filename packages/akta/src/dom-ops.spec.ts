import { filter, finalize, interval, Observable, zip } from 'rxjs';

describe('DOM OPS', () => {
  it('shsould faild', async () => {
    console.log('Test');
    new Observable(usb => {
      usb.next(55);
      return () => console.log('Final');
    }).subscribe(console.log);
    console.log('After');
    const logs: any[] = [];
    const sub = zip(
      interval(1000).pipe(
        filter((_v, idx) => idx === 0),
        finalize(() => logs.push('Final 1'))
      ),
      interval(2000).pipe(
        finalize(() => logs.push('Final 2')),
        filter((_v, idx) => idx === 0),
        finalize(() => logs.push('Final 3'))
      )
    ).subscribe(item => logs.push(item));
    await new Promise(res => setTimeout(res, 2500));
    logs.push('Before');
    sub.unsubscribe();
    logs.push('After');
    console.log(logs.join(' '));
  });
});
