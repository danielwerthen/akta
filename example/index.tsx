import { mount } from 'akta';
import { Route, Router } from 'akta-router';
import Index from './pages/index';

function App() {
  return (
    <Router>
      <Route path="/" exact>
        <Index />
      </Route>
      <Route path="/foobar" exact>
        <div>
          <p>Foobar</p>
          <a href="/">Index page</a>
        </div>
      </Route>
    </Router>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
