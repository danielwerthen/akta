import { AktaNode, mount } from 'akta';
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
          Extra
        </Route>
      </div>
      <div>
        <h2>Links</h2>
        <div>
          <Link href="/">Index page</Link>
        </div>
        <div>
          <Link href="/slow">Slow page</Link>
        </div>
        <div>
          <Link href="/foobar">Foobar page</Link>
        </div>
      </div>
    </Router>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
