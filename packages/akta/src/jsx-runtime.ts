// Based on https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/314d0c3cf25e1762525a3790b4609eb19fddadf9/types/react/index.d.ts

import { AktaComponent, AktaElement, AktaElementType } from './types';

export function jsx<P extends {}, T extends string | AktaComponent<P>>(
  type: T,
  props: P,
  maybeKey?: string
): AktaElement<P> {
  return {
    $$type: AktaElementType,
    type,
    props,
    key: maybeKey,
  };
}

export const jsxs = jsx;
