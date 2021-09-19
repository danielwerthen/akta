import { mount } from 'akta';
import { Route, Router, Link } from 'akta-router';
import Index from './pages/index';
import { Slow } from './pages/slow';

function App() {
  return (
    <Router>
      <div>
        <Route path="/slow" exact>
          <Slow />
        </Route>
        <Route path="/" exact>
          <Index />
        </Route>
        <Route path="/foobar" exact>
          <div>
            <p>Foobar</p>
          </div>
        </Route>
      </div>
      <div>
        <h2>Links</h2>
        <Link href="/">Index page</Link>
        <Link href="/slow">Slow page</Link>
        <Link href="/foobar">Foobar page</Link>
      </div>
    </Router>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
