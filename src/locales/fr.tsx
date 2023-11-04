import { JSX } from 'solid-js';

export default {
  home: {
    play: 'Jouer',
    dailyChallenge: 'Mot du jour',
    randomChallenge: 'Mot aléatoire',
    settings: 'Paramètres',
    help: 'Aide',
  },
  game: {
    tooShort: 'Ce mot est trop court',
    notInDictionary: 'Ce mot est absent du dictionnaire',
    alreadyTried: 'Ce mot a déjà été essayé',
  },
  settings: {
    title: 'Paramètres',
    language: 'Langue',
    keyboard: 'Clavier',
    colorScheme: 'Mode',
    theme: 'Thème',
  },
  help: {
    title: 'Règles du jeu',
    goal: 'Devinez le mot en 6 essais.',
    firstLetter: 'Le mot doit débuter par la lettre donnée.',
    inDictionary: 'Le mot doit appartenir au dictionnaire.',
    correctLetter: (props: { letter: JSX.Element }) => (
      <>Une lettre {props.letter} est bien placée.</>
    ),
    presentLetter: (props: { letter: JSX.Element }) => (
      <>Une lettre {props.letter} est présente mais mal placée.</>
    ),
    absentLetter: (props: { letter: JSX.Element }) => (
      <>Une lettre {props.letter} est absente du mot.</>
    ),
  },
};
