import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

const emojiCategories = {
  Animals: ['🦁', '🐼', '🦔', '🐭', '🦇', '🕷️'],
  Food: ['🍍', '🍑', '🍄'],
  People: ['👨🏻‍🔧', '🧑', '👸', '🦸‍♂️'],
  Objects: ['👑', '⚡', '🚗', '🥋', '👖'],
};

const allEmojis = Object.values(emojiCategories).flat();

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function EmojiSortGame() {
  const [emojis, setEmojis] = useState(() => shuffleArray(allEmojis));
  const [sorted, setSorted] = useState({
    Animals: [],
    Food: [],
    People: [],
    Objects: [],
  });
  const [completed, setCompleted] = useState(false);

  const handleSort = (emoji, category) => {
    setSorted(prev => ({
      ...prev,
      [category]: [...prev[category], emoji],
    }));
    setEmojis(prev => prev.filter(e => e !== emoji));
  };

  React.useEffect(() => {
    if (emojis.length === 0) {
      setCompleted(true);
    }
  }, [emojis]);

  return (
    <Card sx={{ minWidth: 275, mb: 2, borderRadius: 4, boxShadow: 6 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Emoji Sort
        </Typography>
        {completed ? (
          <>
            <Typography variant="h2" color="success.main" sx={{ mt: 2, mb: 2 }}>
              🎉 Well done! All emojis sorted! 🎉
            </Typography>
            <Button variant="contained" color="primary" onClick={() => {
              setEmojis(shuffleArray(allEmojis));
              setSorted({ Animals: [], Food: [], People: [], Objects: [] });
              setCompleted(false);
            }}>
              Play Again
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Drag each emoji to its correct category.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {emojis.map(emoji => (
                <Box
                  key={emoji}
                  sx={{ fontSize: 36, p: 1, border: '1px solid #ccc', borderRadius: 2, bgcolor: 'white', cursor: 'grab' }}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', emoji);
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {Object.keys(emojiCategories).map(category => (
                <Box
                  key={category}
                  sx={{ minWidth: 120, bgcolor: '#f5f5f5', borderRadius: 2, p: 2, boxShadow: 1 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const emoji = e.dataTransfer.getData('text/plain');
                    if (emojis.includes(emoji) && emojiCategories[category].includes(emoji)) {
                      handleSort(emoji, category);
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {sorted[category].map(emoji => (
                      <span key={emoji} style={{ fontSize: 28 }}>{emoji}</span>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default EmojiSortGame;
