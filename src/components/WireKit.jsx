export const INK = '#1f1d1a';
export const PAPER = '#faf6ee';
export const ACCENT = 'var(--accent)';
export const ACCENT_SOFT = 'color-mix(in srgb, var(--accent) 13%, transparent)';
export const MUTE = '#cdc7b8';

export function WBox({ children, style, tilt = 0, dashed = false, thick = false, fill, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        border: `${thick ? 2.5 : 1.5}px ${dashed ? 'dashed' : 'solid'} ${INK}`,
        background: fill || 'transparent',
        borderRadius: 8,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function WPill({ children, style, fill, thick, onClick, role, ...rest }) {
  return (
    <div
      role={role}
      onClick={onClick}
      {...rest}
      style={{
        border: `${thick ? 2 : 1.5}px solid ${INK}`,
        background: fill || 'transparent',
        borderRadius: 999,
        padding: '4px 12px',
        fontSize: 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MonoText({ children, style }) {
  return (
    <span style={{ fontFamily: 'var(--mono)', letterSpacing: 0.5, ...style }}>{children}</span>
  );
}
