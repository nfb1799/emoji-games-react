import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import Confetti from '../components/Confetti';
import { INK, PAPER, ACCENT, MonoText } from '../components/WireKit';
import useLocalStorage from '../hooks/useLocalStorage';

const PADS = [
  { id: 0, emoji: '🐶', tilt: -0.6 },
  { id: 1, emoji: '🚗', tilt: 0.4 },
  { id: 2, emoji: '🍕', tilt: 0.3 },
  { id: 3, emoji: '⭐', tilt: -0.4 },
];

const FLASH_MS = 460;
const GAP_MS = 140;
const START_DELAY_MS = 480;
const FEEDBACK_MS = 180;
const ADVANCE_MS = 560;

const randomPad = () => Math.floor(Math.random() * PADS.length);

export default function EchoGame({ onBack }) {
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready | showing | input | gameover
  const [activePad, setActivePad] = useState(null);
  const [inputIdx, setInputIdx] = useState(0);
  const [bestRound, setBestRound] = useLocalStorage('eg:echo:best', 0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const playSequence = useCallback((seq) => {
    setPhase('showing');
    setActivePad(null);
    const start = setTimeout(() => {
      seq.forEach((padId, i) => {
        const onT = setTimeout(() => setActivePad(padId), i * (FLASH_MS + GAP_MS));
        const offT = setTimeout(() => setActivePad(null), i * (FLASH_MS + GAP_MS) + FLASH_MS);
        timersRef.current.push(onT, offT);
      });
      const done = setTimeout(() => {
        setActivePad(null);
        setInputIdx(0);
        setPhase('input');
      }, seq.length * (FLASH_MS + GAP_MS) + 80);
      timersRef.current.push(done);
    }, START_DELAY_MS);
    timersRef.current.push(start);
  }, []);

  const startRun = useCallback(() => {
    clearTimers();
    const seq = [randomPad()];
    setSequence(seq);
    setInputIdx(0);
    setActivePad(null);
    playSequence(seq);
  }, [clearTimers, playSequence]);

  const handleTap = (padId) => {
    if (phase !== 'input') return;
    const expected = sequence[inputIdx];
    if (padId !== expected) {
      clearTimers();
      setActivePad(padId);
      setPhase('gameover');
      const cleared = sequence.length - 1;
      setBestRound((b) => Math.max(b ?? 0, cleared));
      return;
    }

    setActivePad(padId);
    const off = setTimeout(() => setActivePad(null), FEEDBACK_MS);
    timersRef.current.push(off);

    const nextIdx = inputIdx + 1;
    if (nextIdx >= sequence.length) {
      const advance = setTimeout(() => {
        const next = [...sequence, randomPad()];
        setSequence(next);
        setInputIdx(0);
        playSequence(next);
      }, ADVANCE_MS);
      timersRef.current.push(advance);
      setInputIdx(0);
    } else {
      setInputIdx(nextIdx);
    }
  };

  const round = sequence.length;
  const cleared = phase === 'gameover' ? Math.max(0, sequence.length - 1) : Math.max(0, sequence.length - (phase === 'ready' ? 1 : 0));
  const ready = phase === 'ready';
  const watching = phase === 'showing';
  const inputting = phase === 'input';
  const dead = phase === 'gameover';

  return (
    <>
      <Confetti active={dead && cleared >= 6} count={24} />
      <GameShell
        title="ECHO · repeat the sequence"
        onBack={onBack}
        onRestart={!ready ? startRun : undefined}
        primary={ready ? '—' : `R${round}`}
        secondary={
          inputting ? `${inputIdx}/${sequence.length}` :
          watching ? 'watch' :
          dead ? 'miss' : 'ready'
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 18px 12px' }}>
          <Banner phase={phase} />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              width: '100%',
              maxWidth: 360,
              aspectRatio: '1 / 1',
              marginTop: 8,
            }}
          >
            {PADS.map((pad) => {
              const active = activePad === pad.id;
              const fault = dead && active;
              const tappable = inputting;
              return (
                <button
                  key={pad.id}
                  onClick={() => handleTap(pad.id)}
                  disabled={!tappable}
                  aria-label={`pad ${pad.emoji}`}
                  style={{
                    border: `2.5px solid ${INK}`,
                    background: fault ? '#e84a8a' : active ? ACCENT : PAPER,
                    color: INK,
                    borderRadius: 16,
                    fontSize: active ? 70 : 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: tappable ? 'pointer' : 'default',
                    boxShadow: active ? `0 2px 0 ${INK}` : `0 5px 0 ${INK}`,
                    transform: `rotate(${pad.tilt}deg)${active ? ' translateY(3px)' : ''}`,
                    transition: 'transform 0.15s ease, background 0.15s ease, font-size 0.15s ease, box-shadow 0.15s ease',
                    fontFamily: 'inherit',
                    opacity: dead && !active ? 0.5 : 1,
                  }}
                >
                  {pad.emoji}
                </button>
              );
            })}

            {dead && (
              <GameOverOverlay
                cleared={cleared}
                bestRound={bestRound}
                onRestart={startRun}
                onBack={onBack}
              />
            )}
          </div>

          <div style={{ marginTop: 18, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {ready && (
              <button onClick={startRun} style={primaryBtn}>START ▶</button>
            )}
          </div>
        </div>

        <div style={{ padding: '8px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1.2px dashed ${INK}` }}>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>ROUND: {cleared}</MonoText>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>BEST: {bestRound ?? 0}</MonoText>
        </div>
      </GameShell>
    </>
  );
}

function GameOverOverlay({ cleared, bestRound, onRestart, onBack }) {
  const newBest = bestRound != null && cleared >= bestRound;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 24,
        textAlign: 'center',
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(4px)',
        zIndex: 5,
        borderRadius: 16,
        animation: 'fadeInUp 0.3s ease both',
      }}
    >
      <MonoText style={{ fontSize: 11, letterSpacing: 3, opacity: 0.7 }}>◆ MISS ◆</MonoText>
      <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>round {cleared}</div>
      <MonoText style={{ fontSize: 11, opacity: 0.7 }}>
        {newBest ? 'new best!' : `best: ${bestRound ?? 0}`}
      </MonoText>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <button onClick={onRestart} style={primaryBtn}>PLAY AGAIN ▶</button>
        <button onClick={onBack} style={secondaryBtn}>‹ all games</button>
      </div>
    </div>
  );
}

function Banner({ phase }) {
  const map = {
    ready:    { label: 'tap start',     color: 'rgba(31,29,26,0.65)' },
    showing:  { label: '◆ WATCH ◆',     color: 'rgba(31,29,26,0.7)' },
    input:    { label: '◆ YOUR TURN ◆', color: ACCENT },
    gameover: { label: '◆ MISS ◆',      color: '#e84a8a' },
  };
  const cfg = map[phase];
  return (
    <div style={{ minHeight: 22 }}>
      <MonoText style={{ fontSize: 12, letterSpacing: 2, color: cfg.color, fontWeight: 700 }}>
        {cfg.label}
      </MonoText>
    </div>
  );
}

const primaryBtn = {
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

const secondaryBtn = {
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
