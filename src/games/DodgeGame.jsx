import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../components/GameShell';
import { INK, PAPER, ACCENT, MonoText } from '../components/WireKit';
import useLocalStorage from '../hooks/useLocalStorage';
import useWindowSize from '../hooks/useWindowSize';

const HAZARDS = ['⚡', '🔥', '☄️', '🪨', '💣', '🌶️', '🧨', '🪵'];

function getDims(width) {
  const isMobile = width < 600;
  return {
    width: isMobile ? Math.min(340, width - 36) : 460,
    height: isMobile ? 460 : 540,
    playerSize: isMobile ? 40 : 46,
    obstacleSize: isMobile ? 30 : 36,
  };
}

const PLAYER_BOTTOM_OFFSET = 22;
const SPAWN_BASE_MS = 720;
const SPAWN_MIN_MS = 240;
const SPEED_BASE = 2.2;
const SPEED_MAX = 6.2;
const KEY_STEP = 26;

const fmt = (ms) => (ms / 1000).toFixed(1);

export default function DodgeGame({ onBack }) {
  const { width } = useWindowSize();
  const dims = getDims(width);

  const [state, setState] = useState('ready'); // ready | running | gameover
  const [elapsed, setElapsed] = useState(0);
  const [bestTime, setBestTime] = useLocalStorage('eg:dodge:best', 0);

  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const playerXRef = useRef(dims.width / 2 - dims.playerSize / 2);
  const obstaclesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const frameRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [, forceTick] = useState(0);
  const bump = () => forceTick((n) => (n + 1) % 1_000_000);

  const reset = useCallback(() => {
    const d = dimsRef.current;
    obstaclesRef.current = [];
    lastSpawnRef.current = 0;
    elapsedRef.current = 0;
    setElapsed(0);
    playerXRef.current = d.width / 2 - d.playerSize / 2;
  }, []);

  const start = useCallback(() => {
    reset();
    startTimeRef.current = performance.now();
    setState('running');
  }, [reset]);

  // Main game loop
  useEffect(() => {
    if (state !== 'running') return;

    const tick = (now) => {
      const d = dimsRef.current;
      const t = now - startTimeRef.current;
      elapsedRef.current = t;

      // spawn
      const spawnDelay = Math.max(SPAWN_MIN_MS, SPAWN_BASE_MS - t / 28);
      if (t - lastSpawnRef.current > spawnDelay) {
        const baseSpeed = SPEED_BASE + Math.min(SPEED_MAX - SPEED_BASE, t / 9000);
        obstaclesRef.current.push({
          id: Math.random().toString(36).slice(2),
          x: Math.random() * (d.width - d.obstacleSize),
          y: -d.obstacleSize,
          emoji: HAZARDS[Math.floor(Math.random() * HAZARDS.length)],
          speed: baseSpeed * (0.85 + Math.random() * 0.35),
        });
        lastSpawnRef.current = t;
      }

      // update + cull
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, y: o.y + o.speed }))
        .filter((o) => o.y < d.height + 60);

      // collision (slight inset for forgiveness)
      const playerY = d.height - d.playerSize - PLAYER_BOTTOM_OFFSET;
      const px = playerXRef.current;
      const inset = 6;
      for (const o of obstaclesRef.current) {
        if (
          o.x + inset < px + d.playerSize - inset &&
          o.x + d.obstacleSize - inset > px + inset &&
          o.y + inset < playerY + d.playerSize - inset &&
          o.y + d.obstacleSize - inset > playerY + inset
        ) {
          setBestTime((b) => Math.max(b ?? 0, Math.floor(elapsedRef.current)));
          setElapsed(elapsedRef.current);
          setState('gameover');
          return;
        }
      }

      setElapsed(t);
      bump();
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state, setBestTime]);

  // keyboard
  useEffect(() => {
    const handle = (e) => {
      if (stateRef.current !== 'running') return;
      const d = dimsRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        playerXRef.current = Math.max(0, playerXRef.current - KEY_STEP);
        bump();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        playerXRef.current = Math.min(d.width - d.playerSize, playerXRef.current + KEY_STEP);
        bump();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const movePlayerTo = (clientX, rect) => {
    if (stateRef.current !== 'running') return;
    const d = dimsRef.current;
    const localX = clientX - rect.left - d.playerSize / 2;
    playerXRef.current = Math.max(0, Math.min(d.width - d.playerSize, localX));
    bump();
  };

  const onPointerMove = (e) => {
    movePlayerTo(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const onTouchMove = (e) => {
    if (!e.touches[0]) return;
    movePlayerTo(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  };

  const onPointerDown = (e) => {
    if (state === 'running') movePlayerTo(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const obstacles = obstaclesRef.current;

  return (
    <GameShell
      title="DODGE · don't get hit"
      onBack={onBack}
      onRestart={state !== 'ready' ? start : undefined}
      primary={`${fmt(elapsed)}s`}
      secondary={state === 'running' ? 'live' : state === 'gameover' ? 'down' : 'ready'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 18px 12px', flex: 1 }}>
        <MonoText style={{ fontSize: 11, opacity: 0.65, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
          {state === 'running' ? '← → · drag · keys' : 'survive as long as you can'}
        </MonoText>

        <div
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onTouchMove={onTouchMove}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: dims.width,
            height: dims.height,
            background: PAPER,
            border: `2px solid ${INK}`,
            borderRadius: 12,
            boxShadow: `0 4px 0 ${INK}`,
            overflow: 'hidden',
            touchAction: 'none',
            userSelect: 'none',
            cursor: state === 'running' ? 'crosshair' : 'default',
          }}
        >
          {/* ground line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: PLAYER_BOTTOM_OFFSET - 6,
              borderTop: `1.5px dashed ${INK}`,
              opacity: 0.35,
            }}
          />

          {/* player */}
          <div
            style={{
              position: 'absolute',
              left: playerXRef.current,
              top: dims.height - dims.playerSize - PLAYER_BOTTOM_OFFSET,
              width: dims.playerSize,
              height: dims.playerSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: dims.playerSize * 0.85,
              filter: state === 'gameover' ? 'grayscale(1)' : 'none',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            🐱
          </div>

          {/* obstacles */}
          {obstacles.map((o) => (
            <div
              key={o.id}
              style={{
                position: 'absolute',
                left: o.x,
                top: o.y,
                width: dims.obstacleSize,
                height: dims.obstacleSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: dims.obstacleSize * 0.9,
                pointerEvents: 'none',
              }}
            >
              {o.emoji}
            </div>
          ))}

          {state === 'ready' && (
            <Overlay
              title="READY?"
              body="drag, click, or use ← → / A D to dodge. don't get hit."
              action={
                <button onClick={start} style={primaryBtn}>START ▶</button>
              }
            />
          )}
          {state === 'gameover' && (
            <Overlay
              title="HIT!"
              body={`you lasted ${fmt(elapsed)}s · best ${fmt(bestTime)}s`}
              action={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <button onClick={start} style={primaryBtn}>PLAY AGAIN ▶</button>
                  <button onClick={onBack} style={secondaryBtn}>‹ all games</button>
                </div>
              }
            />
          )}
        </div>
      </div>

      <div style={{ padding: '8px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1.2px dashed ${INK}` }}>
        <MonoText style={{ fontSize: 11, opacity: 0.7 }}>TIME: {fmt(elapsed)}s</MonoText>
        <MonoText style={{ fontSize: 11, opacity: 0.7 }}>BEST: {fmt(bestTime)}s</MonoText>
      </div>
    </GameShell>
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
        background: 'rgba(250, 246, 238, 0.92)',
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
