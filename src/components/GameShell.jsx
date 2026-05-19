import { INK, ACCENT, WPill, MonoText } from './WireKit';

export default function GameShell({ title, onBack, onRestart, primary, secondary, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: `1.5px solid ${INK}`,
          gap: 10,
        }}
      >
        <WPill thick onClick={onBack} style={{ fontWeight: 700 }}>‹ exit</WPill>
        <MonoText style={{ fontSize: 22, fontWeight: 900 }}>{primary}</MonoText>
        <WPill thick fill={ACCENT} style={{ color: 'white', fontWeight: 700 }}>{secondary}</WPill>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>

      {onRestart && (
        <div style={{ borderTop: `1.2px dashed ${INK}`, padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MonoText style={{ fontSize: 11, opacity: 0.7 }}>{title}</MonoText>
          <WPill onClick={onRestart} style={{ fontWeight: 700 }}>↻ restart</WPill>
        </div>
      )}
    </div>
  );
}
