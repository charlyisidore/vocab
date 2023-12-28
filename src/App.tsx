import { ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';
import { useColorScheme } from './providers/color-scheme';
import { useStyles } from './providers/theme';
import Logo from './components/Logo';
import Notifier from './components/Notifier';

import defaultStyles from './App.module.scss';

/**
 * App root component.
 */
const App: ParentComponent = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('App', defaultStyles);
  return (
    <div class={styles(['container', colorScheme()])}>
      <div class={styles('header')}>
        <div class={styles('left')} />
        <div class={styles('center')}>
          <A href="/" class={styles('logo')}>
            <Logo />
          </A>
        </div>
        <div class={styles('right')} />
      </div>
      <div class={styles('main')}>
        {props.children}
        <Notifier />
      </div>
    </div>
  );
};

export default App;
