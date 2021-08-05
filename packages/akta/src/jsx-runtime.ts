// Based on https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/314d0c3cf25e1762525a3790b4609eb19fddadf9/types/react/index.d.ts

import { AktaElement, AktaElementType } from './types';

export function jsx<
  P extends {},
  T extends string | ((props: P) => AktaElement<P, any>)
>(type: T, props: P, maybeKey?: string): AktaElement<P, T> {
  return {
    $$type: AktaElementType,
    type,
    props,
    key: maybeKey,
  };
}

export const jsxs = jsx;
