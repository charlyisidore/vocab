import {
  type ParentComponent,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';

/**
 * Color scheme context.
 */
const ColorSchemeContext = createContext<() => string | undefined>();

/**
 * Hook for accessing the color scheme value.
 *
 * @returns An accessor for the color scheme value.
 *
 * @example
 *   import { useColorScheme } from './providers/color-scheme';
 *
 *   const Hello = () => {
 *     const colorScheme = useColorScheme();
 *     return <div class={colorScheme()}>Hello</div>;
 *   };
 */
export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('ColorSchemeContext not found');
  }
  return context;
}

/**
 * Provide a color scheme value for descendant components.
 *
 * @prop {string | undefined} colorScheme Overrides browser's color scheme.
 * @prop {string | undefined} defaultColorScheme Default color scheme when
 *       undefined.
 *
 * @example
 *   import {
 *     ColorSchemeProvider,
 *     useColorScheme,
 *   } from './providers/color-scheme';
 *
 *   const Hello = () => {
 *     const colorScheme = useColorScheme();
 *     return <div class={colorScheme()}>Hello</div>;
 *   };
 *
 *   const App = () => (
 *     <ColorSchemeProvider defaultColorScheme="light">
 *       <Hello />
 *     </ColorSchemeProvider>
 *   );
 */
export const ColorSchemeProvider: ParentComponent<{
  colorScheme?: string;
  defaultColorScheme?: string;
}> = (props) => {
  const colorSchemeList = ['light', 'dark'];

  const mediaQueryLists = Object.fromEntries(
    colorSchemeList.map((colorScheme) => [
      colorScheme,
      window.matchMedia(`(prefers-color-scheme: ${colorScheme})`),
    ]),
  );

  const [initialColorScheme] =
    Object.entries(mediaQueryLists) //
      .find(([, mediaQueryList]) => mediaQueryList.matches) ?? [];

  const [colorScheme, setColorScheme] = createSignal(initialColorScheme);

  const handleChange = Object.fromEntries(
    colorSchemeList.map((colorScheme) => [
      colorScheme,
      (event: MediaQueryListEvent) =>
        event.matches && setColorScheme(colorScheme),
    ]),
  );

  onMount(() =>
    colorSchemeList.forEach(
      (colorScheme) =>
        mediaQueryLists[colorScheme].addEventListener?.(
          'change',
          handleChange[colorScheme],
        ),
    ),
  );

  onCleanup(() =>
    colorSchemeList.forEach(
      (colorScheme) =>
        mediaQueryLists[colorScheme].removeEventListener?.(
          'change',
          handleChange[colorScheme],
        ),
    ),
  );

  const value = () =>
    props.colorScheme ?? colorScheme() ?? props.defaultColorScheme;

  return (
    <ColorSchemeContext.Provider value={value}>
      {props.children}
    </ColorSchemeContext.Provider>
  );
};
