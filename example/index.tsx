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
        <>
          <p>Daniel</p>
          <p>Foobar</p>
        </>
        <span>
          <Link href="/foobar">Foobar page</Link>
        </span>
      </div>
    </Router>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);

mount(<App />, el);
