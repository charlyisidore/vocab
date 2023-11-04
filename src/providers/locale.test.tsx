import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { For, createSignal } from 'solid-js';
import {
  type Dictionary,
  LocaleProvider,
  createDictionary,
  useTranslate,
} from './locale';

describe('locale provider', () => {
  // eslint-disable-next-line vitest/no-hooks
  afterEach(cleanup);

  it('throws LocaleContext not found', async () => {
    expect(() =>
      render(() => {
        const translate = useTranslate();
        return <>{translate('hello')}</>;
      }),
    ).toThrow(/LocaleContext/u);
  });

  it('shows a string translation', async () => {
    const dictionary = createDictionary({
      hello: 'saluton',
    });

    const Hello = () => {
      const translate = useTranslate();
      return <div data-testid="hello">{translate('hello')}</div>;
    };

    const { getByTestId } = render(() => (
      <LocaleProvider dictionary={dictionary}>
        <Hello />
      </LocaleProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^saluton$/u);
  });

  it('shows a function translation', async () => {
    const dictionary = createDictionary({
      hello: ({ name }: { name: string }) => `saluton ${name}`,
    });

    const Hello = () => {
      const translate = useTranslate();
      return (
        <div data-testid="hello">{translate('hello', { name: 'mondo' })}</div>
      );
    };

    const { getByTestId } = render(() => (
      <LocaleProvider dictionary={dictionary}>
        <Hello />
      </LocaleProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^saluton mondo$/u);
  });

  it('shows a nested translation', async () => {
    const dictionary = createDictionary({
      button: {
        hello: 'saluton',
      },
    });

    const Hello = () => {
      const translate = useTranslate();
      return <div data-testid="hello">{translate('button.hello')}</div>;
    };

    const { getByTestId } = render(() => (
      <LocaleProvider dictionary={dictionary}>
        <Hello />
      </LocaleProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^saluton$/u);
  });

  it('shows the translation key when key is not found', async () => {
    const dictionary = createDictionary({});

    const Hello = () => {
      const translate = useTranslate();
      return <div data-testid="hello">{translate('hello')}</div>;
    };

    const { getByTestId } = render(() => (
      <LocaleProvider dictionary={dictionary}>
        <Hello />
      </LocaleProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^hello$/u);
  });

  it('shows the translation key when dictionary is not found', async () => {
    const Hello = () => {
      const translate = useTranslate();
      return <div data-testid="hello">{translate('hello')}</div>;
    };

    const { getByTestId } = render(() => (
      <LocaleProvider>
        <Hello />
      </LocaleProvider>
    ));

    const hello = getByTestId('hello');
    expect(hello).toHaveTextContent(/^hello$/u);
  });

  it('changes the language', async () => {
    const locales: Record<string, Dictionary> = {
      eo: createDictionary({
        hello: 'saluton',
      }),
      vo: createDictionary({
        hello: 'glidis',
      }),
    };

    const Hello = () => {
      const translate = useTranslate();
      return <div data-testid="hello">{translate('hello')}</div>;
    };

    const { getByTestId } = render(() => {
      const [language, setLanguage] = createSignal('eo');
      const handleChange = (event: Event) =>
        setLanguage((event.target as HTMLSelectElement).value);
      return (
        <LocaleProvider dictionary={locales[language()]}>
          <Hello />
          <select data-testid="select" onChange={handleChange}>
            <For each={Object.keys(locales)}>
              {(value) => (
                <option value={value} selected={value === language()}>
                  {value}
                </option>
              )}
            </For>
          </select>
        </LocaleProvider>
      );
    });

    const hello = getByTestId('hello');
    const select = getByTestId('select');
    expect(hello).toHaveTextContent(/^saluton$/u);
    fireEvent.change(select, { target: { value: 'vo' } });
    expect(hello).toHaveTextContent(/^glidis$/u);
  });
});
