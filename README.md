# Emoji Games v2

A redesigned collection of fast, casual emoji mini-games. Same four games as v1, rebuilt with a cleaner component structure, a real MUI theme (light/dark), persistent best scores, and improved mobile UX.

## Games
- **Memory Match** — flip cards, find pairs (Easy / Medium / Hard)
- **Find the Wanted** — spot the target emoji before time runs out

## Run
```bash
npm install
npm run dev
```
Dev server starts in well under a second (Vite).

## Build / deploy
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
npm run deploy     # gh-pages -d dist
```

## Structure
```
src/
  App.js              # home + theme + routing
  theme.js            # light/dark MUI themes
  components/         # GameShell, GameCard, Confetti
  games/              # GuessGame, MemoryGame, WantedGame, SortGame
  hooks/              # useLocalStorage, useWindowSize
  data/               # puzzles + emoji categories
```

## Improvements over v1
- Proper `ThemeProvider` with dark mode toggle (persisted)
- Best scores stored in localStorage per game
- Bug fixes: removed broken `variant={{ xs, sm }}` props, replaced direct `window.innerWidth` reads with a `useWindowSize` hook, fixed Memory's effect re-running unnecessarily
- 3D flip animation on memory cards
- Confetti on big wins
- Difficulty selector for Memory
- Keyboard support (Enter/Space) on home cards and emoji picks
- Modular files instead of one mega `App.js`
