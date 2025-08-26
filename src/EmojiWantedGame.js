import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

const EMOJIS = ["😀", "🐶", "🍕", "⚽", "🚗", "🌵", "🎩", "🍦", "🐱", "👾", "🦄", "🐸", "🍔", "🍉", "🚀", "🎲"];

// Responsive game dimensions
const getGameDimensions = () => {
  const isMobile = window.innerWidth < 600;
  return {
    width: isMobile ? Math.min(320, window.innerWidth - 60) : 500,
    height: isMobile ? 220 : 300,
    emojiSize: isMobile ? 32 : 48,
    fontSize: isMobile ? 28 : 40,
  };
};

const INITIAL_TIME = 5000; // ms (5 seconds)
const TIME_INCREASE = 500; // ms per round

function getRandomEmoji(exclude) {
  let emoji;
  do {
    emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  } while (emoji === exclude);
  return emoji;
}

function getRandomPosition(gameWidth, gameHeight, emojiSize) {
  return {
    x: Math.random() * (gameWidth - emojiSize),
    y: Math.random() * (gameHeight - emojiSize),
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
  const [loseReason, setLoseReason] = useState(''); // 'timeout' or 'wrong'
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [currentTime, setCurrentTime] = useState(INITIAL_TIME);
  const [gameDimensions, setGameDimensions] = useState(getGameDimensions);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setGameDimensions(getGameDimensions());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ...existing code...

  // Start a new round
  const startRound = () => {
    const wantedEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setWanted(wantedEmoji);

    // Number of emojis increases with round, max EMOJIS.length (16)
    const numEmojis = Math.min(4 + round, EMOJIS.length);
    // Place wanted emoji at random
    const wantedIndex = Math.floor(Math.random() * numEmojis);

    const emojiObjs = [];
    for (let i = 0; i < numEmojis; i++) {
      let emoji = i === wantedIndex ? wantedEmoji : getRandomEmoji(wantedEmoji);
      let pos = getRandomPosition(gameDimensions.width, gameDimensions.height, gameDimensions.emojiSize);
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
    setTimeLeft(currentTime);
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
          if (nx < 0 || nx > gameDimensions.width - gameDimensions.emojiSize) ndx = -ndx;
          if (ny < 0 || ny > gameDimensions.height - gameDimensions.emojiSize) ndy = -ndy;
          nx = Math.max(0, Math.min(nx, gameDimensions.width - gameDimensions.emojiSize));
          ny = Math.max(0, Math.min(ny, gameDimensions.height - gameDimensions.emojiSize));
          return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
        })
      );
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [gameState, gameDimensions]);

  // Timer for each round (update timeLeft smoothly)
  useEffect(() => {
    if (gameState !== 'running') return;
    const start = Date.now();
    const totalTime = currentTime;
    let animationFrame;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, totalTime - elapsed);
      setTimeLeft(remaining);
      if (remaining > 0) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setLoseReason('timeout');
        setGameState('lose');
      }
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line
  }, [gameState, currentTime]);


  // Click handler
  const handleEmojiClick = (isWanted) => {
    if (gameState !== 'running') return;
    if (isWanted) {
      setScore((s) => s + 1);
      setGameState('win');
      setTimeout(() => {
        setRound((r) => r + 1);
        setCurrentTime((prev) => prev + TIME_INCREASE);
        startRound();
      }, 900);
    } else {
      setLoseReason('wrong');
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
    setCurrentTime(INITIAL_TIME);
    setGameState('ready');
  };

  return (
    <Card sx={{ 
      minWidth: 280, 
      maxWidth: { xs: 'calc(100vw - 16px)', sm: 700 }, 
      mx: { xs: 1, sm: 'auto' }, 
      mb: 1, 
      borderRadius: 4, 
      boxShadow: 6,
      width: '100%'
    }}>
      <CardContent sx={{ pb: 2, px: { xs: 1, sm: 3 } }}>
        <Typography variant={{ xs: "h5", sm: "h4" }} gutterBottom fontWeight={700}>
          Emoji Wanted!
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Find and click the wanted emoji before time runs out!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              background: '#fff',
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: 1,
              boxShadow: 1,
              border: '1px solid #1976d2',
              display: 'inline-flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              minWidth: 120,
              maxWidth: '100%',
            }}
          >
            <Typography variant="body1" sx={{ mr: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
              Wanted:
            </Typography>
            <span style={{ fontSize: gameDimensions.fontSize }}>{wanted}</span>
            <Typography variant="body1" sx={{ ml: { xs: 1, sm: 2 }, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
              <strong>Round:</strong> {round}
            </Typography>
          </Box>
        </Box>
        {/* Time bar - always reserve space to prevent shifting and avoid flicker between rounds */}
        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', mb: 1, minHeight: 10, display: 'flex', alignItems: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={
              gameState === 'running'
                ? Math.max(0, (timeLeft / currentTime) * 100)
                : gameState === 'win'
                  ? 100
                  : 0
            }
            sx={{ width: '100%', height: 10, borderRadius: 5, background: '#ffeaea', '& .MuiLinearProgress-bar': { background: '#d32f2f' } }}
          />
        </Box>
        <Box
          sx={{
            width: '100%',
            maxWidth: gameDimensions.width,
            height: gameDimensions.height,
            position: 'relative',
            background: '#e3f2fd',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 1,
            border: '2px solid #1976d2',
            mx: 'auto',
          }}
        >
          {/* Emojis */}
          {emojis.map((e) => (
            <Box
              key={e.id}
              sx={{
                position: 'absolute',
                left: e.x,
                top: e.y,
                width: gameDimensions.emojiSize,
                height: gameDimensions.emojiSize,
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: gameDimensions.fontSize,
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
                {loseReason === 'timeout' ? "Time's up!" : loseReason === 'wrong' ? "Wrong emoji!" : "You lost!"}
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
      </CardContent>
    </Card>
  );
}

export default EmojiWantedGame;