import { of } from 'rxjs';

function Component() {
  return <p>A component paragraph</p>;
}

export default function Basic() {
  return (
    <div>
      <h1>This will outline the basic options for akta</h1>
      <p>A static paragraph</p>
      {of(<p>An observable paragraph</p>)}
      <Component />
    </div>
  );
}
