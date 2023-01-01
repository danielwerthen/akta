import { isObservable, Observable, tap } from 'rxjs';
import { AttributeMethod } from './element-ops';

function isStyleElement(obj: ChildNode): obj is HTMLStyleElement {
  return typeof (obj as HTMLStyleElement).media === 'string';
}

export function stylesheetMap() {
  let startNode: HTMLStyleElement | undefined;
  function get(specificity: string, media: string = ''): HTMLStyleElement {
    if (!startNode) {
      const sheet = (startNode = document.createElement('style'));
      sheet.media = media;
      sheet.dataset['specificity'] = specificity;
      document.head.append(sheet);
      return sheet;
    }
    let node: HTMLStyleElement | null = startNode;
    while (node) {
      const a = node.media || 'ZZZZ';
      const b = media || 'ZZZZ';
      const spec = node.dataset['specificity'] ?? '0';
      if (node.media === media && spec === specificity) {
        return node;
      }
      if (a < b || (a === b && spec > specificity)) {
        const newNode = document.createElement('style');
        newNode.media = media;
        newNode.dataset['specificity'] = specificity;
        node.before(newNode);
        startNode = newNode;
        return newNode;
      }
      const nextNode = node?.nextSibling as HTMLStyleElement;
      if (!nextNode || !isStyleElement(nextNode)) {
        break;
      }
      node = nextNode;
    }
    const newNode = document.createElement('style');
    newNode.media = media;
    newNode.dataset['specificity'] = specificity;
    node.after(newNode);
    return newNode;
  }
  return get;
}

type ParsedAttribute = {
  attributeName: string;
  specificity: number;
  media?: string;
  pseudo?: string;
};

export const styleModifiers: {
  [key: string]: Omit<ParsedAttribute, 'attributeName' | 'specificity'>;
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
};

const uppercasePattern = /[A-Z]/g;
export function parseProp(prop: string): ParsedAttribute {
  const [attr, ...mods] = prop.split('_');
  const hyphen = attr.replace(uppercasePattern, '-$&').toLowerCase();
  let specificity = hyphen.split('-').length - 1;
  return mods.reduce(
    (sum: ParsedAttribute, mod) => {
      const predefined = styleModifiers[mod];
      if (predefined) {
        const { media, pseudo } = predefined;
        if (media) {
          sum.media = sum.media ? `${sum.media} and ${media}` : media;
        }
        if (pseudo) {
          sum.pseudo = sum.pseudo ? `${sum.pseudo}${pseudo}` : pseudo;
        }
        return sum;
      }
      if (mod.startsWith('max')) {
        const amount = Number(mod.substr(3));
        const media = `(max-width: ${amount}px)`;
        sum.media = sum.media ? `${sum.media} and ${media}` : media;
      } else if (mod.startsWith('min')) {
        const amount = Number(mod.substr(3));
        const media = `(min-width: ${amount}px)`;
        sum.media = sum.media ? `${sum.media} and ${media}` : media;
      } else {
        const pseudo = `:${mod.replace(uppercasePattern, '-$&').toLowerCase()}`;
        sum.pseudo = sum.pseudo ? `${sum.pseudo}${pseudo}` : pseudo;
      }
      return sum;
    },
    {
      attributeName: hyphen,
      specificity,
    }
  );
}

let ruleCount = 0;
const map = stylesheetMap();
export function standardCSSMethod<T extends Element>(
  key: string
): AttributeMethod<T> {
  const { attributeName, specificity, media, pseudo } = parseProp(key);
  const styleSheet = map(specificity.toString(), media);
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
