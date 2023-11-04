import {
  type Accessor,
  type ParentComponent,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from 'solid-js';

/**
 * Notification data structure.
 */
export type Notification = {
  id: number;
  message: string;
  timeout: ReturnType<typeof setTimeout>;
};

/**
 * Notification context.
 */
const NotificationContext = createContext<
  [
    Accessor<Notification[]>,
    {
      addNotification: (message: string) => number;
      removeNotification: (id: number) => boolean;
      clearNotifications: () => void;
    },
  ]
>();

/**
 * Return an accessor and actions for the notifications.
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('NotificationContext not found');
  }
  return context;
}

/**
 * Return a function that creates notifications.
 */
export function useNotify() {
  const [, { addNotification }] = useNotifications();
  return addNotification;
}

/**
 * Provide a notification context.
 *
 * @prop {number} timeout Duration in ms before closing a notification.
 */
export const NotificationProvider: ParentComponent<{
  timeout: number;
}> = (props) => {
  // Store notifications in a map for easy retrieval
  const [notificationMap, setNotificationMap] = createSignal<
    Record<number, Notification>
  >({});

  // Count notification total to assign them unique IDs
  const [notificationCount, setNotificationCount] = createSignal<number>(0);

  // Remove a notification by ID
  const removeNotification = (id: number): boolean => {
    const map = notificationMap();
    if (!(id in map)) {
      return false;
    }

    const { timeout } = map[id];
    clearTimeout(timeout);

    // Use spread operator to trigger re-render
    setNotificationMap((map) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...result } = map;
      return result;
    });

    return true;
  };

  // Add a notification
  const addNotification = (message: string): number => {
    // Increment the total count and use it as the ID
    const id = notificationCount() + 1;
    setNotificationCount(id);

    const notification: Notification = {
      id,
      message,
      timeout: setTimeout(() => removeNotification(id), props.timeout),
    };

    // Use spread operator to trigger re-render
    setNotificationMap((map) => ({
      ...map,
      [id]: notification,
    }));

    return id;
  };

  // Remove all notifications
  const clearNotifications = () => setNotificationMap({});

  // Transform a map to an array
  const notifications = createMemo(() => Object.values(notificationMap()));

  return (
    <NotificationContext.Provider
      value={[
        notifications,
        { addNotification, removeNotification, clearNotifications },
      ]}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};
