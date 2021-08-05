import { mount, AktaIntrinsicElements } from 'akta';

function App() {
  return <p>Daniel</p>;
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, {
  parent: el,
  intrinsic: new AktaIntrinsicElements(),
});
