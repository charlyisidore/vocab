import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import {
  NotificationProvider,
  useNotifications,
  useNotify,
} from './notification';

vi.useFakeTimers();

describe('theme provider', () => {
  // eslint-disable-next-line vitest/no-hooks
  afterEach(cleanup);

  it('throws NotificationContext not found', async () => {
    expect(() =>
      render(() => {
        const [notifications] = useNotifications();
        return <>{notifications().length}</>;
      }),
    ).toThrow(/NotificationContext/u);
  });

  it('creates a notification', async () => {
    const Hello = () => {
      const notify = useNotify();
      const [notifications] = useNotifications();
      return (
        <>
          <button data-testid="notify" onClick={() => notify('world')}>
            Notify
          </button>
          <div data-testid="hello">
            <For each={notifications()}>
              {({ message }) => <div>{message}</div>}
            </For>
          </div>
        </>
      );
    };

    const { getByTestId } = render(() => (
      <NotificationProvider timeout={5000}>
        <Hello />
      </NotificationProvider>
    ));

    const notify = getByTestId('notify');
    const hello = getByTestId('hello');
    fireEvent.click(notify);
    expect(hello).toContainHTML('<div>world</div>');
  });

  it('removes a notification', async () => {
    const Hello = () => {
      const notify = useNotify();
      const [notifications, { removeNotification }] = useNotifications();
      return (
        <>
          <button data-testid="notify" onClick={() => notify('world')}>
            Notify
          </button>
          <div data-testid="hello">
            <For each={notifications()}>
              {({ id, message }) => (
                <div onClick={() => removeNotification(id)}>{message}</div>
              )}
            </For>
          </div>
        </>
      );
    };

    const { getByTestId, getByText } = render(() => (
      <NotificationProvider timeout={5000}>
        <Hello />
      </NotificationProvider>
    ));

    const notify = getByTestId('notify');
    const hello = getByTestId('hello');
    fireEvent.click(notify);
    expect(hello).toContainHTML('<div>world</div>');
    const notification = getByText('world');
    fireEvent.click(notification);
    expect(hello).toBeEmptyDOMElement();
  });

  it('removes a notification after timeout', async () => {
    const Hello = () => {
      const notify = useNotify();
      const [notifications] = useNotifications();
      return (
        <>
          <button data-testid="notify" onClick={() => notify('world')}>
            Notify
          </button>
          <div data-testid="hello">
            <For each={notifications()}>
              {({ message }) => <div>{message}</div>}
            </For>
          </div>
        </>
      );
    };

    const { getByTestId } = render(() => (
      <NotificationProvider timeout={5000}>
        <Hello />
      </NotificationProvider>
    ));

    const notify = getByTestId('notify');
    const hello = getByTestId('hello');
    fireEvent.click(notify);
    expect(hello).toContainHTML('<div>world</div>');
    vi.advanceTimersByTime(5000);
    expect(hello).toBeEmptyDOMElement();
  });

  it('clears notifications', async () => {
    const Hello = () => {
      const notify = useNotify();
      const [notifications, { clearNotifications }] = useNotifications();
      return (
        <>
          <button data-testid="notify" onClick={() => notify('world')}>
            Notify
          </button>
          <button data-testid="clear" onClick={() => clearNotifications()}>
            Clear
          </button>
          <div data-testid="hello">
            <For each={notifications()}>
              {({ message }) => <div>{message}</div>}
            </For>
          </div>
        </>
      );
    };

    const { getByTestId } = render(() => (
      <NotificationProvider timeout={5000}>
        <Hello />
      </NotificationProvider>
    ));

    const notify = getByTestId('notify');
    const clear = getByTestId('clear');
    const hello = getByTestId('hello');
    fireEvent.click(notify);
    expect(hello).toContainHTML('<div>world</div>');
    fireEvent.click(clear);
    expect(hello).toBeEmptyDOMElement();
  });
});
