type StyleSheetNode = [string, HTMLStyleElement[]];
export function stylesheetMap2() {
  const sheets: StyleSheetNode[] = [['', []]];
  function get(attrName: string, media: string = ''): HTMLStyleElement {
    const specificity = attrName.split('-').length - 1;
    let i = 0;
    let node: StyleSheetNode | null = null;
    for (i = 0; i < sheets.length; i++) {
      if (sheets[i][0] === media) {
        node = sheets[i];
        break;
      }
      if (sheets[i + 1] && sheets[i + 1][0] > media) {
        sheets.splice(i + 1, 0, (node = [media, []]));
        break;
      }
    }
    if (!node) {
      node = [media, []];
      sheets.push(node);
    }
    if (!node[1][specificity]) {
      const sheet = document.createElement('style');
      sheet.media = media;
      sheet.dataset['specificity'] = specificity.toString();
      node[1][specificity] = sheet;
      let prevSheet: HTMLStyleElement | null = null;
      for (let j = i; j >= 0; j--) {
        if (j === i) {
          if (specificity > 0) {
            for (let k = specificity - 1; k >= 0; k--) {
              prevSheet = sheets[j][1][k];
              if (prevSheet) {
                break;
              }
            }
          }
        } else {
          if (specificity > 0) {
            for (let k = sheets[j][1].length; k >= 0; k--) {
              prevSheet = sheets[j][1][k];
              if (prevSheet) {
                break;
              }
            }
          }
        }
        if (prevSheet) {
          break;
        }
      }
      if (!prevSheet) {
        let nextSheet: HTMLStyleElement | null = null;
        for (let j = i; j < sheets.length; j++) {
          for (let k = specificity + 1; k < sheets[j][1].length; k--) {
            nextSheet = sheets[j][1][k];
            if (nextSheet) {
              break;
            }
          }
          if (nextSheet) {
            break;
          }
        }
        if (nextSheet) {
          nextSheet.before(sheet);
        } else {
          document.head.appendChild(sheet);
        }
      } else {
        prevSheet.after(sheet);
      }
    }
    return node[1][specificity];
  }
  return get;
}

function isStyleElement(obj: ChildNode): obj is HTMLStyleElement {
  return typeof (obj as HTMLStyleElement).media === 'string';
}

export function stylesheetMap() {
  let startNode: HTMLStyleElement | undefined;
  function get(attrName: string, media: string = ''): HTMLStyleElement {
    const specificity = (attrName.split('-').length - 1).toString();
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
