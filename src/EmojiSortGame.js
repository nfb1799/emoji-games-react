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
    <Card sx={{ 
      minWidth: 275, 
      mb: 2, 
      borderRadius: 4, 
      boxShadow: 6,
      mx: { xs: 1, sm: 'auto' },
      maxWidth: { xs: '100%', sm: 600 }
    }}>
      <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography variant={{ xs: "h5", sm: "h4" }} gutterBottom fontWeight={700} sx={{ textAlign: 'center' }}>
          Emoji Sort
        </Typography>
        {completed ? (
          <>
            <Typography variant={{ xs: "h4", sm: "h2" }} color="success.main" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
              🎉 Well done! All emojis sorted! 🎉
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="contained" color="primary" onClick={() => {
                setEmojis(shuffleArray(allEmojis));
                setSorted({ Animals: [], Food: [], People: [], Objects: [] });
                setCompleted(false);
              }}>
                Play Again
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Drag each emoji to its correct category.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: 3, justifyContent: 'center' }}>
              {emojis.map(emoji => (
                <Box
                  key={emoji}
                  sx={{ 
                    fontSize: { xs: 28, sm: 36 }, 
                    p: { xs: 0.5, sm: 1 }, 
                    border: '1px solid #ccc', 
                    borderRadius: 2, 
                    bgcolor: 'white', 
                    cursor: 'grab',
                    minWidth: { xs: 40, sm: 50 },
                    textAlign: 'center'
                  }}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', emoji);
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.keys(emojiCategories).map(category => (
                <Box
                  key={category}
                  sx={{ 
                    minWidth: { xs: 100, sm: 120 }, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 2, 
                    p: { xs: 1.5, sm: 2 }, 
                    boxShadow: 1,
                    flex: { xs: '1 1 45%', sm: 'none' }
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const emoji = e.dataTransfer.getData('text/plain');
                    if (emojis.includes(emoji) && emojiCategories[category].includes(emoji)) {
                      handleSort(emoji, category);
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' }, textAlign: 'center' }}>
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {sorted[category].map(emoji => (
                      <span key={emoji} style={{ fontSize: window.innerWidth < 600 ? 20 : 28 }}>{emoji}</span>
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
