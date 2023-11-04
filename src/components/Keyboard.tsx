import { type Component, For, mergeProps, onCleanup, onMount } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Keyboard.module.scss';

/**
 * Virtual keyboard.
 *
 * @prop {string[]} layout Layout described as an array of strings.
 * @prop {number | undefined} columns Number of columns in layout.
 * @prop {((key: string) => string) | undefined} content Function that returns
 *       the content of a key.
 * @prop {((key: string) => string[] | string | undefined) | undefined} state
 *       Function that returns the state of a key.
 * @prop {((key: string) => void) | undefined} onKeyPress Function called on
 *       key press.
 */
const Keyboard: Component<{
  layout: string[];
  columns?: number;
  content?: (key: string) => string;
  state?: (key: string) => string[] | string | undefined;
  onKeyPress?: (key: string) => void;
}> = (props_) => {
  const props = mergeProps(
    {
      content: (key: string) => {
        switch (key) {
          case 'Backspace':
            return '\u232b'; // ⌫
          case 'Enter':
            return '\u23ce'; // ⏎
          default:
            return key;
        }
      },
    },
    props_,
  );

  const colorScheme = useColorScheme();
  const styles = useStyles('Keyboard', defaultStyles);

  const columns = () =>
    props.columns ??
    Math.max(...props.layout.map((row) => row.split(' ').length));

  const keyState = (key: string) =>
    [props.state?.(key)].flat().filter((state) => state);

  // Called on button `click` event
  const handleClick = (key: string, event: MouseEvent) => {
    if (event.button === 0) {
      event.stopPropagation();
      props.onKeyPress?.(key);
    }
  };

  // Called on `keydown` event
  const handleKeyPress = (event: KeyboardEvent) => {
    // Ignore if the user presses Ctrl or Meta key
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Find equivalent key in the layout
    const eventKeyLowerCase = event.key.toLowerCase();
    const key = props.layout
      .join(' ')
      .split(' ')
      .find((key) => key.toLowerCase() === eventKeyLowerCase);

    // Ignore if the key is not in the layout
    if (!key) {
      return;
    }

    props.onKeyPress?.(key);
  };

  // Listen to physical keyboard events
  onMount(() => document.addEventListener('keydown', handleKeyPress));
  onCleanup(() => document.removeEventListener('keydown', handleKeyPress));

  return (
    <div
      class={styles(['container', colorScheme()])}
      style={{ '--columns': columns() }}
    >
      <For each={props.layout}>
        {(row: string) => (
          <div class={styles('row')}>
            <For each={row.split(' ')}>
              {(key: string) =>
                key ? (
                  <button
                    class={styles(['button', key, ...keyState(key)])}
                    onClick={[handleClick, key]}
                    aria-label={key}
                  >
                    {props.content(key)}
                  </button>
                ) : (
                  <div class={styles('empty')} />
                )
              }
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default Keyboard;
