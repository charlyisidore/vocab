import { type ParentComponent } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Button.module.scss';

/**
 * Button.
 *
 * @prop {string | undefined} class Appends a CSS class name.
 * @prop {string | string[] | Record<string, boolean | undefined> | undefined} state
 *       State of the button.
 * @prop {(() => void) | undefined} onClick Function called on click.
 */
const Button: ParentComponent<{
  class?: string;
  state?: string | string[] | Record<string, boolean | undefined>;
  onClick?: () => void;
}> = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Button', defaultStyles);
  return (
    <button
      class={[
        styles(['container', colorScheme(), props.state]),
        props.class,
      ].join(' ')}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  );
};

export default Button;
