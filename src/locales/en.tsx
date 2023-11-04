import { JSX } from 'solid-js';

export default {
  home: {
    play: 'Play',
    dailyChallenge: 'Daily word',
    randomChallenge: 'Random word',
    settings: 'Settings',
    help: 'Help',
  },
  game: {
    tooShort: 'This word is too short',
    notInDictionary: 'This word is not in the dictionary',
    alreadyTried: 'This word has already been tried',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    keyboard: 'Keyboard',
    colorScheme: 'Mode',
    theme: 'Theme',
  },
  help: {
    title: 'How to play',
    goal: 'Guess the word in 6 tries.',
    firstLetter: 'A guess must begin with the given letter.',
    inDictionary: 'A guess must be in the dictionary.',
    correctLetter: (props: { letter: JSX.Element }) => (
      <>A {props.letter} letter is in the correct spot.</>
    ),
    presentLetter: (props: { letter: JSX.Element }) => (
      <>A {props.letter} letter is in the word but wrongly placed.</>
    ),
    absentLetter: (props: { letter: JSX.Element }) => (
      <>A {props.letter} letter is not in the word.</>
    ),
  },
};
