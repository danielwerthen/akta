import { createMemoryHistory } from 'history';
import { createRouter } from '../src';
describe('Test', () => {
  it('should', () => {
    const router = createRouter(createMemoryHistory());
    let counter = 0;
    router.location.subscribe(() => {
      counter++;
    });
    router.history.push('/foobar');
    router.history.push('/foobar');
    expect(counter).toBe(3);
  });
});
