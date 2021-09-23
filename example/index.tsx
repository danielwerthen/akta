import { AktaNode, mount } from 'akta';
import { Route, Router, Link } from 'akta-router';
import Index from './pages/index';
import { Slow } from './pages/slow';

function Header() {
  return (
    <header
      $display="flex"
      $gridTemplate="header"
      $backgroundColor="black"
      $color="white"
      $justifyItems="center"
      $alignItems="center"
      $boxShadow="0 0 8px 8px rgba(0 0 0 / .25)"
    >
      <span $fontSize="1.5em" $margin=".5em">
        Akta
      </span>
      <div $flex="1" $display="flex" $justifyContent="space-evenly">
        <Link href="/" $color="currentColor">
          Index page
        </Link>
        <Link href="/slow" $color="currentColor">
          Slow page
        </Link>
        <Link href="/foobar" $color="currentColor">
          Foobar page
        </Link>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div
        $minHeight="100vh"
        $display="grid"
        $gridTemplateAreas='"header" "main" "footer"'
        $gridTemplateColumns="1fr"
        $gridTemplateRows="2.4em 1fr auto"
      >
        <Header />
        <div $gridArea="main">
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
            {new Array(1000).fill(0).map(() => (
              <div>Row</div>
            ))}
          </Route>
        </div>
        <footer $gridArea="footer" $backgroundColor="black">
          <p>Footer</p>
        </footer>
      </div>
    </Router>
  );
}
const el = document.createElement('div');
document.body.appendChild(el);
const norm = document.createElement('link');
norm.rel = 'stylesheet';
norm.href = 'https://unpkg.com/normalize.css@8.0.1/normalize.css';

document.head.append(norm);

mount(<App />, el);
