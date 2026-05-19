import { useState } from 'react';
import { INK, PAPER, ACCENT, WBox, WPill, MonoText } from './components/WireKit';
import MemoryGame from './games/MemoryGame';
import WantedGame from './games/WantedGame';
import useWindowSize from './hooks/useWindowSize';
import useLocalStorage from './hooks/useLocalStorage';

const GAMES = {
  match: { title: 'MATCH', sub: 'flip · pair · finish', emoji: '🎴', Component: MemoryGame },
  wanted: { title: 'WANTED', sub: 'spot the suspect', emoji: '🤠', Component: WantedGame },
};

export default function App() {
  const [selected, setSelected] = useState(null);
  const { width } = useWindowSize();
  const [bestMatch] = useLocalStorage('eg:mem:best:Medium', null);
  const [bestWanted] = useLocalStorage('eg:wanted:best', 0);

  if (selected) {
    const G = GAMES[selected].Component;
    return <G title={GAMES[selected].title} onBack={() => setSelected(null)} />;
  }

  const isDesktop = width >= 880;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isDesktop ? (
        <DesktopHome onPick={setSelected} bestMatch={bestMatch} bestWanted={bestWanted} />
      ) : (
        <MobileHome onPick={setSelected} bestMatch={bestMatch} bestWanted={bestWanted} />
      )}
    </div>
  );
}

// ─── Mobile / Phone Home ───────────────────────────────────────────────
function MobileHome({ onPick, bestMatch, bestWanted }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 6px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>EMOJI GAMES</div>
        <WPill thick>🔥 streak {bestWanted ?? 0}</WPill>
      </div>
      <div style={{ padding: '4px 20px 12px', fontSize: 12, opacity: 0.7, letterSpacing: 2, fontFamily: 'var(--mono)' }}>
        ◆ PICK YOUR GAME ◆
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <FeaturedSlab game={GAMES.match} onClick={() => onPick('match')} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SquareTile game={GAMES.wanted} onClick={() => onPick('wanted')} tilt={0.4} />
          <LockedTile />
        </div>

        <WBox style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(0.2deg)' }}>
          <MonoText style={{ fontSize: 10, opacity: 0.7 }}>BEST</MonoText>
          <div style={{ display: 'flex', gap: 14 }}>
            <MonoText style={{ fontSize: 13, fontWeight: 700 }}>🎴 {bestMatch ?? '—'}</MonoText>
            <MonoText style={{ fontSize: 13, fontWeight: 700 }}>🤠 {bestWanted ?? 0}</MonoText>
          </div>
        </WBox>
      </div>
    </div>
  );
}

// ─── Desktop Home ──────────────────────────────────────────────────────
function DesktopHome({ onPick, bestMatch, bestWanted }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        background: PAPER,
        maxWidth: 1100,
        margin: '32px auto',
        width: 'calc(100% - 64px)',
        border: `2px solid ${INK}`,
        borderRadius: 12,
        boxShadow: `4px 4px 0 ${INK}22`,
        overflow: 'hidden',
        minHeight: 600,
      }}
    >
      <aside style={{ borderRight: `1.5px solid ${INK}`, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1.5, lineHeight: 1 }}>
          EMOJI<br />GAMES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <NavItem label="🎮 Play" active />
          <NavItem label="📊 Stats" />
          <NavItem label="⚙️ Settings" />
        </div>
        <div style={{ marginTop: 'auto' }}>
          <MonoText style={{ fontSize: 10, opacity: 0.5 }}>v0.4 · sketch</MonoText>
        </div>
      </aside>

      <main style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <MonoText style={{ fontSize: 12, opacity: 0.6, letterSpacing: 3 }}>◆ ARCADE ◆</MonoText>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, marginTop: 4 }}>pick your game.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <WPill thick>🔥 streak {bestWanted ?? 0}</WPill>
            <WPill thick>⏱ best {bestMatch ?? '—'}</WPill>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, flex: 1 }}>
          <FeaturedSlab game={GAMES.match} onClick={() => onPick('match')} size="large" />
          <SquareTile game={GAMES.wanted} onClick={() => onPick('wanted')} size="large" tilt={0.3} />
          <LockedTile size="large" />
        </div>

        <WBox style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>RECENT</MonoText>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['🎴 0:32', '🤠 12 hits', '🎴 0:51', '🤠 9 hits'].map((r, i) => (
              <WPill key={i} style={{ fontSize: 11 }}>{r}</WPill>
            ))}
          </div>
        </WBox>
      </main>
    </div>
  );
}

function NavItem({ label, active }) {
  return (
    <div
      style={{
        padding: '9px 12px',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        background: active ? ACCENT : 'transparent',
        color: active ? 'white' : INK,
        border: active ? `1.5px solid ${INK}` : '1.5px solid transparent',
        borderRadius: 8,
        cursor: 'pointer',
      }}
    >
      {label}
    </div>
  );
}

// ─── Cards ─────────────────────────────────────────────────────────────
function FeaturedSlab({ game, onClick, size = 'normal' }) {
  const big = size === 'large';
  const tilt = -0.6;
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        border: `2.5px solid ${INK}`,
        background: ACCENT,
        color: 'white',
        borderRadius: 10,
        padding: big ? 22 : 16,
        minHeight: big ? 240 : 130,
        textAlign: 'left',
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 5px 0 ${INK}`,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        animation: 'fadeInUp 0.4s ease both',
        overflow: 'hidden',
        width: '100%',
        fontFamily: 'inherit',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg) translateY(3px)`;
        e.currentTarget.style.boxShadow = `0 2px 0 ${INK}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
        e.currentTarget.style.boxShadow = `0 5px 0 ${INK}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
        e.currentTarget.style.boxShadow = `0 5px 0 ${INK}`;
      }}
    >
      <MonoText style={{ fontSize: 11, opacity: 0.9, letterSpacing: 2 }}>FEATURED</MonoText>
      <div style={{ fontSize: big ? 56 : 34, fontWeight: 900, lineHeight: 1, marginTop: 6, letterSpacing: -1 }}>
        {game.title}!
      </div>
      <div style={{ fontSize: big ? 14 : 12, marginTop: 8, opacity: 0.95 }}>{game.sub}</div>
      <div
        style={{
          position: 'absolute',
          right: big ? 18 : 12,
          bottom: big ? 14 : 8,
          fontSize: big ? 96 : 52,
          lineHeight: 1,
          filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.15))',
        }}
      >
        {game.emoji}
      </div>
      <div
        style={{
          position: 'absolute',
          right: big ? 18 : 8,
          top: big ? 18 : 8,
          border: '1.5px solid white',
          padding: big ? '5px 10px' : '3px 7px',
          fontSize: big ? 12 : 10,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        PLAY ▶
      </div>
    </button>
  );
}

function SquareTile({ game, onClick, tilt = 0, size = 'normal' }) {
  const big = size === 'large';
  return (
    <button
      onClick={onClick}
      style={{
        border: `2.5px solid ${INK}`,
        background: PAPER,
        color: INK,
        borderRadius: 10,
        padding: big ? 18 : 12,
        textAlign: 'center',
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 5px 0 ${INK}`,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        animation: 'fadeInUp 0.4s 0.05s ease both',
        cursor: 'pointer',
        width: '100%',
        fontFamily: 'inherit',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg) translateY(3px)`;
        e.currentTarget.style.boxShadow = `0 2px 0 ${INK}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
        e.currentTarget.style.boxShadow = `0 5px 0 ${INK}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
        e.currentTarget.style.boxShadow = `0 5px 0 ${INK}`;
      }}
    >
      <div style={{ fontSize: big ? 56 : 36 }}>{game.emoji}</div>
      <div style={{ fontSize: big ? 22 : 16, fontWeight: 900, marginTop: big ? 8 : 4, letterSpacing: 0.5 }}>
        {game.title}
      </div>
      <div style={{ fontSize: big ? 11 : 10, opacity: 0.6, marginTop: 2 }}>{game.sub}</div>
    </button>
  );
}

function LockedTile({ size = 'normal' }) {
  const big = size === 'large';
  return (
    <div
      style={{
        border: `2.5px solid ${INK}`,
        background: 'transparent',
        borderRadius: 10,
        padding: big ? 18 : 12,
        textAlign: 'center',
        opacity: 0.5,
        transform: 'rotate(-0.3deg)',
        boxShadow: `0 5px 0 ${INK}40`,
        animation: 'fadeInUp 0.4s 0.1s ease both',
      }}
    >
      <div style={{ fontSize: big ? 56 : 36 }}>🔒</div>
      <div style={{ fontSize: big ? 18 : 14, fontWeight: 900, marginTop: big ? 8 : 4 }}>???</div>
      <div style={{ fontSize: big ? 11 : 10, opacity: 0.7, marginTop: 2 }}>coming soon</div>
    </div>
  );
}
