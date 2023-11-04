import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { type ParentComponent } from 'solid-js';
import { ColorSchemeProvider } from '../providers/color-scheme';
import { ThemeProvider } from '../providers/theme';
import Keyboard from './Keyboard';

const qwerty = [
  'q w e r t y u i o p',
  'a s d f g h j k l',
  'Enter z x c v b n m Backspace',
];

/**
 * Define `window.matchMedia` mock function.
 */
function defineMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onChange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Define mock context providers.
 */
const Providers: ParentComponent = (props) => {
  const theme = {
    Keyboard: {
      container: 'Keyboard_container',
      a: 'Keyboard_a',
      b: 'Keyboard_b',
      empty: 'Keyboard_empty',
    },
  };

  return (
    <ColorSchemeProvider>
      <ThemeProvider theme={theme}>
        {/* prettier-ignore */}
        {props.children}
      </ThemeProvider>
    </ColorSchemeProvider>
  );
};

describe('<Keyboard>', () => {
  // eslint-disable-next-line vitest/no-hooks
  afterEach(cleanup);

  it('fires onKeyPress on virtual key click', async () => {
    defineMatchMedia();

    const onKeyPress = vi.fn((key) => key);

    const { getByRole } = render(() => (
      <Providers>
        <Keyboard layout={qwerty} onKeyPress={onKeyPress} />
      </Providers>
    ));

    const button = getByRole('button', { name: 'a' });
    fireEvent.click(button);
    expect(onKeyPress).toHaveBeenCalledWith('a');
  });

  it('fires onKeyPress on physical key down', async () => {
    defineMatchMedia();

    const onKeyPress = vi.fn((key) => key);

    render(() => (
      <Providers>
        <Keyboard layout={qwerty} onKeyPress={onKeyPress} />
      </Providers>
    ));

    fireEvent.keyDown(document, { key: 'A' });
    expect(onKeyPress).toHaveBeenCalledWith('a');
  });

  it('ignores onKeyPress on unknown key down', async () => {
    defineMatchMedia();

    const onKeyPress = vi.fn((key) => key);

    render(() => (
      <Providers>
        <Keyboard layout={qwerty} onKeyPress={onKeyPress} />
      </Providers>
    ));

    fireEvent.keyDown(document, { key: '_' });
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it('ignores onKeyPress on Ctrl or Meta key down', async () => {
    defineMatchMedia();

    const onKeyPress = vi.fn((key) => key);

    render(() => (
      <Providers>
        <Keyboard layout={qwerty} onKeyPress={onKeyPress} />
      </Providers>
    ));

    fireEvent.keyDown(document, { key: 'a', ctrlKey: true });
    fireEvent.keyDown(document, { key: 'a', metaKey: true });
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it('sets key state as string', async () => {
    defineMatchMedia();

    const { getByRole } = render(() => (
      <Providers>
        <Keyboard layout={qwerty} state={() => 'a'} />
      </Providers>
    ));

    const button = getByRole('button', { name: 'a' });
    expect(button).toHaveClass('Keyboard_a');
  });

  it('sets key state as array', async () => {
    defineMatchMedia();

    const { getByRole } = render(() => (
      <Providers>
        <Keyboard layout={qwerty} state={() => ['a', 'b']} />
      </Providers>
    ));

    const button = getByRole('button', { name: 'a' });
    expect(button).toHaveClass('Keyboard_a', 'Keyboard_b');
  });

  it('sets a custom number of columns', async () => {
    defineMatchMedia();

    const { container } = render(() => (
      <Providers>
        <Keyboard layout={qwerty} columns={9} />
      </Providers>
    ));

    const keyboard = container.querySelector('.Keyboard_container');
    expect(keyboard).toBeInTheDocument();
    const columns = (keyboard as HTMLElement).style.getPropertyValue(
      '--columns',
    );
    expect(columns).toBe('9');
  });

  it('uses an empty space', async () => {
    defineMatchMedia();

    const wideQwerty = [
      'q w e r t y u i o p',
      'a s d f g  h j k l', // between g and h
      'Enter z x c v b n m Backspace',
    ];

    const { container } = render(() => (
      <Providers>
        <Keyboard layout={wideQwerty} />
      </Providers>
    ));

    const emptyKeys = container.querySelectorAll('.Keyboard_empty');
    expect(emptyKeys).toHaveLength(1);
  });
});
