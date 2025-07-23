import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const EMOJIS = ["😀", "🐶", "🍕", "⚽", "🚗", "🌵", "🎩", "🍦", "🐱", "👾", "🦄", "🐸", "🍔", "🍉", "🚀", "🎲"];
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const EMOJI_SIZE = 64; // px
const INITIAL_TIME = 3000; // ms
const TIME_DECREASE = 250; // ms per round
const MIN_TIME = 900; // ms

function getRandomEmoji(exclude) {
  let emoji;
  do {
    emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  } while (emoji === exclude);
  return emoji;
}

function getRandomPosition() {
  return {
    x: Math.random() * (GAME_WIDTH - EMOJI_SIZE),
    y: Math.random() * (GAME_HEIGHT - EMOJI_SIZE),
  };
}

function getRandomVelocity() {
  const speed = 2 + Math.random() * 2;
  const angle = Math.random() * 2 * Math.PI;
  return {
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
  };
}

function EmojiWantedGame() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wanted, setWanted] = useState(EMOJIS[0]);
  const [emojis, setEmojis] = useState([]);
  const [gameState, setGameState] = useState('ready'); // ready, running, win, lose
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [timer, setTimer] = useState(null);

  const animationRef = useRef();
  const emojiRefs = useRef([]);

  // Start a new round
  const startRound = () => {
    const wantedEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setWanted(wantedEmoji);

    // Number of emojis increases with round, max 10
    const numEmojis = Math.min(4 + round, 10);
    // Place wanted emoji at random
    const wantedIndex = Math.floor(Math.random() * numEmojis);

    const emojiObjs = [];
    for (let i = 0; i < numEmojis; i++) {
      let emoji = i === wantedIndex ? wantedEmoji : getRandomEmoji(wantedEmoji);
      let pos = getRandomPosition();
      let vel = getRandomVelocity();
      emojiObjs.push({
        emoji,
        x: pos.x,
        y: pos.y,
        dx: vel.dx,
        dy: vel.dy,
        id: i,
        isWanted: i === wantedIndex,
      });
    }
    setEmojis(emojiObjs);
    setGameState('running');
    setTimeLeft(Math.max(INITIAL_TIME - (round - 1) * TIME_DECREASE, MIN_TIME));
  };

  // Animation loop for moving emojis
  useEffect(() => {
    if (gameState !== 'running') return;
    let frame;
    const move = () => {
      setEmojis((prev) =>
        prev.map((e) => {
          let nx = e.x + e.dx;
          let ny = e.y + e.dy;
          let ndx = e.dx;
          let ndy = e.dy;
          if (nx < 0 || nx > GAME_WIDTH - EMOJI_SIZE) ndx = -ndx;
          if (ny < 0 || ny > GAME_HEIGHT - EMOJI_SIZE) ndy = -ndy;
          nx = Math.max(0, Math.min(nx, GAME_WIDTH - EMOJI_SIZE));
          ny = Math.max(0, Math.min(ny, GAME_HEIGHT - EMOJI_SIZE));
          return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
        })
      );
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [gameState]);

  // Timer for each round
  useEffect(() => {
    if (gameState !== 'running') return;
    setTimer(setTimeout(() => {
      setGameState('lose');
    }, timeLeft));
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [gameState, round, timeLeft]);

  // Clean up on unmount
  useEffect(() => () => clearTimeout(timer), [timer]);

  // Click handler
  const handleEmojiClick = (isWanted) => {
    if (gameState !== 'running') return;
    if (isWanted) {
      setScore((s) => s + 1);
      setGameState('win');
      setTimeout(() => {
        setRound((r) => r + 1);
        startRound();
      }, 900);
    } else {
      setGameState('lose');
    }
  };

  // Start game or next round
  useEffect(() => {
    if (gameState === 'ready' || gameState === 'win') {
      // Wait for user to start
      return;
    }
    if (gameState === 'running') return;
    if (gameState === 'lose') return;
    // Start first round
    startRound();
    // eslint-disable-next-line
  }, [round, gameState]);

  // Reset game
  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setGameState('ready');
  };

  return (
    <Box sx={{ width: GAME_WIDTH, mx: 'auto', mt: 2, mb: 2 }}>
      <Typography variant="h4" gutterBottom>
        Emoji Wanted!
      </Typography>
      <Typography variant="h6" gutterBottom>
        Find and click the wanted emoji before time runs out!
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 3 }}>
          Round: {round}
        </Typography>
        <Typography variant="body1" sx={{ mr: 3 }}>
          Score: {score}
        </Typography>
        {gameState === 'running' && (
          <Typography variant="body1">
            Time: {(timeLeft / 1000).toFixed(2)}s
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          position: 'relative',
          background: '#e3f2fd',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2,
          border: '2px solid #1976d2',
        }}
      >
        {/* Wanted emoji display */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            background: '#fff',
            borderRadius: 2,
            px: 2,
            py: 1,
            boxShadow: 1,
            border: '1px solid #1976d2',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            Wanted:
          </Typography>
          <span style={{ fontSize: 40 }}>{wanted}</span>
        </Box>
        {/* Emojis */}
        {emojis.map((e) => (
          <Box
            key={e.id}
            sx={{
              position: 'absolute',
              left: e.x,
              top: e.y,
              width: EMOJI_SIZE,
              height: EMOJI_SIZE,
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'box-shadow 0.1s',
              boxShadow: gameState === 'win' && e.isWanted ? '0 0 16px 8px #4caf50' : undefined,
              borderRadius: '50%',
              background: '#fff',
              border: e.isWanted && gameState === 'win' ? '2px solid #4caf50' : '2px solid #1976d2',
              zIndex: 1,
            }}
            onClick={() => handleEmojiClick(e.isWanted)}
          >
            {e.emoji}
          </Box>
        ))}
        {/* Overlay for lose */}
        {gameState === 'lose' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              Time's up or wrong emoji!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Final Score: {score}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRestart}>
              Play Again
            </Button>
          </Box>
        )}
        {/* Overlay for ready */}
        {gameState === 'ready' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Emoji Wanted!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Click the wanted emoji before time runs out.<br />
              Each round gets faster!
            </Typography>
            <Button variant="contained" color="primary" onClick={startRound}>
              Start
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default EmojiWantedGame;