import { type ParentComponent, createContext, useContext } from 'solid-js';

/**
 * Message translation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Translation = (params: any) => string;

/**
 * Flat dictionary.
 */
export type Dictionary = Record<string, Translation>;

/**
 * The locale context.
 */
const LocaleContext = createContext<() => Dictionary | undefined>();

/**
 * Normalize a raw translation into a function.
 *
 * @param translation Raw translation.
 *
 * @returns Normalized translation.
 */
export function createTranslation<T>(translation: T): Translation {
  return translation instanceof Function
    ? (translation as Translation)
    : () => `${translation}`;
}

/**
 * Normalize a raw tree dictionary into a flat dictionary.
 *
 * @param dictionary Raw dictionary.
 * @param separator Separator for the keys.
 *
 * @returns Normalized dictionary.
 */
export function createDictionary<D extends object>(
  dictionary: D,
  separator: string = '.',
): Dictionary {
  return Object.fromEntries(
    Object.entries(dictionary)
      .map(([key, value]) =>
        typeof value === 'object'
          ? // Subtree
            Object.entries(createDictionary(value)) //
              .map(([k, v]) => [[key, k].join(separator), v])
          : // Terminal node
            [[key, createTranslation(value)]],
      )
      .flat(),
  );
}

/**
 * Hook for getting the dictionary.
 *
 * @returns An accessor for the dictionary.
 */
export function useDictionary() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('LocaleContext not found');
  }
  return context;
}

/**
 * Hook providing a translator function.
 *
 * The returned function takes a translation key and optional parameters. If the
 * key exists in the current dictionary, it returns the translated string.
 * Otherwise, it returns the key unchanged.
 *
 * @returns Translator function.
 *
 * @example
 *   import { useTranslate } from './providers/locale';
 *
 *   const Hello = () => {
 *     const translate = useTranslate();
 *     return <>{translate('hello')}</>;
 *   };
 *
 *   const HelloWithParams = () => {
 *     const translate = useTranslate();
 *     return <>{translate('helloName', { name: 'world' })}</>;
 *   };
 */
export function useTranslate() {
  const dictionary = useDictionary();
  return (key: string, params?: unknown): string =>
    dictionary()?.[key]?.(params) ?? key;
}

/**
 * Provide simple translation support for descendant components.
 *
 * @prop {Dictionary | undefined} dictionary Locale dictionary.
 *
 * @example
 *   import {
 *     LocaleProvider,
 *     createDictionary,
 *     useTranslate,
 *   } from './providers/locale';
 *
 *   const dictionary = createDictionary({
 *     hello: 'saluton',
 *   });
 *
 *   const Hello = () => {
 *     const translate = useTranslate();
 *     return <>{translate('hello')}</>;
 *   };
 *
 *   const App = () => (
 *     <LocaleProvider dictionary={dictionary}>
 *       <Hello />
 *     </LocaleProvider>
 *   );
 */
export const LocaleProvider: ParentComponent<{
  dictionary?: Dictionary;
}> = (props) => (
  // eslint-disable-next-line solid/reactivity
  <LocaleContext.Provider value={() => props.dictionary}>
    {props.children}
  </LocaleContext.Provider>
);
