import {
  type ParentComponent,
  createContext,
  createMemo,
  useContext,
} from 'solid-js';

/**
 * Scoped styles.
 *
 * Maps user-defined CSS class names to scoped class names.
 */
export type Styles = Record<string, string>;

/**
 * Theme instance.
 *
 * Maps namespaces to scoped styles.
 */
export type Theme = Record<string, Styles>;

/**
 * Collection of CSS classes as string, array, object or undefined value.
 */
export type Classes =
  | string
  | Classes[]
  | Record<string, boolean | undefined>
  | undefined;

/**
 * Theme context.
 */
const ThemeContext = createContext<() => Theme | undefined>();

/**
 * Merge multiple styles into one by concatenating their class names.
 *
 * @param styles Array of styles.
 *
 * @returns Merged styles.
 */
function mergeStyles(styles: Styles[]): Styles {
  return styles.reduce(
    (merged, current) => ({
      ...merged,
      ...Object.fromEntries(
        Object.entries(current) //
          .map(([key, value]) => [key, [merged[key], value].join(' ')]),
      ),
    }),
    {} as Styles,
  );
}

/**
 * Normalize a collection of classes into an array.
 *
 * If the argument is:
 * - a string: the string is split based on whitespaces.
 * - an array: its items are normalized and the result is merged into one array.
 * - an object: keys having a truthy value are merged into one array.
 * - undefined: an empty array is returned.
 *
 * @param classes Classes as string, array, object or undefined value.
 *
 * @returns Array of classes.
 *
 * @example
 *   normalizeClasses('hello world');
 *   // => ['hello', 'world']
 *   normalizeClasses(['hello', ['world'], { bye: true }, undefined]);
 *   // => ['hello', 'world', 'bye']
 *   normalizeClasses({ hello: true, world: false });
 *   // => ['hello']
 *   normalizeClasses(undefined);
 *   // => []
 */
function normalizeClasses(classes: Classes): string[] {
  if (!classes) {
    return [];
  }

  if (typeof classes === 'string') {
    return [...new Set(classes.split(/\s+/u).filter((value) => value))];
  }

  if (Array.isArray(classes)) {
    return [
      ...new Set(
        classes
          .map(normalizeClasses)
          .flat()
          .filter((value) => value),
      ),
    ];
  }

  // typeof classes === 'object'
  return normalizeClasses(
    Object.entries(classes) //
      .filter(([, value]) => value)
      .map(([key]) => key),
  );
}

/**
 * Hook for managing the theme context.
 *
 * @returns The theme context.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('ThemeContext not found');
  }
  return context;
}

/**
 * Hook providing a styling function.
 *
 * This hook takes a namespace and optional default styles.
 *
 * The returned function takes user-defined CSS class names and returns a string
 * that contains scoped CSS class names. When default styles are specified,
 * their scoped class names are concatenated to the result.
 *
 * @param namespace Namespace in the theme.
 * @param defaultStyles Default styles.
 *
 * @returns Styling function.
 *
 * @example
 *   import { useStyles } from './providers/theme';
 *
 *   const Hello = () => {
 *     const styles = useStyles('Hello');
 *     return <div class={styles('content')}>Hello</div>;
 *   };
 */
export function useStyles(namespace: string, defaultStyles?: Styles) {
  const theme = useTheme();
  const styles = createMemo(() =>
    mergeStyles(
      [defaultStyles, theme()?.[namespace]].filter((v) => v) as Styles[],
    ),
  );

  return (classes: Classes) =>
    normalizeClasses(classes)
      .reduce(
        // eslint-disable-next-line solid/reactivity
        (merged, className) => [...merged, styles()[className]],
        [] as string[],
      )
      .join(' ');
}

/**
 * Provide simple theming support for descendant components.
 *
 * @prop {Theme | undefined} theme Theme instance.
 *
 * @example
 *   import { ThemeProvider, useStyles } from './providers/theme';
 *
 *   import Hello from './Hello.scss';
 *
 *   const theme = { Hello };
 *
 *   const Hello = () => {
 *     const styles = useStyles('Hello');
 *     return <div class={styles('content')}>Hello</div>;
 *   };
 *
 *   const App = () => (
 *     <ThemeProvider theme={theme}>
 *       <Hello />
 *     </ThemeProvider>
 *   );
 */
export const ThemeProvider: ParentComponent<{
  theme?: Theme;
}> = (props) => (
  // eslint-disable-next-line solid/reactivity
  <ThemeContext.Provider value={() => props.theme}>
    {props.children}
  </ThemeContext.Provider>
);
