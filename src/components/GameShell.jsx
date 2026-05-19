import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import Tooltip from '@mui/material/Tooltip';

export default function GameShell({ title, subtitle, accent = '#6366f1', stats, onBack, onRestart, children }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 760,
        mx: 'auto',
        animation: 'fadeInUp 0.35s ease both',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Tooltip title="Back to games">
          <IconButton onClick={onBack} aria-label="Back to games">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        {onRestart && (
          <Tooltip title="Restart">
            <IconButton onClick={onRestart} aria-label="Restart game">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {stats && stats.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          {stats.map((s) => (
            <Box
              key={s.label}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                background: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.05)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.75,
                minWidth: 90,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.label}
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: s.color || accent }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 5,
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.7)'
              : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          border: (t) =>
            `1px solid ${t.palette.mode === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(15,23,42,0.06)'}`,
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.10)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
