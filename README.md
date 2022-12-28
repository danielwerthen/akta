# Akta framework

Akta is an experimental alternative to [React](https://reactjs.org/). It was created to try to answer these questions:

- What if CSS were standard jsx props?
- What if React used Observables for dynamic updates rather than rerendering?
- What if you could add custom props to any DOM element?

## CSS as jsx props

This feature introduces a large set of new jsx props, for each element, right out of the box. It makes it possible to write `<div $color="red" />` for example. Each valid css property can be accessed by prefixing it with `$` and camel casing the name. By suffixing the property with `_` it is also possible to append modifiers to the attribute, such as pseudo selectors and media queries. `<div $color_hover_min100_max500="yellow" />`.

Under the hood, this feature creates an atomic css class for each property key + value combination, this css class is reused in each subsequent occurrence. This approach is deeply inspired by the amazing library [Styletron](https://github.com/styletron/styletron).

For good measure, the framework also elevates style attributes to the top jsx level. So `<div color="red" />` is the same as writing `<div style="color: red" />`. Why support both this and the css approach above? The above approach works well for a "reasonable" amount of different styling combination, if you want to dynamically change a numerical value to a large amount of different values, creating a separate css class for each combination might be very inefficient. so the style attribute is more appropriate in this scenario.

## Large Components and encapsulated elements

This framework encourages the user to create large components with lots of elements as children. While it might be considered a bad practice to have large components with lots of content within them, there is a lot of convenience in being able to write a big outline of a user interface where each part is visually represented at a glance. This frameworks is shaped the way it is to make managing these large components easy and performant.

## Observable components

Have you ever wished that you could just return a Promise with some jsx result in a React component? With this framework you can, or rather, there is a technical problem with typescript interpretation of jsx that makes this not really practical yet. BUT, Observables works just fine. So just return an Observable, or create one using that promise of yours, and the framework will do what you would expect it to: It will subscribe to the result, update the DOM when the result is ready, replace the DOM if the result is getting future updates, and remove the subscription if the parent component is unmounted.
