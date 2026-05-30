import { useState } from 'react';
import { INK, PAPER, ACCENT, WBox, WPill, MonoText } from './components/WireKit';
import MemoryGame from './games/MemoryGame';
import WantedGame from './games/WantedGame';
import EchoGame from './games/EchoGame';
import DodgeGame from './games/DodgeGame';
import useWindowSize from './hooks/useWindowSize';
import useLocalStorage from './hooks/useLocalStorage';
import useAccent, { DEFAULT_ACCENT } from './hooks/useAccent';

const GAMES = {
  match:  { title: 'MATCH',  sub: 'flip · pair · finish',     emoji: '🎴', Component: MemoryGame },
  wanted: { title: 'WANTED', sub: 'spot the suspect',          emoji: '🤠', Component: WantedGame },
  echo:   { title: 'ECHO',   sub: 'repeat the sequence',       emoji: '🔁', Component: EchoGame },
  dodge:  { title: 'DODGE',  sub: "don't get hit",             emoji: '🚧', Component: DodgeGame },
};
const GAME_IDS = ['match', 'wanted', 'echo', 'dodge'];

const NAV = [
  { id: 'play', label: 'Play', icon: '🎮' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  // Initialize accent (writes CSS var)
  useAccent();

  const [view, setView] = useState('play'); // 'play' | 'stats' | 'settings'
  const [playing, setPlaying] = useState(null); // game id when in-game
  const [featuredId, setFeaturedId] = useState('match');
  const { width } = useWindowSize();
  const isDesktop = width >= 880;

  if (playing) {
    const G = GAMES[playing].Component;
    return <G title={GAMES[playing].title} onBack={() => setPlaying(null)} />;
  }

  const handleTilePick = (id) => {
    if (id === featuredId) setPlaying(id);
    else setFeaturedId(id);
  };

  const content = (
    <>
      {view === 'play' && <PlayView featuredId={featuredId} onPick={handleTilePick} isDesktop={isDesktop} />}
      {view === 'stats' && <StatsView isDesktop={isDesktop} />}
      {view === 'settings' && <SettingsView />}
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isDesktop ? (
        <DesktopShell view={view} onView={setView}>{content}</DesktopShell>
      ) : (
        <MobileShell view={view} onView={setView}>{content}</MobileShell>
      )}
    </div>
  );
}

// ─── Shells ────────────────────────────────────────────────────────────
function DesktopShell({ view, onView, children }) {
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
          {NAV.map((n) => (
            <NavItem
              key={n.id}
              label={`${n.icon} ${n.label}`}
              active={view === n.id}
              onClick={() => onView(n.id)}
            />
          ))}
        </div>
      </aside>
      <main style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22, minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}

function MobileShell({ view, onView, children }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', paddingBottom: 76 }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: PAPER,
          borderTop: `1.5px solid ${INK}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 14px',
          zIndex: 50,
        }}
      >
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onView(n.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                fontSize: 11,
                color: INK,
                opacity: active ? 1 : 0.5,
                fontWeight: active ? 700 : 400,
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 18 }}>{n.icon}</div>
              {n.label}
              {active && <div style={{ width: 14, height: 2, background: ACCENT, marginTop: 1, borderRadius: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 12px',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        background: active ? ACCENT : 'transparent',
        color: active ? 'white' : INK,
        border: active ? `1.5px solid ${INK}` : '1.5px solid transparent',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ─── Play View ─────────────────────────────────────────────────────────
// Stable-slot layout: games keep their position; the selected one expands,
// the rest shrink to the compact size. Slot order: [match, wanted, locked].
function PlayView({ featuredId, onPick, isDesktop }) {
  const [bestMatch] = useLocalStorage('eg:mem:best:Medium', null);
  const [bestWanted] = useLocalStorage('eg:wanted:best', 0);
  const [bestEcho] = useLocalStorage('eg:echo:best', 0);
  const [bestDodge] = useLocalStorage('eg:dodge:best', 0);
  const COMPACT_TILTS = { match: -0.4, wanted: 0.3, echo: -0.3, dodge: 0.4 };

  const slots = GAME_IDS.map((id) => ({ kind: 'game', id }));

  const renderSlot = (slot, opts) => {
    const isFeatured = slot.id === featuredId;
    const game = GAMES[slot.id];
    if (isFeatured) {
      return <FeaturedSlab game={game} onClick={() => onPick(slot.id)} size={opts.featuredSize} />;
    }
    return (
      <SquareTile
        game={game}
        onClick={() => onPick(slot.id)}
        size={opts.compactSize}
        tilt={opts.compactTiltFor(slot.id)}
      />
    );
  };

  if (isDesktop) {
    const columns = slots.map((s) => (s.kind === 'game' && s.id === featuredId ? '2fr' : '1fr')).join(' ');
    return (
      <>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns,
            gap: 16,
            flex: 1,
            transition: 'grid-template-columns 0.32s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          {slots.map((slot, i) => (
            <div key={slot.id ?? `slot-${i}`} style={{ minWidth: 0, display: 'flex' }}>
              {renderSlot(slot, {
                featuredSize: 'large',
                compactSize: 'large',
                compactTiltFor: (id) => COMPACT_TILTS[id] ?? 0,
              })}
            </div>
          ))}
        </div>
        <WBox style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>HINT</MonoText>
          <MonoText style={{ fontSize: 11, opacity: 0.6 }}>tap a game once to feature it · tap again to play</MonoText>
        </WBox>
      </>
    );
  }

  // Mobile: vertical stack with stable slots; selected row is tall, others compact rows.
  const rows = slots.map((s) => (s.kind === 'game' && s.id === featuredId ? 'auto' : 'auto')).join(' ');
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 6px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>EMOJI GAMES</div>
        <WPill thick>🔥 streak {bestWanted ?? 0}</WPill>
      </div>
      <div style={{ padding: '4px 20px 12px', fontSize: 12, opacity: 0.7, letterSpacing: 2, fontFamily: 'var(--mono)' }}>
        ◆ PICK YOUR GAME ◆
      </div>
      <div
        style={{
          padding: 20,
          display: 'grid',
          gridTemplateRows: rows,
          gap: 14,
          flex: 1,
        }}
      >
        {slots.map((slot, i) => (
          <div key={slot.id ?? `slot-${i}`}>
            {renderSlot(slot, {
              featuredSize: 'normal',
              compactSize: 'row',
              compactTiltFor: () => (i % 2 ? -0.3 : 0.3),
            })}
          </div>
        ))}
        <WBox style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(0.2deg)', flexWrap: 'wrap', gap: 6 }}>
          <MonoText style={{ fontSize: 10, opacity: 0.7 }}>BEST</MonoText>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <MonoText style={{ fontSize: 12, fontWeight: 700 }}>🎴 {bestMatch ?? '—'}</MonoText>
            <MonoText style={{ fontSize: 12, fontWeight: 700 }}>🤠 {bestWanted ?? 0}</MonoText>
            <MonoText style={{ fontSize: 12, fontWeight: 700 }}>🔁 {bestEcho ?? 0}</MonoText>
            <MonoText style={{ fontSize: 12, fontWeight: 700 }}>🚧 {bestDodge ? (bestDodge / 1000).toFixed(1) + 's' : '0s'}</MonoText>
          </div>
        </WBox>
      </div>
    </>
  );
}

// ─── Stats View ────────────────────────────────────────────────────────
const MEM_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function StatsView({ isDesktop }) {
  const [easy] = useLocalStorage('eg:mem:best:Easy', null);
  const [medium] = useLocalStorage('eg:mem:best:Medium', null);
  const [hard] = useLocalStorage('eg:mem:best:Hard', null);
  const [bestWanted] = useLocalStorage('eg:wanted:best', 0);
  const [bestEcho] = useLocalStorage('eg:echo:best', 0);
  const [bestDodge] = useLocalStorage('eg:dodge:best', 0);
  const matchBests = { Easy: easy, Medium: medium, Hard: hard };

  return (
    <div style={{ padding: isDesktop ? 0 : '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <MonoText style={{ fontSize: 12, opacity: 0.6, letterSpacing: 3 }}>◆ STATS ◆</MonoText>
        <div style={{ fontSize: isDesktop ? 36 : 26, fontWeight: 900, lineHeight: 1, marginTop: 4 }}>your runs.</div>
      </div>

      <StatGroup title="🎴 MATCH · best moves">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {MEM_DIFFICULTIES.map((d, i) => (
            <WBox key={d} thick style={{ padding: 14, textAlign: 'center', transform: `rotate(${(i - 1) * 0.4}deg)`, boxShadow: `0 4px 0 ${INK}` }}>
              <MonoText style={{ fontSize: 10, opacity: 0.6, letterSpacing: 2 }}>{d.toUpperCase()}</MonoText>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 2 }}>
                {matchBests[d] != null ? matchBests[d] : <span style={{ opacity: 0.35 }}>—</span>}
              </div>
              <MonoText style={{ fontSize: 9, opacity: 0.5 }}>{matchBests[d] != null ? 'moves' : 'not played'}</MonoText>
            </WBox>
          ))}
        </div>
      </StatGroup>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 14 }}>
        <StatGroup title="🤠 WANTED · best round">
          <WBox thick style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(-0.3deg)', boxShadow: `0 4px 0 ${INK}` }}>
            <MonoText style={{ fontSize: 11, opacity: 0.7 }}>HIGHEST</MonoText>
            <div style={{ fontSize: 30, fontWeight: 900 }}>{bestWanted || <span style={{ opacity: 0.35 }}>0</span>}</div>
          </WBox>
        </StatGroup>

        <StatGroup title="🔁 ECHO · best round">
          <WBox thick style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(0.3deg)', boxShadow: `0 4px 0 ${INK}` }}>
            <MonoText style={{ fontSize: 11, opacity: 0.7 }}>HIGHEST</MonoText>
            <div style={{ fontSize: 30, fontWeight: 900 }}>{bestEcho || <span style={{ opacity: 0.35 }}>0</span>}</div>
          </WBox>
        </StatGroup>

        <StatGroup title="🚧 DODGE · longest run">
          <WBox thick style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: 'rotate(-0.2deg)', boxShadow: `0 4px 0 ${INK}` }}>
            <MonoText style={{ fontSize: 11, opacity: 0.7 }}>SECONDS</MonoText>
            <div style={{ fontSize: 30, fontWeight: 900 }}>{bestDodge ? (bestDodge / 1000).toFixed(1) : <span style={{ opacity: 0.35 }}>0</span>}</div>
          </WBox>
        </StatGroup>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <MonoText style={{ fontSize: 10, opacity: 0.5 }}>
          stats live on your device — clear them in settings.
        </MonoText>
      </div>
    </div>
  );
}

function StatGroup({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <MonoText style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.5 }}>{title}</MonoText>
      {children}
    </div>
  );
}

// ─── Settings View ─────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  { value: '#2563eb', label: 'cobalt' },
  { value: '#7c3aed', label: 'violet' },
  { value: '#db2777', label: 'magenta' },
  { value: '#0d9488', label: 'teal' },
  { value: '#0f172a', label: 'slate' },
];

function SettingsView() {
  const [accent, setAccent] = useAccent();
  const [, setBestEasy] = useLocalStorage('eg:mem:best:Easy', null);
  const [, setBestMedium] = useLocalStorage('eg:mem:best:Medium', null);
  const [, setBestHard] = useLocalStorage('eg:mem:best:Hard', null);
  const [, setBestWanted] = useLocalStorage('eg:wanted:best', 0);
  const [, setBestEcho] = useLocalStorage('eg:echo:best', 0);
  const [, setBestDodge] = useLocalStorage('eg:dodge:best', 0);
  const [confirmReset, setConfirmReset] = useState(false);

  const resetStats = () => {
    setBestEasy(null);
    setBestMedium(null);
    setBestHard(null);
    setBestWanted(0);
    setBestEcho(0);
    setBestDodge(0);
    setConfirmReset(false);
  };

  return (
    <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <MonoText style={{ fontSize: 12, opacity: 0.6, letterSpacing: 3 }}>◆ SETTINGS ◆</MonoText>
        <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, marginTop: 4 }}>tweak it.</div>
      </div>

      <SettingRow label="Accent color">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACCENT_PRESETS.map((p) => {
            const active = accent.toLowerCase() === p.value.toLowerCase();
            return (
              <button
                key={p.value}
                onClick={() => setAccent(p.value)}
                title={p.label}
                aria-label={`Accent ${p.label}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: p.value,
                  border: `2px solid ${INK}`,
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: active ? `0 0 0 3px ${PAPER}, 0 0 0 5px ${INK}` : `0 3px 0 ${INK}`,
                  transform: active ? 'translateY(2px)' : 'none',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                }}
              />
            );
          })}
          <WPill onClick={() => setAccent(DEFAULT_ACCENT)} style={{ alignSelf: 'center', cursor: 'pointer' }}>
            ↺ default
          </WPill>
        </div>
      </SettingRow>

      <SettingRow label="Stats" description="Wipe all best scores from this device.">
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <MonoText style={{ fontSize: 12, fontWeight: 700 }}>sure?</MonoText>
            <WPill thick fill={ACCENT} style={{ color: 'white', cursor: 'pointer', fontWeight: 700 }} onClick={resetStats}>
              yes, wipe
            </WPill>
            <WPill onClick={() => setConfirmReset(false)} style={{ cursor: 'pointer' }}>
              cancel
            </WPill>
          </div>
        ) : (
          <WPill thick onClick={() => setConfirmReset(true)} style={{ cursor: 'pointer', fontWeight: 700 }}>
            🧹 reset stats
          </WPill>
        )}
      </SettingRow>

      <SettingRow label="About">
        <WBox style={{ padding: 14, transform: 'rotate(-0.3deg)' }}>
          <MonoText style={{ fontSize: 10, opacity: 0.6 }}>EMOJI GAMES</MonoText>
          <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>
            four tiny games, one warm paper background. built with React + Vite.
          </div>
        </WBox>
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <MonoText style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.5 }}>{label.toUpperCase()}</MonoText>
        {description && (
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{description}</div>
        )}
      </div>
      {children}
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
        animation: 'popIn 0.35s ease both',
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
  const row = size === 'row';

  if (row) {
    return (
      <button
        onClick={onClick}
        style={{
          border: `2.5px solid ${INK}`,
          background: PAPER,
          color: INK,
          borderRadius: 10,
          padding: '12px 14px',
          textAlign: 'left',
          transform: `rotate(${tilt}deg)`,
          boxShadow: `0 5px 0 ${INK}`,
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          animation: 'fadeInUp 0.3s ease both',
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
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
        <div style={{ fontSize: 32, lineHeight: 1 }}>{game.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>{game.title}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{game.sub}</div>
        </div>
        <div style={{ fontSize: 18, opacity: 0.6 }}>›</div>
      </button>
    );
  }

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
        animation: 'fadeInUp 0.3s ease both',
        cursor: 'pointer',
        width: '100%',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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

