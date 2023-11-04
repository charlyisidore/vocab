import { For } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Logo.module.scss';

/**
 * Logo of the app.
 */
const Logo = () => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Logo', defaultStyles);
  const title = 'vocab';
  return (
    <div class={styles(['container', colorScheme()])}>
      <For each={title.split('')}>
        {(c: string) => (
          <span class={styles(['letter', c])}>{c.toUpperCase()}</span>
        )}
      </For>
    </div>
  );
};

export default Logo;
