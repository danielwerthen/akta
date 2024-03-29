import { Observable } from 'rxjs';
import { LazyAttacher } from './mount-ops';

export type AktaElement<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
> = {
  $$type: Symbol;
  type: string | AktaComponent<P> | undefined;
  props: P;
  key: string | undefined;
};

export type AktaNode =
  | Observable<AktaNode>
  | AktaElement
  | Generator<AktaNode, AktaNode>
  | AsyncGenerator<AktaNode, AktaNode>
  | string
  | number
  | null
  | AktaNode[];

export const AktaElementType = Symbol('Akta element');

export function isAktaElement(node: unknown): node is AktaElement {
  if (typeof node === 'object') {
    return (node as AktaElement)?.$$type === AktaElementType;
  }
  return false;
}

export interface ElementProperties {}

export type AktaComponent<PROPS> = (props: PROPS) => AktaNode;

export function AktaPreparedComponent(_props: {
  attacher: LazyAttacher;
  observable?: Observable<unknown>;
}) {
  return null;
}

export function Fragment({ children }: { children: AktaNode }) {
  return children;
}
