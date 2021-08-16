import { Observable } from 'rxjs';

export type AktaElement<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
> = {
  $$type: Symbol;
  type: string | AktaComponent<P>;
  props: P;
  key: string | undefined;
};

export type ObservableElements =
  | Observable<AktaAllElements>
  | Generator<AktaAllElements, AktaAllElements>
  | AsyncGenerator<AktaAllElements, AktaAllElements>;

export type AktaAllElements = AktaElement | ObservableElements;

export type AktaNode = AktaAllElements | string | null | AktaNode[];

export const AktaElementType = Symbol('Akta element');

export function isAktaElement(node: unknown): node is AktaElement {
  if (typeof node === 'object') {
    return (node as AktaElement)?.$$type === AktaElementType;
  }
  return false;
}

export interface ElementProperties {}

export type AktaComponent<PROPS extends {}> = (
  props: PROPS
) => AktaAllElements | string | null;

export function AktaPreparedComponent(_props: {
  children: Observable<HTMLElement>;
}) {
  return null;
}
