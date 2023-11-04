import { type Component, For, createResource } from 'solid-js';
import { fetchTheme, useAppState } from '../AppState';
import { useColorScheme } from '../providers/color-scheme';
import { useTranslate } from '../providers/locale';
import { ThemeProvider, useStyles } from '../providers/theme';
import Board from '../components/Board';
import Choice, { ChoiceOption } from '../components/Choice';
import Field from '../components/Field';

import defaultStyles from './Settings.module.scss';

import keyboards from '../keyboards';
import locales from '../locales';
import themes from '../themes';

const colorSchemes = {
  '': '⚙️',
  light: '☀️',
  dark: '🌙',
};

/**
 * Shows a small game board as a theme preview.
 *
 * @prop {string} theme Theme identifier.
 */
const ThemePreview: Component<{ theme: string }> = (props) => {
  const themeContent = 'vocab';
  const themeState = ['correct', 'absent', 'present', 'absent', 'correct'];
  const [resource] = createResource(() => fetchTheme(props.theme));

  return (
    <ThemeProvider theme={resource()}>
      <Board
        rows={1}
        columns={themeContent.length}
        content={(_, j) => themeContent.charAt(j)}
        state={(_, j) => themeState[j]}
      />
    </ThemeProvider>
  );
};

/**
 * Settings page.
 */
const Settings = () => {
  const app = useAppState();
  const colorScheme = useColorScheme();
  const styles = useStyles('Settings', defaultStyles);
  const translate = useTranslate();

  return (
    <div class={styles(['container', colorScheme()])}>
      <div class={styles('header')}>{translate('settings.title')}</div>
      <div class={styles('main')}>
        <Field label={translate('settings.language')}>
          <Choice
            options={locales}
            value={app.language}
            onChange={(language) => (app.language = language)}
          />
        </Field>
        <Field label={translate('settings.keyboard')}>
          <Choice
            options={keyboards}
            value={app.keyboard}
            onChange={(keyboard) => (app.keyboard = keyboard)}
          />
        </Field>
        <Field label={translate('settings.colorScheme')}>
          <Choice
            options={colorSchemes}
            value={app.colorScheme ?? ''}
            onChange={(colorScheme) =>
              (app.colorScheme = colorScheme || undefined)
            }
          />
        </Field>
        <Field label={translate('settings.theme')}>
          <Choice value={app.theme} orientation="vertical">
            <For each={Object.keys(themes)}>
              {(theme) => (
                <ChoiceOption
                  checked={theme === app.theme}
                  onClick={() => (app.theme = theme)}
                >
                  <div class={styles('themePreview')}>
                    <ThemePreview theme={theme} />
                  </div>
                </ChoiceOption>
              )}
            </For>
          </Choice>
        </Field>
      </div>
    </div>
  );
};

export default Settings;
