import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import Confetti from '../components/Confetti';
import { INK, PAPER, ACCENT, WPill, MonoText } from '../components/WireKit';
import useLocalStorage from '../hooks/useLocalStorage';
import { MEMORY_EMOJIS } from '../data/emojis';

const DIFFICULTIES = {
  Easy: { pairs: 6, cols: 4 },
  Medium: { pairs: 8, cols: 4 },
  Hard: { pairs: 10, cols: 5 },
};

const shuffle = (a) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildDeck = (pairs) => {
  const picks = shuffle(MEMORY_EMOJIS).slice(0, pairs);
  return shuffle([...picks, ...picks]).map((emoji, idx) => ({
    id: idx,
    emoji,
    flipped: false,
    matched: false,
  }));
};

const formatTime = (ms) => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function MemoryGame({ onBack }) {
  const [difficulty, setDifficulty] = useState('Medium');
  const { pairs, cols } = DIFFICULTIES[difficulty];
  const [cards, setCards] = useState(() => buildDeck(pairs));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [bestMoves, setBestMoves] = useLocalStorage(`eg:mem:best:${difficulty}`, null);

  // timer
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const tickRef = useRef(null);
  const startedRef = useRef(false);

  const allMatched = matched === pairs;

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startRef.current = Date.now();
    const tick = () => {
      setElapsed(Date.now() - startRef.current);
      tickRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = requestAnimationFrame(tick);
  }, []);

  const restart = useCallback(() => {
    stopTimer();
    startedRef.current = false;
    setElapsed(0);
    setCards(buildDeck(pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLocked(false);
  }, [pairs, stopTimer]);

  useEffect(() => {
    restart();
  }, [difficulty, restart]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    const [a, b] = flipped;
    const isMatch = cards[a].emoji === cards[b].emoji;
    const delay = isMatch ? 450 : 800;
    const timeout = setTimeout(() => {
      setCards((prev) =>
        prev.map((c, i) =>
          i === a || i === b ? { ...c, matched: isMatch, flipped: isMatch } : c
        )
      );
      if (isMatch) setMatched((m) => m + 1);
      setFlipped([]);
      setMoves((m) => m + 1);
      setLocked(false);
    }, delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => {
    if (allMatched) {
      stopTimer();
      setBestMoves((b) => (b == null ? moves : Math.min(b, moves)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  const handleClick = (idx) => {
    if (locked) return;
    const c = cards[idx];
    if (c.flipped || c.matched || flipped.includes(idx)) return;
    if (!startedRef.current) startTimer();
    setCards((prev) => prev.map((card, i) => (i === idx ? { ...card, flipped: true } : card)));
    setFlipped((f) => [...f, idx]);
  };

  return (
    <>
      <Confetti active={allMatched} />
      <GameShell
        title="MATCH · find the pairs"
        onBack={onBack}
        onRestart={restart}
        primary={formatTime(elapsed)}
        secondary={`${matched}/${pairs} pairs`}
      >
        <div style={{ padding: '12px 18px 4px', display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Object.keys(DIFFICULTIES).map((d) => {
            const active = d === difficulty;
            return (
              <WPill
                key={d}
                thick={active}
                fill={active ? ACCENT : 'transparent'}
                style={{ color: active ? 'white' : INK, fontWeight: active ? 800 : 400, cursor: 'pointer' }}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </WPill>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 1,
              padding: '12px 18px 16px',
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 10,
              maxWidth: 520,
              margin: '0 auto',
              width: '100%',
            }}
          >
            {cards.map((c, idx) => {
              const showFace = c.flipped || c.matched;
              const tilt = ((idx % 3) - 1) * 0.4;
              return (
                <button
                  key={c.id}
                  onClick={() => handleClick(idx)}
                  aria-label={showFace ? c.emoji : 'Hidden card'}
                  style={{
                    aspectRatio: '1 / 1',
                    border: `2px solid ${INK}`,
                    borderRadius: 10,
                    background: c.matched ? ACCENT : showFace ? PAPER : `${INK}10`,
                    color: INK,
                    fontSize: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: showFace ? 'default' : 'pointer',
                    transform: `rotate(${tilt}deg)`,
                    boxShadow: c.matched ? `0 3px 0 ${INK}` : `0 4px 0 ${INK}`,
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease',
                    opacity: c.matched ? 0.92 : 1,
                    animation: 'fadeInUp 0.35s ease both',
                    fontFamily: 'inherit',
                  }}
                >
                  {showFace ? (
                    <span style={{ animation: c.flipped ? 'popIn 0.3s ease' : undefined }}>{c.emoji}</span>
                  ) : (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 18, opacity: 0.45 }}>?</span>
                  )}
                </button>
              );
            })}
          </div>

          {allMatched && (
            <WinOverlay
              moves={moves}
              time={formatTime(elapsed)}
              bestMoves={bestMoves}
              onRestart={restart}
              onBack={onBack}
            />
          )}
        </div>

        <div
          style={{
            padding: '8px 18px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1.2px dashed ${INK}`,
          }}
        >
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>MOVES: {moves}</MonoText>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>
            BEST: {bestMoves != null ? `${bestMoves} moves` : '—'}
          </MonoText>
        </div>
      </GameShell>
    </>
  );
}

function WinOverlay({ moves, time, bestMoves, onRestart, onBack }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
        background: 'rgba(250, 246, 238, 0.92)',
        backdropFilter: 'blur(4px)',
        zIndex: 5,
        animation: 'fadeInUp 0.3s ease both',
      }}
    >
      <MonoText style={{ fontSize: 11, letterSpacing: 3, opacity: 0.7 }}>◆ ARCADE ◆</MonoText>
      <div style={{ fontSize: 56, lineHeight: 1, animation: 'popIn 0.45s ease' }}>🏆</div>
      <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>CLEARED</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {time} · {moves} moves
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, maxWidth: 280 }}>
        {bestMoves != null && bestMoves === moves
          ? 'new best!'
          : bestMoves != null
          ? `best: ${bestMoves} moves`
          : 'first run logged'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <button onClick={onRestart} style={primaryBtnStyle}>PLAY AGAIN ▶</button>
        <button onClick={onBack} style={secondaryBtnStyle}>‹ all games</button>
      </div>
    </div>
  );
}

const primaryBtnStyle = {
  border: `2px solid ${INK}`,
  background: ACCENT,
  color: 'white',
  padding: '10px 22px',
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 1,
  borderRadius: 8,
  boxShadow: `0 4px 0 ${INK}`,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  border: `1.5px solid ${INK}`,
  background: 'transparent',
  color: INK,
  padding: '6px 16px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.5,
  borderRadius: 999,
  fontFamily: 'inherit',
  cursor: 'pointer',
  opacity: 0.8,
};
