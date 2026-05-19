# Emoji Games

A collection of fast, casual emoji mini-games with an arcade / hand-drawn aesthetic.

## Games
- **Match** — flip cards, find every pair (Easy / Medium / Hard)
- **Wanted** — spot the target emoji as rounds get faster

## Run
```bash
npm install
npm run dev
```
Dev server starts in under a second (Vite).

## Build / deploy
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
npm run deploy     # publishes dist/ to the gh-pages branch
```

## Structure
```
src/
  App.jsx             # arcade home (mobile + desktop variants) and routing
  index.jsx           # React entry
  index.css           # tokens (paper, ink, accent) + animations
  components/
    WireKit.jsx       # WBox, WPill, MonoText primitives (paper/ink/accent)
    GameShell.jsx     # exit pill · mono timer · accent score pill
    Confetti.jsx
  games/
    MemoryGame.jsx
    WantedGame.jsx
  hooks/
    useLocalStorage.js
    useWindowSize.js
  data/
    emojis.js
```

## Design system
- **Palette:** paper `#faf6ee` on `#efe9dc` background, ink `#1f1d1a`, accent `#ff6b3d`
- **Fonts:** Kalam (handwritten) for body, JetBrains Mono for stats/timers, Inter as neutral fallback
- **Surfaces:** 2-2.5 px ink borders, 3D bottom shadow (`0 5px 0 ink`), slight rotations (±0.6°) for a hand-drawn feel
- **Background:** tiny ink dot grid (16 px spacing) on warm off-white

No CSS framework or UI library — everything is plain styled divs with CSS variables.
