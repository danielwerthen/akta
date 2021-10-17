// Based on https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/314d0c3cf25e1762525a3790b4609eb19fddadf9/types/react/index.d.ts

import { AktaNode, AktaComponent, AktaElement, AktaElementType } from './types';

export function jsx<
  P extends {},
  T extends string | AktaComponent<P> | undefined
>(type: T, props: P, maybeKey?: string): AktaElement<P> {
  return {
    $$type: AktaElementType,
    type,
    props,
    key: maybeKey,
  };
}

export const jsxs = jsx;

export function createElement(
  type: string | AktaComponent<{}>,
  { key, ...rest }: { [key: string]: unknown },
  ...children: AktaNode[]
) {
  const props = {
    ...rest,
  };
  if (children.length === 1) {
    props.children = children[0];
  } else if (children.length > 1) {
    props.children = children;
  }
  return {
    $$type: AktaElementType,
    type,
    props,
    key,
  };
}
