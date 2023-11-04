import { useNavigate } from '@solidjs/router';
import { useColorScheme } from '../providers/color-scheme';
import { useTranslate } from '../providers/locale';
import { useStyles } from '../providers/theme';
import Button from '../components/Button';

import defaultStyles from './Home.module.scss';

/**
 * Home page.
 */
const Home = () => {
  const colorScheme = useColorScheme();
  const navigate = useNavigate();
  const styles = useStyles('Home', defaultStyles);
  const translate = useTranslate();

  return (
    <div class={styles(['container', colorScheme()])}>
      <Button onClick={() => navigate('/play/daily')}>
        {translate('home.dailyChallenge')}
      </Button>
      <Button onClick={() => navigate('/play/random')}>
        {translate('home.randomChallenge')}
      </Button>
      <Button onClick={() => navigate('/settings')}>
        {translate('home.settings')}
      </Button>
      <Button onClick={() => navigate('/help')}>
        {translate('home.help')}
      </Button>
    </div>
  );
};

export default Home;
