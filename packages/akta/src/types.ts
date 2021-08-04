export type AktaElement<
  P = any,
  T extends string | ((props: P) => AktaElement<P, any>) = string
> = {
  $$type: Symbol;
  type: T;
  props: P;
  key: string | undefined;
};
