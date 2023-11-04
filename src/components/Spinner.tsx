import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Spinner.module.scss';

/**
 * Loading spinner.
 */
const Spinner = () => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Spinner', defaultStyles);
  return (
    <div class={styles(['container', colorScheme()])}>
      <div class={styles('spinner')} />
    </div>
  );
};

export default Spinner;
