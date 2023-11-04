import {
  type ParentComponent,
  createContext,
  createResource,
  useContext,
} from 'solid-js';
import { createLocalStorageStore } from './lib/storage';
import { ColorSchemeProvider } from './providers/color-scheme';
import { LocaleProvider, createDictionary } from './providers/locale';
import { NotificationProvider } from './providers/notification';
import { ThemeProvider } from './providers/theme';

// Fallbacks when locale, keyboard and theme are not found
import fallbackLocale from './locales/fr';
import fallbackKeyboard from './keyboards/azerty';
import fallbackTheme from './themes/vocab';

/**
 * Fetch a locale dictionary given its language code.
 *
 * @param language Language code.
 *
 * @returns Dictionary.
 */
const fetchLocale = async (language: string) => {
  try {
    return createDictionary(
      (await import(`./locales/${language}.tsx`)).default,
    );
  } catch {
    return createDictionary(fallbackLocale);
  }
};

/**
 * Fetch a keyboard layout given its identifier.
 *
 * @param keyboard Keyboard identifier.
 *
 * @returns Keyboard layout.
 */
const fetchKeyboard = async (keyboard: string) => {
  try {
    return (await import(`./keyboards/${keyboard}.ts`)).default;
  } catch {
    return fallbackKeyboard;
  }
};

/**
 * Fetch a theme instance given its identifier.
 *
 * @param theme Theme identifier.
 *
 * @returns Theme instance.
 */
export const fetchTheme = async (theme: string) => {
  try {
    return (await import(`./themes/${theme}/index.ts`)).default;
  } catch {
    return fallbackTheme;
  }
};

/**
 * App state.
 */
export type AppState = {
  colorScheme?: string;
  keyboard?: string;
  keyboardLayout?: string[];
  language?: string;
  theme?: string;
};

/**
 * Context for storing and accessing the app state.
 */
const AppContext = createContext<AppState>({});

/**
 * Hook for managing the app state.
 *
 * @returns An accessor and a setter to the app state.
 */
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext not found');
  }
  return context;
}

/**
 * Provide the app state.
 */
export const AppStateProvider: ParentComponent = (props) => {
  // Synchronizes app settings with `localStorage`
  const [settings, setSettings] = createLocalStorageStore<AppState>(
    'vocab_settings',
    {
      // Default settings
      colorScheme: 'dark',
      keyboard: 'azerty',
      language: 'fr',
      theme: 'vocab',
    },
  );

  const [dictionary] = createResource(() => settings.language, fetchLocale);
  const [keyboard] = createResource(() => settings.keyboard, fetchKeyboard);
  const [theme] = createResource(() => settings.theme, fetchTheme);

  // The app state can be accessed using `useAppState()`
  const state = {
    get colorScheme() {
      return settings.colorScheme;
    },
    set colorScheme(colorScheme: string | undefined) {
      setSettings({ colorScheme });
    },
    get keyboard() {
      return settings.keyboard;
    },
    set keyboard(keyboard: string) {
      setSettings({ keyboard });
    },
    get keyboardLayout() {
      return keyboard();
    },
    get language() {
      return settings.language;
    },
    set language(language: string) {
      setSettings({ language });
    },
    get theme() {
      return settings.theme;
    },
    set theme(theme: string) {
      setSettings({ theme });
    },
  };

  return (
    <AppContext.Provider value={state}>
      <ColorSchemeProvider
        colorScheme={settings.colorScheme}
        defaultColorScheme="dark"
      >
        <LocaleProvider dictionary={dictionary()}>
          <ThemeProvider theme={theme()}>
            <NotificationProvider timeout={3000}>
              {/* prettier-ignore */}
              {props.children}
            </NotificationProvider>
          </ThemeProvider>
        </LocaleProvider>
      </ColorSchemeProvider>
    </AppContext.Provider>
  );
};
