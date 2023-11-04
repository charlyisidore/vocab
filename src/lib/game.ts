import { todayISOString } from './date';
import { fetchLines } from './fetch';

/**
 * Challenge data.
 */
export type Challenge = {
  id: string;
  solution: string;
};

/**
 * Fetch a challenge given its ID.
 *
 * @param id ID of the challenge.
 *
 * @returns Challenge data.
 */
export async function fetchChallenge(id: string): Promise<Challenge> {
  const response = await fetch(`/challenge/${id}.txt`);
  const solution = (await response.text()).trim();
  const challenge = { id, solution };
  if (import.meta.env.DEV) {
    console.log(`fetchChallenge: ${JSON.stringify(challenge)}`);
  }
  return challenge;
}

/**
 * Fetch today's challenge.
 *
 * @returns Challenge data.
 */
export async function fetchDailyChallenge(): Promise<Challenge> {
  const today = todayISOString();
  return fetchChallenge(today);
}

/**
 * Fetch a random challenge.
 *
 * @returns Challenge data.
 */
export async function fetchRandomChallenge(): Promise<Challenge> {
  const response = await fetch(`/challenge-count.txt`);
  const count = Number((await response.text()).trim());
  const index = 1 + Math.floor(Math.random() * count);
  return fetchChallenge(index.toString());
}

/**
 * Fetch a dictionary given its ID.
 *
 * The dictionary file must be compressed with a front coding algorithm.
 *
 * @param id The word length and the first letter concatenated (e.g. `6v`).
 *
 * @returns List of words in the dictionary.
 */
export async function fetchDictionary(id: string): Promise<Set<string>> {
  const [, lengthStr, first] = id.match(/^([0-9]+)([a-z])$/u) ?? [];

  if (!lengthStr || !first) {
    throw new Error('Invalid dictionary key');
  }

  const length = Number(lengthStr);
  const dictionary = new Set<string>();

  let word = first;
  for await (const line of fetchLines(`/dictionary/${id}.txt`)) {
    const suffix = line.trim();
    const prefix = word.substring(0, length - suffix.length);
    word = `${prefix}${suffix}`;
    dictionary.add(word);
  }

  return dictionary;
}

/**
 * Get correct letters found from guesses.
 *
 * @param guesses Guesses.
 * @param solution Solution.
 *
 * @returns String containing the correct letters found from guesses.
 */
export function getHint(guesses: string[], solution: string) {
  return solution
    ?.split('')
    .map((letter, j) =>
      guesses.map((guess) => guess[j]).includes(letter) ? letter : ' ',
    )
    .join('')
    .trimEnd();
}

/**
 * Get the content of the board given previous and current guesses.
 *
 * @param previousGuesses Previous guesses.
 * @param currentGuess Current guess.
 * @param solution Solution.
 *
 * @returns Content of the board.
 */
export function getBoardContent(
  previousGuesses: string[],
  currentGuess: string,
  solution: string,
): string[] {
  return [
    ...previousGuesses,
    currentGuess.length === 1
      ? getHint([...previousGuesses, currentGuess], solution)
      : currentGuess,
  ];
}

/**
 * Get the state of a previous guess w.r.t. the solution.
 *
 * This function determines the color of the board cells for previous guesses.
 *
 * @param guess Guess to compare with the solution.
 * @param solution Solution.
 *
 * @returns Array of states (`correct`, `present`, `absent`).
 */
export function getPreviousGuessState(
  guess: string,
  solution: string,
): string[] {
  // Count the number of occurrences of each misplaced letter
  const presentCount = solution
    .split('') //
    .reduce(
      (result, letter, i) => ({
        ...result,
        [letter]: (letter === guess[i] ? 0 : 1) + (result[letter] ?? 0),
      }),
      {} as Record<string, number>,
    );

  return guess
    .split('') //
    .map((letter, i) => {
      if (letter === solution[i]) {
        return 'correct';
      }
      if (!(letter in presentCount) || presentCount[letter] === 0) {
        return 'absent';
      }
      presentCount[letter] -= 1;
      return 'present';
    });
}

/**
 * Get the state of the current guess.
 *
 * This function determines the color of the board cells for the current guess.
 *
 * @param previousGuesses Previous guesses.
 * @param currentGuess Current guess.
 * @param solution Solution.
 *
 * @returns Array of states (`before-cursor`, `at-cursor`, `after-cursor`, ...).
 */
export function getCurrentGuessState(
  previousGuesses: string[],
  currentGuess: string,
  solution: string,
): string[] {
  const n = currentGuess.length;
  if (n === 0) {
    return [];
  }
  if (n > 1) {
    return Array(solution.length) //
      .fill('before-cursor', 0, n)
      .fill('at-cursor', n, n + 1)
      .fill('after-cursor', n + 1);
  }
  // Mark some cells as hints if previous guesses contain correct letters
  return solution
    .split('') //
    .map((letter, i) => {
      if (i < n) {
        return 'before-cursor';
      }
      const isHint = [...previousGuesses, currentGuess]
        .map((guess) => guess[i])
        .includes(letter);
      return [
        i === n ? 'at-cursor' : 'after-cursor',
        isHint ? 'hint' : undefined,
      ]
        .join(' ')
        .trim();
    });
}

/**
 * Get the state of the board given previous and current guesses.
 *
 * @param previousGuesses Previous guesses.
 * @param currentGuess Current guess.
 * @param solution Solution.
 *
 * @returns Array of states.
 */
export function getBoardState(
  previousGuesses: string[],
  currentGuess: string,
  solution: string,
): string[][] {
  return [
    ...previousGuesses.map((guess) => getPreviousGuessState(guess, solution)),
    getCurrentGuessState(previousGuesses, currentGuess, solution),
  ];
}

/**
 * Get the state of the keyboard given previous guesses.
 *
 * @param previousGuesses Previous guesses.
 * @param solution Solution.
 *
 * @returns Object mapping keys to states.
 */
export function getKeyboardState(
  previousGuesses: string[],
  solution: string,
): Record<string, string> {
  return previousGuesses //
    .map((guess) => {
      const state = getPreviousGuessState(guess, solution);
      return guess.split('').map((letter, i) => [letter, state[i]]);
    })
    .flat()
    .reduce(
      (result, [letter, state]) => ({
        ...result,
        [letter]: (() => {
          if (result[letter] === 'correct' || state === 'correct') {
            return 'correct';
          }
          if (result[letter] === 'present' || state === 'present') {
            return 'present';
          }
          return 'absent';
        })(),
      }),
      {} as Record<string, string>,
    );
}
