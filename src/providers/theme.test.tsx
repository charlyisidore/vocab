import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { For, createSignal } from 'solid-js';
import { type Theme, ThemeProvider, useStyles } from './theme';

describe('theme provider', () => {
  // eslint-disable-next-line vitest/no-hooks
  afterEach(cleanup);

  it('throws ThemeContext not found', async () => {
    expect(() =>
      render(() => {
        const styles = useStyles('Hello');
        return <>{styles('content')}</>;
      }),
    ).toThrow(/ThemeContext/u);
  });

  it('applies styles from string', async () => {
    const theme = {
      Hello: {
        a: 'theme_a',
        b: 'theme_b',
      },
    };

    const Hello = () => {
      const styles = useStyles('Hello');
      return (
        <div data-testid="hello" class={styles(' a b ')}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider theme={theme}>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveClass('theme_a theme_b', { exact: true });
  });

  it('applies styles from array', async () => {
    const theme = {
      Hello: {
        a: 'theme_a',
        b: 'theme_b',
        c: 'theme_c',
      },
    };

    const Hello = () => {
      const styles = useStyles('Hello');
      return (
        <div
          data-testid="hello"
          class={styles(['a', ['b'], { c: true }, undefined])}
        >
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider theme={theme}>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveClass('theme_a theme_b theme_c', { exact: true });
  });

  it('applies styles from object', async () => {
    const theme = {
      Hello: {
        a: 'theme_a',
        b: 'theme_b',
      },
    };

    const Hello = () => {
      const styles = useStyles('Hello');
      return (
        <div data-testid="hello" class={styles({ a: true, b: false })}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider theme={theme}>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveClass('theme_a', { exact: true });
  });

  it('applies styles from undefined', async () => {
    const theme = {
      Hello: {},
    };

    const Hello = () => {
      const styles = useStyles('Hello');
      return (
        <div data-testid="hello" class={styles(undefined)}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider theme={theme}>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).not.toHaveClass();
  });

  it('applies default styles with theme', async () => {
    const theme = {
      Hello: {
        a: 'theme_a',
      },
    };

    const defaultStyles = {
      a: 'default_a',
    };

    const Hello = () => {
      const styles = useStyles('Hello', defaultStyles);
      return (
        <div data-testid="hello" class={styles('a')}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider theme={theme}>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveClass('default_a theme_a', { exact: true });
  });

  it('applies default styles without theme', async () => {
    const defaultStyles = {
      a: 'default_a',
    };

    const Hello = () => {
      const styles = useStyles('Hello', defaultStyles);
      return (
        <div data-testid="hello" class={styles('a')}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => (
      <ThemeProvider>
        <Hello />
      </ThemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveClass('default_a', { exact: true });
  });

  it('changes the theme', async () => {
    const themes: Record<string, Theme> = {
      light: {
        Hello: {
          a: 'light_a',
        },
      },
      dark: {
        Hello: {
          a: 'dark_a',
        },
      },
    };

    const Hello = () => {
      const styles = useStyles('Hello');
      return (
        <div data-testid="hello" class={styles('a')}>
          Hello
        </div>
      );
    };

    const { getByTestId } = render(() => {
      const [theme, setTheme] = createSignal('light');
      const handleChange = (event: Event) =>
        setTheme((event.target as HTMLSelectElement).value);
      return (
        <ThemeProvider theme={themes[theme()]}>
          <Hello />
          <select data-testid="select" onChange={handleChange}>
            <For each={Object.keys(themes)}>
              {(value) => (
                <option value={value} selected={value === theme()}>
                  {value}
                </option>
              )}
            </For>
          </select>
        </ThemeProvider>
      );
    });

    const hello = getByTestId('hello');
    const select = getByTestId('select');
    expect(hello).toHaveClass('light_a', { exact: true });
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(hello).toHaveClass('dark_a', { exact: true });
  });
});
