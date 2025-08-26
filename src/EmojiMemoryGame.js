import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const EMOJIS = ["😀", "🐶", "🍕", "⚽", "🚗", "🌵", "🎩", "🍦"];
const PAIRS = [...EMOJIS, ...EMOJIS];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function EmojiMemoryGame() {
  const [cards, setCards] = useState(() =>
    shuffle(PAIRS).map((emoji, idx) => ({
      id: idx,
      emoji,
      flipped: false,
      matched: false,
    }))
  );
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIdx, secondIdx] = flippedIndices;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === firstIdx || idx === secondIdx
                ? { ...card, matched: true }
                : card
            )
          );
          setMatchedCount((count) => count + 1);
          setFlippedIndices([]);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === firstIdx || idx === secondIdx
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedIndices([]);
        }, 900);
      }
      setMoves((m) => m + 1);
    }
  }, [flippedIndices, cards]);

  const handleCardClick = (idx) => {
    if (
      cards[idx].flipped ||
      cards[idx].matched ||
      flippedIndices.length === 2
    ) {
      return;
    }
    setCards((prev) =>
      prev.map((card, i) =>
        i === idx ? { ...card, flipped: true } : card
      )
    );
    setFlippedIndices((prev) => [...prev, idx]);
  };

  const handleRestart = () => {
    setCards(
      shuffle(PAIRS).map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: false,
        matched: false,
      }))
    );
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
  };

  const allMatched = matchedCount === EMOJIS.length;

  return (
    <Card sx={{ 
      minWidth: 275, 
      mb: 2, 
      borderRadius: 4, 
      boxShadow: 6,
      mx: { xs: 1, sm: 'auto' },
      maxWidth: { xs: 'calc(100vw - 16px)', sm: 600 }
    }}>
      <CardContent sx={{ px: { xs: 1, sm: 3 } }}>
        <Typography variant={{ xs: "h5", sm: "h4" }} gutterBottom fontWeight={700} sx={{ textAlign: 'center' }}>
          Emoji Memory Game
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Match all the pairs!
        </Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Grid
            container
            spacing={{ xs: 1, sm: 2 }}
            justifyContent="center"
            sx={{
              maxWidth: { xs: 280, sm: 320 },
              margin: "0 auto",
              gridTemplateColumns: "repeat(4, 1fr)",
              display: "grid",
            }}
          >
            {cards.map((card, idx) => (
              <Grid
                item
                key={card.id}
                sx={{
                  p: 0,
                  m: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    fontSize: { xs: 24, sm: 32 },
                    background: card.flipped || card.matched ? "#fff" : "#1976d2",
                    color: card.flipped || card.matched ? "#000" : "#fff",
                    border: card.matched ? "2px solid #4caf50" : undefined,
                    minWidth: 0,
                    minHeight: 0,
                    p: 0,
                    borderRadius: 2,
                    boxShadow: card.flipped || card.matched ? 3 : 0,
                  }}
                  onClick={() => handleCardClick(idx)}
                  disabled={card.flipped || card.matched || flippedIndices.length === 2}
                >
                  {card.flipped || card.matched ? card.emoji : "?"}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Moves: {moves}
        </Typography>
        {allMatched ? (
          <>
            <Typography variant="h6" color="success.main" sx={{ mt: 2, mb: 2 }}>
              🎉 You matched all pairs in {moves} moves!
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleRestart}>
              Play Again
            </Button>
          </>
        ) : (
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleRestart}>
            Restart
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmojiMemoryGame;