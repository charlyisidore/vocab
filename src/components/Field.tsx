import { type ParentComponent } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Field.module.scss';

/**
 * Form field.
 *
 * @prop {string} label Field label.
 */
const Field: ParentComponent<{
  label: string;
}> = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Field', defaultStyles);
  return (
    <div class={styles(['container', colorScheme()])}>
      <div class={styles('label')}>{props.label}</div>
      <div class={styles('input')}>{props.children}</div>
    </div>
  );
};

export default Field;
