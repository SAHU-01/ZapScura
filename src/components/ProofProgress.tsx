/**
 * Proof generation progress indicator.
 */

interface Props {
  stage: string;
  message: string;
  percent?: number;
}

export default function ProofProgress({ stage, message, percent }: Props) {
  const isActive = stage !== 'done' && stage !== 'error';

  return (
    <div style={{
      padding: '16px 20px',
      background: stage === 'error'
        ? 'rgba(239,68,68,0.06)'
        : stage === 'done'
        ? 'rgba(52,211,153,0.06)'
        : 'rgba(14,165,233,0.06)',
      border: `1px solid ${stage === 'error'
        ? 'rgba(239,68,68,0.15)'
        : stage === 'done'
        ? 'rgba(52,211,153,0.15)'
        : 'rgba(14,165,233,0.15)'}`,
      borderRadius: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {isActive && (
          <div style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(14,165,233,0.2)',
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {stage === 'done' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {stage === 'error' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        )}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: stage === 'error' ? '#f87171' : stage === 'done' ? '#34d399' : '#fff',
        }}>
          {message}
        </span>
      </div>

      {percent !== undefined && isActive && (
        <div style={{
          width: '100%',
          height: 4,
          background: 'rgba(14,165,233,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0ea5e9, #d946ef)',
            borderRadius: 2,
            transition: 'width 0.5s ease',
          }} />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
