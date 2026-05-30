import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import Confetti from '../components/Confetti';
import { INK, PAPER, ACCENT, ACCENT_SOFT, WBox, WPill, MonoText } from '../components/WireKit';
import useLocalStorage from '../hooks/useLocalStorage';
import useWindowSize from '../hooks/useWindowSize';
import { WANTED_EMOJIS } from '../data/emojis';

const INITIAL_TIME = 6000;
const MIN_TIME = 1800;
const TIME_REDUCTION = 250;

function getDims(width) {
  const isMobile = width < 600;
  return {
    width: isMobile ? Math.min(340, width - 36) : 540,
    height: isMobile ? 300 : 380,
    emojiSize: isMobile ? 36 : 48,
  };
}

const randomEmoji = (exclude) => {
  let e;
  do {
    e = WANTED_EMOJIS[Math.floor(Math.random() * WANTED_EMOJIS.length)];
  } while (e === exclude);
  return e;
};

export default function WantedGame({ onBack }) {
  const { width } = useWindowSize();
  const dims = getDims(width);
  const [state, setState] = useState('ready'); // ready, running, win, lose
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wanted, setWanted] = useState(WANTED_EMOJIS[0]);
  const [emojis, setEmojis] = useState([]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [bestRound, setBestRound] = useLocalStorage('eg:wanted:best', 0);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const currentTime = Math.max(MIN_TIME, INITIAL_TIME - (round - 1) * TIME_REDUCTION);

  const startRound = useCallback((r = round) => {
    const d = dimsRef.current;
    const wantedEmoji = WANTED_EMOJIS[Math.floor(Math.random() * WANTED_EMOJIS.length)];
    setWanted(wantedEmoji);
    const num = Math.min(4 + r, WANTED_EMOJIS.length);
    const wantedIdx = Math.floor(Math.random() * num);
    const next = [];
    for (let i = 0; i < num; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.min(2.4, r * 0.18) + Math.random();
      next.push({
        id: i,
        emoji: i === wantedIdx ? wantedEmoji : randomEmoji(wantedEmoji),
        x: Math.random() * (d.width - d.emojiSize),
        y: Math.random() * (d.height - d.emojiSize),
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        rot: ((i * 13) % 9) - 4,
        isWanted: i === wantedIdx,
      });
    }
    setEmojis(next);
    setState('running');
    setTimeLeft(Math.max(MIN_TIME, INITIAL_TIME - (r - 1) * TIME_REDUCTION));
  }, [round]);

  // movement
  useEffect(() => {
    if (state !== 'running') return;
    let frame;
    const tick = () => {
      const d = dimsRef.current;
      setEmojis((prev) =>
        prev.map((e) => {
          let nx = e.x + e.dx;
          let ny = e.y + e.dy;
          let dx = e.dx;
          let dy = e.dy;
          if (nx < 0 || nx > d.width - d.emojiSize) {
            dx = -dx;
            nx = Math.max(0, Math.min(nx, d.width - d.emojiSize));
          }
          if (ny < 0 || ny > d.height - d.emojiSize) {
            dy = -dy;
            ny = Math.max(0, Math.min(ny, d.height - d.emojiSize));
          }
          return { ...e, x: nx, y: ny, dx, dy };
        })
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  // timer
  useEffect(() => {
    if (state !== 'running') return;
    const start = Date.now();
    const total = currentTime;
    let frame;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, total - elapsed);
      setTimeLeft(remaining);
      if (remaining > 0) frame = requestAnimationFrame(tick);
      else setState('lose');
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, currentTime]);

  useEffect(() => {
    if (state === 'lose') {
      setBestRound((b) => Math.max(b ?? 0, round - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleClick = (isWanted) => {
    if (state !== 'running') return;
    if (isWanted) {
      setScore((s) => s + 1);
      setState('win');
      setTimeout(() => {
        setRound((r) => {
          const next = r + 1;
          startRound(next);
          return next;
        });
      }, 550);
    } else {
      setState('lose');
    }
  };

  const restart = () => {
    setRound(1);
    setScore(0);
    setState('ready');
    setEmojis([]);
    setTimeLeft(INITIAL_TIME);
  };

  const timePct = state === 'running' ? (timeLeft / currentTime) * 100 : state === 'win' ? 100 : 0;
  const formattedTime = `00:${String(Math.ceil(timeLeft / 1000)).padStart(2, '0')}`;

  return (
    <>
      <Confetti active={state === 'win'} count={26} />
      <GameShell
        title="WANTED · spot the suspect"
        onBack={onBack}
        onRestart={state !== 'ready' ? restart : undefined}
        primary={formattedTime}
        secondary={`${score} found`}
      >
        <div style={{ padding: '14px 18px 8px' }}>
          <WBox thick fill={`${INK}05`} style={{ padding: 12, transform: 'rotate(-0.6deg)' }}>
            <MonoText style={{ fontSize: 11, letterSpacing: 3, fontWeight: 900, display: 'block', textAlign: 'center' }}>
              ★ WANTED ★
            </MonoText>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 6 }}>
              <div style={{ fontSize: 42, animation: 'float 2.5s ease-in-out infinite' }}>{wanted}</div>
              <div>
                <MonoText style={{ fontSize: 11, fontWeight: 700, display: 'block' }}>ROUND {round}</MonoText>
                <MonoText style={{ fontSize: 10, opacity: 0.7 }}>found: {score}</MonoText>
              </div>
            </div>
          </WBox>
        </div>

        {/* Timer bar */}
        <div style={{ padding: '0 18px 10px' }}>
          <div
            style={{
              height: 10,
              border: `1.5px solid ${INK}`,
              borderRadius: 999,
              background: PAPER,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${timePct}%`,
                background: timeLeft / currentTime < 0.3 ? '#e84a8a' : ACCENT,
                transition: 'background 0.2s ease',
              }}
            />
          </div>
        </div>

        <div style={{ padding: '0 18px 14px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: dims.width,
              height: dims.height,
              border: `2px solid ${INK}`,
              background: PAPER,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: `0 4px 0 ${INK}`,
              touchAction: 'manipulation',
            }}
          >
            {emojis.map((e) => (
              <button
                key={e.id}
                onClick={() => handleClick(e.isWanted)}
                style={{
                  position: 'absolute',
                  left: e.x,
                  top: e.y,
                  width: dims.emojiSize,
                  height: dims.emojiSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: dims.emojiSize * 0.85,
                  border: state === 'win' && e.isWanted ? `2px solid ${ACCENT}` : '1px solid transparent',
                  borderRadius: '50%',
                  background: state === 'win' && e.isWanted ? ACCENT_SOFT : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transform: `rotate(${e.rot}deg)`,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {e.emoji}
              </button>
            ))}

            {state === 'ready' && (
              <Overlay
                title="READY?"
                body="tap the wanted emoji before time runs out. each round speeds up."
                action={
                  <button
                    onClick={() => startRound(1)}
                    style={{
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
                    }}
                  >
                    START ▶
                  </button>
                }
              />
            )}

            {state === 'lose' && (
              <Overlay
                title={timeLeft === 0 ? "TIME'S UP" : 'WRONG PICK'}
                body={`you reached round ${round}. best: ${bestRound ?? 0}.`}
                action={
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={restart}
                      style={{
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
                      }}
                    >
                      PLAY AGAIN ▶
                    </button>
                    <button
                      onClick={onBack}
                      style={{
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
                      }}
                    >
                      ‹ all games
                    </button>
                  </div>
                }
              />
            )}
          </div>
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
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>SCORE: {score}</MonoText>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>BEST: {bestRound ?? 0}</MonoText>
        </div>
      </GameShell>
    </>
  );
}

function Overlay({ title, body, action }) {
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
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(4px)',
        zIndex: 5,
      }}
    >
      <MonoText style={{ fontSize: 11, letterSpacing: 3, opacity: 0.7 }}>◆ ARCADE ◆</MonoText>
      <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>{title}</div>
      <div style={{ fontSize: 14, opacity: 0.75, maxWidth: 280, lineHeight: 1.5 }}>{body}</div>
      <div style={{ marginTop: 4 }}>{action}</div>
    </div>
  );
}
