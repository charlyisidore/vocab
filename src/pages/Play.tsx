import {
  Suspense,
  batch,
  createEffect,
  createResource,
  createSignal,
} from 'solid-js';
import { useRouteData } from '@solidjs/router';
import { useAppState } from '../AppState';
import { useColorScheme } from '../providers/color-scheme';
import { useTranslate } from '../providers/locale';
import { useNotify } from '../providers/notification';
import { useStyles } from '../providers/theme';
import {
  fetchDictionary,
  getBoardContent,
  getBoardState,
  getKeyboardState,
} from '../lib/game';
import { type PlayData } from './Play.data';
import Board from '../components/Board';
import Keyboard from '../components/Keyboard';
import Spinner from '../components/Spinner';

import defaultStyles from './Play.module.scss';

const tries = 6;

/**
 * Game page.
 */
const Play = () => {
  const challenge = useRouteData<typeof PlayData>();
  const app = useAppState();
  const colorScheme = useColorScheme();
  const styles = useStyles('Play', defaultStyles);
  const translate = useTranslate();
  const notify = useNotify();

  // Past guesses
  const [previousGuesses, setPreviousGuesses] = createSignal<string[]>([]);

  // Current guess
  const [currentGuess, setCurrentGuess] = createSignal('');

  // Dictionary of accepted words
  const [dictionary] = createResource(() => {
    const { solution } = challenge() ?? {};
    return solution ? `${solution.length}${solution[0]}` : undefined;
  }, fetchDictionary);

  // Text in board cells
  const boardContent = () =>
    getBoardContent(
      previousGuesses(),
      currentGuess(),
      challenge()?.solution ?? '',
    );

  // State of board cells (correct, present, ...)
  const boardState = () =>
    getBoardState(
      previousGuesses(),
      currentGuess(),
      challenge()?.solution ?? '',
    );

  const keyboardState = () =>
    getKeyboardState(previousGuesses(), challenge()?.solution ?? '');

  const isVictory = () => {
    const { solution } = challenge() ?? {};
    return solution && previousGuesses().includes(solution);
  };

  const isLoss = () => challenge() && previousGuesses().length >= tries;

  const isGameOver = () => isVictory() || isLoss();

  // Update the first letter of the guess when challenge changes
  createEffect(() => setCurrentGuess(challenge()?.solution[0] ?? ''));

  // Called when the user presses a key on the virtual or physical keyboard
  const handleKeyPress = (key: string) => {
    const { solution } = challenge() ?? {};
    if (!solution) {
      return;
    }

    if (isGameOver()) {
      return;
    }

    const guess = currentGuess();

    switch (key) {
      case 'Backspace':
        // The first letter cannot be removed
        if (guess.length > 1) {
          setCurrentGuess(guess.slice(0, -1));
        }
        break;
      case 'Enter':
        {
          // The current length must equal the solution length
          if (guess.length < solution.length) {
            notify(translate('game.tooShort'));
            break;
          }

          const previous = previousGuesses();

          // Victory
          if (guess === solution) {
            batch(() => {
              setPreviousGuesses([...previous, guess]);
              setCurrentGuess('');
            });
            break;
          }

          // Check if the word has already been tried
          if (previous.includes(guess)) {
            notify(translate('game.alreadyTried'));
            break;
          }

          // Check if the word is in the dictionary
          if (!dictionary()?.has(guess)) {
            notify(translate('game.notInDictionary'));
            break;
          }

          // Loss
          if (previous.length + 1 >= tries) {
            batch(() => {
              setPreviousGuesses([...previous, guess]);
              setCurrentGuess('');
            });
          }

          // Next round
          batch(() => {
            setPreviousGuesses([...previous, guess]);
            setCurrentGuess(solution[0]);
          });
        }
        break;
      default:
        // Add a letter when the user presses a letter key
        // and there are remaining cells
        if (key.length === 1 && guess.length < solution.length) {
          setCurrentGuess(`${guess}${key.toLowerCase()}`);
        }
        break;
    }
  };

  return (
    <div class={styles(['container', colorScheme()])}>
      <div
        class={styles('main')}
        style={{
          '--word-length': challenge()?.solution.length ?? 0,
        }}
      >
        <div class={styles('board')}>
          <Suspense fallback={<Spinner />}>
            <Board
              rows={tries}
              columns={challenge()?.solution.length ?? 0}
              content={(i, j) => boardContent()?.[i]?.[j]}
              state={(i, j) => boardState()?.[i]?.[j]}
            />
          </Suspense>
        </div>
      </div>
      <div class={styles('footer')}>
        <Keyboard
          layout={app.keyboardLayout ?? []}
          state={(key) => keyboardState()?.[key]}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default Play;
