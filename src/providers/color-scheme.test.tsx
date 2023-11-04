import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { ColorSchemeProvider, useColorScheme } from './color-scheme';

/**
 * Define `window.matchMedia` mock function.
 *
 * @param colorScheme Browser color scheme.
 */
function defineMatchMedia(colorScheme?: string) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        colorScheme &&
        new RegExp(`prefers-color-scheme:\\s*${colorScheme}`, 'u').test(query),
      media: query,
      onChange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('color scheme provider', () => {
  // eslint-disable-next-line vitest/no-hooks
  afterEach(cleanup);

  it('throws ColorSchemeContext not found', async () => {
    expect(() =>
      render(() => {
        const colorScheme = useColorScheme();
        return <>{colorScheme()}</>;
      }),
    ).toThrow(/ColorSchemeContext/u);
  });

  it('uses the specified color scheme', async () => {
    defineMatchMedia('light');

    const Hello = () => {
      const colorScheme = useColorScheme();
      return <div data-testid="hello">{colorScheme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ColorSchemeProvider colorScheme="dark">
        <Hello />
      </ColorSchemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^dark$/u);
  });

  it('uses the browser color scheme', async () => {
    defineMatchMedia('dark');

    const Hello = () => {
      const colorScheme = useColorScheme();
      return <div data-testid="hello">{colorScheme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ColorSchemeProvider>
        <Hello />
      </ColorSchemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^dark$/u);
  });

  it('uses the default color scheme', async () => {
    defineMatchMedia(undefined);

    const Hello = () => {
      const colorScheme = useColorScheme();
      return <div data-testid="hello">{colorScheme()}</div>;
    };

    const { getByTestId } = render(() => (
      <ColorSchemeProvider defaultColorScheme="dark">
        <Hello />
      </ColorSchemeProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^dark$/u);
  });

  it('changes the color scheme', async () => {
    defineMatchMedia('light');

    const Hello = () => {
      const colorScheme = useColorScheme();
      return <div data-testid="hello">{colorScheme()}</div>;
    };

    const { getByTestId } = render(() => {
      const [colorScheme, setColorScheme] = createSignal('light');
      return (
        <ColorSchemeProvider colorScheme={colorScheme()}>
          <Hello />
          <button data-testid="button" onClick={() => setColorScheme('dark')}>
            Dark
          </button>
        </ColorSchemeProvider>
      );
    });

    const hello = getByTestId('hello');
    const button = getByTestId('button');
    expect(hello).toHaveTextContent(/^light$/u);
    fireEvent.click(button);
    expect(hello).toHaveTextContent(/^dark$/u);
  });
});
