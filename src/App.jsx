import React, { useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';

import { lightTheme, darkTheme, gradients } from './theme';
import useLocalStorage from './hooks/useLocalStorage';

import GameCard from './components/GameCard';
import MemoryGame from './games/MemoryGame';
import WantedGame from './games/WantedGame';

const GAMES = [
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Flip cards and match every pair as fast as you can.',
    icon: '🧠',
    accent: '#ec4899',
    Component: MemoryGame,
  },
  {
    id: 'wanted',
    title: 'Find the Wanted',
    description: 'Spot the target emoji before time runs out.',
    icon: '🎯',
    accent: '#f59e0b',
    Component: WantedGame,
  },
];

export default function App() {
  const [mode, setMode] = useLocalStorage('eg2:mode', 'light');
  const [selected, setSelected] = useState(null);

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  const ActiveGame = selected ? GAMES.find((g) => g.id === selected)?.Component : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: (t) => t.palette.background.default,
          backgroundImage: gradients[mode],
          backgroundAttachment: 'fixed',
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 4 },
            py: { xs: 2, sm: 3 },
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          <Box
            role="button"
            onClick={() => setSelected(null)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Box sx={{ fontSize: { xs: 28, sm: 34 }, animation: 'float 3s ease-in-out infinite' }}>🎮</Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Emoji Games
            </Typography>
          </Box>
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleMode} aria-label="Toggle color mode">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, sm: 4 }, pb: { xs: 4, sm: 6 }, maxWidth: 1200, mx: 'auto' }}>
          {!selected ? (
            <>
              <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 } }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.25rem', sm: '3.25rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'fadeInUp 0.5s ease both',
                  }}
                >
                  Bite-sized emoji games
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    mt: 1.5,
                    fontWeight: 400,
                    animation: 'fadeInUp 0.5s 0.1s ease both',
                  }}
                >
                  Pick a game. Beat your best score.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: { xs: 2, sm: 3 },
                  maxWidth: 640,
                  mx: 'auto',
                }}
              >
                {GAMES.map((g, i) => (
                  <GameCard
                    key={g.id}
                    icon={g.icon}
                    title={g.title}
                    description={g.description}
                    accent={g.accent}
                    onClick={() => setSelected(g.id)}
                    delay={i * 0.08}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ mt: { xs: 1, sm: 2 } }}>
              {ActiveGame && <ActiveGame onBack={() => setSelected(null)} />}
            </Box>
          )}
        </Box>

        <Box
          component="footer"
          sx={{
            textAlign: 'center',
            py: 2,
            color: 'text.secondary',
            fontSize: 12,
          }}
        >
          Made with React + MUI
        </Box>
      </Box>
    </ThemeProvider>
  );
}
