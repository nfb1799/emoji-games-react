import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import GameShell from '../components/GameShell';
import Confetti from '../components/Confetti';
import useLocalStorage from '../hooks/useLocalStorage';
import { MEMORY_EMOJIS } from '../data/emojis';

const ACCENT = '#ec4899';

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

export default function MemoryGame({ onBack }) {
  const [difficulty, setDifficulty] = useState('Medium');
  const { pairs, cols } = DIFFICULTIES[difficulty];
  const [cards, setCards] = useState(() => buildDeck(pairs));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [bestMoves, setBestMoves] = useLocalStorage(`eg2:mem:best:${difficulty}`, null);

  const allMatched = matched === pairs;

  const restart = useCallback(() => {
    setCards(buildDeck(pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLocked(false);
  }, [pairs]);

  useEffect(() => {
    restart();
  }, [difficulty, restart]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    const [a, b] = flipped;
    const isMatch = cards[a].emoji === cards[b].emoji;
    const delay = isMatch ? 450 : 800;
    const timeout = setTimeout(() => {
      setCards((prev) =>
        prev.map((c, i) =>
          i === a || i === b
            ? { ...c, matched: isMatch, flipped: isMatch ? true : false }
            : c
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
      setBestMoves((b) => (b == null ? moves : Math.min(b, moves)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  const handleClick = (idx) => {
    if (locked) return;
    const c = cards[idx];
    if (c.flipped || c.matched) return;
    if (flipped.includes(idx)) return;
    setCards((prev) => prev.map((card, i) => (i === idx ? { ...card, flipped: true } : card)));
    setFlipped((f) => [...f, idx]);
  };

  const cardSize = useMemo(() => {
    if (cols >= 5) return { xs: 54, sm: 70 };
    return { xs: 62, sm: 80 };
  }, [cols]);

  return (
    <>
      <Confetti active={allMatched} />
      <GameShell
        title="Memory Match"
        subtitle="Find every pair"
        accent={ACCENT}
        onBack={onBack}
        onRestart={restart}
        stats={[
          { label: 'Moves', value: moves, color: ACCENT },
          { label: 'Pairs', value: `${matched}/${pairs}` },
          { label: 'Best', value: bestMoves ?? '—', color: '#10b981' },
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={difficulty}
            exclusive
            size="small"
            onChange={(_, v) => v && setDifficulty(v)}
            aria-label="Difficulty"
          >
            {Object.keys(DIFFICULTIES).map((d) => (
              <ToggleButton key={d} value={d} sx={{ px: 2 }}>
                {d}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {allMatched ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h2" sx={{ animation: 'popIn 0.5s ease' }}>🎉</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
              Solved in {moves} moves
            </Typography>
            <Button variant="contained" size="large" sx={{ mt: 3 }} onClick={restart}>
              Play Again
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: { xs: 1, sm: 1.25 },
              maxWidth: 480,
              mx: 'auto',
              perspective: '800px',
            }}
          >
            {cards.map((c, idx) => {
              const showFace = c.flipped || c.matched;
              return (
                <Box
                  key={c.id}
                  role="button"
                  aria-label={showFace ? c.emoji : 'Hidden card'}
                  onClick={() => handleClick(idx)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    minHeight: cardSize,
                    cursor: showFace ? 'default' : 'pointer',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1)',
                    transform: showFace ? 'rotateY(180deg)' : 'rotateY(0)',
                    outline: 'none',
                    '&:focus-visible > *': { boxShadow: `0 0 0 3px ${ACCENT}55` },
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick(idx);
                    }
                  }}
                >
                  {/* Back */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 2.5,
                      background: `linear-gradient(135deg, ${ACCENT}, #f472b6)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: { xs: 22, sm: 28 },
                      backfaceVisibility: 'hidden',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)',
                    }}
                  >
                    ?
                  </Box>
                  {/* Face */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 2.5,
                      background: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#fff'),
                      border: (t) =>
                        c.matched
                          ? `2px solid ${t.palette.success.main}`
                          : `2px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: { xs: 28, sm: 36 },
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      boxShadow: c.matched ? '0 0 16px rgba(16,185,129,0.35)' : '0 4px 8px rgba(15,23,42,0.06)',
                    }}
                  >
                    {c.emoji}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </GameShell>
    </>
  );
}
