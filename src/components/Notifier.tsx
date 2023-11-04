import { For } from 'solid-js';
import { useColorScheme } from '../providers/color-scheme';
import { useNotifications } from '../providers/notification';
import { useStyles } from '../providers/theme';

import defaultStyles from './Notifier.module.scss';

/**
 * Notification container.
 */
const Notifier = () => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Notifier', defaultStyles);
  const [notifications, { removeNotification }] = useNotifications();

  return (
    <div class={styles(['container', colorScheme()])}>
      <For each={notifications()}>
        {(notification) => (
          <div
            class={styles('notification')}
            onClick={() => removeNotification(notification.id)}
          >
            {notification.message}
          </div>
        )}
      </For>
    </div>
  );
};

export default Notifier;
