import { AktaNode, ErrorBoundary, mount } from 'akta';
import { Route, Router, Link } from 'akta-router';
import { interval, map, startWith } from 'rxjs';
import Basic from './pages/basic';
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
          Index
        </Link>
        <Link href="/slow" $color="currentColor">
          Slow
        </Link>
        <Link href="/error" $color="currentColor">
          Error
        </Link>
      </div>
    </header>
  );
}

function ErrorComponent() {
  return (
    <div>
      {interval(1000).pipe(
        startWith(-1),
        map(i => {
          if (i > 9) {
            throw new Error('Invalid state');
          }
          return <h1>{9 - i} seconds until crash!</h1>;
        })
      )}
    </div>
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
        <div
          $gridArea="main"
          $display="flex"
          $justifyContent="center"
          $alignItems="center"
        >
          <Route path="/slow" exact>
            <Slow />
          </Route>
          <Route path="/basic" exact>
            <Basic />
          </Route>
          <Route path="/" exact>
            <Index />
          </Route>
          <Route path="/error" exact>
            <ErrorBoundary fallback="Graceful error handling">
              <ErrorComponent />
            </ErrorBoundary>
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
