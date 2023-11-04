import { describe, expect, it } from 'vitest';
import {
  getBoardContent,
  getBoardState,
  getCurrentGuessState,
  getHint,
  getKeyboardState,
  getPreviousGuessState,
} from './game';

describe('game library', () => {
  it('gets hint from guesses', async () => {
    const solution = 'a.b.';
    const guesses = ['aaaa', 'bbbb'];
    const hints = getHint(guesses, solution);
    expect(hints).toBe('a b');
  });

  it('marks correct letters for previous guess', async () => {
    const solution = 'aa.';
    const guess = 'aaa';
    const state = getPreviousGuessState(guess, solution);
    expect(state).toStrictEqual(['correct', 'correct', 'absent']);
  });

  it('marks present letters for previous guess', async () => {
    const solution = 'abb';
    const guess = 'baa';
    const state = getPreviousGuessState(guess, solution);
    expect(state).toStrictEqual(['present', 'present', 'absent']);
  });

  it('marks correct and present letters for previous guess', async () => {
    const solution = 'a.ba.b';
    const guess = 'aaabbb';
    const state = getPreviousGuessState(guess, solution);
    expect(state).toStrictEqual([
      'correct',
      'present',
      'absent',
      'present',
      'absent',
      'correct',
    ]);
  });

  it('marks current guess with hints', async () => {
    const previousGuesses: string[] = ['adddd'];
    const solution = 'abcde';
    const currentGuess = 'a';
    const state = getCurrentGuessState(previousGuesses, currentGuess, solution);
    expect(state).toStrictEqual([
      'before-cursor',
      'at-cursor',
      'after-cursor',
      'after-cursor hint',
      'after-cursor',
    ]);
  });

  it('marks current guess without hints', async () => {
    const previousGuesses: string[] = ['adddd'];
    const solution = 'abcde';
    const currentGuess = 'ac';
    const state = getCurrentGuessState(previousGuesses, currentGuess, solution);
    expect(state).toStrictEqual([
      'before-cursor',
      'before-cursor',
      'at-cursor',
      'after-cursor',
      'after-cursor',
    ]);
  });

  it('gets board content with no previous guess', async () => {
    const previousGuesses: string[] = [];
    const solution = 'abc';
    const currentGuess = 'ab';
    const state = getBoardContent(previousGuesses, currentGuess, solution);
    expect(state).toStrictEqual(['ab']);
  });

  it('gets board content with hints', async () => {
    const previousGuesses: string[] = ['accc'];
    const solution = 'abcd';
    const currentGuess = 'a';
    const state = getBoardContent(previousGuesses, currentGuess, solution);
    expect(state).toStrictEqual(['accc', 'a c']);
  });

  it('gets board state', async () => {
    const previousGuesses: string[] = ['accc'];
    const solution = 'abcd';
    const currentGuess = 'ac';
    const state = getBoardState(previousGuesses, currentGuess, solution);
    expect(state).toStrictEqual([
      ['correct', 'absent', 'correct', 'absent'],
      ['before-cursor', 'before-cursor', 'at-cursor', 'after-cursor'],
    ]);
  });

  it('gets keyboard state', async () => {
    const previousGuesses: string[] = ['abcd'];
    const solution = 'abxc';
    const state = getKeyboardState(previousGuesses, solution);
    expect(state).toStrictEqual({
      a: 'correct',
      b: 'correct',
      c: 'present',
      d: 'absent',
    });
  });
});
