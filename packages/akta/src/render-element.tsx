import { AktaElement, AktaNode } from './types';
import { NodeInstance, prepare } from './prepare';
import { renderingContext } from './rendering-context';
import { renderComponent } from './render-component';
import { DependencyMap } from './dependency-map';
import { elementsDependency } from './dependencies';

export function renderElement(
  element: AktaElement,
  deps: DependencyMap
): NodeInstance {
  const ctx = renderingContext.getContext();
  const { type, props } = element;
  if (typeof type === 'string') {
    const element = document.createElement(type);

    const elements = deps.peek(elementsDependency);
    for (var key in props) {
      if (key === 'children') {
        const children = props[key] as AktaNode;
        const instances = prepare(children, deps);
        if (Array.isArray(instances)) {
          element.append(...instances);
        } else {
          element.append(instances);
        }
      } else {
        const observable = elements[type][key](element, props[key]);
        if (observable) {
          ctx.subscriptions.push(observable.subscribe());
        }
      }
    }
    return element;
  } else if (!type) {
    return prepare(props.children as AktaNode, deps);
  } else {
    const element = renderComponent(type, props, ctx, deps);
    return prepare(element, deps);
  }
}
