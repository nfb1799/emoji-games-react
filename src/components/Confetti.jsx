import { useMemo } from 'react';

const COLORS = ['#ff6b3d', '#1f1d1a', '#3d8bff', '#16a34a', '#e84a8a'];

export default function Confetti({ active, count = 50 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
      })),
    [count]
  );

  if (!active) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: '2px',
            animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
}
