import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EmojiGuessGame from './EmojiGuessGame';
import EmojiMemoryGame from './EmojiMemoryGame';
import EmojiWantedGame from './EmojiWantedGame';
import './App.css';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleBack = () => setSelectedGame(null);

  return (
    <div className="App">
      <header className="App-header">
        {!selectedGame && (
          <Box>
            <Typography variant="h3" gutterBottom>
              Emoji Games 🎮
            </Typography>
            <Typography variant="h6" gutterBottom>
              Choose a game to play:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSelectedGame('guess')}
              >
                Emoji Guess Game
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setSelectedGame('memory')}
              >
                Emoji Memory Game
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => setSelectedGame('wanted')}
              >
                Emoji Wanted!
              </Button>
            </Box>
          </Box>
        )}
        {selectedGame === 'guess' && (
          <Box>
            <EmojiGuessGame />
            <Button sx={{ mt: 3 }} onClick={handleBack}>
              Back to Games
            </Button>
          </Box>
        )}
        {selectedGame === 'memory' && (
          <Box>
            <EmojiMemoryGame />
            <Button sx={{ mt: 3 }} onClick={handleBack}>
              Back to Games
            </Button>
          </Box>
        )}
        {selectedGame === 'wanted' && (
          <Box>
            <EmojiWantedGame />
            <Button sx={{ mt: 3 }} onClick={handleBack}>
              Back to Games
            </Button>
          </Box>
        )}
      </header>
    </div>
  );
}

export default App;
