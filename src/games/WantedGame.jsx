import React, { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import GameShell from '../components/GameShell';
import Confetti from '../components/Confetti';
import useLocalStorage from '../hooks/useLocalStorage';
import useWindowSize from '../hooks/useWindowSize';
import { WANTED_EMOJIS } from '../data/emojis';

const ACCENT = '#f59e0b';
const INITIAL_TIME = 6000;
const MIN_TIME = 1800;
const TIME_REDUCTION = 250;

function getDims(width) {
  const isMobile = width < 600;
  return {
    width: isMobile ? Math.min(340, width - 32) : 540,
    height: isMobile ? 280 : 360,
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
  const [bestRound, setBestRound] = useLocalStorage('eg2:wanted:best', 0);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  const currentTime = Math.max(MIN_TIME, INITIAL_TIME - (round - 1) * TIME_REDUCTION);

  const startRound = useCallback(
    (r = round) => {
      const d = dimsRef.current;
      const wantedEmoji = WANTED_EMOJIS[Math.floor(Math.random() * WANTED_EMOJIS.length)];
      setWanted(wantedEmoji);
      const num = Math.min(4 + r, WANTED_EMOJIS.length);
      const wantedIdx = Math.floor(Math.random() * num);
      const next = [];
      for (let i = 0; i < num; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.min(2.5, r * 0.2) + Math.random();
        next.push({
          id: i,
          emoji: i === wantedIdx ? wantedEmoji : randomEmoji(wantedEmoji),
          x: Math.random() * (d.width - d.emojiSize),
          y: Math.random() * (d.height - d.emojiSize),
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          isWanted: i === wantedIdx,
        });
      }
      setEmojis(next);
      setState('running');
      setTimeLeft(Math.max(MIN_TIME, INITIAL_TIME - (r - 1) * TIME_REDUCTION));
    },
    [round]
  );

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
      if (remaining > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        setState('lose');
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, currentTime]);

  // bestRound persistence
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
      }, 600);
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
  const timeColor = timeLeft / currentTime < 0.3 ? '#ef4444' : timeLeft / currentTime < 0.6 ? '#f59e0b' : '#10b981';

  return (
    <>
      <Confetti active={state === 'win'} count={30} />
      <GameShell
        title="Find the Wanted"
        subtitle="Spot and tap before time runs out"
        accent={ACCENT}
        onBack={onBack}
        onRestart={restart}
        stats={[
          { label: 'Round', value: round, color: ACCENT },
          { label: 'Score', value: score },
          { label: 'Best', value: bestRound ?? 0, color: '#10b981' },
        ]}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 3,
              background: (t) => (t.palette.mode === 'dark' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.10)'),
              border: `1px solid ${ACCENT}55`,
            }}
          >
            <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: ACCENT }}>
              Wanted
            </Typography>
            <Box sx={{ fontSize: { xs: 32, sm: 40 }, lineHeight: 1, animation: 'float 2.5s ease-in-out infinite' }}>{wanted}</Box>
          </Box>
        </Box>

        <Box sx={{ width: '100%', maxWidth: dims.width, mx: 'auto', mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={timePct}
            sx={{
              height: 8,
              borderRadius: 4,
              background: 'rgba(148,163,184,0.2)',
              '& .MuiLinearProgress-bar': { background: timeColor, borderRadius: 4, transition: 'background 0.3s' },
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: dims.width,
            height: dims.height,
            mx: 'auto',
            borderRadius: 4,
            overflow: 'hidden',
            background: (t) =>
              t.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                : 'linear-gradient(135deg, #e0e7ff, #fef3c7)',
            border: `2px solid ${ACCENT}44`,
            touchAction: 'manipulation',
          }}
        >
          {emojis.map((e) => (
            <Box
              key={e.id}
              onClick={() => handleClick(e.isWanted)}
              sx={{
                position: 'absolute',
                left: e.x,
                top: e.y,
                width: dims.emojiSize,
                height: dims.emojiSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: dims.emojiSize * 0.85,
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: '50%',
                background: '#fff',
                boxShadow:
                  state === 'win' && e.isWanted
                    ? `0 0 24px 8px ${ACCENT}`
                    : '0 2px 6px rgba(15,23,42,0.15)',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              {e.emoji}
            </Box>
          ))}

          {state === 'ready' && (
            <Overlay
              title="Ready?"
              body="Tap the wanted emoji as fast as you can. Each round gets harder."
              action={<Button variant="contained" size="large" onClick={() => startRound(1)}>Start</Button>}
            />
          )}
          {state === 'lose' && (
            <Overlay
              title={timeLeft === 0 ? "Time's up!" : 'Wrong pick!'}
              body={`You reached round ${round}.`}
              action={<Button variant="contained" size="large" onClick={restart}>Play Again</Button>}
            />
          )}
        </Box>
      </GameShell>
    </>
  );
}

function Overlay({ title, body, action }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        p: 2,
        textAlign: 'center',
        background: (t) =>
          t.palette.mode === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        zIndex: 5,
      }}
    >
      <Typography variant="h4" fontWeight={800}>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 320 }}>{body}</Typography>
      {action}
    </Box>
  );
}
