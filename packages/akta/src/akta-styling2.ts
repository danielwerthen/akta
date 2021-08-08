import { isObservable, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AttributeMethod } from './element-ops';
import MetaObject, { MethodMissing } from './meta-object';

let styleSheet: HTMLStyleElement;
let ruleCount = 0;

export class StyleSheets extends MetaObject<HTMLStyleElement> {
  [MethodMissing](key: string) {
    if (typeof key !== 'string') {
      return;
    }
    styleSheet = document.createElement('style');
    styleSheet.media = key;
    document.head.appendChild(styleSheet);
    return styleSheet;
  }
}

const styleSheets = new StyleSheets();

type ParsedAttribute = {
  attributeName: string;
  media?: string;
  pseudo?: string;
};

export const stylePrefixes: {
  [key: string]: Omit<ParsedAttribute, 'attributeName'>;
} = {
  small: {
    media: '(max-width: 768px)',
  },
  medium: {
    media: '(max-width: 1200px) and (min-width: 769px)',
  },
  large: {
    media: '(min-width: 1201px)',
  },
  hover: {
    pseudo: ':hover',
  },
};

function parse(
  camelCaseAttribute: string
): {
  attributeName: string;
  media?: string;
  pseudo?: string;
} {
  const attribute = camelCaseAttribute.replace(/[A-Z]/g, '-$&').toLowerCase();
  const keywords = attribute.split('-');
  if (keywords.length < 2) {
    return {
      attributeName: attribute,
    };
  }
  return keywords.reduce<{
    attributeName: string;
    media?: string;
    pseudo?: string;
  }>(
    (output, keyword) => {
      const mods = stylePrefixes[keyword];
      if (mods?.media) {
        output.media = output.media
          ? output.media + ' and ' + mods.media
          : mods.media;
      }
      if (mods?.pseudo) {
        output.pseudo = output.pseudo
          ? output.pseudo + mods.pseudo
          : mods.pseudo;
      }
      if (!mods) {
        output.attributeName = output.attributeName
          ? output.attributeName + '-' + keyword
          : keyword;
      }
      return output;
    },
    {
      attributeName: '',
    }
  );
}

export function standardCSSMethod<T extends HTMLElement>(
  key: string
): AttributeMethod<T> {
  const { attributeName, media, pseudo } = parse(key);
  styleSheet = styleSheets[media ?? 'all'];
  const cache: { [key: string]: string } = {};
  function getClassName(value: string) {
    if (cache[value]) {
      return cache[value];
    }
    const className = `c${ruleCount++}`;
    styleSheet.sheet?.insertRule(
      `.${className}${pseudo ?? ''}{ ${attributeName}:${value}; }`,
      styleSheet.sheet?.cssRules.length
    );
    return (cache[value] = className);
  }
  return function(element: T, value: Observable<string> | string) {
    if (isObservable(value)) {
      let prevClassName: string;
      return value.pipe(
        tap((val: string) => {
          const className = getClassName(val);
          if (prevClassName) {
            element.classList.remove(prevClassName);
          }
          element.classList.add(className);
          prevClassName = className;
        })
      );
    } else {
      const className = getClassName(value);
      element.classList.add(className);
      return;
    }
  };
}
