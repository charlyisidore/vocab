import { type Component, For, type ParentComponent } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useStyles } from '../providers/theme';

import defaultStyles from './Board.module.scss';

/**
 * Cell of the game board.
 *
 * @prop {string | string[] | Record<string, boolean | undefined> | undefined} state Cell state.
 */
export const BoardCell: ParentComponent<{
  state?: string | string[] | Record<string, boolean | undefined>;
}> = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Board', defaultStyles);

  return (
    <div class={styles(['cell', colorScheme(), props.state])}>
      {props.children}
    </div>
  );
};

/**
 * Game board showing guesses.
 *
 * @prop {number} rows Number of rows.
 * @prop {number} columns Number of columns.
 * @prop {((i: number, j: number) => string | undefined) | undefined} content
 *       Function that returns the content of a cell.
 * @prop {((key: string) => string | string[] | Record<string, boolean | undefined> | undefined) | undefined} state
 *       Function that returns the state of a cell.
 */
const Board: Component<{
  rows: number;
  columns: number;
  content?: (i: number, j: number) => string | undefined;
  state?: (
    i: number,
    j: number,
  ) => string | string[] | Record<string, boolean | undefined> | undefined;
}> = (props) => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Board', defaultStyles);

  return (
    <div class={styles(['container', colorScheme()])}>
      <For each={Array.from({ length: props.rows }).map((_, i) => i)}>
        {(i) => (
          <div class={styles('row')}>
            <For each={Array.from({ length: props.columns }).map((_, j) => j)}>
              {(j) => (
                <BoardCell state={props.state?.(i, j)}>
                  {props.content?.(i, j)}
                </BoardCell>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default Board;
