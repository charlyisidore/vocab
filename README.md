# Vocab'

A TypeScript / [SolidJS](https://www.solidjs.com/) implementation of the [Lingo](<https://en.wikipedia.org/wiki/Lingo_(American_game_show)>) / [Motus](<https://fr.wikipedia.org/wiki/Motus_(jeu_t%C3%A9l%C3%A9vis%C3%A9)>) game.

Demo: [https://vocab.mulletsky.net/](https://vocab.mulletsky.net/).

This software generates static files that run 100% on the client side.
Therefore, it can be published as a static website on platforms such as Netlify.

Challenge and dictionary files must be generated beforehand by a program written in Rust.
More details in the [generator/](generator/README.md) folder.

## Installation

Install dependencies:

```bash
pnpm install
```

## Usage

Run the app in development mode:

```bash
pnpm run dev
```

Generate challenge and dictionary static files (requires [rustup](https://rustup.rs/)):

```bash
bash generate.sh
```

Build the app for production to the `dist` folder:

```bash
pnpm run build
```

## License

[AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html)
