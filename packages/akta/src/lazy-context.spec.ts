import { createLazyContext } from './lazy-context';

describe('LazyContext', () => {
  it('should lazily evaluate init functions', () => {
    const lazyContext = createLazyContext();
    const mock1 = jest.fn();
    mock1.mockReturnValue({});
    lazyContext.setContextUnsafe(mock1);
    expect(mock1.mock.calls.length).toEqual(0);
    lazyContext.peek();
    const ctx = lazyContext.get();
    expect(mock1.mock.calls.length).toEqual(0);
    ctx();
    expect(mock1.mock.calls.length).toEqual(1);
    ctx();
    expect(mock1.mock.calls.length).toEqual(1);
  });
});
