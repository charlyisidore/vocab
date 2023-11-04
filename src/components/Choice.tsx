import { For, type ParentComponent } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';
import Button from './Button';

import defaultStyles from './Choice.module.scss';

/**
 * Option for `Choice`.
 *
 * @prop {string | undefined} value Option value.
 * @prop {boolean | undefined} checked true if the option is checked.
 * @prop {(() => void) | undefined} onClick Function called on click.
 */
export const ChoiceOption: ParentComponent<{
  value?: string;
  checked?: boolean;
  onClick?: () => void;
}> = (props) => {
  const styles = useStyles('Choice', defaultStyles);

  return (
    <Button
      class={styles('option')}
      state={{ active: props.checked }}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </Button>
  );
};

/**
 * Choice between mutiple options.
 *
 * @prop {Record<string, string> | undefined} options Object mapping values to
 *       names.
 * @prop {string | undefined} value Selected value.
 * @prop {string | undefined} orientation `horizontal` or `vertical`.
 * @prop {((value: string) => void) | undefined} onChange Function called on
 *       option change.
 */
const Choice: ParentComponent<{
  options?: Record<string, string>;
  value?: string;
  orientation?: string;
  onChange?: (value: string) => void;
}> = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Choice', defaultStyles);

  return (
    <div
      class={styles([
        'container',
        colorScheme(),
        props.orientation ?? 'horizontal',
      ])}
    >
      {props.children ?? (
        <For each={Object.entries(props.options ?? {})}>
          {([value, name]) => (
            <ChoiceOption
              value={value}
              checked={value === props.value}
              onClick={() => props.onChange?.(value)}
            >
              {name}
            </ChoiceOption>
          )}
        </For>
      )}
    </div>
  );
};

export default Choice;
