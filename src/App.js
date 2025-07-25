import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EmojiGuessGame from './EmojiGuessGame';
import EmojiMemoryGame from './EmojiMemoryGame';
import EmojiWantedGame from './EmojiWantedGame';
import EmojiSortGame from './EmojiSortGame';
import './App.css';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleBack = () => setSelectedGame(null);

  return (
    <div className="App">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Typography variant="h3" gutterBottom>
          Emoji Games 🎮
        </Typography>
      </Box>
      {!selectedGame ? (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 2 }, mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* Emoji Guess Game Card */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: 3,
                width: 220,
                height: 180,
                m: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 6 },
              }}
              onClick={() => setSelectedGame('guess')}
            >
              <span style={{ fontSize: 48, marginBottom: 8 }}>🤔</span>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Guess Game
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Guess the character from emojis!
              </Typography>
            </Box>
            {/* Emoji Memory Game Card */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: 3,
                width: 220,
                height: 180,
                m: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 6 },
              }}
              onClick={() => setSelectedGame('memory')}
            >
              <span style={{ fontSize: 48, marginBottom: 8 }}>🧠</span>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Memory Game
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Match emoji pairs!
              </Typography>
            </Box>
            {/* Emoji Wanted Game Card */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: 3,
                width: 220,
                height: 180,
                m: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 6 },
              }}
              onClick={() => setSelectedGame('wanted')}
            >
              <span style={{ fontSize: 48, marginBottom: 8 }}>🎯</span>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Wanted!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find the target emoji!
              </Typography>
            </Box>
            {/* Emoji Sort Game Card */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: 3,
                width: 220,
                height: 180,
                m: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 6 },
              }}
              onClick={() => setSelectedGame('sort')}
            >
              <span style={{ fontSize: 48, marginBottom: 8 }}>🗂️</span>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Emoji Sort
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sort emojis into categories!
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
          {selectedGame === 'guess' && <EmojiGuessGame />}
          {selectedGame === 'memory' && <EmojiMemoryGame />}
          {selectedGame === 'wanted' && <EmojiWantedGame />}
          {selectedGame === 'sort' && <EmojiSortGame />}
          <Button sx={{ mt: 3 }} onClick={handleBack}>
            Back to Games
          </Button>
        </Box>
      )}
    </div>
  );
}

export default App;
