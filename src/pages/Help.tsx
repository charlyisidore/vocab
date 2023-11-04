import { useColorScheme } from '../providers/color-scheme';
import { useTranslate } from '../providers/locale';
import { useStyles } from '../providers/theme';
import { BoardCell } from '../components/Board';

import defaultStyles from './Help.module.scss';

/**
 * Help page.
 */
const Help = () => {
  const colorScheme = useColorScheme();
  const styles = useStyles('Help', defaultStyles);
  const translate = useTranslate();

  const letter = 'v';

  const correct = (
    <span style={{ display: 'inline-block' }}>
      <BoardCell state="correct">{letter}</BoardCell>
    </span>
  );

  const present = (
    <span style={{ display: 'inline-block' }}>
      <BoardCell state="present">{letter}</BoardCell>
    </span>
  );

  const absent = (
    <span style={{ display: 'inline-block' }}>
      <BoardCell state="absent">{letter}</BoardCell>
    </span>
  );

  return (
    <div class={styles(['container', colorScheme()])}>
      <div class={styles('header')}>{translate('help.title')}</div>
      <div class={styles('main')}>
        <div class={styles('item')}>{translate('help.goal')}</div>
        <div class={styles('item')}>{translate('help.firstLetter')}</div>
        <div class={styles('item')}>{translate('help.inDictionary')}</div>
        <div class={styles('item')}>
          {translate('help.correctLetter', { letter: correct })}
        </div>
        <div class={styles('item')}>
          {translate('help.presentLetter', { letter: present })}
        </div>
        <div class={styles('item')}>
          {translate('help.absentLetter', { letter: absent })}
        </div>
      </div>
    </div>
  );
};

export default Help;
