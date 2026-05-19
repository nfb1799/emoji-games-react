import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function GameCard({ icon, title, description, accent, badge, onClick, delay = 0 }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 4,
        overflow: 'hidden',
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.7)'
            : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        border: (t) =>
          `1px solid ${t.palette.mode === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(15,23,42,0.06)'}`,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        p: { xs: 2.5, sm: 3 },
        width: '100%',
        minHeight: { xs: 'auto', sm: 220 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        animation: `fadeInUp 0.5s ${delay}s both ease`,
        '&:hover, &:focus-visible': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.16)',
          outline: 'none',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${accent}22, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          fontSize: { xs: 44, sm: 52 },
          lineHeight: 1,
          mb: 0.5,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {description}
      </Typography>
      {badge !== undefined && badge !== null && (
        <Chip
          size="small"
          label={badge}
          sx={{
            alignSelf: 'flex-start',
            background: `${accent}22`,
            color: accent,
            fontWeight: 600,
            border: `1px solid ${accent}44`,
          }}
        />
      )}
    </Box>
  );
}
