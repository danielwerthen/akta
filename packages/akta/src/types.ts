import { Observable } from 'rxjs';

export type AktaElement<
  P = any,
  T extends string | ((props: P) => AktaElement<P, any>) = string
> = {
  $$type: Symbol;
  type: T;
  props: P;
  key: string | undefined;
};

export type ObservableElements =
  | Observable<AktaAllElements>
  | Generator<AktaAllElements, AktaAllElements>
  | AsyncGenerator<AktaAllElements, AktaAllElements>;

export type AktaAllElements = AktaElement<any, any> | ObservableElements;

export const AktaElementType = Symbol('Akta element');

export function isAktaElement(node: unknown): node is AktaElement {
  if (typeof node === 'object') {
    return (node as AktaElement)?.$$type === AktaElementType;
  }
  return false;
}

export interface ElementProperties {}

export type AktaComponent<PROPS extends {}> = (props: PROPS) => AktaAllElements;
